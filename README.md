# Sanjeevani Dental Clinic — Website

Multi-page website for **Sanjeevani Dental Clinic**, Dimapur, Nagaland.
Live at **https://sanjeevani-dental-clinic.vercel.app** (deployed automatically from the
`master` branch via Vercel).

Pure static HTML / CSS / JavaScript — no build step, no server, no database. Booking is
WhatsApp-first (+91 70053 78195).

---

## For the owner: how to get found on Google (do these once)

The website is the *relevance* half of Google ranking. Your Google Business Profile (GBP) is the
other half. These simple, one-time actions have the biggest effect on where you appear in Google
Maps and local search. Ask your web helper (Claude) to do any of the technical parts for you.

### 1. Fix your Google Business Profile details ⭐ highest impact
- **Set Sunday to "Closed."** Your GBP currently says you open Sunday at 9 AM — that's wrong and
  hurts ranking, because "open now" is a top Google ranking signal. Hours must be exactly:
  **Mon–Sat 9:00 AM – 5:00 PM, Sunday Closed.**
- Confirm the website link on your profile points to `https://sanjeevani-dental-clinic.vercel.app`.
- Add recent photos of the clinic, and post an update every week or two.

### 2. Fix the same details everywhere else
Your name, address and phone number must match **exactly** everywhere online. Right now they differ:
- **Instagram bio** — set hours to 9 AM–5 PM Mon–Sat, use only the number 70053 78195, and match
  the address to the one on the website.
- **Practo** — your listing shows a lunch-break split and a different layout; align hours, address
  and phone with the website.
- Remove the extra phone numbers (9089999120 / 9863938841 / 9205987988) from public posts — mixed
  numbers confuse Google.

### 3. Create free business listings (citations)
You currently have almost none — this is the single biggest untapped opportunity. Create a free
listing on each, using the **exact** name/address/phone below:
- Justdial, Sulekha, IndiaMART, and any Nagaland/Dimapur local directories.

### 4. Tell Google the new site exists
Ask Claude to help you set up **Google Search Console** (free) and submit the sitemap
(`/sitemap.xml`). This helps Google find and index all 26 pages faster. Also worth doing:
**Bing Webmaster Tools** (feeds Microsoft Copilot).

### 5. Keep asking for reviews
You're at 4.8★ with 33+ reviews — excellent. After each visit, send the patient your Google review
link on WhatsApp: **https://share.google/PbnuWCFHJTzjC2j3W**. Steady new reviews keep you ranking.

### Your exact business details (copy-paste these everywhere)
```
Name:    Sanjeevani Dental Clinic
Address: Jain Temple Road, near Ram Janki School, West Yard Colony,
         Marwari Patti, Dimapur, Nagaland 797112
Phone:   +91 70053 78195
Hours:   Monday–Saturday 9:00 AM – 5:00 PM; Sunday Closed
Website: https://sanjeevani-dental-clinic.vercel.app
```

---

## What's on the site

- **Home**, **About**, **Doctors** (4 specialists), **Contact & directions**, **Reviews**, **FAQ**
- **Treatments** hub + 9 treatment pages, each with honest ₹ price ranges and FAQs
- **Blog** with 6 dental-health guides (written under each doctor's name)
- **3D Smile Studio** — an interactive page where visitors can spin a 3D dental arch, watch a
  cavity become a root canal and crown, and drag a slider to see braces straighten teeth
- Live "open / closed" badge, WhatsApp booking form, Google map, full local-SEO markup

## Changing prices or details later

All prices live in the treatment pages, and the master facts are recorded in
[`docs/content-notes.md`](docs/content-notes.md). To change anything, ask Claude — every price and
detail can be updated and re-published in minutes. Changes pushed to `master` go live automatically.

## For developers

- Preview locally: `npx serve . -l 4180` (must be served over HTTP, not opened as a file).
- Before committing, run `node tools/check-pages.mjs` — it enforces shared header/footer, unique
  titles/descriptions, canonicals, valid schema, NAP consistency, and sitemap parity.
- Shared header/footer/schema live in [`docs/partials.html`](docs/partials.html); after editing
  them run `node tools/check-pages.mjs --sync` to propagate to every page.
- The previous single-page site is preserved at git tag **`v1-tailwind`**.
