/**
 * The pictures that stand for the site elsewhere, drawn at build time from the
 * hero's own banner and logo mark: the 1200×630 card that link previews show
 * (Facebook, Messenger, Telegram…) and the icon a phone keeps on its home
 * screen. Served as /og.jpg and /apple-touch-icon.png (src/pages); swap the
 * banner or the mark and both follow.
 */
import type { ImageMetadata } from "astro";
import sharp from "sharp";
import banner from "../assets/hero-banner.jpg";
import logoMark from "../assets/logo-mark.png";

/** The size Facebook, X and LinkedIn all crop link previews to. */
export const CARD = { width: 1200, height: 630 };

const clear = { r: 0, g: 0, b: 0, alpha: 0 };

// Astro keeps the source file on imported images, out of enumeration.
const file = (image: ImageMetadata) => (image as ImageMetadata & { fsPath: string }).fsPath;

/** An OKLCH colour as SVG takes it, so the pictures use the site's own tokens. */
function oklch(l: number, c: number, h: number, alpha = 1) {
	const a = c * Math.cos((h * Math.PI) / 180);
	const b = c * Math.sin((h * Math.PI) / 180);
	const L = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
	const M = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
	const S = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
	const rgb = [
		4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
		-1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
		-0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
	].map((x) => {
		const v = Math.min(1, Math.max(0, x));
		return Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055));
	});
	return `rgba(${rgb.join(",")},${alpha})`;
}

const svg = (width: number, height: number, body: string) =>
	new TextEncoder().encode(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">${body}</svg>`);

/** The mark painted ivory into champagne through its own alpha, as the hero paints it, and its glow. */
async function gold(size: number, pad: number) {
	const mark = await sharp(file(logoMark)).resize(size, size, { fit: "contain", background: clear }).png().toBuffer();
	const paint = svg(
		size,
		size,
		`<defs><linearGradient id="g" x1="0.25" y1="0" x2="0.75" y2="1">
			<stop offset="0.3" stop-color="${oklch(0.98, 0.01, 85)}"/>
			<stop offset="1" stop-color="${oklch(0.84, 0.075, 82)}"/>
		</linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/>`,
	);
	const logo = await sharp(paint).composite([{ input: mark, blend: "dest-in" }]).png().toBuffer();
	const wide = size + pad * 2;
	const padded = await sharp(mark).extend({ top: pad, bottom: pad, left: pad, right: pad, background: clear }).png().toBuffer();
	const halo = await sharp(svg(wide, wide, `<rect width="100%" height="100%" fill="${oklch(0.8, 0.085, 85, 0.7)}"/>`))
		.composite([{ input: padded, blend: "dest-in" }])
		.blur(pad / 3.6)
		.png()
		.toBuffer();
	return { logo, halo, wide };
}

/**
 * The link-preview card: the hero's banner kept bright, so the work reads even
 * as a small feed thumbnail, and the mark on a disc of dark glass that keeps it
 * crisp over marble and cabinets alike.
 */
export async function socialCard() {
	const { width: w, height: h } = CARD;
	const size = 330;
	const { logo, halo, wide } = await gold(size, 80);
	// Only a breath of shade at the edges; the photos stay as shot.
	const grade = svg(
		w,
		h,
		`<defs>
			<linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
				<stop offset="0" stop-color="${oklch(0.08, 0.006, 60, 0.12)}"/>
				<stop offset="0.25" stop-color="${oklch(0.08, 0.006, 60, 0)}"/>
				<stop offset="0.75" stop-color="${oklch(0.08, 0.006, 60, 0)}"/>
				<stop offset="1" stop-color="${oklch(0.08, 0.006, 60, 0.16)}"/>
			</linearGradient>
			<radialGradient id="vignette" cx="50%" cy="46%" r="75%">
				<stop offset="0.55" stop-color="${oklch(0.06, 0.006, 60, 0)}"/>
				<stop offset="1" stop-color="${oklch(0.06, 0.006, 60, 0.22)}"/>
			</radialGradient>
		</defs>
		<rect width="100%" height="100%" fill="url(#fade)"/>
		<rect width="100%" height="100%" fill="url(#vignette)"/>`,
	);
	// The disc fills the mark's ring, with a soft shadow lifting it off the photos.
	const r = size * 0.485;
	const disc = svg(
		wide,
		wide,
		`<defs>
			<radialGradient id="glass">
				<stop offset="0" stop-color="${oklch(0.1, 0.01, 60, 0.72)}"/>
				<stop offset="0.97" stop-color="${oklch(0.12, 0.012, 60, 0.6)}"/>
				<stop offset="1" stop-color="${oklch(0.12, 0.012, 60, 0)}"/>
			</radialGradient>
			<radialGradient id="shadow">
				<stop offset="0.6" stop-color="${oklch(0.06, 0.006, 60, 0.45)}"/>
				<stop offset="1" stop-color="${oklch(0.06, 0.006, 60, 0)}"/>
			</radialGradient>
		</defs>
		<circle cx="${wide / 2}" cy="${wide / 2}" r="${r + 60}" fill="url(#shadow)"/>
		<circle cx="${wide / 2}" cy="${wide / 2}" r="${r}" fill="url(#glass)"/>`,
	);
	const centred = (side: number) => ({ left: Math.round((w - side) / 2), top: Math.round((h - side) / 2) });
	const card = await sharp(file(banner))
		.resize(w, h, { fit: "cover" })
		.composite([
			{ input: grade },
			{ input: disc, ...centred(wide) },
			{ input: halo, ...centred(wide) },
			{ input: logo, ...centred(size) },
		])
		.jpeg({ quality: 88, mozjpeg: true })
		.toBuffer();
	return new Uint8Array(card);
}

/** The home-screen icon: the gold mark on the brand's near-black; iOS rounds the corners itself. */
export async function touchIcon() {
	const side = 180;
	const size = 138;
	const { logo, halo, wide } = await gold(size, 14);
	const icon = await sharp(svg(side, side, `<rect width="100%" height="100%" fill="${oklch(0.14, 0.006, 60)}"/>`))
		.composite([
			{ input: halo, left: Math.round((side - wide) / 2), top: Math.round((side - wide) / 2) },
			{ input: logo, left: Math.round((side - size) / 2), top: Math.round((side - size) / 2) },
		])
		.png()
		.toBuffer();
	return new Uint8Array(icon);
}
