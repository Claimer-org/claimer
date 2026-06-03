export default function LoadingPage() {
  return (
    <section className="route-state" aria-live="polite">
      <div className="state-panel">
        <span className="claim-domain">Source-backed evidence</span>
        <h1>Preparing source-backed claims</h1>
        <div className="skeleton-stack">
          <span className="skeleton-line short" />
          <span className="skeleton-line" />
          <span className="skeleton-line medium" />
        </div>
      </div>
    </section>
  );
}
