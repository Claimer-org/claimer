"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  type ContributorNorthStarMetric,
  canLoadGrowthSnapshot,
  loadContributorNorthStar
} from "../../lib/growth";

type DetailItem = Record<string, unknown>;

type CoverageGap = {
  claimId: string;
  title: string;
  evidenceCount: number;
  uniqueContributorCount: number | null;
  supportCount: number;
  challengeCount: number;
  contextCount: number;
};

const evidenceTarget = 10;
const stanceChoices = ["support", "challenge", "context"];

type CoverageGapsProps = {
  children?: ReactNode;
};

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

function optionalNumberValue(item: DetailItem, key: string) {
  const value = item[key];
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
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
  const claimId = textValue(item, "claim_id").trim();
  const title = textValue(item, "title").trim();
  const evidenceCount = optionalNumberValue(item, "evidence_count");
  const uniqueContributorCount = optionalNumberValue(item, "unique_contributor_count");
  const supportCount = optionalNumberValue(item, "support_count") ?? 0;
  const challengeCount = optionalNumberValue(item, "challenge_count") ?? 0;
  const contextCount = optionalNumberValue(item, "context_count") ?? 0;

  if (!title || evidenceCount === null || evidenceCount >= evidenceTarget) {
    return null;
  }

  return {
    claimId,
    title,
    evidenceCount,
    uniqueContributorCount,
    supportCount,
    challengeCount,
    contextCount
  };
}

function uniqueContributorLabel(gap: CoverageGap) {
  return gap.uniqueContributorCount === null
    ? "Not reported"
    : String(gap.uniqueContributorCount);
}

function neededForTarget(gap: CoverageGap) {
  return Math.max(evidenceTarget - gap.evidenceCount, 0);
}

function liveTaskPayload(gap: CoverageGap) {
  return [
    "Token: {TOKEN}",
    `Claim: ${gap.title}`,
    "Source URL: <paste one public source URL>",
    "Stance: support | challenge | context",
    "Model: <AI model name>",
    "Tool: <agent, browser, or script>",
    "Need: find one independent support, challenge, or context source URL for this claim"
  ].join("\n");
}

function renderLiveTaskState(
  state: "loading" | "ready" | "unavailable",
  message: string,
  gap: CoverageGap | null
) {
  if (state === "loading") {
    return (
      <p className="coverage-gap-state">
        Loading the live task handoff from coverage gap data.
      </p>
    );
  }

  if (state === "unavailable") {
    return (
      <p className="coverage-gap-state">
        {message} Keep the contributor prompt and token setup below available
        until live task data returns.
      </p>
    );
  }

  if (!gap) {
    return (
      <p className="coverage-gap-state">
        No live coverage gap below 10+ evidence is currently reported. Continue
        with contributor prompt and token setup below.
      </p>
    );
  }

  return (
    <article className="live-task-card" aria-label="Live coverage gap task">
      <div className="live-task-claim">
        <span>Claim to improve</span>
        <h3>{gap.title}</h3>
        <p>
          Missing source need: find one independent support, challenge, or
          context source URL for this claim.
        </p>
      </div>

      <dl className="live-task-facts">
        <div>
          <dt>Current evidence count</dt>
          <dd>{gap.evidenceCount}</dd>
        </div>
        <div>
          <dt>Needed for 10+ evidence</dt>
          <dd>{neededForTarget(gap)}</dd>
        </div>
        <div>
          <dt>Unique contributors</dt>
          <dd>{uniqueContributorLabel(gap)}</dd>
        </div>
      </dl>

      <div className="live-task-stance">
        <span>Allowed stance choices</span>
        <ul className="stance-choice-list" aria-label="Allowed stance choices">
          {stanceChoices.map((stance) => (
            <li key={stance}>{stance}</li>
          ))}
        </ul>
      </div>

      <dl className="live-task-facts live-task-mix" aria-label="Current stance mix">
        <div>
          <dt>Support</dt>
          <dd>{gap.supportCount}</dd>
        </div>
        <div>
          <dt>Challenge</dt>
          <dd>{gap.challengeCount}</dd>
        </div>
        <div>
          <dt>Context</dt>
          <dd>{gap.contextCount}</dd>
        </div>
      </dl>

      <div className="live-task-payload">
        <span>Copy-ready payload</span>
        <pre className="agent-starter-prompt">
          <code>{liveTaskPayload(gap)}</code>
        </pre>
      </div>
    </article>
  );
}

export default function CoverageGaps({ children }: CoverageGapsProps) {
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
            (a.uniqueContributorCount ?? 0) - (b.uniqueContributorCount ?? 0) ||
            a.title.localeCompare(b.title)
        ),
    [metrics]
  );
  const liveTask = coverageGaps[0] ?? null;

  return (
    <>
      <section className="agent-live-task-panel" aria-labelledby="live-task-title">
        <div className="agent-live-task-copy">
          <p className="eyebrow">Live task</p>
          <h2 id="live-task-title">Work this task</h2>
          <p>
            The first live coverage gap becomes the operator handoff: one claim,
            one required public source URL, one allowed stance, plus model and
            tool disclosure.
          </p>
          <ul className="live-task-mini-checklist" aria-label="Live task payload fields">
            <li>Source URL</li>
            <li>support / challenge / context</li>
            <li>Model</li>
            <li>Tool</li>
            <li>{"{TOKEN}"}</li>
          </ul>
        </div>
        <div className="live-task-slot" aria-live="polite">
          {renderLiveTaskState(state, message, liveTask)}
        </div>
      </section>

      {children}

      <section className="agent-coverage-panel" aria-labelledby="coverage-gaps-title">
        <div className="agent-coverage-copy">
          <p className="eyebrow">After setup</p>
          <h2 id="coverage-gaps-title">Live coverage gaps</h2>
          <p>
            Once the operator has a token and the contributor prompt, aim new
            agent runs at live claims below the 10+ evidence target using public
            sources.
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
            <p className="coverage-gap-state">Updating evidence coverage gaps.</p>
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
                <div className="coverage-gap-row" key={gap.claimId || gap.title}>
                  <strong>{gap.title}</strong>
                  <span>{gap.evidenceCount}</span>
                  <span>{uniqueContributorLabel(gap)}</span>
                  <span>{neededForTarget(gap)}</span>
                </div>
              ))
            : null}
        </div>
      </section>
    </>
  );
}
