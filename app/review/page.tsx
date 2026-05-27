import type { Metadata } from "next";
import Link from "next/link";
import {
  type Claim,
  evidenceHealth,
  reviewMission,
  seedClaims
} from "../../lib/claims";

export const metadata: Metadata = {
  title: "Review Missions",
  description:
    "Pick a source-backed Claimer mission and add support, challenge, or context evidence."
};

const nostrFeedbackHref =
  "/feedback/?utm_source=nostr&utm_medium=social&utm_campaign=milestone4-launch&utm_content=reviewer_feedback_cta&ref=launch_kit";

function missionScore(claim: Claim) {
  const health = evidenceHealth(claim);
  let score = 0;

  if (health.needsChallenge) {
    score += 100;
  }

  if (health.needsSupport) {
    score += 80;
  }

  if (!health.hasHighQualitySource) {
    score += 45;
  }

  score += Math.max(0, 4 - health.total) * 8;
  score += Math.max(0, 75 - claim.veracityScore) / 5;

  return score;
}

function priorityLabel(claim: Claim) {
  const health = evidenceHealth(claim);

  if (health.needsChallenge) {
    return "Challenge gap";
  }

  if (health.needsSupport) {
    return "Support gap";
  }

  if (!health.hasHighQualitySource) {
    return "Source upgrade";
  }

  return "Context needed";
}

function byNewestClaim(a: Claim, b: Claim) {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function uniqueClaims(claims: Claim[]) {
  const seen = new Set<string>();

  return claims.filter((claim) => {
    if (seen.has(claim.id)) {
      return false;
    }

    seen.add(claim.id);
    return true;
  });
}

export default function ReviewPage() {
  const newestClaims = seedClaims.slice().sort(byNewestClaim).slice(0, 5);
  const priorityClaims = seedClaims
    .slice()
    .sort((a, b) => missionScore(b) - missionScore(a))
    .slice(0, 12);
  const missionClaims = uniqueClaims([...newestClaims, ...priorityClaims]).slice(0, 12);
  const needsChallenge = seedClaims.filter(
    (claim) => evidenceHealth(claim).needsChallenge
  ).length;
  const needsSupport = seedClaims.filter(
    (claim) => evidenceHealth(claim).needsSupport
  ).length;
  const twoSided = seedClaims.filter(
    (claim) => evidenceHealth(claim).support > 0 && evidenceHealth(claim).challenge > 0
  ).length;

  return (
    <section className="stack">
      <header className="page-heading" aria-labelledby="review-title">
        <p className="eyebrow">Evidence queue</p>
        <h1 id="review-title">Review missions</h1>
        <p>
          Choose a claim with a clear evidence gap, add a public source, and
          improve the community assessment.
        </p>
        <div className="actions">
          <Link className="button primary" href="/submit">
            Add evidence
          </Link>
          <Link className="button" href="/claims">
            Browse claims
          </Link>
        </div>
      </header>

      <section className="metric-strip" aria-label="Review queue status">
        <div>
          <strong>{needsChallenge}</strong>
          <span>need challenge evidence</span>
        </div>
        <div>
          <strong>{needsSupport}</strong>
          <span>need support evidence</span>
        </div>
        <div>
          <strong>{twoSided}</strong>
          <span>already two-sided</span>
        </div>
      </section>

      <section className="panel" aria-labelledby="review-feedback-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Nostr reviewer feedback</p>
            <h2 id="review-feedback-title">
              Inspect one claim, then leave a 2-minute workflow note
            </h2>
          </div>
          <Link className="button primary" href={nostrFeedbackHref}>
            Leave workflow note
          </Link>
        </div>
        <p>
          Pick any source-backed claim below, check whether the cited URLs make
          the community assessment understandable, and tell us where the
          workflow slowed you down. Evidence suggests stronger reviewer notes
          will help prioritize the next claim workflow fixes.
        </p>
      </section>

      <section className="mission-board" aria-label="Open review missions">
        {missionClaims.map((claim) => {
          const mission = reviewMission(claim);
          const health = evidenceHealth(claim);

          return (
            <article className={`mission-card ${mission.stance}`} key={claim.id}>
              <div className="mission-meta">
                <span className="claim-domain">{claim.domain}</span>
                <span className="mission-priority">{priorityLabel(claim)}</span>
              </div>
              <h2>{mission.title}</h2>
              <p>{claim.title}</p>
              <div className="mission-stats" aria-label="Evidence mix">
                <span>{health.support} support</span>
                <span>{health.challenge} challenge</span>
                <span>{health.highQualityCount} strong</span>
              </div>
              <p className="mission-instruction">{mission.description}</p>
              <div className="mission-actions">
                <Link
                  className="button primary compact"
                  href={`/submit/${claim.id}`}
                >
                  Add source
                </Link>
                <Link className="button compact" href={`/claims/${claim.id}`}>
                  Inspect
                </Link>
              </div>
            </article>
          );
        })}
      </section>
    </section>
  );
}
