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

export async function getAllRolls() {
  const rolls = await getCollection('rolls', ({ data }) => {
    if (import.meta.env.PROD) {
      return data.draft !== true;
    }
    return true;
  });

  return rolls.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}

export async function getRollBySlug(slug: string) {
  const rolls = await getCollection('rolls');
  return rolls.find((r) => r.id === slug);
}

export async function getAllPhotoEntries() {
  const rolls = await getAllRolls();
  return rolls.flatMap((roll) =>
    roll.data.photos.map((photo, i) => ({
      rollSlug: roll.id,
      roll,
      n: i + 1,
      photo,
    }))
  );
}

export type BlogPost = CollectionEntry<'blog'>;
export type Roll = CollectionEntry<'rolls'>;
export type Testimonial = {
  name: string;
  company: string;
  message: string;
  image?: string;
  rating?: number;
};
