import type { APIRoute } from "astro";
import { socialCard } from "../components/social";

/** The link-preview image (og:image), drawn once per build. */
export const GET: APIRoute = async () => new Response(await socialCard(), { headers: { "Content-Type": "image/jpeg" } });
