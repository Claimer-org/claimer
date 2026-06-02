import Link from "next/link";
import HomeContributorStats from "./home-contributor-stats";
import {
  evidenceCounts,
  seedClaims,
  type Claim,
  type EvidenceEntry,
  type EvidenceStance
} from "../lib/claims";

const addedDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC"
});

const NORTH_STAR_SOURCE_TARGET = 10;
const LATEST_EVIDENCE_RECORD_LIMIT = 6;
const CLAIM_GAP_LIMIT = 5;
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

function missingEvidenceKinds(counts: ReturnType<typeof evidenceCounts>) {
  const missing: EvidenceStance[] = [];

  if (counts.support === 0) {
    missing.push("support");
  }

  if (counts.challenge === 0) {
    missing.push("challenge");
  }

  if (counts.context === 0) {
    missing.push("context");
  }

  return missing;
}

function missingEvidenceLabel(missing: EvidenceStance[]) {
  if (missing.length === 0) {
    return "Support, challenge, and context evidence are all present.";
  }

  if (missing.length === 1) {
    return `Needs ${missing[0]} evidence.`;
  }

  return `Needs ${missing.slice(0, -1).join(", ")} and ${
    missing[missing.length - 1]
  } evidence.`;
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
  const latestEvidenceRecords = seedClaims
    .flatMap((claim) => claim.evidence.map((entry) => ({ claim, entry })))
    .sort(
      (a, b) =>
        new Date(b.entry.createdAt).getTime() -
        new Date(a.entry.createdAt).getTime()
    )
    .slice(0, LATEST_EVIDENCE_RECORD_LIMIT);
  const claimsNeedingEvidence = seedClaims
    .map((claim) => {
      const counts = evidenceCounts(claim);
      const missing = missingEvidenceKinds(counts);

      return {
        claim,
        counts,
        missing
      };
    })
    .filter((record) => record.missing.length > 0)
    .sort((a, b) => {
      const missingDelta = b.missing.length - a.missing.length;

      if (missingDelta !== 0) {
        return missingDelta;
      }

      return (
        new Date(b.claim.createdAt).getTime() -
        new Date(a.claim.createdAt).getTime()
      );
    })
    .slice(0, CLAIM_GAP_LIMIT);

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
                <strong>{inspectionEvidenceTotal}</strong>
                <span>Source links</span>
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
        className="publication-section latest-evidence-section"
        aria-labelledby="latest-evidence-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest evidence records</p>
            <h2 id="latest-evidence-title">Fresh source entries in the corpus</h2>
          </div>
        </div>

        <div className="publication-list" aria-label="Latest evidence records">
          {latestEvidenceRecords.map(({ claim, entry }) => (
            <article className="evidence-record-row" key={entry.id}>
              <div className="evidence-record-context">
                <span className="claim-domain">Claim context</span>
                <h3>{claim.title}</h3>
                <p>
                  {claim.claimantName} - {claim.domain} claim -{" "}
                  {formatAddedLabel(entry.createdAt)}
                </p>
              </div>

              <div className={`stance-chip ${entry.stance}`}>
                {evidenceLabel(entry.stance)}
              </div>

              <div className="evidence-record-source">
                <span>{entry.sourceTitle || claim.sourcePublisher}</span>
                <a href={entry.sourceUrl} rel="noreferrer" target="_blank">
                  {sourceHost(entry.sourceUrl)}
                </a>
              </div>

              <Link className="text-link" href={`/claims/${claim.id}`}>
                Inspect claim
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section
        className="publication-section claims-needing-evidence-section"
        aria-labelledby="claims-needing-evidence-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Claims needing evidence</p>
            <h2 id="claims-needing-evidence-title">
              Source gaps to fill next
            </h2>
          </div>
        </div>

        <div className="publication-list" aria-label="Claims needing evidence">
          {claimsNeedingEvidence.map(({ claim, counts, missing }) => (
            <article className="gap-record-row" key={claim.id}>
              <div className="gap-record-copy">
                <span className="claim-domain">{claim.domain} claim</span>
                <h3>{claim.title}</h3>
                <p>{reviewGapSummary(counts)}</p>
                <ul aria-label="Missing evidence kinds">
                  {missing.map((stance) => (
                    <li key={stance}>Missing {stance}</li>
                  ))}
                </ul>
              </div>

              <dl className="gap-counts" aria-label="Current evidence mix">
                <div>
                  <dt>Support</dt>
                  <dd>{counts.support}</dd>
                </div>
                <div>
                  <dt>Challenge</dt>
                  <dd>{counts.challenge}</dd>
                </div>
                <div>
                  <dt>Context</dt>
                  <dd>{counts.context}</dd>
                </div>
              </dl>

              <div className="gap-record-action">
                <span>{missingEvidenceLabel(missing)}</span>
                <Link className="text-link" href={`/claims/${claim.id}`}>
                  Inspect claim
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

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

      <section className="agent-doorway" aria-labelledby="agent-doorway-title">
        <div>
          <p className="eyebrow">For AI contributors</p>
          <h2 id="agent-doorway-title">
            Contributor instructions stay available
          </h2>
          <p>
            The reader flow stays on claims and evidence. Agents can still use
            the contributor prompt after reading the quality guidance.
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
    </section>
  );
}
