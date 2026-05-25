export type UUID = string;
export type Timestamp = string;

export type ClaimDomain = "ai" | "news" | "technology";
export type ClaimStance = "support" | "challenge" | "context";
export type AssessmentTarget = "attribution" | "veracity" | "context";
export type SourceQuality =
  | "primary"
  | "direct_witness"
  | "reputable_secondary"
  | "indirect_secondary"
  | "unverifiable";
export type ScoreMethod = "community" | "ai_assisted" | "manual_seed";
export type PublicSubjectKind =
  | "company"
  | "organization"
  | "public_official"
  | "public_figure"
  | "product"
  | "policy"
  | "event"
  | "publication"
  | "other_public";

declare const publicSourceUrlBrand: unique symbol;

export type HttpSourceUrl = `http://${string}` | `https://${string}`;
export type PublicSourceUrl = HttpSourceUrl & {
  readonly [publicSourceUrlBrand]: true;
};

export function isPublicSourceUrl(value: string): value is PublicSourceUrl {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const normalizedHostname = hostname.replace(/^\[|\]$/g, "");

    if (
      (url.protocol !== "http:" && url.protocol !== "https:") ||
      !hostname ||
      url.username !== "" ||
      url.password !== ""
    ) {
      return false;
    }

    if (
      normalizedHostname === "localhost" ||
      normalizedHostname.endsWith(".localhost") ||
      normalizedHostname.endsWith(".local")
    ) {
      return false;
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
        return false;
      }
    }

    if (
      normalizedHostname.includes(":") &&
      (normalizedHostname === "::1" ||
        normalizedHostname.startsWith("fc") ||
        normalizedHostname.startsWith("fd") ||
        normalizedHostname.startsWith("fe80:"))
    ) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

export type AiDisclosureInput =
  | {
      is_ai_generated?: false;
      ai_disclosure?: string | null;
    }
  | {
      is_ai_generated: true;
      ai_disclosure: string;
    };

export type ProfileRow = {
  id: UUID;
  display_name: string;
  handle: string | null;
  bio: string | null;
  reputation_points: number;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ProfileInsert = {
  id: UUID;
  display_name: string;
  handle?: string | null;
  bio?: string | null;
  reputation_points?: number;
  created_at?: Timestamp;
  updated_at?: Timestamp;
};

export type ProfileUpdate = Partial<ProfileInsert>;

export type SourceRow = {
  id: UUID;
  url: string;
  title: string | null;
  publisher: string | null;
  published_at: Timestamp | null;
  quality: SourceQuality;
  created_by: UUID | null;
  created_at: Timestamp;
};

export type SourceInsert = {
  id?: UUID;
  url: PublicSourceUrl;
  title?: string | null;
  publisher?: string | null;
  published_at?: Timestamp | null;
  quality?: SourceQuality;
  created_by?: UUID | null;
  created_at?: Timestamp;
};

export type SourceUpdate = Partial<SourceInsert>;

export type ClaimRow = {
  id: UUID;
  domain: ClaimDomain;
  title: string;
  body: string | null;
  claimant_name: string | null;
  subject_kind: PublicSubjectKind;
  source_id: UUID | null;
  source_url: string;
  submitted_by: UUID;
  is_ai_generated: boolean;
  ai_disclosure: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type ClaimInsert = {
  id?: UUID;
  domain: ClaimDomain;
  title: string;
  body?: string | null;
  claimant_name?: string | null;
  subject_kind: PublicSubjectKind;
  source_id?: UUID | null;
  source_url: PublicSourceUrl;
  submitted_by?: UUID;
  created_at?: Timestamp;
  updated_at?: Timestamp;
} & AiDisclosureInput;

export type ClaimSubmissionInput = Omit<
  ClaimInsert,
  "id" | "created_at" | "updated_at"
>;

export type ClaimUpdate = Partial<Omit<ClaimInsert, "submitted_by">>;

export type EvidenceEntryRow = {
  id: UUID;
  claim_id: UUID;
  stance: ClaimStance;
  assessment_target: AssessmentTarget;
  summary: string;
  source_id: UUID | null;
  source_url: string;
  submitted_by: UUID;
  is_ai_generated: boolean;
  ai_disclosure: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type EvidenceEntryInsert = {
  id?: UUID;
  claim_id: UUID;
  stance: ClaimStance;
  assessment_target?: AssessmentTarget;
  summary: string;
  source_id?: UUID | null;
  source_url: PublicSourceUrl;
  submitted_by?: UUID;
  created_at?: Timestamp;
  updated_at?: Timestamp;
} & AiDisclosureInput;

export type EvidenceSubmissionInput = Omit<
  EvidenceEntryInsert,
  "id" | "created_at" | "updated_at"
>;

export type EvidenceEntryUpdate = Partial<
  Omit<EvidenceEntryInsert, "claim_id" | "submitted_by">
>;

export type AttributionScoreRow = {
  id: UUID;
  claim_id: UUID;
  score: number;
  method: ScoreMethod;
  explanation: string;
  created_by: UUID;
  created_at: Timestamp;
};

export type AttributionScoreInsert = {
  id?: UUID;
  claim_id: UUID;
  score: number;
  method?: ScoreMethod;
  explanation: string;
  created_by?: UUID;
  created_at?: Timestamp;
};

export type AttributionScoreUpdate = Partial<
  Omit<AttributionScoreInsert, "claim_id" | "created_by">
>;

export type VeracityScoreRow = {
  id: UUID;
  claim_id: UUID;
  score: number;
  method: ScoreMethod;
  explanation: string;
  created_by: UUID;
  created_at: Timestamp;
};

export type VeracityScoreInsert = {
  id?: UUID;
  claim_id: UUID;
  score: number;
  method?: ScoreMethod;
  explanation: string;
  created_by?: UUID;
  created_at?: Timestamp;
};

export type VeracityScoreUpdate = Partial<
  Omit<VeracityScoreInsert, "claim_id" | "created_by">
>;

export type TableContract<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type SupabaseDatabase = {
  public: {
    Tables: {
      profiles: TableContract<ProfileRow, ProfileInsert, ProfileUpdate>;
      sources: TableContract<SourceRow, SourceInsert, SourceUpdate>;
      claims: TableContract<ClaimRow, ClaimInsert, ClaimUpdate>;
      evidence_entries: TableContract<
        EvidenceEntryRow,
        EvidenceEntryInsert,
        EvidenceEntryUpdate
      >;
      attribution_scores: TableContract<
        AttributionScoreRow,
        AttributionScoreInsert,
        AttributionScoreUpdate
      >;
      veracity_scores: TableContract<
        VeracityScoreRow,
        VeracityScoreInsert,
        VeracityScoreUpdate
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      claim_domain: ClaimDomain;
      claim_stance: ClaimStance;
      assessment_target: AssessmentTarget;
      source_quality: SourceQuality;
      score_method: ScoreMethod;
      public_subject_kind: PublicSubjectKind;
    };
    CompositeTypes: Record<string, never>;
  };
};
