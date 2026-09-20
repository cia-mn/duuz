# DuuZ design — landing page

Single-page Astro site for the furniture studio [@duuz_design](https://www.instagram.com/duuz_design/):
gallery, services, project timeline, contact.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Editing the site

Everything you would want to change lives in **`src/content.ts`** — the studio name, phone
number, tagline, service cards, timeline entries and the gallery list. No component needs
touching to add a project.

**Adding a photo:** drop the file in `src/assets/work/`, `import` it at the top of
`src/content.ts`, and add a `{ image, title }` line to `works`. Astro resizes and converts
it to WebP at build time, so upload the original resolution.

**Adding a project to the timeline:** append an entry to `timeline` (newest first — the
page renders the array order as-is). `category` must match a `key` in `categories`, which
is what the filter chips are built from. Set `featured: true` for the accent ring, and list
the job's photos in `images: []` — the same imports the gallery uses, no second copy. One
photo renders as a plate, several as a contact sheet that fills the card width.

Icon names come from [Material Symbols](https://icon-sets.iconify.design/material-symbols/)
and [Font Awesome brands](https://icon-sets.iconify.design/fa6-brands/).

## Structure

| Path | What it is |
| --- | --- |
| `src/content.ts` | All copy and data |
| `src/pages/index.astro` | Page composition: hero, gallery, services, timeline, contact |
| `src/components/Gallery.astro` | Masonry grid + `<dialog>` lightbox |
| `src/components/Timeline.astro` | Filterable timeline with rail, markers and reveal-on-scroll |
| `src/layouts/Layout.astro` | Head tags, header, footer, dark-mode toggle |
| `src/styles/global.css` | Design tokens (colours, fonts, easings) |

## Design notes

Dark is the brand default — the theme toggle still works, but only an explicit choice
flips it to light; the OS preference does not get a vote. Layout and type scale follow
[astro-art-portfolio](https://astro-art-portfolio.netlify.app/); the palette is near-black
`paper` / `ink` neutrals with a champagne accent, light-weight Cormorant Garamond display
over Geist body, and tracked small caps for nav, eyebrows and buttons. Both themes are the
same OKLCH tokens in `global.css` with swapped values, so changing the brand colour is one
line per theme and every component follows.

The timeline is a port of [Shirone](https://github.com/LyraVoid/Shirone)'s Material 3
Expressive `TimelineSection` — rail, marker, featured ring, filter chips and staggered
reveal — rewritten as a static Astro component on this palette, so the site ships no
client framework.

## Deploying

GitHub Pages, from `main`, via `.github/workflows/deploy.yml` — push and it rebuilds. The
repo has to be **public** (Pages on a private repo needs a paid plan), and Pages needs to
be switched to *Source: GitHub Actions* once:

```bash
gh api -X POST repos/cia-mn/duuz/pages -f build_type=workflow
```

Live at `https://cia-mn.github.io/duuz/`. That subpath is why `astro.config.mjs` sets
`base: "/duuz"`: Astro prefixes every URL it generates, but a hand-written absolute path
does not get rewritten — go through `import.meta.env.BASE_URL` like the favicon does, or
it 404s in production while working fine in `npm run dev`.

**Moving to a real domain:** set `site` to it, delete `base`, put the bare hostname in
`public/CNAME`, and point DNS at GitHub (apex: the four A records from GitHub's Pages
docs; `www`: a CNAME to `cia-mn.github.io`). Pages issues the certificate itself.

## Before going live

- Photos were pulled from the public Instagram feed; the reel covers among them are only
  640px wide. Replace them with originals from the studio when available.
