# Add Dr. Deepika Jain Initials Avatars Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace every visible Dr. Deepika Jain portrait with the existing `DJ` initials-avatar style.

**Architecture:** Use the existing `initials-avatar` markup and fixed styles found in other doctor cards and author blocks. Apply it only where the visible Dr. Deepika portrait was removed or is still shown; retain her text and non-visible schema image reference.

**Tech Stack:** Static HTML and the existing Node page validator.

## Global Constraints

- Modify only the Home, Doctors, blog hub, and three Dr. Deepika-authored article pages.
- Use a `DJ` initials avatar styled like the existing doctor avatars.
- Preserve all names, author/booking text, article metadata, and schema image references.
- Do not modify other doctors’ avatars.

---

### Task 1: Restore consistent visible avatars

**Files:**
- Modify: `index.html`
- Modify: `doctors/index.html`
- Modify: `blog/index.html`
- Modify: `blog/root-canal-cost-dimapur/index.html`
- Modify: `blog/how-to-choose-dentist-dimapur/index.html`
- Modify: `blog/teeth-whitening-myths/index.html`

**Interfaces:**
- Consumes: existing `initials-avatar` CSS component.
- Produces: eight visible `DJ` avatars and no rendered Dr. Deepika portrait images.

- [ ] **Step 1: Confirm the seven current locations**

Search the six files for the Dr. Deepika portrait and the two cards where it was removed. Expected: three blog-hub portraits, three article byline portraits, and two cards without an avatar.

- [ ] **Step 2: Add the card avatar**

Add `<span class="initials-avatar tile-blue" aria-hidden="true">DJ</span>` before Dr. Deepika’s heading in the Home and Doctors cards.

- [ ] **Step 3: Replace blog portraits**

Replace each Dr. Deepika blog `img` with `<span class="initials-avatar tile-blue" style="width:44px;height:44px;margin:0;font-size:1rem;box-shadow:none;" aria-hidden="true">DJ</span>`.

- [ ] **Step 4: Verify rendered output references**

Confirm the six files contain eight `DJ` avatars, no rendered Dr. Deepika portrait image, retained author/booking text, and the Doctors-page schema image reference.

- [ ] **Step 5: Run the existing page validator and push**

Run: `node tools/check-pages.mjs`.
Expected: all checks pass. Commit and fast-forward `master`.
