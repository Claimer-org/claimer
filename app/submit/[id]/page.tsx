import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClaimsClient from "../../claims/claims-client";
import AttributedReviewLink from "../../review/attributed-review-link";
import {
  evidenceCounts,
  findSeedClaim,
  reviewMission,
  seedClaims
} from "../../../lib/claims";

export function generateStaticParams() {
  return seedClaims.map((claim) => ({ id: claim.id }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const claim = findSeedClaim(id);

  if (!claim) {
    return { title: "Evidence contribution not found" };
  }

  return {
    title: `Contribute evidence — ${claim.title}`,
    description:
      "Add source-backed evidence for this public claim using the preselected evidence form."
  };
}

export default async function SubmitForClaimPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const claim = findSeedClaim(id);

  if (!claim) {
    notFound();
  }

  const mission = reviewMission(claim);
  const counts = evidenceCounts(claim);
  const sourceHost = sourceHostLabel(claim.sourceUrl);
  const targetLabel =
    mission.stance === "context" ? "attribution context" : "claim evidence";

  return (
    <div className="stack targeted-submit-page reader-editorial">
      <header
        className="page-heading source-contribution-heading"
        aria-labelledby="submit-title"
      >
        <p className="eyebrow">Contribute evidence</p>
        <h1 id="submit-title">Add source-backed evidence</h1>
        <p>{claim.title}</p>
      </header>

      <section
        className="source-contribution-brief"
        aria-labelledby="source-contribution-title"
      >
        <div className="source-contribution-copy">
          <span className="source-contribution-kicker">
            {mission.stance} evidence needed
          </span>
          <h2 id="source-contribution-title">
            Add one public source for {targetLabel}
          </h2>
          <p>
            {mission.prompt} Start with the current attribution source, then use
            the preselected Add evidence form below.
          </p>
          <dl className="source-contribution-facts">
            <div>
              <dt>Needed stance</dt>
              <dd>{mission.stance}</dd>
            </div>
            <div>
              <dt>Original source</dt>
              <dd>{claim.sourceTitle}</dd>
            </div>
            <div>
              <dt>Source host</dt>
              <dd>{sourceHost}</dd>
            </div>
            <div>
              <dt>Evidence mix</dt>
              <dd>
                {counts.support} support / {counts.challenge} challenge /{" "}
                {counts.context} context
              </dd>
            </div>
            <div className="wide">
              <dt>Evidence chain</dt>
              <dd>{claim.body}</dd>
            </div>
          </dl>
        </div>
        <div className="source-contribution-actions">
          <a
            className="button compact"
            href={claim.sourceUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open current source
          </a>
          <a className="button primary compact" href="#evidence-form-title">
            Jump to form
          </a>
          <AttributedReviewLink
            className="button compact"
            defaults={{ ref: "claim_workflow_note_cta" }}
            href="/feedback/"
            overrides={{
              use_case: "add_evidence",
              claim_id: claim.id
            }}
          >
            Leave workflow note
          </AttributedReviewLink>
        </div>
      </section>

      <ClaimsClient initialClaimId={claim.id} mode="review" />
    </div>
  );
}

function sourceHostLabel(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return sourceUrl;
  }
}
