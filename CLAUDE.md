# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project Overview
Personal portfolio site built with **Astro 5** (static output). Content is local (no external CMS): MDX blog posts and JSON testimonials via Astro Content Collections. Interactivity is handled by four **Svelte 5** islands. Originally migrated from Next.js 14 + Sanity (see git history).

## Development Commands
```bash
pnpm dev          # Astro dev server at http://localhost:4321
pnpm build        # sync-exif.mjs → astro check → astro build → dist/
pnpm preview      # Preview production build
pnpm type-check   # astro check (covers .astro, .svelte, .ts)
pnpm lint         # ESLint over .js, .ts, .astro, .svelte
```

Package manager is **pnpm** (lockfile is committed).

## Tech Stack
- **Astro 5** with `output: 'static'` and View Transitions
- **Svelte 5** (runes API) — used for the four interactive islands only
- **`@astrojs/svelte@^7`** — note: `@astrojs/svelte@8+` requires Astro 6, do not upgrade until Astro itself is upgraded
- **Tailwind CSS 3** via `@astrojs/tailwind` with `@tailwindcss/typography` — single dark palette, **no `darkMode` setting and no `dark:` variants anywhere** (see the theme section below)
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
│   ├── BaseLayout.astro      # <html>, ViewTransitions, JSON-LD, GoatCounter, PII decoder
│   └── BlogPostLayout.astro  # Per-post layout with Navbar
├── lib/
│   ├── content.ts       # 12 helpers — blog, projects, rolls (+rollPhotos), paints, testimonials
│   └── utils.ts         # cn(), getHostname()
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

### Theme system: DARK-ONLY (no toggle, no localStorage)
- The darkroom redesign committed to a single dark theme. There is **no** `ThemeToggleBtn.svelte` and **no** theme boot script.
- **Client-side storage — say this precisely, it has been wrong twice.** No visitor-facing page uses `localStorage` or `sessionStorage`. But "none anywhere in `src/`" is **false**: the two operator-only tools each persist a GitHub PAT — Sveltia at `/photojockeysblog/`, and `src/pages/reblog/index.html` (lines ~203–214). Both are unlinked and `noindex`, and the only thing stored is the operator's own token on the operator's own device, so the visitor-facing claim in `/datenschutz` still holds — which is why that page is scoped to "publicly accessible pages" rather than making an absolute claim. (This section fed a false claim into a blog draft in July 2026, was "verified" 2026-07-21 while still overlooking both admin tools, and was corrected 2026-08-15. Check `grep -rn "localStorage" src` before restating it.)
- Light mode is out of scope, not deferred (see memory `project_dark_only`). Don't reintroduce a toggle.

### Tailwind config (`tailwind.config.ts`)
Verified against the file 2026-08-15 — the previous version of this section still
described the pre-darkroom theme (`darkMode: 'class'`, `primary`/`secondary`/`brown`/
`yavru` colours, a `slidein` keyframe). **None of that exists.** If you're about to
cite a token from here, it's cheap to re-check the file.

- **No `darkMode` key at all**, and no `dark:` variant anywhere in `src/` — the single dark palette IS the theme. See the theme section above.
- Colours (`theme.extend.colors`): `ink` `#0d0d0c` · `ink-2` `#18181a` · `ink-3` `#2a2a28` · `mute` `#6a6a66` · `mute-2` `#9a9a92` · `paper-2` `#c2bfb6` · `paper` `#e8e5dd` · `paper-hi` `#f4f1ea` · `safelight` `#ff3b30` (the darkroom red — used for `FRAME 36/36` and the footer's `+` separators) · `phosphor` `#d4ff3a` (the accent/hover green)
- Fonts: `font-mono` → JetBrains Mono, `font-display` → Space Grotesk (both self-hosted via `@fontsource`, see the legal section)
- Custom sizes: `text-display` 124px · `text-h2` 26px · `text-label` 13px · `text-micro` 10px, each with its own tracking
- **`borderRadius` is `0` for both `none` and `DEFAULT`** — square corners are a deliberate design choice; `rounded` does nothing
- **Named z-index scale**: `grid` 1 · `chrome` 10 · `reticle` 50 · `modal` 90. Worth knowing alongside the `CloudPhoto` overlay gotcha above — that overlay sits at `z-10`, i.e. `chrome` level
- Animation: one keyframe, `darkBlink` (opacity 1↔0, `steps(2)`, 1s infinite)
- Custom breakpoints: `xxs` 300px, `xs` 475px, then Tailwind's defaults spread in
- **Content glob includes `.svelte`** — if you add a new file extension that uses Tailwind classes, update the glob or styles get purged

## Gotchas

- **Do not import `react-icons` (or any React component) into `.astro` templates** — there is no React in this project, and even if there were, `react-icons` triggers SSR hook-call warnings. Inline SVGs instead (see how `SocialMedia.astro` does it).
- **Two unused leftovers were removed during the Astro migration**: any reference to `public/assets/index.js`, `next-themes`, or `react-magic-motion` is stale.
- **Tailwind arbitrary-value classes with CSS variables work** (e.g., `text-[var(--brand)]`). Used in `SocialMedia.astro` for per-icon hover colors.
- **`CloudPhoto.astro` lays a transparent anti-download overlay at `z-10`** over every image. ANY interactive element positioned over a `CloudPhoto` (lightbox close/copy/prev/next, detail-page arrows, caption-row links) MUST be `z-20+` or its clicks get eaten silently — the overlay wins the hit-test and nothing happens, no error. This bit **three times**: the lens lightbox, the paints detail page, and the lens detail page (`[slug]/[n].astro` arrows + copy-link shipped at `z-[3]` → dead mouse/touch clicks while keyboard arrows still worked, because `.click()` bypasses hit-testing). **The keyboard-works-but-mouse-doesn't split is the signature of this bug.** Non-interactive overlay children (caption rows) should carry `pointer-events-none` so they never block the arrows underneath.
- **JS-driven navigation must route through the View Transitions router.** `window.location.href = url` forces a full page load; call the target anchor's `.click()` (or `navigate()` from `astro:transitions/client`) instead. Bit the keyboard arrow nav on both lens photo pages and paints detail pages. The paints detail image frame carries `transition:name="painting-frame"` so prev/next morphs in place.
- **Cloudinary text overlays only support a fixed set of fonts** (Arial, Courier, Times, Verdana, Helvetica, Georgia, etc.). Custom fonts like "JetBrains Mono" return HTTP 400 with `x-cld-error: Unsupported font family ...` and a broken-image GIF. The watermark in `CloudPhoto.astro` uses `Courier`. To debug image issues fast: `curl -I` the Cloudinary URL and check headers.
- **Tailwind `object-*` classes never work on `CloudPhoto` images.** The underlying unpic `<Image>` writes `object-fit` as an INLINE style (default `cover`), which beats any class. Use CloudPhoto's `objectFit` prop instead (forwarded to unpic). Bit the paints lightbox: `object-contain` class silently ignored → paintings rendered crop-zoomed.
- **Sveltia commits straight to GitHub via API** — it never touches your local working tree. **Always `git pull` before editing files Sveltia might have edited** (`src/content/blog/*.mdx`, `src/content/rolls/*.json`, `src/content/paintings/*.json`) to avoid diverging streams. **The reverse bites too**: an entry form left open in Sveltia holds stale state — saving it commits that stale snapshot over anything pushed since the form loaded (bit the u-bahn roll: a Claude restructure landed, a pre-loaded Sveltia save 1 min later silently reverted it). After pushing a change to a content file, refresh the Sveltia entry before saving; when a deploy "misses" a change, diff the tip commit before blaming the pipeline.
- **If pushes stop triggering Vercel deployments, check https://www.githubstatus.com first.** GitHub API degradation silently drops Vercel's Git-integration deploys (no failed deployment, just nothing — bit us 2026-07-16, incident "Degraded REST API Availability"). Don't reconnect the integration during an incident; stopgap is `vercel deploy --prod` from a clean checkout, and it self-heals when GitHub recovers (verify with an empty-commit push).
- **Contact-sheet cells auto-resolve content links.** In `src/data/contactSheet.ts`: photo cells with `slug: 'my-roll'` resolve to that roll's cover + "see full roll →" lightbox CTA; paint cells with `album: '<album-slug>'` resolve to that album's cover + "view album →" CTA (or `painting: '<id>'` for a single work + "view painting →"; album wins if both); `link` cells show a static image and open the lightbox with an intro `note` + external CTA (`cta`, new tab) — they never tab-hijack on click (used for the website-museum tile). Cells without any of these keep their placeholder gradient. **On narrow screens (`max-width: 640px`) the lightbox is suppressed everywhere** (a cramped modal on a phone is worse than the alternative): contact-sheet cells **reveal an in-cell caption+CTA layer** (`.reveal-layer`, one tap shows / tap-again or tap-outside dismisses — wired by a capture-phase handler in `ContactSheet.astro` that `stopPropagation()`s so `EnlargedFrame`'s document handler never fires); lens/paints **album grids tap-navigate to the detail page** (the full-screen image view — an info overlay was rejected because it would hide the whole image). The width gate lives in `EnlargedFrame.astro`'s click handler (`(hover:none) and (pointer:coarse)` OR `(max-width:640px)`) — the pointer check alone misses narrow desktop windows and some tablets.

- **The footer's single row is at its width limit — adding a link wraps it, and you cannot see this by reading the markup.** `Footer.astro` is `lg:flex-row justify-between` with three spans; the right-hand one is `flex-wrap`, so a fourth link silently pushes it onto a second line **at every width**, including 1920. Adding `colophon` did exactly that. The fix is to shorten the middle stack label, and the only reliable way to check is to measure in a real browser: build, `pnpm preview`, then Playwright `getBoundingClientRect().height / lineHeight` on `footer span.flex.flex-wrap` across 1024→1920. Character-count estimates are useless here — the label is `font-mono` at different tracking from the row. Current label `// astro+svelte+tailwind` (no spaces, `+` in `text-safelight`) is the first variant that holds one line at *every* width down to 1024; `// built with astro + svelte + tailwind` wraps below 1152. Below `lg` the footer is `flex-col` and unaffected.
- **`/reblog` is a hand-written static `index.html`** dropped into `src/pages/reblog/`, not an Astro component — it carries its own inline copy of the darkroom CSS variables and is `noindex,nofollow,noarchive`. Astro copies it through untouched, which also means it gets none of `BaseLayout`'s chrome, analytics or JSON-LD, and its colour values are a **duplicate** of `tailwind.config.ts` that won't follow if the palette changes.
- **`/colophon`** (`src/pages/colophon.astro`) is the site's own "how it's built" page — indexed, in the sitemap, unlike the `noindex` legal pages. Reached two ways from `Footer.astro`: the `colophon` item in the legal row, and the stack label itself, which is an `<a>` to the same place. It deliberately **points at** the four blog posts that tell these stories at length (astro migration, GDPR-by-construction, photo pipeline, three darkrooms) rather than retelling them. **The portfolio site is intentionally NOT a `/work` case study** — that material is already published as those posts, and a self-referential entry would dilute the client-work ratio. If asked again, the answer is the colophon.
- **Any list a view augments (cover-merge, injected cells) MUST be derived in ONE shared helper that every consumer uses** — grids, detail-route `getStaticPaths`, `total`, and prev/next. `rollPhotos()` in `src/lib/content.ts` is the single source for lens roll frame order: it prepends a standalone cover as frame 1. When the grid merged the cover but `getAllPhotoEntries` numbered from the raw `photos`, every bosphorus grid cell opened the *next* photo (off-by-one) and the last cell 404'd. If you add per-view list augmentation, route ALL numbering through the same function or the grid and detail pages silently disagree.

## Common Tasks

### Add a blog post
Create `src/content/blog/<slug>.mdx` with frontmatter matching the schema in `src/content/config.ts` (`title`, `description`, `publishedAt`, `author`, `mainImage`, `categories`, `draft`).

### Rename a content slug (breaks live URLs — do all three steps)
The URL comes from the **filename** (`src/content/projects/coachly.mdx` → `/work/coachly`). To rename:
1. `git mv` the file, then `grep -rn "<old-slug>" src public` — internal links (contact sheet, blog posts, llms.txt) don't update themselves.
2. Add a redirect to the `redirects` array in `vercel.json`. **Two entries are required** — Vercel matches `source` literally, so `/work/old-slug` does NOT cover `/work/old-slug/`. Astro emits the trailing-slash form, so *that's the one already indexed*; miss it and every existing link 404s while the bare path looks fine. (Bit us on the crowd-coach → coachly rename, 2026-08-12.)
3. Verify BOTH forms after deploy: `curl -s -o /dev/null -w '%{http_code} %{redirect_url}' <url>` — expect 308 on each — and confirm the sitemap dropped the old URL.

### Write or refresh a case study (`src/content/projects/*.mdx`)
- **Fixed shape**: exactly four `##` sections — **Problem / Build / Architecture / Reflection** — in that order. Whole-file `wc -w` currently spans 382–1118 (dmk 382 · digiscrape 478 · vibes 746 · okay 877 · coachly 897 · mahalle 924 · revintage 1118). Don't let one balloon into an outlier — measure the siblings before adding: `for f in src/content/projects/*.mdx; do echo "$(basename $f): $(wc -w < $f)"; done`. **Give a subagent a whole-file `wc -w` target, not a "body words" target** — body-vs-frontmatter arithmetic in a brief is a bug factory.
- **If the subagent writes body-only (because you're supplying frontmatter), you MUST hand it a body number — so derive it by measuring the frontmatter you will actually write, not by guessing.** Frontmatter is much heavier than it looks: descriptive `alt` + `caption` runs ~35 words per screenshot, so a cover + 5 shots + `exif` came to **317 words**, not the ~180 I estimated. On Re:Vintage that error survived my pre-dispatch audit and the first assembled draft projected 1,396 whole-file words — 51% over the then-largest sibling — forcing two full trim passes after the writing was already done. Write the frontmatter FIRST, `wc -w` it, then subtract.
- **Formatting is per-file, not global.** Most are pure prose, but `okay-uebersetzungen.mdx` uses a short bullet list inside Architecture. A refresh brief must say "keep this file's existing conventions" or the subagent will normalise it to whatever the other case studies do.
- **No `updatedAt` field** on the projects schema (unlike blog) — a refresh edits the body in place and leaves `publishedAt` alone.
- **Refresh workflow (proven twice — Jul 2026 case-study wave, Aug 2026 Vibes)**: read-only recon agent surveys the GitHub repo via `gh` (commits since the case study's date, README, `package.json`, file tree, any repo-side CLAUDE.md/ROADMAP) and writes a report file; I then write from the report + my own spot-checks. **Also search Fabric for that project's notes** — the repo tells you *what* shipped, the Fabric gotcha notes tell you *why* a decision was made, which is the material that actually makes a case study worth reading (e.g. Vibes' hand-built modals exist because `prompt()`/`alert()`/`confirm()` interrupt media playback).
- **Never cite a number the recon flagged uncertain** — a stale test count or metric reads as sloppy and there's no upside.
- **Read the subagent's DROP list, not just its output.** A word cap forces cuts, and the writer optimises for coverage while the best material is usually one specific story. On both the MaHalle and Okay refreshes (Aug 2026) the report's "facts dropped" section contained the strongest paragraph in the brief — restored by hand both times. Budget-driven cuts are a review item, not a footnote.
- **…and a clean DROP list does NOT mean a clean draft — check for what was ADDED.** Cuts are self-reported; **additions are invisible to the report by construction**, because a writer that invented something believes it. The mock-fidelity blog post (Aug 2026) came back with a one-item drop list — the thinnest yet — and still carried three unsourced claims that had crept *in*: "null for every real account **since launch**" (no timeline was ever given), a fabricated account of where the mock's data came from, and "the day the mock made **everyone** forget to check" on a **solo** project. Same class as the MaHalle draft's invented "no in-house time for it". Read the output against the brief's FACTS looking for sentences that assert more than you supplied — especially timelines, causes, and plural actors on solo work.
- **Client work: ask the recon agent for an explicit "DO NOT PUBLISH" section**, listing every client-identifying or business-sensitive string it found (client names, personal emails, project refs, org slugs, billing arrangements) — separately from the facts you'll write from. On Re:Vintage (Aug 2026) this surfaced that **the repo name and the production hostname both contain the client's first name**, which is what settled the `links` question: neither could be linked, so the frontmatter omits `links` entirely (the schema defaults it to `{}` and `ProjectPageLayout` renders the row conditionally, so nothing breaks). Then grep the built page for the redaction list before pushing — the sitewide JSON-LD and social sidebar legitimately contain `github.com`, so match on the specific strings, not on `github`.
- **A refresh is also an audit.** Check whether claims are still *true*, not only whether they're complete: the Okay case study listed a "testimonials marquee" among the Svelte islands after it had become a plain `.astro` component, and said `LocalBusiness` where the schema emits `ProfessionalService`. Ask the recon agent for an explicit claim-by-claim STILL TRUE / CHANGED / UNVERIFIABLE audit — it catches what a "what shipped since" diff never will.

### Screenshot a live app for a case study
Same Playwright/sharp recipe as the blog (see SEO section), with three project-specific notes:
- **Viewport shots, not full-page.** `ImageStrip` renders every shot at a fixed 400px height with `object-contain`, so a tall full-page capture becomes an unreadable sliver. Capture at 1440×900 with `deviceScaleFactor: 2`, then sharp → WebP q70 @1600px (lands ~70–125 KB).
- **The `cover` is prepended into the strip** whenever `screenshots` is non-empty (`ProjectPageLayout.astro`) — so the cover image is shot #1 and the array is #2 onward. Don't duplicate the cover into the array.
- **Look at every capture before wiring it.** Screenshotting a live app surfaces whatever is actually in it: the MaHalle Forum and Markt shots came back full of keyboard-mash test posts (`hehjehej`, `dfjaksfas asdfasdf`), which reads as an unfinished product on a portfolio. Those two were held back and flagged rather than published.
- **Browser chrome leaks too, not just app content.** A Re:Vintage Settings capture had a **Chrome autofill dropdown** hanging open under a text field, showing the client's real business name — the one place in seven screenshots where the client was identifiable, and it wasn't rendered by the app at all. Dismiss autofill (Esc) or shoot in a clean profile. When the user supplies screenshots rather than you capturing them, inspect each one the same way and ask for a re-shoot rather than editing the image.
- **Separate "shows client data" from "identifies the client."** Unattributed metrics and post titles (follower counts, "the Cowboy Boot clip") are a normal anonymised product screenshot and need no sign-off; a name, handle or logo is what needs one. Conflating the two costs the user real screenshots for no privacy gain.

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

### SEO & GEO layer
- **Per-page JSON-LD** rides on a `jsonLd?: object | object[]` prop on `BaseLayout.astro` (rendered alongside the sitewide `Person` graph). `BlogPostLayout.astro` passes `[BlogPosting, BreadcrumbList]`; linkposts (`externalUrl` set) reference the original via `sameAs` instead of claiming authorship. **All JSON-LD is injected through the `ldJson()` helper that escapes `<` → `<`** — a CMS title containing `</script>` would otherwise break out of the tag.
- **Canonical**: `BaseLayout` emits `<link rel="canonical">` (absolute, from `Astro.site` + pathname) on every non-`noindex` page.
- **`updatedAt`** is an optional blog field (schema in `config.ts` + Sveltia form in `config.yml` — **keep both in sync**) → visible "updated" date + `dateModified` in JSON-LD (the freshness signal GEO rewards).
- **`public/llms.txt`** — static fact sheet for AI crawlers; facts already on the site only, don't invent bio details. Google explicitly doesn't use it — a near-zero-cost speculative bet, not an established channel.
- **`robots.txt` policy**: AI **training** bots blocked (GPTBot, ClaudeBot, CCBot, Google-Extended → `Disallow: /`); AI **citation/retrieval** bots allowed with the same private-path exclusions as `*` (OAI-SearchBot, ChatGPT-User, PerplexityBot). Googlebot (AI Overviews) already covered by `*`. `Sitemap:` directive points at `sitemap-index.xml`.
- **Those "private-path exclusions" are `/lens/`, `/impressum`, `/datenschutz` — note the first one.** The **entire photography section is disallowed to every crawler**, so the rolls are invisible to search by design. `/paints/` is *not* excluded, so the painting albums are fully crawlable — that asymmetry is easy to mistake for an oversight in either direction, so decide deliberately before "fixing" it.
- **Known conflict (verified 2026-08-15, unresolved):** the sitemap filter in `astro.config.mjs` only drops `/impressum` and `/datenschutz`, so **23 `/lens/` URLs are submitted in `sitemap-0.xml` while `robots.txt` forbids fetching them**, and `/reblog/` is listed too despite being `noindex,nofollow,noarchive`. That's 24 of 62 sitemap URLs that a crawler is told to both fetch and not fetch; Search Console reports them as "Blocked by robots.txt". Fix in ONE direction — either add `/lens/` + `/reblog/` to the sitemap `filter`, or drop `Disallow: /lens/` from robots.txt if the rolls are meant to be indexed after all.
- **GEO writing (per-post, not scaffolding)**: answer the query in the first ~200 words, add stats/quotes/cited sources (measurable +25–28% AI-citation lift), clean `<h2>` structure, "last updated" on refresh.
- **Google Search Console**: property `ercan-atak.de` (Domain type) verified 2026-08-08 via DNS TXT (`google-site-verification=…` on the apex, added through Cloudflare); sitemap-index.xml submitted same day. This is the instrument for SEO performance (impressions/queries/position) — GoatCounter only shows referrer clicks. Access: user's Google account at search.google.com/search-console.
- **Gotcha — `og:image` must be ABSOLUTE.** `BlogPostLayout` computes `absImage` (mainImage.src resolved against `Astro.site`) and must pass THAT to BaseLayout's `ogImage` prop, never the raw `mainImage.src` — a root-relative path renders as `content="/assets/…"`, which OG scrapers (Slack/X/WhatsApp) silently ignore. Bit the museum post 2026-08-09 (fixed 48fbdb1); invisible while every `mainImage` happened to be a full Cloudinary URL. Note `mainImage` is not meta-only: it renders as a visible hero in the post AND on the blog-index featured card — don't repeat it inline in the body.
- **Blog screenshots recipe**: capture with the one-off Playwright pattern (scratchpad `npm i playwright --no-save`; if it demands a browser version the cache lacks, pass `executablePath` to a cached `~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome`), then sharp → WebP q82 ≤1600px into `public/assets/blog/`, embed via plain markdown `![]()`.
- **Gotcha — blog `[slug]` MUST prod-filter drafts.** `src/pages/blog/[slug].astro` `getStaticPaths` uses `getAllBlogPosts()` (prod-filters `draft: true`), NOT raw `getCollection('blog')` — the raw version built draft detail pages that were publicly reachable in prod (the index list already hid them, so it was invisible until a real draft existed). Same convention as `/work [slug]`.

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

### Project order on the homepage and `/work`
Two independent frontmatter levers, both read by `getAllProjects()` in `src/lib/content.ts`:
- **`order`** (optional number, lowest first) — the curated position. Every project currently sets it: mahalle 1 · revintage 2 · coachly 3 · dmk-musician 4 · okay-uebersetzungen 5 · vibes-music-player 6 · digiscrape 7. Anything *without* an `order` sorts behind everything that has one, then falls back to featured-first / `publishedAt` desc — so a newly added project lands at the back until you place it deliberately.
- **There are now 7 projects against a 6-card homepage cap, so one always overflows to `/work`** — currently digiscrape. Inserting a project mid-list means renumbering everything below it (plain `sed -i 's/^order: N$/order: N+1/'`, highest first so numbers don't collide), and it silently pushes the last card off the homepage. Decide which project you're demoting; don't discover it after the fact.
- **`featured`** (boolean) — purely the *visual* flag: `ExifWork.astro` gives it `lg:col-span-2`, i.e. the wide hero card. It also still breaks ties among projects with no `order`. Exactly one project should carry it (currently mahalle).

**To reorder, edit `order` in the frontmatter — don't touch `publishedAt`.** Dates are facts; re-dating a case study to move a card is how a portfolio starts lying about its own timeline. (Added Aug 2026 — before it, `featured` + date was the only lever, which could promote a project to first but never demote one to last.)

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

Roll `cover` is OPTIONAL (same as painting albums, since 2026-07-18):
cards fall back to the first photo, so the cover is always viewable
inside the roll. Only set `cover` to override. Lightbox images are
letterboxed everywhere (`fitContain` — lens rolls, paints, contact
sheet); keyboard arrow nav fires only in lightboxes that render nav
arrows (rolls/albums yes, contact sheet no — its frames are unrelated).

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

**One JSON per album** — same shape as photography rolls: `src/content/paintings/<album-slug>.json` holds album metadata (title, years, dimensions, description; `cover` is an OPTIONAL override — the album card defaults to the first painting's image so the cover is always viewable inside the album; an explicit cover that ISN'T one of the catalogued paintings is prepended as a display-only cover cell on `/paints/<album>` — labelled `cover`, no detail page, opens the lightbox — so a Sveltia-picked standalone cover is never lost. Rolls behave the same way (`/lens/<slug>` merges a standalone cover into the photo grid).) plus a `paintings` array, one item per work (`id`, title, year, medium, subjects, image, tags). The array order IS the display and prev/next order — curated, reorder by dragging in Sveltia. Zod schema in `config.ts`, Sveltia form in `config.yml` — keep both in sync. Images are Cloudinary `paints/<painting-id>` public IDs, rendered through `CloudPhoto` (watermark + EXIF-strip apply). There is no separate registry file and no `series` field — the album file is the grouping (restructured 2026-07-14; before that, one JSON per painting + `src/data/paintAlbums.ts` registry keyed by `series`).

- **Routes**: `/paints` (album cards) → `/paints/<album>` (gallery + year/subject/medium filters + **in-page lightbox** like lens rolls: arrows swap paintings in the overlay, no navigation; mobile taps go to the detail page) → `/paints/<album>/<painting-id>` (detail permalink; prev/next cycles within the album; frame morphs via `transition:name="painting-frame"`). `<album>` = the JSON filename, `<painting-id>` = the item's `id` field — **never change an `id` after publishing** (breaks URLs, RSS, contact-sheet links).
- **The lightbox wiring script lives ONLY in `EnlargedFrame.astro`** (one delegated `document` handler, `__enlargeWired` guard). Pages must NOT ship their own copy — ContactSheet and lens/[slug] used to, and whichever page loaded first won (the ContactSheet variant had no arrow nav → dead arrows on roll pages after visiting the homepage). Triggers carry `data-enlarge-target` (modal id) + optional `data-permalink` (mobile tap target; external `https?://` permalinks open a new tab). Arrow nav cycles only *visible* triggers (`offsetParent !== null`), so filter strips constrain it. While open, the modal locks background scroll (`overflow:hidden` on `<html>`) — released on close AND on `astro:before-swap`, because CTA links navigate with the modal still open and `<html>` persists across View Transitions (the lock would leak onto the next page).
- **cldPath fields are normalized by a Zod transform** in `config.ts` (rolls + paintings): full Cloudinary delivery URLs and extension-suffixed values are stripped to bare public_ids, then percent-DECODED (folders with spaces arrive as `%20`; without decoding the URL builder double-encodes to `%2520` → Cloudinary 404 — bit the coffee album). Paired with `output_filename_only: false` in the Sveltia config so widget-picked images keep their folder path (filename-only mode silently drops `paints/`/`lens/` folders → 404s — bit us 2026-07-14).
- **Adding paintings — three paths**:
  1. **Sveltia** (Painting Albums collection) — open the album entry, add an item to the Paintings list, pick the image via the Cloudinary widget (works since the 0.170.9 bump; if it fails, suspect Firefox tracking protection). New album = "+ New" in the same collection. Fine for 1–3 works; tedious beyond (list-of-objects field — no bulk multi-select, upstream Sveltia/Decap limitation).
  2. **Bulk script** — `pnpm prep-paints <album-slug> <folder-of-jpegs> [--force]` (`scripts/prep-paints.mjs`, mirror of `pnpm prep`): resizes to 2000 px q=80, uploads to Cloudinary at `paints/<id>`, writes/APPENDS the album JSON (blank titles/years for Sveltia to fill). Painting ids — and their URLs — are **slugified from filenames**, so name files meaningfully before running (`boy with woodcock.jpg` → `paints/boy-with-woodcock`). Unlike `prep`, an existing album is appended to, not refused; `--force` overwrites Cloudinary assets and replaces same-id entries in place.
  3. **Direct** — upload images via Cloudinary console (or API), then edit the album JSON by hand/Claude. The Admin API creds in `.env.local` allow listing/renaming: rename Instagram-noise filenames to clean `paints/<id>` public IDs before writing entries (see git history: `rename-paints.mjs` pattern — signed POST to `/image/rename`).
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
- **Mail DNS records:** MX → `mxext1..4.mailbox.org` (priority 10, all equal); SPF → `v=spf1 include:mailbox.org ~all`; DKIM → 4× `MBO0001..4._domainkey` CNAMEs → `MBO000n._domainkey.mailbox.org.`; DMARC → `v=DMARC1; p=quarantine; rua=mailto:re+zdmsezyyiva@dmarc.postmarkapp.com` (tightened from `p=none` 2026-08-08 after two weeks of clean aggregate reports — all senders were mailbox.org IPs, SPF+DKIM pass; raw reports now go to Postmark's free DMARC digest service, weekly summary to mail@ every Monday).
- **Legacy Cloudflare Email Routing (retired 2026-07-12):** previously forwarded `info@` / `contact@` → `atakee+portfolio@gmail.com`. Retired because Yahoo `p=reject` senders bounced through the forward (Gmail refused the ARC-sealed forward). Rules are still saved in the Cloudflare dashboard but the whole service is *disabled* (`status: unconfigured`) — one-call rollback if ever needed. Do NOT re-enable while mailbox.org MX is live; the two conflict. Decided 2026-08-08: stays disabled indefinitely — a disabled config is harmless and keeps the rollback; the once-planned full deletion is dropped.
- **Form** (`<ReachForm>`) posts to Web3Forms with an inlined per-form `access_key` (see `src/components/ReachForm.svelte` — public by design per Web3Forms docs, gitleaks-ignored). The Web3Forms account still delivers to `atakee+portfolio@gmail.com` (unchanged by the mailbox.org migration). To route form submissions to the new inbox instead, change the delivery target in the Web3Forms dashboard to `contact@ercan-atak.de` — one Gmail filter no longer needed once done.

## Legal & compliance (DSGVO / DDG)

The site is operated from Germany under a real name → triggers Impressumspflicht (DDG, the 2024 successor to TMG) and Datenschutzerklärung (DSGVO). Both pages exist; both are surfaced from the footer alongside the rss link.

- **`/impressum`** — `src/pages/impressum.astro`. § 5 DDG required fields + § 18 (2) MStV + standard liability/copyright boilerplate. Bilingual (DE block, then `<hr>`, then EN block).
- **`/datenschutz`** — `src/pages/datenschutz.astro`. Bilingual, processor-specific (Vercel, Web3Forms, mailbox.org, Cloudinary, GoatCounter). Covers data flows, legal bases (Art. 6 DSGVO), DPF/SCC posture, data-subject rights (Art. 15–22), and right to complain (Art. 77 → BlnBDI Berlin). Section 4 was rewritten 2026-07-12 when the site moved from Cloudflare Email Routing (US) to mailbox.org (Berlin/EU) — the section now describes an EU processor with no Drittstaatentransfer.
- **Address on Impressum** is the user's full street + house number per strict § 5 DDG (`ladungsfähige Anschrift`). Privacy exposure is mitigated three ways: (1) read from `IMPRESSUM_STREET` env var at build time (set in `.env.local` for dev + Vercel dashboard for prod — **never** committed to the public repo); (2) char-code-encoded in `data-c` by `<ObfuscatedText>` so it's not in static HTML either; (3) the whole page is `noindex` + sitemap-excluded + `robots.txt`-disallowed. To change the address: update `IMPRESSUM_STREET` in Vercel dashboard (use UI, not CLI — see [[feedback_vercel_env_rebuild]]) and `.env.local`. Postal code + city (`12049 Berlin`) stay hardcoded in `src/pages/impressum.astro` (not sensitive; already in /datenschutz, DPA references, etc.).
- **Email + address obfuscation (scraper-safety pass)**: `src/components/ObfuscatedEmail.astro` (clickable `<a>` → `mailto:`) and `src/components/ObfuscatedText.astro` (`<span>` for multi-line text). Both encode the prop value as comma-joined char codes in data attributes; the decoder lives as an inline `<script is:inline>` in `BaseLayout.astro` that runs on `astro:page-load`. Defeats bulk regex/curl scrapers — the literal email + street never appear in static HTML. **Use these whenever you'd otherwise write a `mailto:` link or a PII string.** Do NOT add raw email strings back to JSON-LD, OG tags, or content collections. The inline `onclick="return this.dataset.done==='1'"` on `ObfuscatedEmail` is a race-condition guard that will need to migrate to an event listener when CSP is implemented (filed under deferred items).
- **Legal pages are noindex + sitemap-excluded + robots-disallowed** — `/impressum` and `/datenschutz` are `noindex,nofollow,noarchive` via the `BaseLayout` prop; `astro.config.mjs` `sitemap({ filter })` keeps them out of `sitemap-0.xml`; `public/robots.txt` has explicit `Disallow:` entries. Three layers of belt-and-suspenders against well-behaved crawlers.
- **Security headers via `vercel.json`** — sitewide HTTP headers live under the `headers` array in `vercel.json`, not in `BaseLayout` meta tags. Currently set: `Referrer-Policy: strict-origin-when-cross-origin` (strips path from referer sent to third parties like Cloudinary, GoatCounter), `X-Content-Type-Options: nosniff` (blocks MIME-sniffing attacks), `X-Frame-Options: DENY` (blocks all iframe embedding — clickjacking defense; the site never needs to be iframed). When adding more (CSP, Permissions-Policy, etc.), append to the same `headers` block with the same `"source": "/(.*)"` matcher. CSP is deliberately deferred — see [[csp-deferred]] for why and the rough implementation shape when it's time.
- **No cookie banner** — the site is genuinely cookie-free. GoatCounter is the only telemetry, and its cookieless hashed-IP + daily-rotating-salt design falls outside § 25 TDDDG. No visitor-facing page uses LocalStorage or SessionStorage (see the storage note in the theme section — the operator-only CMS tools do, and `/datenschutz` is worded to match). Don't add a banner; it would hurt UX with zero legal upside.
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
