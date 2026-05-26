#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Generates a static sitemap.xml at public/sitemap.xml before the Next.js build.
 *
 * Reads seed claim IDs from lib/claims.ts and enumerates all known routes
 * including the new /topics/* SEO pages.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SITE = "https://smithmatric-boop.github.io/claimer";
const TODAY = new Date().toISOString().split("T")[0];

// --- Extract claim IDs from lib/claims.ts ---
const claimsSource = readFileSync(resolve(ROOT, "lib/claims.ts"), "utf-8");

// Match top-level claim IDs (indented with 4 spaces, not evidence IDs).
const idRegex = /^\s{4}id:\s*"([^"]+)"/gm;
const evidenceIdRegex = /^\s{6,}id:\s*"([^"]+)"/gm;

const allIds = new Set();
let m;
while ((m = idRegex.exec(claimsSource)) !== null) {
  allIds.add(m[1]);
}

const evidenceIds = new Set();
while ((m = evidenceIdRegex.exec(claimsSource)) !== null) {
  evidenceIds.add(m[1]);
}

const claimIds = [...allIds].filter((id) => !evidenceIds.has(id));

// --- Static routes ---
const staticRoutes = [
  "/",
  "/claims/",
  "/about/",
  "/review/",
  "/daily/",
  "/feedback/",
  "/launch/",
  "/submit/",
  "/profiles/",
  "/metrics/",
  "/terms/",
  "/disclaimer/",
  // Topics index + SEO pages
  "/topics/",
  "/topics/ai-claims/",
  "/topics/tech-verification/",
  "/topics/ai-safety/",
  "/topics/llm-benchmarks/",
  "/topics/ai-regulation/",
];

// --- Claim detail routes ---
const claimRoutes = claimIds.map((id) => `/claims/${id}/`);

// --- Build XML ---
function urlEntry(path, priority, changefreq = "weekly") {
  return `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const urls = [
  urlEntry("/", "1.0", "daily"),
  ...staticRoutes
    .filter((r) => r !== "/")
    .map((r) => {
      const isTopic = r.startsWith("/topics/");
      return urlEntry(r, isTopic ? "0.7" : "0.8", "weekly");
    }),
  ...claimRoutes.map((r) => urlEntry(r, "0.6", "weekly")),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

const outPath = resolve(ROOT, "public/sitemap.xml");
writeFileSync(outPath, sitemap, "utf-8");

console.log(`✅ Sitemap generated with ${urls.length} URLs → public/sitemap.xml`);
