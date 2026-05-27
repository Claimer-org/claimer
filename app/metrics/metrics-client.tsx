"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type GrowthMetric,
  canLoadGrowthSnapshot,
  loadGrowthSnapshot
} from "../../lib/growth";

type DetailItem = Record<string, unknown>;

function formatValue(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
}

function metricById(metrics: GrowthMetric[], id: string) {
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

function compactText(value: string, fallback = "none") {
  return value && value !== "none" ? value : fallback;
}

function shortenedValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 24 ? `${trimmed.slice(0, 10)}...${trimmed.slice(-10)}` : trimmed;
}

function campaignLabel(item: DetailItem) {
  const source = compactText(textValue(item, "utm_source"), "source:none");
  const content = compactText(textValue(item, "utm_content"), "content:none");
  const ref = compactText(textValue(item, "ref"), "ref:none");
  const path = compactText(textValue(item, "landing_path"), "/");

  return `${source} / ${content} / ${ref} / ${path}`;
}

function feedbackSourceLabel(item: DetailItem) {
  const sourceEvent = textValue(item, "source_event");
  const eventLabel =
    sourceEvent && sourceEvent !== "none"
      ? `event:${shortenedValue(sourceEvent)}`
      : "event:none";
  const source = compactText(textValue(item, "utm_source"), "source:none");
  const content = compactText(textValue(item, "utm_content"), "content:none");
  const ref = compactText(textValue(item, "ref"), "ref:none");

  return `${eventLabel} / ${source} / ${content} / ${ref}`;
}

function DetailList({
  emptyLabel,
  items,
  primaryKey,
  primaryLabel,
  secondaryKey,
  tertiaryKey
}: {
  emptyLabel: string;
  items: DetailItem[];
  primaryKey?: string;
  primaryLabel?: (item: DetailItem) => string;
  secondaryKey: string;
  tertiaryKey?: string;
}) {
  if (items.length === 0) {
    return <p className="form-message muted">{emptyLabel}</p>;
  }

  return (
    <div className="metrics-detail-list">
      {items.map((item, index) => (
        <div className="metrics-detail-row" key={`${primaryKey ?? secondaryKey}-${index}`}>
          <strong>
            {primaryLabel?.(item) || (primaryKey ? textValue(item, primaryKey) : "") || "unknown"}
          </strong>
          <span>{formatValue(numberValue(item, secondaryKey))}</span>
          {tertiaryKey ? <em>{formatValue(numberValue(item, tertiaryKey))}</em> : null}
        </div>
      ))}
    </div>
  );
}

export default function MetricsClient({ seedClaimCount }: { seedClaimCount: number }) {
  const [metrics, setMetrics] = useState<GrowthMetric[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadMetrics() {
      if (!canLoadGrowthSnapshot()) {
        setState("error");
        setMessage("Supabase env vars are missing for this build.");
        return;
      }

      try {
        const snapshot = await loadGrowthSnapshot();
        if (!isMounted) {
          return;
        }
        setMetrics(snapshot);
        setState("ready");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setState("error");
        setMessage(error instanceof Error ? error.message : "Growth metrics failed.");
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
    };
  }, []);

  const activeVisitors = metricById(metrics, "active_visitors_24h");
  const dau = metricById(metrics, "daily_active_users_utc");
  const launchVisitors = metricById(metrics, "launch_visitors_7d");
  const campaignVisitors = metricById(metrics, "campaign_visitors_7d");
  const feedback = metricById(metrics, "feedback_entries_7d");
  const feedbackSources = metricById(metrics, "feedback_source_events_7d");
  const evidence = metricById(metrics, "evidence_submissions_24h");
  const claimsTotal = metricById(metrics, "claims_total");
  const claimSurfaceTotal = seedClaimCount + (claimsTotal?.value ?? 0);

  const channels = useMemo(
    () => asItems(launchVisitors?.detail.channels),
    [launchVisitors]
  );
  const campaigns = useMemo(
    () => asItems(campaignVisitors?.detail.campaigns),
    [campaignVisitors]
  );
  const useCases = useMemo(() => asItems(feedback?.detail.use_cases), [feedback]);
  const sourceEvents = useMemo(
    () => asItems(feedbackSources?.detail.source_events),
    [feedbackSources]
  );
  const topPaths = useMemo(
    () => asItems(activeVisitors?.detail.top_paths),
    [activeVisitors]
  );

  if (state === "loading") {
    return (
      <section className="metrics-grid" aria-label="Loading growth metrics">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <article className="metric-card skeleton-stack" key={item}>
            <span className="skeleton-line short" />
            <span className="skeleton-line medium" />
            <span className="skeleton-line" />
          </article>
        ))}
      </section>
    );
  }

  if (state === "error") {
    return (
      <section className="empty-state">
        <h2>Metrics unavailable</h2>
        <p>{message}</p>
      </section>
    );
  }

  return (
    <>
      <section className="metrics-grid" aria-label="Growth metric cards">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.metric}>
            <span>{metric.window_label}</span>
            <strong>{formatValue(metric.value)}</strong>
            <p>{metric.label}</p>
          </article>
        ))}
      </section>

      <section className="metrics-detail-grid" aria-label="Growth metric details">
        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Launch channels</h2>
            <span>visitors / views</span>
          </div>
          <DetailList
            emptyLabel="No launch-attributed visitors yet."
            items={channels}
            primaryKey="source"
            secondaryKey="visitors"
            tertiaryKey="page_views"
          />
        </article>

        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Campaign detail</h2>
            <span>visitors / views</span>
          </div>
          <DetailList
            emptyLabel="No campaign-attributed visitors yet."
            items={campaigns}
            primaryLabel={campaignLabel}
            secondaryKey="visitors"
            tertiaryKey="page_views"
          />
        </article>

        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Feedback mix</h2>
            <span>entries / rating</span>
          </div>
          <DetailList
            emptyLabel="No feedback entries in the last 7 days."
            items={useCases}
            primaryKey="use_case"
            secondaryKey="count"
            tertiaryKey="average_rating"
          />
        </article>

        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Feedback sources</h2>
            <span>entries / rating</span>
          </div>
          <DetailList
            emptyLabel="No source-attributed feedback entries yet."
            items={sourceEvents}
            primaryLabel={feedbackSourceLabel}
            secondaryKey="count"
            tertiaryKey="average_rating"
          />
        </article>

        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Top paths</h2>
            <span>views / visitors</span>
          </div>
          <DetailList
            emptyLabel="No page views in the last 24 hours."
            items={topPaths}
            primaryKey="path"
            secondaryKey="page_views"
            tertiaryKey="visitors"
          />
        </article>

        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Milestone 4</h2>
            <span>target progress</span>
          </div>
          <div className="metrics-detail-list">
            <div className="metrics-detail-row">
              <strong>10 DAU</strong>
              <span>{formatValue(dau?.value ?? 0)}</span>
              <em>target 10</em>
            </div>
            <div className="metrics-detail-row">
              <strong>50 claim surface</strong>
              <span>{formatValue(claimSurfaceTotal)}</span>
              <em>target 50</em>
            </div>
            <div className="metrics-detail-row">
              <strong>3 evidence/day</strong>
              <span>{formatValue(evidence?.value ?? 0)}</span>
              <em>target 3</em>
            </div>
            <div className="metrics-detail-row">
              <strong>5 feedback entries</strong>
              <span>{formatValue(feedback?.value ?? 0)}</span>
              <em>target 5</em>
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
