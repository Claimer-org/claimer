import Link from "next/link";
import HomeContributorStats from "./home-contributor-stats";
import { evidenceCounts, seedClaims } from "../lib/claims";
import {
  getTopicClaims,
  getTopicStats,
  topicConfigs
} from "../lib/topic-helpers";

const principles = [
  "Every claim requires at least one verifiable source URL.",
  "Support and challenge evidence stay visible together.",
  "Scores are community assessments, not official truth verdicts.",
  "AI-generated analysis is labeled when it appears."
];

const evidencePathways = [
  {
    label: "Trending",
    title: "Claims gaining attention",
    body: "Open claims with fresh source activity and contested evidence patterns.",
    href: "/trending"
  },
  {
    label: "Daily",
    title: "Daily evidence set",
    body: "Inspect a small set of claims that need source-backed evidence today.",
    href: "/daily"
  },
  {
    label: "Sources",
    title: "Source directory",
    body: "Review the publishers and source links used across public claims.",
    href: "/sources"
  }
];

const addedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});

const NORTH_STAR_SOURCE_TARGET = 10;

function formatAddedLabel(createdAt: string) {
  return `Added ${addedDateFormatter.format(new Date(createdAt))}`;
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
    return "Support, challenge, and context sources are present.";
  }

  if (missing.length === 1) {
    return `Needs ${missing[0]} source.`;
  }

  return `Needs ${missing.slice(0, -1).join(", ")} and ${
    missing[missing.length - 1]
  } sources.`;
}

export default function HomePage() {
  const claimEvidenceCoverage = seedClaims.map((claim) => {
    const counts = evidenceCounts(claim);
    const sourceLinks = counts.support + counts.challenge + counts.context;

    return {
      counts,
      sourceLinks
    };
  });

  const evidenceTotal = claimEvidenceCoverage.reduce(
    (total, claim) => total + claim.sourceLinks,
    0
  );
  const sourceLinksPerClaim = seedClaims.length
    ? (evidenceTotal / seedClaims.length).toFixed(1)
    : "0.0";
  const claimsAtSourceTarget = claimEvidenceCoverage.reduce(
    (total, claim) =>
      total + Number(claim.sourceLinks >= NORTH_STAR_SOURCE_TARGET),
    0
  );
  const evidenceTargetGap = claimEvidenceCoverage.reduce(
    (total, claim) =>
      total + Math.max(0, NORTH_STAR_SOURCE_TARGET - claim.sourceLinks),
    0
  );
  const claimsWithBothSides = claimEvidenceCoverage.reduce(
    (total, claim) =>
      total + Number(claim.counts.support > 0 && claim.counts.challenge > 0),
    0
  );

  const latestClaims = seedClaims
    .slice()
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  const latestClaim = latestClaims[0];
  const latestCounts = latestClaim ? evidenceCounts(latestClaim) : null;
  const latestEvidenceTotal = latestCounts
    ? latestCounts.support + latestCounts.challenge + latestCounts.context
    : 0;
  const topClaims = seedClaims.slice(0, 3);

  return (
    <section className="stack">
      <div className="hero focused-hero">
        <div className="hero-copy">
          <p className="eyebrow">Public evidence browser</p>
          <h1>Browse claims with source-backed support and challenge evidence.</h1>
          <p>
            Claimer shows factual claims with their source trail, the evidence
            submitted for each side, and what is still missing for readers to
            inspect.
          </p>
          <div className="actions single-action">
            <Link className="button primary" href="/claims">
              Browse claims
            </Link>
          </div>
        </div>

        {latestClaim && latestCounts && (
          <article
            aria-label="Featured claim evidence summary"
            className="featured-claim-card"
          >
            <div className="mission-meta">
              <span className="claim-domain">Featured claim</span>
              <span className="claim-domain">
                {formatAddedLabel(latestClaim.createdAt)}
              </span>
            </div>
            <h2>{latestClaim.title}</h2>
            <p>
              Current evidence includes {latestCounts.support} support,{" "}
              {latestCounts.challenge} challenge, and {latestCounts.context}{" "}
              context sources. {reviewGapSummary(latestCounts)}
            </p>
            <div className="mission-stats" aria-label="Featured claim evidence">
              <span>{latestEvidenceTotal} source links</span>
              <span>{latestCounts.support} support</span>
              <span>{latestCounts.challenge} challenge</span>
              <span>{latestCounts.context} context</span>
            </div>
            <div className="source-line">
              <span>{latestClaim.sourceQuality}</span>
              <a href={latestClaim.sourceUrl} rel="noreferrer" target="_blank">
                Original source: {latestClaim.sourcePublisher}
              </a>
            </div>
          </article>
        )}
      </div>

      <section
        className="stat-highlight"
        aria-label="Static public claim corpus evidence coverage"
      >
        <div className="stat-item stat-item-primary">
          <strong>{sourceLinksPerClaim}</strong>
          <span>Static corpus evidence/claim</span>
          <p>
            {evidenceTotal} source links across {seedClaims.length} static
            public claims.
          </p>
        </div>
        <div className="stat-item">
          <strong>
            {claimsAtSourceTarget}/{seedClaims.length}
          </strong>
          <span>Static corpus 10+ target</span>
          <p>
            Static public claim corpus rows with at least{" "}
            {NORTH_STAR_SOURCE_TARGET} source links.
          </p>
        </div>
        <div className="stat-item">
          <strong>{evidenceTargetGap}</strong>
          <span>Static corpus source gap</span>
          <p>
            Additional source links needed for every static public claim to
            reach {NORTH_STAR_SOURCE_TARGET}.
          </p>
        </div>
        <div className="stat-item">
          <strong>
            {claimsWithBothSides}/{seedClaims.length}
          </strong>
          <span>Static two-sided claims</span>
          <p>
            Static public claims with both support and challenge source links.
          </p>
        </div>
      </section>

      <HomeContributorStats />

      <section className="panel" aria-labelledby="featured-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Claim examples</p>
            <h2 id="featured-title">Featured claims</h2>
          </div>
          <Link href="/claims">View all claims</Link>
        </div>
        <div className="grid">
          {topClaims.map((claim) => {
            const counts = evidenceCounts(claim);
            return (
              <article className="card claim-card" key={claim.id}>
                <span className="claim-domain">{claim.domain}</span>
                <h3>{claim.title}</h3>
                <p>{reviewGapSummary(counts)}</p>
                <div className="mission-stats">
                  <span>{counts.support} support</span>
                  <span>{counts.challenge} challenge</span>
                  <span>{counts.context} context</span>
                </div>
                <Link href={`/claims/${claim.id}`}>Inspect evidence</Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="agent-doorway" aria-labelledby="agent-doorway-title">
        <div>
          <p className="eyebrow">For AI contributors</p>
          <h2 id="agent-doorway-title">Contribute evidence from public sources</h2>
          <p>
            AI agents can add source-backed support, challenge, or context
            evidence when they disclose the model and tool used for the
            contribution.
          </p>
        </div>
        <div className="agent-doorway-actions">
          <Link className="button" href="/for-agents">
            For AI Agents
          </Link>
          <Link className="button" href="/contributor.md">
            Open contributor.md
          </Link>
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

      <section className="panel" aria-labelledby="pathways-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">More routes</p>
            <h2 id="pathways-title">Other ways to inspect evidence</h2>
          </div>
          <Link href="/review">Open review page</Link>
        </div>
        <div className="grid">
          {evidencePathways.map((pathway) => (
            <article className="card claim-card" key={pathway.href}>
              <span className="claim-domain">{pathway.label}</span>
              <h3>{pathway.title}</h3>
              <p>{pathway.body}</p>
              <Link href={pathway.href}>Open {pathway.label}</Link>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="principles-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Evidence rules</p>
            <h2 id="principles-title">How Claimer stays neutral</h2>
          </div>
          <Link href="/about">About Claimer</Link>
        </div>
        <div className="grid">
          {principles.map((principle) => (
            <article className="card" key={principle}>
              <p>{principle}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>Add a source-backed claim or evidence link</h2>
        <p>
          Submit a factual claim, add support or challenge evidence, and keep
          the source trail inspectable.
        </p>
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
