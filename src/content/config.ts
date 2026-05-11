import { defineCollection, z } from 'astro:content';

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

export const collections = {
  blog: blogCollection,
  testimonials: testimonialsCollection,
};
