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
const RETRY_DELAYS_MS = [250, 750, 1500];
const BODY_SNIPPET_LIMIT = 500;
const SUCCESS_STATUSES = new Set([200, 202]);

function sitemapUrls() {
  const sitemap = readFileSync(resolve(ROOT, "public/sitemap.xml"), "utf-8");
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
}

function isTransientStatus(status) {
  return status === 429 || status >= 500;
}

function classifyStatus(status) {
  if (SUCCESS_STATUSES.has(status)) {
    return "success";
  }

  if (isTransientStatus(status)) {
    return "transient";
  }

  if (status >= 400) {
    return "hard_failure";
  }

  return "unexpected";
}

function sleep(ms) {
  return new Promise((resolveSleep) => {
    setTimeout(resolveSleep, ms);
  });
}

async function bodyEvidence(response) {
  const body = await response.text();
  const snippet = body.replace(/\s+/g, " ").trim();

  if (!snippet) {
    return undefined;
  }

  const truncated = snippet.length > BODY_SNIPPET_LIMIT;
  return {
    snippet: truncated ? `${snippet.slice(0, BODY_SNIPPET_LIMIT)}...` : snippet,
    length: snippet.length,
    truncated
  };
}

function logStatus(level, status) {
  const output = JSON.stringify(status, null, 2);

  if (level === "error") {
    console.error(output);
    return;
  }

  if (level === "warn") {
    console.warn(output);
    return;
  }

  console.log(output);
}

function buildPayload() {
  const urlList = [
    ...sitemapUrls(),
    `${SITE}/sitemap.xml`,
    `${SITE}/robots.txt`,
    `${SITE}/feed.xml`,
    `${SITE}/feed.json`,
    `${SITE}/api/claims.json`
  ];

  return {
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: [...new Set(urlList)]
  };
}

async function submitIndexNow() {
  const payload = buildPayload();
  const maxAttempts = RETRY_DELAYS_MS.length + 1;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "content-type": "application/json; charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    const classification = classifyStatus(response.status);
    const status = {
      event: "indexnow_submission",
      endpoint: ENDPOINT,
      attempt,
      maxAttempts,
      status: response.status,
      statusText: response.statusText,
      classification,
      submittedUrls: payload.urlList.length,
      keyLocation: KEY_LOCATION
    };

    if (classification === "success") {
      logStatus("info", {
        ...status,
        outcome: "success"
      });
      return 0;
    }

    const evidence = await bodyEvidence(response);
    const retryable = classification === "transient" && attempt < maxAttempts;

    if (retryable) {
      const retryAfterMs = RETRY_DELAYS_MS[attempt - 1];
      logStatus("warn", {
        ...status,
        outcome: "retrying",
        retryAfterMs,
        responseBody: evidence
      });
      await sleep(retryAfterMs);
      continue;
    }

    if (classification === "transient") {
      logStatus("warn", {
        ...status,
        outcome: "warning",
        warning: "IndexNow returned a transient status after all retry attempts; deploy remains successful.",
        responseBody: evidence
      });
      return 0;
    }

    logStatus("error", {
      ...status,
      outcome: "failure",
      responseBody: evidence
    });
    return 1;
  }

  throw new Error("IndexNow submission loop exited unexpectedly.");
}

submitIndexNow()
  .then((exitCode) => {
    process.exitCode = exitCode;
  })
  .catch((error) => {
    logStatus("error", {
      event: "indexnow_submission_error",
      outcome: "failure",
      error: {
        name: error?.name || "Error",
        message: error?.message || String(error)
      }
    });
    process.exitCode = 1;
  });
