import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

export default defineConfig({
	// The host GitHub Pages answers on (its custom domain; duuz.mn redirects
	// here). Builds the absolute canonical, og:url and og:image, which link
	// previews need free of redirects, so keep it in step with that setting.
	site: "https://www.duuz.mn",
	integrations: [icon()],
	// One page: its CSS (~30 KB gzipped) rides in the HTML, so the first paint
	// waits on no further request.
	build: { inlineStylesheets: "always" },
	vite: { plugins: [tailwindcss()] },
});
