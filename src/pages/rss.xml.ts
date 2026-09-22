import type { APIRoute } from 'astro';
import { getPosts, withBase, postUrl } from '../lib/posts';
const escape = (value: string) => value.replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' })[char]!);
export const GET: APIRoute = async ({ site }) => {
  const posts = await getPosts();
  const home = new URL(withBase(), site).href;
  const items = posts.map(post => { const url = new URL(postUrl(post), site).href; return `<item><title>${escape(post.data.title)}</title><link>${escape(url)}</link><guid isPermaLink="true">${escape(url)}</guid><pubDate>${post.data.date.toUTCString()}</pubDate><description>${escape(post.data.description)}</description><category>${escape(post.data.category)}</category></item>`; }).join('');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>imreplay</title><link>${escape(home)}</link><description>보안 연구와 CTF, 그리고 배움의 기록.</description><language>ko</language><atom:link href="${escape(new URL(withBase('rss.xml'), site).href)}" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
