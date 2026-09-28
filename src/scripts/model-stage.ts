/**
 * The 3D stage in the services section: one SketchUp model (converted by
 * scripts/model.mjs) shown in the four phases of an order.
 *
 *   0 measure  the room's box, drawn and dimensioned
 *   1 design   every edge of the model, glowing, hidden lines removed
 *   2 build    the panels rise out of the drawing as raw "clay"
 *   3 install  the real materials; the edges sink back into them
 *
 * Either timed (setPhase tweens from one phase to the next) or following the
 * page's scroll (setProgress: fractions sit between phases).
 *
 * How the effects are made:
 * - Draw-on. The edges are one LineSegments. Each vertex knows the other end
 *   of its segment and when the segment starts; the vertex shader slides the
 *   far end out of the near one as `uDraw` passes that start, bottom-up.
 * - Hidden lines. Every face is also drawn depth-only before anything else,
 *   so an edge behind a face stays hidden even before the face is built.
 * - Glow. Edges write how strongly they glow into alpha, and the bloom pass
 *   blurs rgb × alpha only — lit surfaces never bloom, however bright.
 * - Build. Surfaces discard above a rising height and light a band at it;
 *   `uFinish` fades them from clay to the real materials.
 * - Edges blend with MAX (MIN on the light theme): crowded details cannot add
 *   up into hot spots, and dim edges disappear into lit surfaces by themselves.
 */
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { MeshoptDecoder } from "three/addons/libs/meshopt_decoder.module.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

export interface StageOptions {
	/** Width, depth and height labels, positioned over the measure phase. */
	labels: HTMLElement[];
	/** prefers-reduced-motion: no idle sway, and transitions are cut short. */
	still: boolean;
	onProgress?: (fraction: number) => void;
	/** Called once, the first time the visitor turns the model. */
	onDrag?: () => void;
	/** CSS pixels that overlays cover at the canvas's top and bottom; the model is framed between them. */
	insets?: () => { top: number; bottom: number };
}

export interface Stage {
	/** Animates to a phase and returns the seconds until it has settled. */
	setPhase(index: number): number;
	/** Follows a scroll position instead: 0 is the first phase, 3 the last, fractions in between. */
	setProgress(progress: number): void;
	/** Rendering runs only while the stage is on screen. */
	setVisible(visible: boolean): void;
}

type Key = "dims" | "draw" | "build" | "finish" | "edge" | "bloom";
type Phase = Record<Key | "yaw" | "pitch" | "zoom", number>;

/** Targets per phase. Every value is tweened, so any phase can follow any other. */
const PHASES: Phase[] = [
	{ dims: 1, draw: 0, build: 0, finish: 0, edge: 1, bloom: 1, yaw: 0.6, pitch: 0.42, zoom: 1 },
	{ dims: 0, draw: 1, build: 0, finish: 0, edge: 1, bloom: 1, yaw: 0.5, pitch: 0.3, zoom: 1 },
	{ dims: 0, draw: 1, build: 1, finish: 0, edge: 0.75, bloom: 0.75, yaw: 0.42, pitch: 0.26, zoom: 1 },
	{ dims: 0, draw: 1, build: 1, finish: 1, edge: 0.16, bloom: 0.5, yaw: 0.34, pitch: 0.22, zoom: 0.97 },
];

/** Seconds a full 0 → 1 change of each value takes. */
const SECONDS: Record<Key, number> = { dims: 1.8, draw: 2.8, build: 2.4, finish: 1.4, edge: 1.2, bloom: 1.2 };

/**
 * Scroll-driven: where within the scroll from one phase to the next each value
 * changes. The dimensions clear before the drawing starts, and every phase
 * holds for a stretch around its own card.
 */
const SCRUB: Record<keyof Phase, [number, number]> = {
	dims: [0.1, 0.45],
	draw: [0.3, 0.85],
	build: [0.15, 0.85],
	finish: [0.15, 0.85],
	edge: [0.15, 0.85],
	bloom: [0.15, 0.85],
	yaw: [0, 1],
	pitch: [0, 1],
	zoom: [0, 1],
};
const KEYS: Key[] = ["dims", "draw", "build", "finish", "edge", "bloom"];

/** Raw panels, before the finishes: light enough on paper for the edges to read as ink. */
const CLAY = { dark: new THREE.Color("#8c847a"), light: new THREE.Color("#d8d1c6") };
const BLOOM = { strength: 0.85, radius: 0.35 };
/** Draw-on: the share of `uDraw` over which one segment grows. */
const GROW = 0.16;

const EDGE_VERTEX = /* glsl */ `
	attribute vec3 aOther; // the segment's other end
	attribute float aSide; // 0 at the end it grows from, 1 at the end that moves
	attribute float aDelay; // when it starts growing, 0..1
	attribute float aSoft; // 1 on the tessellation of curved surfaces
	uniform float uDraw;
	varying float vGrow;
	varying float vTip;
	varying float vSoft;
	void main() {
		float t = clamp((uDraw * (1.0 + ${GROW}) - aDelay) / ${GROW}, 0.0, 1.0);
		vec3 p = aSide > 0.5 ? mix(aOther, position, t) : position;
		vGrow = t;
		vTip = aSide * (1.0 - t);
		vSoft = aSoft;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
	}
`;

const EDGE_FRAGMENT = /* glsl */ `
	uniform vec3 uBg;
	uniform vec3 uColor;
	uniform float uEdge;
	uniform float uSoftness;
	uniform vec2 uPointer; // device pixels, origin bottom-left
	uniform float uTorch;
	uniform float uRadius;
	varying float vGrow;
	varying float vTip;
	varying float vSoft;
	void main() {
		if (vGrow <= 0.0) discard;
		float torch = uTorch * (1.0 - smoothstep(0.0, uRadius, distance(gl_FragCoord.xy, uPointer)));
		float k = mix(1.0, uSoftness, vSoft) * uEdge + torch * torch * 1.3 + vTip * 2.0;
		// k > 1 pushes past the accent: brighter on the dark theme, darker on paper.
		gl_FragColor = vec4(max(mix(uBg, uColor, k), 0.0), clamp(k * 0.5, 0.0, 1.0));
	}
`;

export async function createStage(canvas: HTMLCanvasElement, url: string, options: StageOptions): Promise<Stage> {
	const { labels, still } = options;
	let dirty = true; // something changed while settled: render one more frame
	let dt = 0;
	// The clear alpha is the glow mask (0); premultiplied, it would zero the background colour too.
	const renderer = new THREE.WebGLRenderer({ canvas, powerPreference: "high-performance", premultipliedAlpha: false });
	const pixelRatio = Math.min(devicePixelRatio, 2);
	renderer.setPixelRatio(pixelRatio);
	// Linear all the way to the last pass, which encodes sRGB itself. With an
	// sRGB output, the clear colour set outside a render pass gets encoded
	// twice (RenderPass clears with whatever was set last).
	renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

	const gltf = await new GLTFLoader()
		.setMeshoptDecoder(MeshoptDecoder)
		.loadAsync(url, (e) => e.total && options.onProgress?.(e.loaded / e.total));
	const model = gltf.scene;
	model.updateMatrixWorld(true);
	const box = new THREE.Box3().setFromObject(model);

	const scene = new THREE.Scene();
	const pmrem = new THREE.PMREMGenerator(renderer);
	scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
	scene.environmentIntensity = 0.6;
	pmrem.dispose();
	const sun = new THREE.DirectionalLight(0xffffff, 0.7);
	sun.position.set(-2, 4, 3);
	scene.add(model, sun);

	// Uniforms shared by reference between every material that reads them.
	const u = {
		uBg: { value: new THREE.Color() },
		uColor: { value: new THREE.Color() },
		uBand: { value: new THREE.Color() },
		uClay: { value: new THREE.Color() },
		uEdge: { value: 1 },
		uSoftness: { value: 0.22 },
		uPointer: { value: new THREE.Vector2() },
		uTorch: { value: 0 },
		uRadius: { value: 130 * pixelRatio },
		uFinish: { value: 0 },
		uBuildY: { value: -1 },
		uBuilding: { value: 0 },
	};
	const draw = { value: 0 };
	const dimsDraw = { value: 0 };
	const edgeMaterial = (progress: { value: number }) =>
		new THREE.ShaderMaterial({
			uniforms: { ...u, uDraw: progress },
			vertexShader: EDGE_VERTEX,
			fragmentShader: EDGE_FRAGMENT,
			transparent: true,
			depthWrite: false,
			blending: THREE.CustomBlending,
		});

	// Edges: baked to world space (the file's positions are quantized under a
	// node transform) and given what the draw-on shader needs.
	const source = model.getObjectByName("edges") as THREE.LineSegments;
	const flat = source.geometry.index ? source.geometry.toNonIndexed() : source.geometry;
	const world = new Float32Array(flat.attributes.position.count * 3);
	const v = new THREE.Vector3();
	for (let i = 0; i < flat.attributes.position.count; i++) {
		v.fromBufferAttribute(flat.attributes.position, i).applyMatrix4(source.matrixWorld).toArray(world, i * 3);
	}
	const soft = flat.getAttribute("_soft");
	const edges = new THREE.LineSegments(
		segments(world, sweep(box), soft ? Float32Array.from({ length: soft.count }, (_, i) => soft.getX(i)) : undefined),
		edgeMaterial(draw),
	);
	source.removeFromParent();
	edges.renderOrder = 2;

	// Measure phase: the room's box and three dimension lines, same shader.
	const dims = dimensions(box);
	const dimLines = new THREE.LineSegments(segments(dims.position, (_, __, i) => dims.delay[i]), edgeMaterial(dimsDraw));
	dimLines.material.depthTest = false; // drawn before anything is built, so nothing hides them
	dimLines.renderOrder = 2;
	dims.size.forEach((size, i) => {
		if (labels[i]) labels[i].textContent = `${Math.round(size * 1000)} мм`;
	});
	scene.add(edges, dimLines);

	// Surfaces: a depth-only copy of every face first (hidden lines), then the
	// face itself, built bottom-up and faded from clay to its material. Both
	// are pushed back a hair so edges lying on a face still pass the depth test.
	const occluder = new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
	const surfaces: THREE.Mesh[] = [];
	model.getObjectByName("surfaces")?.traverse((o) => {
		if ((o as THREE.Mesh).isMesh) surfaces.push(o as THREE.Mesh);
	});
	for (const mesh of surfaces) {
		const ghost = new THREE.Mesh(mesh.geometry, occluder);
		ghost.renderOrder = -1;
		ghost.matrixAutoUpdate = false;
		ghost.matrix.copy(mesh.matrix);
		mesh.parent?.add(ghost);
	}
	for (const material of new Set(surfaces.map((m) => m.material as THREE.MeshStandardMaterial))) buildable(material, u);

	// Post: MSAA scene -> bloom of the glow mask -> sRGB, opaque.
	const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 }));
	composer.setPixelRatio(pixelRatio);
	const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 100);
	composer.addPass(new RenderPass(scene, camera));
	const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), BLOOM.strength, BLOOM.radius, 0);
	bloom.materialHighPassFilter.fragmentShader = /* glsl */ `
		uniform sampler2D tDiffuse;
		varying vec2 vUv;
		void main() {
			vec4 texel = texture2D(tDiffuse, vUv);
			gl_FragColor = vec4(texel.rgb * texel.a, 1.0);
		}
	`;
	bloom.materialHighPassFilter.needsUpdate = true;
	composer.addPass(bloom);
	composer.addPass(
		new ShaderPass({
			uniforms: { tDiffuse: { value: null } },
			vertexShader: /* glsl */ `
				varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
				}
			`,
			// The context always has alpha, and alpha held the glow mask: write 1.
			// A little noise keeps the bloom's dark gradients from banding.
			fragmentShader: /* glsl */ `
				uniform sampler2D tDiffuse;
				varying vec2 vUv;
				void main() {
					vec4 color = sRGBTransferOETF(vec4(texture2D(tDiffuse, vUv).rgb, 1.0));
					float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
					gl_FragColor = vec4(color.rgb + (noise - 0.5) / 255.0, 1.0);
				}
			`,
		}),
	);

	// Theme: colours come from the page's own tokens, re-read when it flips.
	const probe = document.createElement("span");
	probe.hidden = true;
	canvas.after(probe);
	const swatch = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
	const css = (value: string, target: THREE.Color) => {
		probe.style.color = value;
		swatch.fillStyle = "#000";
		swatch.fillStyle = getComputedStyle(probe).color;
		swatch.fillRect(0, 0, 1, 1);
		const [r, g, b] = swatch.getImageData(0, 0, 1, 1).data;
		return target.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
	};
	let glow = 1;
	const applyTheme = () => {
		const dark = document.documentElement.classList.contains("dark");
		css("var(--color-paper-2)", u.uBg.value);
		css("var(--color-accent)", u.uColor.value);
		u.uBand.value.copy(u.uColor.value).multiplyScalar(dark ? 2.5 : 1);
		u.uClay.value.copy(dark ? CLAY.dark : CLAY.light);
		renderer.setClearColor(u.uBg.value, 0);
		for (const m of [edges.material, dimLines.material]) m.blendEquation = dark ? THREE.MaxEquation : THREE.MinEquation;
		// Gold reads as light on the dark theme; on paper it is only ink.
		glow = dark ? 1 : 0;
		dirty = true;
	};
	new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

	// Tweens, scheduled so a forward step draws, then builds, then finishes —
	// and a backward one undoes them in reverse.
	const value: Record<Key, number> = { dims: 0, draw: 0, build: 0, finish: 0, edge: 1, bloom: 1 };
	const tweens = new Map<Key, { from: number; to: number; start: number; seconds: number }>();
	let phase = -1;
	let scrub: number | undefined; // set while the scroll drives the stage
	const sample = (key: keyof Phase, at: number) => {
		const i = Math.min(Math.floor(at), PHASES.length - 2);
		const [from, to] = SCRUB[key];
		return THREE.MathUtils.lerp(PHASES[i][key], PHASES[i + 1][key], THREE.MathUtils.smoothstep(at - i, from, to));
	};
	const goal = (key: "yaw" | "pitch" | "zoom") => (scrub === undefined ? PHASES[Math.max(phase, 0)][key] : sample(key, scrub));
	const now = () => performance.now() / 1000;
	const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
	const setPhase = (index: number) => {
		scrub = undefined;
		const next = PHASES[index];
		const forward = index >= phase;
		const order: [Key, number][] =
			forward
				? [["dims", 0.5], ["draw", 0.55], ["build", 0.65], ["finish", 1]]
				: [["finish", 0.5], ["build", 0.5], ["draw", 0.5], ["dims", 1]];
		phase = index;
		const start = now();
		let at = start;
		let end = start;
		const pace = still ? 0.15 : forward ? 1 : 0.6; // rewinding is quicker than building
		const tween = (key: Key, overlap: number) => {
			const seconds = Math.abs(next[key] - value[key]) * SECONDS[key] * pace;
			tweens.set(key, { from: value[key], to: next[key], start: at, seconds });
			end = Math.max(end, at + seconds);
			if (!still) at += seconds * overlap;
		};
		for (const [key, overlap] of order) tween(key, overlap);
		at = start;
		tween("edge", 0);
		tween("bloom", 0);
		dirty = true;
		return end - start;
	};

	// Camera: each phase has an angle; the visitor's drag adds to it, and the
	// distance is solved every frame so the box always fits the frame.
	const view = { yaw: PHASES[0].yaw, pitch: PHASES[0].pitch, zoom: 1 };
	const turn = { yaw: 0, pitch: 0 };
	const corners = [0, 1, 2, 3, 4, 5, 6, 7].map(() => new THREE.Vector3());
	const target = new THREE.Vector3();
	const back = new THREE.Vector3();
	const right = new THREE.Vector3();
	const up = new THREE.Vector3();
	let inset = { top: 0, bottom: 0 };
	const measure = () => {
		inset = options.insets?.() ?? inset;
		dirty = true;
	};
	const placeCamera = (t: number) => {
		const k = still ? 1 : 1 - Math.exp(-dt * 2.5);
		const sway = still ? 0 : Math.sin(t * 0.35) * 0.06;
		view.yaw += (goal("yaw") + turn.yaw + sway - view.yaw) * k;
		view.pitch += (goal("pitch") + turn.pitch - view.pitch) * k;
		view.zoom += (goal("zoom") - view.zoom) * k;

		// The fitted box grows to take in the dimension lines while they show.
		const grow = value.dims * (dims.margin + 0.1);
		const min = box.min;
		const max = v.set(box.max.x + grow, box.max.y, box.max.z + grow);
		target.copy(min).add(max).multiplyScalar(0.5);
		for (let i = 0; i < 8; i++) {
			corners[i].set(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z).sub(target);
		}
		back.set(Math.sin(view.yaw) * Math.cos(view.pitch), Math.sin(view.pitch), Math.cos(view.yaw) * Math.cos(view.pitch));
		right.crossVectors(THREE.Object3D.DEFAULT_UP, back).normalize();
		up.crossVectors(back, right);
		// Fit into the band the caption and hint leave clear, then aim so the
		// model sits in the middle of that band rather than of the canvas.
		const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
		const height = canvas.clientHeight || 1;
		const band = Math.max(1 - (inset.top + inset.bottom) / height, 0.4);
		const tanV = tan * band;
		const tanH = tan * camera.aspect;
		let distance = 0;
		for (const c of corners) {
			const z = c.dot(back);
			distance = Math.max(distance, Math.abs(c.dot(right)) / tanH + z, Math.abs(c.dot(up)) / tanV + z);
		}
		distance *= 1.06 * view.zoom;
		target.addScaledVector(up, ((inset.top - inset.bottom) / height) * distance * tan);
		camera.position.copy(target).addScaledVector(back, distance);
		camera.lookAt(target);
	};

	// Pointer: drag turns the model; the pointer itself is a torch that
	// brightens the edges around it.
	const torch = { x: 0, y: 0, on: 0, target: 0 };
	let drag: { x: number; y: number } | undefined;
	let dragged = false;
	const aim = (e: PointerEvent) => {
		const r = canvas.getBoundingClientRect();
		torch.x = (e.clientX - r.left) * pixelRatio;
		torch.y = (r.bottom - e.clientY) * pixelRatio;
		torch.target = 1;
	};
	canvas.addEventListener("pointerdown", (e) => {
		drag = { x: e.clientX, y: e.clientY };
		canvas.setPointerCapture(e.pointerId);
		aim(e);
	});
	canvas.addEventListener("pointermove", (e) => {
		aim(e);
		if (!drag) return;
		turn.yaw = THREE.MathUtils.clamp(turn.yaw - (e.clientX - drag.x) * 0.006, -0.95, 0.75);
		turn.pitch = THREE.MathUtils.clamp(turn.pitch + (e.clientY - drag.y) * 0.004, -0.25, 0.35);
		if (!dragged && Math.abs(e.clientX - drag.x) + Math.abs(e.clientY - drag.y) > 4) {
			dragged = true;
			options.onDrag?.();
		}
		drag = { x: e.clientX, y: e.clientY };
	});
	const release = (e: PointerEvent) => {
		drag = undefined;
		if (e.pointerType !== "mouse") torch.target = 0;
	};
	canvas.addEventListener("pointerup", release);
	canvas.addEventListener("pointercancel", release);
	canvas.addEventListener("pointerleave", () => (torch.target = 0));

	new ResizeObserver(() => {
		const { clientWidth: w, clientHeight: h } = canvas;
		if (!w || !h) return;
		renderer.setSize(w, h, false);
		composer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
		measure();
	}).observe(canvas);
	document.fonts?.ready.then(measure); // the caption's height changes once its font arrives

	let last = now();
	const frame = () => {
		const t = now();
		dt = Math.min(t - last, 0.1);
		last = t;

		let moving = !still || dirty;
		if (scrub !== undefined) {
			// Ease towards where the scroll says each value should be, so a flick glides.
			const k = still ? 1 : 1 - Math.exp(-dt * 5);
			for (const key of KEYS) {
				const target = sample(key, scrub);
				if (Math.abs(target - value[key]) < 1e-4) value[key] = target;
				else {
					value[key] += (target - value[key]) * k;
					moving = true;
				}
			}
		}
		for (const [key, tw] of tweens) {
			const p = tw.seconds > 0 ? THREE.MathUtils.clamp((t - tw.start) / tw.seconds, 0, 1) : 1;
			value[key] = tw.from + (tw.to - tw.from) * ease(p);
			if (p >= 1) tweens.delete(key);
			moving = true;
		}
		const on = torch.on;
		torch.on += (torch.target - torch.on) * (1 - Math.exp(-dt * 8));
		if (Math.abs(torch.on - on) > 1e-3 || drag || Math.abs(turn.yaw + goal("yaw") - view.yaw) > 1e-3) moving = true;
		if (!moving) return; // settled and still: leave the last frame up
		dirty = false;

		draw.value = value.draw;
		dimsDraw.value = value.dims;
		u.uEdge.value = value.edge;
		u.uFinish.value = value.finish;
		u.uBuildY.value = THREE.MathUtils.lerp(box.min.y - 0.02, box.max.y + 0.02, value.build);
		u.uBuilding.value = Math.min(value.build, 1 - value.build) > 0.001 ? 1 : 0;
		u.uTorch.value = torch.on;
		u.uPointer.value.set(torch.x, torch.y);
		bloom.strength = BLOOM.strength * value.bloom * glow;
		bloom.enabled = bloom.strength > 0;
		edges.visible = value.draw > 0;
		dimLines.visible = value.dims > 0;
		for (const mesh of surfaces) mesh.visible = value.build > 0;

		placeCamera(t);
		const shown = THREE.MathUtils.smoothstep(value.dims, 0.55, 0.95);
		dims.anchors.forEach((a, i) => {
			const label = labels[i];
			if (!label || (shown === 0 && label.style.opacity === "0")) return;
			v.copy(a).project(camera);
			label.style.opacity = String(shown);
			label.style.transform = `translate(${((v.x + 1) / 2) * canvas.clientWidth}px, ${((1 - v.y) / 2) * canvas.clientHeight}px) translate(-50%, -50%)`;
		});
		composer.render(dt);
	};

	applyTheme();
	let visible = false;
	const loop = () => renderer.setAnimationLoop(visible && !document.hidden ? frame : null);
	document.addEventListener("visibilitychange", loop);

	return {
		setPhase,
		setProgress(progress) {
			scrub = THREE.MathUtils.clamp(progress, 0, PHASES.length - 1);
			tweens.clear();
			dirty = true;
		},
		setVisible(on) {
			visible = on;
			last = now();
			loop();
		},
	};
}

/**
 * Non-indexed segments with the draw-on attributes. Each segment grows from
 * its lower end, starting at `delay(a, b, index)`.
 */
function segments(position: Float32Array, delay: (a: THREE.Vector3, b: THREE.Vector3, index: number) => number, soft?: Float32Array) {
	const n = position.length / 3;
	const other = new Float32Array(n * 3);
	const side = new Float32Array(n);
	const start = new Float32Array(n);
	const p = new THREE.Vector3();
	const q = new THREE.Vector3();
	for (let i = 0; i < n; i += 2) {
		p.fromArray(position, i * 3);
		q.fromArray(position, i * 3 + 3);
		const [low, high] = p.y > q.y + 1e-4 ? [q, p] : [p, q];
		low.toArray(position, i * 3);
		high.toArray(position, i * 3 + 3);
		high.toArray(other, i * 3);
		low.toArray(other, i * 3 + 3);
		side[i + 1] = 1;
		start[i] = start[i + 1] = delay(low, high, i / 2);
	}
	const geometry = new THREE.BufferGeometry();
	geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
	geometry.setAttribute("aOther", new THREE.BufferAttribute(other, 3));
	geometry.setAttribute("aSide", new THREE.BufferAttribute(side, 1));
	geometry.setAttribute("aDelay", new THREE.BufferAttribute(start, 1));
	geometry.setAttribute("aSoft", new THREE.BufferAttribute(soft ?? new Float32Array(n), 1));
	return geometry;
}

/** Model edges draw floor to ceiling, left to right, long lines a touch first. */
function sweep(box: THREE.Box3) {
	const size = box.getSize(new THREE.Vector3());
	return (a: THREE.Vector3, b: THREE.Vector3) => {
		const y = ((a.y + b.y) / 2 - box.min.y) / size.y;
		const x = ((a.x + b.x) / 2 - box.min.x) / size.x;
		const jitter = Math.abs(Math.sin(a.x * 91.7 + a.y * 47.3 + b.z * 13.1) * 43758.5) % 1;
		const short = 1 - Math.min(a.distanceTo(b) / 1.5, 1);
		return (0.6 * y + 0.22 * x + 0.1 * jitter + 0.08 * short) * 0.98;
	};
}

/**
 * The room's box plus width, depth and height dimension lines outside it, in
 * the order they draw (`delay`), and where their labels sit (`anchors`).
 */
function dimensions(box: THREE.Box3) {
	const { min, max } = box;
	const out = 0.34; // dimension lines sit this far outside the room
	const over = 0.08; // extension lines run past them
	const tick = 0.045; // architectural 45° ticks
	const position: number[] = [];
	const delay: number[] = [];
	const line = (a: number[], b: number[], t: number) => {
		position.push(...a, ...b);
		delay.push(t);
	};
	const x = [min.x, max.x, max.x, min.x];
	const z = [min.z, min.z, max.z, max.z];
	for (let i = 0; i < 4; i++) {
		const j = (i + 1) % 4;
		line([x[i], min.y, z[i]], [x[j], min.y, z[j]], i * 0.06);
		line([x[i], min.y, z[i]], [x[i], max.y, z[i]], 0.24);
		line([x[i], max.y, z[i]], [x[j], max.y, z[j]], 0.42 + i * 0.04);
	}
	const front = max.z + out;
	const side = max.x + out;
	// Width, along the front.
	line([min.x, min.y, max.z], [min.x, min.y, front + over], 0.6);
	line([max.x, min.y, max.z], [max.x, min.y, front + over], 0.6);
	line([min.x, min.y, front], [max.x, min.y, front], 0.66);
	for (const px of [min.x, max.x]) line([px - tick, min.y, front + tick], [px + tick, min.y, front - tick], 0.78);
	// Depth, along the right-hand side.
	line([max.x, min.y, min.z], [side + over, min.y, min.z], 0.6);
	line([max.x, min.y, max.z], [side + over, min.y, max.z], 0.6);
	line([side, min.y, min.z], [side, min.y, max.z], 0.66);
	for (const pz of [min.z, max.z]) line([side - tick, min.y, pz + tick], [side + tick, min.y, pz - tick], 0.78);
	// Height, at the back right-hand corner.
	line([max.x, max.y, min.z], [side + over, max.y, min.z], 0.6);
	line([side, min.y, min.z], [side, max.y, min.z], 0.66);
	for (const py of [min.y, max.y]) line([side - tick, py - tick, min.z], [side + tick, py + tick, min.z], 0.78);

	return {
		position: new Float32Array(position),
		delay,
		margin: out + over,
		size: [max.x - min.x, max.z - min.z, max.y - min.y],
		anchors: [
			new THREE.Vector3((min.x + max.x) / 2, min.y, front),
			new THREE.Vector3(side, min.y, (min.z + max.z) / 2),
			new THREE.Vector3(side, (min.y + max.y) / 2, min.z),
		],
	};
}

/** Adds the build sweep and the clay → material fade to a glTF material. */
function buildable(material: THREE.MeshStandardMaterial, uniforms: Record<string, THREE.IUniform>) {
	material.polygonOffset = true;
	material.polygonOffsetFactor = 1;
	material.polygonOffsetUnits = 1;
	material.onBeforeCompile = (shader) => {
		Object.assign(shader.uniforms, uniforms);
		shader.vertexShader = shader.vertexShader
			.replace("#include <common>", "#include <common>\nvarying float vHeight;")
			.replace("#include <project_vertex>", "#include <project_vertex>\nvHeight = (modelMatrix * vec4(transformed, 1.0)).y;");
		shader.fragmentShader = shader.fragmentShader
			.replace(
				"#include <common>",
				"#include <common>\nvarying float vHeight;\nuniform float uBuildY;\nuniform float uBuilding;\nuniform float uFinish;\nuniform vec3 uClay;\nuniform vec3 uBand;",
			)
			.replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\nif (vHeight > uBuildY) discard;")
			.replace("#include <map_fragment>", "#include <map_fragment>\ndiffuseColor.rgb = mix(uClay, diffuseColor.rgb, uFinish);")
			.replace(
				"#include <dithering_fragment>",
				`#include <dithering_fragment>
				float band = uBuilding * (1.0 - smoothstep(0.0, 0.04, uBuildY - vHeight));
				gl_FragColor.rgb = mix(gl_FragColor.rgb, uBand, band);
				#ifdef OPAQUE
				gl_FragColor.a = band; // glow mask: only the band blooms
				#endif`,
			);
	};
	material.needsUpdate = true;
}
