/**
 * SketchUp Collada export (.dae + texture folder) -> one small .glb for the 3D stage.
 *
 *   npm run model -- sketchup/vildwert.dae src/assets/models/vildwert.glb --drop group_51,group_52
 *
 * The .glb holds two meshes the stage looks up by name:
 *   surfaces  every face, merged per material, transforms baked in (Y-up, metres)
 *   edges     every SketchUp edge as one LINES primitive, with a `_SOFT` attribute:
 *             0 on creases and on lines drawn across a flat face, 1 on the
 *             tessellation of curved surfaces, which the stage draws dimmer
 *
 * Always removed: cameras, TSE clipping boxes, and loose edges outside every face.
 * `--drop` removes top-level groups by name; the table printed on each run lists
 * them. Walls and a ceiling hide the furniture, so drop them here, or tick
 * "Export only selection set" in SketchUp and export just the furniture.
 *
 * Then: welded, lightly simplified (`--simplify`, a fraction of the mesh radius;
 * 0 turns it off), textures to WebP at most 1024px, quantized, meshopt-compressed.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";
import { DOMParser } from "@xmldom/xmldom";
import * as THREE from "three";
import { ColladaLoader } from "three/addons/loaders/ColladaLoader.js";
import { Document, NodeIO, Primitive } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt, prune, quantize, simplify, textureCompress, weld } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptSimplifier } from "meshoptimizer";
import sharp from "sharp";

const { values: flags, positionals } = parseArgs({
	allowPositionals: true,
	options: { drop: { type: "string", default: "" }, simplify: { type: "string", default: "0.0005" } },
});
const [input, output] = positionals;
if (!input || !output) {
	console.error("usage: npm run model -- <in.dae> <out.glb> [--drop group_1,group_2] [--simplify 0.0005]");
	process.exit(1);
}
const drop = new Set(flags.drop.split(",").filter(Boolean));

// ColladaLoader is browser code: give it an XML parser, and have its texture
// loader record each image path instead of fetching it.
globalThis.DOMParser = DOMParser;
THREE.TextureLoader.prototype.load = function (url) {
	const texture = new THREE.Texture();
	texture.userData.src = path.resolve(this.path, url);
	return texture;
};
const { debug, warn } = console;
console.debug = () => {};
console.warn = (...a) => (/Z-UP/.test(String(a[0])) ? undefined : warn(...a)); // the rotation is baked below
const { scene } = new ColladaLoader().parse(await fs.readFile(input, "utf8"), path.dirname(input) + "/");
console.debug = debug;

const junk = [];
scene.traverse((o) => {
	if (o.isCamera || /Clipping_Box/.test(o.name)) junk.push(o);
});
junk.forEach((o) => o.removeFromParent());
scene.updateMatrixWorld(true);

// SketchUp nests everything under one node; its children are the model's groups.
const top = scene.getObjectByName("SketchUp") ?? scene;
const rows = top.children.map((group) => {
	const box = new THREE.Box3();
	let tris = 0;
	let segs = 0;
	group.traverse((o) => {
		if (!o.isMesh && !o.isLineSegments) return;
		const count = o.geometry.index ? o.geometry.index.count : o.geometry.attributes.position.count;
		if (o.isMesh) tris += count / 3;
		else segs += count / 2;
		box.expandByObject(o);
	});
	const size = box.isEmpty() ? "" : box.getSize(new THREE.Vector3()).toArray().map((n) => n.toFixed(2)).join(" × ");
	return { group: group.name, "size (m)": size, triangles: tris, edges: segs, dropped: drop.has(group.name) ? "yes" : "" };
});
console.table(rows.filter((r) => r.triangles || r.edges));
for (const name of drop) {
	if (!rows.some((r) => r.group === name)) console.warn(`--drop: no top-level group named "${name}"`);
}
top.children.filter((g) => drop.has(g.name)).forEach((g) => g.removeFromParent());

// Walk what is left with world transforms baked in. Faces go into one bucket
// per material; every face is also kept flat in `faces` for the edge pass.
const buckets = new Map();
const faces = [];
const lines = [];
const bounds = new THREE.Box3();
const v = new THREE.Vector3();
const normalMatrix = new THREE.Matrix3();

scene.traverse((o) => {
	if (!o.isMesh && !o.isLineSegments) return;
	const geometry = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry;
	const { position, normal, uv } = geometry.attributes;
	if (o.isLineSegments) {
		for (let i = 0; i < position.count; i++) lines.push(v.fromBufferAttribute(position, i).applyMatrix4(o.matrixWorld).clone());
		return;
	}
	normalMatrix.getNormalMatrix(o.matrixWorld);
	const materials = Array.isArray(o.material) ? o.material : [o.material];
	const groups = geometry.groups.length ? geometry.groups : [{ start: 0, count: position.count, materialIndex: 0 }];
	for (const { start, count, materialIndex } of groups) {
		const material = materials[materialIndex];
		let b = buckets.get(material);
		if (!b) buckets.set(material, (b = { position: [], normal: [], uv: [] }));
		for (let i = start; i < start + count; i++) {
			v.fromBufferAttribute(position, i).applyMatrix4(o.matrixWorld);
			b.position.push(v.x, v.y, v.z);
			faces.push(v.x, v.y, v.z);
			bounds.expandByPoint(v);
			if (normal) v.fromBufferAttribute(normal, i).applyMatrix3(normalMatrix).normalize();
			else v.set(0, 1, 0);
			b.normal.push(v.x, v.y, v.z);
			b.uv.push(uv ? uv.getX(i) : 0, uv ? uv.getY(i) : 0);
		}
	}
});

// For every face side, the normals of the faces that share it — keyed by its
// two ends rounded to 0.1 mm, so the edge pass can find its neighbours.
const key = (p) => `${Math.round(p.x * 1e4)},${Math.round(p.y * 1e4)},${Math.round(p.z * 1e4)}`;
const pair = (a, b) => (a < b ? `${a}|${b}` : `${b}|${a}`);
const neighbours = new Map();
const A = new THREE.Vector3();
const B = new THREE.Vector3();
const C = new THREE.Vector3();
for (let i = 0; i < faces.length; i += 9) {
	A.fromArray(faces, i);
	B.fromArray(faces, i + 3);
	C.fromArray(faces, i + 6);
	const n = THREE.Triangle.getNormal(A, B, C, new THREE.Vector3());
	if (n.lengthSq() === 0) continue;
	const k = [key(A), key(B), key(C)];
	for (const [p, q] of [[0, 1], [1, 2], [2, 0]]) {
		const id = pair(k[p], k[q]);
		const list = neighbours.get(id);
		if (list) list.push(n);
		else neighbours.set(id, [n]);
	}
}

// An edge between two faces that meet at a shallow angle is the tessellation
// of a curve. Exactly coplanar faces mean a line the designer drew across a
// face (a door split, a groove) — that one stays a full edge. Flipped faces
// are common in SketchUp, hence the absolute dot product.
const softness = (a, b) => {
	const list = neighbours.get(pair(key(a), key(b)));
	if (!list || list.length < 2) return 0;
	let dot = 1;
	for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) dot = Math.min(dot, Math.abs(list[i].dot(list[j])));
	const degrees = THREE.MathUtils.radToDeg(Math.acos(Math.min(1, dot)));
	return degrees < 1 ? 0 : 1 - THREE.MathUtils.smoothstep(degrees, 15, 35);
};

const inside = bounds.clone().expandByScalar(0.02);
const edgePosition = [];
const edgeSoft = [];
let soft = 0;
for (let i = 0; i < lines.length; i += 2) {
	const a = lines[i];
	const b = lines[i + 1];
	if (!inside.containsPoint(a) || !inside.containsPoint(b)) continue; // stray construction line
	const s = softness(a, b);
	edgePosition.push(a.x, a.y, a.z, b.x, b.y, b.z);
	edgeSoft.push(s, s);
	if (s > 0.5) soft++;
}

if (!edgePosition.length) console.warn("No edges in this export — tick “Export edges” in SketchUp's COLLADA options; the stage draws them.");

const doc = new Document();
const buffer = doc.createBuffer();
const accessor = (array, type) => doc.createAccessor().setType(type).setArray(new Float32Array(array)).setBuffer(buffer);
const root = doc.createNode("model");
doc.createScene().addChild(root);

const textures = new Map();
const surfaces = doc.createMesh("surfaces");
for (const [m, b] of buckets) {
	const metal = /steel|silver|alu|metal|chrome|inox/i.test(m.name) && !m.transparent;
	const material = doc
		.createMaterial(m.name)
		.setBaseColorFactor([m.color.r, m.color.g, m.color.b, m.opacity])
		.setMetallicFactor(metal ? 0.6 : 0)
		.setRoughnessFactor(m.opacity < 1 ? 0.1 : metal ? 0.35 : 0.75)
		.setDoubleSided(true); // SketchUp faces are often back to front
	if (m.opacity < 1) material.setAlphaMode("BLEND");
	const src = m.map?.userData.src;
	if (src) {
		let texture = textures.get(src);
		if (!texture) {
			texture = doc
				.createTexture(path.basename(src))
				.setImage(await fs.readFile(src))
				.setMimeType(src.endsWith(".png") ? "image/png" : "image/jpeg");
			textures.set(src, texture);
		}
		material.setBaseColorTexture(texture);
	}
	const primitive = doc
		.createPrimitive()
		.setMaterial(material)
		.setAttribute("POSITION", accessor(b.position, "VEC3"))
		.setAttribute("NORMAL", accessor(b.normal, "VEC3"));
	if (src) primitive.setAttribute("TEXCOORD_0", accessor(b.uv, "VEC2"));
	surfaces.addPrimitive(primitive);
}
root.addChild(doc.createNode("surfaces").setMesh(surfaces));

const edges = doc.createMesh("edges").addPrimitive(
	doc
		.createPrimitive()
		.setMode(Primitive.Mode.LINES)
		.setMaterial(doc.createMaterial("edges"))
		.setAttribute("POSITION", accessor(edgePosition, "VEC3"))
		.setAttribute("_SOFT", accessor(edgeSoft, "SCALAR")),
);
root.addChild(doc.createNode("edges").setMesh(edges));

await Promise.all([MeshoptEncoder.ready, MeshoptSimplifier.ready]);
const error = Number(flags.simplify);
const quiet = console.warn;
console.warn = (...a) => (/quantize: Skipping/.test(String(a[0])) ? undefined : quiet(...a)); // tiled UVs stay float
await doc.transform(
	dedup(),
	weld(),
	...(error > 0 ? [simplify({ simplifier: MeshoptSimplifier, ratio: 0, error, lockBorder: true })] : []),
	prune(),
	textureCompress({ encoder: sharp, targetFormat: "webp", resize: [1024, 1024], quality: 82 }),
	quantize(),
	meshopt({ encoder: MeshoptEncoder, level: "medium" }),
);
console.warn = warn;

await fs.mkdir(path.dirname(output), { recursive: true });
await new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ "meshopt.encoder": MeshoptEncoder }).write(output, doc);

let triangles = 0;
for (const p of doc.getRoot().listMeshes()[0].listPrimitives()) triangles += (p.getIndices()?.getCount() ?? 0) / 3;
const kb = ((await fs.stat(output)).size / 1024).toFixed(0);
const size = bounds.getSize(new THREE.Vector3()).toArray().map((n) => n.toFixed(2)).join(" × ");
console.log(`${output}: ${kb} KB — ${size} m, ${triangles} triangles, ${edgePosition.length / 6} edges (${soft} soft)`);
