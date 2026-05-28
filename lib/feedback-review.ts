import { getSupabaseClient, hasSupabaseConfig } from "./supabase";
import type {
  FeedbackReviewSnapshotMetadata,
  FeedbackReviewSnapshotRow
} from "./supabase-contract";

export type FeedbackReviewEntry = Omit<
  FeedbackReviewSnapshotRow,
  "metadata" | "rating"
> & {
  metadata: FeedbackReviewSnapshotMetadata;
  rating: number;
};

export function canLoadFeedbackReviewSnapshot() {
  return hasSupabaseConfig();
}

function normalizeMetadata(
  metadata: FeedbackReviewSnapshotRow["metadata"] | null | undefined
): FeedbackReviewSnapshotMetadata {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return {};
  }

  return metadata;
}

function normalizeEntry(row: FeedbackReviewSnapshotRow): FeedbackReviewEntry {
  return {
    ...row,
    metadata: normalizeMetadata(row.metadata),
    rating: Number(row.rating)
  };
}

export async function loadFeedbackReviewSnapshot() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Feedback review is not configured for this build.");
  }

  const { data, error } = await supabase.rpc("get_feedback_review_snapshot");

  if (error) {
    throw new Error(`Feedback review failed: ${error.message}`);
  }

  return (data ?? []).map(normalizeEntry);
}
