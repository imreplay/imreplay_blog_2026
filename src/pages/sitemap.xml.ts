import type { APIRoute } from 'astro';
import { getPosts, withBase } from '../lib/posts';
export const GET: APIRoute = async ({ site }) => {
  const posts = (await getPosts()).filter(post => !post.data.externalUrl);
  const paths = ['', 'posts/', ...posts.map(post => `posts/${post.id}/`)];
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${new URL(withBase(path), site).href.replaceAll('&', '&amp;')}</loc></url>`).join('')}</urlset>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
