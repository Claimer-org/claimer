import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Claimer — How We Assess Truth",
  description:
    "Learn how Claimer separates attribution accuracy from claim veracity using source-backed community assessment. No black-box verdicts — every score is explainable.",
  openGraph: {
    title: "About Claimer — How We Assess Truth",
    description:
      "A community-powered platform that separates who said it from whether it's true. Every claim needs a source. Every score is explainable.",
    type: "article"
  }
};

export default function AboutPage() {
  return (
    <article className="detail standalone about-page">
      <Link className="button compact" href="/">
        ← Home
      </Link>

      <div className="detail-heading">
        <div>
          <p className="eyebrow">Why Claimer exists</p>
          <h1>Truth shouldn't need gatekeepers</h1>
        </div>
      </div>

      <div className="about-intro">
        <p>
          In 2026, truth is fragmented. Fact-checkers write editorial verdicts.
          Prediction markets let you bet on outcomes. Community Notes works — but
          only on X. Source ratings grade outlets, not individual claims.
        </p>
        <p>
          <strong>No platform combines all four.</strong> Claimer does.
        </p>
      </div>

      <section className="about-section">
        <h2>The Two Dimensions</h2>
        <p>
          Every claim on Claimer has <strong>two independent scores</strong> — a
          concept no other platform implements:
        </p>
        <div className="score-grid">
          <section className="score">
            <span>Dimension 1</span>
            <strong>Attribution Accuracy</strong>
            <p>Did this person actually say this?</p>
            <small>
              Verified through the original interview, tweet, article, or
              statement. A claim can be accurately attributed but still false.
            </small>
          </section>
          <section className="score">
            <span>Dimension 2</span>
            <strong>Claim Veracity</strong>
            <p>Is what they said actually true?</p>
            <small>
              Assessed through supporting and challenging evidence from multiple
              sources. A claim can be true but misattributed.
            </small>
          </section>
        </div>
      </section>

      <section className="about-section">
        <h2>How it's different</h2>
        <div className="grid">
          <article className="card">
            <h3>vs. Fact-checkers</h3>
            <p>
              Snopes and PolitiFact use editorial teams. Claimer is
              community-driven — anyone can submit evidence. No editors deciding
              what's true.
            </p>
          </article>
          <article className="card">
            <h3>vs. Prediction markets</h3>
            <p>
              Polymarket uses money to discover truth. Claimer uses evidence and
              sources. No betting, no financial instruments — just source-backed
              reasoning.
            </p>
          </article>
          <article className="card">
            <h3>vs. Community Notes</h3>
            <p>
              X Community Notes works great — on X. Claimer is platform-agnostic.
              Any claim from any source can be assessed here.
            </p>
          </article>
          <article className="card">
            <h3>vs. Source ratings</h3>
            <p>
              NewsGuard rates outlets. Claimer rates individual claims AND tracks
              individual contributor reputation over time.
            </p>
          </article>
        </div>
      </section>

      <section className="about-section">
        <h2>Evidence quality matters</h2>
        <p>Not all sources are equal. Every piece of evidence is graded:</p>
        <div className="evidence-quality-scale">
          <div className="quality-item">
            <strong>Primary</strong>
            <span>Direct quote, original statement, the person themselves</span>
          </div>
          <div className="quality-item">
            <strong>Direct witness</strong>
            <span>Reporter present, with byline</span>
          </div>
          <div className="quality-item">
            <strong>Reputable secondary</strong>
            <span>Major outlet citing primary, with attribution</span>
          </div>
          <div className="quality-item">
            <strong>Indirect secondary</strong>
            <span>Blog/aggregator citing secondary sources</span>
          </div>
          <div className="quality-item quality-low">
            <strong>Unverifiable</strong>
            <span>Anonymous source, rumor, "sources say"</span>
          </div>
        </div>
      </section>

      <section className="about-section">
        <h2>What we are NOT</h2>
        <div className="grid">
          <article className="card">
            <p>
              ❌ <strong>Not a social network.</strong> The primary UX is
              claim-centric, not people-centric.
            </p>
          </article>
          <article className="card">
            <p>
              ❌ <strong>Not a prediction market.</strong> No financial
              instruments or betting.
            </p>
          </article>
          <article className="card">
            <p>
              ❌ <strong>Not a news site.</strong> No editorial content or
              articles.
            </p>
          </article>
          <article className="card">
            <p>
              ❌ <strong>Not a fact-checking org.</strong> The community decides,
              not editors.
            </p>
          </article>
        </div>
      </section>

      <section className="about-section">
        <h2>Transparency</h2>
        <div className="grid">
          <article className="card">
            <h3>🤖 AI disclosure</h3>
            <p>
              All AI-assisted analysis is clearly labeled. Every automated
              element is disclosed. We never hide when AI helps.
            </p>
          </article>
          <article className="card">
            <h3>📊 Explainable scores</h3>
            <p>
              No black-box verdicts. Every attribution and veracity score shows
              exactly which evidence supports it and why.
            </p>
          </article>
          <article className="card">
            <h3>🔗 Source chains</h3>
            <p>
              Every claim links to every source. Every source links to a URL.
              Nothing is hidden.
            </p>
          </article>
          <article className="card">
            <h3>⚖️ Legal framing</h3>
            <p>
              All analysis uses "evidence suggests" — never "this is true/false."
              We present evidence, not verdicts.
            </p>
          </article>
        </div>
      </section>

      <section className="cta-banner">
        <h2>Ready to assess some claims?</h2>
        <p>
          Browse 35+ AI and technology claims with source-backed evidence, or
          submit your own.
        </p>
        <div className="actions">
          <Link className="button primary" href="/claims">
            Browse claims
          </Link>
          <Link className="button" href="/submit">
            Submit a claim
          </Link>
        </div>
      </section>
    </article>
  );
}
