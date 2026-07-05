# Sanjeevani Dental Clinic v2 — Approved Design Spec (2026-07-04)

Owner-approved redesign: single-page site → 25-page static site with local SEO, blog, and a 3D
interactive page. Full working notes live in `docs/content-notes.md` (constants, keyword map,
draft prices, fix-list). This spec records the approved design decisions.

## Design direction — "Fresh Clinical Calm"

Light, airy, premium healthcare feel. Brand continuity with v1: blue `#2575eb` family + mint
`#22c4a3`, Playfair Display (display serif) + Plus Jakarta Sans (body), soft radial gradients,
glass cards, generous whitespace, photo-forward sections, GSAP-powered but restrained motion
(`prefers-reduced-motion` fully respected). Honest trust signals: real Google rating 4.8★ (33
reviews), real review quotes, real clinic photos where available (AI renders used only as
illustrative art with honest alt text).

## Architecture

Pure static HTML/CSS/JS — no build step, no framework, no Tailwind. Directory-per-page clean
URLs. Shared header/footer/org-schema embedded byte-identical from `docs/partials.html`,
enforced and synced by `tools/check-pages.mjs` (also validates titles, canonicals, OG, schema,
NAP strings, internal links, image attributes, sitemap parity). Vercel serves `master`;
`vercel.json` adds trailing-slash behavior, long-cache for assets, and security headers.

## Site map

Home · About · Doctors · Services hub + 9 service pages (teeth-cleaning-checkup,
root-canal-treatment, dental-implants, braces-aligners, teeth-whitening,
wisdom-tooth-extraction, crowns-bridges, kids-dentistry, emergency-dental-care) ·
Smile Studio (3D) · Blog + 6 posts · Reviews · Contact · FAQ · Privacy Policy · 404.

SEO: one primary local keyword per page (map in content-notes), `Dentist` org JSON-LD sitewide
(geo 25.905683, 93.7238305), Service+FAQPage on service pages, BlogPosting with doctor
bylines/reviewedBy, BreadcrumbList on inner pages, sitemap.xml + robots.txt + llms.txt,
no AggregateRating/Review markup. Booking stays WhatsApp-first (+91 70053 78195).

## Smile Studio (3D)

Three.js `0.165.0` (import map, page-only, procedural geometry — no model files):

1. **Arch explorer** — rotatable low-poly dental arch; tap a tooth → info card + treatment links.
2. **Decay→RCT→crown story** — GSAP ScrollTrigger scrubbed, pinned; clipping-plane cross-section.
3. **Braces morph** — GSAP Draggable slider morphs crooked → aligned arch; synced range input.

Capability gate (reduced-motion / saveData / no WebGL / CDN failure) swaps in static posters +
step lists; explainer text is always crawlable DOM.

## Launch protocol

Build on branch `v2` (v1 preserved via tag `v1-tailwind`). Local verification (checker green,
preview-tool pass, Lighthouse) → owner confirms draft ₹ prices → merge to `master` → Vercel
production deploy → live checks → owner fix-list handoff (GBP Sunday hours, IG bio, Practo,
Search Console, review cadence).
