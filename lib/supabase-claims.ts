import type { User } from "@supabase/supabase-js";
import {
  type AssessmentTarget,
  type Claim,
  type ClaimDomain,
  type EvidenceEntry,
  type EvidenceStance,
  type SourceQuality,
  seedClaims
} from "./claims";
import { getSupabaseClient, hasSupabaseConfig } from "./supabase";
import {
  type PublicSourceUrl,
  type PublicSubjectKind,
  type SourceQuality as DbSourceQuality,
  type SupabaseDatabase,
  isPublicSourceUrl
} from "./supabase-contract";

type DbClaim = SupabaseDatabase["public"]["Tables"]["claims"]["Row"];
type DbEvidenceEntry = SupabaseDatabase["public"]["Tables"]["evidence_entries"]["Row"];
type DbSeedEvidenceEntry =
  SupabaseDatabase["public"]["Tables"]["seed_evidence_entries"]["Row"];
type DbSource = SupabaseDatabase["public"]["Tables"]["sources"]["Row"];

type SourceRelation = DbSource | DbSource[] | null | undefined;
type EvidenceWithSource = DbEvidenceEntry & {
  sources?: SourceRelation;
};
type SeedEvidenceWithSource = DbSeedEvidenceEntry & {
  sources?: SourceRelation;
};
type ClaimWithRelations = DbClaim & {
  sources?: SourceRelation;
  evidence_entries?: EvidenceWithSource[] | null;
};

type ClaimFormInput = {
  title: string;
  body: string;
  domain: ClaimDomain;
  claimantName: string;
  subjectKind: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceQuality: SourceQuality;
};

type EvidenceFormInput = {
  stance: EvidenceStance;
  assessmentTarget: AssessmentTarget;
  summary: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceQuality: SourceQuality;
  aiAssisted: boolean;
};

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const seedClaimIds = new Set(seedClaims.map((claim) => claim.id));

const uiToDbSourceQuality = {
  primary: "primary",
  "direct witness": "direct_witness",
  "reputable secondary": "reputable_secondary",
  "indirect secondary": "indirect_secondary",
  unverifiable: "unverifiable"
} satisfies Record<SourceQuality, DbSourceQuality>;

const dbToUiSourceQuality = {
  primary: "primary",
  direct_witness: "direct witness",
  reputable_secondary: "reputable secondary",
  indirect_secondary: "indirect secondary",
  unverifiable: "unverifiable"
} satisfies Record<DbSourceQuality, SourceQuality>;

const uiToDbSubjectKind: Record<string, PublicSubjectKind> = {
  company: "company",
  organization: "organization",
  "public official": "public_official",
  "public figure": "public_figure",
  product: "product",
  policy: "policy",
  event: "event",
  publication: "publication",
  "other public": "other_public"
};

const dbToUiSubjectKind = {
  company: "company",
  organization: "organization",
  public_official: "public official",
  public_figure: "public figure",
  product: "product",
  policy: "policy",
  event: "event",
  publication: "publication",
  other_public: "other public"
} satisfies Record<PublicSubjectKind, string>;

export function isLiveSupabaseClaimId(claimId: string) {
  return uuidPattern.test(claimId);
}

export function isSeedClaimId(claimId: string) {
  return seedClaimIds.has(claimId);
}

export function evidencePersistenceTarget(claimId: string) {
  if (isLiveSupabaseClaimId(claimId)) {
    return "live" as const;
  }

  if (isSeedClaimId(claimId)) {
    return "seed" as const;
  }

  return "local" as const;
}

export function canPersistEvidenceToSupabase(claimId: string) {
  return evidencePersistenceTarget(claimId) !== "local";
}

export function canUseSupabase() {
  return hasSupabaseConfig();
}

function firstRelation<T>(relation: T | T[] | null | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }
  return relation ?? null;
}

function sourceTitleFromUrl(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return sourceUrl;
  }
}

function toPublicSourceUrl(value: string): PublicSourceUrl {
  const trimmed = value.trim();
  if (!isPublicSourceUrl(trimmed)) {
    throw new Error("Source URL must be a public http or https URL.");
  }
  return trimmed;
}

function publisherFromUrl(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname;
  } catch {
    return null;
  }
}

function displayNameForUser(user: User) {
  const metadataName =
    typeof user.user_metadata?.name === "string" ? user.user_metadata.name : "";
  const emailName = user.email?.split("@")[0] ?? "";
  return metadataName || emailName || "Anonymous reviewer";
}

async function ensureAuthenticatedProfile() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured for this build.");
  }

  const { data: sessionData } = await supabase.auth.getSession();
  let user = sessionData.session?.user ?? null;

  // Use existing real session; only fall back to anonymous if no session
  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      throw new Error(`Supabase anonymous sign-in failed: ${error.message}`);
    }
    user = data.user;
  }

  if (!user) {
    throw new Error("Supabase did not return an authenticated user.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`Profile lookup failed: ${profileError.message}`);
  }

  if (!profile) {
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: displayNameForUser(user)
    });

    if (insertError) {
      throw new Error(`Profile creation failed: ${insertError.message}`);
    }
  }

  return { userId: user.id, isAnonymous: user.is_anonymous ?? false };
}

function mapEvidence(row: EvidenceWithSource): EvidenceEntry {
  const source = firstRelation(row.sources);
  const sourceUrl = row.source_url;
  return {
    id: row.id,
    stance: row.stance,
    assessmentTarget: row.assessment_target,
    summary: row.summary,
    sourceUrl,
    sourceTitle: source?.title || sourceTitleFromUrl(sourceUrl),
    sourceQuality: dbToUiSourceQuality[source?.quality ?? "unverifiable"],
    submittedBy: "Community contributor",
    createdAt: row.created_at,
    aiAssisted: row.is_ai_generated,
    aiDisclosure: row.ai_disclosure,
    modelUsed: row.model_used,
    toolUsed: row.tool_used,
    recordStatus: "Live contributor"
  };
}

function mapSeedEvidence(row: SeedEvidenceWithSource): EvidenceEntry {
  const source = firstRelation(row.sources);
  const sourceUrl = row.source_url;
  return {
    id: row.id,
    stance: row.stance,
    assessmentTarget: row.assessment_target,
    summary: row.summary,
    sourceUrl,
    sourceTitle: source?.title || sourceTitleFromUrl(sourceUrl),
    sourceQuality: dbToUiSourceQuality[source?.quality ?? "unverifiable"],
    submittedBy: "Community contributor",
    createdAt: row.created_at,
    aiAssisted: row.is_ai_generated,
    aiDisclosure: row.ai_disclosure,
    modelUsed: row.model_used,
    toolUsed: row.tool_used,
    recordStatus: "Live contributor"
  };
}

function mapClaim(row: ClaimWithRelations): Claim {
  const source = firstRelation(row.sources);
  const sourceUrl = row.source_url;
  const evidence = (row.evidence_entries ?? [])
    .map(mapEvidence)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return {
    id: row.id,
    title: row.title,
    body: row.body ?? "",
    domain: row.domain,
    claimantName: row.claimant_name ?? "Unknown claimant",
    subjectKind: dbToUiSubjectKind[row.subject_kind],
    sourceUrl,
    sourceTitle: source?.title || sourceTitleFromUrl(sourceUrl),
    sourcePublisher: source?.publisher || publisherFromUrl(sourceUrl) || "",
    sourceQuality: dbToUiSourceQuality[source?.quality ?? "unverifiable"],
    attributionScore: 50,
    attributionLabel: "Needs community review",
    attributionExplanation:
      "This live claim needs community assessment of the attribution source.",
    veracityScore: 50,
    veracityLabel: "Evidence still developing",
    veracityExplanation:
      "Live evidence has been collected. Review the support and challenge source mix before relying on the assessment.",
    createdAt: row.created_at,
    submittedBy: "Community contributor",
    aiAssisted: row.is_ai_generated,
    evidence
  };
}

async function insertSource(input: {
  sourceUrl: PublicSourceUrl;
  sourceTitle: string;
  sourceQuality: SourceQuality;
}) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured for this build.");
  }

  const { data, error } = await supabase
    .from("sources")
    .insert({
      url: input.sourceUrl,
      title: input.sourceTitle.trim() || sourceTitleFromUrl(input.sourceUrl),
      publisher: publisherFromUrl(input.sourceUrl),
      quality: uiToDbSourceQuality[input.sourceQuality]
    })
    .select("id, url, title, publisher, published_at, quality, created_by, created_at")
    .single();

  if (error) {
    throw new Error(`Source insert failed: ${error.message}`);
  }

  return data;
}

export async function loadSupabaseClaims() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from("claims")
    .select(
      `
        id,
        domain,
        title,
        body,
        claimant_name,
        subject_kind,
        source_id,
        source_url,
        submitted_by,
        is_ai_generated,
        ai_disclosure,
        created_at,
        updated_at,
        sources (
          id,
          url,
          title,
          publisher,
          published_at,
          quality,
          created_by,
          created_at
        ),
        evidence_entries (
          id,
          claim_id,
          stance,
          assessment_target,
          summary,
          source_id,
          source_url,
          submitted_by,
          is_ai_generated,
          ai_disclosure,
          model_used,
          tool_used,
          created_at,
          updated_at,
          sources (
            id,
            url,
            title,
            publisher,
            published_at,
            quality,
            created_by,
            created_at
          )
        )
      `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(`Supabase claim load failed: ${error.message}`);
  }

  return ((data ?? []) as ClaimWithRelations[]).map(mapClaim);
}

export async function loadSupabaseSeedEvidence() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("seed_evidence_entries")
    .select(
      `
        id,
        seed_claim_id,
        stance,
        assessment_target,
        summary,
        source_id,
        source_url,
        submitted_by,
        is_ai_generated,
        ai_disclosure,
        model_used,
        tool_used,
        created_at,
        updated_at,
        sources (
          id,
          url,
          title,
          publisher,
          published_at,
          quality,
          created_by,
          created_at
        )
      `
    )
    .in("seed_claim_id", Array.from(seedClaimIds))
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new Error(`Supabase seed evidence load failed: ${error.message}`);
  }

  return ((data ?? []) as SeedEvidenceWithSource[]).reduce<
    Record<string, EvidenceEntry[]>
  >((entriesByClaim, row) => {
    const entries = entriesByClaim[row.seed_claim_id] ?? [];
    entriesByClaim[row.seed_claim_id] = [...entries, mapSeedEvidence(row)];
    return entriesByClaim;
  }, {});
}

export async function publishClaimToSupabase(input: ClaimFormInput) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured for this build.");
  }

  await ensureAuthenticatedProfile();

  const sourceUrl = toPublicSourceUrl(input.sourceUrl);
  const source = await insertSource({
    sourceUrl,
    sourceTitle: input.sourceTitle,
    sourceQuality: input.sourceQuality
  });
  const subjectKind = uiToDbSubjectKind[input.subjectKind] ?? "other_public";

  const { data: claim, error: claimError } = await supabase
    .from("claims")
    .insert({
      domain: input.domain,
      title: input.title.trim(),
      body: input.body.trim() || null,
      claimant_name: input.claimantName.trim(),
      subject_kind: subjectKind,
      source_id: source.id,
      source_url: sourceUrl,
      is_ai_generated: false
    })
    .select(
      "id, domain, title, body, claimant_name, subject_kind, source_id, source_url, submitted_by, is_ai_generated, ai_disclosure, created_at, updated_at"
    )
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
      is_ai_generated: false
    })
    .select(
      "id, claim_id, stance, assessment_target, summary, source_id, source_url, submitted_by, is_ai_generated, ai_disclosure, model_used, tool_used, created_at, updated_at"
    )
    .single();

  if (evidenceError) {
    throw new Error(`Initial evidence insert failed: ${evidenceError.message}`);
  }

  return mapClaim({
    ...claim,
    sources: source,
    evidence_entries: [{ ...evidence, sources: source }]
  });
}

export async function publishEvidenceToSupabase(
  claimId: string,
  input: EvidenceFormInput
) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured for this build.");
  }

  const target = evidencePersistenceTarget(claimId);
  if (target === "local") {
    throw new Error(
      "Only live Supabase claims and known seed claims can receive durable evidence."
    );
  }

  await ensureAuthenticatedProfile();

  const sourceUrl = toPublicSourceUrl(input.sourceUrl);
  const source = await insertSource({
    sourceUrl,
    sourceTitle: input.sourceTitle,
    sourceQuality: input.sourceQuality
  });

  if (target === "seed") {
    const { data, error } = await supabase
      .from("seed_evidence_entries")
      .insert({
        seed_claim_id: claimId,
        stance: input.stance,
        assessment_target: input.assessmentTarget,
        summary: input.summary.trim(),
        source_id: source.id,
        source_url: sourceUrl,
        is_ai_generated: input.aiAssisted,
        ai_disclosure: input.aiAssisted ? "Submitted as an AI-assisted summary." : null
      })
      .select(
        "id, seed_claim_id, stance, assessment_target, summary, source_id, source_url, submitted_by, is_ai_generated, ai_disclosure, model_used, tool_used, created_at, updated_at"
      )
      .single();

    if (error) {
      throw new Error(`Seed evidence insert failed: ${error.message}`);
    }

    return mapSeedEvidence({ ...data, sources: source });
  }

  const { data, error } = await supabase
    .from("evidence_entries")
    .insert({
      claim_id: claimId,
      stance: input.stance,
      assessment_target: input.assessmentTarget,
      summary: input.summary.trim(),
      source_id: source.id,
      source_url: sourceUrl,
      is_ai_generated: input.aiAssisted,
      ai_disclosure: input.aiAssisted ? "Submitted as an AI-assisted summary." : null
    })
    .select(
      "id, claim_id, stance, assessment_target, summary, source_id, source_url, submitted_by, is_ai_generated, ai_disclosure, model_used, tool_used, created_at, updated_at"
    )
    .single();

  if (error) {
    throw new Error(`Evidence insert failed: ${error.message}`);
  }

  return mapEvidence({ ...data, sources: source });
}
