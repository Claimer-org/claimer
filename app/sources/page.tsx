import type { Metadata } from "next";
import Link from "next/link";
import { sourceRecords } from "../../lib/source-reputation";
import { siteUrl } from "../../lib/site";

const pageUrl = `${siteUrl}/sources/`;

export const metadata: Metadata = {
  title: "Source Reputation",
  description:
    "Browse source reputation signals across Claimer claims, including source quality, attribution accuracy, veracity scores, and evidence coverage.",
  openGraph: {
    title: "Source Reputation — Claimer",
    description:
      "Source-level reputation signals built from Claimer's source-backed claim assessments.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Source Reputation — Claimer",
    description:
      "Browse source-level signals from public claim assessments and evidence chains."
  },
  alternates: {
    canonical: pageUrl
  }
};

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function SourcesPage() {
  const totalClaims = sourceRecords.reduce((sum, source) => sum + source.claimCount, 0);
  const totalEvidence = sourceRecords.reduce((sum, source) => sum + source.evidenceCount, 0);
  const highQualityClaims = sourceRecords.reduce(
    (sum, source) => sum + source.highQualityClaimCount,
    0
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Source Reputation",
    description:
      "Source-level reputation signals built from source-backed public claim assessments.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: sourceRecords.length,
      itemListElement: sourceRecords.map((source, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: source.name,
        url: `${siteUrl}/sources/${source.slug}/`
      }))
    }
  };

  return (
    <section className="stack source-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="hero compact-hero">
        <p className="eyebrow">Source reputation</p>
        <h1>Sources</h1>
        <p>
          Publisher and primary-source signals calculated from attribution
          quality, claim veracity, source quality, and attached evidence.
        </p>
      </div>

      <section className="metric-strip" aria-label="Source directory metrics">
        <div>
          <strong>{sourceRecords.length}</strong>
          <span>sources tracked</span>
        </div>
        <div>
          <strong>{totalClaims}</strong>
          <span>claims mapped</span>
        </div>
        <div>
          <strong>{percent(highQualityClaims / totalClaims)}</strong>
          <span>primary or direct</span>
        </div>
      </section>

      <section className="panel" aria-labelledby="source-directory-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Directory</p>
            <h2 id="source-directory-title">Ranked by signal quality</h2>
          </div>
          <Link href="/claims">All claims</Link>
        </div>

        <div className="source-grid">
          {sourceRecords.map((source) => (
            <Link
              className="card source-card"
              href={`/sources/${source.slug}`}
              key={source.slug}
            >
              <div className="source-card-heading">
                <span className="claim-domain">{source.name}</span>
                <strong>{source.signalScore}</strong>
              </div>
              <h3>{source.latestSourceTitle}</h3>
              <p>
                {source.claimCount} claim{source.claimCount === 1 ? "" : "s"} ·{" "}
                {source.evidenceCount} evidence entr
                {source.evidenceCount === 1 ? "y" : "ies"} ·{" "}
                {percent(source.qualityShare)} primary/direct source quality
              </p>
              <div className="claim-score-row">
                <span>{source.averageAttributionScore}% attribution</span>
                <span>{source.averageVeracityScore}% veracity</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>{totalEvidence} evidence entries are connected to these sources</h2>
        <p>
          Source records update automatically as new claims and evidence are
          added.
        </p>
        <div className="actions">
          <Link className="button primary" href="/review">
            Add evidence
          </Link>
          <Link className="button" href="/submit">
            Submit a claim
          </Link>
        </div>
      </section>
    </section>
  );
}
