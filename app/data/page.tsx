import type { Metadata } from "next";
import Link from "next/link";
import { evidenceCounts, seedClaims } from "../../lib/claims";
import { siteUrl } from "../../lib/site";
import { sourceRecords } from "../../lib/source-reputation";

const pageUrl = `${siteUrl}/data/`;
const latestClaim = [...seedClaims].sort(
  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
)[0];

export const metadata: Metadata = {
  title: "Data Exports",
  description:
    "Download Claimer's public claim pack, feeds, embed widgets, and crawler map for source-backed claim assessment.",
  openGraph: {
    title: "Data Exports - Claimer",
    description:
      "Machine-readable claim, source, evidence, feed, and embed surfaces for Claimer.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Data Exports - Claimer",
    description:
      "Machine-readable claim, source, evidence, feed, and embed surfaces for Claimer."
  },
  alternates: {
    canonical: pageUrl
  }
};

const dataProducts = [
  {
    label: "JSON",
    title: "Claim pack",
    body:
      "Structured claims with attribution scores, veracity scores, source URLs, evidence entries, and embeddable URLs.",
    href: `${siteUrl}/api/claims.json`
  },
  {
    label: "RSS",
    title: "Latest claims feed",
    body:
      "A standard RSS feed for readers, bots, and community moderators watching new claim assessments.",
    href: `${siteUrl}/feed.xml`
  },
  {
    label: "JSON Feed",
    title: "Latest claims as JSON Feed",
    body:
      "A JSON Feed 1.1 version of the latest claim stream with source and score metadata.",
    href: `${siteUrl}/feed.json`
  },
  {
    label: "HTML",
    title: "Embeddable claim widgets",
    body:
      "Static widgets for sharing individual claim assessments with source and evidence links.",
    href: latestClaim
      ? `${siteUrl}/widgets/claims/${latestClaim.id}.html`
      : `${siteUrl}/embed/`
  },
  {
    label: "TXT",
    title: "LLM crawler map",
    body:
      "A concise plain-text guide to Claimer's public pages, feeds, and claim corpus.",
    href: `${siteUrl}/llms.txt`
  }
];

function totalEvidence() {
  return seedClaims.reduce((sum, claim) => {
    const counts = evidenceCounts(claim);
    return sum + counts.support + counts.challenge + counts.context;
  }, 0);
}

export default function DataPage() {
  const evidenceTotal = totalEvidence();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Claimer public claim pack",
    description:
      "Public source-backed claim assessments with attribution, veracity, source, and evidence metadata.",
    url: pageUrl,
    distribution: dataProducts.map((item) => ({
      "@type": "DataDownload",
      name: item.title,
      contentUrl: item.href
    })),
    creator: {
      "@type": "Organization",
      name: "Claimer",
      url: siteUrl
    },
    isAccessibleForFree: true,
    dateModified: new Date().toISOString()
  };

  return (
    <section className="stack">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="hero compact-hero">
        <p className="eyebrow">Public data</p>
        <h1>Data exports</h1>
        <p>
          Claimer publishes claim, evidence, source, feed, and widget surfaces so
          reviewers can inspect the corpus without scraping pages.
        </p>
      </div>

      <section className="metric-strip" aria-label="Public data metrics">
        <div>
          <strong>{seedClaims.length}</strong>
          <span>claims</span>
        </div>
        <div>
          <strong>{evidenceTotal}</strong>
          <span>evidence entries</span>
        </div>
        <div>
          <strong>{sourceRecords.length}</strong>
          <span>sources</span>
        </div>
      </section>

      <section className="panel" aria-labelledby="data-products-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Exports</p>
            <h2 id="data-products-title">Machine-readable surfaces</h2>
          </div>
          <Link href="/claims">Browse claims</Link>
        </div>

        <div className="grid">
          {dataProducts.map((item) => (
            <article className="card claim-card" key={item.href}>
              <span className="claim-domain">{item.label}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
              <a href={item.href}>Open export</a>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner">
        <h2>Use the data to review, embed, or monitor claims</h2>
        <p>
          Every exported claim keeps its source URL, attribution score, veracity
          score, evidence stance, and automated-analysis disclosure.
        </p>
        <div className="actions">
          <a className="button primary" href={`${siteUrl}/api/claims.json`}>
            Download claim pack
          </a>
          <Link className="button" href="/embed">
            Embed a claim
          </Link>
        </div>
      </section>
    </section>
  );
}
