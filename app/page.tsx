import Link from "next/link";
import { evidenceCounts, reviewMission, seedClaims } from "../lib/claims";
import {
  getTopicClaims,
  getTopicStats,
  topicConfigs
} from "../lib/topic-helpers";

const principles = [
  "Every claim requires at least one verifiable source URL.",
  "Evidence can support or challenge a claim, and both sides remain visible.",
  "Scores are explainable community assessments, not official truth verdicts.",
  "Any AI-generated analysis is disclosed as automated assistance."
];

const reviewSessionSteps = [
  {
    title: "Pick an evidence gap",
    body: "Start from a disputed or inconclusive claim that needs a support, challenge, or context source."
  },
  {
    title: "Attach the source URL",
    body: "Add the strongest primary or reputable secondary link so readers can inspect the chain."
  },
  {
    title: "Score two dimensions",
    body: "Assess attribution accuracy separately from claim veracity, with the rationale visible."
  },
  {
    title: "Keep both sides visible",
    body: "Support, challenge, and context evidence remain side by side for community assessment."
  }
];

const launchSprintLinks = [
  {
    label: "Reviewer",
    title: "Share the reviewer launch kit",
    body: "Send AI and tech reviewers to source-backed claim missions, feedback, and the ClaimReview-compatible data export.",
    href: "/launch?ref=home_sprint_reviewer"
  },
  {
    label: "Daily",
    title: "Start today's review pack",
    body: "Open the three highest-value evidence missions with measured links for Milestone 4 attribution.",
    href: "/daily?ref=home_sprint"
  },
  {
    label: "Review",
    title: "Add one source-backed assessment",
    body: "Open priority missions that need support or challenge evidence from a verifiable URL.",
    href: "/review?ref=home_sprint"
  },
  {
    label: "Feedback",
    title: "Tell us what blocked trust",
    body: "Share where the claim workflow, evidence language, or scoring felt unclear.",
    href: "/feedback?use_case=review&ref=home_sprint"
  },
  {
    label: "Trending",
    title: "Inspect claims heating up",
    body: "Open a ranked list of claims with controversy, fresh evidence, and review momentum.",
    href: "/trending?ref=home_sprint"
  }
];

const addedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});

function formatAddedLabel(createdAt: string) {
  return `Added ${addedDateFormatter.format(new Date(createdAt))}`;
}

function reviewGapLabel(counts: ReturnType<typeof evidenceCounts>) {
  if (counts.challenge === 0) {
    return "No challenge source yet";
  }

  if (counts.support === 0) {
    return "No support source yet";
  }

  if (counts.context === 0) {
    return "Add context source";
  }

  return "Ready for second assessment";
}

function reviewGapSummary(counts: ReturnType<typeof evidenceCounts>) {
  const missing: string[] = [];

  if (counts.support === 0) {
    missing.push("support");
  }

  if (counts.challenge === 0) {
    missing.push("challenge");
  }

  if (counts.context === 0) {
    missing.push("context");
  }

  if (missing.length === 0) {
    return "Ready for second assessment";
  }

  if (missing.length === 1) {
    return `Needs ${missing[0]} source`;
  }

  return `Needs ${missing.slice(0, -1).join(", ")} and ${
    missing[missing.length - 1]
  } sources`;
}

export default function HomePage() {
  const evidenceTotal = seedClaims.reduce(
    (total, claim) => total + claim.evidence.length,
    0
  );
  const openEvidenceGaps = seedClaims.reduce((total, claim) => {
    const counts = evidenceCounts(claim);

    return (
      total +
      Number(counts.support === 0) +
      Number(counts.challenge === 0) +
      Number(counts.context === 0)
    );
  }, 0);
  const openChallengeGaps = seedClaims.reduce((total, claim) => {
    const counts = evidenceCounts(claim);

    return total + Number(counts.challenge === 0);
  }, 0);
  const claimsWithBothSides = seedClaims.reduce((total, claim) => {
    const counts = evidenceCounts(claim);

    return total + Number(counts.support > 0 && counts.challenge > 0);
  }, 0);

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
  const latestClaims = seedClaims
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const latestClaim = latestClaims[0];
  const latestCounts = latestClaim ? evidenceCounts(latestClaim) : null;
  const latestMission = latestClaim ? reviewMission(latestClaim) : null;
  const latestEvidenceTotal = latestCounts
    ? latestCounts.support + latestCounts.challenge + latestCounts.context
    : 0;
  const latestAddedLabel = latestClaim
    ? formatAddedLabel(latestClaim.createdAt)
    : null;
  const latestGapLabel = latestCounts ? reviewGapLabel(latestCounts) : null;
  const latestGapSummary = latestCounts ? reviewGapSummary(latestCounts) : null;

  return (
    <section className="stack">
      <div className="hero">
        <p className="eyebrow">Source-backed community assessment</p>
        <h1>Claimer</h1>
        <p>
          Start from the freshest sourced AI and technology claims, close the
          missing support or challenge evidence, and keep attribution accuracy
          separate from claim veracity.
        </p>
        {latestClaim && latestCounts && latestMission && (
          <div className="review-mission" aria-label="Current claim desk">
            <div>
              <div className="mission-meta">
                <span>Freshest review target</span>
                {latestAddedLabel && <span>{latestAddedLabel}</span>}
                <span>{latestMission.stance} evidence needed</span>
                <span>Source: {latestClaim.sourcePublisher}</span>
                {latestGapSummary && <span>{latestGapSummary}</span>}
              </div>
              <h3>{latestClaim.title}</h3>
              <p>{latestMission.description}</p>
              <div className="mission-stats" aria-label="Newest claim status">
                <span>{formatAddedLabel(latestClaim.createdAt)}</span>
                <span>{latestEvidenceTotal} source links</span>
                <span>{latestCounts.support} support</span>
                <span>{latestCounts.challenge} challenge</span>
                <span>{latestCounts.context} context</span>
                <span>{latestClaim.attributionScore}% attribution</span>
                <span>{latestClaim.veracityScore}% veracity</span>
              </div>
              <div className="source-line">
                <span>{latestClaim.sourceQuality}</span>
                <a href={latestClaim.sourceUrl} rel="noreferrer" target="_blank">
                  Original source: {latestClaim.sourcePublisher}
                </a>
              </div>
            </div>
            <div className="mission-actions">
              <Link
                className="button primary compact"
                href={`/submit/${latestClaim.id}?ref=home_current_claim`}
              >
                Add {latestMission.stance} source
              </Link>
              <Link className="button compact" href={`/claims/${latestClaim.id}`}>
                Inspect evidence
              </Link>
            </div>
          </div>
        )}
        <div className="hero-subtitle" aria-label="Claim review principles">
          <span className="hero-tag">
            <strong>{openChallengeGaps} challenge gaps open</strong>
            <span>Prioritize missing dispute sources before adding more support.</span>
          </span>
          <span className="hero-tag">
            <strong>{claimsWithBothSides} two-sided claims</strong>
            <span>Support and challenge evidence sit side by side.</span>
          </span>
          <span className="hero-tag">
            <strong>Score rationale</strong>
            <span>Veracity and attribution stay separate.</span>
          </span>
        </div>
        <div className="actions">
          <Link className="button primary" href="/review">
            Review priority claims
          </Link>
          <Link className="button" href="/claims">
            Browse claims
          </Link>
          <Link className="button" href="/daily">
            Daily pack
          </Link>
          <Link className="button" href="/submit">
            Submit a claim
          </Link>
        </div>
      </div>

      {debateClaims.length > 0 && (
        <section className="panel hot-debates" aria-labelledby="debates-title">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Review first</p>
              <h2 id="debates-title">Claims needing evidence now</h2>
            </div>
            <Link href="/review">Open evidence queue</Link>
          </div>
          <div className="grid">
            {debateClaims.map((claim) => {
              const counts = evidenceCounts(claim);
              const mission = reviewMission(claim);
              const totalSources =
                counts.support + counts.challenge + counts.context;
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
                  <p>{mission.description}</p>
                  <div
                    className="mission-stats"
                    aria-label={`Evidence coverage for ${claim.title}`}
                  >
                    <span>{reviewGapLabel(counts)}</span>
                    <span>{counts.support} support</span>
                    <span>{counts.challenge} challenge</span>
                    <span>{counts.context} context</span>
                  </div>
                  <Link href={`/submit/${claim.id}?ref=home_evidence_gap`}>
                    Add {mission.stance} source
                  </Link>
                  <Link href={`/claims/${claim.id}`}>
                    {totalSources} source links · {claim.veracityScore}%
                    veracity
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className="stat-highlight" aria-label="Platform statistics">
        <div className="stat-item stat-item-primary">
          <strong>{seedClaims.length}</strong>
          <span>Active claims</span>
          <p>Open for source-backed public review.</p>
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
          <strong>{openEvidenceGaps}</strong>
          <span>Evidence gaps</span>
          <p>Missing support, challenge, or context sources.</p>
        </div>
      </section>

      <section className="panel breaking-today" aria-labelledby="breaking-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Fresh queue</p>
            <h2 id="breaking-title">Latest claims added</h2>
            <p>
              New submissions show the original attribution source and the
              exact evidence gap reviewers can close next.
            </p>
          </div>
          <Link href="/claims">View all</Link>
        </div>
        <div className="grid">
          {latestClaims
            .slice(0, 3)
            .map((claim) => {
              const counts = evidenceCounts(claim);
              const addedLabel = formatAddedLabel(claim.createdAt);
              const mission = reviewMission(claim);
              return (
                <article
                  className="card claim-card breaking-card"
                  key={`breaking-${claim.id}`}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center"
                    }}
                  >
                    <span className="claim-domain">{claim.domain}</span>
                    <span className="debate-badge breaking">
                      {addedLabel}
                    </span>
                  </div>
                  <h3>{claim.title}</h3>
                  <p>{mission.description}</p>
                  <div className="mission-stats">
                    <span>{mission.stance} evidence needed</span>
                    <span>{reviewGapSummary(counts)}</span>
                    <span>Attribution: {claim.sourcePublisher}</span>
                    <span>{claim.veracityLabel}</span>
                  </div>
                  <div className="source-line">
                    <span>{claim.sourceQuality}</span>
                    <a
                      href={claim.sourceUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Original source: {claim.sourcePublisher}
                    </a>
                  </div>
                  <Link href={`/submit/${claim.id}?ref=home_breaking_claim`}>
                    Add source-backed review
                  </Link>
                  <Link href={`/claims/${claim.id}`}>
                    {counts.support + counts.challenge + counts.context}{" "}
                    source links · {claim.attributionScore}% attribution
                  </Link>
                </article>
              );
            })}
        </div>
      </section>

      <section className="panel" aria-labelledby="topics-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Topics</p>
            <h2 id="topics-title">Browse repeat-review claim areas</h2>
          </div>
          <Link href="/topics">View all topics</Link>
        </div>
        <div className="grid topic-grid">
          {topicConfigs.slice(0, 3).map((topic) => {
            const claims = getTopicClaims(topic);
            const stats = getTopicStats(claims);

            return (
              <article className="card claim-card topic-card" key={topic.slug}>
                <span className="claim-domain">Topic</span>
                <h3>{topic.title}</h3>
                <p>{topic.summary}</p>
                <div className="topic-card-stats">
                  <span>{stats.claimCount} claims</span>
                  <span>{stats.evidenceCount} evidence entries</span>
                </div>
                <Link href={`/topics/${topic.slug}`}>Open topic</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-labelledby="launch-sprint-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Launch sprint</p>
            <h2 id="launch-sprint-title">Help Claimer reach its next reviewers</h2>
          </div>
          <Link href="/launch?ref=home_sprint">Open launch kit</Link>
        </div>
        <div className="launch-grid">
          {launchSprintLinks.map((item) => (
            <article className="launch-card" key={item.href}>
              <div className="mission-meta">
                <span className="claim-domain">{item.label}</span>
                <span className="mission-priority">Milestone 4</span>
              </div>
              <h2>{item.title}</h2>
              <p>{item.body}</p>
              <div className="mission-actions">
                <Link className="button primary compact" href={item.href}>
                  Continue
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

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

      <section className="panel" aria-labelledby="review-session-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Reviewer loop</p>
            <h2 id="review-session-title">One source-backed review session</h2>
          </div>
          <Link href="/review">Open queue</Link>
        </div>
        <div className="how-it-works">
          {reviewSessionSteps.map((step, index) => (
            <div className="step-card" key={step.title}>
              <div className="step-number">{index + 1}</div>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </div>
          ))}
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
