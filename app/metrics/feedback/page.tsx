import type { Metadata } from "next";
import Link from "next/link";

import FeedbackReviewClient from "./feedback-review-client";

export const metadata: Metadata = {
  title: "Feedback Review",
  description:
    "Recent Claimer feedback summaries for operator review without exposing visitor IDs.",
  robots: {
    index: false,
    follow: false
  }
};

export default function FeedbackReviewPage() {
  return (
    <section className="stack">
      <header className="page-heading" aria-labelledby="feedback-review-title">
        <p className="eyebrow">Operator metrics</p>
        <h1 id="feedback-review-title">Feedback review</h1>
        <p>
          Recent reviewer notes for repeat-use friction, evidence handoff, and
          launch follow-up. Entries use the bounded feedback snapshot and omit
          visitor IDs.
        </p>
        <div className="actions">
          <Link className="button primary" href="/metrics">
            Growth snapshot
          </Link>
          <Link className="button" href="/feedback">
            Open feedback form
          </Link>
        </div>
      </header>

      <FeedbackReviewClient />
    </section>
  );
}
