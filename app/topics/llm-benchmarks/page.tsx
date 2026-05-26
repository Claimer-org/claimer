import type { Metadata } from "next";
import Link from "next/link";
import { seedClaims, evidenceCounts, type Claim } from "../../../lib/claims";
import { siteUrl } from "../../../lib/site";

const pageUrl = `${siteUrl}/topics/llm-benchmarks/`;

export const metadata: Metadata = {
  title: "LLM Benchmark Claims — AI Model Performance Fact Check",
  description:
    "Fact-check claims about LLM benchmarks, model comparisons, and AI performance metrics. Source-backed evidence on GPT-4o, Claude 3.5, Gemini, Llama, and other AI model evaluation claims.",
  openGraph: {
    title: "LLM Benchmark Claims — AI Model Performance Fact Check",
    description:
      "Fact-check claims about LLM benchmarks and AI model performance with source-backed community evidence.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "LLM Benchmark Claims — Claimer",
    description:
      "Source-backed fact-checking for LLM benchmark and model performance claims.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

function isBenchmarkClaim(claim: Claim): boolean {
  return /\b(benchmark|score|performance|accuracy|evaluation|MMLU|HumanEval|GPQA|ARC|HellaSwag|TruthfulQA|comparison|outperform|surpass|state.of.the.art|SOTA|test|exam|rank|leaderboard|capability|pass rate|coding|math|reasoning)\b/i.test(
    claim.title + " " + claim.body
  );
}

export default function LlmBenchmarksPage() {
  const claims = seedClaims.filter(isBenchmarkClaim);
  const totalEvidence = claims.reduce((sum, c) => {
    const counts = evidenceCounts(c);
    return sum + counts.support + counts.challenge + counts.context;
  }, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "LLM Benchmark Claims Fact Check",
    description:
      "Fact-check claims about LLM benchmarks and AI model performance with source-backed evidence.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl,
    },
    about: {
      "@type": "Thing",
      name: "LLM Benchmarks and AI Model Performance",
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
          <h1>LLM Benchmark & Performance Claims</h1>
        </div>
      </div>

      <div className="topic-intro">
        <p>
          Every major AI release comes with bold benchmark claims — &quot;state
          of the art,&quot; &quot;surpasses GPT-4,&quot; &quot;human-level
          reasoning.&quot; But how reliable are these numbers? This page tracks{" "}
          {claims.length} community-assessed claims about model performance,
          benchmark scores, and capability evaluations, each backed by traceable
          source links.
        </p>
        <p>
          From MMLU and HumanEval to custom coding and math benchmarks, every
          claim is scored on <strong>attribution accuracy</strong> (did the
          company really claim these numbers?) and <strong>veracity</strong> (do
          independent evaluations support the claim?). Inspect the evidence chain
          and decide for yourself.
        </p>
      </div>

      <section className="metric-strip" aria-label="Topic statistics">
        <div>
          <strong>{claims.length}</strong>
          <span>benchmark claims tracked</span>
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
            No benchmark claims match yet — this topic will grow as the
            community adds claims about model evaluations and performance
            metrics. <Link href="/submit">Submit the first one →</Link>
          </p>
        </div>
      )}

      <section className="cta-banner">
        <h2>Spotted a dubious benchmark claim?</h2>
        <p>
          Submit it with a source link and let the community assess whether the
          numbers hold up.
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
