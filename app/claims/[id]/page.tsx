import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  evidenceCounts,
  evidenceHealth,
  findSeedClaim,
  reviewMission,
  seedClaims
} from "../../../lib/claims";
import ClaimShareSection from "./claim-share";

const siteUrl = "https://smithmatric-boop.github.io/claimer";

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

  const description = `${claim.veracityLabel} · Attribution ${claim.attributionScore}% · ${claim.evidence.length} evidence entries. ${claim.body}`.slice(0, 200);

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

  // ClaimReview JSON-LD for Google rich results
  const claimReviewJsonLd = {
    "@context": "https://schema.org",
    "@type": "ClaimReview",
    url: `${siteUrl}/claims/${claim.id}/`,
    claimReviewed: claim.title,
    itemReviewed: {
      "@type": "Claim",
      name: claim.title,
      author: {
        "@type": claim.subjectKind === "company" ? "Organization" : "Person",
        name: claim.claimantName
      },
      datePublished: claim.createdAt,
      appearance: {
        "@type": "CreativeWork",
        url: claim.sourceUrl,
        name: claim.sourceTitle
      }
    },
    author: {
      "@type": "Organization",
      name: "Claimer Community",
      url: siteUrl
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: claim.veracityScore,
      bestRating: 100,
      worstRating: 0,
      alternateName: claim.veracityLabel
    },
    datePublished: claim.createdAt
  };

  return (
    <article className="detail standalone">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(claimReviewJsonLd) }}
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
      <ClaimShareSection
        title={claim.title}
        text={claim.veracityLabel}
        claimId={claim.id}
      />
      <p>{claim.body}</p>

      <div className="score-grid">
        <section className="score">
          <span>Attribution accuracy</span>
          <strong>{claim.attributionScore}%</strong>
          <p>{claim.attributionLabel}</p>
          <small>{claim.attributionExplanation}</small>
        </section>
        <section className="score">
          <span>Claim veracity</span>
          <strong>{claim.veracityScore}%</strong>
          <p>{claim.veracityLabel}</p>
          <small>{claim.veracityExplanation}</small>
        </section>
      </div>

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
          <strong>{health.balanceLabel}</strong>
          <span>balance check</span>
        </div>
      </section>

      <section className="review-mission" aria-labelledby="review-mission-title">
        <div>
          <span>{mission.stance}</span>
          <h2 id="review-mission-title">{mission.title}</h2>
          <p>{mission.description}</p>
        </div>
        <Link className="button compact" href={`/submit/${claim.id}`}>
          Add evidence
        </Link>
      </section>

      <section className="assessment-checklist" aria-label="Assessment readiness">
        {[
          {
            label: "Attribution source",
            done: Boolean(claim.sourceUrl),
            detail: claim.sourceTitle
          },
          {
            label: "Strong attribution quality",
            done: ["primary", "direct witness"].includes(claim.sourceQuality),
            detail: claim.sourceQuality
          },
          {
            label: "Veracity support",
            done: counts.support > 0,
            detail: `${counts.support} source${counts.support === 1 ? "" : "s"}`
          },
          {
            label: "Veracity challenge",
            done: counts.challenge > 0,
            detail: `${counts.challenge} source${counts.challenge === 1 ? "" : "s"}`
          }
        ].map((check) => (
          <div className={check.done ? "check-item done" : "check-item"} key={check.label}>
            <span>{check.done ? "Ready" : "Gap"}</span>
            <strong>{check.label}</strong>
            <small>{check.detail}</small>
          </div>
        ))}
      </section>

      <div className="source-line">
        <span>{claim.sourceQuality}</span>
        <a href={claim.sourceUrl} rel="noreferrer" target="_blank">
          {claim.sourceTitle}
        </a>
      </div>

      <section className="evidence-section" aria-labelledby="detail-evidence-title">
        <h2 id="detail-evidence-title">Evidence chain</h2>
        <div className="source-line" aria-label="Add evidence">
          <span>Community assessment</span>
          <p>
            If evidence suggests support, challenge, or context, add it with a
            source.
          </p>
          <Link className="button compact" href={`/submit/${claim.id}`}>
            Add evidence
          </Link>
        </div>
        <div className="evidence-list">
          {claim.evidence.map((item) => (
            <article className={`evidence ${item.stance}`} key={item.id}>
              <div>
                <span>{item.stance}</span>
                <em>{item.assessmentTarget ?? "veracity"}</em>
                <em>{item.sourceQuality}</em>
              </div>
              <p>{item.summary}</p>
              <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                {item.sourceTitle}
              </a>
            </article>
          ))}
        </div>
      </section>
    </article>
  );
}
