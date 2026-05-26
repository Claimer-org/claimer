const fs = require("fs");
const path = require("path");

const BASE_URL = "https://smithmatric-boop.github.io/claimer";

const claimsFile = fs.readFileSync(
  path.join(__dirname, "..", "lib", "claims.ts"),
  "utf8"
);

const claimIdRegex = /^\s{4}id:\s*"([^"]+)"/gm;
const evidenceIdRegex = /^\s{6,}id:\s*"([^"]+)"/gm;
const allIds = new Set();
const evidenceIds = new Set();
let match;

while ((match = claimIdRegex.exec(claimsFile)) !== null) {
  allIds.add(match[1]);
}

while ((match = evidenceIdRegex.exec(claimsFile)) !== null) {
  evidenceIds.add(match[1]);
}

const claimIds = [...allIds].filter((id) => !evidenceIds.has(id));

const staticPages = [
  "",
  "/claims",
  "/topics",
  "/topics/ai-claims",
  "/topics/llm-benchmarks",
  "/topics/ai-safety",
  "/topics/ai-regulation",
  "/topics/tech-verification",
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
  "/auth"
];

const today = new Date().toISOString().split("T")[0];

function urlEntry(route, priority, changefreq = "weekly") {
  const suffix = route === "" ? "/" : `${route}/`;

  return `  <url>
    <loc>${BASE_URL}${suffix}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const staticEntries = staticPages.map((page) => {
  if (page === "") {
    return urlEntry(page, "1.0", "daily");
  }

  if (page === "/claims" || page === "/topics") {
    return urlEntry(page, "0.9");
  }

  return urlEntry(page, page.startsWith("/topics/") ? "0.75" : "0.7");
});

const claimEntries = claimIds.map((id) => urlEntry(`/claims/${id}`, "0.8"));

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...claimEntries].join("\n")}
</urlset>
`;

const outDir = path.join(__dirname, "..", "public");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, "sitemap.xml"), sitemap);
console.log(`Sitemap generated with ${staticPages.length + claimIds.length} URLs`);
