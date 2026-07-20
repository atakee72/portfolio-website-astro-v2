import { defineCollection, z } from 'astro:content';

// Normalize a Cloudinary reference to a bare public_id (e.g. `paints/x`).
// Sveltia's media widget stores full delivery URLs (with folder, version and
// extension); scripts and hand-written entries store bare public_ids. Accept
// both so a widget-picked image can never break rendering or EXIF lookup.
const cldPath = z.string().transform((v) => {
  let s = v
    .replace(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?/, '')
    .replace(/\.(jpe?g|png|webp|gif|avif|tiff?)$/i, '');
  // Delivery URLs are percent-encoded (folders with spaces → %20). Public IDs
  // must hold the raw characters or the URL builder double-encodes (%2520 → 404).
  try {
    s = decodeURIComponent(s);
  } catch {
    // Not valid percent-encoding (e.g. a literal % in a bare ID) — keep as-is.
  }
  return s;
});

const rollsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string(),
    tags: z.array(z.string()).default([]),
    // Optional override — roll cards fall back to the first photo,
    // so the cover is always viewable inside the roll (same as albums).
    cover: z
      .object({
        cldPath,
        alt: z.string(),
      })
      .optional(),
    photos: z
      .array(
        z.object({
          cldPath,
          alt: z.string(),
          caption: z.string().optional(),
          exif: z
            .object({
              camera: z.string().optional(),
              lens: z.string().optional(),
              iso: z.number().optional(),
              aperture: z.string().optional(),
              shutter: z.string().optional(),
              focalLength: z.string().optional(),
              dateTaken: z.coerce.date().optional(),
            })
            .default({}),
        })
      )
      .min(1),
    draft: z.boolean().default(false),
  }),
});

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.object({
      name: z.string(),
      image: z.string().optional(),
      bio: z.string().optional(),
    }),
    mainImage: z
      .object({
        src: z.string(),
        alt: z.string(),
      })
      .optional(),
    categories: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
    externalUrl: z.string().url().or(z.literal('')).optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const testimonialsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    testimonials: z.array(
      z.object({
        name: z.string(),
        company: z.string(),
        message: z.string(),
        image: z.string().optional(),
        rating: z.number().min(1).max(5).optional(),
      })
    ),
  }),
});

const projectsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    publishedAt: z.coerce.date(),
    featured: z.boolean().default(false),
    // `cloud: true` ⇒ `src` is a Cloudinary public_id (rendered via CloudPhoto).
    // `cloud: false` ⇒ `src` is a local /assets/... path (rendered via <img>).
    cover: z.object({
      src: z.string(),
      alt: z.string(),
      cloud: z.boolean().default(false),
    }),
    screenshots: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
          cloud: z.boolean().default(false),
        })
      )
      .default([]),
    exif: z.object({
      stack: z.string(),
      year: z.string(),
      status: z.enum(['live', 'archived', 'wip']),
      role: z.string().optional(),
      tags: z.array(z.string()).default([]),
    }),
    links: z
      .object({
        github: z.string().url().optional(),
        live: z.string().url().optional(),
      })
      .default({}),
    draft: z.boolean().default(false),
  }),
});

// One file per ALBUM (like rolls): the entry holds all its paintings.
// The file's id is the URL segment (/paints/<album>), each painting's
// `id` is the detail-page segment (/paints/<album>/<id>).
const paintingsCollection = defineCollection({
  type: 'data',
  schema: z
    .object({
      title: z.string(),
      years: z.string(),
      dimensions: z.string().optional(),
      description: z.string().optional(),
      // Optional override — the album card falls back to the first
      // painting's image, so every cover is viewable inside the album.
      cover: z
        .object({
          cldPath,
          alt: z.string(),
        })
        .optional(),
      paintings: z
        .array(
          z.object({
            id: z
              .string()
              .regex(/^[a-z0-9-]+$/, 'lowercase letters, digits, dashes only'),
            title: z.string(),
            year: z.string(),
            medium: z.string(),
            subjects: z.array(z.string()).default([]),
            dimensions: z.string().optional(),
            description: z.string().optional(),
            image: z.object({
              cldPath,
              alt: z.string(),
            }),
            tags: z.array(z.string()).default([]),
          })
        )
        .min(1),
      draft: z.boolean().default(false),
    })
    .refine(
      (a) => new Set(a.paintings.map((p) => p.id)).size === a.paintings.length,
      { message: 'painting ids must be unique within the album' }
    ),
});

export const collections = {
  blog: blogCollection,
  testimonials: testimonialsCollection,
  rolls: rollsCollection,
  projects: projectsCollection,
  paintings: paintingsCollection,
};
