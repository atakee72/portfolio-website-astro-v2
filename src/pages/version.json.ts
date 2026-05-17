import type { APIRoute } from 'astro';

export const prerender = true;

export const GET: APIRoute = () => {
  const sha = (process.env.VERCEL_GIT_COMMIT_SHA ?? 'dev').slice(0, 7);
  return new Response(JSON.stringify({ sha }), {
    headers: { 'content-type': 'application/json' },
  });
};
