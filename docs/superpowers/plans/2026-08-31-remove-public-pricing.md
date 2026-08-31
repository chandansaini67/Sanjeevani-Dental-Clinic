# Public Pricing Removal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all public monetary amounts and pricing-related content from the static clinic website.

**Architecture:** Add a deterministic content guard that scans published HTML for prohibited pricing language and currency/amount patterns. Update every matched visitor-facing page and shared partial so the guard passes while retaining treatment information and booking paths.

**Tech Stack:** Static HTML, JavaScript (Node.js), existing `tools/check-pages.mjs` validator.

## Global Constraints

- Scan every published `.html` file; do not modify internal documentation.
- Remove currency symbols, treatment amounts, price/cost/fee wording, price-related FAQs, and pricing schema/metadata.
- Preserve treatments, navigation, clinic details, and booking/contact flows.
- Push only after `node tools/check-pages.mjs` and the pricing-content guard pass.

---

### Task 1: Add a pricing-content guard

**Files:**
- Create: `tools/check-no-pricing.mjs`

**Interfaces:**
- Consumes: all published `.html` files beneath the repository root.
- Produces: exit code 0 when no prohibited public pricing content is found; nonzero with file/line findings otherwise.

- [ ] **Step 1: Write the failing guard with an explicit rule set**

Create `tools/check-no-pricing.mjs` to recursively inspect `.html` files, skip `.git`, and report matches for: `₹`, `Rs.`, `INR`, price, pricing, cost, costs, fee, fees, affordable, and numeric Indian currency amounts such as `12,000` when adjacent to a monetary marker.

- [ ] **Step 2: Run the guard against the baseline**

Run: `node tools/check-no-pricing.mjs`

Expected: nonzero exit and findings across treatment pages, FAQ content, and the root-canal cost blog page.

- [ ] **Step 3: Commit the guard**

Run: `git add tools/check-no-pricing.mjs && git commit -m "test: add public pricing content guard"`

### Task 2: Remove public price content

**Files:**
- Modify: `index.html`
- Modify: `faq/index.html`
- Modify: `services/index.html`
- Modify: `services/*/index.html`
- Modify: `blog/*/index.html`
- Modify: `docs/partials.html` only if shared output contains prohibited content

**Interfaces:**
- Consumes: Task 1 guard rules.
- Produces: pages that retain treatment and booking information without prices or cost-oriented claims.

- [ ] **Step 1: Replace each dedicated price block**

Remove price cards, ranges, and pricing headings. Where a visual section would otherwise become empty, replace it with one neutral contact CTA such as `Discuss your treatment options with our team.` linking to the existing booking/contact route.

- [ ] **Step 2: Rewrite price-related FAQs and body copy**

Remove questions and answers whose purpose is price disclosure. Rewrite surrounding sentences so they describe consultation, treatment planning, or booking without price/cost/fee/affordability language.

- [ ] **Step 3: Remove price-related SEO data**

Delete JSON-LD `Offer`/price fields and price-related title, description, and keyword copy. Do not alter unrelated medical/dental structured data.

- [ ] **Step 4: Verify the guard passes**

Run: `node tools/check-no-pricing.mjs`

Expected: exit code 0 and no findings.

- [ ] **Step 5: Commit content updates**

Run: `git add index.html faq/index.html services blog docs/partials.html && git commit -m "content: remove public pricing information"`

### Task 3: Validate site integrity and push

**Files:**
- Verify: all published HTML and `tools/check-pages.mjs`

- [ ] **Step 1: Run the existing page validator**

Run: `node tools/check-pages.mjs`

Expected: all page, header/footer, schema, canonical, NAP, and sitemap checks pass.

- [ ] **Step 2: Re-run the pricing guard**

Run: `node tools/check-no-pricing.mjs`

Expected: exit code 0.

- [ ] **Step 3: Inspect the final diff**

Run: `git diff HEAD~2..HEAD --check`

Expected: no whitespace errors and only pricing-removal/validation changes.

- [ ] **Step 4: Push to deployment branch**

Run: `git push origin master`

Expected: push succeeds; Vercel begins its existing automatic deployment.
