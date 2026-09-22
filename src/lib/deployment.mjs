/** Derive both user-site and project-site URLs without hardcoding a repository. */
export function resolveDeployment(env = {}) {
  if (env.SITE_URL) {
    const url = new URL(env.SITE_URL);
    if (!['https:', 'http:'].includes(url.protocol)) throw new Error('SITE_URL must use HTTP or HTTPS');
    return { site: url.origin, base: url.pathname.replace(/\/$/, '') || '/' };
  }
  if (env.GITHUB_REPOSITORY) {
    const [owner, repo] = env.GITHUB_REPOSITORY.split('/');
    if (!owner || !repo) throw new Error('GITHUB_REPOSITORY must be owner/repository');
    return {
      site: `https://${owner.toLowerCase()}.github.io`,
      base: repo.toLowerCase() === `${owner.toLowerCase()}.github.io` ? '/' : `/${repo}`,
    };
  }
  return { site: 'https://imreplay.com', base: '/' };
}
