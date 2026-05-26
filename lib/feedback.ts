import { getSupabaseClient, hasSupabaseConfig } from "./supabase";
import type { FeedbackUseCase } from "./supabase-contract";

const visitorStorageKey = "claimer.analytics.visitorId.v1";
const pathPattern = /^\/[A-Za-z0-9/_-]{0,255}$/;

export type FeedbackInput = {
  pagePath: string;
  useCase: FeedbackUseCase;
  rating: number;
  summary: string;
  metadata?: Record<string, string>;
};

export const feedbackUseCases: Array<{
  value: FeedbackUseCase;
  label: string;
}> = [
  { value: "browse_claims", label: "Browsing claims" },
  { value: "submit_claim", label: "Submitting a claim" },
  { value: "add_evidence", label: "Adding evidence" },
  { value: "research_decision", label: "Researching a decision" },
  { value: "other", label: "Something else" }
];

export function canSubmitFeedback() {
  return hasSupabaseConfig();
}

function normalizedPath(value: string) {
  const path = value.replace(/[^A-Za-z0-9/_-]/g, "").slice(0, 256) || "/";
  const prefixed = path.startsWith("/") ? path : `/${path}`;
  return pathPattern.test(prefixed) ? prefixed : "/";
}

function storedVisitorId() {
  try {
    const visitorId = window.localStorage.getItem(visitorStorageKey);
    return visitorId || null;
  } catch {
    return null;
  }
}

function normalizedMetadata(value: Record<string, string> = {}) {
  const metadata: Record<string, string> = {};

  Object.entries(value)
    .filter(([key, entry]) => /^[A-Za-z0-9_-]{1,40}$/.test(key) && entry.trim())
    .slice(0, 12)
    .forEach(([key, entry]) => {
      metadata[key] = entry.replace(/[^\w .:/?&=%-]/g, "").slice(0, 180);
    });

  return metadata;
}

export async function publishFeedback(input: FeedbackInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Live feedback is not configured for this build.");
  }

  const summary = input.summary.trim();
  const useCase =
    feedbackUseCases.find((item) => item.value === input.useCase)?.value ?? "other";
  const rating = Math.round(input.rating);

  if (rating < 1 || rating > 5) {
    throw new Error("Choose a rating from 1 to 5.");
  }

  if (!summary) {
    throw new Error("Add a short feedback note before sending.");
  }

  if (summary.length > 1200) {
    throw new Error("Keep feedback under 1,200 characters.");
  }

  const { error } = await supabase.from("feedback_entries").insert({
    page_path: normalizedPath(input.pagePath),
    visitor_id: storedVisitorId(),
    use_case: useCase,
    rating,
    summary,
    metadata: normalizedMetadata(input.metadata)
  });

  if (error) {
    throw new Error(`Feedback submission failed: ${error.message}`);
  }
}
