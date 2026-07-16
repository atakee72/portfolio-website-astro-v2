# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview
Personal portfolio site built with **Astro 5** (static output). Content is local (no external CMS): MDX blog posts and JSON testimonials via Astro Content Collections. Interactivity is handled by four **Svelte 5** islands. Originally migrated from Next.js 14 + Sanity (see git history).

## Development Commands
```bash
pnpm dev          # Astro dev server at http://localhost:4321
pnpm build        # astro check && astro build → dist/
pnpm preview      # Preview production build
pnpm type-check   # astro check (covers .astro, .svelte, .ts)
pnpm lint         # ESLint over .js, .ts, .astro, .svelte
```

Package manager is **pnpm** (lockfile is committed).

## Tech Stack
- **Astro 5** with `output: 'static'` and View Transitions
- **Svelte 5** (runes API) — used for the four interactive islands only
- **`@astrojs/svelte@^7`** — note: `@astrojs/svelte@8+` requires Astro 6, do not upgrade until Astro itself is upgraded
- **Tailwind CSS 3** via `@astrojs/tailwind` with class-based dark mode and `@tailwindcss/typography`
- **MDX** for blog posts (`@astrojs/mdx`)
- **Zod** for content-collection schemas
- **`clsx` + `tailwind-merge`** via `cn()` in `src/lib/utils.ts`
- **TypeScript** strict mode (extends `astro/tsconfigs/strict`)

## Directory Layout
```
src/
├── components/          # .astro server components + 4 .svelte islands
│   ├── *.astro          # Server components (zero JS shipped)
│   ├── LiveClock.svelte
│   ├── MobileMenuBtn.svelte
│   ├── ReachForm.svelte
│   └── ReticleCursor.svelte
├── content/             # Content Collections (defined in config.ts)
│   ├── config.ts        # Zod schemas for blog + testimonials
│   ├── blog/*.mdx       # Blog posts
│   └── testimonials/data.json
├── layouts/
│   ├── BaseLayout.astro      # <html>, dark-mode boot script, ViewTransitions
│   └── BlogPostLayout.astro  # Per-post layout with Navbar
├── lib/
│   ├── content.ts       # getAllBlogPosts, getPostBySlug, getAllTestimonials
│   └── utils.ts         # cn() utility
├── pages/
│   ├── index.astro      # Single-page composition of all sections
│   └── blog/[slug].astro # Static-generated blog post routes
└── styles/globals.css
public/assets/           # Static images (PNG/JPG only — no SVG barrel)
```

## Architecture Notes

### Content Collections
- Defined in `src/content/config.ts` with Zod schemas — schema changes are validated at build time
- Read via helpers in `src/lib/content.ts` (drafts are filtered out in `PROD`, sorted by `publishedAt` desc)
- Add a post: create `src/content/blog/<slug>.mdx` with the required frontmatter — it appears automatically

### Component Pattern: server-first, islands rarely
- Default to `.astro` (zero JS shipped)
- Only use Svelte islands for state that actually needs the browser (localStorage, click handlers, form submission). Currently: `MobileMenuBtn.svelte`, `LiveClock.svelte`, `ReticleCursor.svelte`, `ReachForm.svelte`
- Wire islands in `.astro` files with the right `client:*` directive for their role:
  - `client:only="svelte"` — depends entirely on browser APIs (localStorage, document); SSR adds no value (e.g., `MobileMenuBtn`, `ReticleCursor`)
  - `client:visible` — content-bearing island below the fold; defer hydration until scrolled into view (e.g., `ReachForm`)
  - `client:idle` — non-critical interactivity that can wait until the main thread is idle (e.g., `LiveClock`)
- **`.svelte` imports require the explicit extension** in `.astro` frontmatter

### AppWrap (slot-based wrapper, not an HOC)
`src/components/AppWrap.astro` wraps each section with `SocialMedia` sidebar and `NavigationDots`. Usage:
```astro
<AppWrap id="about">
  <!-- section content -->
</AppWrap>
```

### Navigation (single source of truth)
`src/data/nav.ts` exports the canonical `navItems` array. Four files consume it:
- `Header.astro` — numbered hero nav on the homepage
- `Navbar.astro` — inline nav strip on subpages at `lg+`
- `MobileMenuBtn.svelte` — hamburger overlay (mobile/tablet)
- `404.astro` — recovery destinations

**To add or rename a nav item, edit `src/data/nav.ts` only.** Don't duplicate the array elsewhere.

Anchor hrefs are root-relative (`/#home`, `/#sheet`, etc.) so they work from any subpage — never use bare `#anchor`, it would scroll the current page instead of navigating home.

### Theme system (no external lib)
- Initial theme is decided by an `is:inline` boot script in `BaseLayout.astro` that reads `localStorage.theme` (or `prefers-color-scheme`) and sets the `dark` class on `<html>` **before** hydration → no FOUC
- `ThemeToggleBtn.svelte` reads the current state from the DOM on mount, then toggles `localStorage` + the `dark` class on click

### Tailwind config (`tailwind.config.ts`)
- `darkMode: 'class'`
- Custom colors: `primary` `#edf2f8`, `secondary` `#313bac`, `lightGray` `#e4e4e4`, `brown` `#46364a`, `yavru` `#f38083`
- Custom breakpoints: `xxs` 300px, `xs` 475px
- Custom keyframe `slidein` with delay variants `slidein300/500/700`
- **Content glob includes `.svelte`** — if you add a new file extension that uses Tailwind classes, update the glob or styles get purged

## Gotchas

- **Do not import `react-icons` (or any React component) into `.astro` templates** — there is no React in this project, and even if there were, `react-icons` triggers SSR hook-call warnings. Inline SVGs instead (see how `SocialMedia.astro` does it).
- **Two unused leftovers were removed during the Astro migration**: any reference to `public/assets/index.js`, `next-themes`, or `react-magic-motion` is stale.
- **Tailwind arbitrary-value classes with CSS variables work** (e.g., `text-[var(--brand)]`). Used in `SocialMedia.astro` for per-icon hover colors.
- **`CloudPhoto.astro` lays a transparent anti-download overlay at `z-10`** over every image. ANY interactive element positioned over a `CloudPhoto` (lightbox close/copy/prev/next, detail-page arrows, caption-row links) MUST be `z-20+` or its clicks get eaten silently — the overlay wins the hit-test and nothing happens, no error. This bit twice: the lens lightbox and the paints detail page (arrows shipped at `z-[3]` → dead mouse clicks while keyboard nav worked).
- **JS-driven navigation must route through the View Transitions router.** `window.location.href = url` forces a full page load; call the target anchor's `.click()` (or `navigate()` from `astro:transitions/client`) instead. Bit the keyboard arrow nav on both lens photo pages and paints detail pages. The paints detail image frame carries `transition:name="painting-frame"` so prev/next morphs in place.
- **Cloudinary text overlays only support a fixed set of fonts** (Arial, Courier, Times, Verdana, Helvetica, Georgia, etc.). Custom fonts like "JetBrains Mono" return HTTP 400 with `x-cld-error: Unsupported font family ...` and a broken-image GIF. The watermark in `CloudPhoto.astro` uses `Courier`. To debug image issues fast: `curl -I` the Cloudinary URL and check headers.
- **Sveltia commits straight to GitHub via API** — it never touches your local working tree. **Always `git pull` before editing files Sveltia might have edited** (`src/content/blog/*.mdx`, `src/content/rolls/*.json`) to avoid diverging streams.
- **Contact-sheet cells auto-resolve content links.** In `src/data/contactSheet.ts`: photo cells with `slug: 'my-roll'` resolve to that roll's cover + "see full roll →" lightbox CTA; paint cells with `album: '<album-slug>'` resolve to that album's cover + "view album →" CTA (or `painting: '<id>'` for a single work + "view painting →"; album wins if both); `link` cells show a static image and open the lightbox with an intro `note` + external CTA (`cta`, new tab) — they never tab-hijack on click (used for the website-museum tile). Cells without any of these keep their placeholder gradient. On mobile (no lightbox), cells tap-navigate directly; external hrefs open in a new tab.

## Common Tasks

### Add a blog post
Create `src/content/blog/<slug>.mdx` with frontmatter matching the schema in `src/content/config.ts` (`title`, `description`, `publishedAt`, `author`, `mainImage`, `categories`, `draft`).

### Add a new section to the home page
1. Create `src/components/NewSection.astro` (wrap in `<AppWrap id="...">` if it should be a navigable section)
2. Import and render it in `src/pages/index.astro`
3. Add an entry to `navItems` in `src/data/nav.ts` — it flows to all four consumers (Header, Navbar, MobileMenuBtn, 404) automatically

### Modify theme colors
Edit `theme.extend.colors` in `tailwind.config.ts`.

### Update site URL (for sitemap/canonical)
Edit `site:` in `astro.config.mjs`.

### RSS feed
Combined feed at `/rss.xml` spans all four collections (blog, work, lens, paints), sorted by date desc. Generated at build time by `src/pages/rss.xml.ts` using `@astrojs/rss`. Summary-only — uses each collection's `description`/`subtitle`/equivalent, not full MDX body. Surfaced via `<link rel="alternate">` in `BaseLayout.astro` and a visible `rss` link in `Footer.astro`. To change scope or per-collection mapping, edit that one file.

## Testing
No tests configured. The build pipeline runs `astro check` (covers type errors across `.astro`, `.svelte`, `.ts`) before producing output.

## Secret scanning (gitleaks)

Two layers, both run automatically:

- **Pre-commit hook** (`.husky/pre-commit`) — scans staged diffs via `gitleaks protect --staged`. Warns instead of blocking if gitleaks isn't installed locally, so collaborators without it can still commit (CI is the safety net).
- **GitHub Actions** (`.github/workflows/gitleaks.yml`) — runs `gitleaks-action@v2` on every push to `main` and every PR. Scans full history (`fetch-depth: 0`). Free for public repos.

`.gitleaksignore` (empty by default) accepts entries like `<commit-sha>:<file>:<rule-id>:<line>` for explicitly allowlisted historical findings.

Install gitleaks locally (WSL/Linux):
```bash
mkdir -p ~/.local/bin
curl -sSfL https://github.com/gitleaks/gitleaks/releases/latest/download/gitleaks_*_linux_x64.tar.gz \
  | tar -xz -C ~/.local/bin gitleaks
chmod +x ~/.local/bin/gitleaks
```

Or just download from https://github.com/gitleaks/gitleaks/releases/latest and drop into `~/.local/bin/`. The hook's lookup order is PATH → `~/.local/bin/` → `/usr/local/bin/` → `/opt/homebrew/bin/`.

If you ever need to bypass the hook (rare — usually means rotating the secret instead): `git commit --no-verify` skips pre-commit. **CI still catches it on push, so don't `--no-verify` without a follow-up plan.**

## Homepage composition (curated caps)

The homepage (`src/pages/index.astro`) deliberately caps each section to keep the page from growing unboundedly as content lands:

- **Contact sheet** (`ContactSheet.astro`) — **hardcoded 9 cells** in `src/data/contactSheet.ts`. Curated highlight area, not a feed. Current composition: 3 photo + 2 paint (both showing album covers) + 3 code + 1 link (website-museum tile). Photo cells take `slug: '<roll>'`, paint cells take `album: '<slug>'` (or `painting: '<id>'` for a single work) — all auto-resolve cover images and add lightbox CTAs.
- **Blog** — capped at **6 most recent** posts (`BLOG_HOME_CAP` in `index.astro`). Overflow goes to `/blog/index.astro`. Signpost link "see all entries →" appears in the section header only when there's actual overflow (`hasMore` prop).
- **Work** — capped at **6** projects (`HOME_CAP` in `ExifWork.astro`). Overflow goes to `/work/index.astro`. Same signpost pattern.

`ProjectCard.astro` is shared between the homepage `<ExifWork>` and the `/work` overflow page so the card markup stays DRY.

## Photography & blog pipeline (Sveltia CMS + Cloudinary)

Content lives in `src/content/blog/*.mdx` and `src/content/rolls/*.json`, validated by Zod schemas in `src/content/config.ts`. Photos themselves are stored in Cloudinary. Publishing happens through Sveltia CMS at `/photojockeysblog/` — a static HTML page served from `public/`.

### Env vars
Copy `.env.example` to `.env.local` (gitignored):

- `PUBLIC_CLOUDINARY_CLOUD_NAME` — required for `<CldImage>` and the Sveltia media-library widget.
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — used by `scripts/sync-exif.mjs` at build time to pull EXIF for each photo from Cloudinary's Admin API.

On Vercel, all three must be set on **Production, Preview, and Development** so the build pipeline can fetch EXIF.

### Publishing via Sveltia (primary workflow)

1. Open `https://<your-site>/photojockeysblog/` (also `/photojockeysblog/` in dev at `http://localhost:4321`).
2. First time: click "Sign In with Token". Sveltia opens a dialog linking to GitHub's fine-grained PAT page with the correct scopes pre-selected (repo `atakee72/portfolio-website-astro-v2`, **Contents: Read and write**). Paste the PAT. It's stored in browser localStorage. **Renew every 90 days.**
3. Pick a collection (Blog or Photography Rolls) → click "+ New".
4. Fill the form. For images (mainImage on blog, cover/photos on rolls), click the image field → Cloudinary media library opens inline. Drag-drop JPEGs (web-sized ≤ 2000 px). Sveltia stores just the Cloudinary public_id (e.g. `lens/<slug>/01`).
5. Click **Save & Publish**. Sveltia commits the JSON/MDX to GitHub. Vercel auto-rebuilds. Live in ~2 min.
6. EXIF appears automatically — `scripts/sync-exif.mjs` runs as part of the build, fetches metadata from Cloudinary for any new photos, caches it in `.astro/exif-cache.json` (gitignored), and the rolls helper merges it at render time.

Notes:
- You need to be **logged into cloudinary.com in the same browser session** for the media library to authenticate.
- The MDX body uses a Markdown editor (Sveltia has a WYSIWYG + raw toggle). For JSX components in posts, switch to raw mode.
- "Save (Draft)" commits with `draft: true`. Drafts are filtered out in production but visible in `pnpm dev`.

### Batch upload via script (for rolls > 5 photos)

Sveltia's drag-drop is fine for 1–3 photos but tedious at 20–40. The
`pnpm prep` script handles the bulk path:

```bash
pnpm prep <roll-slug> <folder-of-jpegs> [--force]
# e.g.
pnpm prep tempelhof "/mnt/c/Users/Ercan/Pictures/scans/2026-05"
```

What it does:
1. Reads every JPEG in the folder (top-level only, alphabetical).
2. Resizes each to 2000 px long edge, JPEG q=80, **keeps EXIF** (so
   `sync-exif.mjs` can fetch it from Cloudinary at build time).
3. Uploads to Cloudinary at `lens/<slug>/NN` (zero-padded).
4. Writes `src/content/rolls/<slug>.json` with `draft: true` and
   blank title/location/alts — for Sveltia to fill in.

Then: `git commit && git push` the JSON → refresh Sveltia →
the draft roll appears in the Rolls collection → fill text fields →
Save & Publish.

The script requires `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` in
`.env.local` (loaded via Node 22's `--env-file` flag). Re-running for
the same slug refuses unless `--force` is passed.

### Manual fallback workflow (still supported)

If Sveltia is unavailable or you prefer terminal:
1. Hand-edit `src/content/blog/<slug>.mdx` or `src/content/rolls/<slug>.json` directly.
2. Upload photos to Cloudinary via dashboard or `cld uploader upload <file> -o public_id=lens/<slug>/01`.
3. Optional: set `slug: '<roll-slug>'` on a matching `contactSheet.ts` photo entry so the homepage cell links to the roll.
4. `git commit && git push`. Vercel deploys.

### Schema sync — important when adding fields

The Sveltia form is defined by `public/photojockeysblog/config.yml`. The Astro validation schema is `src/content/config.ts` (Zod). **When you add or rename a field, you must update both files.** A field present in one but not the other causes either a hidden CMS form (YAML missing) or a build failure (Zod missing).

Why two schemas? `astro-decap-collection` (the codegen that'd remove the duplication) currently demands Astro 6 + Zod 4 and has a packaging bug (its `yaml` dep is listed as devDependency). When it stabilizes for Astro 5, this manual sync can be replaced by codegen. Until then, the duplication tax is ~5 min when a field changes (rare).

### Watermark
Inline `l_text:` overlay applied by `src/components/CloudPhoto.astro` — © ATAK in **Courier** bold 40px, white 70% opacity, bottom-right with 32px padding. **Courier (not JetBrains Mono)** — Cloudinary only supports a fixed set of fonts for text overlays; custom fonts return HTTP 400. To change, edit the `overlays` array in that one file.

### EXIF stripping on delivery
`CloudPhoto.astro` passes `rawTransformations={['fl_strip_profile']}` so every served JPEG has its metadata block stripped — GPS, camera serial, software fingerprints, everything. Captions on the page still read full EXIF because `sync-exif.mjs` pulls it from Cloudinary's stored original via the Admin API (which `fl_strip_profile` doesn't affect). Best of both: rich captions, naked downloads.

This requires `scripts/prep-and-upload.mjs` to call sharp's `.keepMetadata()` during resize — otherwise EXIF is stripped at upload time and the Admin API returns nothing, leaving captions blank.

### Hot-link protection (Cloudinary console)
Setting menu drifts; current path is something like Settings → Security → "Restricted media types" / "Allowed strict referrals". Adding the Vercel domain restricts where image transforms render — but it also breaks Slack/Twitter og:image previews (their crawlers send their own referrer). Two options, decide per account:

- **Open hot-linking** (default for personal portfolios): leave the restriction off. Watermark + 2000 px ceiling are the real defenses.
- **Strict referrer**: add `developer-portefeuille…vercel.app` plus social-crawler referrers (`slackb.com`, `twitter.com`, `x.com`, `linkedin.com`) — list drifts.

### Anti-download chrome
`CloudPhoto.astro` enforces `oncontextmenu="return false"`, `draggable="false"`, and a transparent overlay so the inner `<img>` is never the click target. Theater, not protection — DevTools still wins. Real protection = watermark + web-sized ceiling.

### Sveltia CMS — operational notes
- Version pinned to `@sveltia/cms@0.170.9` in `public/photojockeysblog/index.html`. Bump deliberately after reviewing release notes. (0.160.1→0.170.9 on 2026-07-14: Cloudinary auth was broken upstream before 0.165.2 and 0.170.9 — sveltia-cms issues #781/#823 — plus an XSS fix in 0.167.3.)
- The `/photojockeysblog/` path is intentionally obscure (replaces conventional `/admin/`) to cut bot probes. **Not** listed in `robots.txt` — the page itself emits `<meta name="robots" content="noindex,nofollow,noarchive">` instead.
- Real security still comes from the PAT, not URL obscurity.
- Cloudinary `api_key` is exposed in `config.yml` by design — per Decap CMS docs it's safe to publish. Only `api_secret` (used by `sync-exif.mjs` server-side) must stay private.

## Paintings pipeline (albums)

**One JSON per album** — same shape as photography rolls: `src/content/paintings/<album-slug>.json` holds album metadata (title, years, dimensions, description; `cover` is an OPTIONAL override — the album card defaults to the first painting's image so the cover is always viewable inside the album) plus a `paintings` array, one item per work (`id`, title, year, medium, subjects, image, tags). The array order IS the display and prev/next order — curated, reorder by dragging in Sveltia. Zod schema in `config.ts`, Sveltia form in `config.yml` — keep both in sync. Images are Cloudinary `paints/<painting-id>` public IDs, rendered through `CloudPhoto` (watermark + EXIF-strip apply). There is no separate registry file and no `series` field — the album file is the grouping (restructured 2026-07-14; before that, one JSON per painting + `src/data/paintAlbums.ts` registry keyed by `series`).

- **Routes**: `/paints` (album cards) → `/paints/<album>` (gallery + year/subject/medium filters + **in-page lightbox** like lens rolls: arrows swap paintings in the overlay, no navigation; mobile taps go to the detail page) → `/paints/<album>/<painting-id>` (detail permalink; prev/next cycles within the album; frame morphs via `transition:name="painting-frame"`). `<album>` = the JSON filename, `<painting-id>` = the item's `id` field — **never change an `id` after publishing** (breaks URLs, RSS, contact-sheet links).
- **The lightbox wiring script lives ONLY in `EnlargedFrame.astro`** (one delegated `document` handler, `__enlargeWired` guard). Pages must NOT ship their own copy — ContactSheet and lens/[slug] used to, and whichever page loaded first won (the ContactSheet variant had no arrow nav → dead arrows on roll pages after visiting the homepage). Triggers carry `data-enlarge-target` (modal id) + optional `data-permalink` (mobile tap target). Arrow nav cycles only *visible* triggers (`offsetParent !== null`), so filter strips constrain it.
- **cldPath fields are normalized by a Zod transform** in `config.ts` (rolls + paintings): full Cloudinary delivery URLs and extension-suffixed values are stripped to bare public_ids. Paired with `output_filename_only: false` in the Sveltia config so widget-picked images keep their folder path (filename-only mode silently drops `paints/`/`lens/` folders → 404s — bit us 2026-07-14).
- **Adding paintings — two paths**:
  1. **Sveltia** (Painting Albums collection) — open the album entry, add an item to the Paintings list, pick the image via the Cloudinary widget (works since the 0.170.9 bump; if it fails, suspect Firefox tracking protection). New album = "+ New" in the same collection.
  2. **Direct** — upload images via Cloudinary console (or API), then edit the album JSON by hand/Claude. The Admin API creds in `.env.local` allow listing/renaming: rename Instagram-noise filenames to clean `paints/<id>` public IDs before writing entries (see git history: `rename-paints.mjs` pattern — signed POST to `/image/rename`).
- Two contact-sheet paint cells show album covers via `album: '<slug>'` (cover resolves with the same first-painting fallback); `painting: '<id>'` still works for single-work cells.

## Domain & email

Production: **https://ercan-atak.de** (apex canonical; `www` 308-redirects to apex via `vercel.json`).

- **Registrar:** Porkbun. **DNS host:** Cloudflare (zone, DNS-only / gray cloud — never proxy records that point to Vercel; the two CDNs conflict on TLS). **Hosting:** Vercel (project `developer-portefeuille-of-ercan-atak`).
- **DNS records to know:** `CNAME @ → cname.vercel-dns.com` (Cloudflare flattens at apex), `CNAME www → cname.vercel-dns.com`. Both DNS-only.
- **Email hosting:** mailbox.org (Heinlein Support GmbH, Berlin) on the Standard plan (€3/mo). EU-hosted, no third-country transfer — chosen for DSGVO alignment. One inbox (`atakee@mailbox.org`) receives all domain mail via aliases:
  - `mail@ercan-atak.de` — **canonical public address** (surfaced in About / legal pages / JSON-LD)
  - `contact@ercan-atak.de` — reserved for ReachForm delivery target if switched
  - `info@ercan-atak.de` — backward-compat for old contacts
  - `ercan@`, `press@` — reserved identities
  - No catch-all (spam magnet). All aliases route to the same inbox.
- **Mail DNS records:** MX → `mxext1..4.mailbox.org` (priority 10, all equal); SPF → `v=spf1 include:mailbox.org ~all`; DKIM → 4× `MBO0001..4._domainkey` CNAMEs → `MBO000n._domainkey.mailbox.org.`; DMARC → `v=DMARC1; p=none; rua=mailto:mail@ercan-atak.de` (start soft, tighten to `quarantine` after a few weeks of clean reports).
- **Legacy Cloudflare Email Routing (retired 2026-07-12):** previously forwarded `info@` / `contact@` → `atakee+portfolio@gmail.com`. Retired because Yahoo `p=reject` senders bounced through the forward (Gmail refused the ARC-sealed forward). Rules are still saved in the Cloudflare dashboard but the whole service is *disabled* (`status: unconfigured`) — one-call rollback if ever needed. Do NOT re-enable while mailbox.org MX is live; the two conflict.
- **Form** (`<ReachForm>`) posts to Web3Forms with an inlined per-form `access_key` (see `src/components/ReachForm.svelte` — public by design per Web3Forms docs, gitleaks-ignored). The Web3Forms account still delivers to `atakee+portfolio@gmail.com` (unchanged by the mailbox.org migration). To route form submissions to the new inbox instead, change the delivery target in the Web3Forms dashboard to `contact@ercan-atak.de` — one Gmail filter no longer needed once done.

## Legal & compliance (DSGVO / DDG)

The site is operated from Germany under a real name → triggers Impressumspflicht (DDG, the 2024 successor to TMG) and Datenschutzerklärung (DSGVO). Both pages exist; both are surfaced from the footer alongside the rss link.

- **`/impressum`** — `src/pages/impressum.astro`. § 5 DDG required fields + § 18 (2) MStV + standard liability/copyright boilerplate. Bilingual (DE block, then `<hr>`, then EN block).
- **`/datenschutz`** — `src/pages/datenschutz.astro`. Bilingual, processor-specific (Vercel, Web3Forms, mailbox.org, Cloudinary, GoatCounter). Covers data flows, legal bases (Art. 6 DSGVO), DPF/SCC posture, data-subject rights (Art. 15–22), and right to complain (Art. 77 → BlnBDI Berlin). Section 4 was rewritten 2026-07-12 when the site moved from Cloudflare Email Routing (US) to mailbox.org (Berlin/EU) — the section now describes an EU processor with no Drittstaatentransfer.
- **Address on Impressum** is the user's full street + house number per strict § 5 DDG (`ladungsfähige Anschrift`). Privacy exposure is mitigated three ways: (1) read from `IMPRESSUM_STREET` env var at build time (set in `.env.local` for dev + Vercel dashboard for prod — **never** committed to the public repo); (2) char-code-encoded in `data-c` by `<ObfuscatedText>` so it's not in static HTML either; (3) the whole page is `noindex` + sitemap-excluded + `robots.txt`-disallowed. To change the address: update `IMPRESSUM_STREET` in Vercel dashboard (use UI, not CLI — see [[feedback_vercel_env_rebuild]]) and `.env.local`. Postal code + city (`12049 Berlin`) stay hardcoded in `src/pages/impressum.astro` (not sensitive; already in /datenschutz, DPA references, etc.).
- **Email + address obfuscation (scraper-safety pass)**: `src/components/ObfuscatedEmail.astro` (clickable `<a>` → `mailto:`) and `src/components/ObfuscatedText.astro` (`<span>` for multi-line text). Both encode the prop value as comma-joined char codes in data attributes; the decoder lives as an inline `<script is:inline>` in `BaseLayout.astro` that runs on `astro:page-load`. Defeats bulk regex/curl scrapers — the literal email + street never appear in static HTML. **Use these whenever you'd otherwise write a `mailto:` link or a PII string.** Do NOT add raw email strings back to JSON-LD, OG tags, or content collections. The inline `onclick="return this.dataset.done==='1'"` on `ObfuscatedEmail` is a race-condition guard that will need to migrate to an event listener when CSP is implemented (filed under deferred items).
- **Legal pages are noindex + sitemap-excluded + robots-disallowed** — `/impressum` and `/datenschutz` are `noindex,nofollow,noarchive` via the `BaseLayout` prop; `astro.config.mjs` `sitemap({ filter })` keeps them out of `sitemap-0.xml`; `public/robots.txt` has explicit `Disallow:` entries. Three layers of belt-and-suspenders against well-behaved crawlers.
- **Security headers via `vercel.json`** — sitewide HTTP headers live under the `headers` array in `vercel.json`, not in `BaseLayout` meta tags. Currently set: `Referrer-Policy: strict-origin-when-cross-origin` (strips path from referer sent to third parties like Cloudinary, GoatCounter), `X-Content-Type-Options: nosniff` (blocks MIME-sniffing attacks), `X-Frame-Options: DENY` (blocks all iframe embedding — clickjacking defense; the site never needs to be iframed). When adding more (CSP, Permissions-Policy, etc.), append to the same `headers` block with the same `"source": "/(.*)"` matcher. CSP is deliberately deferred — see [[csp-deferred]] for why and the rough implementation shape when it's time.
- **No cookie banner** — the site is genuinely cookie-free. GoatCounter is the only telemetry, and its cookieless hashed-IP + daily-rotating-salt design falls outside § 25 TDDDG. LocalStorage is used only for the theme toggle (functional). Don't add a banner; it would hurt UX with zero legal upside.
- **Fonts are self-hosted** via `@fontsource/jetbrains-mono` + `@fontsource/space-grotesk` (weights 400 + 700). Imports live at the top of `src/styles/globals.css`. **Do NOT re-introduce `fonts.googleapis.com`** — LG München I 3 O 17493/20 (2022, still cited) treats Google-Fonts-via-CDN as an unconsented IP transfer to the US, and opportunistic claimants still send €100/pageview letters. If you need a new font weight, add another `@fontsource/<family>/<weight>.css` import — never the Google CDN link.
- **Updating the DSE when a processor changes**: edit only `src/pages/datenschutz.astro`. Sections are processor-aligned, so swapping (e.g.) Web3Forms for Resend is one section's edit + the matching EN block.
- **CMS forms** for Impressum/DSE are not wired in Sveltia. These are rarely-edited code pages, not content; if you do want to manage them via Sveltia later, add a `legal` collection and matching `config.yml` form.

## Analytics

**Provider**: GoatCounter (hosted free tier — AGPL, EU-hosted by maintainer). Privacy-respecting, cookieless, no PII. Account: `atakee@goatcounter.com`, username `contact@ercan-atak.de`.

**Dashboard URLs** (both work, same data):
- `https://atakee.goatcounter.com` — canonical
- `https://stats.ercan-atak.de` — custom-domain alias (CNAME in Cloudflare DNS, gray cloud only)

**Tracking script** lives in `src/layouts/BaseLayout.astro` `<head>`. Two important quirks:

1. **View Transitions compatibility.** Standard GoatCounter snippet only counts on initial page load — Astro's View Transitions don't re-execute scripts on navigation. Solution: set `no_onload: true` on the script and add an `astro:page-load` listener that calls `window.goatcounter.count()`. The listener fires on initial load AND every subsequent navigation, so every page is counted exactly once.
2. **`count.js` is gc.zgo.at-only.** The beacon endpoint `/count` works on the custom domain (`stats.ercan-atak.de/count`), but `count.js` itself is only served from `gc.zgo.at` — GoatCounter doesn't serve the JS asset from per-customer subdomains. Keep `src="https://gc.zgo.at/count.js"`; only `data-goatcounter` uses the custom domain.

**Custom domain truth**: per GoatCounter's own UI, the custom domain is **vanity only** — it does NOT bypass ad-blockers (modern blockers fingerprint `count.js` content, not just hostname). The benefit is cosmetic (page source references `stats.ercan-atak.de` instead of `atakee.goatcounter.com`).

**Localhost auto-ignored**: `pnpm dev` traffic doesn't pollute stats by default.

**To change provider or disable**: edit the two `<script>` blocks in `BaseLayout.astro`. No other code references analytics.

**Footer visitor counter** (`src/components/Footer.astro`): fetches `count_unique` from `https://stats.ercan-atak.de/counter/TOTAL.json` eagerly on `astro:page-load` (memoised across navigations), but the **cascade reveal only fires on viewport intersection** — the footer is below the fold on most pages, so animating on page-load would be wasted. The reveal sequence: 600ms dot-beat (`·······` placeholder) → split-flap cascade left-to-right across 7 per-digit slots. **Hover replays the cascade.** **Includes a deliberate `+1337` offset and 7-digit zero-padding** — a '90s hit-counter nostalgia wink, not a metrics bug.

The script uses `AbortController` aborted on `astro:before-swap` to release the IntersectionObserver + hover listener cleanly between View Transition navigations (prevents the listener-leak pattern Astro docs warn about). To change/tune/disable any of this, edit the inline `<script>` at the bottom of `Footer.astro`.

**Live copyright year**: `<span data-year>` is server-rendered with the build-time year as fallback, then overwritten client-side on each `astro:page-load`. Means the year ticks over without requiring a rebuild — Vercel doesn't have to redeploy on Jan 1 for the footer to update.
- **Where things live:**
  - DNS records → **Cloudflare dashboard** (not in source; can be edited via Cloudflare API too — I have MCP access)
  - Mailbox aliases / inbox settings → **mailbox.org admin** at `office.mailbox.org` (not in source; user-only, needs the mailbox.org login)
  - SSL + domain attachment → **Vercel dashboard** or `vercel domains` CLI
  - `www → apex` redirect → `vercel.json` `redirects` rule with `has: host` matcher (source-controlled)
  - Sitemap / canonical URLs / og:url → `astro.config.mjs` `site:` field
  - Surfaced `mail@` mailto in the UI → `About.astro` (under `$ reach`), `impressum.astro`, `datenschutz.astro`, and JSON-LD `Person` schema in `BaseLayout.astro` — always via `<ObfuscatedEmail user="mail" domain="ercan-atak.de" />`, never a raw string
