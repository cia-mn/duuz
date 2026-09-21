# DuuZ design — landing page

Single-page Astro site for the furniture studio [@duuz_design](https://www.instagram.com/duuz_design/)
([Facebook](https://www.facebook.com/duuzdesigntavilga)): gallery with short clips, services,
project timeline, contact.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Editing the site

Everything you would want to change lives in **`src/content.ts`** — the studio name, phone
number, tagline, the four process steps, timeline entries and the gallery list. No component needs
touching to add a project.

**Adding a photo:** drop the file in `src/assets/work/`, `import` it at the top of
`src/content.ts`, and add a `{ image, title }` line to `works`. Astro resizes and converts
it to WebP at build time, so upload the original resolution.

**Adding a clip:** a `works` entry can also carry `video` — an imported `.mp4` from
`src/assets/work/`. It plays muted over the photo in the grid while on screen and with
controls in the lightbox; the photo is its poster, so keep the two the same shape. Encode
for the web first (the reels here are 720×1280, H.264, no audio — Instagram music is not
licensed off-platform):

```bash
ffmpeg -i in.mp4 -an -vf "scale=720:1280,format=yuv420p" -c:v libx264 -crf 27 -preset slow -movflags +faststart out.mp4
```

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
| `src/components/Gallery.astro` | Masonry grid with clip tiles + `<dialog>` lightbox |
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
line per theme and every component follows. `--glow` is the champagne bloom behind the
hero, the pulsing call button and the hover shadows; every animation sits behind
`prefers-reduced-motion: no-preference`, and clips do not autoplay under reduced motion or
Save-Data.

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

Live at **https://duuz.mn** (`cia-mn.github.io/duuz/` and `www.duuz.mn` redirect to it).
The custom domain is a repo setting, not a file — Pages ignores `CNAME` files when it
deploys from a workflow:

```bash
gh api -X PUT repos/cia-mn/duuz/pages -f cname=duuz.mn
```

DNS lives at dns.mn (`ns1–4.dns.mn`):

| Name  | Type  | Value |
| ---   | ---   | --- |
| `@`   | A     | `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` |
| `@`   | AAAA  | `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153` |
| `www` | CNAME | `cia-mn.github.io.` |

Plus the `_github-pages-challenge-cia-mn` TXT record from the org's verified-domains page —
it stops anyone else's Pages site from claiming `duuz.mn` if this one is ever turned off.

## Before going live

- Photos and clips were pulled from the public Instagram feed. The two kitchen stills and
  the TV wall are full resolution now; `entry-mirror-bench`, `glass-front-wardrobe`,
  `kitchen-island-open-shelving`, `living-tv-shelving`, `vanity-stone-basin` and
  `wardrobe-round-handles` are still 640px reel covers. Replace them with originals from
  the studio when available.
