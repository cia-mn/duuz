import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

/**
 * The lightbox rendition of a photo: native width up to 1600px, WebP. Openers
 * link the same file, so a tap still shows the photo when JS is off.
 */
export const fullSize = (image: ImageMetadata) =>
	getImage({ src: image, width: Math.min(1600, image.width), format: "webp", quality: 85 });
