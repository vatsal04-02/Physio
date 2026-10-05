# Geeta Krishna Physiotherapy — Phase 1 website

Premium, mobile-first marketing site for **Geeta Krishna Physiotherapy** (B-1/127 Viram Khand, Gomti Nagar, Lucknow).
Built to the Master PRD and `design.md`: static Astro, one small TypeScript module, WhatsApp + phone as the conversion path.
There is **no appointment system** in Phase 1: the *Book your visit* form only composes a WhatsApp request that the clinic answers and confirms (no calendar, backend, payment or login).

| | |
|---|---|
| Stack | Astro 7 · TypeScript · Tailwind CSS 4 · Lucide icons · self-hosted DM Serif Display + Manrope |
| Client JS | ~6 KB gzipped (header, active nav, menu, reveals, counters, open-now pill, concern + booking forms, FAQ, review slider, map guard, optional live Google reviews) · CSS ~23 KB gzipped |
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
src/data/site.ts        ALL clinic facts, copy lists, FAQ, reviews, gallery — edit content here
src/components/         One component per page section (Header, Hero, Conditions, …)
src/components/Placeholder.astro   Shared "photograph goes here" slot (only shown if a gallery photo file is missing)
src/components/Booking.astro + src/scripts/booking.ts   The "Book your visit" request form
src/styles/global.css   Design tokens, glass surfaces, buttons, motion system, reduced-motion rules
src/scripts/main.ts     Progressive enhancement (every feature degrades without JS)
src/assets/clinic/      Drop real photos here (see below)
scripts/make-brand-assets.mjs   Regenerates public/og.png and the iOS icon
```

## Adding real photography

Put approved photos in `src/assets/clinic/` (`.jpg .jpeg .png .webp .avif`). The file name is the slot:

| File name | Where it appears |
|---|---|
| `hero` | Hero frame — currently the clinic-entrance photo (`hero.webp`, cropped to the frame with `object-position` in `Hero.astro`). Delete the file and the designed pine panel ("Gomti Nagar's trusted physio clinic" + rating badge) fills the frame instead |
| `doctor-sandeep`, `doctor-mahesh` | Doctor cards — currently head-and-shoulders crops of the supplied pair image (left Dr. Sandeep Tiwari, right Dr. Mahesh Tiwari; `object-position` in `Doctors.astro` keeps the face in frame). Delete a file and that card falls back to its ST / MT monogram |
| `doctors-together` | Joint photo beside the doctors' intro (caption is a `[TBD]` until the clinic confirms who is pictured) |
| `gallery-1`, `gallery-2`, … | The clinic banner. Each one also needs a line in `gallery` in `src/data/site.ts` (label + a plain description for the alt text); `galleryPending` lists what is still to come. Photos **1000 px wide or more** go into the large swipeable viewer (arrows, counter, thumbnails, keyboard; in the order listed); smaller ones sit in the "Treatment sessions" row beneath it at their own size |

Every photo that goes through `ClinicImage` also gets the `.clinic-photo` class: one warm grade (`sepia .12, saturate 1.06, contrast 1.02`) so photos from different cameras sit together. Remove the rule in `ClinicImage.astro` to turn it off.

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

- [ ] Doctor portraits: the supplied pair image looks AI-generated/enhanced (a Gemini sparkle sits in the right-hand photo; it falls outside the crops used). Patients will see these faces at the clinic, so swap in unretouched photographs of the doctors if these are not genuine
- [ ] Gallery photos `gallery-4` … `gallery-7` (the large viewer): they show identifiable patients, so confirm consent; `gallery-6` has a wall board with fee amounts and a doctor's name that are legible at full size (the site deliberately lists no prices and no such doctor) — crop it, swap it, or confirm the board is current; the same board suggests home visits exist, which would settle the `[TBD]` FAQ answer, but nothing on the page claims it until the clinic confirms
- [ ] Hero photo: `hero.webp` looks AI-generated/edited (a Gemini sparkle sits bottom-right) and its signboard text differs from the site — hours 9:00–1:30 / 4:30–8:30, "B.Sc. B.P.T." qualifications, a second phone number, "Since 2004" — so swap in a real photograph or confirm the sign with the clinic; both doctor portraits, reception + equipment photos; higher-resolution originals of the supplied photos; confirm who is in the joint doctors photo (and fix its `[TBD]` caption); patient consent for the treatment photos
- [ ] Doctor specialisation, experience, certifications and bios (`doctors` in `src/data/site.ts`)
- [ ] Paste the Google Places API key + place ID (see *Live Google reviews*); confirm the three built-in fallback reviews are approved for use
- [ ] Home visits: the booking form offers a "Home visit" chip and the FAQ answer is still `[TBD]` — confirm the clinic does them (or remove the chip in `Booking.astro`)
- [ ] FAQ answers: home visits, session length (`faqs` — unconfirmed ones are excluded from FAQ structured data). The pricing section and the starting-price question were removed; add them back only once the clinic confirms real prices
- [ ] Sign-off on promise-style copy — "Physiotherapy that puts an expiry date on your pain.", "Gomti Nagar's trusted physio clinic", the first built-in review ("within 3 days he became quite normal"), read as outcome commitments, which PRD §37 steers away from
- [ ] Clinic's Google Business Profile URL (`links.directions` and `links.reviews` use a Maps search built from the verified address until a place ID is set; the map embed searches for the clinic by name and area — check it lands on the right pin)
- [ ] Production domain → `PUBLIC_SITE_URL` (for the current deployment: `https://physio-two-umber.vercel.app`; canonical, sitemap and `og:image` are built from it); confirm title/meta description copy. The meta description says "460+ Google reviews" and the structured data says 467 (the figure on the page) — update both as the count grows. A bespoke `og-image.jpg` was not supplied, so social previews keep using the generated `og.png`
- [ ] GA4 + Search Console approval

## Design & accessibility notes

- **Typography is deliberately restrained:** hero 36→58px, section headings 30→46px, subheadings 21→28px, body 16–18px on desktop. On phones the scale is fluid: hero `clamp(34px, 9vw, 72px)`, headings `clamp(28px, 7vw, 56px)`, body 15–16px. The `min()` in `global.css` hands over to the desktop scale at ~430px, so tablet and desktop sizes are unchanged (the 56 / 72px ceilings would have enlarged them ~20%).
- **Photography leads where it exists.** Real photos replace their slot automatically; until then the hero shows a designed typographic panel, the doctors show monograms, and the gallery is one banner holding the photos supplied so far. Decoration is limited to fine lines, dot texture and soft background circles.
- **Map:** a real, lazy-loaded Google Maps iframe with a translucent teal wash over it. It is covered by a "Tap to explore" layer so a page scroll can't be swallowed by the map on phones; one tap hands it over, tapping elsewhere takes it back. "Open in Google Maps" stays as a plain link.
- **Glassmorphism** is used sparingly on floating layers only (header, mobile menu, sticky CTA bar, hero hours card, review/contact panels). Blur is capped on small screens and has a solid fallback where `backdrop-filter` is unsupported.
- **Motion** is CSS keyframes/transitions, native CSS scroll-driven animations, and one IntersectionObserver-driven script — no animation library. Everything animates `transform`/`opacity` only (plus one `clip-path` wipe on the doctor portraits):
  - **Load:** eyebrow → headline → subtext → CTAs → pills → dark card fade up 24px over 0.7s, 120ms apart (pure CSS, so CTAs never wait on JavaScript); the hero photo settles 1.06 → 1.
  - **Scroll reveal:** an IntersectionObserver adds `.in-view` once per element (then stops watching it). Sections fade up 24px over 0.7s (`ease`); card grids (conditions, approach steps, reviews) stagger by 80ms. The stats count up 5.0 / 467+ / 2 over 1.2s (ease-out), once, when the band comes into view.
  - **Background depth** (`Depth.astro`): warm base → soft teal/sand glow → faint dots → a barely-there 1px grid (large cells, 5–7% alpha, faded toward the edges) → a few oversized thin circles and a hairline. Used on the hero, conditions, "why", gallery and visit sections. On the hero and conditions sections the glow + circles (`.d-far`, ±14px) and the grid (±6px) drift as the section scrolls past; on the dark and gallery sections the same texture stands still (see Performance). Only decorative layers ever move.
  - **Per-section choreography** (all once per entry): trust numbers rise one after another and the labels trail them; "why" blocks draw their rule, surface the numeral, then bring in the text; doctor portraits wipe down (clip-path) with name/details ~110ms behind; gallery tiles arrive from different directions with captions sliding in after them; the "How it works" line draws as you scroll and the active step lifts 3px with a ring while the previous one settles back; the reviews section plays quote mark → text → rating and stars last; the visit text and map arrive from opposite sides (wide screens).
  - **Hero rhythm:** a dotted ring turns once every 28s behind the photo, a trio of dots and a hairline drift ≤10px, and the shadow under the frame breathes. The photograph itself never moves except a ≤28px scroll parallax.
  - **Transition moments (two only):** a soft glow passes behind the "why" content, and the contact band's concentric rings settle into place — both one-shot when the section arrives.
  - **Hover** (0.2–0.25s): buttons lift 1px, the arrow nudges 4px and orange buttons brighten (a white veil fading in, so only opacity animates); the two main WhatsApp CTAs get a soft glow that belongs to the button (no pulse); condition cards lift 4px with a soft shadow, the ↗ slides 3px and a teal highlight passes across; doctor cards lift 2px (desktop); images zoom at most 1.02; the active nav link gets a thin teal underline; the FAQ opens/closes with an animated height and the + turns 45°.
  - **Header:** past 40px of scroll the bar tucks up and shrinks slightly and its frosted (blurred) layer fades in — transform and opacity only, so nothing reflows.
  - **Ambient:** the ticker between hero and conditions (pauses on hover), a 6s float on the hours card, the hero ring/dots/shadow. Looping animations pause whenever their section is off screen.
  - `prefers-reduced-motion` turns it all off: reveals and the hero entrance show immediately, no parallax or depth drift, no ambient loops, no hover movement, the ticker becomes a static wrapped list, count-up/autoplay stop.
  - **Anchors:** `scroll-behavior: smooth`, and every `section[id]` has `scroll-margin-top` equal to the header height, so headings never land under it.
  - Scroll-driven animations are a progressive enhancement (`animation-timeline: view()/scroll()`); browsers without them simply show the layers still. **Gotcha:** they are written as animation *longhands* — the CSS minifier folds `animation` + `animation-timeline` into one shorthand that Chromium silently rejects.
- **Dark sections** share one `DarkFx` layer: a static film-grain tile plus a teal and a warm-orange orb at 20% opacity (radial gradients, no `filter: blur`). The orange orb is a deliberate, subtle exception to "orange is for actions only".
- **Curved dividers:** any section with the `curve` class rises over the padding of the one above with an elliptical top edge, so light/dark bands never meet in a hard cut (pure `border-radius`, no images).
- **Live "Open now" pill** is computed in the browser against clinic time (Asia/Kolkata), so a visitor abroad still sees the right status. Without JS it shows the plain hours.
- **Condition cards** open WhatsApp in a new tab with "…I'd like to ask about <Condition>."; the doctors' buttons ("Book with Dr. …") do the same with their own message. The **concern form** in the contact band and the **booking form** only build a ready-to-send WhatsApp message and store nothing.
- **Book your visit** (`08`): name, +91 phone (exactly 10 digits), concern, visit type, one of the next six open days (Mon–Sat, in clinic time — a visitor abroad still sees clinic dates; today counts only until the last session ends) and a time of day. Invalid input shows inline errors and WhatsApp stays closed; valid input opens one new tab with the request. The copy says *request* throughout; availability is never claimed.
- **Phones (≤768px):** a fixed bottom bar (Call + WhatsApp the Clinic, 60px plus the safe-area inset) replaces the floating bubble, the page has 76px of bottom padding (the footer's colour is painted into it), and the menu is one scrollable column with the WhatsApp button pinned at the bottom. Touch targets are ≥44px (chips 48px, form fields 52px / 16px text so iOS doesn't zoom).
- **Review slider:** one card at a time on phones, three across on desktop; dots, arrows, a pause button, and a 6s autoplay that stops on hover, touch, focus, when off screen, in a background tab, and for reduced-motion users.
- **CTA contrast:** white on the PRD's CTA orange `#EA580C` is 3.55:1, which meets WCAG AA only as *large text*. Primary-button labels are therefore bold and ≥ 14pt (18.7px). If a stricter 4.5:1 is wanted, change `--color-cta` to `#C2410C`.
- Content rules from PRD §37 are followed: no superlatives, guarantees, urgency or invented statistics.

### Elevation pass

- **Hero:** the entrance photo drifts 1 → 1.08 and back (Ken Burns, 12s, ease-in-out, alternate) after its entrance settles; transform only, paused while the hero is off screen, off under reduced motion. The rating pill and the hours card float over it. The frame keeps its near-square shape — the photo is landscape and a 4:5 crop would lose the signboard.
- **Hindi line** under the hero subtext: Tiro Devanagari Hindi italic, teal, 90% of the subtext size. The webfont is **subset to that one line (13 KB instead of 100 KB)** — if the wording changes, regenerate it with the command in the comment above the `@font-face` in `global.css` (the full font is a dev dependency for that purpose).
- **Body map** (top of *01 / Conditions*): six pulsing hotspots (Neck, Shoulder, Back, Hip, Knee, Leg; 44px touch areas) scroll to the condition card with the matching title and ring it in orange for 1.2s. The mapping lives in `BodyMap.astro`, and the build fails if a target title disappears from `conditions`. Reduced motion: no pulse, the ring shows still.
- **Doctor intro video:** drop `public/doctor-intro.mp4` in and a rounded 16:9 player (native controls, `preload="none"`) appears in *03 / Doctors* at the next build; without the file nothing is rendered. Add captions before publishing a spoken video.
- **Fonts** are self-hosted (`font-display: swap`), so there is no Google Fonts preconnect; the page preconnects to `www.google.com` for the map embed only.
- **Structured data** (`Physiotherapy` JSON-LD) carries the address, phone, hours and an `aggregateRating` of 5.0 / 467 — the site's own figures. Google does not show star snippets for a business's reviews of itself; the markup is there for completeness.

## Performance notes

Scroll smoothness is measured with scripted full-page scrolls in headless Chromium at 1440×900 and 390×844. That build renders in **software** (no GPU), so absolute numbers are pessimistic — the *comparison* between builds is what matters. Share of frames slower than 33 ms (real mouse-wheel scrolling; 2 runs each):

| Build | Desktop | Mobile (390px) |
|---|---|---|
| Motion pass (before the depth/choreography pass) | 3–4% | 0% |
| Depth pass, first cut (every section drifting) | 23–24% | 0.3% |
| Master update (real photos, map, live reviews) | 9–13% | 0% |
| **Shipped** (booking, mobile pass, animation pass; page is shorter, so the hero weighs more) | **14–16%** — measured *the same* as the build before the animation pass (A/B, interleaved) | **0.3%** |

So on a software compositor the depth pass still costs desktop scrolling roughly 6–9 percentage points; mobile is unaffected. Extra translated layers should be much cheaper in a GPU-composited browser, but that could not be measured in this environment — check on a real laptop before launch. If you want the old numbers back, set `drift={false}` on the `<Depth>` in `Hero.astro` / `Conditions.astro` (the texture stays, the drift stops) or delete the `.hero__orbit` element.

What the profiling found, and the rules that came out of it:

- **Never clip a whole section to a rounded rectangle.** Curved dividers built with `border-radius` + `overflow: clip` on each section cost ~46 points of dropped frames, because clipping a subtree that contains glass to a rounded rect forces extra per-frame compositor work. The dome is now a painted `::before`; only leaf ambient layers (`.fx`, `.bg`) follow the dome shape.
- **Large `backdrop-filter` panels are the most expensive thing on the page** (~16 points on their own). Panels on dark bands (`.glass-dark`) sit over flat gradients, so they keep the translucent-gradient glass look without the blur. Real blur stays on the header, hero cards and small photo chips, which measured free.
- **Every layer that animates behind content is its own composited surface, and the cost tracks the number of such layers far more than their size or how far they move.** Measured: merging layers, shrinking them, `will-change`, `contain`, removing masks and rounded clips all made little difference; *removing the animation* (or not promoting the layer) is what helps. Hence: depth drift only where it reads (light sections), one shared drifting layer for glow + circles, a grid that only exists on the busy side of the section, and the two transition moments as one-shot transitions instead of scroll-scrubbed animations. Continuous time-based loops on the same layers were twice as expensive as scroll-linked ones.
- The map's teal tint is a plain translucent overlay: a `mix-blend-mode` over the iframe, or a CSS `filter` on it, each made scrolling past the map 4–20% slower; both together were worst.
- Film grain (one 160px tile), the ticker, dot textures and the curve domes all measured as free. Orbs are static radial gradients.
- Re-measure after adding any new full-width or animated layer; a regression this size is invisible in a screenshot and in Lighthouse (which scores load, not scroll).

## Phase 2 (not built)

A real booking system (calendar, confirmations), doctor and condition pages, blog and admin are deliberately absent. The component-per-section structure and the single data module are the extension points.
