import { getSupabaseClient, hasSupabaseConfig } from "./supabase";
import type { ContributorNorthStarRow, GrowthSnapshotRow } from "./supabase-contract";

export type GrowthMetric = GrowthSnapshotRow & {
  value: number;
  detail: Record<string, unknown>;
};

export type ContributorNorthStarMetric = ContributorNorthStarRow & {
  value: number;
  detail: Record<string, unknown>;
};

export function canLoadGrowthSnapshot() {
  return hasSupabaseConfig();
}

function normalizeMetric(row: GrowthSnapshotRow): GrowthMetric {
  return {
    ...row,
    value: Number(row.value),
    sort_order: Number(row.sort_order),
    detail: row.detail ?? {}
  };
}

function normalizeContributorMetric(row: ContributorNorthStarRow): ContributorNorthStarMetric {
  return {
    ...row,
    value: Number(row.value),
    sort_order: Number(row.sort_order),
    detail: row.detail ?? {}
  };
}

export async function loadGrowthSnapshot() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Growth metrics are not configured for this build.");
  }

  const { data, error } = await supabase.rpc("get_growth_snapshot");

  if (error) {
    throw new Error(`Growth metrics failed: ${error.message}`);
  }

  return (data ?? []).map(normalizeMetric).sort((a, b) => a.sort_order - b.sort_order);
}

export async function loadContributorNorthStar() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Contributor metrics are not configured for this build.");
  }

  const { data, error } = await supabase.rpc("get_contributor_north_star");

  if (error) {
    throw new Error(`Contributor metrics failed: ${error.message}`);
  }

  return (data ?? [])
    .map(normalizeContributorMetric)
    .sort((a, b) => a.sort_order - b.sort_order);
}
