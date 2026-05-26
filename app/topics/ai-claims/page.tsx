import type { Metadata } from "next";
import Link from "next/link";
import { seedClaims, evidenceCounts, type Claim } from "../../../lib/claims";

const siteUrl = "https://smithmatric-boop.github.io/claimer";
const pageUrl = `${siteUrl}/topics/ai-claims/`;

export const metadata: Metadata = {
  title: "AI Claims Fact Check — Verified AI Claims & Evidence",
  description:
    "Fact-check AI claims with source-backed evidence. Browse community-assessed claims about GPT-4o, Claude, Gemini, Llama, and other AI models with transparent scoring and traceable sources.",
  openGraph: {
    title: "AI Claims Fact Check — Verified AI Claims & Evidence",
    description:
      "Fact-check AI claims with source-backed evidence. Browse community-assessed claims about GPT-4o, Claude, Gemini, Llama, and other AI models.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "AI Claims Fact Check — Claimer",
    description:
      "Source-backed fact-checking for AI claims. Transparent evidence chains and community assessment.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

function isAiClaim(claim: Claim): boolean {
  return (
    claim.domain === "ai" ||
    /\b(GPT|Claude|Gemini|LLM|AI model|language model|ChatGPT|Llama|Mistral|DeepSeek|Anthropic|OpenAI)\b/i.test(
      claim.title + " " + claim.body
    )
  );
}

export default function AiClaimsPage() {
  const claims = seedClaims.filter(isAiClaim);
  const totalEvidence = claims.reduce((sum, c) => {
    const counts = evidenceCounts(c);
    return sum + counts.support + counts.challenge + counts.context;
  }, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI Claims Fact Check",
    description:
      "Fact-check AI claims with source-backed evidence and community assessment.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl,
    },
    about: {
      "@type": "Thing",
      name: "Artificial Intelligence Claims",
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
          <h1>AI Claims Fact Check</h1>
        </div>
      </div>

      <div className="topic-intro">
        <p>
          AI companies regularly make bold claims about model capabilities,
          safety measures, and real-world performance. But how many of these
          claims hold up under scrutiny? This page collects {claims.length}{" "}
          community-assessed AI claims — each backed by traceable source links
          and scored on both <strong>attribution accuracy</strong> (did the
          claimed source actually say this?) and <strong>veracity</strong> (is
          the underlying claim true?).
        </p>
        <p>
          Every claim includes an evidence chain with support, challenge, and
          context entries submitted by the community. No black-box verdicts —
          you can inspect every source and decide for yourself. Currently
          tracking {totalEvidence} evidence entries across claims from OpenAI,
          Anthropic, Google, Meta, Mistral, and more.
        </p>
      </div>

      <section className="metric-strip" aria-label="Topic statistics">
        <div>
          <strong>{claims.length}</strong>
          <span>AI claims tracked</span>
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

      <section className="cta-banner">
        <h2>Know an AI claim that needs fact-checking?</h2>
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
