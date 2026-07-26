# Portfolio

Personal portfolio website by **Ercan Atak** — software case studies, journal, photography rolls, painting albums, and contact. Live at [ercan-atak.de](https://ercan-atak.de).

## Tech Stack

- **[Astro 5](https://astro.build/)** with static output and View Transitions
- **[Svelte 5](https://svelte.dev/)** (runes API) for interactive islands
- **[Tailwind CSS](https://tailwindcss.com/)** with class-based dark mode
- **MDX/JSON** + Astro Content Collections (blog, work, photo rolls, painting albums, testimonials), managed via Sveltia CMS + Cloudinary
- **TypeScript** (strict)
- **pnpm** package manager

## Local Development

```bash
pnpm install      # one-time
pnpm dev          # http://localhost:4321
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start the dev server |
| `pnpm build` | Type-check + build production output to `dist/` |
| `pnpm preview` | Preview the production build locally |
| `pnpm type-check` | Run `astro check` (covers `.astro`, `.svelte`, `.ts`) |
| `pnpm lint` | Run ESLint across `.js`, `.ts`, `.astro`, `.svelte` |

## Adding a Blog Post

Create `src/content/blog/<slug>.mdx` with frontmatter matching the schema in `src/content/config.ts`:

```mdx
---
title: "Post title"
description: "Short description"
publishedAt: 2026-05-11
author:
  name: "Your Name"
mainImage:
  src: "/assets/your-image.png"
  alt: "Image alt text"
categories: ["tag1", "tag2"]
draft: false
---

Your MDX content here.
```

Drafts (`draft: true`) are hidden in production builds and visible in dev.

## RSS Feed

A combined feed at [`/rss.xml`](https://ercan-atak.de/rss.xml) covers all four content collections (blog, work, lens, paints), sorted by date. Auto-generated at build time by `src/pages/rss.xml.ts` using `@astrojs/rss`. Discoverable via `<link rel="alternate">` in the page head and a visible `rss` link in the footer.

## Project Structure

```
src/
├── components/          # .astro + .svelte components
├── content/             # Blog + work MDX, rolls/paintings/testimonials JSON
├── layouts/             # BaseLayout, BlogPostLayout
├── lib/                 # Content helpers, cn() utility
├── pages/               # File-based routes
└── styles/globals.css
```

## Deployment

The project builds to static HTML and can be deployed to any static host (Vercel, Netlify, Cloudflare Pages, GitHub Pages, etc.). Before deploying, update the `site:` value in `astro.config.mjs` to your production URL so the sitemap is generated correctly.

## History

Originally Next.js 14 + Sanity CMS, then migrated to Astro + Content Collections, and later from React islands to Svelte 5. See [`MIGRATION.md`](./MIGRATION.md) for the full record.
