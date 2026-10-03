# Geeta Krishna Physiotherapy — Phase 1 website

Premium, mobile-first marketing site for **Geeta Krishna Physiotherapy** (B-1/127 Viram Khand, Gomti Nagar, Lucknow).
Built to the Master PRD and `design.md`: static Astro, one small TypeScript module, WhatsApp + phone as the conversion path.
There is **no appointment system** in Phase 1 (deferred to Phase 2 by design).

| | |
|---|---|
| Stack | Astro 7 · TypeScript · Tailwind CSS 4 · Lucide icons · self-hosted DM Serif Display + Manrope |
| Client JS | ~5 KB gzipped (header, active nav, menu, reveals, counters, open-now pill, concern form, FAQ, review slider, map guard, optional live Google reviews) · CSS ~22 KB gzipped |
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

Put approved photos in `src/assets/clinic/` (`.jpg .jpeg .png .webp .avif`). The file name is the slot:

| File name | Where it appears |
|---|---|
| `hero` | Hero frame — until it exists, a designed pine panel ("Gomti Nagar's trusted physio clinic") fills the frame |
| `doctor-sandeep`, `doctor-mahesh` | Doctor cards — until they exist, an ST / MT monogram is shown |
| `doctors-together` | Joint photo beside the doctors' intro (caption is a `[TBD]` until the clinic confirms who is pictured) |
| `gallery-1`, `gallery-2`, … | The clinic banner. Each one also needs a line in `gallery` in `src/data/site.ts` (label + a plain description for the alt text); `galleryPending` lists what is still to come |

Each is converted to AVIF/WebP, given fixed dimensions (no layout shift), and **never up-scaled**: a small source is served at its own size. The supplied treatment and doctor photos are only ~250 px wide, so they are shown at about their native size; send the originals (1200 px+ wide) before putting any of them in a large slot. Photo-overlay labels sit on solid pine so they stay legible on any image.
No stock or generated imagery is ever substituted. **Patient photos need the patients' consent before publishing.**

## Live Google reviews

`src/scripts/google-reviews.ts` — the first two lines are:

```ts
const GOOGLE_PLACES_API_KEY = 'PASTE_KEY_HERE';
const GOOGLE_PLACE_ID = 'PASTE_PLACE_ID_HERE';
```

While either is still a placeholder the module does nothing (no request, no console noise) and the section shows the three built-in reviews from `reviews` in `src/data/site.ts`. Once both are set, on page load it fetches `places.googleapis.com/v1/places/<id>?fields=rating,userRatingCount,reviews` once per visit (kept in `sessionStorage`), shows shimmer skeletons while waiting, then:

- updates the hero badge, the hero panel badge, the stats strip and the reviews score with the live rating and review count (exact count, so the "+" goes away);
- replaces the cards with up to 5 live reviews (author linked to their Google profile, stars, "x months ago", text clamped to 3 lines with Read more / Show less);
- falls back silently to the built-in cards on any failure (bad key, quota, blocked referrer, offline, no reviews, or no answer within 8 s);
- points "Read all reviews on Google" at the clinic's listing (`place_id:`).

Things to know: the key is visible in the page source, so **restrict it** in Google Cloud (HTTP referrer = your domain, API = Places API (New) only). Place Details with reviews is a billable SKU and this calls it for every new visit, so watch the quota — fetching at build time or through a small proxy would cache it centrally. Google's terms ask that review authors stay attributed (they do) and that the content isn't stored long-term (only the tab's session storage is used). The structured data (`aggregateRating`) is generated at build time from `clinic.rating`, so update that occasionally too.

## Launch checklist — details the clinic must confirm

Everything below is intentionally left as `[TBD - confirm with clinic]` (PRD §3, §41). Search the repo for `TBD` to find each one.

- [ ] Hero photo, both doctor portraits, reception + equipment photos; higher-resolution originals of the supplied photos; confirm who is in the joint doctors photo (and fix its `[TBD]` caption); patient consent for the treatment photos
- [ ] Doctor specialisation, experience, certifications and bios (`doctors` in `src/data/site.ts`)
- [ ] Paste the Google Places API key + place ID (see *Live Google reviews*); confirm the three built-in fallback reviews are approved for use
- [ ] Pricing: starting session price (`pricing.confirmedAmount` — until set, the card shows a clearly-marked `₹ XXXX` placeholder), consultation, home visit
- [ ] FAQ answers: home visits, starting price, session length (`faqs` — unconfirmed ones are excluded from FAQ structured data)
- [ ] Sign-off on promise-style copy — "Physiotherapy that puts an expiry date on your pain.", "Gomti Nagar's trusted physio clinic", the first built-in review ("within 3 days he became quite normal"), "No surprise bills. Ever." (pricing is still TBD) and "Fix the cause, not just the ache." read as outcome/billing commitments, which PRD §37 steers away from
- [ ] Clinic's Google Business Profile URL (`links.directions` and `links.reviews` use a Maps search built from the verified address until a place ID is set; the map embed searches for the clinic by name and area — check it lands on the right pin)
- [ ] Production domain → `PUBLIC_SITE_URL`; confirm title/meta description copy
- [ ] GA4 + Search Console approval

## Design & accessibility notes

- **Typography is deliberately restrained:** hero 36→58px, section headings 30→46px, subheadings 21→28px, body 16–18px. Only the hero uses the largest scale.
- **Photography leads where it exists.** Real photos replace their slot automatically; until then the hero shows a designed typographic panel, the doctors show monograms, and the gallery is one banner holding the photos supplied so far. Decoration is limited to fine lines, dot texture and soft background circles.
- **Map:** a real, lazy-loaded Google Maps iframe with a translucent teal wash over it. It is covered by a "Tap to explore" layer so a page scroll can't be swallowed by the map on phones; one tap hands it over, tapping elsewhere takes it back. "Open in Google Maps" stays as a plain link.
- **Glassmorphism** is used sparingly on floating layers only (header, mobile menu, sticky CTA bar, hero hours card, review/contact panels). Blur is capped on small screens and has a solid fallback where `backdrop-filter` is unsupported.
- **Motion** is CSS keyframes/transitions, native CSS scroll-driven animations, and one IntersectionObserver-driven script — no animation library. Everything animates `transform`/`opacity` only (plus one `clip-path` wipe on the doctor portraits):
  - **Load:** eyebrow → headline → subtext → CTAs → badges rise in at 90ms steps (pure CSS, so CTAs never wait on JavaScript); the hero photo settles 1.06 → 1.
  - **Background depth** (`Depth.astro`): warm base → soft teal/sand glow → faint dots → a barely-there 1px grid (large cells, 5–7% alpha, faded toward the edges) → a few oversized thin circles and a hairline. Used on the hero, conditions, "why", gallery and visit sections. On the hero and conditions sections the glow + circles (`.d-far`, ±14px) and the grid (±6px) drift as the section scrolls past; on the dark and gallery sections the same texture stands still (see Performance). Only decorative layers ever move.
  - **Per-section choreography** (all once per entry): trust numbers rise one after another and the labels trail them; "why" blocks draw their rule, surface the numeral, then bring in the text; doctor portraits wipe down (clip-path) with name/details ~110ms behind; gallery tiles arrive from different directions with captions sliding in after them; the "How it works" line draws as you scroll and the active step lifts 3px with a ring while the previous one settles back; the reviews section plays quote mark → text → rating and stars last; pricing rises; the visit text and map arrive from opposite sides (wide screens).
  - **Hero rhythm:** a dotted ring turns once every 28s behind the photo, a trio of dots and a hairline drift ≤10px, and the shadow under the frame breathes. The photograph itself never moves except a ≤28px scroll parallax.
  - **Transition moments (two only):** a soft glow passes behind the "why" content, and the contact band's concentric rings settle into place — both one-shot when the section arrives.
  - **Hover:** buttons lift 1px and the arrow slides 3px; the two main WhatsApp CTAs get a soft glow that belongs to the button (no pulse); cards lift 2–3px; images zoom at most 1.02; condition cards tip the icon 4°, slide the arrow and pass a teal highlight across in ~260ms; the active nav link gets a thin teal underline; the FAQ opens/closes in 280ms.
  - **Ambient:** the ticker between hero and conditions (pauses on hover), a 6s float on the hours card, the hero ring/dots/shadow. Looping animations pause whenever their section is off screen.
  - `prefers-reduced-motion` turns it all off: reveals show immediately, no parallax or depth drift, no ambient loops, the ticker becomes a static wrapped list, count-up/autoplay stop.
  - Scroll-driven animations are a progressive enhancement (`animation-timeline: view()/scroll()`); browsers without them simply show the layers still. **Gotcha:** they are written as animation *longhands* — the CSS minifier folds `animation` + `animation-timeline` into one shorthand that Chromium silently rejects.
- **Dark sections** share one `DarkFx` layer: a static film-grain tile plus a teal and a warm-orange orb at 20% opacity (radial gradients, no `filter: blur`). The orange orb is a deliberate, subtle exception to "orange is for actions only".
- **Curved dividers:** any section with the `curve` class rises over the padding of the one above with an elliptical top edge, so light/dark bands never meet in a hard cut (pure `border-radius`, no images).
- **Live "Open now" pill** is computed in the browser against clinic time (Asia/Kolkata), so a visitor abroad still sees the right status. Without JS it shows the plain hours.
- **Concern form** (inside the contact band) is *not* a booking system: it only builds a ready-to-send WhatsApp message and stores nothing. Tapping a condition card scrolls to it with that concern pre-selected; without JavaScript the card opens WhatsApp directly.
- **Review slider** appears only once 2+ approved reviews exist: dots, arrows, a pause button, and a 5s autoplay that stops on hover/focus, when off screen, in a background tab, and for reduced-motion users.
- **CTA contrast:** white on the PRD's CTA orange `#EA580C` is 3.55:1, which meets WCAG AA only as *large text*. Primary-button labels are therefore bold and ≥ 14pt (18.7px). If a stricter 4.5:1 is wanted, change `--color-cta` to `#C2410C`.
- Content rules from PRD §37 are followed: no superlatives, guarantees, urgency or invented statistics.

## Performance notes

Scroll smoothness is measured with scripted full-page scrolls in headless Chromium at 1440×900 and 390×844. That build renders in **software** (no GPU), so absolute numbers are pessimistic — the *comparison* between builds is what matters. Share of frames slower than 33 ms (real mouse-wheel scrolling; 2 runs each):

| Build | Desktop | Mobile (390px) |
|---|---|---|
| Motion pass (before the depth/choreography pass) | 3–4% | 0% |
| Depth pass, first cut (every section drifting) | 23–24% | 0.3% |
| **Shipped** (depth drift on hero + conditions only) | **9–13%** | **0%** |

So on a software compositor the depth pass still costs desktop scrolling roughly 6–9 percentage points; mobile is unaffected. Extra translated layers should be much cheaper in a GPU-composited browser, but that could not be measured in this environment — check on a real laptop before launch. If you want the old numbers back, set `drift={false}` on the `<Depth>` in `Hero.astro` / `Conditions.astro` (the texture stays, the drift stops) or delete the `.hero__orbit` element.

What the profiling found, and the rules that came out of it:

- **Never clip a whole section to a rounded rectangle.** Curved dividers built with `border-radius` + `overflow: clip` on each section cost ~46 points of dropped frames, because clipping a subtree that contains glass to a rounded rect forces extra per-frame compositor work. The dome is now a painted `::before`; only leaf ambient layers (`.fx`, `.bg`) follow the dome shape.
- **Large `backdrop-filter` panels are the most expensive thing on the page** (~16 points on their own). Panels on dark bands (`.glass-dark`) sit over flat gradients, so they keep the translucent-gradient glass look without the blur. Real blur stays on the header, hero cards and small photo chips, which measured free.
- **Every layer that animates behind content is its own composited surface, and the cost tracks the number of such layers far more than their size or how far they move.** Measured: merging layers, shrinking them, `will-change`, `contain`, removing masks and rounded clips all made little difference; *removing the animation* (or not promoting the layer) is what helps. Hence: depth drift only where it reads (light sections), one shared drifting layer for glow + circles, a grid that only exists on the busy side of the section, and the two transition moments as one-shot transitions instead of scroll-scrubbed animations. Continuous time-based loops on the same layers were twice as expensive as scroll-linked ones.
- The map's teal tint is a plain translucent overlay: a `mix-blend-mode` over the iframe, or a CSS `filter` on it, each made scrolling past the map 4–20% slower; both together were worst.
- Film grain (one 160px tile), the ticker, dot textures and the curve domes all measured as free. Orbs are static radial gradients.
- Re-measure after adding any new full-width or animated layer; a regression this size is invisible in a screenshot and in Lighthouse (which scores load, not scroll).

## Phase 2 (not built)

Booking, doctor and condition pages, blog and admin are deliberately absent. The component-per-section structure and the single data module are the extension points.
