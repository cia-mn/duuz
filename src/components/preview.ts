/**
 * A photo's stand-in while it loads: the image shrunk to 32px, blurred and
 * inlined as a data URI (~200 bytes), so it paints with the page itself.
 * `.preview` in global.css lays it under the photo, dimmed towards the card;
 * the photo fades in over it once loaded (`data-reveal`), and the blur clears.
 */
import type { ImageMetadata } from "astro";
import sharp from "sharp";

const made = new Map<string, Promise<string>>();

export function preview(image: ImageMetadata): Promise<string> {
	// Astro keeps the source file on imported images, out of enumeration.
	const file = (image as ImageMetadata & { fsPath?: string }).fsPath;
	if (!file) return Promise.resolve("none");
	let url = made.get(file); // gallery and timeline share photos
	if (!url) {
		url = sharp(file)
			.rotate()
			.resize(32)
			.blur(2)
			.webp({ quality: 45 })
			.toBuffer()
			.then((b) => `url(data:image/webp;base64,${b.toString("base64")})`);
		made.set(file, url);
	}
	return url;
}
