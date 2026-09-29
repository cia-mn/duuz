// Free-plan stand-in for Cloudflare's Markdown for Agents (Pro+ only): same
// negotiation, same converter. Browsers never send text/markdown, so they get HTML.
export default {
	async fetch(request, env) {
		const res = await fetch(request);
		const wantsMd = (request.headers.get("accept") || "").includes("text/markdown");
		const isHtml = (res.headers.get("content-type") || "").startsWith("text/html");
		if (!wantsMd || !isHtml) return res;

		const md = await env.AI.toMarkdown({
			name: "page.html",
			blob: new Blob([await res.clone().text()], { type: "text/html" }),
		});
		if (md.format === "error") return res;

		return new Response(md.data, {
			status: res.status,
			headers: {
				"content-type": "text/markdown; charset=utf-8",
				"vary": "accept",
				"x-markdown-tokens": String(md.tokens),
				"content-signal": "search=yes, ai-input=yes, ai-train=yes", // mirrors src/pages/robots.txt.ts
			},
		});
	},
};
