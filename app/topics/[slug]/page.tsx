import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { evidenceCounts } from "../../../lib/claims";
import {
  findTopicConfig,
  getTopicClaims,
  getTopicStats,
  topicConfigs
} from "../../../lib/topic-helpers";

const siteUrl = "https://smithmatric-boop.github.io/claimer";

export function generateStaticParams() {
  return topicConfigs.map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = findTopicConfig(slug);

  if (!topic) {
    return { title: "Topic not found - Claimer" };
  }

  const pageUrl = `${siteUrl}/topics/${topic.slug}/`;

  return {
    title: topic.headline,
    description: topic.description,
    keywords: topic.keywords,
    openGraph: {
      title: `${topic.headline} - Claimer`,
      description: topic.description,
      type: "website",
      url: pageUrl,
      siteName: "Claimer",
      locale: "en_US"
    },
    twitter: {
      card: "summary",
      title: `${topic.headline} - Claimer`,
      description: topic.summary
    },
    alternates: {
      canonical: pageUrl
    }
  };
}

export default async function TopicPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = findTopicConfig(slug);

  if (!topic) {
    notFound();
  }

  const claims = getTopicClaims(topic);
  const stats = getTopicStats(claims);
  const lowVeracityCount = claims.filter(
    (claim) => claim.veracityScore < 60
  ).length;
  const pageUrl = `${siteUrl}/topics/${topic.slug}/`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: topic.headline,
    description: topic.description,
    url: pageUrl,
    isPartOf: {
      "@type": "WebSite",
      name: "Claimer",
      url: siteUrl
    },
    about: {
      "@type": "Thing",
      name: topic.aboutName
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: claims.length,
      itemListElement: claims.slice(0, 20).map((claim, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteUrl}/claims/${claim.id}/`,
        name: claim.title
      }))
    }
  };

  return (
    <article className="detail standalone topic-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link className="button compact" href="/topics">
        Back to topics
      </Link>

      <div className="detail-heading">
        <div>
          <p className="eyebrow">Topic</p>
          <h1>{topic.headline}</h1>
        </div>
      </div>

      <div className="topic-intro">
        {topic.intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section className="metric-strip" aria-label="Topic statistics">
        <div>
          <strong>{stats.claimCount}</strong>
          <span>{topic.metricLabel}</span>
        </div>
        <div>
          <strong>{stats.evidenceCount}</strong>
          <span>source-backed evidence entries</span>
        </div>
        <div>
          <strong>{lowVeracityCount}</strong>
          <span>claims below 60% veracity</span>
        </div>
      </section>

      <div className="topic-keywords" aria-label="Topic keywords">
        {topic.keywords.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>

      <div className="grid topic-grid">
        {claims.map((claim) => {
          const counts = evidenceCounts(claim);
          const evidenceTotal =
            counts.support + counts.challenge + counts.context;
          const isLowVeracity = claim.veracityScore < 60;

          return (
            <article
              className={`card claim-card${isLowVeracity ? " disputed" : ""}`}
              key={claim.id}
            >
              <div className="claim-card-meta">
                <span className="claim-domain">{claim.domain}</span>
                {isLowVeracity && (
                  <span className="debate-badge disputed">Low veracity</span>
                )}
              </div>
              <h2>{claim.title}</h2>
              <p>{claim.veracityLabel}</p>
              <div className="claim-score-row">
                <span>Attribution: {claim.attributionScore}%</span>
                <span>Veracity: {claim.veracityScore}%</span>
              </div>
              <Link href={`/claims/${claim.id}`}>
                Open claim ({evidenceTotal} evidence entries)
              </Link>
            </article>
          );
        })}
      </div>

      <section className="cta-banner">
        <h2>Add evidence to this topic</h2>
        <p>
          Submit a sourced claim or add support, challenge, or context evidence
          to improve the community assessment.
        </p>
        <div className="actions">
          <Link className="button primary" href="/submit">
            Submit a claim
          </Link>
          <Link className="button" href="/review">
            Review evidence
          </Link>
          <Link className="button" href="/claims">
            Browse all claims
          </Link>
        </div>
      </section>
    </article>
  );
}
