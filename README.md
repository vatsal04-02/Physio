# Geeta Krishna Physiotherapy — Phase 1 website

Premium, mobile-first marketing site for **Geeta Krishna Physiotherapy** (B-1/127 Viram Khand, Gomti Nagar, Lucknow).
Built to the Master PRD and `design.md`: static Astro, one small TypeScript module, WhatsApp + phone as the conversion path.
There is **no appointment system** in Phase 1 (deferred to Phase 2 by design).

| | |
|---|---|
| Stack | Astro 7 · TypeScript · Tailwind CSS 4 · Lucide icons · self-hosted DM Serif Display + Manrope |
| Client JS | ~5 KB (one module: header, active nav, menu, reveals, counters, FAQ, optional slider, click-to-load map) |
| Lighthouse (local) | Mobile 99 / 100 / 100 / 100 · Desktop 100 / 100 / 100 / 100 (perf / a11y / best-practices / SEO) |

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
src/styles/global.css   Design tokens, glass surfaces, buttons, motion system, reduced-motion rules
src/scripts/main.ts     Progressive enhancement (every feature degrades without JS)
src/assets/clinic/      Drop real photos here (see below)
scripts/make-brand-assets.mjs   Regenerates public/og.png and the iOS icon
```

## Adding real photography

Put approved photos in `src/assets/clinic/` named exactly:

`hero` · `exterior` · `reception` · `treatment-room` · `equipment` · `signage` · `doctor-sandeep` · `doctor-mahesh`
(`.jpg .jpeg .png .webp .avif`)

Each is picked up automatically, converted to AVIF/WebP with responsive `srcset`, given fixed dimensions (no layout shift), and the placeholder for that slot disappears. The hero is loaded eagerly with high fetch priority; everything else is lazy.
No stock or generated imagery is ever substituted — empty slots show a clearly-marked placeholder.

## Launch checklist — details the clinic must confirm

Everything below is intentionally left as `[TBD - confirm with clinic]` (PRD §3, §41). Search the repo for `TBD` to find each one.

- [ ] Hero photo, gallery photos (exterior, reception, treatment room, equipment, signage), both doctor portraits
- [ ] Doctor specialisation, experience, certifications and bios (`doctors` in `src/data/site.ts`)
- [ ] Approved Google reviews / patient stories (`reviews` — the section shows a placeholder until at least one is added; 2+ activates the swipe slider)
- [ ] Pricing: starting session price, consultation, home visit (`pricing`)
- [ ] FAQ answers: home visits, starting price, session length, previous reports, referral (`faqs` — unconfirmed ones are excluded from FAQ structured data)
- [ ] Clinic's Google Business Profile and review URLs (`links.directions`, `links.reviews` currently use a Maps search built from the verified address)
- [ ] Production domain → `PUBLIC_SITE_URL`; confirm title/meta description copy
- [ ] GA4 + Search Console approval

## Design & accessibility notes

- **Glassmorphism** is used deliberately on floating layers (header, mobile menu, sticky CTA, hero cards, doctor panels, review/contact/visit panels) over teal, pine and sand fields with soft ambient circles behind them. Blur is capped on small screens and has a solid fallback where `backdrop-filter` is unsupported.
- **Motion** uses only `transform`/`opacity` with the PRD timing tokens. Hero entrance is pure CSS (CTAs never wait on JavaScript); scroll reveals only hide content once JS is running; ambient loops pause when their section is off screen; `prefers-reduced-motion` disables everything and shows a resting pose for the dial graphic.
- **CTA contrast:** white on the PRD's CTA orange `#EA580C` is 3.55:1, which meets WCAG AA only as *large text*. Primary-button labels are therefore bold and ≥ 14pt (18.7px). If a stricter 4.5:1 is wanted, change `--color-cta` to `#C2410C`.
- Content rules from PRD §37 are followed: no superlatives, guarantees, urgency or invented statistics.

## Phase 2 (not built)

Booking, doctor and condition pages, blog and admin are deliberately absent. The component-per-section structure and the single data module are the extension points.
