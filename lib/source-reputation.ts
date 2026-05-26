import {
  evidenceCounts,
  seedClaims,
  type Claim,
  type ClaimDomain,
  type SourceQuality
} from "./claims";

export type SourceQualityCount = {
  quality: SourceQuality;
  count: number;
};

export type SourceRecord = {
  slug: string;
  name: string;
  claimCount: number;
  evidenceCount: number;
  highQualityClaimCount: number;
  qualityShare: number;
  averageAttributionScore: number;
  averageVeracityScore: number;
  signalScore: number;
  latestCreatedAt: string;
  latestSourceTitle: string;
  latestSourceUrl: string;
  domains: ClaimDomain[];
  qualityMix: SourceQualityCount[];
  claims: Claim[];
};

const qualityOrder: SourceQuality[] = [
  "primary",
  "direct witness",
  "reputable secondary",
  "indirect secondary",
  "unverifiable"
];

const highQualitySources = new Set<SourceQuality>(["primary", "direct witness"]);

export function slugifySourceName(name: string) {
  return name
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function round(value: number) {
  return Math.round(value);
}

function uniqueSortedDomains(claims: Claim[]) {
  return [...new Set(claims.map((claim) => claim.domain))].sort();
}

function qualityMix(claims: Claim[]): SourceQualityCount[] {
  return qualityOrder
    .map((quality) => ({
      quality,
      count: claims.filter((claim) => claim.sourceQuality === quality).length
    }))
    .filter((entry) => entry.count > 0);
}

function sourceName(claim: Claim) {
  return claim.sourcePublisher.trim() || claim.claimantName.trim() || "Unknown source";
}

export function buildSourceRecords(claims: Claim[] = seedClaims): SourceRecord[] {
  const groups = new Map<string, Claim[]>();

  for (const claim of claims) {
    const name = sourceName(claim);
    const existing = groups.get(name) ?? [];
    existing.push(claim);
    groups.set(name, existing);
  }

  return [...groups.entries()]
    .map(([name, sourceClaims]) => {
      const sortedClaims = [...sourceClaims].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const evidenceCount = sortedClaims.reduce((sum, claim) => {
        const counts = evidenceCounts(claim);
        return sum + counts.support + counts.challenge + counts.context;
      }, 0);
      const highQualityClaimCount = sortedClaims.filter((claim) =>
        highQualitySources.has(claim.sourceQuality)
      ).length;
      const claimCount = sortedClaims.length;
      const averageAttributionScore =
        sortedClaims.reduce((sum, claim) => sum + claim.attributionScore, 0) / claimCount;
      const averageVeracityScore =
        sortedClaims.reduce((sum, claim) => sum + claim.veracityScore, 0) / claimCount;
      const qualityShare = highQualityClaimCount / claimCount;

      return {
        slug: slugifySourceName(name),
        name,
        claimCount,
        evidenceCount,
        highQualityClaimCount,
        qualityShare,
        averageAttributionScore: round(averageAttributionScore),
        averageVeracityScore: round(averageVeracityScore),
        signalScore: round(
          averageAttributionScore * 0.45 + averageVeracityScore * 0.35 + qualityShare * 20
        ),
        latestCreatedAt: sortedClaims[0].createdAt,
        latestSourceTitle: sortedClaims[0].sourceTitle,
        latestSourceUrl: sortedClaims[0].sourceUrl,
        domains: uniqueSortedDomains(sortedClaims),
        qualityMix: qualityMix(sortedClaims),
        claims: sortedClaims
      };
    })
    .sort((a, b) => {
      if (b.signalScore !== a.signalScore) {
        return b.signalScore - a.signalScore;
      }

      if (b.claimCount !== a.claimCount) {
        return b.claimCount - a.claimCount;
      }

      return a.name.localeCompare(b.name);
    });
}

export const sourceRecords = buildSourceRecords();

export function findSourceRecord(slug: string) {
  return sourceRecords.find((source) => source.slug === slug);
}
