import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://ercan-atak.de',
  integrations: [
    svelte(),
    mdx(),
    tailwind({
      applyBaseStyles: false, // We'll use our own globals.css
    }),
    sitemap({
      // Keep out anything that is noindex or robots-disallowed — submitting a
      // URL you also forbid is a Search Console warning and nothing else.
      // /reblog is the operator-only linkpost capture tool (noindex).
      filter: (page) =>
        !page.endsWith('/impressum/') &&
        !page.endsWith('/datenschutz/') &&
        !page.includes('/reblog'),
    }),
  ],
  output: 'static',
  // TypeScript paths in tsconfig.json handle @ alias
});