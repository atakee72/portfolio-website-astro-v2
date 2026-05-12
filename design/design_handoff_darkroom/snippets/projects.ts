/**
 * Canonical list of real projects. Replaces the inline `projects` array
 * inside the old MyAccordion.astro. Place at src/data/projects.ts.
 */

export type Project = {
  slug: string;
  title: string;
  subtitle: string;
  url: string;
  cover: string;
  alt: string;
  exif: {
    stack: string;
    year: string;
    status: 'live' | 'archived' | 'wip';
  };
};

export const projects: Project[] = [
  {
    slug: 'mahalle',
    title: 'MaHalle',
    subtitle: 'Home-made Facebook for the Kiez',
    url: 'https://mahalle-kiez-gesichterbuch.vercel.app',
    cover: '/assets/maHalle.png',
    alt: 'Logo of MaHalle',
    exif: { stack: 'Next.js + Mongo', year: '2024', status: 'live' },
  },
  {
    slug: 'dogs-and-films',
    title: 'Dogs & Films',
    subtitle: 'A catalogue, two obsessions',
    url: 'https://dogs-n-films-catalog-app.vercel.app',
    cover: '/assets/graduate.jpg',
    alt: 'Cover picture of Dogs and Films',
    exif: { stack: 'Next.js + Tailwind', year: '2023', status: 'live' },
  },
  {
    slug: 'quiet-dashboard',
    title: 'Quiet Dashboard',
    subtitle: 'Admin, restrained',
    url: '#',
    cover: '/assets/dashboard.png',
    alt: 'Cover picture of the Dashboard',
    exif: { stack: 'Next.js + Sass', year: '2023', status: 'archived' },
  },
];
