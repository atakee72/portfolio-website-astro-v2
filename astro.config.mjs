import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  site: 'https://yourdomain.com', // Update with your actual domain
  integrations: [
    svelte(),
    mdx(),
    tailwind({
      applyBaseStyles: false, // We'll use our own globals.css
    }),
    sitemap(),
  ],
  output: 'static',
  // TypeScript paths in tsconfig.json handle @ alias
});