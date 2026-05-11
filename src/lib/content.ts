import { getCollection, type CollectionEntry } from 'astro:content';

export async function getAllBlogPosts() {
  const posts = await getCollection('blog', ({ data }) => {
    // Filter out drafts in production
    if (import.meta.env.PROD) {
      return data.draft !== true;
    }
    return true;
  });

  return posts.sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
  );
}

export async function getPostBySlug(slug: string) {
  const posts = await getCollection('blog');
  return posts.find((post) => post.slug === slug);
}

export async function getAllTestimonials() {
  const testimonials = await getCollection('testimonials');
  return testimonials[0]?.data.testimonials || [];
}

export type BlogPost = CollectionEntry<'blog'>;
export type Testimonial = {
  name: string;
  company: string;
  message: string;
  image?: string;
  rating?: number;
};
