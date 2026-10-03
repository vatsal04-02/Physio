# Geeta Krishna Physiotherapy — Phase 1 website

Premium, mobile-first marketing site for **Geeta Krishna Physiotherapy** (B-1/127 Viram Khand, Gomti Nagar, Lucknow).
Built to the Master PRD and `design.md`: static Astro, one small TypeScript module, WhatsApp + phone as the conversion path.
There is **no appointment system** in Phase 1 (deferred to Phase 2 by design).

| | |
|---|---|
| Stack | Astro 7 · TypeScript · Tailwind CSS 4 · Lucide icons · self-hosted DM Serif Display + Manrope |
| Client JS | ~3.7 KB gzipped (one module: header, active nav, menu, reveals, counters, parallax, open-now pill, concern form, one-at-a-time FAQ, optional review slider) |
| Lighthouse (local) | Mobile 100 / 100 / 100 / 100 · Desktop 100 / 100 / 100 / 100 (perf / a11y / best-practices / SEO); mobile LCP 1.7 s, TBT 0, CLS 0 |

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
- [ ] Sign-off on promise-style headlines — "Your pain has an expiry date.", "No surprise bills. Ever." (pricing is still TBD) and "Fix the cause, not just the ache." read as outcome/billing commitments, which PRD §37 steers away from
- [ ] Clinic's Google Business Profile and review URLs (`links.directions`, `links.reviews` currently use a Maps search built from the verified address)
- [ ] Production domain → `PUBLIC_SITE_URL`; confirm title/meta description copy
- [ ] GA4 + Search Console approval

## Design & accessibility notes

- **Typography is deliberately restrained:** hero 36→58px, section headings 30→46px, subheadings 21→28px, body 16–18px. Only the hero uses the largest scale.
- **Photography leads.** There is no decorative hero graphic; the hero, doctors and gallery are image-ready slots. Decoration is limited to fine lines, dot texture and two soft background circles.
- **Glassmorphism** is used sparingly on floating layers only (header, mobile menu, sticky CTA bar, hero hours card, review/contact panels). Blur is capped on small screens and has a solid fallback where `backdrop-filter` is unsupported.
- **Motion** is CSS keyframes/transitions plus one IntersectionObserver-driven script — no animation library. Everything animates `transform`/`opacity` only:
  - Load: eyebrow → headline → subtext → CTAs → badges rise 24px in 0.7s at 90ms steps (pure CSS, so CTAs never wait on JavaScript); the hero image settles 1.06 → 1.
  - Scroll: sections fade up once as they enter, grid cards stagger 70ms, the 5.0 / 467+ / 2 numerals count up, the "How it works" line draws as it scrolls into view, and the hero photo has a light parallax (capped at 28px).
  - Ambient: the ticker between hero and conditions (pauses on hover), a 6s float on the hours card, and slow background orbs. All ambient loops pause when their section is off screen.
  - Hover: CTAs scale 1.03 with a deeper shadow; cards lift 6px with a teal glow.
  - `prefers-reduced-motion` turns everything off: reveals show immediately, the ticker becomes a static wrapped list, parallax/float/count-up/autoplay stop.
- **Dark sections** share one `DarkFx` layer: a static film-grain tile plus a teal and a warm-orange orb at 20% opacity (radial gradients, no `filter: blur`). The orange orb is a deliberate, subtle exception to "orange is for actions only".
- **Curved dividers:** any section with the `curve` class rises over the padding of the one above with an elliptical top edge, so light/dark bands never meet in a hard cut (pure `border-radius`, no images).
- **Live "Open now" pill** is computed in the browser against clinic time (Asia/Kolkata), so a visitor abroad still sees the right status. Without JS it shows the plain hours.
- **Concern form** (inside the contact band) is *not* a booking system: it only builds a ready-to-send WhatsApp message and stores nothing. Tapping a condition card scrolls to it with that concern pre-selected; without JavaScript the card opens WhatsApp directly.
- **Review slider** appears only once 2+ approved reviews exist: dots, arrows, a pause button, and a 5s autoplay that stops on hover/focus, when off screen, in a background tab, and for reduced-motion users.
- **CTA contrast:** white on the PRD's CTA orange `#EA580C` is 3.55:1, which meets WCAG AA only as *large text*. Primary-button labels are therefore bold and ≥ 14pt (18.7px). If a stricter 4.5:1 is wanted, change `--color-cta` to `#C2410C`.
- Content rules from PRD §37 are followed: no superlatives, guarantees, urgency or invented statistics.

## Performance notes

Scroll smoothness was measured with a scripted full-page scroll in headless Chromium (software rendering, so absolute numbers are pessimistic — the *comparison* between builds is what matters). Share of frames slower than 33 ms:

| Build | Desktop | Mobile (390px) |
|---|---|---|
| Before the motion/curve pass | ~15% | — |
| First cut of the new effects | 66–69% | — |
| **Shipped** | **0.8–3.9%** (7.9% with CPU throttled 4×) | **0–1.1%** (4× throttle included) |

What the profiling found, and the rules that came out of it:

- **Never clip a whole section to a rounded rectangle.** Curved dividers built with `border-radius` + `overflow: clip` on each section cost ~46 points of dropped frames, because clipping a subtree that contains glass to a rounded rect forces extra per-frame compositor work. The dome is now a painted `::before`; only leaf ambient layers (`.fx`, `.bg`) follow the dome shape.
- **Large `backdrop-filter` panels are the most expensive thing on the page** (~16 points on their own). Panels on dark bands (`.glass-dark`) sit over flat gradients, so they keep the translucent-gradient glass look without the blur. Real blur stays on the header, hero cards and small photo chips, which measured free.
- Film grain (one 160px tile), the ticker, dot textures and the curve domes all measured as free. Orbs are static radial gradients.
- Re-measure after adding any new full-width effect; a regression this size is invisible in a screenshot and in Lighthouse (which scores load, not scroll).

## Phase 2 (not built)

Booking, doctor and condition pages, blog and admin are deliberately absent. The component-per-section structure and the single data module are the extension points.
