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
photo renders as a plate, several as a contact sheet that fills the card width. Tapping a
photo opens the card's own lightbox; a photo that is also a gallery tile brings that
tile's caption along, and its clip if it has one.

**Changing the 3D model:** the stage beside the services steps shows `showcase.model` from
`src/content.ts` — a `.glb` built from a SketchUp export. In SketchUp use *File → Export →
3D Model → COLLADA (.dae)* with *Export edges* and *Export texture maps* ticked (the edges
are what glows), and *Export only selection set* to leave the walls and ceiling out. Put
the `.dae` and its texture folder in `sketchup/`, then:

```bash
npm run model -- sketchup/vildwert.dae src/assets/models/vildwert.glb --drop group_51,group_52
```

It prints the model's top-level groups with their sizes; `--drop` removes the ones that
hide the furniture (here the room's walls and ceiling). Cameras, TSE clipping boxes and
stray edges go on their own. Import the new file with `?url` in `content.ts` and point
`showcase.model` at it. The measurements in the Хэмжилт step are the model's own size.

Icon names come from [Material Symbols](https://icon-sets.iconify.design/material-symbols/)
and [Font Awesome brands](https://icon-sets.iconify.design/fa6-brands/).

## Structure

| Path | What it is |
| --- | --- |
| `src/content.ts` | All copy and data |
| `src/pages/index.astro` | Page composition: hero, gallery, services, timeline, contact |
| `src/components/Hero.astro` | Cinematic top section: graded banner, logo mark, calls to action |
| `src/components/Gallery.astro` | Masonry grid with clip tiles |
| `src/components/Timeline.astro` | Filterable timeline with rail, markers and reveal-on-scroll |
| `src/components/Lightbox.astro` | `<dialog>` viewer shared by the gallery and each timeline card |
| `src/components/ModelStage.astro` | Services steps beside the 3D stage: tour, lazy loading, fallbacks |
| `src/scripts/model-stage.ts` | The 3D stage (three.js): glowing edges, build-up, bloom, camera |
| `scripts/model.mjs` | SketchUp `.dae` → compressed `.glb` for the stage (`npm run model`) |
| `sketchup/` | SketchUp exports the models are built from; not deployed |
| `src/layouts/Layout.astro` | Head tags, header, footer, dark-mode toggle |
| `src/styles/global.css` | Design tokens (colours, fonts, easings) |

## Design notes

Dark is the brand default — the theme toggle still works, but only an explicit choice
flips it to light; the OS preference does not get a vote. Layout and type scale follow
[astro-art-portfolio](https://astro-art-portfolio.netlify.app/); the palette is near-black
`paper` / `ink` neutrals with a champagne accent, light-weight Cormorant Garamond display
over Geist body, and tracked small caps for nav, eyebrows and buttons. Both themes are the
same OKLCH tokens in `global.css` with swapped values, so changing the brand colour is one
line per theme and every component follows. `--glow` is the champagne bloom of the
pulsing call button and the hover shadows; every animation sits behind
`prefers-reduced-motion: no-preference`, and clips do not autoplay under reduced motion or
Save-Data.

The hero is the studio's banner graded like a film still — dark pool behind the logo,
vignette, grain, a fade into the page — that fades up from black and then pushes in
slowly. Swap `src/assets/hero-banner.jpg` to change it (keep it wide, ~21:9). The logo is
`src/assets/logo-mark.png`, black on transparent: the hero uses it as a mask and paints it
ivory to champagne. `dark` on the hero pins the dark tokens, so it reads the same in both
themes.

The services steps drive a three.js stage that plays them out on a real project: the room's
box drawn and dimensioned, the SketchUp edges drawing themselves floor to ceiling, the
panels rising as raw clay behind a line of light, then the finishes. Edges glow on the dark
theme and read as ink on paper; only the edges and the build line bloom, so lit surfaces
keep their true colour. On screen the stage tours the steps; hovering or clicking a card,
or dragging the model, hands over control. three.js (~170 KB gzipped) and the ~1 MB model
load only as the section comes near, behind a button under Save-Data. Under reduced motion
the stage opens on the drawing, with no tour and no sway. Without WebGL the cards stand
alone. How each effect is made is written up at the top of `src/scripts/model-stage.ts`.

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
