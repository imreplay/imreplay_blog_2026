import { readFile, readdir, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';
import assert from 'node:assert/strict';
import { resolveDeployment } from '../src/lib/deployment.mjs';

const { site, base } = resolveDeployment(process.env);
const prefix = base === '/' ? '/' : `${base}/`;
const walk = async directory => (await Promise.all((await readdir(directory, { withFileTypes: true })).map(entry => entry.isDirectory() ? walk(join(directory, entry.name)) : join(directory, entry.name)))).flat();
const files = await walk('dist');
const pages = files.filter(file => file.endsWith('.html'));
let checked = 0;
for (const file of pages) {
  const html = await readFile(file, 'utf8');
  assert.ok(html.includes('lang="ko"'), `${file}: document language missing`);
  assert.ok(html.includes('name="description"'), `${file}: description missing`);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const value = match[1].replaceAll('&amp;', '&');
    if (!value.startsWith('/') || value.startsWith('//')) continue;
    const url = new URL(value, site);
    assert.ok(url.pathname.startsWith(prefix), `${file}: link escapes deployment base: ${value}`);
    let relative = decodeURIComponent(url.pathname.slice(prefix.length));
    if (!extname(relative)) relative += `${relative.endsWith('/') || !relative ? '' : '/'}index.html`;
    assert.ok((await stat(join('dist', relative))).isFile(), `${file}: missing destination ${relative}`);
    checked++;
  }
}
for (const required of ['rss.xml', 'sitemap.xml', 'robots.txt', '404.html', '.nojekyll']) assert.ok(files.includes(join('dist', required)), `Missing ${required}`);
const feed = await readFile('dist/rss.xml', 'utf8');
assert.ok(feed.includes(`${site}${prefix}`), 'RSS does not contain the configured home URL');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const path of ['', 'posts/']) {
  assert.ok(sitemap.includes(`<loc>${site}${prefix}${path}</loc>`), `Sitemap is missing ${path || 'home'}`);
}
assert.ok(!files.includes(join('dist', 'posts', 'hello-world', 'index.html')), 'Deleted welcome article must not remain in the build');
const home = await readFile('dist/index.html', 'utf8');
const about = await readFile('dist/about/index.html', 'utf8');
assert.ok(home.includes('Experience') && home.includes('DEF CON 34 CTF Finals'), 'The homepage must display the profile');
assert.ok(about.includes('사이버방호센터 772기'), 'The existing about route must retain the updated profile');
for (const html of [home, about]) assert.ok(html.includes(`rel="canonical" href="${site}${prefix}"`), 'Profile routes must use the homepage canonical URL');
for (const file of [...pages, 'dist/rss.xml', 'dist/sitemap.xml']) {
  const output = await readFile(file, 'utf8');
  assert.ok(!output.includes('다시, 기록을 시작하며'), `${file}: deleted welcome article remains visible`);
  assert.ok(!output.includes('blog.imreplay.com'), `${file}: removed legacy blog links remain in the build`);
  assert.ok(!output.includes(`${prefix}archive/`), `${file}: removed archive route remains linked`);
}
console.log(`Verified ${pages.length} HTML pages, ${checked} local references, RSS, sitemap and required deployment files (base: ${base}).`);
