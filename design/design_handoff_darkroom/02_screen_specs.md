# Screen specs — Darkroom

One section per heading. Each section describes the prototype as it
exists in `reference/darkroom.jsx` (lines referenced inline) and how to
realize it in Astro + Tailwind.

> Notation: `darkStyles.X` refers to a style object inside the prototype.

---

## 1 · Layout root

**Prototype reference:** `darkStyles.root` (line ~159).

- Background: `#0d0d0c` (ink).
- Body font: JetBrains Mono 13 px, line-height 1.5, color `#e8e5dd`.
- Page padding: `24px 36px 36px`.
- Custom cursor: `crosshair`.
- A fixed grain layer sits above all content at `z-index: 50` but with
  `pointer-events: none`.

**Astro:** apply these at the `BaseLayout.astro` level so every page
inherits the canvas. The reticle cursor is mounted once in
`BaseLayout.astro` and listens at `window` scope.

---

## 2 · Terminal status bar (replaces `Navbar.astro`)

**Prototype reference:** `darkStyles.bar` (line ~169).

A single horizontal strip immediately under the top padding. Reads
left-to-right:

```
●  ercan@darkroom : ~/portfolio $ ./develop --contact-sheet 2026                BERLIN · 12049   11.V.26 · 21:14   ● REC
```

| Span | Style | Content |
|---|---|---|
| `●` dot | `8 × 8`, `bg-phosphor`, rounded-full | (always green-lime) |
| `ercan@darkroom` | `text-phosphor` | static |
| `:` | `text-mute` | static |
| `~/portfolio` | `text-mute-2` | static — could mirror `Astro.url.pathname` |
| `$` | `text-mute` | static |
| `./develop --contact-sheet 2026` | `text-paper` | static |
| (spacer) | `flex-1` | — |
| `BERLIN · 12049` | `text-mute-2` `tracking-[0.12em]` | static |
| `11.V.26 · 21:14` | `text-mute-2` `tracking-[0.12em]` | **live** — set on mount, update every 60 s |
| `● REC` | `text-safelight` `font-bold` `tracking-[0.16em]` | static |

Container: `bg-ink-2 border border-ink-3`. Padding `10px 14px`. Font size
`11 px`, letter-spacing `0.04em`.

**Mobile:** below `768 px`, drop the `BERLIN` and date spans. Keep
`./develop` and `● REC`.

**Use Svelte for the clock** — `<LiveClock />` 8-line component, hydrate
with `client:idle`.

---

## 3 · Hero (replaces `Header.astro`)

**Prototype reference:** `darkStyles.hero` (line ~187).

Two-column grid, `gridTemplateColumns: '1.4fr 1fr'`, gap 32 px, vertical
padding `36px 0 28px`.

### 3.1 · Left column

```
ROLL 12 · F/2.8 · 1/250 · ISO 400      <- text-label, mute-2
ercan                                  <- text-display
atak                                   <- text-display
// dev · photog · painter              <- text-mono-sm, phosphor, mt-4

I keep three darkrooms: one for software, one
for film, one for paint. Below is the latest
contact sheet — frames as they came back,
unranked. Click any cell to enlarge.        <- text-mono-sm, paper-2, max-w-[500px]

01 home   02 sheet   03 journal   04 rolls   05 paints   06 reach
                                       <- nav: numbers safelight, labels paper, uppercase tracked
```

The two wordmark lines stack on top of each other with `line-height:
0.88` so they nearly touch. **No gap** between them.

The nav row at the bottom of the left column **replaces the existing
top-right nav links**. The terminal status bar above does not carry nav
items.

### 3.2 · Right column — live terminal feed

**Prototype reference:** `darkStyles.term` (line ~213).

A bordered `ink-2` panel labeled `~/JOURNAL/FEED.SH`. Contents:

```
$ cat ~/blog/*.mdx | head
▸ 2026-03-10  building modern web apps
▸ 2026-02-20  typescript, with patience
▸ 2026-01-15  getting started with astro
$ whoami
ercan — full-stack, half-painter,
        based in Kreuzberg
$ uptime
Berlin, since 2014 — load avg 0.7
$ _
```

`$` is safelight red. `▸ <date>` is phosphor lime. The trailing `_` is the
blinking caret described in `01_design_tokens.md § Blinking caret`.

**Make the blog list dynamic** — render the last three posts from
`getAllBlogPosts()` with their published date and title.

---

## 4 · Sprocket band

**Prototype reference:** `darkStyles.sprocketRow` (line ~219).

A thin decorative strip. 18 cells of `28 × 12` solid `ink` color, inside
an `ink-2` strip, `padding 6px 0`, `justify-content: space-between`.

**Two of these** — one immediately above the contact sheet, one
immediately below. Both `aria-hidden="true"`.

---

## 5 · Contact sheet (`ContactSheet.astro` — NEW)

**Prototype reference:** `darkStyles.sheet` + the `frames` array (line ~20).

A 3 × 3 grid:

```
display: grid;
grid-template-columns: repeat(3, 1fr);
gap: 8px;
background: #18181a;
padding: 10px;
border: 1px solid #2a2a28;
```

Each cell is a `Frame` (`darkStyles.frame`):

- `position: relative; aspect-ratio: 4/3; border: 1px solid #2a2a28;`
- A frame number label top-left (e.g. `01A`, `02A`, …, `09A`) — phosphor
  lime, `10 px`, `bg: rgba(0,0,0,0.6)`, padded `2 × 5`.
- A film-stock tag top-right (e.g. `PORTRA 400`, `ASTRO 5`, `OIL 50×40`) —
  bordered, padded, semi-transparent black background.
- A location label bottom-left (e.g. `TEMPELHOF · 18:42`).

Three **frame types**, distinguished by the `k` field:

| `k` | Visual | Tag color |
|---|---|---|
| `photo` | one of the gradient stand-ins (`tone: a, b, d, e, g`) | paper |
| `paint` | warm gradient (`tone: c, f`) | safelight red |
| `code`  | `bg: #0a0a09` + monospace lime text | phosphor lime |

The nine frames used in the prototype (use this exact array as the
seed — Ercan will replace `tone` with real `src` URLs later):

```ts
[
  { k: 'photo', tone: 'a', label: 'TEMPELHOF · 18:42',     tag: 'PORTRA 400' },
  { k: 'code',  text: 'export default function Page() {\n  return <Studio />;\n}', tag: 'ASTRO 5' },
  { k: 'photo', tone: 'b', label: 'BOSPORUS · 07:11',       tag: '35MM' },
  { k: 'paint', tone: 'c', label: 'POMEGRANATES · STUDIO',  tag: 'OIL · 50×40' },
  { k: 'photo', tone: 'd', label: 'KREUZBERG · NIGHT',      tag: 'TRI-X 400' },
  { k: 'code',  text: '$ pnpm build\n  ✓ 22 pages\n  ✓ 0 warnings', tag: 'BUILD OK' },
  { k: 'photo', tone: 'e', label: 'STUDIO · NORTH LIGHT',   tag: '120MM' },
  { k: 'paint', tone: 'f', label: 'AFTER BONNARD',          tag: 'GOUACHE' },
  { k: 'photo', tone: 'g', label: 'U-BAHN · 23:54',         tag: 'PUSHED +1' },
]
```

**Interaction (desktop):**

- Hover: `transform: scale(1.02)`, `transition: 200ms`. (Bring slightly
  forward — the reticle cursor stays pinned to the new position.)
- Click: open an enlarged view (Astro view-transitions; full-bleed
  dark backdrop with the same border treatment).

**Mobile:** 2 columns at `< 1024 px`, 1 column at `< 640 px`.

---

## 6 · EXIF strip — three projects (`ExifWork.astro`)

**Prototype reference:** `darkStyles.exifWrap` (line ~244).

Section title: `// EXIF — work that paid the rent` (uppercase, `mute-2`,
tracking `0.18em`).

Below the title, a 3-column grid (`gap 12`). Each card:

```
┌───────────────────────────────────┐
│ 01/03                             │
│                                   │
│ MaHalle                           │
│ Home-made Facebook for the Kiez   │
│ - - - - - - - - - - - - - - - -   │
│ STACK · Next.js + Mongo           │
│ YEAR · 2024                       │
│ STATUS · live                     │
│ - - - - - - - - - - - - - - - -   │
│ open frame →                      │
└───────────────────────────────────┘
```

| Element | Style |
|---|---|
| Card | `bg-ink-2 border border-ink-3 p-[18px_16px]`, `display: flex; flex-direction: column; gap: 4` |
| Frame index | `10 px`, `text-safelight`, `tracking-[0.18em]` |
| Title | Space Grotesk 26 px, weight 700, `text-paper-hi`, `tracking-[-0.02em]`, `mt-2` |
| Subtitle | `12 px`, `text-paper-2`, `mb-3` |
| EXIF list | bordered top and bottom with `dashed ink-3`, `py-2.5` |
| EXIF line | `10 px`, `text-mute-2`, `tracking-[0.10em]` |
| Open frame link | `11 px`, `text-phosphor`, `tracking-[0.12em]`, uppercase, `mt-2.5` |

**Data source** — replace the `darkStyles.exifWrap` hard-coded array
with the canonical project list from `MyAccordion.astro`. Move it to
`src/data/projects.ts`:

```ts
// src/data/projects.ts
export const projects = [
  {
    slug: 'mahalle',
    title: 'MaHalle',
    subtitle: 'Home-made Facebook for the Kiez',
    url: 'https://mahalle-kiez-gesichterbuch.vercel.app',
    cover: '/assets/maHalle.png',
    exif: {
      stack:  'Next.js + Mongo',
      year:   '2024',
      status: 'live',
    },
  },
  // ...Dogs & Films, Quiet Dashboard
];
```

---

## 7 · Blog list (`Blog.astro` + `BlogPostCard.astro`)

**Keep** `getAllBlogPosts()` and the section wrapper. Drop the
existing white/20 glass card markup.

New card template:

```
┌──────────────────────────────────────────┐
│ ╾═══╾═══╾═══╾═══╾═══╾═══╾═══╾═══╾═══╾═══  │  <- sprocket band, 8 cells
│                                          │
│ ASTRO                                    │  <- category tag, phosphor, 10px, tracked
│                                          │
│ Getting started with Astro               │  <- Space Grotesk 22, paper-hi
│                                          │
│ Migrating an old Next.js portfolio to    │
│ islands. Why static-first finally...     │  <- 13 px, paper-2
│                                          │
│ - - - - - - - - - - - - - - - - - - -    │
│ 2026-01-15 · 6 min          read →       │  <- 10 px mute-2 / phosphor
└──────────────────────────────────────────┘
```

Card container same as EXIF card: `bg-ink-2 border border-ink-3 p-6`.
Three columns at `>= xl`, two at `md`, one at `sm`. Existing column
layout was masonry-style (`columns-1 md:columns-2 xl:columns-3`); switch
to a CSS Grid so heights line up.

---

## 8 · Testimonials

Hidden behind a flag. Add to `src/lib/config.ts`:

```ts
export const FEATURES = {
  SHOW_TESTIMONIALS: false,
};
```

`index.astro` checks the flag before mounting the component.

---

## 9 · Footer (`Footer.astro`)

**Prototype reference:** `darkStyles.foot` (line ~268).

```
FRAME 36/36 — END OF ROLL      atakee@gmail.com  ·  +49 30 88694300  ·  12049 Berlin      © ATAK · 2026
```

Single row, `flex justify-between`, `mt-6 pt-3.5 border-t border-ink-3`,
`10 px`, `tracking-[0.16em]`, `text-mute`. Left span colored `safelight`.

---

## 10 · Responsive behaviour

Breakpoints (Tailwind defaults are fine):

| Breakpoint | Width | Layout adjustments |
|---|---|---|
| `xs` | < 640 px | Status bar collapses to `./develop ● REC`. Hero is one column. Sprocket rows hidden. Contact sheet → 1 column. EXIF cards → 1 column. Footer wraps to two lines. |
| `sm/md` | 640 – 1023 px | Hero is one column (wordmark on top, terminal beneath). Contact sheet → 2 columns. EXIF cards → 2 columns. |
| `lg+` | ≥ 1024 px | Full desktop layout as in the prototype. |

Page padding: `16px 16px 24px` below `md`; `24px 24px 28px` at `md`;
`24px 36px 36px` at `lg`.

The reticle cursor disables itself under `(hover: none)` automatically.
