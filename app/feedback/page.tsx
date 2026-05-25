import type { Metadata } from "next";
import Link from "next/link";
import FeedbackClient from "./feedback-client";

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Send focused feedback on Claimer's public AI and technology claim assessment MVP."
};

export default function FeedbackPage() {
  return (
    <section className="stack feedback-page">
      <header className="page-heading" aria-labelledby="feedback-title">
        <p className="eyebrow">Launch feedback</p>
        <h1 id="feedback-title">Tell us what blocks repeat use</h1>
        <p>
          The next milestone is 10 daily active users. One specific problem is
          more useful than general praise.
        </p>
        <div className="actions">
          <Link className="button" href="/claims">
            Open claims
          </Link>
          <Link className="button" href="/submit">
            Submit claim
          </Link>
        </div>
      </header>

      <div className="feedback-layout">
        <FeedbackClient />
        <aside className="feedback-aside">
          <span className="claim-domain">Useful feedback</span>
          <h2>What to send</h2>
          <ul>
            <li>A claim topic you expected but did not find.</li>
            <li>A source or evidence step that felt slow.</li>
            <li>A scoring label that was unclear.</li>
            <li>A reason you would not return tomorrow.</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
