import {
  aiDisclosure,
  errorResponse,
  getAdminClient,
  insertSource,
  jsonResponse,
  optionalString,
  parseAssessmentTarget,
  parseSourceQuality,
  parseStance,
  readJsonObject,
  recordContributorSubmission,
  requireAiHeaders,
  requireMethod,
  requirePublicSourceUrl,
  requireString,
  requireUuid,
  tokenFromRequest,
  validateContributor
// @ts-ignore Deno Edge Functions require the TypeScript extension.
} from "../_shared/contributor.ts";

Deno.serve(async (request) => {
  try {
    const methodResponse = requireMethod(request, "POST");
    if (methodResponse) {
      return methodResponse;
    }

    const supabase = getAdminClient();
    const contributor = await validateContributor(supabase, tokenFromRequest(request));
    const headers = requireAiHeaders(request);
    const body = await readJsonObject(request);
    const claimId = requireUuid(requireString(body, "claim_id", 80), "claim_id");
    const stance = parseStance(requireString(body, "type", 24));
    const text = requireString(body, "text", 1200);
    const sourceUrl = requirePublicSourceUrl(requireString(body, "source_url", 2048));
    const sourceTitle = optionalString(body, "source_title", 180);
    const sourceQuality = parseSourceQuality(body.source_quality);
    const disclosure = aiDisclosure(headers);

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .select("id")
      .eq("id", claimId)
      .maybeSingle();

    if (claimError) {
      throw new Error(`Claim lookup failed: ${claimError.message}`);
    }

    if (!claim) {
      return jsonResponse(
        {
          error: "claim_not_found",
          message: "claim_id does not identify a live claim."
        },
        404
      );
    }

    const source = await insertSource(supabase, {
      sourceUrl,
      sourceTitle,
      sourceQuality
    });

    const { data: evidence, error: evidenceError } = await supabase
      .from("evidence_entries")
      .insert({
        claim_id: claimId,
        stance,
        assessment_target: parseAssessmentTarget(body.assessment_target),
        summary: text,
        source_id: source.id,
        source_url: sourceUrl,
        contributor_token: contributor.token,
        model_used: headers.model,
        tool_used: headers.tool,
        is_ai_generated: true,
        ai_disclosure: disclosure
      })
      .select("id, claim_id, stance, source_url, created_at")
      .single();

    if (evidenceError) {
      throw new Error(`Evidence insert failed: ${evidenceError.message}`);
    }

    await recordContributorSubmission(supabase, contributor, headers);

    return jsonResponse(
      {
        evidence_id: evidence.id,
        claim_id: evidence.claim_id,
        type: evidence.stance,
        source_id: source.id,
        source_url: evidence.source_url
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
});
