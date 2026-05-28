import { createClient } from "npm:@supabase/supabase-js@2";

export type SupabaseAdminClient = {
  from(table: string): any;
};

export type ContributorProfile = {
  token: string;
  status: "active" | "suspended" | "revoked";
  total_submissions: number;
  models_used: string[] | null;
  tools_used: string[] | null;
};

export type AiHeaders = {
  model: string;
  tool: string;
};

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const allowedDomains = new Set(["ai", "news", "technology"]);
const allowedSubjectKinds = new Set([
  "company",
  "organization",
  "public_official",
  "public_figure",
  "product",
  "policy",
  "event",
  "publication",
  "other_public"
]);
const allowedStances = new Set(["support", "challenge", "context"]);
const allowedAssessmentTargets = new Set(["attribution", "veracity", "context"]);
const allowedSourceQualities = new Set([
  "primary",
  "direct_witness",
  "reputable_secondary",
  "indirect_secondary",
  "unverifiable"
]);

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-contributor-token, x-model, x-tool",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Max-Age": "86400"
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

export function noContentResponse() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

export function errorResponse(error: unknown) {
  if (error instanceof HttpError) {
    return jsonResponse(
      {
        error: error.code,
        message: error.message
      },
      error.status
    );
  }

  console.error(error);
  return jsonResponse(
    {
      error: "internal_error",
      message: "Contributor function failed."
    },
    500
  );
}

export function requireMethod(request: Request, method: "GET" | "POST") {
  if (request.method === "OPTIONS") {
    return noContentResponse();
  }

  if (request.method !== method) {
    throw new HttpError(
      405,
      "method_not_allowed",
      `Use ${method} for this endpoint.`
    );
  }

  return null;
}

export function getAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new HttpError(
      500,
      "server_misconfigured",
      "Contributor API is missing Supabase service configuration."
    );
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  }) as unknown as SupabaseAdminClient;
}

export async function readJsonObject(request: Request) {
  try {
    const body = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new HttpError(400, "invalid_json", "Request body must be a JSON object.");
    }
    return body as Record<string, unknown>;
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
    throw new HttpError(400, "invalid_json", "Request body must be valid JSON.");
  }
}

export function optionalString(
  body: Record<string, unknown>,
  key: string,
  maxLength: number
) {
  const value = body[key];
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = normalizeText(value, maxLength);
  return trimmed || null;
}

export function requireString(
  body: Record<string, unknown>,
  key: string,
  maxLength: number
) {
  const value = body[key];
  if (typeof value !== "string") {
    throw new HttpError(400, "missing_field", `Body field "${key}" is required.`);
  }

  const trimmed = normalizeText(value, maxLength);
  if (!trimmed) {
    throw new HttpError(400, "missing_field", `Body field "${key}" cannot be blank.`);
  }

  return trimmed;
}

export function normalizeText(value: string, maxLength: number) {
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function requireHeader(request: Request, headerName: string, maxLength = 120) {
  const value = request.headers.get(headerName);
  if (!value) {
    throw new HttpError(
      400,
      "missing_header",
      `Header "${headerName}" is required.`
    );
  }

  const normalized = normalizeText(value, maxLength);
  if (!normalized) {
    throw new HttpError(
      400,
      "missing_header",
      `Header "${headerName}" cannot be blank.`
    );
  }

  return normalized;
}

export function requireAiHeaders(request: Request): AiHeaders {
  return {
    model: requireHeader(request, "X-Model"),
    tool: requireHeader(request, "X-Tool")
  };
}

export function tokenFromRequest(request: Request) {
  return request.headers.get("X-Contributor-Token")?.trim() || null;
}

export function tokenFromQuery(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("token")?.trim() || null;
}

export function parseOptionalToken(value: string | null) {
  if (!value) {
    return null;
  }

  if (!uuidPattern.test(value)) {
    throw new HttpError(400, "invalid_token", "Contributor token must be a UUID.");
  }

  return value.toLowerCase();
}

export async function validateContributor(
  supabase: SupabaseAdminClient,
  token: string | null
) {
  const normalizedToken = parseOptionalToken(token);
  if (!normalizedToken) {
    throw new HttpError(401, "missing_token", "Contributor token is required.");
  }

  const { data, error } = await supabase
    .from("contributor_profiles")
    .select("token, status, total_submissions, models_used, tools_used")
    .eq("token", normalizedToken)
    .maybeSingle();

  if (error) {
    throw new HttpError(
      500,
      "token_lookup_failed",
      `Contributor token lookup failed: ${error.message}`
    );
  }

  if (!data) {
    throw new HttpError(401, "invalid_token", "Contributor token was not found.");
  }

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
    .eq("token", normalizedToken);

  return data as ContributorProfile;
}

export async function recordContributorSubmission(
  supabase: SupabaseAdminClient,
  contributor: ContributorProfile,
  headers: AiHeaders
) {
  const models = appendUnique(contributor.models_used ?? [], headers.model);
  const tools = appendUnique(contributor.tools_used ?? [], headers.tool);

  const { error } = await supabase
    .from("contributor_profiles")
    .update({
      total_submissions: contributor.total_submissions + 1,
      models_used: models,
      tools_used: tools,
      last_seen_at: new Date().toISOString()
    })
    .eq("token", contributor.token);

  if (error) {
    throw new HttpError(
      500,
      "contributor_update_failed",
      `Contributor profile update failed: ${error.message}`
    );
  }
}

function appendUnique(values: string[], value: string) {
  return Array.from(new Set([...values, value])).slice(-40);
}

export function requirePublicSourceUrl(rawValue: string) {
  let url: URL;
  try {
    url = new URL(rawValue);
  } catch {
    throw new HttpError(400, "invalid_source_url", "source_url must be a valid URL.");
  }

  const hostname = url.hostname.toLowerCase();
  const normalizedHostname = hostname.replace(/^\[|\]$/g, "");

  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    !hostname ||
    url.username !== "" ||
    url.password !== ""
  ) {
    throw new HttpError(
      400,
      "invalid_source_url",
      "source_url must be a public http or https URL."
    );
  }

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost") ||
    normalizedHostname.endsWith(".local")
  ) {
    throw new HttpError(
      400,
      "invalid_source_url",
      "source_url cannot point to localhost or private hosts."
    );
  }

  const ipv4 = normalizedHostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4) {
    const octets = ipv4.slice(1).map(Number);
    const [first, second] = octets;

    if (
      octets.some((octet) => octet < 0 || octet > 255) ||
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      first >= 224
    ) {
      throw new HttpError(
        400,
        "invalid_source_url",
        "source_url cannot point to localhost or private hosts."
      );
    }
  }

  if (
    normalizedHostname.includes(":") &&
    (normalizedHostname === "::1" ||
      normalizedHostname.startsWith("fc") ||
      normalizedHostname.startsWith("fd") ||
      normalizedHostname.startsWith("fe80:"))
  ) {
    throw new HttpError(
      400,
      "invalid_source_url",
      "source_url cannot point to localhost or private hosts."
    );
  }

  return url.toString();
}

export function sourceTitleFromUrl(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return "Source";
  }
}

export function publisherFromUrl(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return null;
  }
}

export function parseDomain(value: unknown) {
  if (typeof value === "string" && allowedDomains.has(value)) {
    return value;
  }
  return "news";
}

export function parseSubjectKind(value: unknown) {
  if (typeof value === "string" && allowedSubjectKinds.has(value)) {
    return value;
  }
  return "other_public";
}

export function parseSourceQuality(value: unknown) {
  if (typeof value === "string" && allowedSourceQualities.has(value)) {
    return value;
  }
  return "unverifiable";
}

export function parseStance(value: string) {
  if (!allowedStances.has(value)) {
    throw new HttpError(
      400,
      "invalid_evidence_type",
      'Evidence type must be "support", "challenge", or "context".'
    );
  }
  return value;
}

export function parseAssessmentTarget(value: unknown) {
  if (typeof value === "string" && allowedAssessmentTargets.has(value)) {
    return value;
  }
  return "veracity";
}

export function requireUuid(value: string, fieldName: string) {
  if (!uuidPattern.test(value)) {
    throw new HttpError(400, "invalid_uuid", `${fieldName} must be a UUID.`);
  }
  return value.toLowerCase();
}

export function aiDisclosure(headers: AiHeaders) {
  return `AI-assisted contributor submission. Model: ${headers.model}. Tool: ${headers.tool}.`;
}

export async function insertSource(
  supabase: SupabaseAdminClient,
  input: {
    sourceUrl: string;
    sourceTitle: string | null;
    sourceQuality: string;
  }
) {
  const { data, error } = await supabase
    .from("sources")
    .insert({
      url: input.sourceUrl,
      title: input.sourceTitle || sourceTitleFromUrl(input.sourceUrl),
      publisher: publisherFromUrl(input.sourceUrl),
      quality: input.sourceQuality
    })
    .select("id, url, title, publisher, quality, created_at")
    .single();

  if (error) {
    throw new HttpError(
      500,
      "source_insert_failed",
      `Source insert failed: ${error.message}`
    );
  }

  return data;
}
