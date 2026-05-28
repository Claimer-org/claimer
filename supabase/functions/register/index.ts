import {
  HttpError,
  errorResponse,
  getAdminClient,
  jsonResponse,
  parseOptionalToken,
  readJsonObject,
  requireMethod
// @ts-ignore Deno Edge Functions require the TypeScript extension.
} from "../_shared/contributor.ts";

Deno.serve(async (request) => {
  try {
    const methodResponse = requireMethod(request, "POST");
    if (methodResponse) {
      return methodResponse;
    }

    const supabase = getAdminClient();
    const body = await readOptionalJsonObject(request);
    const requestedToken = parseOptionalToken(
      request.headers.get("X-Contributor-Token")?.trim() ||
        (typeof body.token === "string" ? body.token.trim() : null)
    );

    if (requestedToken) {
      const { data, error } = await supabase
        .from("contributor_profiles")
        .select("token, status")
        .eq("token", requestedToken)
        .maybeSingle();

      if (error) {
        throw new HttpError(
          500,
          "token_lookup_failed",
          `Contributor token lookup failed: ${error.message}`
        );
      }

      if (data) {
        if (data.status !== "active") {
          throw new HttpError(
            403,
            "token_not_active",
            "Contributor token is not active."
          );
        }

        await supabase
          .from("contributor_profiles")
          .update({ last_seen_at: new Date().toISOString() })
          .eq("token", requestedToken);

        return jsonResponse({ token: data.token });
      }
    }

    const { data, error } = await supabase
      .from("contributor_profiles")
      .insert({
        metadata: {
          registered_via: "edge_register",
          user_agent: boundedUserAgent(request.headers.get("User-Agent"))
        }
      })
      .select("token")
      .single();

    if (error) {
      throw new HttpError(
        500,
        "registration_failed",
        `Contributor registration failed: ${error.message}`
      );
    }

    return jsonResponse({ token: data.token }, 201);
  } catch (error) {
    return errorResponse(error);
  }
});

async function readOptionalJsonObject(request: Request) {
  const contentType = request.headers.get("Content-Type") ?? "";
  if (!contentType.toLowerCase().includes("application/json")) {
    return {};
  }
  return await readJsonObject(request);
}

function boundedUserAgent(value: string | null) {
  if (!value) {
    return "unknown";
  }
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").slice(0, 180);
}
