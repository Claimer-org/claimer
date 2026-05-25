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

  return (
    <div className="stack">
      <header className="page-heading" aria-labelledby="submit-title">
        <p className="eyebrow">Review mission</p>
        <h1 id="submit-title">{mission.title}</h1>
        <p>{claim.title}</p>
      </header>

      <ClaimsClient initialClaimId={claim.id} />
    </div>
  );
}
