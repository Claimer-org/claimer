"use client";

import Link from "next/link";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="route-state" aria-live="assertive">
      <div className="state-panel">
        <span className="claim-domain">Page error</span>
        <h1>Something failed to load</h1>
        <p>{error.message || "Refresh or return to the claims queue."}</p>
        <div className="actions">
          <button className="button primary" onClick={reset} type="button">
            Try again
          </button>
          <Link className="button" href="/claims">
            Open claims
          </Link>
        </div>
      </div>
    </section>
  );
}
