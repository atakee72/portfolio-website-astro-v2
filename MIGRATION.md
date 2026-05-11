# Migration History

This file records the two major migrations this project has gone through.

---

# Phase 1: Next.js 14 + Sanity → Astro

## Overview
Migrated the portfolio from Next.js 14 + Sanity CMS to Astro (static output) with local content collections.

## Key Changes

### Tech Stack Transformation
**Removed:**
- ❌ Next.js 14 (App Router)
- ❌ Sanity CMS (all schemas, studio, API)
- ❌ next-themes
- ❌ npm (package manager)
- ❌ Plain JavaScript

**Added:**
- ✅ Astro 5 with View Transitions and `output: 'static'`
- ✅ TypeScript (strict mode)
- ✅ pnpm (package manager)
- ✅ Astro Content Collections (MDX blog + JSON testimonials)
- ✅ Zod schemas for type-safe content
- ✅ `cn()` utility (clsx + tailwind-merge)
- ✅ MDX support

**Kept:**
- ✅ Tailwind CSS (same config, same styling)
- ✅ React (initially — for interactive islands; later replaced with Svelte 5 in Phase 2)

## Architecture Changes

### Content Management
- **Before:** Sanity CMS with external API calls
- **After:** Local MDX files version-controlled in git
- **Location:** `src/content/blog/*.mdx` and `src/content/testimonials/data.json`

### Components
- **Server Components:** Converted from `.jsx` → `.astro` (zero JS shipped by default)
- **Client Components:** Converted to `.tsx` initially (later moved to `.svelte` in Phase 2)
- **HOC Pattern:** `AppWrap()` HOC → slot-based `AppWrap.astro` wrapper

### Routing
- **Before:** `src/app/` directory (Next.js App Router)
- **After:** `src/pages/` directory (Astro file-based routing)

### Styling
- **Preserved:** All Tailwind classes, custom colors, animations
- **Updated:** Colors moved to `theme.extend` to keep default palette
- **Dark Mode:** Custom localStorage-based theme system (inline boot script in `BaseLayout.astro` prevents FOUC)

## Component Migration Map (Phase 1)

| Old (Next.js) | New (Astro) | Type |
|---|---|---|
| Navbar.jsx | Navbar.astro | Server |
| Header.jsx | Header.astro | Server |
| About.jsx | About.astro | Server |
| Work.jsx | Work.astro | Server |
| Blog.jsx | Blog.astro | Server |
| BlogPostCards.jsx | BlogPostCard.astro | Server |
| Testimonials.jsx | Testimonials.astro | Server |
| Footer.jsx | Footer.astro | Server |
| MyAccordion.jsx | MyAccordion.astro | Server |
| SocialMedia.jsx | SocialMedia.astro | Server |
| NavigationDots.jsx | NavigationDots.astro | Server |
| AppWrap.js (HOC) | AppWrap.astro (slot) | Server |
| ThemeToggleBtn.jsx | ThemeToggleBtn.tsx → `.svelte` (Phase 2) | Client island |
| MobileMenuBtn.jsx | MobileMenuBtn.tsx → `.svelte` (Phase 2) | Client island |

## Features Preserved
- ✅ Visual design (pixel-perfect)
- ✅ Dark mode
- ✅ Blog posts (3 examples, MDX-authored, categories + images)
- ✅ Testimonials (JSON-driven)
- ✅ Responsive design (all breakpoints maintained)
- ✅ Custom Tailwind animations (`slidein300/500/700`)
- ✅ Navigation (desktop menu, mobile menu, navigation dots)
- ✅ Social links (GitHub, LinkedIn, Behance, Instagram, Facebook)

## Performance Improvements
- Zero JS by default on static pages (partial hydration)
- Faster builds via Astro's static optimizer
- Better SEO from static generation + sitemap

## Phase 1 Stats
- Files changed: ~54
- Components migrated: 14
- Dependencies removed: 9
- Dependencies added: 8
- Build output: 4 pages (index + 3 blog posts)

---

# Phase 2: React → Svelte 5

## Overview
Replaced React entirely with Svelte 5 islands. React had been kept after Phase 1 to power the two interactive components (theme toggle, mobile menu), but it was overkill and produced a recurring "Invalid hook call" SSR warning. The two components were trivial state toggles — perfect Svelte territory.

## Trigger
A `react-icons` SSR misuse in `SocialMedia.astro` produced hook-call warnings on every page render. Switching to inline SVGs partially fixed it; switching the remaining React islands to `client:only="react"` silenced the rest. At that point keeping React for two tiny components no longer earned its weight, so the full Svelte migration was done.

## Tech Stack Changes

**Removed:**
- ❌ `react`, `react-dom`
- ❌ `@astrojs/react`
- ❌ `react-icons` (replaced by inline SVGs)
- ❌ `react-magic-motion` (was unused leftover from Next.js era)
- ❌ `@types/react`, `@types/react-dom`
- ❌ `"jsx": "react-jsx"` in `tsconfig.json`

**Added:**
- ✅ `@astrojs/svelte@^7` (pinned to v7 because v8 requires Astro 6)
- ✅ `svelte@^5` with the runes API (`$state`, `$effect`, etc.)
- ✅ `eslint-plugin-svelte@^2` (v2 line; v3 is flat-config only)
- ✅ `@typescript-eslint/parser` (was referenced in the existing `.eslintrc.json` but had never actually been installed — latent bug fixed in passing)
- ✅ `svelte` added to the Tailwind `content` glob

## Component Migration Map (Phase 2)

| Phase 1 result | Phase 2 result | Notes |
|---|---|---|
| ThemeToggleBtn.tsx (React, `client:load`) | ThemeToggleBtn.svelte (Svelte 5, `client:only="svelte"`) | No SSR needed — depends on `localStorage` |
| MobileMenuBtn.tsx (React, `client:load`) | MobileMenuBtn.svelte (Svelte 5, `client:only="svelte"`) | Same. Also replaced `react-icons/hi` icons with inline SVGs. A11y improved: real `<button>` elements with `aria-label` instead of `<div onClick>` |

## Other Cleanup Bundled into Phase 2
- Deleted `.next/` build cache (81MB) leftover from Next.js era
- Deleted `public/assets/index.js` (Next.js-style image barrel, unreferenced)
- Deleted unused images: `bgWhite.png`, `facebookLogo.svg`, `instagramLogo.svg`
- Replaced `react-icons` usage in `SocialMedia.astro` with inline SVGs and a per-icon CSS-variable hover color (each icon hover-tints to its brand color)
- Removed dead `<link rel="icon">` (the project has no favicon)
- Added `.next/` and `*:com.dropbox.attrs` to `.gitignore`
- Updated `caniuse-lite` via `npx update-browserslist-db@latest`

## Phase 2 Outcomes
- All "Invalid hook call" warnings eliminated (impossible — no React in the project)
- 44 packages removed from `node_modules`
- Smaller client JS bundle:
  - Svelte runtime: 1.16 kB (0.64 kB gzip)
  - ThemeToggleBtn: 1.86 kB (1.07 kB gzip)
  - MobileMenuBtn: 8.52 kB (3.81 kB gzip)
- `pnpm lint` now runs cleanly across `.js`, `.ts`, `.astro`, `.svelte` (it had been broken pre-migration due to the missing parser)
- Build is clean: 0 errors, 0 warnings

---

## Next Steps
1. **Content**: Replace example blog posts with real content
2. **Images**: Optimize remaining assets, add more as needed
3. **About / Work sections**: Add actual content
4. **Domain**: Update `site:` in `astro.config.mjs`
5. **Deploy**: Vercel / Netlify / Cloudflare Pages

## Notes
- All Sanity data was migrated to local files in Phase 1; the project has no external CMS dependency
- The theme system works without any external library (boot script + Svelte toggle)
- MDX allows custom components inside blog posts
- `@astrojs/svelte` is pinned to `^7`. Do not upgrade to v8 until Astro itself is upgraded to v6.
