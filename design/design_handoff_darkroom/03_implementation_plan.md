# Implementation plan — 8 PRs

Suggested rollout. Each PR is reviewable in isolation, builds on the
previous, and ships green. **Run `pnpm build` between every step.**

---

## PR 1 · Tokens + base layer

**Files touched:**

- `tailwind.config.ts` — replace with `reference/tailwind.config.darkroom.ts`
- `src/styles/globals.css` — merge changes from `snippets/globals.css`
- `src/layouts/BaseLayout.astro`:
  - Add Google Fonts link (`JetBrains Mono`, `Space Grotesk`).
  - Default theme: `'dark'`. Update the `theme` IIFE to default `'dark'`
    when `localStorage` is empty and `prefers-color-scheme` is unknown.
  - Add the body grain overlay (see `01_design_tokens.md § Grain`).

**Acceptance:** site still renders existing layout but with dark
background, mono body font, and a faint grain. Existing colors look
broken (they reference `primary`/`secondary` which we removed) — that
is expected and will be fixed in subsequent PRs.

---

## PR 2 · Navbar → Terminal status bar

**Files touched:**

- `src/components/Navbar.astro` — replace with `snippets/Navbar.astro`.
- `src/components/LiveClock.svelte` — NEW, see `snippets/LiveClock.svelte`.
- `src/components/MobileMenuBtn.svelte` — restyle (1 px square button,
  paper-on-ink, opens a fullscreen `ink-2` panel with the nav numbers
  from the hero column).

**Acceptance:** status bar reads exactly as in `02_screen_specs.md § 2`.
Clock updates every minute. Mobile menu opens / closes.

---

## PR 3 · Header → Hero with terminal column

**Files touched:**

- `src/components/Header.astro` — replace with `snippets/Header.astro`.
  Remove the `<MyAccordion />` import; the sphere div is gone.
- `src/components/TerminalFeed.astro` — NEW, see `snippets/TerminalFeed.astro`.
- `src/lib/content.ts` — confirm `getAllBlogPosts()` returns posts sorted
  newest-first.

**Acceptance:** hero matches `02_screen_specs.md § 3`. Latest three blog
posts surface in the terminal column. Caret blinks.

---

## PR 4 · ContactSheet (replaces MyAccordion)

**Files touched:**

- `src/components/MyAccordion.astro` — **delete**.
- `src/components/ContactSheet.astro` — NEW, see `snippets/ContactSheet.astro`.
- `src/components/SprocketRow.astro` — NEW.
- `src/data/contactSheet.ts` — NEW, seed array from
  `02_screen_specs.md § 5`.
- Wire into `Header.astro` (below the hero columns) **or** keep it in
  its own `<AppWrap id="sheet">` section. The prototype shows it under
  the hero in the same scroll; preserve that.

**Acceptance:** 3 × 3 grid renders, hover scales, click enlarges via
view-transitions. Sprocket rows render above and below.

---

## PR 5 · Reticle cursor (Svelte)

**Files touched:**

- `src/components/ReticleCursor.svelte` — NEW, see
  `snippets/ReticleCursor.svelte`.
- Mount in `BaseLayout.astro` with `client:idle`.

**Acceptance:** on desktop hover, a 36 × 36 red crosshair follows the
pointer. Disables on touch and `prefers-reduced-motion`. Inside `<a>` /
`<button>` / form inputs, switches back to the default arrow.

---

## PR 6 · EXIF work cards

**Files touched:**

- `src/data/projects.ts` — NEW, seeded from the existing
  `MyAccordion.astro` data.
- `src/components/ExifWork.astro` — NEW, see `snippets/ExifWork.astro`.
- `src/components/Work.astro` — replace the placeholder import with
  `<ExifWork />`.

**Acceptance:** three cards render the three real projects. Frame
indices `01/03 .. 03/03`. Each card links to the project URL in a new
tab (preserving `rel="noopener noreferrer"`).

---

## PR 7 · Blog cards

**Files touched:**

- `src/components/Blog.astro` — keep imports, switch grid from
  `columns-*` to `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3`.
  Drop the white/20 outer card and the "More" pill.
- `src/components/BlogPostCard.astro` — replace with
  `snippets/BlogPostCard.astro`.

**Acceptance:** every post renders as a negative-style card with
sprocket band, category tag, title, excerpt, date/read time, and a
phosphor `read →` link.

---

## PR 8 · Footer + cleanup

**Files touched:**

- `src/components/Footer.astro` — replace with `snippets/Footer.astro`.
- `src/components/Testimonials.astro` — leave file in place, hide its
  mount in `src/pages/index.astro` behind `FEATURES.SHOW_TESTIMONIALS`.
- `src/lib/config.ts` — NEW, see snippet.
- Delete unused: `NavigationDots.astro` (the nav numbers are now in the
  hero row; nav dots no longer apply).
- Run `pnpm lint && pnpm build`.

**Acceptance:** clean build. Lighthouse a11y ≥ 95. No console errors.
No references to dropped Tailwind tokens (`primary`, `secondary`,
`lightGray`, `brown`, `yavru`).

---

## Stretch / out of scope for v1

These are deliberately excluded; ship without them and revisit.

- **Light theme variant** — wire `ThemeToggleBtn.svelte` to a paler
  inversion (paper cream bg, ink text, safelight red stays). Defer
  until v1 ships.
- **Painting + Photography gallery pages** — Ercan plans these but they
  are not on the live site yet. The contact sheet acts as the
  placeholder.
- **CMS for the contact-sheet data** — for now `src/data/contactSheet.ts`
  is hand-authored. Could be promoted to its own MDX collection later.
- **Real photo / painting JPGs** — placeholders only. Swap once Ercan
  provides real assets.

---

## How to QA visually

The fastest visual check is to open
`reference/darkroom-preview.html` side by side with your dev server
(`pnpm dev`). The prototype is rendered at exactly 1320 px wide; size
your browser to match for an apples-to-apples comparison.

If something in the prototype is ambiguous, the prototype is
authoritative. The token spec and screen spec describe the prototype;
they are not an alternative truth.
