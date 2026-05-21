import rss, { type RSSFeedItem } from '@astrojs/rss';
import type { APIContext } from 'astro';
import {
  getAllBlogPosts,
  getAllProjects,
  getAllRolls,
  getAllPaintings,
} from '@/lib/content';

export async function GET(context: APIContext) {
  const [posts, projects, rolls, paintings] = await Promise.all([
    getAllBlogPosts(),
    getAllProjects(),
    getAllRolls(),
    getAllPaintings(),
  ]);

  const items: RSSFeedItem[] = [
    ...posts.map((p) => ({
      title: p.data.title,
      link: `/blog/${p.slug}/`,
      pubDate: p.data.publishedAt,
      description: p.data.description,
      categories: [...p.data.categories, 'blog'],
    })),
    ...projects.map((p) => ({
      title: p.data.title,
      link: `/work/${p.slug}/`,
      pubDate: p.data.publishedAt,
      description: p.data.subtitle,
      categories: [...p.data.exif.tags, 'work'],
    })),
    ...rolls.map((r) => ({
      title: r.data.title,
      link: `/lens/${r.id}/`,
      pubDate: r.data.date,
      description: `${r.data.location} · ${r.data.photos.length} frames`,
      categories: [...r.data.tags, 'lens'],
    })),
    ...paintings.map((p) => ({
      title: p.data.title,
      link: `/paints/${p.id}/`,
      pubDate: new Date(
        `${p.data.year.match(/\d{4}/)?.[0] ?? '1970'}-01-01`
      ),
      description: p.data.description ?? `${p.data.medium} · ${p.data.year}`,
      categories: [...p.data.tags, ...p.data.subjects, 'paints'],
    })),
  ].sort(
    (a, b) =>
      new Date(b.pubDate as Date).valueOf() -
      new Date(a.pubDate as Date).valueOf()
  );

  return rss({
    title: 'Ercan Atak — three darkrooms',
    description:
      'Journal entries, case studies, photo rolls, and paintings — one combined feed.',
    site: context.site!,
    items,
    customData: `<language>en-us</language>`,
  });
}
