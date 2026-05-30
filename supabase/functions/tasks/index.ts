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
    assessment_target: string | null;
    source_url: string | null;
    contributor_token: string | null;
  }> | null;
};

function isSubstantiveEvidence(entry: {
  stance: string;
  assessment_target: string | null;
}) {
  return (
    entry.assessment_target !== "attribution" ||
    entry.stance === "support" ||
    entry.stance === "challenge"
  );
}

function parseHttpUrl(sourceUrl: string | null) {
  if (!sourceUrl) {
    return null;
  }

  try {
    const url = new URL(sourceUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

function isRootHomepageUrl(sourceUrl: string) {
  const url = parseHttpUrl(sourceUrl);
  if (!url) {
    return false;
  }

  return (
    url.pathname.replace(/\/+$/, "") === "" &&
    url.search === "" &&
    url.hash === ""
  );
}

function hasSameHost(left: URL, rightSourceUrl: string | null) {
  const right = parseHttpUrl(rightSourceUrl);
  return Boolean(
    right && right.hostname.toLowerCase() === left.hostname.toLowerCase()
  );
}

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
            assessment_target,
            source_url,
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
        const claimSourceUrl = parseHttpUrl(claim.source_url);
        const isRootHomepageSource = isRootHomepageUrl(claim.source_url);
        const hasContributorEvidence = entries.some(
          (entry) => entry.contributor_token === contributor.token
        );
        const hasSubstantiveAssignedSourceEvidence = entries.some(
          (entry) =>
            entry.source_url === claim.source_url &&
            isSubstantiveEvidence(entry)
        );
        const hasSubstantiveSameHostEvidenceForRootSource =
          claimSourceUrl !== null &&
          isRootHomepageSource &&
          entries.some(
            (entry) =>
              isSubstantiveEvidence(entry) &&
              hasSameHost(claimSourceUrl, entry.source_url)
          );
        return (
          !hasContributorEvidence &&
          !hasSubstantiveAssignedSourceEvidence &&
          !hasSubstantiveSameHostEvidenceForRootSource &&
          entries.length < 10
        );
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
