# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview
Personal portfolio site built with **Astro 5** (static output). Content is local (no external CMS): MDX blog posts and JSON testimonials via Astro Content Collections. Interactivity is handled by two **Svelte 5** islands. Originally migrated from Next.js 14 + Sanity (see git history).

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
- **Svelte 5** (runes API) — used for the two interactive islands only
- **`@astrojs/svelte@^7`** — note: `@astrojs/svelte@8+` requires Astro 6, do not upgrade until Astro itself is upgraded
- **Tailwind CSS 3** via `@astrojs/tailwind` with class-based dark mode and `@tailwindcss/typography`
- **MDX** for blog posts (`@astrojs/mdx`)
- **Zod** for content-collection schemas
- **`clsx` + `tailwind-merge`** via `cn()` in `src/lib/utils.ts`
- **TypeScript** strict mode (extends `astro/tsconfigs/strict`)

## Directory Layout
```
src/
├── components/          # .astro server components + 2 .svelte islands
│   ├── *.astro          # Server components (zero JS shipped)
│   ├── ThemeToggleBtn.svelte
│   └── MobileMenuBtn.svelte
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
- Only use Svelte islands for state that actually needs the browser (localStorage, click handlers). Currently: `ThemeToggleBtn.svelte`, `MobileMenuBtn.svelte`
- Wire islands in `.astro` files with `client:only="svelte"` (these components depend on browser APIs; SSR adds no value)
- **`.svelte` imports require the explicit extension** in `.astro` frontmatter

### AppWrap (slot-based wrapper, not an HOC)
`src/components/AppWrap.astro` wraps each section with `SocialMedia` sidebar and `NavigationDots`. Usage:
```astro
<AppWrap id="about">
  <!-- section content -->
</AppWrap>
```

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

## Common Tasks

### Add a blog post
Create `src/content/blog/<slug>.mdx` with frontmatter matching the schema in `src/content/config.ts` (`title`, `description`, `publishedAt`, `author`, `mainImage`, `categories`, `draft`).

### Add a new section to the home page
1. Create `src/components/NewSection.astro` (wrap in `<AppWrap id="...">` if it should be a navigable section)
2. Import and render it in `src/pages/index.astro`
3. Add an entry to `navItems` in `src/components/Navbar.astro` and `src/components/MobileMenuBtn.svelte`

### Modify theme colors
Edit `theme.extend.colors` in `tailwind.config.ts`.

### Update site URL (for sitemap/canonical)
Edit `site:` in `astro.config.mjs`.

## Testing
No tests configured. The build pipeline runs `astro check` (covers type errors across `.astro`, `.svelte`, `.ts`) before producing output.

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
Inline `l_text:` overlay applied by `src/components/CloudPhoto.astro` — © ATAK in JetBrains Mono 24px, white 50% opacity, bottom-right with 24px padding. To change, edit the `overlays` array in that one file.

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
