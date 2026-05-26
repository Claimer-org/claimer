import { seedClaims, evidenceCounts, type Claim } from "./claims";

export type TopicConfig = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  intro: string;
  keywords: string[];
  /** Filter function to select relevant claims from the seed data */
  filter: (claim: Claim) => boolean;
};

export function getTopicClaims(config: TopicConfig) {
  return seedClaims.filter(config.filter);
}

export function getTopicStats(claims: Claim[]) {
  let totalEvidence = 0;
  const domains = new Set<string>();
  let supportTotal = 0;
  let challengeTotal = 0;

  for (const claim of claims) {
    const counts = evidenceCounts(claim);
    totalEvidence += counts.support + counts.challenge + counts.context;
    supportTotal += counts.support;
    challengeTotal += counts.challenge;
    domains.add(claim.domain);
  }

  return {
    claimCount: claims.length,
    evidenceCount: totalEvidence,
    domainCount: domains.size,
    supportCount: supportTotal,
    challengeCount: challengeTotal,
  };
}
