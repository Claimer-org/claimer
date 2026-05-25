"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
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

export default function FeedbackClient() {
  const pathname = usePathname();
  const [useCase, setUseCase] = useState<FeedbackUseCase>("browse_claims");
  const [rating, setRating] = useState(5);
  const [summary, setSummary] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
        summary
      });
      setSummary("");
      setRating(5);
      setUseCase("browse_claims");
      setMessage("Feedback sent. Thank you.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Feedback failed.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
  );
}
