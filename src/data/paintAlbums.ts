/**
 * Painting albums — the /paints section groups individual paintings
 * (src/content/paintings/*.json) into albums by their `series` field.
 *
 * To create a new album: give its paintings a shared `series` value in
 * Sveltia, then register the album here. Paintings whose series has no
 * entry here won't appear until one is added.
 */

export interface PaintAlbum {
  /** URL segment: /paints/<slug> */
  slug: string;
  /** Must match the `series` field on the album's paintings. */
  series: string;
  title: string;
  years: string;
  dimensions: string;
  description: string;
  /** Cloudinary public_id for the album cover. */
  cover: string;
  coverAlt: string;
}

export const paintAlbums: PaintAlbum[] = [
  {
    slug: 'my-early-paintings',
    series: 'Famous paintings',
    title: 'My Early Paintings',
    years: '2022–2025',
    dimensions: 'mostly A3',
    description:
      'The earliest attempts at painting consisted largely of reproductions of works by famous artists.',
    cover: 'paints/boy-with-woodcock',
    coverAlt:
      'Blue monochrome watercolour portrait of a young man holding a woodcock',
  },
];

export const albumForSeries = (series?: string) =>
  paintAlbums.find((a) => a.series === series);
