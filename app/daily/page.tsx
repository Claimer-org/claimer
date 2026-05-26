import type { Metadata } from "next";
import Link from "next/link";
import {
  type Claim,
  evidenceCounts,
  evidenceHealth,
  reviewMission,
  seedClaims
} from "../../lib/claims";
import { siteUrl } from "../../lib/site";

export const metadata: Metadata = {
  title: "Daily Review Pack",
  description:
    "A focused Claimer review pack with priority evidence missions and debated AI and technology claims."
};

const campaignName = "milestone4-daily-pack";

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

function measuredPath(path: string, content: string, claimId?: string) {
  const params = new URLSearchParams({
    utm_source: "daily_pack",
    utm_medium: "internal",
    utm_campaign: campaignName,
    utm_content: content,
    ref: "daily_pack"
  });

  if (claimId) {
    params.set("claim_id", claimId);
  }

  return `${path}?${params.toString()}`;
}

function measuredUrl(path: string, content: string, claimId?: string) {
  return `${siteUrl}${measuredPath(path, content, claimId)}`;
}

export default function DailyPage() {
  const priorityMissions = seedClaims
    .slice()
    .sort((a, b) => missionScore(b) - missionScore(a))
    .slice(0, 3);
  const debatedClaims = seedClaims
    .filter(
      (claim) =>
        claim.veracityLabel === "Evidence suggests disputed" ||
        claim.veracityLabel === "Evidence inconclusive"
    )
    .slice(0, 3);
  const sourceLinks = priorityMissions.reduce(
    (total, claim) => total + claim.evidence.length + 1,
    0
  );

  return (
    <section className="stack">
      <header className="page-heading" aria-labelledby="daily-title">
        <p className="eyebrow">Daily review pack</p>
        <h1 id="daily-title">Three claims that need evidence now</h1>
        <p>
          Start with the highest-value evidence gaps in Claimer. Each mission
          points to a public claim, a source-backed task, and measured links for
          Milestone 4 attribution.
        </p>
        <div className="actions">
          <Link
            className="button primary"
            href={measuredPath("/review/", "daily_header")}
          >
            Open review queue
          </Link>
          <Link className="button" href={measuredPath("/feedback/", "daily_header")}>
            Send feedback
          </Link>
        </div>
      </header>

      <section className="metric-strip" aria-label="Daily pack status">
        <div>
          <strong>{priorityMissions.length}</strong>
          <span>priority missions</span>
        </div>
        <div>
          <strong>{debatedClaims.length}</strong>
          <span>debated claims</span>
        </div>
        <div>
          <strong>{sourceLinks}</strong>
          <span>source links nearby</span>
        </div>
      </section>

      <section className="mission-board" aria-label="Priority daily missions">
        {priorityMissions.map((claim) => {
          const mission = reviewMission(claim);
          const health = evidenceHealth(claim);
          const submitPath = measuredPath(
            `/submit/${claim.id}/`,
            claim.id,
            claim.id
          );

          return (
            <article className={`mission-card ${mission.stance}`} key={claim.id}>
              <div className="mission-meta">
                <span className="claim-domain">{claim.domain}</span>
                <span className="mission-priority">{health.balanceLabel}</span>
              </div>
              <h2>{mission.title}</h2>
              <p>{claim.title}</p>
              <div className="mission-stats" aria-label="Evidence mix">
                <span>{health.support} support</span>
                <span>{health.challenge} challenge</span>
                <span>{health.highQualityCount} strong</span>
              </div>
              <p className="mission-instruction">{mission.description}</p>
              <p className="copy-line">
                {measuredUrl(`/submit/${claim.id}/`, claim.id, claim.id)}
              </p>
              <div className="mission-actions">
                <Link className="button primary compact" href={submitPath}>
                  Add source
                </Link>
                <Link className="button compact" href={`/claims/${claim.id}/`}>
                  Inspect claim
                </Link>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel" aria-labelledby="debated-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Debated claims</p>
            <h2 id="debated-title">Start where disagreement is visible</h2>
          </div>
          <Link href={measuredPath("/claims/", "daily_debated")}>All claims</Link>
        </div>
        <div className="grid">
          {debatedClaims.map((claim) => {
            const counts = evidenceCounts(claim);

            return (
              <article className="card claim-card" key={`daily-${claim.id}`}>
                <span className="claim-domain">{claim.domain}</span>
                <h3>{claim.title}</h3>
                <p>{claim.veracityLabel}</p>
                <Link href={`/claims/${claim.id}/`}>
                  {counts.support + counts.challenge + counts.context} source
                  links · {claim.veracityScore}% veracity
                </Link>
              </article>
            );
          })}
        </div>
      </section>
    </section>
  );
}
