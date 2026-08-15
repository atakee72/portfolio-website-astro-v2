import { getCldImageUrl } from 'astro-cloudinary/helpers';

/**
 * The © ATAK watermark — Courier bold, white at 70%, bottom-right. Defined ONCE
 * here and shared by every path that serves a photo or painting, because the
 * og:image used to be built separately and shipped unwatermarked: social cards
 * were the one derivative that skipped it.
 *
 * SIZED RELATIVE TO THE IMAGE, not in absolute pixels. The overlay is stamped
 * on the ORIGINAL before any resize, so a fixed `fontSize: 40` is 40 pixels of
 * whatever the source happens to be — which is a constant fraction only if
 * every source is the same size. Ours are not: rolls uploaded through
 * `pnpm prep` are capped at 2000px (40px ≈ 2% of width), but the u-bahn roll
 * was uploaded by hand from Instagram exports at 640–1440px, where the same
 * stamp reached 6.3% and looked enormous. `flags: ['relative']` + `width: 0.1`
 * pins it to 10% of image width everywhere; the x/y padding is relative too,
 * or it drifts for the same reason. (Diagnosed 2026-08-15 from a 640×427 frame.)
 *
 * Courier (not JetBrains Mono) is deliberate — Cloudinary text overlays only
 * support a fixed set of fonts, and a custom family returns HTTP 400 with an
 * `x-cld-error: Unsupported font family` header and a broken-image GIF.
 */
export const WATERMARK_OVERLAYS = [
  {
    text: {
      text: '© ATAK',
      fontFamily: 'Courier',
      fontSize: 40,
      fontWeight: 'bold',
      color: 'white',
    },
    width: 0.1,
    flags: ['relative'] as const,
    position: {
      gravity: 'south_east',
      x: 0.02,
      y: 0.02,
      flags: ['relative'] as const,
    },
    effects: [{ opacity: 70 }],
  },
];

/** Strips GPS, camera serials and software fingerprints from the delivered file. */
export const STRIP_METADATA = ['fl_strip_profile'];

/**
 * Social-card image for a Cloudinary-hosted photo or painting: a 1200x630
 * auto-gravity crop carrying the same watermark and metadata strip as the
 * in-page image. Use this instead of calling `getCldImageUrl` directly, or the
 * card goes out unmarked.
 */
export function ogImageUrl(cldPath: string): string {
  return getCldImageUrl({
    src: cldPath,
    // ORDER MATTERS, and getting it wrong fails silently.
    //
    // getCldImageUrl emits rawTransformations FIRST, then overlays, then any
    // width/height/crop it is given. So the crop must ride in the raw list —
    // otherwise the watermark is stamped on the bottom-right of the full-size
    // original and the subsequent `g_auto` crop throws that corner away. The
    // URL still contains `l_text`, the request still returns 200, and the card
    // is still unwatermarked: the only tell is that the bytes are identical to
    // the unstamped version. Verified 2026-08-15 by fetching and looking at it.
    rawTransformations: [...STRIP_METADATA, 'c_fill,w_1200,h_630,g_auto'],
    overlays: WATERMARK_OVERLAYS,
  });
}
