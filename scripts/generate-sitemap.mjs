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

const SITE = "https://smithmatric-boop.github.io/claimer";
const TODAY = new Date().toISOString().split("T")[0];

// --- Extract claim IDs from lib/claims.ts ---
const claimsSource = readFileSync(resolve(ROOT, "lib/claims.ts"), "utf-8");

const transpiledClaims = ts.transpileModule(claimsSource, {
  compilerOptions: {
    esModuleInterop: true,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022
  }
}).outputText;

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
        generatedAt: new Date().toISOString(),
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

// --- Static routes ---
const staticRoutes = [
  "/",
  "/claims/",
  "/trending/",
  "/about/",
  "/review/",
  "/daily/",
  "/embed/",
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

console.log(
  `Static export generated ${urls.length} sitemap URLs, ${seedClaims.length} claims, and ${seedClaims.length} embed widgets.`
);
