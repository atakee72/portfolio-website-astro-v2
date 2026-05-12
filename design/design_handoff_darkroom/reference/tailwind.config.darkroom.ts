import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

/**
 * Darkroom-redesign Tailwind config.
 *
 * Drop in place of the existing `tailwind.config.ts`. The old
 * `primary`/`secondary`/`lightGray`/`brown`/`yavru` tokens have been
 * removed; if you need a transitional period, alias them in the
 * `colors` block below.
 */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xxs: '300px',
      xs: '475px',
      ...defaultTheme.screens,
    },
    extend: {
      colors: {
        ink:        '#0d0d0c',
        'ink-2':    '#18181a',
        'ink-3':    '#2a2a28',
        mute:       '#6a6a66',
        'mute-2':   '#9a9a92',
        'paper-2':  '#c2bfb6',
        paper:      '#e8e5dd',
        'paper-hi': '#f4f1ea',
        safelight:  '#ff3b30',
        phosphor:   '#d4ff3a',
      },
      fontFamily: {
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Space Grotesk"', '"Inter"', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        display:  ['124px', { lineHeight: '0.88', letterSpacing: '-0.04em' }],
        h2:       ['26px',  { lineHeight: '1.1',  letterSpacing: '-0.02em' }],
        label:    ['13px',  { lineHeight: '1.5',  letterSpacing: '0.18em' }],
        micro:    ['10px',  { lineHeight: '1.4',  letterSpacing: '0.16em' }],
      },
      letterSpacing: {
        tightish: '-0.02em',
        wider2:   '0.12em',
        wider3:   '0.16em',
        wider4:   '0.18em',
      },
      borderRadius: {
        none: '0',
        DEFAULT: '0', // be explicit — no rounded corners on this site
      },
      zIndex: {
        grid:    '1',
        chrome:  '10',
        reticle: '50',
        modal:   '90',
      },
      keyframes: {
        darkBlink: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0' },
        },
      },
      animation: {
        darkBlink: 'darkBlink 1s steps(2) infinite',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
} satisfies Config;
