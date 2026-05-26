"use client";

import { useState } from "react";

export type LaunchShareDraft = {
  id: string;
  label: string;
  title: string;
  body: string;
  url: string;
};

function draftText(draft: LaunchShareDraft) {
  return `${draft.title}\n\n${draft.body}\n\n${draft.url}`;
}

export default function LaunchShareDrafts({ drafts }: { drafts: LaunchShareDraft[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copyFailedId, setCopyFailedId] = useState<string | null>(null);

  async function copyDraft(draft: LaunchShareDraft) {
    try {
      await navigator.clipboard.writeText(draftText(draft));
      setCopiedId(draft.id);
      setCopyFailedId(null);
      window.setTimeout(() => setCopiedId(null), 2200);
    } catch {
      setCopiedId(null);
      setCopyFailedId(draft.id);
    }
  }

  return (
    <section className="panel" aria-labelledby="launch-drafts-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Copy-ready outreach</p>
          <h2 id="launch-drafts-title">Reviewer share drafts</h2>
        </div>
        <span className="share-label">Conservative language</span>
      </div>

      <div className="launch-grid" aria-label="Copy-ready launch share drafts">
        {drafts.map((draft) => {
          const copied = copiedId === draft.id;
          const failed = copyFailedId === draft.id;

          return (
            <article className="launch-card" key={draft.id}>
              <div className="mission-meta">
                <span className="claim-domain">{draft.label}</span>
                <span className="mission-priority">draft</span>
              </div>
              <h2>{draft.title}</h2>
              <pre className="copy-line launch-draft-text">{draft.body}</pre>
              <p className="copy-line">{draft.url}</p>
              <div className="mission-actions">
                <button
                  className="button primary compact"
                  onClick={() => copyDraft(draft)}
                  type="button"
                >
                  {copied ? "Copied draft" : "Copy draft"}
                </button>
                <a className="button compact" href={draft.url}>
                  Open link
                </a>
              </div>
              {copied || failed ? (
                <p className={`copy-status ${failed ? "warning" : ""}`} role="status">
                  {failed
                    ? "Clipboard unavailable. Select the draft text manually."
                    : "Draft copied with measured link."}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
