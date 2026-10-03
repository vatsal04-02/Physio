# Geeta Krishna Physiotherapy — Phase 1 website

Premium, mobile-first marketing site for **Geeta Krishna Physiotherapy** (B-1/127 Viram Khand, Gomti Nagar, Lucknow).
Built to the Master PRD and `design.md`: static Astro, one small TypeScript module, WhatsApp + phone as the conversion path.
There is **no appointment system** in Phase 1 (deferred to Phase 2 by design).

| | |
|---|---|
| Stack | Astro 7 · TypeScript · Tailwind CSS 4 · Lucide icons · self-hosted DM Serif Display + Manrope |
| Client JS | ~2 KB gzipped (one module: header, active nav, menu, reveals, counters, FAQ, optional review slider) |
| Lighthouse (local) | Mobile 100 / 100 / 100 / 100 · Desktop 100 / 100 / 100 / 100 (perf / a11y / best-practices / SEO); mobile LCP 1.5 s, CLS 0 |

## Commands

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static site → dist/
npm run preview    # serve the build
npm run check      # astro check (TypeScript 6 — TS 7 is not yet supported by astro check)
```

Environment (see `.env.example`):

- `PUBLIC_SITE_URL` — deployed URL; drives canonical, sitemap, `robots.txt`, social tags. **Confirm before launch.**
- `PUBLIC_GA_ID` — optional GA4 ID. Leave empty to ship with no analytics (needs clinic approval).

## Where things live

```
src/data/site.ts        ALL clinic facts, copy lists, FAQ, pricing, reviews — edit content here
src/components/         One component per page section (Header, Hero, Conditions, …)
src/components/Placeholder.astro   The one shared "photograph goes here" slot used by hero, doctors and gallery
src/styles/global.css   Design tokens, glass surfaces, buttons, motion system, reduced-motion rules
src/scripts/main.ts     Progressive enhancement (every feature degrades without JS)
src/assets/clinic/      Drop real photos here (see below)
scripts/make-brand-assets.mjs   Regenerates public/og.png and the iOS icon
```

## Adding real photography

Put approved photos in `src/assets/clinic/` named exactly:

`hero` · `clinic` (or `exterior`) · `reception` · `treatment-room` · `equipment` · `doctor-sandeep` · `doctor-mahesh`
(`.jpg .jpeg .png .webp .avif`)

Each is picked up automatically, converted to AVIF/WebP with responsive `srcset`, given fixed dimensions (no layout shift), and the placeholder for that slot disappears. The hero is loaded eagerly with high fetch priority; everything else is lazy. Photo-overlay labels (location caption, `01 / 02`, qualification badge) sit on solid pine so they stay legible on any image.
No stock or generated imagery is ever substituted — empty slots show a clearly-marked placeholder.

## Launch checklist — details the clinic must confirm

Everything below is intentionally left as `[TBD - confirm with clinic]` (PRD §3, §41). Search the repo for `TBD` to find each one.

- [ ] Hero photo, gallery photos (clinic, reception, treatment room, equipment), both doctor portraits
- [ ] Doctor specialisation, experience, certifications and bios (`doctors` in `src/data/site.ts`)
- [ ] Approved Google reviews / patient stories (`reviews` — the section shows a placeholder until at least one is added; 2+ activates the swipe slider)
- [ ] Pricing: starting session price (`pricing.confirmedAmount` — until set, the card shows a clearly-marked `₹ XXXX` placeholder), consultation, home visit
- [ ] FAQ answers: home visits, starting price, session length (`faqs` — unconfirmed ones are excluded from FAQ structured data)
- [ ] Clinic's Google Business Profile and review URLs (`links.directions`, `links.reviews` currently use a Maps search built from the verified address)
- [ ] Production domain → `PUBLIC_SITE_URL`; confirm title/meta description copy
- [ ] GA4 + Search Console approval

## Design & accessibility notes

- **Typography is deliberately restrained:** hero 36→58px, section headings 30→46px, subheadings 21→28px, body 16–18px. Only the hero uses the largest scale.
- **Photography leads.** There is no decorative hero graphic; the hero, doctors and gallery are image-ready slots. Decoration is limited to fine lines, dot texture and two soft background circles.
- **Glassmorphism** is used sparingly on floating layers only (header, mobile menu, sticky CTA bar, hero hours card, review/contact panels). Blur is capped on small screens and has a solid fallback where `backdrop-filter` is unsupported.
- **Motion** uses only `transform`/`opacity` with the PRD timing tokens: hero stagger (pure CSS, so CTAs never wait on JavaScript), scroll reveals, count-up numerals, a timeline line that draws once, and hover/press feedback. There is no looping, spinning or pulsing motion; the slow background circles pause when off screen; `prefers-reduced-motion` disables the rest.
- **CTA contrast:** white on the PRD's CTA orange `#EA580C` is 3.55:1, which meets WCAG AA only as *large text*. Primary-button labels are therefore bold and ≥ 14pt (18.7px). If a stricter 4.5:1 is wanted, change `--color-cta` to `#C2410C`.
- Content rules from PRD §37 are followed: no superlatives, guarantees, urgency or invented statistics.

## Phase 2 (not built)

Booking, doctor and condition pages, blog and admin are deliberately absent. The component-per-section structure and the single data module are the extension points.
