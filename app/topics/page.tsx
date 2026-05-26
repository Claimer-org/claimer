import type { Metadata } from "next";
import Link from "next/link";
import { seedClaims, evidenceCounts } from "../../lib/claims";

const siteUrl = "https://smithmatric-boop.github.io/claimer";
const pageUrl = `${siteUrl}/topics/`;

export const metadata: Metadata = {
  title: "Claim Topics — Browse AI & Tech Claims by Category",
  description:
    "Explore fact-checked AI and technology claims organized by topic. Browse AI model claims, safety debates, regulation policy, LLM benchmarks, and tech verification — all with source-backed evidence.",
  openGraph: {
    title: "Claim Topics — Browse AI & Tech Claims by Category",
    description:
      "Explore fact-checked AI and technology claims organized by topic with source-backed community evidence.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Claim Topics — Claimer",
    description:
      "Browse AI and tech claims by category with transparent evidence and scoring.",
  },
  alternates: {
    canonical: pageUrl,
  },
};

const topics = [
  {
    slug: "ai-claims",
    title: "AI Claims",
    emoji: "🤖",
    description:
      "Claims about AI models, capabilities, and company announcements from OpenAI, Anthropic, Google, Meta, and more.",
  },
  {
    slug: "ai-safety",
    title: "AI Safety",
    emoji: "🛡️",
    description:
      "Claims about AI alignment, existential risk, safety measures, and responsible AI development practices.",
  },
  {
    slug: "ai-regulation",
    title: "AI Regulation & Policy",
    emoji: "⚖️",
    description:
      "Claims about government AI regulation, legislation, policy debates, and governance frameworks worldwide.",
  },
  {
    slug: "llm-benchmarks",
    title: "LLM Benchmarks",
    emoji: "📊",
    description:
      "Claims about model performance, benchmark scores, capability evaluations, and cross-model comparisons.",
  },
  {
    slug: "tech-verification",
    title: "Tech Verification",
    emoji: "🔍",
    description:
      "Claims about technology products, launches, user metrics, partnerships, and industry developments.",
  },
];

export default function TopicsPage() {
  const totalClaims = seedClaims.length;
  const totalEvidence = seedClaims.reduce((sum, c) => {
    const counts = evidenceCounts(c);
    return sum + counts.support + counts.challenge + counts.context;
  }, 0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Claim Topics",
    description:
      "Browse AI and technology claims by category with source-backed evidence.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: topics.length,
      itemListElement: topics.map((topic, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${siteUrl}/topics/${topic.slug}/`,
        name: topic.title,
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
          <p className="eyebrow">Browse</p>
          <h1>Claim Topics</h1>
        </div>
      </div>

      <div className="topic-intro">
        <p>
          Explore {totalClaims} source-backed AI and technology claims organized
          by topic. Each category features community-assessed claims with{" "}
          {totalEvidence} total evidence entries, transparent scoring on
          attribution accuracy and veracity, and traceable source links.
        </p>
      </div>

      <div className="grid">
        {topics.map((topic) => (
          <Link
            href={`/topics/${topic.slug}`}
            key={topic.slug}
            className="card topic-card"
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "8px" }}>
              {topic.emoji}
            </div>
            <h3>{topic.title}</h3>
            <p>{topic.description}</p>
            <span
              className="button"
              style={{ marginTop: "auto", alignSelf: "flex-start" }}
            >
              Browse claims →
            </span>
          </Link>
        ))}
      </div>

      <section className="cta-banner">
        <h2>Don&apos;t see your topic?</h2>
        <p>
          Submit a claim in any category and we&apos;ll grow the coverage based
          on community interest.
        </p>
        <div className="actions">
          <Link className="button primary" href="/submit">
            Submit a claim
          </Link>
          <Link className="button" href="/claims">
            Browse all claims
          </Link>
        </div>
      </section>
    </section>
  );
}
