import {
  errorResponse,
  getAdminClient,
  jsonResponse,
  requireMethod,
  tokenFromQuery,
  validateContributor
// @ts-ignore Deno Edge Functions require the TypeScript extension.
} from "../_shared/contributor.ts";

type ClaimCandidate = {
  id: string;
  title: string;
  body: string | null;
  source_url: string;
  created_at: string;
  evidence_entries?: Array<{
    id: string;
    stance: string;
    contributor_token: string | null;
  }> | null;
};

Deno.serve(async (request) => {
  try {
    const methodResponse = requireMethod(request, "GET");
    if (methodResponse) {
      return methodResponse;
    }

    const supabase = getAdminClient();
    const contributor = await validateContributor(supabase, tokenFromQuery(request));

    const { data, error } = await supabase
      .from("claims")
      .select(
        `
          id,
          title,
          body,
          source_url,
          created_at,
          evidence_entries (
            id,
            stance,
            contributor_token
          )
        `
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      throw new Error(`Claim task lookup failed: ${error.message}`);
    }

    const candidates = ((data ?? []) as ClaimCandidate[])
      .filter((claim) => {
        const entries = claim.evidence_entries ?? [];
        const hasContributorEvidence = entries.some(
          (entry) => entry.contributor_token === contributor.token
        );
        return !hasContributorEvidence && entries.length < 10;
      })
      .sort((left, right) => {
        const leftCount = left.evidence_entries?.length ?? 0;
        const rightCount = right.evidence_entries?.length ?? 0;
        if (leftCount !== rightCount) {
          return leftCount - rightCount;
        }
        return right.created_at.localeCompare(left.created_at);
      });

    const claim = candidates[0];
    if (!claim) {
      return jsonResponse({
        task_type: "none",
        message: "No live claims need evidence right now."
      });
    }

    return jsonResponse({
      claim_id: claim.id,
      claim_text: claim.title,
      source_url: claim.source_url,
      task_type: "find_evidence"
    });
  } catch (error) {
    return errorResponse(error);
  }
});
