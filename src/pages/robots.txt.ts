import type { APIRoute } from 'astro';
import { withBase } from '../lib/posts';
export const GET: APIRoute = ({ site }) => new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL(withBase('sitemap.xml'), site).href}\n`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
