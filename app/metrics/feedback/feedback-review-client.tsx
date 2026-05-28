"use client";

import { useEffect, useMemo, useState } from "react";

import {
  canLoadFeedbackReviewSnapshot,
  loadFeedbackReviewSnapshot,
  type FeedbackReviewEntry
} from "../../../lib/feedback-review";
import type {
  FeedbackReviewSnapshotMetadata,
  FeedbackUseCase
} from "../../../lib/supabase-contract";

type CountItem = {
  count: number;
  label: string;
  ratingTotal: number;
};

const metadataLabels: Record<keyof FeedbackReviewSnapshotMetadata, string> = {
  claim_id: "claim",
  landing_path: "landing",
  ref: "ref",
  source_event: "source event",
  utm_campaign: "campaign",
  utm_content: "content",
  utm_medium: "medium",
  utm_source: "source",
  utm_term: "term"
};

const metadataOrder: (keyof FeedbackReviewSnapshotMetadata)[] = [
  "claim_id",
  "ref",
  "utm_source",
  "utm_content",
  "source_event",
  "landing_path",
  "utm_medium",
  "utm_campaign",
  "utm_term"
];

const useCaseLabels: Record<FeedbackUseCase, string> = {
  add_evidence: "Add evidence",
  browse_claims: "Browse claims",
  other: "Other",
  research_decision: "Research decision",
  submit_claim: "Submit claim"
};

function formatNumber(value: number) {
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1);
}

function averageRating(entries: FeedbackReviewEntry[]) {
  if (entries.length === 0) {
    return 0;
  }

  return entries.reduce((total, entry) => total + entry.rating, 0) / entries.length;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short"
  }).format(date);
}

function formatUseCase(value: FeedbackUseCase | string) {
  return useCaseLabels[value as FeedbackUseCase] ?? value.replaceAll("_", " ");
}

function shortenedValue(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 34 ? `${trimmed.slice(0, 12)}...${trimmed.slice(-12)}` : trimmed;
}

function metadataItems(metadata: FeedbackReviewSnapshotMetadata) {
  return metadataOrder
    .map((key) => {
      const value = metadata[key];
      if (!value || value === "none") {
        return null;
      }

      return {
        key,
        label: metadataLabels[key],
        value: shortenedValue(value)
      };
    })
    .filter((item): item is { key: keyof FeedbackReviewSnapshotMetadata; label: string; value: string } =>
      Boolean(item)
    );
}

function ratingDistribution(entries: FeedbackReviewEntry[]) {
  return [5, 4, 3, 2, 1].map((rating) => ({
    count: entries.filter((entry) => entry.rating === rating).length,
    label: `${rating}/5`,
    ratingTotal: rating
  }));
}

function useCaseCounts(entries: FeedbackReviewEntry[]) {
  const counts = new Map<string, CountItem>();

  entries.forEach((entry) => {
    const label = formatUseCase(entry.use_case);
    const existing = counts.get(entry.use_case) ?? {
      count: 0,
      label,
      ratingTotal: 0
    };

    counts.set(entry.use_case, {
      ...existing,
      count: existing.count + 1,
      ratingTotal: existing.ratingTotal + entry.rating
    });
  });

  return Array.from(counts.values()).sort((a, b) => b.count - a.count);
}

function CountRows({
  emptyLabel,
  items,
  showAverage
}: {
  emptyLabel: string;
  items: CountItem[];
  showAverage?: boolean;
}) {
  if (items.length === 0 || items.every((item) => item.count === 0)) {
    return <p className="form-message muted">{emptyLabel}</p>;
  }

  return (
    <div className="metrics-detail-list">
      {items
        .filter((item) => item.count > 0)
        .map((item) => (
          <div className="metrics-detail-row" key={item.label}>
            <strong>{item.label}</strong>
            <span>{formatNumber(item.count)}</span>
            {showAverage ? (
              <em>{formatNumber(item.ratingTotal / item.count)}/5 avg</em>
            ) : (
              <em>entries</em>
            )}
          </div>
        ))}
    </div>
  );
}

export default function FeedbackReviewClient() {
  const [entries, setEntries] = useState<FeedbackReviewEntry[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadFeedbackReview() {
      if (!canLoadFeedbackReviewSnapshot()) {
        setState("error");
        setMessage("Supabase env vars are missing for this build.");
        return;
      }

      try {
        const snapshot = await loadFeedbackReviewSnapshot();
        if (!isMounted) {
          return;
        }
        setEntries(snapshot);
        setState("ready");
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setState("error");
        setMessage(error instanceof Error ? error.message : "Feedback review failed.");
      }
    }

    loadFeedbackReview();

    return () => {
      isMounted = false;
    };
  }, []);

  const ratings = useMemo(() => ratingDistribution(entries), [entries]);
  const useCases = useMemo(() => useCaseCounts(entries), [entries]);
  const average = averageRating(entries);
  const newestEntry = entries[0]?.created_at ? formatDate(entries[0].created_at) : "none";

  if (state === "loading") {
    return (
      <section className="metrics-grid" aria-label="Loading feedback review">
        {[1, 2, 3].map((item) => (
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
        <h2>Feedback review unavailable</h2>
        <p>{message}</p>
      </section>
    );
  }

  return (
    <>
      <section className="metrics-grid" aria-label="Feedback review summary">
        <article className="metric-card">
          <span>Newest 20 rows</span>
          <strong>{formatNumber(entries.length)}</strong>
          <p>Recent feedback entries</p>
        </article>
        <article className="metric-card">
          <span>Average rating</span>
          <strong>{formatNumber(average)}</strong>
          <p>Out of five</p>
        </article>
        <article className="metric-card">
          <span>Newest entry</span>
          <strong className="metric-card-date">{newestEntry}</strong>
          <p>Local browser time</p>
        </article>
      </section>

      <section className="metrics-detail-grid" aria-label="Feedback review breakdowns">
        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Rating distribution</h2>
            <span>entries</span>
          </div>
          <CountRows emptyLabel="No ratings yet." items={ratings} />
        </article>

        <article className="panel metrics-panel">
          <div className="section-heading">
            <h2>Use-case counts</h2>
            <span>entries / rating</span>
          </div>
          <CountRows emptyLabel="No feedback use cases yet." items={useCases} showAverage />
        </article>
      </section>

      <section className="panel metrics-panel" aria-label="Recent feedback entries">
        <div className="section-heading">
          <h2>Recent entries</h2>
          <span>summary / page / metadata</span>
        </div>

        {entries.length === 0 ? (
          <p className="form-message muted">No feedback entries returned yet.</p>
        ) : (
          <div className="feedback-review-list">
            {entries.map((entry, index) => {
              const chips = metadataItems(entry.metadata);

              return (
                <article
                  className="feedback-review-entry"
                  key={`${entry.created_at}-${entry.page_path}-${index}`}
                >
                  <div className="feedback-review-entry-header">
                    <div>
                      <strong>{formatUseCase(entry.use_case)}</strong>
                      <span>{formatDate(entry.created_at)}</span>
                    </div>
                    <span>{entry.rating}/5</span>
                  </div>

                  <p className="feedback-review-summary">{entry.summary}</p>

                  <div className="feedback-review-meta">
                    <code>{entry.page_path || "/"}</code>
                    {chips.length > 0 ? (
                      <div className="feedback-chip-list" aria-label="Safe metadata">
                        {chips.map((chip) => (
                          <span className="feedback-chip" key={chip.key}>
                            {chip.label}: {chip.value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span>No safe metadata</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
