import type { Metadata } from "next";
import Link from "next/link";
import {
  getTopicClaims,
  getTopicStats,
  topicConfigs
} from "../../lib/topic-helpers";

const siteUrl = "https://smithmatric-boop.github.io/claimer";
const pageUrl = `${siteUrl}/topics/`;

export const metadata: Metadata = {
  title: "Claim Topics",
  description:
    "Browse Claimer topics for AI claims, LLM benchmarks, AI safety, AI regulation, and technology verification.",
  openGraph: {
    title: "Claim Topics - Claimer",
    description:
      "Browse source-backed claim topics with transparent attribution and veracity evidence.",
    type: "website",
    url: pageUrl,
    siteName: "Claimer",
    locale: "en_US"
  },
  twitter: {
    card: "summary",
    title: "Claim Topics - Claimer",
    description:
      "Source-backed claim topics with transparent attribution and veracity evidence."
  },
  alternates: {
    canonical: pageUrl
  }
};

export default function TopicsIndexPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Claim Topics",
    description:
      "A topic index for source-backed claim assessment on Claimer.",
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: topicConfigs.length,
      itemListElement: topicConfigs.map((topic, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/topics/${topic.slug}/`,
        name: topic.title
      }))
    }
  };

  return (
    <article className="detail standalone topic-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="detail-heading">
        <div>
          <p className="eyebrow">Topics</p>
          <h1>Claim Topics</h1>
        </div>
      </div>

      <div className="topic-intro">
        <p>
          Explore Claimer by the claim areas most likely to attract repeat
          reviewers: AI products, LLM capability claims, safety risks,
          regulation, and broader technology verification.
        </p>
      </div>

      <div className="grid topic-grid">
        {topicConfigs.map((topic) => {
          const claims = getTopicClaims(topic);
          const stats = getTopicStats(claims);

          return (
            <article className="card claim-card topic-card" key={topic.slug}>
              <span className="claim-domain">Topic</span>
              <h2>{topic.title}</h2>
              <p>{topic.summary}</p>
              <div className="topic-card-stats">
                <span>{stats.claimCount} claims</span>
                <span>{stats.evidenceCount} evidence entries</span>
              </div>
              <Link href={`/topics/${topic.slug}`}>Open topic</Link>
            </article>
          );
        })}
      </div>
    </article>
  );
}
