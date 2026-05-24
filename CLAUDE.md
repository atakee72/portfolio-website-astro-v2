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
- **`CloudPhoto.astro` lays a transparent anti-download overlay at `z-10`** over every image. Anything interactive that sits inside `.frame` in the lightbox (close button, copy-link, prev/next, caption row with "see full roll →" link) MUST be `z-20+` or its clicks get eaten silently. Same trap on contact-sheet cells if you ever add an interactive child to the photo button.
- **Cloudinary text overlays only support a fixed set of fonts** (Arial, Courier, Times, Verdana, Helvetica, Georgia, etc.). Custom fonts like "JetBrains Mono" return HTTP 400 with `x-cld-error: Unsupported font family ...` and a broken-image GIF. The watermark in `CloudPhoto.astro` uses `Courier`. To debug image issues fast: `curl -I` the Cloudinary URL and check headers.
- **Sveltia commits straight to GitHub via API** — it never touches your local working tree. **Always `git pull` before editing files Sveltia might have edited** (`src/content/blog/*.mdx`, `src/content/rolls/*.json`) to avoid diverging streams.
- **Contact-sheet cells auto-resolve `slug` to roll cover.** Set `slug: 'my-roll'` on a photo cell in `src/data/contactSheet.ts` and `ContactSheet.astro` looks up the matching `src/content/rolls/<slug>.json`, renders the cover via `<CloudPhoto>`, and surfaces a "see full roll →" CTA in the lightbox. Cells without a slug keep their placeholder gradient.

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

- **Contact sheet** (`ContactSheet.astro`) — **hardcoded 9 cells** in `src/data/contactSheet.ts`. Curated highlight area, not a feed. Composition: 5 photo + 2 paint + 2 code (current; one photo cell was swapped to code for the RUNES card). Set `slug: '<roll>'` on a photo cell to auto-resolve to that roll's cover image and add a "see full roll →" CTA in the lightbox.
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
- Version pinned to `@sveltia/cms@0.160.1` in `public/photojockeysblog/index.html`. Bump deliberately after reviewing release notes.
- The `/photojockeysblog/` path is intentionally obscure (replaces conventional `/admin/`) to cut bot probes. **Not** listed in `robots.txt` — the page itself emits `<meta name="robots" content="noindex,nofollow,noarchive">` instead.
- Real security still comes from the PAT, not URL obscurity.
- Cloudinary `api_key` is exposed in `config.yml` by design — per Decap CMS docs it's safe to publish. Only `api_secret` (used by `sync-exif.mjs` server-side) must stay private.

## Domain & email

Production: **https://ercan-atak.de** (apex canonical; `www` 308-redirects to apex via `vercel.json`).

- **Registrar:** Porkbun. **DNS host:** Cloudflare (zone, DNS-only / gray cloud — never proxy records that point to Vercel; the two CDNs conflict on TLS). **Hosting:** Vercel (project `developer-portefeuille-of-ercan-atak`).
- **DNS records to know:** `CNAME @ → cname.vercel-dns.com` (Cloudflare flattens at apex), `CNAME www → cname.vercel-dns.com`. Both DNS-only.
- **Email** via Cloudflare Email Routing (free):
  - `contact@ercan-atak.de` → `atakee+portfolio@gmail.com`
  - `info@ercan-atak.de` → `atakee+portfolio@gmail.com`
  - Catch-all: **Drop** (silent — kills spam to `admin@`, `webmaster@`, etc.; legit typos also drop)
  - SPF + DKIM auto-added by Cloudflare (don't edit manually).
- **Form** (`<ReachForm>`) posts to Web3Forms with an inlined per-form `access_key` (see `src/components/ReachForm.svelte` — public by design per Web3Forms docs, gitleaks-ignored). The Web3Forms account is set to deliver to `atakee+portfolio@gmail.com`, so both form submissions AND direct emails land at the same Gmail sub-address. One Gmail filter (`to:atakee+portfolio@gmail.com`) catches both.

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
- **Where things live:**
  - DNS records, MX, email routing rules → **Cloudflare dashboard** (not in source)
  - SSL + domain attachment → **Vercel dashboard** or `vercel domains` CLI
  - `www → apex` redirect → `vercel.json` `redirects` rule with `has: host` matcher (source-controlled)
  - Sitemap / canonical URLs / og:url → `astro.config.mjs` `site:` field
  - Surfaced `contact@` mailto in the UI → `About.astro` (under `$ reach`), `Footer.astro`, and JSON-LD `Person` schema in `BaseLayout.astro`
