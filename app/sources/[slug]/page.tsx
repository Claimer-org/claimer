import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { evidenceCounts } from "../../../lib/claims";
import { findSourceRecord, sourceRecords } from "../../../lib/source-reputation";

const siteUrl = "https://claimer-org.github.io/claimer";

export function generateStaticParams() {
  return sourceRecords.map((source) => ({ slug: source.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const source = findSourceRecord(slug);

  if (!source) {
    return { title: "Source not found — Claimer" };
  }

  const description = `${source.name} has ${source.claimCount} source-backed claim assessments on Claimer with a ${source.signalScore}/100 signal score and ${source.averageAttributionScore}% average attribution accuracy.`;
  const pageUrl = `${siteUrl}/sources/${source.slug}/`;

  return {
    title: `${source.name} Source Reputation`,
    description,
    openGraph: {
      title: `${source.name} Source Reputation — Claimer`,
      description,
      type: "website",
      url: pageUrl,
      siteName: "Claimer",
      locale: "en_US"
    },
    twitter: {
      card: "summary",
      title: `${source.name} Source Reputation — Claimer`,
      description
    },
    alternates: {
      canonical: pageUrl
    }
  };
}

export default async function SourceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const source = findSourceRecord(slug);

  if (!source) {
    notFound();
  }

  const pageUrl = `${siteUrl}/sources/${source.slug}/`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${source.name} Source Reputation`,
    url: pageUrl,
    mainEntity: {
      "@type": "Organization",
      name: source.name,
      url: source.latestSourceUrl
    },
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl
    }
  };

  return (
    <article className="detail standalone source-detail">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link className="button compact" href="/sources">
        Back to sources
      </Link>

      <div className="detail-heading">
        <div>
          <p className="eyebrow">Source reputation</p>
          <h1>{source.name}</h1>
        </div>
      </div>

      <p>
        {source.claimCount} claim{source.claimCount === 1 ? "" : "s"} in the
        Claimer corpus cite this source. Signals are computed from source
        quality, attribution accuracy, veracity assessment, and evidence depth.
      </p>

      <section className="metric-strip source-score-strip" aria-label="Source scores">
        <div>
          <strong>{source.signalScore}</strong>
          <span>signal score</span>
        </div>
        <div>
          <strong>{source.averageAttributionScore}%</strong>
          <span>avg attribution</span>
        </div>
        <div>
          <strong>{source.averageVeracityScore}%</strong>
          <span>avg veracity</span>
        </div>
      </section>

      <section className="source-facts" aria-label="Source facts">
        <div>
          <span>Claims</span>
          <strong>{source.claimCount}</strong>
        </div>
        <div>
          <span>Evidence entries</span>
          <strong>{source.evidenceCount}</strong>
        </div>
        <div>
          <span>Primary/direct sources</span>
          <strong>{source.highQualityClaimCount}</strong>
        </div>
        <div>
          <span>Domains</span>
          <strong>{source.domains.join(", ")}</strong>
        </div>
      </section>

      <section className="panel" aria-labelledby="quality-title">
        <h2 id="quality-title">Source quality mix</h2>
        <div className="topic-card-stats">
          {source.qualityMix.map((entry) => (
            <span key={entry.quality}>
              {entry.count} {entry.quality}
            </span>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="source-claims-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Claim history</p>
            <h2 id="source-claims-title">Claims citing {source.name}</h2>
          </div>
          <a href={source.latestSourceUrl} rel="noreferrer" target="_blank">
            Latest cited source
          </a>
        </div>

        <div className="source-claim-list">
          {source.claims.map((claim) => {
            const counts = evidenceCounts(claim);
            const evidenceTotal = counts.support + counts.challenge + counts.context;

            return (
              <article className="claim-card source-claim" key={claim.id}>
                <div className="claim-card-meta">
                  <span className="claim-domain">{claim.domain}</span>
                  <span>{claim.sourceQuality}</span>
                  <span>{new Date(claim.createdAt).toLocaleDateString("en-US")}</span>
                </div>
                <h3>
                  <Link href={`/claims/${claim.id}`}>{claim.title}</Link>
                </h3>
                <p>{claim.body}</p>
                <div className="claim-score-row">
                  <span>{claim.attributionScore}% attribution</span>
                  <span>{claim.veracityScore}% veracity</span>
                  <span>{evidenceTotal} evidence</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </article>
  );
}
