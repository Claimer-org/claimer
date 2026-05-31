import Link from "next/link";
import HomeContributorStats from "./home-contributor-stats";
import {
  evidenceCounts,
  seedClaims,
  type Claim,
  type EvidenceEntry,
  type EvidenceStance
} from "../lib/claims";
import {
  getTopicClaims,
  getTopicStats,
  topicConfigs
} from "../lib/topic-helpers";

const principles = [
  "Every claim requires at least one verifiable source URL.",
  "Support and challenge evidence stay visible together.",
  "Scores are community assessments; sources stay inspectable.",
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
const evidenceStances = ["support", "challenge", "context"] as const;

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
    return "Evidence mix includes support, challenge, and context sources.";
  }

  if (missing.length === 1) {
    return `Evidence gap: ${missing[0]} source.`;
  }

  return `Evidence gaps: ${missing.slice(0, -1).join(", ")} and ${
    missing[missing.length - 1]
  } sources.`;
}

function hasFullEvidenceMix(claim: Claim) {
  const counts = evidenceCounts(claim);
  return counts.support > 0 && counts.challenge > 0 && counts.context > 0;
}

function hasTwoSidedEvidence(claim: Claim) {
  const counts = evidenceCounts(claim);
  return counts.support > 0 && counts.challenge > 0;
}

function evidenceLabel(stance: EvidenceStance) {
  if (stance === "support") {
    return "Support source";
  }

  if (stance === "challenge") {
    return "Challenge source";
  }

  return "Context source";
}

function sourceCountLabel(total: number) {
  return `${total} source link${total === 1 ? "" : "s"}`;
}

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return sourceUrl;
  }
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
  const inspectionClaim =
    latestClaims.find(hasFullEvidenceMix) ??
    latestClaims.find(hasTwoSidedEvidence) ??
    latestClaim;
  const inspectionCounts = inspectionClaim ? evidenceCounts(inspectionClaim) : null;
  const inspectionEvidenceTotal = inspectionCounts
    ? inspectionCounts.support +
      inspectionCounts.challenge +
      inspectionCounts.context
    : 0;
  const inspectionSourceHost = inspectionClaim
    ? sourceHost(inspectionClaim.sourceUrl)
    : "";
  const inspectionEvidence = inspectionClaim
    ? evidenceStances
        .map((stance) =>
          inspectionClaim.evidence.find((entry) => entry.stance === stance)
        )
        .filter((entry): entry is EvidenceEntry => Boolean(entry))
    : [];
  const topClaims = seedClaims.slice(0, 3);

  return (
    <section className="stack home-editorial">
      <div className="hero focused-hero">
        <div className="hero-copy">
          <p className="eyebrow">Public evidence reader</p>
          <h1>Start with the source trail, then inspect the claim.</h1>
          <p>
            Read a claim beside its original source, source host, evidence
            links, and open evidence gaps before broader coverage metrics.
          </p>
        </div>

        {inspectionClaim && inspectionCounts && (
          <article
            aria-label="Claim and evidence source inspection"
            className="home-inspection-card"
          >
            <div className="home-inspection-kicker">
              <span className="claim-domain">Claim under inspection</span>
              <span className="claim-domain">
                {formatAddedLabel(inspectionClaim.createdAt)}
              </span>
            </div>

            <div className="home-inspection-body">
              <div>
                <h2>{inspectionClaim.title}</h2>
                <dl
                  aria-label="Mobile source and evidence summary"
                  className="home-mobile-source-summary"
                >
                  <div>
                    <dt>Source publisher</dt>
                    <dd>{inspectionClaim.sourcePublisher}</dd>
                  </div>
                  <div>
                    <dt>Source host</dt>
                    <dd>{inspectionSourceHost}</dd>
                  </div>
                  <div>
                    <dt>Evidence links</dt>
                    <dd>{sourceCountLabel(inspectionEvidenceTotal)}</dd>
                  </div>
                </dl>
                <p>{inspectionClaim.body}</p>
              </div>

              <div className="home-source-panel">
                <span>Original source</span>
                <strong>{inspectionClaim.sourcePublisher}</strong>
                <a
                  className="home-source-url"
                  href={inspectionClaim.sourceUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {inspectionClaim.sourceUrl}
                </a>
                <small>
                  {inspectionClaim.sourceQuality} source -{" "}
                  {inspectionClaim.sourceTitle}
                </small>
              </div>
            </div>

            <div
              aria-label="Evidence source counts"
              className="home-evidence-counts"
            >
              <div className="home-evidence-count">
                <strong>{sourceCountLabel(inspectionEvidenceTotal)}</strong>
                <span>Connected to this claim</span>
              </div>
              <div className="home-evidence-count">
                <strong>{inspectionCounts.support}</strong>
                <span>Support</span>
              </div>
              <div className="home-evidence-count">
                <strong>{inspectionCounts.challenge}</strong>
                <span>Challenge</span>
              </div>
              <div className="home-evidence-count">
                <strong>{inspectionCounts.context}</strong>
                <span>Context</span>
              </div>
            </div>

            <p className="home-gap-note">{reviewGapSummary(inspectionCounts)}</p>

            <div className="home-evidence-list" aria-label="Evidence source links">
              {inspectionEvidence.map((entry) => (
                <div
                  className={`home-evidence-row ${entry.stance}`}
                  key={entry.id}
                >
                  <span>{evidenceLabel(entry.stance)}</span>
                  <strong>{entry.sourceTitle}</strong>
                  <p>{entry.summary}</p>
                  <a href={entry.sourceUrl} rel="noreferrer" target="_blank">
                    {entry.sourceUrl}
                  </a>
                </div>
              ))}
            </div>
          </article>
        )}

        <div className="actions single-action">
          <Link className="button primary" href="/claims">
            Browse claims
          </Link>
          <Link className="button subtle" href="/for-agents">
            Contributor instructions
          </Link>
        </div>
      </div>

      <section
        className="home-metrics-panel"
        aria-labelledby="home-metrics-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Coverage metrics</p>
            <h2 id="home-metrics-title">Corpus and contributor signals</h2>
          </div>
        </div>

        <section
          className="stat-highlight"
          aria-label="Static public claim corpus evidence coverage"
        >
          <div className="stat-item stat-item-primary">
            <strong>{sourceLinksPerClaim}</strong>
            <span>Static corpus evidence per claim</span>
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
      </section>

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
