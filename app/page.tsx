import Link from "next/link";
import { evidenceCounts, reviewMission, seedClaims } from "../lib/claims";

const principles = [
  "Every claim requires at least one verifiable source URL.",
  "Evidence can support or challenge a claim, and both sides remain visible.",
  "Scores are explainable community assessments, not official truth verdicts.",
  "Any AI-generated analysis is disclosed as automated assistance."
];

export default function HomePage() {
  const evidenceTotal = seedClaims.reduce(
    (total, claim) => total + claim.evidence.length,
    0
  );

  // Hot debates: claims that are disputed or inconclusive
  const hotDebates = seedClaims
    .filter(
      (c) =>
        c.veracityLabel === "Evidence suggests disputed" ||
        c.veracityLabel === "Evidence inconclusive"
    )
    .slice(0, 4);

  // If we don't have enough disputed claims, fill with lowest veracity scores
  const debateClaims =
    hotDebates.length >= 3
      ? hotDebates
      : seedClaims
          .slice()
          .sort((a, b) => a.veracityScore - b.veracityScore)
          .slice(0, 4);

  const topClaims = seedClaims.slice(0, 3);
  const domainsSet = new Set(seedClaims.map((c) => c.domain));

  return (
    <section className="stack">
      <div className="hero">
        <p className="eyebrow">Source-backed community assessment</p>
        <h1>Claimer</h1>
        <p>
          Submit public AI and technology claims with source links, inspect
          support and challenge evidence, and separate attribution accuracy from
          claim veracity.
        </p>
        <div className="hero-subtitle">
          <span className="hero-tag">🔍 Source-verified</span>
          <span className="hero-tag">⚖️ Two-sided evidence</span>
          <span className="hero-tag">📊 Explainable scores</span>
        </div>
        <div className="actions">
          <Link className="button primary" href="/claims">
            Browse claims
          </Link>
          <Link className="button" href="/review">
            Review evidence
          </Link>
          <Link className="button" href="/submit">
            Submit a claim
          </Link>
        </div>
      </div>

      <section className="stat-highlight" aria-label="Platform statistics">
        <div className="stat-item">
          <strong>{seedClaims.length}</strong>
          <span>Active claims</span>
        </div>
        <div className="stat-item">
          <strong>{evidenceTotal}</strong>
          <span>Source links</span>
        </div>
        <div className="stat-item">
          <strong>{domainsSet.size}</strong>
          <span>Domains covered</span>
        </div>
        <div className="stat-item">
          <strong>2</strong>
          <span>Score dimensions</span>
        </div>
      </section>

      {debateClaims.length > 0 && (
        <section className="panel hot-debates" aria-labelledby="debates-title">
          <div className="section-heading">
            <h2 id="debates-title">🔥 Hot debates</h2>
            <Link href="/claims">View all claims</Link>
          </div>
          <div className="grid">
            {debateClaims.map((claim) => {
              const counts = evidenceCounts(claim);
              const isDisputed =
                claim.veracityLabel === "Evidence suggests disputed";
              const isInconclusive =
                claim.veracityLabel === "Evidence inconclusive";
              const badgeClass = isDisputed
                ? "disputed"
                : isInconclusive
                  ? "inconclusive"
                  : "";
              const cardClass = `card claim-card ${badgeClass}`;
              return (
                <article className={cardClass} key={`debate-${claim.id}`}>
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center"
                    }}
                  >
                    <span className="claim-domain">{claim.domain}</span>
                    {badgeClass && (
                      <span className={`debate-badge ${badgeClass}`}>
                        {isDisputed ? "Disputed" : "Inconclusive"}
                      </span>
                    )}
                  </div>
                  <h3>{claim.title}</h3>
                  <p>{claim.veracityLabel}</p>
                  <Link href={`/claims/${claim.id}`}>
                    {counts.support + counts.challenge + counts.context} source
                    links · {claim.veracityScore}% veracity
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="panel" aria-labelledby="featured-title">
        <div className="section-heading">
          <h2 id="featured-title">Featured claims</h2>
          <Link href="/claims">View all</Link>
        </div>
        <div className="grid">
          {topClaims.map((claim) => {
            const counts = evidenceCounts(claim);
            return (
              <article className="card claim-card" key={claim.id}>
                <span className="claim-domain">{claim.domain}</span>
                <h3>{claim.title}</h3>
                <p>{claim.veracityLabel}</p>
                <Link href={`/claims/${claim.id}`}>
                  {counts.support + counts.challenge + counts.context} source
                  links
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-labelledby="missions-title">
        <div className="section-heading">
          <h2 id="missions-title">Review missions</h2>
          <Link href="/review">Open queue</Link>
        </div>
        <div className="grid">
          {seedClaims.slice(0, 3).map((claim) => {
            const mission = reviewMission(claim);
            return (
              <article className="card claim-card" key={`mission-${claim.id}`}>
                <span className="claim-domain">{mission.stance}</span>
                <h3>{mission.title}</h3>
                <p>{claim.title}</p>
                <Link href={`/submit/${claim.id}`}>Start review</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-labelledby="principles-title">
        <h2 id="principles-title">Product rules</h2>
        <div className="grid">
          {principles.map((principle) => (
            <article className="card" key={principle}>
              <p>{principle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="how-it-works-title">
        <h2 id="how-it-works-title">How it works</h2>
        <div className="how-it-works">
          <div className="step-card">
            <div className="step-number">1</div>
            <h3>Submit a claim</h3>
            <p>Post any public claim about AI, technology, or science with at least one verifiable source URL.</p>
          </div>
          <div className="step-card">
            <div className="step-number">2</div>
            <h3>Add evidence</h3>
            <p>Support or challenge claims with source-backed evidence. Every link is visible and traceable.</p>
          </div>
          <div className="step-card">
            <div className="step-number">3</div>
            <h3>Build reputation</h3>
            <p>Your accuracy is tracked over time. The most reliable contributors rise to the top.</p>
          </div>
          <div className="step-card">
            <div className="step-number">4</div>
            <h3>Community assessment</h3>
            <p>Claims get scored by the community. No black-box verdicts — every score is explainable.</p>
          </div>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Know something that needs fact-checking?</h2>
        <p>Submit a claim, add evidence, and let the community assess it.</p>
        <div className="actions">
          <Link className="button primary" href="/submit">
            Submit a claim
          </Link>
          <Link className="button" href="/review">
            Review evidence
          </Link>
        </div>
      </section>
    </section>
  );
}
