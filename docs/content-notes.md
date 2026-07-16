# Content Notes — single source of truth (v2)

Every site-facing fact derives from this file. If a fact changes, update it HERE first, then
propagate to pages (`tools/check-pages.mjs` enforces the critical strings).

## Canonical constants (NAP — must match Google Business Profile)

| Key | Value |
|---|---|
| DOMAIN | https://sanjeevani-dental-clinic.vercel.app |
| NAME | Sanjeevani Dental Clinic |
| TAGLINE | Healthy Smiles, Happy Lives |
| ADDRESS (display) | Jain Temple Road, near Ram Janki School, West Yard Colony, Marwari Patti, Dimapur, Nagaland 797112 |
| ADDRESS (GBP raw) | Jain Temple Rd, near RAMJANKISCHOOL, West Yard Colony, Marwari Patti, Dimapur, Nagaland 797112 |
| PHONE (display) | +91 70053 78195 |
| PHONE (tel:) | +917005378195 |
| WHATSAPP | https://wa.me/917005378195 |
| EMAIL | sanjeevanidentaldimapur@gmail.com (always lowercase) |
| HOURS | Mon–Sat 09:00–17:00 IST · Sunday closed (owner-confirmed 2026-07-04) |
| GEO | 25.905683, 93.7238305 (Plus code WP4F+7G Dimapur) |
| MAPS place URL | https://www.google.com/maps/place/Sanjeevani+Dental+Clinic/@25.905683,93.7238305,17z/ |
| REVIEW link | https://share.google/PbnuWCFHJTzjC2j3W |
| INSTAGRAM | https://www.instagram.com/sanjeevani_dentalc |
| RATING (honest) | 4.8★ · 39 Google reviews (as of 2026-07-16; served from reviews.json — see below; never claim 5.0) |
| STATS | 15+ years · 4 specialists · 5,000+ patients |
| MAP EMBED | https://www.google.com/maps?q=Sanjeevani+Dental+Clinic+Jain+Temple+Road+Dimapur&output=embed |

**Forbidden anywhere on the site:** stray phone numbers 9089999120 / 9863938841 / 9205987988
(seen on Instagram posts — never publish), any "5.0 rating" claim, any AggregateRating/Review
JSON-LD (Google self-serving review policy).

## Doctors (owner-confirmed 2026-07-04: these 4 only)

- Dr. Deepika Jain — Dental Surgeon
- Dr. Kivibo Awomi — Dental Surgeon
- Dr. Anovili Chishi — Oral Surgeon
- Dr. Tisso — Orthodontist

(Instagram also mentions Dr. Bishal Gogoi and Dr. Jyotishmita Sarmah — owner chose NOT to list them.)

## GBP snapshot (2026-07-04)

- Categories: **Dental clinic (primary)**, Cosmetic dentist, Dental hygienist, Dental implants
  periodontist, Dental implants provider, Dentist, **Emergency dental service**, Orthodontist,
  **Pediatric dentist**, Teeth whitening service
- Attributes: LGBTQ+ friendly, **identifies as women-owned** (use in About copy)
- Website + wa.me already linked on GBP · 2,979 profile views · ~516 views/month
- Hours shown on GBP: "Opens 9 am Sun" — **WRONG per owner** (fix-list item 1)

## Real Google review quotes (usable as visible content — never as schema)

- "It was a great experience! Was explained in a very better way" — Wonder Ful
- "Amazing experience ever fully pain relief and satisfied" — Aditya Saini
- "Supportive staff with good Treatment ❤️ Well satisfied" — Himanshu Saini
- "Clean environment + professional treatment" — Google review summary
- "Amazing services well satisfied with the treatment and staff" — Google review summary

## Keyword map (one primary local keyword per page)

| Route | Primary keyword |
|---|---|
| / | dentist in Dimapur |
| /about/ | dental clinic in Dimapur |
| /doctors/ | best dentist in Dimapur |
| /services/ | dental treatment cost in Dimapur |
| /services/teeth-cleaning-checkup/ | teeth cleaning in Dimapur |
| /services/root-canal-treatment/ | root canal treatment in Dimapur |
| /services/dental-implants/ | dental implant cost in Dimapur |
| /services/braces-aligners/ | braces cost in Dimapur |
| /services/teeth-whitening/ | teeth whitening in Dimapur |
| /services/wisdom-tooth-extraction/ | wisdom tooth extraction in Dimapur |
| /services/crowns-bridges/ | dental crown cost in Dimapur |
| /services/kids-dentistry/ | kids dentist in Dimapur |
| /services/emergency-dental-care/ | emergency dentist in Dimapur |
| /smile-studio/ | 3D dental experience (brand/engagement) |
| /blog/root-canal-cost-dimapur/ | root canal cost Dimapur |
| /blog/how-to-choose-dentist-dimapur/ | dentist near me Dimapur |
| /blog/braces-guide-nagaland/ | braces cost Nagaland |
| /blog/wisdom-tooth-pain-guide/ | wisdom tooth pain relief |
| /blog/teeth-whitening-myths/ | teeth whitening myths |
| /blog/kids-first-dental-visit/ | child first dental visit |
| /reviews/ | Sanjeevani Dental Clinic reviews |
| /contact/ | dental clinic near Ram Janki School Dimapur |
| /faq/ | dental questions answers Dimapur |

## PRICES — **CONFIRMED BY OWNER 2026-07-05** (approved for launch as-is; owner may adjust anytime)

| Service | Draft range (₹) | Notes shown on site |
|---|---|---|
| Dental check-up & consultation | 200 – 500 | adjusted against treatment |
| Teeth cleaning (scaling & polishing) | 800 – 1,500 | per sitting |
| Teeth whitening (in-clinic) | 4,000 – 8,000 | both arches |
| Root canal treatment | 3,000 – 6,000 | per tooth; molar at upper end; crown separate |
| Dental crowns | 1,500 – 12,000 | metal 1.5–3k · PFM 3–5k · zirconia 8–12k, per unit |
| Wisdom tooth extraction | 1,500 – 6,000 | simple 1.5–3k · surgical/impacted 3–6k |
| Dental implants | 25,000 – 45,000 | per tooth, implant + crown |
| Braces & aligners | 25,000 – 1,50,000 | metal 25–45k · ceramic 35–60k · aligners 60k–1.5L (full treatment) |
| Kids' dentistry | 200 – 3,500 | consult 200–500 · fluoride 800–1,500 · sealants 500–1,000/tooth · pulpectomy 2,000–3,500 |
| Emergency visit (same-day) | 300 – 800 | consultation; treatment cost as per procedure |

Every price table on the site carries: *"Indicative ranges for planning only. Your exact cost is
confirmed in writing after examination, before any treatment begins."*

## Live Google rating & review count (auto-updated)

The rating/count shown sitewide (footer on all pages, home hero badge + reviews line, About chip,
reviews page) is **live**, wired 2026-07-16:
- Visible number sits in `<span data-gmb-rating>` / `<span data-gmb-count>` hooks; the HTML keeps a
  static baseline ("4.8" / "33+") so it's always correct even before/without JS.
- `assets/js/main.js` `initReviews()` fetches same-origin **`assets/data/reviews.json`** and paints
  the hooks. No third-party call or CORS in the visitor's browser.
- `reviews.json` is refreshed by the daily GitHub Action **`.github/workflows/refresh-reviews.yml`**,
  which pulls from Featurable's public API (`https://api.featurable.com/api/v1/widgets/<ID>`,
  server-side — Featurable blocks browser CORS) and only overwrites the file when it extracts a sane
  rating (0<r≤5) + integer count (fail-safe otherwise).
- **OWNER CHOSE OPTION A (2026-07-16): manual refresh, no auto-update.** The daily schedule in the
  workflow is commented out; the number is updated on request by editing `assets/data/reviews.json`
  (read the live figure from the GBP profile, e.g. share.google link, then commit). Current value:
  4.8 / 39. To switch to Option B (hands-off auto-update): owner creates a free Featurable widget →
  sends the public widget ID → `gh variable set FEATURABLE_ID` → re-enable the `schedule:` cron →
  run once (`workflow_dispatch`) → confirm the jq field paths match Featurable's real response.
- **No AggregateRating/Review JSON-LD** — visible text only (checker-enforced).

## Consistency fix-list (post-launch, owner actions — Claude provides steps)

1. **GBP hours: set Sunday = Closed** (currently "Opens 9 am Sun"). Hours accuracy is a top-5
   local ranking factor.
2. Instagram bio: hours → 9 AM–5 PM Mon–Sat · remove extra phone numbers · align address wording.
3. Practo listing: fix hours (shows 12:00–12:15 lunch split) · align address + single phone.
4. Google Search Console (meta-tag verification) + Bing Webmaster · submit sitemap.xml.
5. Weekly review-ask via https://share.google/PbnuWCFHJTzjC2j3W (WhatsApp follow-up template).
