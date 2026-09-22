export {};

const root = document.documentElement;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const toggle = document.querySelector<HTMLButtonElement>('.motion-toggle');
const label = document.querySelector<HTMLElement>('[data-motion-label]');
let manuallyPaused = false;
try { manuallyPaused = localStorage.getItem('imreplay-motion') === 'off'; } catch {}

const targets = [...document.querySelectorAll<HTMLElement>('.about-section, .research-card, .awards-card, .post-card, .profile-card, .portfolio-callout, .posts-empty, .sidebar-section')];
let revealObserver: IntersectionObserver | undefined;
function configureMotion() {
  const paused = manuallyPaused || reducedMotion.matches;
  root.dataset.motion = paused ? 'off' : 'on';
  toggle?.setAttribute('aria-pressed', String(paused));
  if (label) label.textContent = reducedMotion.matches ? '움직임 최소화' : paused ? '움직임 켜기' : '움직임 끄기';
  if (toggle) {
    toggle.disabled = reducedMotion.matches;
    toggle.title = reducedMotion.matches ? '기기의 동작 줄이기 설정을 따릅니다' : '움직임 켜기/끄기';
  }
  revealObserver?.disconnect();
  if (paused || !('IntersectionObserver' in window)) {
    targets.forEach(target => { target.dataset.reveal = 'visible'; });
    return;
  }
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        (entry.target as HTMLElement).dataset.reveal = 'visible';
        revealObserver?.unobserve(entry.target);
      }
    });
  }, { threshold: .08, rootMargin: '0px 0px -20px 0px' });
  targets.forEach(target => {
    if (target.dataset.reveal === 'visible' || target.getBoundingClientRect().top < innerHeight - 20) {
      target.dataset.reveal = 'visible';
    } else {
      target.dataset.reveal = 'pending';
      revealObserver?.observe(target);
    }
  });
}
toggle?.addEventListener('click', () => {
  manuallyPaused = !manuallyPaused;
  try { localStorage.setItem('imreplay-motion', manuallyPaused ? 'off' : 'on'); } catch {}
  configureMotion();
});
reducedMotion.addEventListener('change', configureMotion);
configureMotion();

const header = document.querySelector('.site-header');
let scrollFrame = 0;
function updateScroll() {
  scrollFrame = 0;
  const distance = document.documentElement.scrollHeight - innerHeight;
  root.style.setProperty('--page-progress', String(distance > 0 ? Math.min(1, Math.max(0, scrollY / distance)) : 0));
  header?.classList.toggle('is-scrolled', scrollY > 12);
}
function queueScroll() { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); }
addEventListener('scroll', queueScroll, { passive: true });
addEventListener('resize', queueScroll, { passive: true });
addEventListener('pageshow', queueScroll);
document.fonts.ready.then(queueScroll);
updateScroll();

function updateVisibility() { root.dataset.pageVisible = String(!document.hidden); }
document.addEventListener('visibilitychange', updateVisibility);
updateVisibility();

const hero = document.querySelector<HTMLElement>('.about-heading');
const graphic = hero?.querySelector<HTMLElement>('.research-visual');
let pointerFrame = 0;
hero?.addEventListener('pointermove', event => {
  if (!graphic || root.dataset.motion !== 'on' || !finePointer.matches || pointerFrame) return;
  pointerFrame = requestAnimationFrame(() => {
    pointerFrame = 0;
    const rect = hero.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)) - .5;
    const y = Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)) - .5;
    graphic.style.setProperty('--orbit-tilt-x', `${-y * 9}deg`);
    graphic.style.setProperty('--orbit-tilt-y', `${x * 12}deg`);
  });
}, { passive: true });
hero?.addEventListener('pointerleave', () => {
  cancelAnimationFrame(pointerFrame);
  pointerFrame = 0;
  graphic?.style.removeProperty('--orbit-tilt-x');
  graphic?.style.removeProperty('--orbit-tilt-y');
});

document.querySelectorAll<HTMLElement>('.research-card, .profile-card, .portfolio-callout, .posts-empty').forEach(card => {
  let frame = 0;
  card.addEventListener('pointermove', event => {
    if (root.dataset.motion !== 'on' || !finePointer.matches || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
      card.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
    });
  }, { passive: true });
  card.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    card.style.removeProperty('--pointer-x');
    card.style.removeProperty('--pointer-y');
  });
});
