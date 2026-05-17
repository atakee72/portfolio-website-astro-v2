import { defineCollection, z } from 'astro:content';

const rollsCollection = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    location: z.string(),
    tags: z.array(z.string()).default([]),
    cover: z.object({
      cldPath: z.string(),
      alt: z.string(),
    }),
    photos: z
      .array(
        z.object({
          cldPath: z.string(),
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
    author: z.object({
      name: z.string(),
      image: z.string().optional(),
      bio: z.string().optional(),
    }),
    mainImage: z.object({
      src: z.string(),
      alt: z.string(),
    }),
    categories: z.array(z.string()).default([]),
    stack: z.array(z.string()).default([]),
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

export const collections = {
  blog: blogCollection,
  testimonials: testimonialsCollection,
  rolls: rollsCollection,
  projects: projectsCollection,
};
