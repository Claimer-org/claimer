import {
  aiDisclosure,
  errorResponse,
  getAdminClient,
  insertSource,
  jsonResponse,
  optionalString,
  parseDomain,
  parseSourceQuality,
  parseSubjectKind,
  readJsonObject,
  recordContributorSubmission,
  requireAiHeaders,
  requireMethod,
  requirePublicSourceUrl,
  requireString,
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
    const text = requireString(body, "text", 600);
    const sourceUrl = requirePublicSourceUrl(requireString(body, "source_url", 2048));
    const sourceTitle = optionalString(body, "source_title", 180);
    const sourceQuality = parseSourceQuality(body.source_quality);
    const disclosure = aiDisclosure(headers);

    const source = await insertSource(supabase, {
      sourceUrl,
      sourceTitle,
      sourceQuality
    });

    const { data: claim, error: claimError } = await supabase
      .from("claims")
      .insert({
        domain: parseDomain(body.domain),
        title: text,
        body: optionalString(body, "body", 1200),
        claimant_name:
          optionalString(body, "claimant_name", 180) || source.publisher || "Unknown",
        subject_kind: parseSubjectKind(body.subject_kind),
        source_id: source.id,
        source_url: sourceUrl,
        contributor_token: contributor.token,
        model_used: headers.model,
        tool_used: headers.tool,
        is_ai_generated: true,
        ai_disclosure: disclosure
      })
      .select("id, title, source_url, created_at")
      .single();

    if (claimError) {
      throw new Error(`Claim insert failed: ${claimError.message}`);
    }

    const { data: evidence, error: evidenceError } = await supabase
      .from("evidence_entries")
      .insert({
        claim_id: claim.id,
        stance: "context",
        assessment_target: "attribution",
        summary: "Initial attribution source submitted with the claim.",
        source_id: source.id,
        source_url: sourceUrl,
        contributor_token: contributor.token,
        model_used: headers.model,
        tool_used: headers.tool,
        is_ai_generated: true,
        ai_disclosure: disclosure
      })
      .select("id")
      .single();

    if (evidenceError) {
      throw new Error(`Initial attribution evidence insert failed: ${evidenceError.message}`);
    }

    await recordContributorSubmission(supabase, contributor, headers);

    return jsonResponse(
      {
        claim_id: claim.id,
        evidence_id: evidence.id,
        source_id: source.id,
        source_url: claim.source_url,
        task_type: "claim_submitted"
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
});
