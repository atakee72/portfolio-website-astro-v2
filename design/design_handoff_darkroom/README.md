# Handoff: Portfolio redesign — Direction B · Darkroom

> *A "contact sheet × terminal" redesign of Ercan Atak's portfolio, built on
> top of the existing Astro 5 + Svelte 5 + Tailwind 3 + MDX stack.*

---

## 1 · What this bundle is

This bundle is the **design specification** for a full redesign of the
`atakee72/portfolio-website-astro-v2` repository. The HTML / JSX files
inside are **design references** — a hi-fi prototype rendered in React for
preview purposes only. **Do not copy the JSX into the app.** Your job is
to **recreate the design in the existing Astro / Svelte / Tailwind
codebase**, using its established patterns:

- `.astro` components for static markup + slots
- `.svelte` components only when interaction is needed (theme toggle,
  mobile menu, custom cursor)
- Tailwind utility classes for styling (extend `tailwind.config.ts` with
  the tokens in `01_design_tokens.md`)
- Existing content collections (`src/content/blog`,
  `src/content/testimonials`)

---

## 2 · Fidelity

**Hi-fi.** The prototype in `reference/darkroom.jsx` is pixel-accurate at
1320 px desktop width: exact colors, typography, spacing, borders, and
interaction details (reticle cursor, blinking terminal caret, hover
states). Match it as closely as you can on desktop; for ≤ 1024 px see the
"Responsive behaviour" section of `02_screen_specs.md`.

---

## 3 · The big change in one sentence

The current site is light-mode-default with a radial **indigo** gradient
and a glossy indigo sphere; the redesign is **dark-mode-default**, paints
the page like a darkroom under safelight, replaces the sphere with a
**film contact sheet**, and treats the navbar as a **terminal status
bar**. The three real projects (`MaHalle`, `Dogs & Films`, `Yet another
admin dashboard`) become **EXIF cards** below the contact sheet.

---

## 4 · How to read this bundle (in order)

| # | File | Purpose |
|---|---|---|
| 1 | `README.md` (this file) | Orientation + ground rules |
| 2 | `01_design_tokens.md` | Colors, fonts, spacing, shadows — drop into `tailwind.config.ts` |
| 3 | `02_screen_specs.md` | Per-section breakdown: nav, hero, contact sheet, EXIF, blog, footer |
| 4 | `03_implementation_plan.md` | Suggested phased rollout (PRs 1–8) |
| 5 | `04_photography_galleries.md` | Thematic photo galleries — `/lens` IA, content-collection schema, PRs 9–10 |
| 6 | `reference/darkroom.jsx` | The hi-fi homepage prototype (React/JSX — reference only) |
| 7 | `reference/darkroom-screens.jsx` | Additional screens: enlarged frame, blog post, mobile, `/lens` index, single roll |
| 8 | `reference/darkroom-preview.html` | Open this in a browser to see all 6 artboards rendered side by side |
| 9 | `reference/tailwind.config.darkroom.ts` | Drop-in replacement for the existing Tailwind config |
| 10 | `snippets/*.astro`, `snippets/*.svelte`, `snippets/globals.css` | Starter skeletons for the new components — adapt, don't paste verbatim |

---

## 5 · Mapping: existing components → new components

| Existing component | What happens | New component (in `snippets/`) |
|---|---|---|
| `Navbar.astro` | Replaced — now a one-line terminal status bar (`ercan@darkroom:~/portfolio$ ./develop --contact-sheet`) | `Navbar.astro` |
| `Header.astro` | Replaced — hero is two columns: huge wordmark + live-feed terminal column. **The sphere is removed.** | `Header.astro` |
| `MyAccordion.astro` | **Removed.** Replaced by the 9-cell contact-sheet grid. | `ContactSheet.astro` (NEW) |
| `Work.astro` (placeholder) | Becomes the **EXIF strip** — the three real projects as cards with EXIF-style metadata. | `ExifWork.astro` |
| `About.astro` (empty) | Filled with a short bio + quick stats; rendered as a single terminal-style block. | `About.astro` |
| `Blog.astro` | Kept as a section, restyled. No more white/20 glass cards. | (restyle existing) |
| `BlogPostCard.astro` | Restyled as a **negative-like card** with sprocket band, frame stamp, EXIF metadata row. | `BlogPostCard.astro` |
| `Testimonials.astro` | **Hide for now** — repo's testimonials are placeholder/lorem (see project CLAUDE.md). Re-enable when real quotes exist. | — |
| `Footer.astro` | Reduced to a single "FRAME 36/36 · END OF ROLL" line. | `Footer.astro` |
| `ThemeToggleBtn.svelte` | Kept, but the **default theme flips to dark.** Light mode is a paler "contact sheet on Kodak paper" inversion. | (light variant TBD) |
| `MobileMenuBtn.svelte` | Kept. Menu chrome restyled to match the terminal aesthetic. | (restyle) |
| `NavigationDots.astro` | Kept logic, restyle dots as small red squares with frame numbers. | (restyle) |
| `SocialMedia.astro` | Kept logic, restyle as a vertical EXIF strip on the left edge. | (restyle) |
| `BaseLayout.astro` | `html` element gets the dark class by default; body bg `#0d0d0c`; **add the grain overlay + reticle cursor at the layout level** so every page inherits them. | (small edits — see `03_implementation_plan.md`) |
| `globals.css` | Add the grain background, the `darkBlink` keyframes, custom-cursor reset. | `globals.css` |

---

## 6 · New components introduced

- **`ContactSheet.astro`** — the central 3×3 grid of frames. Three frame
  types: `photo` (gradient placeholder + film-stock tag), `paint` (warm
  gradient + red tag), `code` (black bg + lime monospace). Click any
  frame → enlarges to fullscreen (use the existing
  `view-transitions` Astro feature; the API is already imported in
  `BaseLayout.astro`).
- **`ReticleCursor.svelte`** — a 36 × 36 red crosshair that follows the
  pointer when over `.darkroom-canvas` regions. Disable on touch
  devices (`(hover: none)` media query). Disable when
  `prefers-reduced-motion`.
- **`TerminalFeed.astro`** — the right-hand column inside the hero. Renders
  a short shell-session view that lists the latest blog posts from the
  content collection.
- **`SprocketRow.astro`** — visual rule that appears above and below the
  contact sheet. Pure decoration — 18 cells, `aria-hidden`.

---

## 7 · Content sources (do **not** invent new content)

Every piece of copy in the prototype is drawn from the real repo or
from the project's `CLAUDE.md`. When you build:

- **Projects** → `src/components/MyAccordion.astro` already has the three
  real projects (`MaHalle`, `Dogs & Films`, `Yet another admin
  dashboard`). Lift their data into a `src/data/projects.ts` file and
  consume it from `ExifWork.astro`.
- **Blog posts** → already in `src/content/blog/*.mdx`. Use the existing
  `getAllBlogPosts()` from `src/lib/content.ts`.
- **Testimonials** → `src/content/testimonials/data.json` is placeholder
  lorem. **Hide the section** until real quotes land. Don't fabricate.
- **Bio numbers** — Ercan: born Istanbul, in Berlin since **2014**,
  Kreuzberg postal code **12049**, phone `+49 (30) 88694300`, email
  `atakee@gmail.com`. These are the only real facts; do not add others.
- **Photo placeholders** — the contact-sheet cells currently use CSS
  gradients as stand-ins. The user (Ercan) is a 35 mm photographer and
  painter; he will supply real photo and painting JPGs later. **Build
  the grid against an array of `{src, alt, tag, label}` objects** so
  swapping placeholders for real images is one commit.

---

## 8 · Anti-slop rules (carried from the design brief)

1. **No emoji.** Anywhere.
2. **No SVG-drawn human silhouettes** as decoration.
3. **No purple-to-pink gradients.** The palette is darkroom-warm-black,
   safelight red, phosphor lime, paper cream — nothing else.
4. **No rounded-corner-with-left-border-accent containers.** Borders are
   square, 1 px, `#2a2a28`. Card radius is `0`.
5. **Don't draw photographs or paintings with SVG / CSS art.** Use
   gradient placeholders or `<image-slot>`-style drop zones until real
   imagery is available.
6. **Don't pad with filler content.** If a section feels empty (e.g.
   testimonials), hide it. Don't invent quotes, stats, awards.

---

## 9 · Acceptance checklist

A reasonable definition of done:

- [ ] Default theme is dark. Light theme is still wired through
      `ThemeToggleBtn.svelte` and ships at least a coherent inverted
      palette (paper cream + ink black + safelight red).
- [ ] Navbar renders as a terminal status bar; the `BERLIN · 12049`
      timestamp updates live (uses `Date.now()` once per minute).
- [ ] Hero displays the wordmark (`ercan` / `atak`) in Space Grotesk 124 px
      with the lime `// dev · photog · painter` tagline beneath.
- [ ] Contact sheet renders 9 frames in a 3 × 3 grid with sprocket bands
      above and below.
- [ ] Reticle cursor follows the pointer on desktop, hidden on touch
      and on `prefers-reduced-motion`.
- [ ] Three EXIF cards render the three real projects with their actual
      stacks (`Next.js + Mongo`, `Next.js + Tailwind`, `Next.js + Sass`).
- [ ] Blog cards adopt the new negative-style template.
- [ ] Testimonials section is hidden via a feature flag (`SHOW_TESTIMONIALS = false`).
- [ ] Footer reads `FRAME 36/36 — END OF ROLL`.
- [ ] Mobile (`< 768 px`) collapses: navbar becomes a single command
      line, hero becomes one column with the terminal column below it,
      contact sheet drops to 2 columns then 1 column.
- [ ] Lighthouse a11y ≥ 95 (reticle cursor must not break tab focus
      outlines; ensure visible focus rings).
- [ ] Build passes `pnpm build` with zero warnings.

---

## 10 · Quick start for Claude Code

```bash
# from the portfolio repo root
git checkout -b feat/darkroom-redesign

# 1. drop in the new tailwind config
cp <handoff>/reference/tailwind.config.darkroom.ts tailwind.config.ts

# 2. drop in the new globals.css base layer
#    (merge with existing, don't blindly overwrite)
$EDITOR src/styles/globals.css

# 3. work through the phased plan in 03_implementation_plan.md,
#    one PR per phase

# preview the source design at any time by opening:
open <handoff>/reference/darkroom-preview.html
```

If you hit ambiguity, **the prototype is the source of truth**. Where
the prototype and a token spec disagree, prefer the prototype.

Good shooting. — Ercan / Claude Design
