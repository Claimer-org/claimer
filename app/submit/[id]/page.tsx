import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ClaimsClient from "../../claims/claims-client";
import { findSeedClaim, reviewMission, seedClaims } from "../../../lib/claims";

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
    return { title: "Review mission not found" };
  }

  const mission = reviewMission(claim);

  return {
    title: `${mission.title} — ${claim.title}`,
    description: mission.description
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
  const targetLabel =
    mission.stance === "context" ? "attribution context" : "claim veracity";

  return (
    <div className="stack">
      <header className="page-heading" aria-labelledby="submit-title">
        <p className="eyebrow">Review mission</p>
        <h1 id="submit-title">{mission.title}</h1>
        <p>{claim.title}</p>
      </header>

      <section className="review-mission" aria-labelledby="mission-brief-title">
        <div>
          <span>{mission.stance} evidence needed</span>
          <h2 id="mission-brief-title">Add one public source for {targetLabel}</h2>
          <p>
            {mission.prompt} Check the current attribution source first, then
            use the preselected Add evidence form below.
          </p>
        </div>
        <div className="mission-actions">
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
        </div>
      </section>

      <ClaimsClient initialClaimId={claim.id} />
    </div>
  );
}
