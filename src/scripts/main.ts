/**
 * Small, dependency-free progressive enhancement for the marketing page.
 * Everything here is optional: with JS off or failing, all content, links, WhatsApp and
 * phone actions still work (the `.js` class that hides reveal/FAQ content is only added by
 * an inline script in <head>, and every observer below falls back to showing content).
 */

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const qs = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) => scope.querySelector<T>(sel);
const qsa = <T extends Element = HTMLElement>(sel: string, scope: ParentNode = document) =>
  Array.from(scope.querySelectorAll<T>(sel));

/* ---------- Analytics (no-op unless GA is configured; never sends patient data) ---------- */

type EventParams = Record<string, string | number>;

function track(name: string, params: EventParams = {}): void {
  try {
    window.gtag?.('event', name, params);
  } catch {
    /* analytics must never break the page */
  }
}

document.addEventListener('click', (event) => {
  const el = (event.target as Element | null)?.closest<HTMLElement>('[data-track]');
  if (!el?.dataset.track) return;
  const params: EventParams = {};
  if (el.dataset.location) params.location = el.dataset.location;
  if (el.dataset.concern) params.concern = el.dataset.concern;
  track(el.dataset.track, params);
});

/* ---------- Header: scrolled state + progress ---------- */

const header = qs('[data-header]');
const progress = qs('[data-progress]');
let scrollTick = false;

function updateScroll(): void {
  scrollTick = false;
  const y = window.scrollY;
  header?.classList.toggle('is-scrolled', y > 24);
  if (progress) {
    const max = root.scrollHeight - window.innerHeight;
    progress.style.setProperty('--p', String(max > 0 ? Math.min(1, y / max) : 0));
  }
}
window.addEventListener(
  'scroll',
  () => {
    if (!scrollTick) {
      scrollTick = true;
      requestAnimationFrame(updateScroll);
    }
  },
  { passive: true },
);
updateScroll();

/* ---------- Active section + sliding nav indicator ---------- */

const navList = qs('[data-nav-list]');
const indicator = qs('[data-nav-indicator]');
const navLinks = qsa<HTMLAnchorElement>('[data-nav-link]');
// Sections without their own nav entry highlight their closest parent topic.
const navAlias: Record<string, string | null> = { top: null, why: 'conditions', clinic: 'doctors', contact: 'pricing' };

function placeIndicator(link: HTMLElement | null): void {
  if (!indicator) return;
  if (!link || link.offsetParent === null) {
    indicator.removeAttribute('data-visible');
    return;
  }
  indicator.style.setProperty('--x', `${link.offsetLeft}px`);
  indicator.style.setProperty('--w', `${link.offsetWidth}px`);
  indicator.setAttribute('data-visible', 'true');
}

function setActive(id: string | null): void {
  const target = id ? (navAlias[id] === undefined ? id : navAlias[id]) : null;
  let activeLink: HTMLAnchorElement | null = null;
  for (const link of navLinks) {
    const match = target !== null && link.getAttribute('href') === `#${target}`;
    if (match) {
      link.setAttribute('aria-current', 'true');
      activeLink = link;
    } else {
      link.removeAttribute('aria-current');
    }
  }
  placeIndicator(activeLink);
}

const currentLink = () => navLinks.find((l) => l.getAttribute('aria-current') === 'true') ?? null;

if ('IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) setActive(entry.target.id);
    },
    { rootMargin: '-42% 0px -53% 0px', threshold: 0 },
  );
  qsa('[data-section]').forEach((s) => sectionObserver.observe(s));
}

navLinks.forEach((link) => {
  link.addEventListener('pointerenter', () => placeIndicator(link));
  link.addEventListener('click', () => setActive(link.getAttribute('href')?.slice(1) ?? null));
});
navList?.addEventListener('pointerleave', () => placeIndicator(currentLink()));
window.addEventListener('resize', () => placeIndicator(currentLink()), { passive: true });

/* ---------- Mobile menu ---------- */

const menuToggle = qs<HTMLButtonElement>('[data-menu-toggle]');
const menu = qs('[data-menu]');
const backdropTargets = qsa('main, footer, [data-sticky-cta]');

function setMenu(open: boolean, returnFocus = false): void {
  if (!menuToggle || !menu) return;
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  menu.dataset.open = String(open);
  menu.toggleAttribute('inert', !open);
  menu.setAttribute('aria-hidden', String(!open));
  root.classList.toggle('menu-open', open);
  backdropTargets.forEach((el) => el.toggleAttribute('inert', open));
  if (open) qs<HTMLAnchorElement>('a', menu)?.focus({ preventScroll: true });
  else if (returnFocus) menuToggle.focus({ preventScroll: true });
}

menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (event) => {
  const target = event.target as Element;
  if (target.closest('a')) setMenu(false);
  else if (target === menu) setMenu(false, true); // click on the dimmed backdrop
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu?.dataset.open === 'true') setMenu(false, true);
});
window.matchMedia('(min-width: 1100px)').addEventListener('change', (e) => {
  if (e.matches) setMenu(false);
});

/* ---------- Scroll reveal ---------- */

const revealEls = qsa('.reveal');
if (reduceMotion || !('IntersectionObserver' in window)) {
  revealEls.forEach((el) => el.classList.add('is-in'));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        obs.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0 },
  );
  revealEls.forEach((el) => revealObserver.observe(el));
}

/* ---------- Ambient animation only while on screen ---------- */

if ('IntersectionObserver' in window) {
  const ambientObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) entry.target.classList.toggle('is-live', entry.isIntersecting);
    },
    { rootMargin: '120px 0px' },
  );
  qsa('[data-ambient]').forEach((el) => ambientObserver.observe(el));
}

/* ---------- Count-up numerals ---------- */

if (!reduceMotion && 'IntersectionObserver' in window) {
  const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
  qsa('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count ?? '');
    const decimals = Number(el.dataset.decimals ?? 0);
    if (Number.isNaN(target)) return;
    const render = (v: number) => (el.textContent = v.toFixed(decimals));
    render(0);

    const io = new IntersectionObserver(
      ([entry], obs) => {
        if (!entry?.isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const duration = 1300;
        const frame = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          render(target * easeOut(t));
          if (t < 1) requestAnimationFrame(frame);
          else render(target);
        };
        requestAnimationFrame(frame);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
  });
}

/* ---------- Sticky WhatsApp CTA: appears once the hero CTA scrolls away ---------- */

const stickyCta = qs('[data-sticky-cta]');
const heroCta = qs('[data-hero-cta]');
if (stickyCta && 'IntersectionObserver' in window) {
  let heroVisible = Boolean(heroCta);
  const hideZones = new Set<Element>();
  const refresh = () => stickyCta.classList.toggle('is-visible', !heroVisible && hideZones.size === 0);

  if (heroCta) {
    new IntersectionObserver(([entry]) => {
      heroVisible = Boolean(entry?.isIntersecting);
      refresh();
    }).observe(heroCta);
  }
  const zoneObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) hideZones.add(entry.target);
        else hideZones.delete(entry.target);
      }
      refresh();
    },
    { rootMargin: '-25% 0px -25% 0px' },
  );
  qsa('[data-hide-sticky]').forEach((z) => zoneObserver.observe(z));
  refresh();
} else {
  stickyCta?.classList.add('is-visible');
}

/* ---------- FAQ accordion ---------- */

qsa<HTMLButtonElement>('[data-faq-btn]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    btn.closest('.item')?.classList.toggle('is-open', open);
    if (open) track('faq_open', { question_index: Number(btn.dataset.faqIndex ?? 0) });
  });
});

/* ---------- Review slider (only rendered when 2+ approved reviews exist) ---------- */

qsa('[data-slider]').forEach((slider) => {
  const track_ = qs('[data-slider-track]', slider);
  if (!track_) return;
  const go = (dir: 1 | -1) =>
    track_.scrollBy({ left: dir * track_.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
  qs('[data-slider-prev]', slider)?.addEventListener('click', () => go(-1));
  qs('[data-slider-next]', slider)?.addEventListener('click', () => go(1));
});

/* ---------- Pointer-tracked highlight on glass cards (fine pointers only) ---------- */

if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.addEventListener(
    'pointermove',
    (event) => {
      const card = (event.target as Element | null)?.closest<HTMLElement>('.spot');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
      card.style.setProperty('--my', `${event.clientY - rect.top}px`);
    },
    { passive: true },
  );
}

/* ---------- section_view analytics (once per section) ---------- */

if ('IntersectionObserver' in window) {
  const seen = new Set<string>();
  const viewObserver = new IntersectionObserver(
    (entries, obs) => {
      for (const entry of entries) {
        if (!entry.isIntersecting || seen.has(entry.target.id)) continue;
        seen.add(entry.target.id);
        track('section_view', { section: entry.target.id });
        obs.unobserve(entry.target);
      }
    },
    { threshold: 0.35 },
  );
  qsa('[data-section]').forEach((s) => viewObserver.observe(s));
}

export {};
