"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  canSubmitFeedback,
  feedbackUseCases,
  publishFeedback
} from "../../lib/feedback";
import type { FeedbackUseCase } from "../../lib/supabase-contract";

const ratingOptions = [
  { value: 5, label: "5" },
  { value: 4, label: "4" },
  { value: 3, label: "3" },
  { value: 2, label: "2" },
  { value: 1, label: "1" }
];

const metadataParams = [
  "ref",
  "claim_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "source_event"
];

const askNostrWorkflowSourceEvent =
  "ed74e5b3b76d355005e48ecb9424ae22abc2d8febc6618d39836165432fdae9d";

function validUseCase(value: string | null): FeedbackUseCase | null {
  const option = feedbackUseCases.find((item) => item.value === value);
  return option?.value ?? null;
}

function shortenedEventId(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 20 ? `${trimmed.slice(0, 8)}...${trimmed.slice(-8)}` : trimmed;
}

function reviewQueueHref(metadata: Record<string, string>) {
  const params = new URLSearchParams();

  metadataParams.forEach((key) => {
    const value = metadata[key];
    if (value) {
      params.set(key, value);
    }
  });

  if (!params.has("ref")) {
    params.set("ref", "feedback_source_event_review_cta");
  }

  const query = params.toString();
  return query ? `/review/?${query}` : "/review/";
}

function sourceEventContext(value: string | undefined) {
  const eventId = value?.trim();
  if (!eventId) {
    return null;
  }

  const isAskNostrWorkflow = eventId.toLowerCase() === askNostrWorkflowSourceEvent;

  return {
    title: isAskNostrWorkflow
      ? "AskNostr workflow review context"
      : "Public Nostr review context",
    body: isAskNostrWorkflow
      ? "Inspect one source-backed claim before sending a note. Your feedback stays attributed to the public AskNostr review ask and supports community assessment, not an official truth verdict."
      : "Inspect one source-backed claim before sending a note. Your feedback stays attributed to the public review ask and supports community assessment, not an official truth verdict.",
    eventId: shortenedEventId(eventId)
  };
}

export default function FeedbackClient() {
  const pathname = usePathname();
  const [useCase, setUseCase] = useState<FeedbackUseCase>("browse_claims");
  const [rating, setRating] = useState(5);
  const [summary, setSummary] = useState("");
  const [metadata, setMetadata] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedUseCase = validUseCase(params.get("use_case"));
    const nextMetadata: Record<string, string> = {};

    metadataParams.forEach((key) => {
      const value = params.get(key);
      if (value) {
        nextMetadata[key] = value;
      }
    });

    if (requestedUseCase) {
      setUseCase(requestedUseCase);
    }

    setMetadata(nextMetadata);
  }, []);

  async function submitFeedback(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!canSubmitFeedback()) {
      setMessage("Live feedback is not configured for this build.");
      return;
    }

    setSubmitting(true);

    try {
      await publishFeedback({
        pagePath: pathname || "/feedback",
        useCase,
        rating,
        summary,
        metadata
      });
      setSummary("");
      setRating(5);
      setMessage("Feedback sent. Thank you.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Feedback failed.");
    } finally {
      setSubmitting(false);
    }
  }

  const context = sourceEventContext(metadata.source_event);

  return (
    <div className="feedback-form-shell">
      {context ? (
        <aside className="feedback-source-context" aria-label="Feedback source context">
          <strong>{context.title}</strong>
          <p>
            {context.body} Event <code>{context.eventId}</code>.
          </p>
          <p>
            Automated assistance is labeled on claim pages. The form below is
            still available if you need to leave feedback now.
          </p>
          <div className="feedback-source-actions">
            <Link className="button primary compact" href={reviewQueueHref(metadata)}>
              Open review queue first
            </Link>
            <span>Then return here for a 2-minute workflow note.</span>
          </div>
        </aside>
      ) : null}

      <form className="feedback-form form-panel" onSubmit={submitFeedback}>
        <label>
          What were you doing?
          <select
            value={useCase}
            onChange={(event) => setUseCase(event.target.value as FeedbackUseCase)}
          >
            {feedbackUseCases.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset className="rating-field">
          <legend>How useful was Claimer?</legend>
          <div>
            {ratingOptions.map((option) => (
              <label
                className={rating === option.value ? "rating-option active" : "rating-option"}
                key={option.value}
              >
                <input
                  type="radio"
                  name="rating"
                  value={option.value}
                  checked={rating === option.value}
                  onChange={() => setRating(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label>
          What should change before you would use it again?
          <textarea
            maxLength={1200}
            minLength={8}
            required
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="One specific issue, missing claim, or confusing part."
          />
        </label>

        <button className="button primary" disabled={submitting} type="submit">
          {submitting ? "Sending..." : "Send feedback"}
        </button>

        {message ? <p className="form-message">{message}</p> : null}
      </form>
    </div>
  );
}
