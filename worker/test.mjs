// node worker/test.mjs
import assert from "node:assert/strict";
import worker from "./index.js";

globalThis.fetch = async (req) => {
	const svg = req.url.endsWith(".svg");
	return new Response(svg ? "<svg/>" : "<h1>DuuZ</h1>", {
		headers: { "content-type": svg ? "image/svg+xml" : "text/html; charset=utf-8" },
	});
};
const env = {
	AI: {
		toMarkdown: async ({ blob }) => ({
			format: "markdown",
			data: "# " + (await blob.text()).replace(/<[^>]+>/g, ""),
			tokens: 3,
		}),
	},
};
const get = (url, accept) => worker.fetch(new Request(url, { headers: accept ? { accept } : {} }), env);

let r = await get("https://www.duuz.mn/");
assert.equal(r.headers.get("content-type"), "text/html; charset=utf-8"); // browsers: untouched

r = await get("https://www.duuz.mn/", "text/markdown");
assert.equal(r.headers.get("content-type"), "text/markdown; charset=utf-8");
assert.equal(r.headers.get("x-markdown-tokens"), "3");
assert.equal(await r.text(), "# DuuZ");

r = await get("https://www.duuz.mn/favicon.svg", "text/markdown");
assert.equal(r.headers.get("content-type"), "image/svg+xml"); // non-HTML: untouched

console.log("ok");
