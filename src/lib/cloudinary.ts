import { getCldImageUrl } from 'astro-cloudinary/helpers';

/**
 * The © ATAK watermark — Courier bold, white at 70%, bottom-right with 32px
 * padding. Defined ONCE here and shared by every path that serves a photo or
 * painting, because the og:image used to be built separately and shipped
 * unwatermarked: social cards were the one derivative that skipped it.
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
    position: {
      gravity: 'south_east',
      x: 32,
      y: 32,
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
