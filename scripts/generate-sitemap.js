/**
 * Sitemap generator for Claimer.
 * Run as: node scripts/generate-sitemap.js
 * Called automatically via the "prebuild" npm script.
 */

const fs = require("fs");
const path = require("path");

const BASE_URL = "https://smithmatric-boop.github.io/claimer";

// Import claim IDs from the TypeScript source by parsing the file
const claimsFile = fs.readFileSync(
  path.join(__dirname, "..", "lib", "claims.ts"),
  "utf8"
);
const claimIdRegex = /id:\s*"([^"]+)"/g;
const claimIds = [];
let match;
while ((match = claimIdRegex.exec(claimsFile)) !== null) {
  // Only grab IDs that look like claim slugs (skip evidence IDs)
  if (
    !match[1].includes("-evidence-") &&
    !match[1].startsWith("erdos-") &&
    !match[1].startsWith("tribe-") &&
    !match[1].startsWith("gemini-flash-") &&
    !match[1].startsWith("ai-mode-") &&
    !match[1].startsWith("spark-") &&
    !match[1].startsWith("msft-") &&
    !match[1].startsWith("anthropic-compute-") &&
    !match[1].startsWith("chatgpt-ads-") &&
    !match[1].startsWith("photonic-") &&
    !match[1].startsWith("meta-tracking-")
  ) {
    claimIds.push(match[1]);
  }
}

// Remove duplicates
const uniqueClaimIds = [...new Set(claimIds)];

const staticPages = [
  "",
  "/claims",
  "/about",
  "/review",
  "/daily",
  "/submit",
  "/feedback",
  "/launch",
  "/metrics",
  "/profiles",
  "/terms",
  "/disclaimer",
  "/auth",
];

const today = new Date().toISOString().split("T")[0];

let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

// Static pages
for (const page of staticPages) {
  sitemap += `  <url>
    <loc>${BASE_URL}${page}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page === "" ? "daily" : "weekly"}</changefreq>
    <priority>${page === "" ? "1.0" : page === "/claims" ? "0.9" : "0.7"}</priority>
  </url>
`;
}

// Dynamic claim pages
for (const id of uniqueClaimIds) {
  sitemap += `  <url>
    <loc>${BASE_URL}/claims/${id}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
}

sitemap += `</urlset>
`;

const outDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}
fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
console.log(
  `✅ Sitemap generated with ${staticPages.length + uniqueClaimIds.length} URLs`
);
