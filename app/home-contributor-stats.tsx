"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type ContributorNorthStarMetric,
  loadContributorNorthStar
} from "../lib/growth";

type ContributorStatsState = "loading" | "ready" | "error";

const coverageMetricIds = [
  "live_claims_with_10_evidence",
  "live_claims_with_5_unique_contributors"
];

const metricDescriptors: Record<string, { label: string; description: string }> = {
  evidence_per_live_claim: {
    label: "Evidence/live claim",
    description: "Average source-backed evidence coverage across live claims."
  },
  unique_contributors_total: {
    label: "Unique contributors",
    description: "Distinct contributors represented in live evidence."
  },
  contributor_evidence_submissions_24h: {
    label: "24h submissions",
    description: "Contributor evidence submitted in the last 24 hours."
  },
  live_claims_with_10_evidence: {
    label: "Live claims at 10+",
    description: "Live claims that have reached the 10+ evidence target."
  },
  live_claims_with_5_unique_contributors: {
    label: "5+ contributor claims",
    description: "Live claims with evidence from at least 5 unique contributors."
  }
};

function metricById(metrics: ContributorNorthStarMetric[], id: string) {
  return metrics.find((metric) => metric.metric === id) ?? null;
}

function formatValue(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
}

export default function HomeContributorStats() {
  const [state, setState] = useState<ContributorStatsState>("loading");
  const [metrics, setMetrics] = useState<ContributorNorthStarMetric[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadStats() {
      setState("loading");

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

        setMetrics([]);
        setState("error");
      }
    }

    loadStats();

    return () => {
      isMounted = false;
    };
  }, []);

  const visibleMetrics = useMemo(() => {
    const evidencePerClaim = metricById(metrics, "evidence_per_live_claim");
    const contributors = metricById(metrics, "unique_contributors_total");
    const submissions = metricById(
      metrics,
      "contributor_evidence_submissions_24h"
    );
    const coverage =
      coverageMetricIds
        .map((id) => metricById(metrics, id))
        .find((metric): metric is ContributorNorthStarMetric => metric !== null) ??
      null;

    return [evidencePerClaim, contributors, submissions, coverage].filter(
      (metric): metric is ContributorNorthStarMetric => metric !== null
    );
  }, [metrics]);

  return (
    <section
      aria-label="Live contributor north-star"
      aria-live="polite"
      className="stat-highlight"
    >
      {state === "loading" ? (
        <div className="stat-item">
          <strong>Live</strong>
          <span>Contributor north star</span>
          <p>Loading aggregate contributor metrics.</p>
        </div>
      ) : null}

      {state === "error" ? (
        <div className="stat-item">
          <strong>Static</strong>
          <span>Contributor north star</span>
          <p>Live contributor metrics are unavailable. Static coverage remains visible.</p>
        </div>
      ) : null}

      {state === "ready" && visibleMetrics.length === 0 ? (
        <div className="stat-item">
          <strong>0</strong>
          <span>Contributor north star</span>
          <p>No live contributor metrics are available yet.</p>
        </div>
      ) : null}

      {state === "ready"
        ? visibleMetrics.map((metric) => {
            const descriptor = metricDescriptors[metric.metric] ?? {
              label: metric.label,
              description: metric.window_label
            };

            return (
              <div className="stat-item" key={metric.metric}>
                <strong>{formatValue(metric.value)}</strong>
                <span>{descriptor.label}</span>
                <p>{descriptor.description}</p>
              </div>
            );
          })
        : null}
    </section>
  );
}
