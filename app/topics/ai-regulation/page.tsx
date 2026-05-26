import type { Metadata } from "next";
import Link from "next/link";
import { seedClaims, evidenceCounts, type Claim } from "../../../lib/claims";

const siteUrl = "https://claimer-org.github.io/claimer";
const pageUrl = `${siteUrl}/topics/ai-regulation/`;

export const metadata: Metadata = {
  title: "AI Regulation Claims — Government Policy & AI Law Fact Check",
  description:
    "Track and fact-check claims about AI regulation, government policy, and tech legislation. Source-backed evidence on EU AI Act, US executive orders, federal vs state regulation, and AI governance debates.",
  openGraph: {
    title: "AI Regulation Claims — Government Policy & AI Law Fact Check",
    description:
      "Track and fact-check claims about AI regulation, government policy, and tech legislation with source-backed community evidence.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "AI Regulation Claims — Claimer",
    description:
      "Source-backed fact-checking for AI regulation and policy claims.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

function isRegulationClaim(claim: Claim): boolean {
  return /\b(regulat|legislat|government|policy|law|executive order|EU AI Act|Congress|Senate|FTC|compliance|ban|moratorium|federal|state law|governance)\b/i.test(
    claim.title + " " + claim.body
  );
}

export default function AiRegulationPage() {
  const claims = seedClaims.filter(isRegulationClaim);
  const totalEvidence = claims.reduce((sum, c) => {
    const counts = evidenceCounts(c);
    return sum + counts.support + counts.challenge + counts.context;
  }, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Regulation Claims Fact Check",
    description:
      "Fact-check claims about AI regulation and government policy with source-backed evidence.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl,
    },
    about: {
      "@type": "Thing",
      name: "AI Regulation and Policy",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: claims.length,
      itemListElement: claims.slice(0, 10).map((claim, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/claims/${claim.id}/`,
        name: claim.title,
      })),
    },
  };

  return (
    <section className="standalone">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="detail-heading">
        <div>
          <p className="eyebrow">Topic</p>
          <h1>AI Regulation & Policy Claims</h1>
        </div>
      </div>

      <div className="topic-intro">
        <p>
          Governments worldwide are racing to regulate artificial intelligence,
          but claims about what&apos;s being regulated — and whether regulations
          will work — are often misleading or overstated. This page tracks{" "}
          {claims.length} community-assessed claims about AI regulation, policy
          debates, and legislative developments, each backed by traceable source
          URLs.
        </p>
        <p>
          From the EU AI Act to US federal vs. state regulatory battles, every
          claim is scored on <strong>attribution accuracy</strong> and{" "}
          <strong>veracity</strong>. Browse the evidence, add your own sources,
          and help build a transparent record of AI governance claims.
        </p>
      </div>

      <section className="metric-strip" aria-label="Topic statistics">
        <div>
          <strong>{claims.length}</strong>
          <span>regulation claims tracked</span>
        </div>
        <div>
          <strong>{totalEvidence}</strong>
          <span>source-backed evidence entries</span>
        </div>
        <div>
          <strong>2</strong>
          <span>independent scoring dimensions</span>
        </div>
      </section>

      <div className="grid">
        {claims.map((claim) => {
          const counts = evidenceCounts(claim);
          return (
            <article className="card claim-card" key={claim.id}>
              <span className="claim-domain">{claim.domain}</span>
              <h3>{claim.title}</h3>
              <p>{claim.veracityLabel}</p>
              <div style={{ display: "flex", gap: "12px", fontSize: "0.85rem" }}>
                <span>Attribution: {claim.attributionScore}%</span>
                <span>Veracity: {claim.veracityScore}%</span>
              </div>
              <Link href={`/claims/${claim.id}`}>
                {counts.support + counts.challenge + counts.context} evidence
                entries →
              </Link>
            </article>
          );
        })}
      </div>

      {claims.length === 0 && (
        <div className="topic-intro">
          <p>
            No regulation claims match yet — this topic will grow as the
            community adds claims about AI governance, policy, and legislation.{" "}
            <Link href="/submit">Submit the first one →</Link>
          </p>
        </div>
      )}

      <section className="cta-banner">
        <h2>Know an AI regulation claim that needs fact-checking?</h2>
        <p>
          Submit it with a source link and let the community assess the evidence.
        </p>
        <div className="actions">
          <Link className="button primary" href="/submit">
            Submit a claim
          </Link>
          <Link className="button" href="/claims">
            Browse all claims
          </Link>
          <Link className="button" href="/review">
            Review evidence
          </Link>
        </div>
      </section>
    </section>
  );
}
