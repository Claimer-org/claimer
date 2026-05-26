import type { Metadata } from "next";
import Link from "next/link";
import { evidenceCounts, seedClaims } from "../../lib/claims";

export const metadata: Metadata = {
  title: "Embed Claimer Claims",
  description:
    "Embed source-backed claim assessment cards on your website, blog, or article. Copy one line of HTML to show live Claimer scores.",
  openGraph: {
    title: "Embed Claimer Claims on Your Site",
    description:
      "Add interactive claim assessment cards to any webpage with a single HTML snippet."
  }
};

const baseUrl = "https://claimer-org.github.io/claimer";

const exampleClaimId = "openai-gpt-4o-launch";
const exampleWidgetUrl = `${baseUrl}/widgets/claims/${exampleClaimId}.html`;
const exampleClaimUrl = `${baseUrl}/claims/${exampleClaimId}/`;
const jsonFeedUrl = `${baseUrl}/api/claims.json`;
const rssFeedUrl = `${baseUrl}/feed.xml`;

const iframeSnippet = `<iframe
  src="${exampleWidgetUrl}"
  width="100%" height="340"
  style="border:0;border-radius:10px;max-width:620px;"
  title="Claimer claim assessment"
  loading="lazy">
</iframe>`;

const linkSnippet = `<a href="${exampleClaimUrl}"
   target="_blank" rel="noopener noreferrer"
   style="display:inline-flex;align-items:center;gap:6px;
   padding:8px 16px;border-radius:8px;
   background:#111827;color:#e8ecf4;
   font-family:system-ui;font-size:14px;
   text-decoration:none;border:1px solid rgba(255,255,255,0.1);">
  View claim assessment on Claimer
</a>`;

const jsonSnippet = `fetch("${jsonFeedUrl}")
  .then((response) => response.json())
  .then((pack) => {
    console.log(pack.count + " Claimer claims available");
    console.log(pack.claims[0].embedUrl);
  });`;

const featuredClaims = seedClaims.slice(-3).reverse();

export default function EmbedPage() {
  return (
    <section className="stack">
      <div className="hero compact-hero">
        <p className="eyebrow">Distribution toolkit</p>
        <h1>Embed Claimer</h1>
        <p>
          Add source-backed claim assessment cards to your website, blog, or
          article. Each embed links back to the full evidence chain on Claimer.
        </p>
      </div>

      <section className="panel" aria-labelledby="iframe-title">
        <h2 id="iframe-title">Option 1: Embed card</h2>
        <p style={{ color: "var(--foreground-dim)", marginBottom: 16 }}>
          Shows a generated claim summary card with attribution score, veracity
          score, source counts, and a link back to the full evidence chain.
        </p>
        <div className="code-block">
          <pre>
            <code>{iframeSnippet}</code>
          </pre>
        </div>
        <p style={{ fontSize: "0.85rem", color: "var(--foreground-dim)", marginTop: 12 }}>
          Replace <code>{exampleClaimId}</code> with any claim ID from the JSON
          feed or a Claimer claim URL.
        </p>
      </section>

      <section className="panel" aria-labelledby="featured-embeds-title">
        <div className="section-heading">
          <h2 id="featured-embeds-title">Ready-to-share cards</h2>
          <a href={jsonFeedUrl} rel="noreferrer" target="_blank">
            Open JSON feed
          </a>
        </div>
        <div className="grid">
          {featuredClaims.map((claim) => {
            const counts = evidenceCounts(claim);
            return (
              <article className="card claim-card" key={claim.id}>
                <span className="claim-domain">{claim.domain}</span>
                <h3>{claim.title}</h3>
                <p>
                  {claim.veracityScore}% veracity / {counts.support} support /{" "}
                  {counts.challenge} challenge
                </p>
                <div className="mission-actions">
                  <a
                    className="button primary compact"
                    href={`${baseUrl}/widgets/claims/${claim.id}.html`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open card
                  </a>
                  <Link className="button compact" href={`/claims/${claim.id}`}>
                    Full claim
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel" aria-labelledby="link-title">
        <h2 id="link-title">Option 2: Link button</h2>
        <p style={{ color: "var(--foreground-dim)", marginBottom: 16 }}>
          A styled link button that directs readers to the full claim page.
          Lighter weight than the iframe.
        </p>
        <div className="code-block">
          <pre>
            <code>{linkSnippet}</code>
          </pre>
        </div>
      </section>

      <section className="panel" aria-labelledby="api-title">
        <h2 id="api-title">Option 3: data feeds</h2>
        <p style={{ color: "var(--foreground-dim)", marginBottom: 16 }}>
          All seed claim data is exported as static JSON at build time, and the
          latest claims are available as RSS for feed readers and directories.
        </p>
        <div className="code-block">
          <pre>
            <code>{jsonSnippet}</code>
          </pre>
        </div>
        <div className="actions" style={{ marginTop: 16 }}>
          <a className="button compact" href={jsonFeedUrl} rel="noreferrer" target="_blank">
            Open JSON
          </a>
          <a className="button compact" href={rssFeedUrl} rel="noreferrer" target="_blank">
            Open RSS
          </a>
        </div>
      </section>

      <section className="panel" aria-labelledby="guidelines-title">
        <h2 id="guidelines-title">Embed guidelines</h2>
        <div className="grid">
          <article className="card">
            <h3>Do</h3>
            <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
              <li>Use embeds alongside your own original reporting</li>
              <li>Link to the full claim page for complete evidence chains</li>
              <li>Disclose that scores are community assessments, not verdicts</li>
              <li>Keep the embed visible and unobstructed</li>
            </ul>
          </article>
          <article className="card">
            <h3>Don&apos;t</h3>
            <ul style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
              <li>Modify Claimer scores or labels in your display</li>
              <li>Present community assessments as definitive fact-checks</li>
              <li>Strip attribution or source links from embeds</li>
              <li>Use embeds to target private individuals</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Need a custom integration?</h2>
        <p>
          Claimer is open-source and community-driven. Reach out with custom
          embed requests or data partnership proposals.
        </p>
        <div className="actions">
          <Link className="button primary" href="/about">
            About Claimer
          </Link>
          <Link className="button" href="/feedback">
            Send feedback
          </Link>
        </div>
      </section>
    </section>
  );
}
