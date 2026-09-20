import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

export default defineConfig({
	// GitHub Pages project site → https://cia-mn.github.io/duuz/.
	// On a real domain: set `site` to it, delete `base`, add public/CNAME.
	site: "https://cia-mn.github.io",
	base: "/duuz",
	integrations: [icon()],
	vite: { plugins: [tailwindcss()] },
});
