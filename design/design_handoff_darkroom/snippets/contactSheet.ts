/**
 * Seed data for the 3x3 contact sheet. Place at src/data/contactSheet.ts.
 *
 * Frame types:
 *   photo — placeholder gradient keyed by `tone` (a, b, d, e, g)
 *   paint — warm gradient keyed by `tone` (c, f)
 *   code  — black panel with monospace text inside
 *
 * Once Ercan provides real photographs and paintings, change `tone` to
 * `src` and render an <img> inside the frame; the rest of the layout
 * stays unchanged.
 */

export type Frame =
  | { k: 'photo'; tone: 'a' | 'b' | 'd' | 'e' | 'g'; label: string; tag: string }
  | { k: 'paint'; tone: 'c' | 'f'; label: string; tag: string }
  | { k: 'code'; text: string; tag: string };

export const contactSheet: Frame[] = [
  { k: 'photo', tone: 'a', label: 'TEMPELHOF · 18:42', tag: 'PORTRA 400' },
  { k: 'code',  text: 'export default function Page() {\n  return <Studio />;\n}', tag: 'ASTRO 5' },
  { k: 'photo', tone: 'b', label: 'BOSPORUS · 07:11',   tag: '35MM' },
  { k: 'paint', tone: 'c', label: 'POMEGRANATES · STUDIO', tag: 'OIL · 50×40' },
  { k: 'photo', tone: 'd', label: 'KREUZBERG · NIGHT',  tag: 'TRI-X 400' },
  { k: 'code',  text: '$ pnpm build\n  ✓ 22 pages\n  ✓ 0 warnings', tag: 'BUILD OK' },
  { k: 'photo', tone: 'e', label: 'STUDIO · NORTH LIGHT', tag: '120MM' },
  { k: 'paint', tone: 'f', label: 'AFTER BONNARD',      tag: 'GOUACHE' },
  { k: 'photo', tone: 'g', label: 'U-BAHN · 23:54',     tag: 'PUSHED +1' },
];

/* ------------------------------------------------------------------------ */
/*  Placeholder gradient helpers — replace with <img> once real assets land */
/* ------------------------------------------------------------------------ */

const PHOTO: Record<string, string> = {
  a: 'radial-gradient(120% 80% at 30% 70%, #5a4a32 0%, #1a1815 60%, #0a0908 100%)',
  b: 'linear-gradient(180deg, #3a4d52 0%, #1a2227 70%, #0a0e10 100%)',
  d: 'radial-gradient(100% 60% at 50% 100%, #6a2a2e 0%, #1a0d0e 60%, #08070a 100%)',
  e: 'linear-gradient(180deg, #2a2a28 0%, #4a4845 50%, #1a1816 100%)',
  g: 'linear-gradient(180deg, #1a1815 0%, #2a2520 50%, #0a0908 100%)',
};

const PAINT: Record<string, string> = {
  c: 'radial-gradient(60% 50% at 50% 60%, #c8332a 0%, #5a1814 60%, #1a0807 100%)',
  f: 'linear-gradient(160deg, #c4a76b 0%, #6e5a3a 60%, #2a2316 100%)',
};

export function photoBg(tone: string) {
  return { background: PHOTO[tone] ?? PHOTO.a };
}
export function paintBg(tone: string) {
  return { background: PAINT[tone] ?? PAINT.c };
}
