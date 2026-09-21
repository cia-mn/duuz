import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

export default defineConfig({
	// Custom domain on GitHub Pages — builds the absolute og:image / og:url.
	site: "https://duuz.mn",
	integrations: [icon()],
	vite: { plugins: [tailwindcss()] },
});
