import type { Metadata } from "next";
import Link from "next/link";
import { seedClaims, evidenceCounts, type Claim } from "../../../lib/claims";

const siteUrl = "https://claimer-org.github.io/claimer";
const pageUrl = `${siteUrl}/topics/tech-verification/`;

export const metadata: Metadata = {
  title: "Technology Claim Verification — Source-Backed Tech Fact Checks",
  description:
    "Verify technology claims with traceable evidence. Community-assessed claims about semiconductors, quantum computing, cybersecurity, and hardware with transparent two-sided scoring.",
  openGraph: {
    title: "Technology Claim Verification — Source-Backed Tech Fact Checks",
    description:
      "Verify technology claims with traceable evidence. Community-assessed claims about semiconductors, quantum computing, and more.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Technology Claim Verification — Claimer",
    description:
      "Source-backed verification for technology claims. Transparent evidence and community scoring.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

function isTechVerificationClaim(claim: Claim): boolean {
  return (
    claim.domain === "technology" ||
    /\b(chip|semiconductor|quantum|hardware|manufacturing|robot|device|processor|breach|outage|TSMC|NVIDIA|SpaceX|Neuralink)\b/i.test(
      claim.title + " " + claim.body
    )
  );
}

export default function TechVerificationPage() {
  const claims = seedClaims.filter(isTechVerificationClaim);
  const totalEvidence = claims.reduce((sum, c) => {
    const counts = evidenceCounts(c);
    return sum + counts.support + counts.challenge + counts.context;
  }, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Technology Claim Verification",
    description:
      "Verify technology claims with traceable evidence and community-assessed scoring.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl,
    },
    about: {
      "@type": "Thing",
      name: "Technology Claims Verification",
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
          <h1>Technology Claim Verification</h1>
        </div>
      </div>

      <div className="topic-intro">
        <p>
          From TSMC&rsquo;s chip manufacturing timelines to SpaceX&rsquo;s reentry
          milestones, technology announcements often mix genuine breakthroughs
          with marketing optimism. This page tracks {claims.length}{" "}
          technology claims that have been submitted to the Claimer community for
          independent verification.
        </p>
        <p>
          Each claim is scored on two independent dimensions:{" "}
          <strong>attribution accuracy</strong> verifies whether the original
          source actually made the stated claim, while{" "}
          <strong>veracity</strong> evaluates whether the claim itself is
          substantiated by evidence. Community members contribute support,
          challenge, and context evidence — all with traceable source links.
        </p>
      </div>

      <section className="metric-strip" aria-label="Topic statistics">
        <div>
          <strong>{claims.length}</strong>
          <span>tech claims verified</span>
        </div>
        <div>
          <strong>{totalEvidence}</strong>
          <span>evidence entries</span>
        </div>
        <div>
          <strong>2</strong>
          <span>scoring dimensions</span>
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

      <section className="cta-banner">
        <h2>Found a technology claim that needs verification?</h2>
        <p>
          Add it with a traceable source and help the community separate fact
          from hype.
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
