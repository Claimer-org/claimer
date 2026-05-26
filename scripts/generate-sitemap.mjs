#!/usr/bin/env node
/**
 * generate-sitemap.mjs
 * Generates a static sitemap.xml at public/sitemap.xml before the Next.js build.
 *
 * Reads seed claims from lib/claims.ts, exports public claim data and iframe
 * widgets, then enumerates all known routes including /topics/* SEO pages.
 */

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import ts from "typescript";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://claimer-org.github.io/claimer"
).replace(/\/$/, "");
const TODAY = new Date().toISOString().split("T")[0];
const BUILD_TIME = new Date().toISOString();

// --- Extract claim IDs from lib/claims.ts ---
const claimsSource = readFileSync(resolve(ROOT, "lib/claims.ts"), "utf-8");

const claimsFile = resolve(ROOT, "lib/claims.ts");

const transpileResult = ts.transpileModule(claimsSource, {
  fileName: claimsFile,
  reportDiagnostics: true,
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
});

const transpileErrors = (transpileResult.diagnostics ?? []).filter(
  (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error
);

if (transpileErrors.length > 0) {
  throw new Error(
    `Seed claim source failed TypeScript validation:\n${ts.formatDiagnosticsWithColorAndContext(
      transpileErrors,
      {
        getCanonicalFileName: (fileName) => fileName,
        getCurrentDirectory: () => ROOT,
        getNewLine: () => "\n"
      }
    )}`
  );
}

const transpiledClaims = transpileResult.outputText;

const claimsModule = { exports: {} };
new Function(
  "exports",
  "require",
  "module",
  "__filename",
  "__dirname",
  transpiledClaims
)(
  claimsModule.exports,
  require,
  claimsModule,
  resolve(ROOT, "lib/claims.ts"),
  resolve(ROOT, "lib")
);

const { seedClaims, evidenceCounts } = claimsModule.exports;

if (!Array.isArray(seedClaims) || typeof evidenceCounts !== "function") {
  throw new Error("Could not load seed claims for static export.");
}

const claimIds = seedClaims.map((claim) => claim.id);

function slugifySourceName(name) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const sourceNames = [
  ...new Set(
    seedClaims.map((claim) =>
      claim.sourcePublisher?.trim() || claim.claimantName?.trim() || "unknown-source"
    )
  )
].sort();
const sourceSlugs = sourceNames.map((name) => slugifySourceName(name));

function duplicated(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates].sort();
}

function assertUnique(values, label) {
  const duplicates = duplicated(values);

  if (duplicates.length > 0) {
    throw new Error(`Duplicate ${label}: ${duplicates.join(", ")}`);
  }
}

function assertPublicUrl(value, label) {
  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} is not a valid URL: ${value}`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${label} must use http or https: ${value}`);
  }
}

function validateSeedClaims() {
  assertUnique(claimIds, "claim IDs");

  const evidenceIds = [];

  for (const claim of seedClaims) {
    assertPublicUrl(claim.sourceUrl, `Claim ${claim.id} sourceUrl`);

    for (const evidence of claim.evidence) {
      evidenceIds.push(evidence.id);
      assertPublicUrl(evidence.sourceUrl, `Evidence ${evidence.id} sourceUrl`);
    }
  }

  assertUnique(evidenceIds, "evidence IDs");
}

validateSeedClaims();
assertUnique(sourceSlugs, "source slugs");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function widgetHtml(claim) {
  const counts = evidenceCounts(claim);
  const claimUrl = `${SITE}/claims/${claim.id}/?utm_source=embed&utm_medium=widget&utm_campaign=claim_embed&utm_content=${claim.id}&claim_id=${claim.id}&ref=embed_widget`;
  const sourceUrl = claim.sourceUrl;
  const evidenceTotal = counts.support + counts.challenge + counts.context;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,follow">
  <title>${escapeHtml(claim.title)} | Claimer embed</title>
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    body {
      display: grid;
      min-height: 100vh;
      margin: 0;
      background: #0a0e17;
      color: #e8ecf4;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
      align-items: start;
      justify-items: center;
    }
    .card {
      min-height: 320px;
      width: min(100vw, 680px);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 10px;
      background: linear-gradient(145deg, rgba(26,34,53,0.98), rgba(17,24,39,0.98));
      padding: 18px;
    }
    .topline, .stats, .footer {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .pill {
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 999px;
      padding: 3px 9px;
      color: #a5b4fc;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
    }
    h1 {
      margin: 12px 0 12px;
      font-size: clamp(18px, 5vw, 23px);
      line-height: 1.18;
    }
    p {
      margin: 0 0 14px;
      color: #aab4c5;
      font-size: 14px;
    }
    .stats {
      margin: 0 0 14px;
    }
    .stat {
      min-width: 86px;
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 8px;
      padding: 8px 10px;
      background: rgba(10,14,23,0.55);
    }
    .stat strong {
      display: block;
      color: #fff;
      font-size: 20px;
      line-height: 1;
    }
    .stat span {
      color: #8b95a8;
      font-size: 11px;
      text-transform: uppercase;
    }
    a {
      color: #c7d2fe;
      text-decoration: none;
    }
    a:hover { color: #fff; }
    .footer {
      justify-content: space-between;
      border-top: 1px solid rgba(255,255,255,0.09);
      margin-top: 14px;
      padding-top: 12px;
      font-size: 13px;
    }
    .brand {
      color: #fff;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <article class="card">
    <div class="topline">
      <span class="pill">${escapeHtml(claim.domain)}</span>
      <span class="pill">${escapeHtml(claim.veracityLabel)}</span>
    </div>
    <h1>${escapeHtml(claim.title)}</h1>
    <p>${escapeHtml(claim.body)}</p>
    <div class="stats" aria-label="Claim assessment scores">
      <div class="stat"><strong>${claim.attributionScore}%</strong><span>Attribution</span></div>
      <div class="stat"><strong>${claim.veracityScore}%</strong><span>Veracity</span></div>
      <div class="stat"><strong>${evidenceTotal}</strong><span>Sources</span></div>
    </div>
    <p>Support: ${counts.support} | Challenge: ${counts.challenge} | Context: ${counts.context}</p>
    <div class="footer">
      <span class="brand">Claimer</span>
      <a href="${escapeHtml(sourceUrl)}" target="_blank" rel="noreferrer">Source</a>
      <a href="${escapeHtml(claimUrl)}" target="_blank" rel="noreferrer">Open evidence chain</a>
    </div>
  </article>
</body>
</html>`;
}

function exportClaimData() {
  const apiDir = resolve(ROOT, "public/api");
  const widgetsDir = resolve(ROOT, "public/widgets/claims");
  mkdirSync(apiDir, { recursive: true });
  mkdirSync(widgetsDir, { recursive: true });

  rmSync(widgetsDir, { recursive: true, force: true });
  mkdirSync(widgetsDir, { recursive: true });

  const claims = seedClaims.map((claim) => {
    const counts = evidenceCounts(claim);
    return {
      id: claim.id,
      url: `${SITE}/claims/${claim.id}/`,
      embedUrl: `${SITE}/widgets/claims/${claim.id}.html`,
      title: claim.title,
      body: claim.body,
      domain: claim.domain,
      claimantName: claim.claimantName,
      subjectKind: claim.subjectKind,
      sourceUrl: claim.sourceUrl,
      sourceTitle: claim.sourceTitle,
      sourcePublisher: claim.sourcePublisher,
      sourceQuality: claim.sourceQuality,
      attributionScore: claim.attributionScore,
      attributionLabel: claim.attributionLabel,
      attributionExplanation: claim.attributionExplanation,
      veracityScore: claim.veracityScore,
      veracityLabel: claim.veracityLabel,
      veracityExplanation: claim.veracityExplanation,
      evidenceCounts: counts,
      evidence: claim.evidence.map((entry) => ({
        id: entry.id,
        stance: entry.stance,
        assessmentTarget: entry.assessmentTarget ?? "veracity",
        summary: entry.summary,
        sourceUrl: entry.sourceUrl,
        sourceTitle: entry.sourceTitle,
        sourceQuality: entry.sourceQuality,
        createdAt: entry.createdAt,
        aiAssisted: entry.aiAssisted
      })),
      createdAt: claim.createdAt,
      aiAssisted: claim.aiAssisted
    };
  });

  writeFileSync(
    resolve(apiDir, "claims.json"),
    `${JSON.stringify(
      {
        type: "claimer.claim-pack",
        generatedAt: BUILD_TIME,
        site: SITE,
        count: claims.length,
        claims
      },
      null,
      2
    )}\n`,
    "utf-8"
  );

  for (const claim of seedClaims) {
    writeFileSync(
      resolve(widgetsDir, `${claim.id}.html`),
      widgetHtml(claim),
      "utf-8"
    );
  }
}

exportClaimData();

function latestClaims(limit = 25) {
  return [...seedClaims]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
}

function feedDescription(claim) {
  const counts = evidenceCounts(claim);
  const evidenceTotal = counts.support + counts.challenge + counts.context;

  return [
    `${claim.veracityLabel}.`,
    `Attribution ${claim.attributionScore}%; veracity ${claim.veracityScore}%.`,
    `${evidenceTotal} evidence ${evidenceTotal === 1 ? "entry" : "entries"}: ${counts.support} support, ${counts.challenge} challenge, ${counts.context} context.`,
    claim.body,
    `Source: ${claim.sourceTitle} (${claim.sourceUrl})`
  ].join(" ");
}

function exportFeeds() {
  const publicDir = resolve(ROOT, "public");
  const feedClaims = latestClaims();
  const latestDate =
    feedClaims[0]?.createdAt ? new Date(feedClaims[0].createdAt) : new Date(BUILD_TIME);

  const rssItems = feedClaims
    .map((claim) => {
      const url = `${SITE}/claims/${claim.id}/?utm_source=rss&utm_medium=feed&utm_campaign=organic_discovery&utm_content=${claim.id}&claim_id=${claim.id}&ref=rss`;
      return `    <item>
      <title>${escapeHtml(claim.title)}</title>
      <link>${escapeHtml(url)}</link>
      <guid isPermaLink="true">${escapeHtml(`${SITE}/claims/${claim.id}/`)}</guid>
      <pubDate>${new Date(claim.createdAt).toUTCString()}</pubDate>
      <category>${escapeHtml(claim.domain)}</category>
      <description>${escapeHtml(feedDescription(claim))}</description>
      <source url="${escapeHtml(claim.sourceUrl)}">${escapeHtml(claim.sourceTitle)}</source>
    </item>`;
    })
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Claimer Latest Claims</title>
    <link>${SITE}/</link>
    <description>Latest source-backed AI and technology claims with community assessment scores.</description>
    <language>en-us</language>
    <lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <atom:link href="https://pubsubhubbub.appspot.com/" rel="hub" />
${rssItems}
  </channel>
</rss>
`;

  const jsonFeed = {
    version: "https://jsonfeed.org/version/1.1",
    title: "Claimer Latest Claims",
    home_page_url: `${SITE}/`,
    feed_url: `${SITE}/feed.json`,
    hubs: [{ type: "WebSub", url: "https://pubsubhubbub.appspot.com/" }],
    description:
      "Latest source-backed AI and technology claims with attribution and veracity assessment scores.",
    language: "en-US",
    items: feedClaims.map((claim) => ({
      id: claim.id,
      url: `${SITE}/claims/${claim.id}/?utm_source=json_feed&utm_medium=feed&utm_campaign=organic_discovery&utm_content=${claim.id}&claim_id=${claim.id}&ref=json_feed`,
      title: claim.title,
      content_text: feedDescription(claim),
      date_published: claim.createdAt,
      tags: [claim.domain, claim.sourceQuality, claim.veracityLabel],
      external_url: claim.sourceUrl,
      authors: [
        {
          name: claim.claimantName
        }
      ]
    }))
  };

  writeFileSync(resolve(publicDir, "feed.xml"), rss, "utf-8");
  writeFileSync(
    resolve(publicDir, "feed.json"),
    `${JSON.stringify(jsonFeed, null, 2)}\n`,
    "utf-8"
  );
}

exportFeeds();

function exportLlmsText() {
  const recentClaims = latestClaims(15);
  const lines = [
    "# Claimer",
    "",
    "> Source-backed community assessment for public AI and technology claims.",
    "",
    "Claimer separates attribution accuracy from claim veracity. Every public claim includes a source URL and an evidence chain with support, challenge, or context entries.",
    "",
    "## Core Pages",
    `- Home: ${SITE}/`,
    `- Claims: ${SITE}/claims/`,
    `- Topics: ${SITE}/topics/`,
    `- Sources: ${SITE}/sources/`,
    `- Review queue: ${SITE}/review/`,
    `- Submit: ${SITE}/submit/`,
    `- Data exports: ${SITE}/data/`,
    "",
    "## Machine-Readable Data",
    `- Claim pack JSON: ${SITE}/api/claims.json`,
    `- RSS feed: ${SITE}/feed.xml`,
    `- JSON Feed: ${SITE}/feed.json`,
    `- Sitemap: ${SITE}/sitemap.xml`,
    "",
    "## Corpus Snapshot",
    `- Claims: ${seedClaims.length}`,
    `- Sources: ${sourceNames.length}`,
    `- Latest generated: ${BUILD_TIME}`,
    "",
    "## Recent Claims",
    ...recentClaims.map((claim) => `- ${claim.title}: ${SITE}/claims/${claim.id}/`),
    "",
    "## Source Directory",
    ...sourceNames.slice(0, 30).map((name) => `- ${name}: ${SITE}/sources/${slugifySourceName(name)}/`)
  ];

  writeFileSync(resolve(ROOT, "public/llms.txt"), `${lines.join("\n")}\n`, "utf-8");
}

exportLlmsText();

// --- Static routes ---
const staticRoutes = [
  "/",
  "/claims/",
  "/trending/",
  "/about/",
  "/sources/",
  "/review/",
  "/daily/",
  "/embed/",
  "/feedback/",
  "/launch/",
  "/submit/",
  "/profiles/",
  "/metrics/",
  "/data/",
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
const sourceRoutes = sourceSlugs.map((slug) => `/sources/${slug}/`);

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
  ...sourceRoutes.map((r) => urlEntry(r, "0.5", "weekly")),
];

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>
`;

const outPath = resolve(ROOT, "public/sitemap.xml");
writeFileSync(outPath, sitemap, "utf-8");
writeFileSync(
  resolve(ROOT, "public/robots.txt"),
  `User-agent: *
Allow: /

Sitemap: ${SITE}/sitemap.xml
`,
  "utf-8"
);

console.log(
  `Static export generated ${urls.length} sitemap URLs, ${seedClaims.length} claims, ${sourceSlugs.length} sources, ${seedClaims.length} embed widgets, and ${latestClaims().length} feed items.`
);
