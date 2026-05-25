import Link from "next/link";

export default function NotFoundPage() {
  return (
    <section className="route-state">
      <div className="state-panel">
        <span className="claim-domain">Not found</span>
        <h1>Page not found</h1>
        <p>The claim or page is not available in this public build.</p>
        <div className="actions">
          <Link className="button primary" href="/claims">
            Open claims
          </Link>
          <Link className="button" href="/">
            Home
          </Link>
        </div>
      </div>
    </section>
  );
}
