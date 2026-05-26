import type { Metadata } from "next";
import Link from "next/link";
import { seedClaims, evidenceCounts, type Claim } from "../../../lib/claims";

const siteUrl = "https://claimer-org.github.io/claimer";
const pageUrl = `${siteUrl}/topics/ai-safety/`;

export const metadata: Metadata = {
  title: "AI Safety Claims — Evidence-Based Safety & Risk Assessment",
  description:
    "Examine AI safety claims with community-verified evidence. Track claims about deepfakes, AI energy consumption, job displacement, responsible scaling, content authenticity, and more.",
  openGraph: {
    title: "AI Safety Claims — Evidence-Based Safety & Risk Assessment",
    description:
      "Examine AI safety claims with community-verified evidence. Track deepfakes, energy, jobs, and responsible scaling claims.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "AI Safety Claims — Claimer",
    description:
      "Community-assessed AI safety claims with transparent evidence chains.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

function isAiSafetyClaim(claim: Claim): boolean {
  return /\b(safety|safe|risk|deepfake|energy|privacy|bias|alignment|responsible|scaling|displacement|job|worker|integrity|encyclical|disarm|surveillance|tracking|breach|content.*(generat|detect)|academic integrity)\b/i.test(
    claim.title + " " + claim.body
  );
}

export default function AiSafetyPage() {
  const claims = seedClaims.filter(isAiSafetyClaim);
  const totalEvidence = claims.reduce((sum, c) => {
    const counts = evidenceCounts(c);
    return sum + counts.support + counts.challenge + counts.context;
  }, 0);

  const highDisputeCount = claims.filter(
    (c) => c.veracityScore < 60
  ).length;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Safety Claims",
    description:
      "Evidence-based assessment of AI safety and risk claims.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl,
    },
    about: {
      "@type": "Thing",
      name: "AI Safety and Risk Assessment",
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
          <h1>AI Safety Claims</h1>
        </div>
      </div>

      <div className="topic-intro">
        <p>
          AI safety is one of the most consequential — and most contested —
          topics in technology today. Claims about deepfake detection failures,
          AI-driven job displacement, energy consumption of training runs, and
          responsible scaling commitments shape public policy and investment
          decisions. But many of these claims lack rigorous verification.
        </p>
        <p>
          This page collects {claims.length} safety-related claims assessed by
          the Claimer community. Each includes an evidence chain with support
          and challenge sources so you can evaluate the strength of the
          underlying evidence yourself. Of these claims, {highDisputeCount} have
          veracity scores below 60%, indicating significant dispute or
          insufficient evidence.
        </p>
      </div>

      <section className="metric-strip" aria-label="Topic statistics">
        <div>
          <strong>{claims.length}</strong>
          <span>safety claims tracked</span>
        </div>
        <div>
          <strong>{totalEvidence}</strong>
          <span>evidence entries</span>
        </div>
        <div>
          <strong>{highDisputeCount}</strong>
          <span>claims below 60% veracity</span>
        </div>
      </section>

      <div className="grid">
        {claims.map((claim) => {
          const counts = evidenceCounts(claim);
          const isLowVeracity = claim.veracityScore < 60;
          return (
            <article
              className={`card claim-card${isLowVeracity ? " disputed" : ""}`}
              key={claim.id}
            >
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span className="claim-domain">{claim.domain}</span>
                {isLowVeracity && (
                  <span className="debate-badge disputed">Low veracity</span>
                )}
              </div>
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
        <h2>Concerned about an AI safety claim?</h2>
        <p>
          Submit the claim with a source link and help the community build an
          evidence-based picture.
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
