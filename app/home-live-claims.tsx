"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type Claim,
  evidenceCounts
} from "../lib/claims";
import {
  canUseSupabase,
  loadSupabaseClaims
} from "../lib/supabase-claims";

type LiveClaimsStatus = "loading" | "ready" | "error";

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return sourceUrl;
  }
}

function sourceLabel(claim: Claim) {
  return claim.sourcePublisher || sourceHost(claim.sourceUrl);
}

function sourceLinkCount(claim: Claim) {
  return new Set(
    [claim.sourceUrl, ...claim.evidence.map((entry) => entry.sourceUrl)].filter(Boolean)
  ).size;
}

function inspectHref(claimId: string) {
  return `/claims/?claim=${encodeURIComponent(claimId)}`;
}

function addEvidenceHref(claimId: string) {
  return `/claims/?claim=${encodeURIComponent(claimId)}#evidence-form-title`;
}

export default function HomeLiveClaims() {
  const [status, setStatus] = useState<LiveClaimsStatus>("loading");
  const [liveClaims, setLiveClaims] = useState<Claim[]>([]);
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadHomepageClaims() {
      setStatus("loading");
      setSupabaseConfigured(canUseSupabase());

      try {
        const claims = await loadSupabaseClaims();

        if (!isMounted) {
          return;
        }

        setLiveClaims(claims);
        setStatus("ready");
      } catch {
        if (!isMounted) {
          return;
        }

        setLiveClaims([]);
        setStatus("error");
      }
    }

    loadHomepageClaims();

    return () => {
      isMounted = false;
    };
  }, []);

  const newestClaims = useMemo(() => {
    return [...liveClaims]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 3);
  }, [liveClaims]);

  return (
    <section
      aria-label="Homepage live claim surface"
      aria-live="polite"
      className="panel"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Live database</p>
          <h2>Newest live claims</h2>
          <p>
            Recent database claims appear here for inspection and source-backed
            evidence collection.
          </p>
        </div>
        <Link href="/claims">Open live queue</Link>
      </div>

      {status === "loading" ? (
        <div className="card claim-card">
          <span className="claim-domain">Live source coverage</span>
          <p>Checking source-backed live claims.</p>
        </div>
      ) : null}

      {status === "error" ? (
        <div className="card claim-card">
          <span className="claim-domain">Live database</span>
          <p>Live claims are unavailable right now. Static claims remain ready below.</p>
        </div>
      ) : null}

      {status === "ready" && newestClaims.length === 0 ? (
        <div className="card claim-card">
          <span className="claim-domain">Live database</span>
          <p>
            {supabaseConfigured
              ? "No live database claims are ready for the homepage yet."
              : "Live database claims appear here when this build is connected."}
          </p>
        </div>
      ) : null}

      {newestClaims.length > 0 ? (
        <div className="grid">
          {newestClaims.map((claim) => {
            const counts = evidenceCounts(claim);
            const sourceLinks = sourceLinkCount(claim);
            const publisher = sourceLabel(claim);

            return (
              <article className="card claim-card" key={claim.id}>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap"
                  }}
                >
                  <span className="claim-domain">Live database claim</span>
                  <span className="claim-domain">{claim.domain}</span>
                </div>
                <h3>{claim.title}</h3>
                <div
                  aria-label={`Evidence coverage for ${claim.title}`}
                  className="mission-stats"
                >
                  <span>{sourceLinks} source links</span>
                  <span>{counts.support} support</span>
                  <span>{counts.challenge} challenge</span>
                  <span>{counts.context} context</span>
                  <span>Source: {publisher}</span>
                </div>
                <div className="source-line">
                  <span>{claim.sourceQuality}</span>
                  <a href={claim.sourceUrl} rel="noreferrer" target="_blank">
                    Original source: {publisher}
                  </a>
                </div>
                <div className="mission-actions">
                  <Link className="button primary compact" href={inspectHref(claim.id)}>
                    Inspect evidence
                  </Link>
                  <Link className="button compact" href={addEvidenceHref(claim.id)}>
                    Add evidence
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
