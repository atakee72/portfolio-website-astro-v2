/**
 * Seed data for the 3x3 contact sheet on the homepage.
 *
 * Frame types:
 *   photo — placeholder gradient keyed by `tone` (a, b, d, e, g)
 *   paint — warm gradient keyed by `tone` (c, f)
 *   code  — black panel with monospace text inside
 *
 * `slug` on photo frames links the cell to a /lens/<slug> roll page.
 * When set, the lightbox shows a "see full roll →" CTA. When unset,
 * the lightbox enlarges the placeholder gradient only.
 */

export type Frame =
  | { k: 'photo'; tone: 'a' | 'b' | 'd' | 'e' | 'g'; label: string; tag: string; slug?: string }
  | { k: 'paint'; tone: 'c' | 'f'; label: string; tag: string }
  | { k: 'code'; text: string; tag: string };

export const contactSheet: Frame[] = [
  { k: 'photo', tone: 'a', label: 'TEMPELHOF · 18:42', tag: 'PORTRA 400', slug: 'animals' },
  { k: 'code', text: '// agents.dispatch()\n\nconst agents = [\n  goalFinder,\n  talentFinder,\n  jobScout,\n]\n\nrun({ thread, profile, tools })', tag: 'DISPATCH' },
  { k: 'photo', tone: 'b', label: 'BOSPORUS · 07:11', tag: '35MM' },
  { k: 'code', text: '$ pnpm build\n  ✓ 22 pages\n  ✓ 0 warnings', tag: 'BUILD OK' },
  { k: 'photo', tone: 'd', label: 'KREUZBERG · NIGHT', tag: 'TRI-X 400' },
  { k: 'paint', tone: 'c', label: 'POMEGRANATES · STUDIO', tag: 'OIL · 50×40' },
  { k: 'photo', tone: 'g', label: 'U-BAHN · 23:54', tag: 'PUSHED +1' },
  { k: 'paint', tone: 'f', label: 'AFTER BONNARD', tag: 'GOUACHE' },
  { k: 'code', text: '// react\nconst [n, setN] = useState(0);\n\n// svelte\nlet n = $state(0);', tag: 'RUNES' },
];

const PHOTO: Record<string, string> = {
  a: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)',
  b: 'linear-gradient(180deg, #3a4d52 0%, #1a2227 70%, #0a0e10 100%)',
  d: 'radial-gradient(100% 60% at 50% 100%, #6a2a2e 0%, #1a0d0e 60%, #08070a 100%)',
  e: 'linear-gradient(180deg, #2a2a28 0%, #4a4845 50%, #1a1816 100%)',
  g: 'linear-gradient(180deg, #1a1815 0%, #2a2520 50%, #0a0908 100%)',
};

const PAINT: Record<string, string> = {
  c: 'radial-gradient(60% 50% at 50% 60%, oklch(0.45 0.18 25) 0%, #5a1814 60%, #1a0807 100%)',
  f: 'linear-gradient(160deg, #c4a76b 0%, #6e5a3a 60%, #2a2316 100%)',
};

export function photoBg(tone: string) {
  return { background: PHOTO[tone] ?? PHOTO.a };
}
export function paintBg(tone: string) {
  return { background: PAINT[tone] ?? PAINT.c };
}
