import { evidenceCounts, seedClaims, type Claim } from "../../lib/claims";

const previewClaims = seedClaims.slice(0, 3);

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "Source host pending";
  }
}

function sourceNeedCue(claim: Claim) {
  const counts = evidenceCounts(claim);

  if (counts.challenge === 0) {
    return "Challenge source gap";
  }

  if (counts.support === 0) {
    return "Support source gap";
  }

  if (counts.context === 0) {
    return "Context coverage open";
  }

  return "Primary-source gap watch";
}

export default function ClaimsLoading() {
  return (
    <div className="stack reader-editorial claims-library-page claims-first-paint">
      <header className="page-heading" aria-labelledby="claims-loading-title">
        <p className="eyebrow">Public evidence library</p>
        <h1 id="claims-loading-title">Browse claims by source and evidence mix</h1>
        <p>
          Start with source-backed records: inspect Original source, Source host,
          Evidence mix, and Source need before opening a selected source trail.
        </p>
      </header>

      <section
        className="claims-first-paint-shell"
        aria-label="Source and evidence preview"
      >
        <div className="claims-first-paint-status">
          <strong>Source trail preview</strong>
          <span>
            Preview rows include Original source, Source host, Evidence mix, and
            a source need cue for reader inspection.
          </span>
        </div>

        <div className="source-archive-cues claims-first-paint-cues">
          <span>
            <strong>1</strong> Challenge source gap
          </span>
          <span>
            <strong>2</strong> Support source gap
          </span>
          <span>
            <strong>3</strong> Primary-source gap
          </span>
          <span>
            <strong>4</strong> Context coverage open
          </span>
        </div>

        <div className="claims-first-paint-rows" role="list">
          {previewClaims.map((claim) => {
            const counts = evidenceCounts(claim);
            const originalSource = claim.sourcePublisher || claim.sourceTitle;
            const host = sourceHost(claim.sourceUrl);

            return (
              <article className="claims-first-paint-row" key={claim.id} role="listitem">
                <div className="claims-first-paint-fact">
                  <span>Original source</span>
                  <strong>{originalSource}</strong>
                </div>
                <div className="claims-first-paint-fact">
                  <span>Source host</span>
                  <strong>{host}</strong>
                </div>
                <div className="claims-first-paint-fact">
                  <span>Evidence mix</span>
                  <strong>
                    {counts.support} support / {counts.challenge} challenge /{" "}
                    {counts.context} context
                  </strong>
                </div>
                <div className="claims-first-paint-fact muted">
                  <span>Source need</span>
                  <strong>{sourceNeedCue(claim)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
