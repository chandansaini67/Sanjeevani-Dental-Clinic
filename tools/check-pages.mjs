#!/usr/bin/env node
/**
 * check-pages.mjs — consistency checker + partial sync for the no-build static site.
 *
 *   node tools/check-pages.mjs           strict check (exit 1 on any failure)
 *   node tools/check-pages.mjs --wip     during build-out: missing link targets, orphans and
 *                                        missing sitemap/robots become warnings, not failures
 *   node tools/check-pages.mjs --sync    rewrite the shared marker regions in every page from
 *                                        docs/partials.html, then re-check
 *
 * Shared regions (must be byte-identical on every page, sourced from docs/partials.html):
 *   <!-- ==HEAD-SHARED== --> … <!-- ==/HEAD-SHARED== -->
 *   <!-- ==HEADER== -->      … <!-- ==/HEADER== -->
 *   <!-- ==FOOTER== -->      … <!-- ==/FOOTER== -->
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SYNC = process.argv.includes("--sync");
const WIP = process.argv.includes("--wip");

const DOMAIN = "https://sanjeevani-dental-clinic.vercel.app";
const NAP = {
  name: "Sanjeevani Dental Clinic",
  address:
    "Jain Temple Road, near Ram Janki School, West Yard Colony, Marwari Patti, Dimapur, Nagaland 797112",
  phoneDisplay: "+91 70053 78195",
  phoneTel: "tel:+917005378195",
  wa: "wa.me/917005378195",
  email: "sanjeevanidentaldimapur@gmail.com",
};
// Stray numbers that circulate on Instagram — must never appear on the site.
const FORBIDDEN = [/9089999120/, /9863938841/, /9205987988/, /\b5\.0\s*(?:★|star|rating)/i];
const REGIONS = ["HEAD-SHARED", "HEADER", "FOOTER"];

const failures = [];
const warnings = [];
const fail = (f, msg) => failures.push(`${f}: ${msg}`);
const warn = (f, msg) => warnings.push(`${f}: ${msg}`);
const soft = WIP ? warn : fail; // checks that relax in --wip mode

// ---------- collect pages ----------
function collectHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if ([".git", "node_modules", "docs", "tools", "assets"].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) collectHtml(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}
const pageFiles = collectHtml(ROOT).sort();
const relOf = (f) => relative(ROOT, f).split("\\").join("/");

// route: index.html -> "/", x/index.html -> "/x/", 404.html -> null (special page)
function routeOf(f) {
  const rel = relOf(f);
  if (rel === "index.html") return "/";
  if (rel === "404.html") return null;
  if (rel.endsWith("/index.html")) return "/" + rel.slice(0, -"index.html".length);
  fail(rel, `unexpected html location (pages must be <folder>/index.html)`);
  return null;
}

// ---------- partials ----------
const partialsPath = join(ROOT, "docs", "partials.html");
const regionRe = (n) =>
  new RegExp(`<!-- ==${n}== -->([\\s\\S]*?)<!-- ==/${n}== -->`);
let partials = {};
if (existsSync(partialsPath)) {
  const src = readFileSync(partialsPath, "utf8");
  for (const r of REGIONS) {
    const m = src.match(regionRe(r));
    if (m) partials[r] = m[0];
    else fail("docs/partials.html", `missing region ${r}`);
  }
} else {
  fail("docs/partials.html", "file missing");
}

// ---------- per-page checks ----------
const titles = new Map();
const descs = new Map();
const routes = new Set();
const linkedFrom = new Map(); // route -> Set(referrers)

for (const file of pageFiles) {
  const rel = relOf(file);
  let html = readFileSync(file, "utf8");
  const route = routeOf(file);
  const is404 = rel === "404.html";
  if (route) routes.add(route);

  // --sync: replace shared regions from partials
  if (SYNC && Object.keys(partials).length === REGIONS.length) {
    let changed = false;
    for (const r of REGIONS) {
      const m = html.match(regionRe(r));
      if (m && m[0] !== partials[r]) {
        html = html.replace(regionRe(r), () => partials[r]);
        changed = true;
      }
    }
    if (changed) {
      writeFileSync(file, html);
      console.log(`synced: ${rel}`);
    }
  }

  // region presence + identity
  for (const r of REGIONS) {
    const m = html.match(regionRe(r));
    if (!m) fail(rel, `missing shared region ${r}`);
    else if (partials[r] && m[0] !== partials[r])
      fail(rel, `region ${r} differs from docs/partials.html (run --sync)`);
  }

  // title / description
  const title = html.match(/<title>([^<]*)<\/title>/)?.[1]?.trim();
  if (!title) fail(rel, "missing <title>");
  else {
    if (title.length > 60) fail(rel, `title ${title.length} chars (max 60): "${title}"`);
    if (titles.has(title)) fail(rel, `duplicate title (also ${titles.get(title)})`);
    titles.set(title, rel);
  }
  const desc = html.match(/<meta\s+name="description"\s+content="([^"]*)"/)?.[1];
  if (!is404) {
    if (!desc) fail(rel, "missing meta description");
    else {
      if (desc.length < 70 || desc.length > 160)
        fail(rel, `meta description ${desc.length} chars (need 70–160)`);
      if (descs.has(desc)) fail(rel, `duplicate meta description (also ${descs.get(desc)})`);
      descs.set(desc, rel);
    }
  }

  // canonical + og
  const canonical = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/)?.[1];
  if (!is404 && route) {
    const expected = DOMAIN + route;
    if (!canonical) fail(rel, "missing canonical");
    else if (canonical !== expected) fail(rel, `canonical "${canonical}" ≠ "${expected}"`);
    for (const p of ["og:title", "og:description", "og:image", "og:url"]) {
      if (!new RegExp(`<meta\\s+property="${p}"\\s+content="[^"]+"`).test(html))
        fail(rel, `missing ${p}`);
    }
    const ogUrl = html.match(/<meta\s+property="og:url"\s+content="([^"]*)"/)?.[1];
    if (ogUrl && ogUrl !== expected) fail(rel, `og:url ≠ canonical`);
    const ogImg = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/)?.[1];
    if (ogImg && ogImg.startsWith(DOMAIN)) {
      const local = join(ROOT, ogImg.slice(DOMAIN.length).replace(/^\//, ""));
      if (!existsSync(local)) fail(rel, `og:image file missing: ${ogImg}`);
    }
    if (!/<meta\s+name="twitter:card"/.test(html)) fail(rel, "missing twitter:card");
  }

  // h1 / body data-page
  const h1s = html.match(/<h1[\s>]/g) || [];
  if (h1s.length !== 1) fail(rel, `${h1s.length} <h1> tags (need exactly 1)`);
  if (!/<body[^>]*\sdata-page="[a-z0-9-]+"/.test(html)) fail(rel, `missing <body data-page="…">`);

  // JSON-LD
  const blocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  let dentistCount = 0;
  let hasBreadcrumb = false;
  for (const b of blocks) {
    let data;
    try {
      data = JSON.parse(b[1]);
    } catch (e) {
      fail(rel, `invalid JSON-LD: ${e.message.slice(0, 80)}`);
      continue;
    }
    const types = JSON.stringify(data);
    if (/"@type"\s*:\s*"Dentist"/.test(types)) dentistCount++;
    if (/"@type"\s*:\s*"BreadcrumbList"/.test(types)) {
      hasBreadcrumb = true;
      const items = (Array.isArray(data) ? data : [data])
        .filter((d) => d["@type"] === "BreadcrumbList")
        .flatMap((d) => d.itemListElement || []);
      const last = items[items.length - 1];
      const lastUrl = last?.item?.["@id"] || last?.item || last?.["@id"];
      if (route && lastUrl && lastUrl !== DOMAIN + route)
        fail(rel, `breadcrumb last item "${lastUrl}" ≠ canonical`);
      const segs = route ? route.split("/").filter(Boolean).length : 0;
      if (route && items.length !== segs + 1)
        fail(rel, `breadcrumb has ${items.length} items, expected ${segs + 1}`);
    }
    if (/"AggregateRating"|"@type"\s*:\s*"Review"/.test(types))
      fail(rel, "AggregateRating/Review JSON-LD is forbidden (Google self-serving review policy)");
  }
  if (dentistCount !== 1) fail(rel, `${dentistCount} Dentist JSON-LD blocks (need exactly 1)`);
  if (!is404 && route !== "/" && !hasBreadcrumb) fail(rel, "missing BreadcrumbList JSON-LD");

  // NAP discipline
  if (!html.includes(NAP.address)) fail(rel, "footer/NAP address string missing or altered");
  if (!html.includes(NAP.phoneDisplay)) fail(rel, "display phone missing or altered");
  for (const telm of html.matchAll(/href="tel:([^"]+)"/g))
    if ("tel:" + telm[1] !== NAP.phoneTel) fail(rel, `wrong tel: link "${telm[1]}"`);
  for (const wam of html.matchAll(/wa\.me\/(\d+)/g))
    if (wam[1] !== "917005378195") fail(rel, `wrong WhatsApp number "${wam[1]}"`);
  for (const f of FORBIDDEN) if (f.test(html)) fail(rel, `forbidden content matches ${f}`);

  // internal links
  for (const m of html.matchAll(/href="(\/[^"#?]*)(?:[#?][^"]*)?"/g)) {
    const href = m[1];
    if (href.startsWith("/assets/")) {
      if (!existsSync(join(ROOT, href.replace(/^\//, ""))))
        fail(rel, `broken asset link ${href}`);
      continue;
    }
    if (/\.(xml|txt|ico|svg|png|jpg|webp|webmanifest)$/.test(href)) {
      if (!existsSync(join(ROOT, href.replace(/^\//, "")))) soft(rel, `missing file ${href}`);
      continue;
    }
    if (href.endsWith(".html")) {
      fail(rel, `internal link must use directory URL, not ${href}`);
      continue;
    }
    if (!href.endsWith("/")) {
      fail(rel, `internal link missing trailing slash: ${href}`);
      continue;
    }
    const target = href === "/" ? "index.html" : href.replace(/^\//, "") + "index.html";
    if (!existsSync(join(ROOT, target))) soft(rel, `link target not built yet: ${href}`);
    else {
      if (!linkedFrom.has(href)) linkedFrom.set(href, new Set());
      if (route !== href) linkedFrom.get(href).add(rel);
    }
  }

  // images
  for (const img of html.matchAll(/<img\b[^>]*>/g)) {
    const tag = img[0];
    const src = tag.match(/src="([^"]*)"/)?.[1] || "(no src)";
    if (!/\salt="[^"]+"/.test(tag)) fail(rel, `img missing alt: ${src}`);
    if (!/\swidth="\d+"/.test(tag) || !/\sheight="\d+"/.test(tag))
      fail(rel, `img missing width/height: ${src}`);
    if (!/\sloading="lazy"/.test(tag) && !/\sfetchpriority="high"/.test(tag))
      fail(rel, `img needs loading="lazy" or fetchpriority="high": ${src}`);
    if (src.startsWith("/") && !existsSync(join(ROOT, src.replace(/^\//, ""))))
      fail(rel, `img file missing: ${src}`);
  }
}

// ---------- site-level checks ----------
for (const route of routes) {
  if (route === "/" ) continue;
  if (!linkedFrom.has(route) || linkedFrom.get(route).size === 0)
    soft(relOf(join(ROOT, route.slice(1), "index.html")), "orphan page (no internal links to it)");
}

const sitemapPath = join(ROOT, "sitemap.xml");
if (existsSync(sitemapPath)) {
  const locs = [...readFileSync(sitemapPath, "utf8").matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    (m) => m[1]
  );
  const expected = new Set([...routes].map((r) => DOMAIN + r));
  for (const l of locs) if (!expected.has(l)) fail("sitemap.xml", `unknown/misformatted <loc> ${l}`);
  for (const e of expected) if (!locs.includes(e)) fail("sitemap.xml", `missing <loc> ${e}`);
  if (new Set(locs).size !== locs.length) fail("sitemap.xml", "duplicate <loc> entries");
} else soft("sitemap.xml", "not written yet");

const robotsPath = join(ROOT, "robots.txt");
if (existsSync(robotsPath)) {
  if (!readFileSync(robotsPath, "utf8").includes(`Sitemap: ${DOMAIN}/sitemap.xml`))
    fail("robots.txt", "missing Sitemap line");
} else soft("robots.txt", "not written yet");

// ---------- report ----------
for (const w of warnings) console.log(`⚠ ${w}`);
for (const f of failures) console.log(`✗ ${f}`);
console.log(
  `\n${pageFiles.length} pages checked · ${failures.length} failure(s) · ${warnings.length} warning(s)${
    WIP ? " [wip mode]" : ""
  }${SYNC ? " [after sync]" : ""}`
);
process.exit(failures.length ? 1 : 0);
