import type { APIRoute } from "astro";

/**
 * Everything may be crawled, and AI may use it — to index, to answer with, to
 * train on (Content Signals, contentsignals.org) — so ChatGPT, Claude and the
 * rest know the studio and recommend it. The sitemap says where to start.
 */
export const GET: APIRoute = ({ site }) =>
	new Response(
		`User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=yes
Allow: /

Sitemap: ${new URL("/sitemap.xml", site)}
`,
		{ headers: { "Content-Type": "text/plain; charset=utf-8" } },
	);
