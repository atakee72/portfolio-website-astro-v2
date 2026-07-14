import { getCollection, type CollectionEntry } from 'astro:content';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

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

type ExifEntry = {
  camera?: string;
  lens?: string;
  iso?: number;
  aperture?: string;
  shutter?: string;
  focalLength?: string;
  dateTaken?: string;
};
type ExifCache = Record<string, ExifEntry>;

let _exifCache: ExifCache | null = null;
function loadExifCache(): ExifCache {
  if (_exifCache !== null) return _exifCache;
  const here = dirname(fileURLToPath(import.meta.url));
  const cachePath = resolve(here, '../../.astro/exif-cache.json');
  if (!existsSync(cachePath)) {
    _exifCache = {};
    return _exifCache;
  }
  try {
    _exifCache = JSON.parse(readFileSync(cachePath, 'utf-8'));
    return _exifCache!;
  } catch {
    _exifCache = {};
    return _exifCache;
  }
}

export async function getAllRolls() {
  const rolls = await getCollection('rolls', ({ data }) => {
    if (import.meta.env.PROD) {
      return data.draft !== true;
    }
    return true;
  });

  const exifCache = loadExifCache();

  const enriched = rolls.map((roll) => ({
    ...roll,
    data: {
      ...roll.data,
      photos: roll.data.photos.map((photo) => {
        const cached = exifCache[photo.cldPath];
        if (!cached) return photo;
        return {
          ...photo,
          exif: {
            ...photo.exif,
            ...cached,
            dateTaken: cached.dateTaken
              ? new Date(cached.dateTaken)
              : photo.exif.dateTaken,
          },
        };
      }),
    },
  }));

  return enriched.sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf()
  );
}

export async function getRollBySlug(slug: string) {
  const rolls = await getAllRolls();
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

export async function getAllProjects() {
  const projects = await getCollection('projects', ({ data }) => {
    if (import.meta.env.PROD) {
      return data.draft !== true;
    }
    return true;
  });

  return projects.sort((a, b) => {
    // Featured first, then publishedAt desc.
    if (a.data.featured !== b.data.featured) {
      return a.data.featured ? -1 : 1;
    }
    return b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf();
  });
}

/**
 * Look up a project by slug. Returns drafts in all environments
 * (matches `getPostBySlug` convention) — so draft case studies can
 * be previewed via direct URL in prod. The static page itself is
 * only generated for non-drafts, since `[slug].astro` uses
 * `getAllProjects()` which prod-filters drafts.
 */
export async function getProjectBySlug(slug: string) {
  const projects = await getCollection('projects');
  return projects.find((p) => p.slug === slug);
}

// One entry per ALBUM; paintings live inside as an ordered array
// (curated order — reorder in Sveltia, like roll photos).
export async function getAllPaintAlbums() {
  return getCollection('paintings', ({ data }) => {
    if (import.meta.env.PROD) {
      return data.draft !== true;
    }
    return true;
  });
}

export type BlogPost = CollectionEntry<'blog'>;
export type Roll = CollectionEntry<'rolls'>;
export type Project = CollectionEntry<'projects'>;
export type PaintAlbum = CollectionEntry<'paintings'>;
export type Painting = PaintAlbum['data']['paintings'][number];
export type Testimonial = {
  name: string;
  company: string;
  message: string;
  image?: string;
  rating?: number;
};
