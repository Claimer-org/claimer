"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type ContributorNorthStarMetric,
  canLoadGrowthSnapshot,
  loadContributorNorthStar
} from "../../lib/growth";

type DetailItem = Record<string, unknown>;

type CoverageGap = {
  title: string;
  evidenceCount: number;
  uniqueContributorCount: number;
};

const evidenceTarget = 10;

function metricById(metrics: ContributorNorthStarMetric[], id: string) {
  return metrics.find((metric) => metric.metric === id) ?? null;
}

function asItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is DetailItem => typeof item === "object" && item !== null)
    : [];
}

function textValue(item: DetailItem, key: string) {
  const value = item[key];
  return typeof value === "string" ? value : "";
}

function numberValue(item: DetailItem, key: string) {
  const value = item[key];
  return typeof value === "number" ? value : Number(value ?? 0);
}

function claimCoverageItems(metrics: ContributorNorthStarMetric[]) {
  const sourceMetric =
    metricById(metrics, "live_claims_with_10_evidence") ??
    metricById(metrics, "evidence_per_live_claim") ??
    metricById(metrics, "live_evidence_entries_total") ??
    metrics.find((metric) => asItems(metric.detail.claim_coverage).length > 0) ??
    null;

  return asItems(sourceMetric?.detail.claim_coverage);
}

function toCoverageGap(item: DetailItem): CoverageGap | null {
  const title = textValue(item, "title").trim();
  const evidenceCount = numberValue(item, "evidence_count");
  const uniqueContributorCount = numberValue(item, "unique_contributor_count");

  if (!title || !Number.isFinite(evidenceCount) || evidenceCount >= evidenceTarget) {
    return null;
  }

  return {
    title,
    evidenceCount,
    uniqueContributorCount: Number.isFinite(uniqueContributorCount) ? uniqueContributorCount : 0
  };
}

export default function CoverageGaps() {
  const [metrics, setMetrics] = useState<ContributorNorthStarMetric[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadCoverageGaps() {
      if (!canLoadGrowthSnapshot()) {
        setState("unavailable");
        setMessage("Live coverage gaps are unavailable in this build.");
        return;
      }

      try {
        const snapshot = await loadContributorNorthStar();
        if (!isMounted) {
          return;
        }
        setMetrics(snapshot);
        setState("ready");
      } catch {
        if (!isMounted) {
          return;
        }
        setState("unavailable");
        setMessage("Live coverage gaps are temporarily unavailable.");
      }
    }

    loadCoverageGaps();

    return () => {
      isMounted = false;
    };
  }, []);

  const coverageGaps = useMemo(
    () =>
      claimCoverageItems(metrics)
        .map(toCoverageGap)
        .filter((gap): gap is CoverageGap => gap !== null)
        .sort(
          (a, b) =>
            a.evidenceCount - b.evidenceCount ||
            a.uniqueContributorCount - b.uniqueContributorCount ||
            a.title.localeCompare(b.title)
        ),
    [metrics]
  );

  return (
    <section className="agent-coverage-panel" aria-labelledby="coverage-gaps-title">
      <div className="agent-coverage-copy">
        <p className="eyebrow">Live coverage gap</p>
        <h2 id="coverage-gaps-title">Live coverage gaps</h2>
        <p>
          Aim new agent runs at live claims below the 10+ evidence target, using
          public sources and the contributor prompt.
        </p>
        <div className="agent-coverage-actions">
          <Link className="button primary compact" href="/contributor.md">
            Open contributor.md
          </Link>
          <Link className="button compact" href="/claims">
            Browse claims
          </Link>
        </div>
      </div>

      <div className="coverage-gap-list" aria-live="polite">
        <div className="coverage-gap-header" aria-hidden="true">
          <span>Claim</span>
          <span>Evidence</span>
          <span>Unique contributors</span>
          <span>Needed for 10+ evidence</span>
        </div>

        {state === "loading" ? (
          <p className="coverage-gap-state">Loading live coverage gaps.</p>
        ) : null}

        {state === "unavailable" ? (
          <p className="coverage-gap-state">{message}</p>
        ) : null}

        {state === "ready" && coverageGaps.length === 0 ? (
          <p className="coverage-gap-state">
            No live coverage gaps below 10+ evidence are currently reported.
          </p>
        ) : null}

        {state === "ready"
          ? coverageGaps.map((gap) => (
              <div className="coverage-gap-row" key={gap.title}>
                <strong>{gap.title}</strong>
                <span>{gap.evidenceCount}</span>
                <span>{gap.uniqueContributorCount}</span>
                <span>{Math.max(evidenceTarget - gap.evidenceCount, 0)}</span>
              </div>
            ))
          : null}
      </div>
    </section>
  );
}
