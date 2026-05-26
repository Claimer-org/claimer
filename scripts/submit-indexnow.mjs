#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SITE = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://claimer-org.github.io/claimer"
).replace(/\/$/, "");
const HOST = new URL(SITE).host;
const KEY = process.env.INDEXNOW_KEY || "86c6a461-1494-40f5-9f4f-475741a130ad";
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";

function sitemapUrls() {
  const sitemap = readFileSync(resolve(ROOT, "public/sitemap.xml"), "utf-8");
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

const urlList = [
  ...sitemapUrls(),
  `${SITE}/sitemap.xml`,
  `${SITE}/robots.txt`,
  `${SITE}/feed.xml`,
  `${SITE}/feed.json`,
  `${SITE}/api/claims.json`
];

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: KEY_LOCATION,
  urlList: [...new Set(urlList)]
};

const response = await fetch(ENDPOINT, {
  method: "POST",
  headers: {
    "content-type": "application/json; charset=utf-8"
  },
  body: JSON.stringify(payload)
});

console.log(
  JSON.stringify(
    {
      endpoint: ENDPOINT,
      status: response.status,
      statusText: response.statusText,
      submittedUrls: payload.urlList.length,
      keyLocation: KEY_LOCATION
    },
    null,
    2
  )
);

if (![200, 202].includes(response.status)) {
  const body = await response.text();
  if (body) {
    console.error(body);
  }
  process.exit(1);
}
