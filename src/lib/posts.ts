import { getCollection, type CollectionEntry } from 'astro:content';

export const withBase = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const postUrl = (post: CollectionEntry<'posts'>) => post.data.externalUrl ?? withBase(`posts/${post.id}/`);
export const getPosts = async () => (await getCollection('posts', ({ data }) => !data.draft))
  .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.data.title.localeCompare(b.data.title));
export const formatDate = (date: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date).replaceAll('-', '.');
export const readingTime = (body = '') => Math.max(1, Math.ceil(body.split(/\s+/).length / 180));
