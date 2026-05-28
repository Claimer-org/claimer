import {
  errorResponse,
  getAdminClient,
  jsonResponse,
  readJsonObject,
  requireMethod,
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
    const body = await readJsonObject(request);
    const message = requireString(body, "message", 1200);

    const { data, error } = await supabase
      .from("feedback_entries")
      .insert({
        page_path: "/contributor",
        visitor_id: contributor.token,
        use_case: "other",
        rating: 3,
        summary: message,
        metadata: {
          source: "contributor_protocol",
          contributor_token: contributor.token
        }
      })
      .select("id")
      .single();

    if (error) {
      return jsonResponse(
        {
          error: "feedback_contract_unsupported",
          message: `Contributor feedback could not be represented safely in feedback_entries: ${error.message}`
        },
        501
      );
    }

    return jsonResponse(
      {
        feedback_id: data.id,
        status: "recorded"
      },
      201
    );
  } catch (error) {
    return errorResponse(error);
  }
});
