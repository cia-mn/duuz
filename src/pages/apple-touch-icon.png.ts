import type { APIRoute } from "astro";
import { touchIcon } from "../components/social";

/** The home-screen icon phones pick up, drawn once per build. */
export const GET: APIRoute = async () => new Response(await touchIcon(), { headers: { "Content-Type": "image/png" } });
