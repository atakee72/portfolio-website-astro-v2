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

## Photography pipeline (Cloudinary)

The `/lens` routes deliver film/digital photo rolls. Storage is Cloudinary; metadata + EXIF live in `src/content/rolls/<slug>.json` (validated by a Zod schema in `src/content/config.ts`).

### Env vars
Copy `.env.example` to `.env` (or `.env.local` — both are gitignored):

- `PUBLIC_CLOUDINARY_CLOUD_NAME` — required for `<CldImage>` to construct URLs. Exposed to the client (not a secret).
- `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — server-only. Used by upload helpers. Never prefix with `PUBLIC_`.

On Vercel set `PUBLIC_CLOUDINARY_CLOUD_NAME` in project env. API key/secret stay local.

### Publishing a new roll
1. Drop the web-sized JPEGs (≤ 2000 px long edge, ~80% quality) into `inbox/<batch>/` (gitignored).
2. `node scripts/extract-exif.mjs <roll-slug> inbox/<batch>` — writes `src/content/rolls/<roll-slug>.json` with EXIF pre-filled. GPS coords are dropped. `draft: true` by default.
3. Hand-edit the JSON: `title`, `location`, `cover.alt`, per-photo `alt`/`caption`. Date defaults to today; correct if needed.
4. Upload the source JPEGs to Cloudinary as `lens/<roll-slug>/01.jpg`, `02.jpg`, … via dashboard or `cld uploader upload <file> -o public_id=lens/<roll-slug>/01`.
5. Flip `draft: false` (or remove the field).
6. Optional: set `slug: '<roll-slug>'` on a matching `contactSheet.ts` photo entry so the homepage cell's lightbox shows a "see full roll →" CTA.
7. `pnpm build`. Static routes for `/lens/<slug>` and `/lens/<slug>/<n>` emit automatically.

### Watermark
Inline `l_text:` overlay applied by `src/components/CloudPhoto.astro` — © ATAK in JetBrains Mono 24px, white 50% opacity, bottom-right with 24px padding. To change, edit the `overlays` array in that one file.

### Hot-link protection (Cloudinary console)
Setting menu drifts; current path is something like Settings → Security → "Restricted media types" / "Allowed strict referrals". Adding the Vercel domain restricts where image transforms render — but it also breaks Slack/Twitter og:image previews (their crawlers send their own referrer). Two options, decide per account:

- **Open hot-linking** (default for personal portfolios): leave the restriction off. Watermark + 2000 px ceiling are the real defenses.
- **Strict referrer**: add `developer-portefeuille…vercel.app` plus social-crawler referrers (`slackb.com`, `twitter.com`, `x.com`, `linkedin.com`) — list drifts.

### Anti-download chrome
`CloudPhoto.astro` enforces `oncontextmenu="return false"`, `draggable="false"`, and a transparent overlay so the inner `<img>` is never the click target. Theater, not protection — DevTools still wins. Real protection = watermark + web-sized ceiling.
