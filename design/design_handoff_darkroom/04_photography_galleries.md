# 04 · Photography galleries — thematic rolls

> Extends the Darkroom redesign so Ercan can present **themed galleries**
> (each "roll") rather than individual photographs. Fits the existing
> design vocabulary without inventing new components — every page below
> reuses contact-sheet + EXIF card primitives already specified.

This is an **additive scope** on top of the original handoff. PRs 1–8 in
`03_implementation_plan.md` ship the homepage redesign; this doc adds
PRs 9–10 for the photography section.

---

## 1 · Information architecture

| Route | Purpose | Reference artboard |
|---|---|---|
| `/` | Homepage. Mixed contact sheet pulls one or two frames from the latest rolls + code + paint cells. **No change** from PRs 1–8. | 01 in `darkroom-preview.html` |
| `/lens` | Index of all rolls. Grid of roll cards, each a mini contact-sheet collage + EXIF metadata. Filter chips by location / film / year. | 05 in `darkroom-preview.html` |
| `/lens/[roll-slug]` | One roll's full contact sheet (5 × 4 = 20 frames typical) with EXIF panel, field notes, prev / next roll navigation. | 06 in `darkroom-preview.html` |
| `/lens/[roll-slug]/[frame-n]` | Single enlarged frame. **Same as the enlarged-frame artboard** (02 in the preview). | 02 in `darkroom-preview.html` |

The same shape generalises to paintings later — `/canvas` index of
series, `/canvas/[series-slug]` for a single series.

---

## 2 · Content collection schema

Add a new collection in `src/content/config.ts`:

```ts
import { defineCollection, z } from 'astro:content';

const rolls = defineCollection({
  type: 'data',  // we use JSON / YAML, not MDX, because frames are tabular
  schema: z.object({
    rollNumber: z.number().int(),          // 14
    slug: z.string(),                      // 'berlin-nights'
    title: z.string(),                     // 'Berlin Nights'
    location: z.string(),                  // 'Berlin'
    locale: z.string().optional(),         // '12049 Kreuzberg'
    filmStock: z.string(),                 // 'Kodak Tri-X 400'
    iso: z.union([z.number(), z.string()]).optional(),
    pushPull: z.string().optional(),       // '+1'
    camera: z.string().optional(),         // 'Leica M6 · 35 mm'
    dateStart: z.date(),
    dateEnd: z.date().optional(),
    fieldNotes: z.string().optional(),     // markdown allowed
    status: z.enum(['developing', 'developed', 'archived']),
    frames: z.array(z.object({
      n:       z.number().int(),           // 1..36
      src:     z.string(),                 // '/lens/14/01.jpg' (full size)
      thumb:   z.string().optional(),      // '/lens/14/01-thumb.jpg'
      alt:     z.string(),
      label:   z.string().optional(),      // 'KOTTBUSSER TOR · 22:14'
      tag:     z.string().optional(),      // 'TRI-X 400'
      starred: z.boolean().default(false), // shown with the safelight ★
      exif: z.object({                     // per-frame, optional
        shutter:  z.string().optional(),   // '1/250 s'
        aperture: z.string().optional(),   // 'f/2.8'
        lens:     z.string().optional(),   // '35 mm f/2'
        notes:    z.string().optional(),
      }).optional(),
    })),
  }),
});

export const collections = { rolls /* …existing collections */ };
```

A complete roll file lives at `src/content/rolls/14-berlin-nights.json`:

```json
{
  "rollNumber": 14,
  "slug": "berlin-nights",
  "title": "Berlin Nights",
  "location": "Berlin",
  "locale": "12049 Kreuzberg",
  "filmStock": "Kodak Tri-X 400",
  "iso": 800,
  "pushPull": "+1",
  "camera": "Leica M6 · 35 mm",
  "dateStart": "2024-10-04",
  "dateEnd":   "2024-11-18",
  "status": "developed",
  "fieldNotes": "Six weeks, three walks a week, one camera. The whole roll happened between 22:00 and 04:30 — Kotti to Tempelhof, mostly on foot, occasionally on the U8.",
  "frames": [
    {
      "n": 1, "src": "/lens/14/01.jpg", "alt": "Kottbusser Tor at night",
      "label": "KOTTBUSSER TOR · 22:14", "tag": "TRI-X 400", "starred": true,
      "exif": { "shutter": "1/250 s", "aperture": "f/2.8", "lens": "35 mm f/2" }
    },
    { "n": 2, "src": "/lens/14/02.jpg", "alt": "U8 platform",
      "label": "U8 · 23:01", "tag": "TRI-X 400" }
    // ...
  ]
}
```

---

## 3 · New routes and components

### Routes

| File | Purpose |
|---|---|
| `src/pages/lens/index.astro` | Rolls index. Renders `<RollGrid rolls={await getCollection('rolls')} />`. |
| `src/pages/lens/[slug].astro` | Single roll. Renders `<RollPage roll={…} />`. Generates static paths from the collection. |
| `src/pages/lens/[slug]/[frame].astro` | Single frame enlarged. Reuses `<EnlargedFrame frame={…} prev={…} next={…} />`. |

### Components

| Component | Renders | Notes |
|---|---|---|
| `RollGrid.astro` | The `/lens` page body — chip filters + 3-column responsive grid of `RollCard`s. | Filters operate client-side via a tiny Svelte island that toggles classes on the cards (no rerender). |
| `RollCard.astro` | One card in `/lens`. 2×3 mini-thumbnail collage + roll number + title + EXIF row + `open roll →` link. | Always 6 thumbnails. If the roll has fewer than 6 frames, pad with repeats; if more, pick the 6 starred ones first. |
| `RollPage.astro` | The `/lens/[slug]` body — terminal bar, breadcrumbs, header with H1 + EXIF panel + field notes, big contact sheet, prev/next nav. | The contact sheet is always 5 columns × *n* rows; pad to a multiple of 5 with the same `.gap-cell` placeholder you already use for empty sheet slots. |
| `BigContactSheet.astro` | The 5-column grid inside a `RollPage`. Each cell is a link to `/lens/[slug]/[n]`. Hover scales 1.02, just like the homepage sheet. | Add `★` (safelight red) top-right when `starred: true`. |
| `EnlargedFrame.astro` | The single-frame route. Sprocket rails left + right, big framed image with corner brackets + crosshair, EXIF strip below, prev / next frame nav (← / →). | The component already exists in the homepage spec (screen 02). Make it accept an `enclosingRoll` prop so the breadcrumb reads `~/ › lens › rolls › 14-berlin-nights › 03A`. |
| `FilterChips.svelte` | Tiny Svelte island for the `/lens` filter chips. Stores selected filter in URL hash so deep-links work. | Don't add a search engine; chip filtering only. |

---

## 4 · Visual rules unique to galleries

These extend `01_design_tokens.md`:

- **Starred frames** get a `★` glyph in safelight red (`#ff3b30`) at the
  top-right of the cell, inside the contact sheet. Stars are a curatorial
  signal — frames Ercan picked for the final print run.
- **Filter chips** use `border: 1px solid` in `ink-3` when inactive, in
  `phosphor` when active. Active chip also gets a faint `rgba(212,255,58,0.06)`
  background.
- **Mini thumbnails** in `RollCard` are *always* `aspect-ratio: 4/3`, no
  rounded corners, 1 px `ink-3` border. Gap between thumbs is 3 px.
- **`open roll →`** is `text-phosphor`, uppercase, tracking-[0.14em]. Same
  voice as the existing `open frame →` link on EXIF work cards.
- **EXIF panel on a roll page** is wider than the homepage version
  because it carries more rows. Width: `380 px` at desktop; full-width
  beneath the H1 at `< 768 px`.

---

## 5 · Implementation plan additions

### PR 9 · `/lens` rolls index

**Files:**
- `src/content/config.ts` — add `rolls` collection.
- `src/content/rolls/*.json` — seed 3 real rolls; the rest can be
  empty stubs Ercan fills in.
- `src/pages/lens/index.astro` — NEW.
- `src/components/RollGrid.astro` — NEW.
- `src/components/RollCard.astro` — NEW.
- `src/components/FilterChips.svelte` — NEW (client island).
- Add a `Lens` link to the homepage nav row (becomes `02 sheet` → `02 lens`).

**Acceptance:** `/lens` loads, lists the 3 seeded rolls. Filter chips
toggle visibility client-side. Cards are keyboard-focusable.

### PR 10 · `/lens/[slug]` + `/lens/[slug]/[n]`

**Files:**
- `src/pages/lens/[slug].astro` — NEW. `getStaticPaths()` reads the
  collection.
- `src/pages/lens/[slug]/[frame].astro` — NEW. Generates static paths
  for every frame.
- `src/components/RollPage.astro` — NEW.
- `src/components/BigContactSheet.astro` — NEW.
- `src/components/EnlargedFrame.astro` — promote the homepage modal
  artboard into a real component (it was previously inline in the
  homepage view-transition).

**Acceptance:** Every seeded roll renders. Click a cell → enlarged frame.
Arrow keys on the enlarged page navigate prev / next. Direct-loading a
`/lens/berlin-nights/03` URL works (static path generated).

---

## 6 · Asset pipeline (for later, not v1)

Ercan will export his 35mm scans as:

```
/public/lens/[roll-slug]/[n].jpg            # full-size, ~ 2400 px long edge
/public/lens/[roll-slug]/[n]-thumb.jpg      # 600 px long edge for grids
```

For v1 leave the placeholder gradients in place. When real files land,
swap each frame's `tones[i]` (or `tone`, on the homepage sheet) for a
real `src` and pass it through Astro's `<Image>` component for
optimisation. **Do not auto-generate art from training data** —
placeholders stay until Ercan delivers.

---

## 7 · Paintings (`/canvas`) — symmetry note

When Ercan adds painting series, mirror this exact structure:

| Photo route | Painting equivalent |
|---|---|
| `/lens` | `/canvas` (index of series) |
| `/lens/[roll]` | `/canvas/[series]` (one series' grid) |
| `/lens/[roll]/[n]` | `/canvas/[series]/[n]` (single painting) |

`RollCard` becomes `SeriesCard`, `BigContactSheet` becomes
`SeriesGrid`. EXIF fields swap: instead of `filmStock / iso / camera`,
use `medium / dimensions / surface`. Everything else carries over.

This is intentional: the site has one IA pattern — *index → set →
single* — and three disciplines pour into the same vessel.
