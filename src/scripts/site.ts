const root = document.documentElement;
const themeButton = document.querySelector<HTMLButtonElement>('.theme-toggle');
function syncTheme() {
  const light = root.dataset.theme === 'light';
  themeButton?.setAttribute('aria-label', light ? '다크 모드로 전환' : '라이트 모드로 전환');
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', light ? '#f8faf9' : '#101313');
}
syncTheme();
themeButton?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('imreplay-theme', root.dataset.theme); } catch {}
  syncTheme();
});
const dialog = document.querySelector<HTMLDialogElement>('#search-dialog');
const input = document.querySelector<HTMLInputElement>('#search-input');
const results = [...document.querySelectorAll<HTMLElement>('[data-search-text]')];
const filterSearch = () => {
  const words = (input?.value ?? '').trim().toLowerCase().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const item of results) {
    item.hidden = !words.every(word => item.dataset.searchText?.includes(word));
    if (!item.hidden) count++;
  }
  const empty = document.querySelector<HTMLElement>('.search-empty');
  if (empty) empty.hidden = count > 0;
  const status = document.querySelector('#search-status');
  if (status) status.textContent = `${count}개의 글`;
};
const openSearch = () => { if (!dialog?.open) { dialog?.showModal(); input?.focus(); } };
document.querySelectorAll('[data-search-open]').forEach(button => button.addEventListener('click', openSearch));
document.querySelector('[data-search-close]')?.addEventListener('click', () => dialog?.close());
dialog?.addEventListener('click', event => { if (event.target === dialog) { const box = dialog.getBoundingClientRect(); if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close(); } });
input?.addEventListener('input', filterSearch);
document.addEventListener('keydown', event => {
  const editable = event.target instanceof HTMLElement && (event.target.matches('input, textarea, select') || event.target.isContentEditable);
  if (((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') || (event.key === '/' && !editable)) { event.preventDefault(); openSearch(); }
});
document.querySelector('.back-top')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: root.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }));

const filterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
const postCards = [...document.querySelectorAll<HTMLElement>('.post-card')];
const applyCategory = (category: string, updateUrl = false) => {
  const valid = filterButtons.some(button => button.dataset.filter === category) ? category : 'All';
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === valid)));
  let count = 0;
  postCards.forEach(card => { card.hidden = valid !== 'All' && card.dataset.category !== valid; if (!card.hidden) count++; });
  const status = document.querySelector('#filter-status');
  if (status) status.textContent = `${count}개의 기록`;
  if (updateUrl) { const url = new URL(location.href); valid === 'All' ? url.searchParams.delete('category') : url.searchParams.set('category', valid); history.replaceState(null, '', url); }
};
filterButtons.forEach(button => button.addEventListener('click', () => applyCategory(button.dataset.filter ?? 'All', true)));
if (filterButtons.length) applyCategory(new URL(location.href).searchParams.get('category') ?? 'All');

document.querySelectorAll<HTMLPreElement>('.prose pre').forEach(pre => {
  const button = document.createElement('button'); button.className = 'copy-code'; button.type = 'button'; button.textContent = '복사'; button.setAttribute('aria-label', '코드 복사');
  button.addEventListener('click', async () => { try { await navigator.clipboard.writeText(pre.querySelector('code')?.textContent ?? ''); button.textContent = '복사됨'; } catch { button.textContent = '복사 실패'; } setTimeout(() => { button.textContent = '복사'; }, 2000); });
  pre.append(button);
});
const progress = document.querySelector<HTMLElement>('.reading-progress');
if (progress) {
  const update = () => { const available = document.documentElement.scrollHeight - innerHeight; progress.style.width = `${available > 0 ? Math.min(100, scrollY / available * 100) : 100}%`; };
  window.addEventListener('scroll', update, { passive: true }); window.addEventListener('resize', update); update();
}
