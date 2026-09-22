import { existsSync } from 'node:fs';
import { defineCollection } from 'astro:content';
import { glob, type Loader } from 'astro/loaders';
import { z } from 'astro/zod';

const markdownLoader = glob({ pattern: '**/*.md', base: './src/content/posts' });
const postsLoader: Loader = {
  ...markdownLoader,
  async load(context) {
    // The glob loader returns early for an empty directory; prune deleted files first.
    for (const id of context.store.keys()) {
      const entry = context.store.get(id);
      if (entry?.filePath && !existsSync(new URL(entry.filePath, context.config.root))) {
        context.store.delete(id);
      }
    }
    await markdownLoader.load(context);
  },
};

const posts = defineCollection({
  loader: postsLoader,
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    externalUrl: z.url({ protocol: /^https?$/ }).optional(),
    cover: z.enum(['note', '59', '60', '61']).default('note'),
  }),
});

export const collections = { posts };
