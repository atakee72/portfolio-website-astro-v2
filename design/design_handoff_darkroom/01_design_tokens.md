# Design tokens — Darkroom

All values extracted from `reference/darkroom.jsx`. Drop these into
`tailwind.config.ts` (a ready-to-paste version is at
`reference/tailwind.config.darkroom.ts`) and replace the existing
`globals.css` `@layer base` with the rules below.

---

## Colors

### Core palette

| Role | Hex | Tailwind key |
|---|---|---|
| Page background (warm near-black) | `#0d0d0c` | `ink` |
| Panel / card background | `#18181a` | `ink-2` |
| Hairline / border | `#2a2a28` | `ink-3` |
| Muted text | `#6a6a66` | `mute` |
| Body secondary text | `#9a9a92` | `mute-2` |
| Body text | `#c2bfb6` | `paper-2` |
| Display / strong text | `#e8e5dd` | `paper` |
| Cream (logo / wordmark) | `#f4f1ea` | `paper-hi` |
| **Safelight red** (accent #1) | `#ff3b30` | `safelight` |
| **Phosphor lime** (accent #2) | `#d4ff3a` | `phosphor` |

### Photo placeholder gradients

While real images are not yet available, these CSS gradients stand in for
photographs and paintings inside contact-sheet frames. Each tone is keyed
to a single letter (a–g for photos, c/f for paints) — see the `tone`
prop on the `Frame` component.

```ts
// photos
a: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)'
b: 'linear-gradient(180deg, #3a4d52 0%, #1a2227 70%, #0a0e10 100%)'
d: 'radial-gradient(100% 60% at 50% 100%, #6a2a2e 0%, #1a0d0e 60%, #08070a 100%)'
e: 'linear-gradient(180deg, #2a2a28 0%, #4a4845 50%, #1a1816 100%)'
g: 'linear-gradient(180deg, #1a1815 0%, #2a2520 50%, #0a0908 100%)'
// paints
c: 'radial-gradient(60% 50% at 50% 60%, #c8332a 0%, #5a1814 60%, #1a0807 100%)'
f: 'linear-gradient(160deg, #c4a76b 0%, #6e5a3a 60%, #2a2316 100%)'
```

### Existing Tailwind colors

The existing `primary` / `secondary` / `lightGray` / `brown` / `yavru`
tokens are **dropped**. Nothing in the new design uses them. If you want
to keep backwards-compat for a transitional period, keep them aliased but
mark them deprecated.

---

## Typography

Two families, both already paid for / free:

```ts
fontFamily: {
  mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],   // body, UI chrome, all labels
  display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'], // only on the wordmark + EXIF card titles
}
```

Load JetBrains Mono (`400, 500, 700`) and Space Grotesk (`400, 500, 700`)
from Google Fonts in `BaseLayout.astro`:

```html
<link
  href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700&family=Space+Grotesk:wght@400;500;700&display=swap"
  rel="stylesheet"
/>
```

### Type scale (px / line-height / letter-spacing)

| Token | Use | Size | LH | LS | Family |
|---|---|---|---|---|---|
| `text-display` | Wordmark in hero (`ercan` / `atak`) | 124 | 0.88 | -0.04em | Space Grotesk 700 |
| `text-h2` | Section titles (EXIF cards) | 26 | 1.1 | -0.02em | Space Grotesk 700 |
| `text-label` | Tagline / section labels | 13 | 1.5 | 0.18em uppercase | JetBrains Mono 400 |
| `text-mono-sm` | Terminal lines, EXIF rows, frame numbers | 11 / 12 | 1.5 / 1.7 | 0.04–0.16em | JetBrains Mono 400 |
| `text-micro` | Stamp text on contact-sheet frames | 9 / 10 | 1.4 | 0.12–0.18em uppercase | JetBrains Mono 400 |

Default body: `font-mono`, `13px`, `line-height: 1.5`, color `paper`.

**No italic display text.** No serifs. Caps + tracked-out monospace
carries hierarchy.

---

## Spacing

The page is built on a **4 px grid**, but practical spacing values used in
the prototype:

```
4  6  8  10  12  14  16  18  22  26  28  32  36  44
```

Page padding: `24px 36px 36px` (top, sides, bottom) at desktop.
Mobile: `16px 16px 24px`.

---

## Borders & radii

- Border color: **always** `#2a2a28` (token `ink-3`).
- Border width: **always 1 px**.
- Border style: **solid** for cards / panels. **Dashed** only for the EXIF
  list separator inside cards.
- **Radius: 0** everywhere. No rounded corners on this site. Period.

---

## Shadows & depth

- No shadows.
- Depth comes from **layered ink colors**: `ink → ink-2 → ink-3 border`.

---

## Cursor

```css
.darkroom-canvas { cursor: crosshair; }
```

A custom red reticle (36 × 36) is overlaid via a fixed-position div
positioned to follow `mousemove` events. See
`snippets/ReticleCursor.svelte`. Hide on:
- `@media (hover: none)`
- `@media (prefers-reduced-motion: reduce)`
- Inside `<a>`, `<button>`, form inputs — switch to the default arrow
  cursor so users know the element is interactive.

---

## Effects

### Grain overlay

A subtle film-grain texture applied at the layout level (so every page
inherits it). Apply as a fixed pseudo-element with `pointer-events: none`
and `mix-blend-mode: overlay`:

```css
body::before {
  content: '';
  position: fixed; inset: 0; z-index: 50; pointer-events: none;
  background-image:
    radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    radial-gradient(rgba(0,0,0,0.40) 1px, transparent 1px);
  background-size: 3px 3px, 4px 4px;
  mix-blend-mode: overlay;
}
```

### Blinking caret

For the terminal column. Use the same keyframes the prototype injects:

```css
@keyframes darkBlink { to { opacity: 0; } }
.darkroom-caret {
  display: inline-block;
  width: 8px; height: 14px;
  background: #d4ff3a;
  vertical-align: -2px;
  animation: darkBlink 1s steps(2) infinite;
}
```

### Sprocket band

Used above and below the contact sheet — pure decoration. Render as 18
`<div>`s of `28 × 12` solid `ink` color, inside an `ink-2` strip with
`padding: 6px 0`, `justify-content: space-between`.

---

## Iconography

**No icon library.** All "icons" in the design are:

- monospace text (`▸`, `●`, `$`, `→`)
- CSS shapes (crosshair lines, sprocket rectangles)
- the safelight red dot in `Navbar`

If you need an icon for accessibility (e.g. mobile menu toggle), use
plain `<svg>` lines, 1 px stroke, color `paper`, stroke-linecap `square`.
No filled icon sets, no Lucide / Heroicons.

---

## Motion

- **Hover scale on contact-sheet frames**: `transform: scale(1.02)`,
  `transition: 200ms cubic-bezier(0.2, 0.8, 0.2, 1)`.
- **Reticle cursor**: `transition: opacity 120ms` only. Position is
  applied immediately (no easing) to keep the crosshair pinned to the
  pointer.
- **Caret blink**: 1 s, 2 steps, infinite.
- **All other transitions**: 150 ms ease default.
- **Respect `prefers-reduced-motion`** — disable hover scale, caret
  blink, and reticle cursor entirely.

---

## Z-index scale

```ts
z: {
  grid:    1,  // contact sheet + sections
  chrome:  10, // navbar
  reticle: 50, // cursor crosshair
  modal:   90, // enlarged frame
}
```

That's all the depth this site needs.
