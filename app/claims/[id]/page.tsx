import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  evidenceCounts,
  evidenceHealth,
  evidenceProvenanceParts,
  findSeedClaim,
  reviewMission,
  seedClaims
} from "../../../lib/claims";
import { siteUrl } from "../../../lib/site";
import AttributedReviewLink from "../../review/attributed-review-link";
import ClaimShareSection from "./claim-share";

const readerEvidenceMetadataNote =
  "Older public archive entries may lack public model/tool metadata; newer AI submissions require disclosure before publication.";

function readerEvidenceProvenanceValue(value: string) {
  if (value === "Static library record") {
    return "Public archive entry";
  }

  if (value === "Model not public on this record") {
    return "Model not recorded for this public entry";
  }

  if (value === "Tool not public on this record") {
    return "Tool not recorded for this public entry";
  }

  return value;
}

export function generateStaticParams() {
  return seedClaims.map((claim) => ({ id: claim.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const claim = findSeedClaim(id);

  if (!claim) {
    return { title: "Claim not found — Claimer" };
  }

  const counts = evidenceCounts(claim);
  const description = `Original source: ${claim.sourceTitle}. Evidence chain: ${claim.evidence.length} entries (${counts.support} support / ${counts.challenge} challenge / ${counts.context} context). ${claim.body}`.slice(0, 200);

  return {
    title: claim.title,
    description,
    openGraph: {
      title: claim.title,
      description,
      type: "article",
      url: `${siteUrl}/claims/${id}/`,
      siteName: "Claimer",
      locale: "en_US"
    },
    twitter: {
      card: "summary",
      title: claim.title,
      description
    }
  };
}

export default async function ClaimDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const claim = findSeedClaim(id);

  if (!claim) {
    notFound();
  }

  const counts = evidenceCounts(claim);
  const health = evidenceHealth(claim);
  const mission = reviewMission(claim);
  const sourceCountSummary = `${counts.support} support, ${counts.challenge} challenge, ${counts.context} context`;
  const supportChallengeContextSummary = `${counts.support} support / ${counts.challenge} challenge / ${counts.context} context`;
  const evidenceGapSignal = health.needsChallenge
    ? "Challenge source gap"
    : health.needsSupport
      ? "Support source gap"
      : health.hasHighQualitySource
        ? "Context open"
        : "Primary-source gap";
  const evidenceMixSignal =
    counts.support > 0 && counts.challenge > 0
      ? "Support and challenge sources"
      : counts.support > 0
        ? "Support sources only"
        : counts.challenge > 0
          ? "Challenge sources only"
          : counts.context > 0
            ? "Context sources only"
            : "No evidence entries";

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: claim.title,
    description: claim.body,
    url: `${siteUrl}/claims/${claim.id}/`,
    mainEntityOfPage: `${siteUrl}/claims/${claim.id}/`,
    datePublished: claim.createdAt,
    author: {
      "@type": "Organization",
      name: "Claimer",
      url: siteUrl
    },
    publisher: {
      "@type": "Organization",
      name: "Claimer",
      url: siteUrl
    },
    citation: claim.sourceUrl,
    about: {
      "@type": "Thing",
      name: claim.title
    }
  };

  return (
    <article className="detail standalone claim-detail-article reader-editorial">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Link className="button compact" href="/claims">
        Back to claims
      </Link>
      <div className="detail-heading">
        <div>
          <p className="eyebrow">{claim.domain}</p>
          <h1>{claim.title}</h1>
        </div>
      </div>
      <p>{claim.body}</p>

      <section className="source-inspection" aria-labelledby="claim-source-title">
        <div>
          <span>Original source</span>
          <h2 id="claim-source-title">Original source</h2>
          <p>
            Publisher: {claim.sourcePublisher}. Inspect the source attributed to
            the claim before reviewing the evidence chain below.
          </p>
        </div>
        <div className="source-reference">
          <span>{claim.sourceQuality} source</span>
          <a href={claim.sourceUrl} rel="noreferrer" target="_blank">
            {claim.sourceTitle}
          </a>
          <small>{claim.sourcePublisher}</small>
          <code className="source-url">{claim.sourceUrl}</code>
        </div>
      </section>

      <section className="evidence-section" aria-labelledby="detail-evidence-title">
        <h2 id="detail-evidence-title">Evidence chain</h2>
        <p className="evidence-metadata-note">
          <strong>Model/tool metadata:</strong> {readerEvidenceMetadataNote}
        </p>
        <div className="evidence-list">
          {claim.evidence.map((item) => (
            <article className={`evidence ${item.stance}`} key={item.id}>
              <div>
                <span>{item.stance}</span>
                <em>{item.sourceQuality}</em>
              </div>
              <p>{item.summary}</p>
              <p className="evidence-provenance">
                {evidenceProvenanceParts(item).map((part) => (
                  <span key={part.label}>
                    <strong>{part.label}:</strong>{" "}
                    {readerEvidenceProvenanceValue(part.value)}
                  </span>
                ))}
              </p>
              <div className="evidence-source">
                <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                  {item.sourceTitle}
                </a>
                <small>{item.sourceUrl}</small>
              </div>
            </article>
          ))}
        </div>
        <aside className="evidence-standards" aria-labelledby="detail-evidence-standards-title">
          <div className="evidence-standards-copy">
            <span>Evidence standards</span>
            <h3 id="detail-evidence-standards-title">Methodology and corrections</h3>
            <p>
              Claimer keeps support, challenge, and context evidence separate and
              stores source-backed evidence, not truth verdicts.
            </p>
            <p>
              Evidence quality is evaluated by source relevance, source type, and
              whether the source actually supports the submitted evidence summary.
            </p>
            <p>
              If source coverage looks missing, stale, or incorrect, use the
              sourced-evidence or feedback path. Corrections mean adding or
              challenging sourced evidence, not rewriting a claim into an editorial
              conclusion.
            </p>
          </div>
          <div className="evidence-standards-actions">
            <AttributedReviewLink className="button compact" href={`/submit/${claim.id}/`}>
              Add sourced evidence
            </AttributedReviewLink>
            <Link
              className="button compact"
              href={`/feedback?ref=post_contribution&use_case=add_evidence&claim_id=${encodeURIComponent(
                claim.id
              )}`}
            >
              Send feedback
            </Link>
          </div>
        </aside>
      </section>

      <section className="metric-strip" aria-label="Evidence counts">
        <div>
          <strong>{counts.support}</strong>
          <span>support</span>
        </div>
        <div>
          <strong>{counts.challenge}</strong>
          <span>challenge</span>
        </div>
        <div>
          <strong>{counts.context}</strong>
          <span>context</span>
        </div>
      </section>

      <section className="metric-strip evidence-health" aria-label="Evidence health">
        <div>
          <strong>{health.total}</strong>
          <span>evidence entries</span>
        </div>
        <div>
          <strong>{health.highQualityCount}</strong>
          <span>primary/direct</span>
        </div>
        <div>
          <strong>{evidenceMixSignal}</strong>
          <span>support / challenge mix</span>
        </div>
      </section>

      <section className="review-mission" aria-labelledby="review-mission-title">
        <div>
          <span>{evidenceGapSignal}</span>
          <h2 id="review-mission-title">Evidence gap</h2>
          <p>{mission.description}</p>
        </div>
        <AttributedReviewLink className="button compact" href={`/submit/${claim.id}/`}>
          Contribute sourced evidence
        </AttributedReviewLink>
      </section>

      <section className="claim-detail-share" aria-label="Share after reader inspection">
        <ClaimShareSection
          title={claim.title}
          text={`Original source: ${claim.sourceTitle}. Evidence chain: ${sourceCountSummary}.`}
          claimId={claim.id}
        />
      </section>

      <section className="coverage-metadata" aria-labelledby="coverage-metadata-title">
        <h2 id="coverage-metadata-title">Coverage metadata</h2>
        <dl>
          <div>
            <dt>Source trail</dt>
            <dd>
              {claim.sourceQuality} source from {claim.sourcePublisher}
            </dd>
          </div>
          <div>
            <dt>Evidence count</dt>
            <dd>
              {health.total} source {health.total === 1 ? "entry" : "entries"} for
              reader inspection
            </dd>
          </div>
          <div>
            <dt>support / challenge / context</dt>
            <dd>{supportChallengeContextSummary}</dd>
          </div>
          <div>
            <dt>Attribution note</dt>
            <dd>{claim.attributionExplanation}</dd>
          </div>
        </dl>
      </section>

      <section className="assessment-checklist" aria-label="Evidence context checklist">
        {[
          {
            label: "Source link",
            done: Boolean(claim.sourceUrl),
            detail: claim.sourceTitle
          },
          {
            label: "Primary/direct source",
            done: ["primary", "direct witness"].includes(claim.sourceQuality),
            detail: claim.sourceQuality
          },
          {
            label: "Support evidence",
            done: counts.support > 0,
            detail: `${counts.support} source${counts.support === 1 ? "" : "s"}`
          },
          {
            label: "Challenge evidence",
            done: counts.challenge > 0,
            detail: `${counts.challenge} source${counts.challenge === 1 ? "" : "s"}`
          }
        ].map((check) => (
          <div className={check.done ? "check-item done" : "check-item"} key={check.label}>
            <span>{check.done ? "Present" : "Open"}</span>
            <strong>{check.label}</strong>
            <small>{check.detail}</small>
          </div>
        ))}
      </section>
    </article>
  );
}
