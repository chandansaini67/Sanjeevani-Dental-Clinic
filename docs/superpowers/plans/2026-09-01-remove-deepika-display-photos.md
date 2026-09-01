# Remove Displayed Dr. Deepika Jain Photos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove only the displayed Dr. Deepika Jain portrait from the Home and Doctors pages.

**Architecture:** Delete the two rendered `img.doctor-avatar` elements that reference the Dr. Deepika portrait. Preserve the surrounding cards, clinician data, booking links, and SEO/schema image reference.

**Tech Stack:** Static HTML and the existing Node page validator.

## Global Constraints

- Modify only `index.html` and `doctors/index.html`.
- Do not remove Dr. Deepika Jain's name, credentials, bio, booking link, or SEO/schema image reference.
- Do not change any other clinician image.
- Validate that neither changed page has a rendered portrait image for Dr. Deepika Jain.

---

### Task 1: Remove the two displayed portrait elements

**Files:**
- Modify: `index.html:275`
- Modify: `doctors/index.html:142`

**Interfaces:**
- Consumes: Existing Dr. Deepika Jain cards on the Home and Doctors pages.
- Produces: Text-only Dr. Deepika Jain cards with their existing content and links preserved.

- [ ] **Step 1: Confirm the baseline contains both portrait elements**

Run: `rg -n 'doctor-portrait-lead-300\.webp.*Deepika|Deepika.*doctor-portrait-lead-300\.webp' index.html doctors/index.html`

Expected: one rendered portrait element in each file.

- [ ] **Step 2: Delete only the two rendered portrait elements**

Remove these exact elements:
```html
<img class="doctor-avatar" src="/assets/img/doctor-portrait-lead-300.webp" alt="Portrait of Dr. Deepika Jain, Dental Surgeon at Sanjeevani Dental Clinic Dimapur" width="300" height="300" loading="lazy" />
```

Leave the surrounding `article`, headings, copy, and booking link unchanged.

- [ ] **Step 3: Verify no rendered portrait remains**

Run: `rg -n 'Portrait of Dr\. Deepika Jain|doctor-portrait-lead-300\.webp' index.html doctors/index.html`

Expected: no output from the portrait-alt-text search; the remaining schema image reference in `doctors/index.html` is allowed.

- [ ] **Step 4: Run the existing site validator**

Run: `node tools/check-pages.mjs`

Expected: page, shared header/footer, metadata, canonical, schema, NAP, and sitemap checks pass.

- [ ] **Step 5: Commit and push**

Run: `git add index.html doctors/index.html && git commit -m "content: remove displayed Deepika portrait" && git push origin master`
