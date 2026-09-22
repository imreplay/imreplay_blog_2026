import { defineConfig } from 'astro/config';
import { resolveDeployment } from './src/lib/deployment.mjs';

const { site, base } = resolveDeployment(process.env);

export default defineConfig({
  site,
  base,
  output: 'static',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  markdown: {
    shikiConfig: { theme: 'github-dark' },
  },
});
