import {
  aiDisclosure,
  errorResponse,
  getAdminClient,
  HttpError,
  insertSource,
  jsonResponse,
  normalizeText,
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

const obviousPageChromePatterns = [
  /\bjump\s+to\s+content\b/i,
  /\bjump\s+to\s+navigation\b/i,
  /\bjump\s+to\s+search\b/i,
  /\bskip\s+to\s+(main\s+)?content\b/i,
  /\bfrom\s+wikipedia,\s+the\s+free\s+encyclopedia\b/i,
  /\bthis\s+(site|website)\s+uses\s+cookies\b/i,
  /\bwe\s+(use|value)\s+cookies\b/i,
  /\b(cookie|cookies)\s+(settings|preferences|policy|notice|banner)\b/i,
  /\baccept\s+(all\s+)?cookies\b/i,
  /\breject\s+(all\s+)?cookies\b/i,
  /\bmanage\s+(cookie|cookies|preferences)\b/i,
  /\byour\s+privacy\s+choices\b/i
];

const genericPageLabels = new Set([
  "advertisement",
  "accept cookies",
  "cookie preferences",
  "cookie settings",
  "contents",
  "create account",
  "donate",
  "home",
  "log in",
  "main menu",
  "menu",
  "navigation",
  "privacy policy",
  "search",
  "sign in",
  "site navigation",
  "subscribe",
  "table of contents",
  "terms of service",
  "terms of use"
]);

const navigationOnlyWords = new Set([
  "about",
  "account",
  "advertisement",
  "appearance",
  "article",
  "contact",
  "contents",
  "cookies",
  "create",
  "donate",
  "edit",
  "help",
  "hide",
  "history",
  "home",
  "in",
  "latest",
  "log",
  "login",
  "main",
  "menu",
  "navigation",
  "news",
  "page",
  "policy",
  "preferences",
  "privacy",
  "random",
  "read",
  "search",
  "settings",
  "sign",
  "subscribe",
  "talk",
  "terms",
  "tools",
  "topics",
  "view"
]);

function assertEvidenceSummaryQuality(summary: string) {
  if (
    obviousPageChromePatterns.some((pattern) => pattern.test(summary)) ||
    isGenericPageLabel(summary) ||
    isNavigationOnlySummary(summary)
  ) {
    throw new HttpError(
      400,
      "page_chrome_summary",
      "Evidence summary appears to contain page chrome or navigation text instead of source-body evidence."
    );
  }
}

function isGenericPageLabel(summary: string) {
  const normalized = summary.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  return genericPageLabels.has(normalized);
}

function isNavigationOnlySummary(summary: string) {
  const words = summary.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  if (words.length === 0 || words.length > 20) {
    return false;
  }

  const navigationWords = words.filter((word) => navigationOnlyWords.has(word)).length;
  return navigationWords >= 4 && navigationWords / words.length >= 0.7;
}

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
    assertEvidenceSummaryQuality(text);
    const sourceUrl = requirePublicSourceUrl(requireString(body, "source_url", 2048));
    const sourceTitle = optionalString(body, "source_title", 180);
    const sourceQuality = parseSourceQuality(body.source_quality);
    const assessmentTarget = parseAssessmentTarget(body.assessment_target);
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

    const { data: duplicateCandidates, error: duplicateError } = await supabase
      .from("evidence_entries")
      .select("summary")
      .eq("claim_id", claimId)
      .eq("stance", stance)
      .eq("assessment_target", assessmentTarget)
      .eq("source_url", sourceUrl);

    if (duplicateError) {
      throw new Error(`Evidence duplicate lookup failed: ${duplicateError.message}`);
    }

    const hasExactDuplicate = (duplicateCandidates ?? []).some(
      (entry: { summary?: unknown }) =>
        normalizeText(String(entry.summary ?? ""), 1200) === text
    );

    if (hasExactDuplicate) {
      throw new HttpError(
        409,
        "duplicate_evidence",
        "Exact duplicate evidence has already been submitted."
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
        assessment_target: assessmentTarget,
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
