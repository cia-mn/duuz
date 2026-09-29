import { execFileSync } from "node:child_process";
import type { APIRoute } from "astro";
import { fullSize } from "../components/fullSize";
import { works } from "../content";

// Dated by the last commit that touched the page, not by the build: Bing trusts
// an accurate lastmod. Needs full history (CI checks it out); without git, today.
let lastmod = new Date().toISOString();
try {
	lastmod = execFileSync("git", ["log", "-1", "--format=%cI", "--", "src", "public"], { encoding: "utf8" }).trim() || lastmod;
} catch {}

/**
 * The one page, with the portfolio photos listed for Google Images (the same
 * full-size files the lightbox opens).
 */
export const GET: APIRoute = async ({ site }) => {
	const photos = await Promise.all(works.map(async (w) => new URL((await fullSize(w.image)).src, site).href));
	const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
	<url>
		<loc>${new URL("/", site)}</loc>
		<lastmod>${lastmod}</lastmod>
${photos.map((loc) => `\t\t<image:image><image:loc>${loc}</image:loc></image:image>`).join("\n")}
	</url>
</urlset>
`;
	return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
};
