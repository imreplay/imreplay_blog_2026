import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveDeployment } from '../src/lib/deployment.mjs';

test('the personal site defaults to the imreplay.com homepage', () => {
  assert.deepEqual(resolveDeployment({}), { site: 'https://imreplay.com', base: '/' });
});
test('the production domain keeps the profile at root in any repository', () => {
  assert.deepEqual(resolveDeployment({ GITHUB_REPOSITORY: 'imreplay/blog', SITE_URL: 'https://imreplay.com' }), { site: 'https://imreplay.com', base: '/' });
});
test('GitHub user sites serve from the domain root, including mixed-case owner names', () => {
  assert.deepEqual(resolveDeployment({ GITHUB_REPOSITORY: 'Imreplay/imreplay.github.io' }), { site: 'https://imreplay.github.io', base: '/' });
});
test('GitHub project sites keep repository path and case', () => {
  assert.deepEqual(resolveDeployment({ GITHUB_REPOSITORY: 'imreplay/MyBlog' }), { site: 'https://imreplay.github.io', base: '/MyBlog' });
});
test('a custom domain overrides the GitHub repository path', () => {
  assert.deepEqual(resolveDeployment({ GITHUB_REPOSITORY: 'imreplay/blog', SITE_URL: 'https://blog.example.com/' }), { site: 'https://blog.example.com', base: '/' });
});
test('an explicit site URL can use a subdirectory', () => {
  assert.deepEqual(resolveDeployment({ SITE_URL: 'https://example.com/writing/' }), { site: 'https://example.com', base: '/writing' });
});
test('an empty optional CI variable retains automatic GitHub configuration', () => {
  assert.equal(resolveDeployment({ SITE_URL: '', GITHUB_REPOSITORY: 'imreplay/blog' }).base, '/blog');
});
test('invalid repository identifiers and non-web site URLs fail early', () => {
  assert.throws(() => resolveDeployment({ GITHUB_REPOSITORY: 'imreplay' }));
  assert.throws(() => resolveDeployment({ SITE_URL: 'file:///local' }));
});
