# Add Dr. Deepika Jain Blog Photo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the user-supplied photo as Dr. Deepika Jain's visible blog-author avatar.

**Architecture:** Generate a centered square avatar asset from the supplied photo, add it under `assets/img/`, and replace only the six visible Dr. Deepika blog byline avatars. The existing 44×44 CSS and circular display shape remain unchanged.

**Tech Stack:** Image generation/editing, static HTML, existing Node page validator.

## Global Constraints

- Change only blog author areas and the new image asset.
- Use a centered square crop appropriate for a 44×44 circular avatar.
- Preserve all Home/Doctors cards, names, author text, metadata, and schema.
- Do not modify any other doctor's avatar.

---

### Task 1: Create the blog avatar asset

**Files:**
- Create: `assets/img/dr-deepika-jain-blog-avatar.webp`

- [ ] **Step 1: Produce the centered square crop**

Use the supplied photo as the reference. Create a square, face-centered crop with no retouching or visual changes beyond the crop and web optimization.

- [ ] **Step 2: Inspect the generated asset**

Verify the face is centered and legible at small avatar size.

### Task 2: Apply the avatar only in Dr. Deepika's blog bylines

**Files:**
- Modify: `blog/index.html`
- Modify: `blog/root-canal-cost-dimapur/index.html`
- Modify: `blog/how-to-choose-dentist-dimapur/index.html`
- Modify: `blog/teeth-whitening-myths/index.html`

- [ ] **Step 1: Replace the three blog-hub avatar elements**

Change only the three visible Dr. Deepika author avatar elements to:
```html
<img src="/assets/img/dr-deepika-jain-blog-avatar.webp" alt="Dr. Deepika Jain" width="44" height="44" loading="lazy" />
```

- [ ] **Step 2: Replace the three article-byline avatar elements**

Use the same exact image element in the three Dr. Deepika-authored articles. Preserve the surrounding author text and article metadata.

- [ ] **Step 3: Verify scope and content**

Confirm six visible references use the new asset; no other doctor avatar, Home/Doctors card, or schema field changed.

- [ ] **Step 4: Run page validation and push**

Run: `node tools/check-pages.mjs`. Expected: all checks pass. Commit and fast-forward `master`.
