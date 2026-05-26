import type { Metadata } from "next";
import Link from "next/link";
import { evidenceCounts, seedClaims, type Claim } from "../../lib/claims";

export const metadata: Metadata = {
  title: "Trending Claims",
  description:
    "The hottest claims on Claimer right now — sorted by controversy, freshness, and community engagement. See what people are debating.",
  openGraph: {
    title: "Trending Claims — Claimer",
    description:
      "The hottest claims right now — sorted by controversy, freshness, and evidence engagement."
  }
};

function heatScore(claim: Claim): number {
  const counts = evidenceCounts(claim);
  const evidenceTotal = counts.support + counts.challenge + counts.context;

  // Controversy factor: claims near 50% veracity are more debatable
  const controversy = 1 - Math.abs(claim.veracityScore - 50) / 50;

  // Balance factor: claims with both support and challenge evidence are hotter
  const balance =
    counts.support > 0 && counts.challenge > 0
      ? Math.min(counts.support, counts.challenge) /
        Math.max(counts.support, counts.challenge)
      : 0;

  // Recency factor: newer claims get a boost (decay over 30 days)
  const ageMs = Date.now() - new Date(claim.createdAt).getTime();
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  const recency = Math.max(0, 1 - ageDays / 30);

  // Evidence volume factor
  const volume = Math.min(evidenceTotal / 6, 1);

  // Weighted combination
  return (
    controversy * 35 + balance * 25 + recency * 25 + volume * 15
  );
}

function heatLabel(score: number): { text: string; emoji: string; className: string } {
  if (score >= 70) return { text: "On fire", emoji: "🔥", className: "heat-fire" };
  if (score >= 50) return { text: "Hot", emoji: "🌡️", className: "heat-hot" };
  if (score >= 30) return { text: "Warming up", emoji: "📈", className: "heat-warm" };
  return { text: "Simmering", emoji: "💭", className: "heat-simmer" };
}

export default function TrendingPage() {
  const ranked = seedClaims
    .map((claim) => ({ claim, heat: heatScore(claim) }))
    .sort((a, b) => b.heat - a.heat);

  const topClaims = ranked.slice(0, 20);

  // Time categories
  const now = Date.now();
  const oneDayMs = 1000 * 60 * 60 * 24;
  const oneWeekMs = oneDayMs * 7;

  const todayClaims = topClaims.filter(
    (r) => now - new Date(r.claim.createdAt).getTime() < oneDayMs
  );
  const thisWeekClaims = topClaims.filter((r) => {
    const age = now - new Date(r.claim.createdAt).getTime();
    return age >= oneDayMs && age < oneWeekMs;
  });
  const olderClaims = topClaims.filter(
    (r) => now - new Date(r.claim.createdAt).getTime() >= oneWeekMs
  );

  return (
    <section className="stack">
      <div className="hero compact-hero">
        <p className="eyebrow">Live claim heat map</p>
        <h1>Trending</h1>
        <p>
          Claims ranked by controversy, freshness, and evidence engagement.
          The most debated claims rise to the top.
        </p>
      </div>

      <div className="trending-legend">
        <span className="heat-badge heat-fire">🔥 On fire</span>
        <span className="heat-badge heat-hot">🌡️ Hot</span>
        <span className="heat-badge heat-warm">📈 Warming up</span>
        <span className="heat-badge heat-simmer">💭 Simmering</span>
      </div>

      {todayClaims.length > 0 && (
        <section className="panel" aria-labelledby="today-title">
          <h2 id="today-title" className="trending-section-title">
            🕐 Today
          </h2>
          <div className="trending-list">
            {todayClaims.map(({ claim, heat }, i) => {
              const counts = evidenceCounts(claim);
              const hl = heatLabel(heat);
              return (
                <article
                  className={`trending-item ${hl.className}`}
                  key={claim.id}
                >
                  <div className="trending-rank">#{i + 1}</div>
                  <div className="trending-content">
                    <div className="trending-meta">
                      <span className="claim-domain">{claim.domain}</span>
                      <span className={`heat-badge ${hl.className}`}>
                        {hl.emoji} {hl.text}
                      </span>
                      <span className="trending-score">
                        {Math.round(heat)} heat
                      </span>
                    </div>
                    <h3>
                      <Link href={`/claims/${claim.id}`}>{claim.title}</Link>
                    </h3>
                    <div className="trending-stats">
                      <span className="evidence-support">
                        ✅ {counts.support} support
                      </span>
                      <span className="evidence-challenge">
                        ❌ {counts.challenge} challenge
                      </span>
                      <span>🎯 {claim.veracityScore}% veracity</span>
                      <span>📎 {claim.attributionScore}% attribution</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {thisWeekClaims.length > 0 && (
        <section className="panel" aria-labelledby="week-title">
          <h2 id="week-title" className="trending-section-title">
            📅 This week
          </h2>
          <div className="trending-list">
            {thisWeekClaims.map(({ claim, heat }, i) => {
              const counts = evidenceCounts(claim);
              const hl = heatLabel(heat);
              return (
                <article
                  className={`trending-item ${hl.className}`}
                  key={claim.id}
                >
                  <div className="trending-rank">
                    #{todayClaims.length + i + 1}
                  </div>
                  <div className="trending-content">
                    <div className="trending-meta">
                      <span className="claim-domain">{claim.domain}</span>
                      <span className={`heat-badge ${hl.className}`}>
                        {hl.emoji} {hl.text}
                      </span>
                      <span className="trending-score">
                        {Math.round(heat)} heat
                      </span>
                    </div>
                    <h3>
                      <Link href={`/claims/${claim.id}`}>{claim.title}</Link>
                    </h3>
                    <div className="trending-stats">
                      <span className="evidence-support">
                        ✅ {counts.support} support
                      </span>
                      <span className="evidence-challenge">
                        ❌ {counts.challenge} challenge
                      </span>
                      <span>🎯 {claim.veracityScore}% veracity</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {olderClaims.length > 0 && (
        <section className="panel" aria-labelledby="older-title">
          <h2 id="older-title" className="trending-section-title">
            🔄 Still trending
          </h2>
          <div className="trending-list">
            {olderClaims.map(({ claim, heat }, i) => {
              const counts = evidenceCounts(claim);
              const hl = heatLabel(heat);
              return (
                <article
                  className={`trending-item ${hl.className}`}
                  key={claim.id}
                >
                  <div className="trending-rank">
                    #{todayClaims.length + thisWeekClaims.length + i + 1}
                  </div>
                  <div className="trending-content">
                    <div className="trending-meta">
                      <span className="claim-domain">{claim.domain}</span>
                      <span className={`heat-badge ${hl.className}`}>
                        {hl.emoji} {hl.text}
                      </span>
                    </div>
                    <h3>
                      <Link href={`/claims/${claim.id}`}>{claim.title}</Link>
                    </h3>
                    <div className="trending-stats">
                      <span className="evidence-support">
                        ✅ {counts.support} support
                      </span>
                      <span className="evidence-challenge">
                        ❌ {counts.challenge} challenge
                      </span>
                      <span>🎯 {claim.veracityScore}% veracity</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="cta-banner">
        <h2>See a claim that needs evidence?</h2>
        <p>Add your source-backed assessment and help the community evaluate it.</p>
        <div className="actions">
          <Link className="button primary" href="/review">
            Review evidence
          </Link>
          <Link className="button" href="/submit">
            Submit a claim
          </Link>
        </div>
      </section>
    </section>
  );
}
