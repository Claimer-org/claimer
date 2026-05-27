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
export type AnalyticsEventName = "page_view";
export type FeedbackUseCase =
  | "browse_claims"
  | "submit_claim"
  | "add_evidence"
  | "research_decision"
  | "other";
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

export type AnalyticsEventRow = {
  id: UUID;
  event_name: AnalyticsEventName;
  path: string;
  visitor_id: UUID;
  session_id: UUID;
  claim_id: string | null;
  referrer_origin: string | null;
  properties: Record<string, unknown>;
  created_at: Timestamp;
};

export type AnalyticsEventInsert = {
  id?: UUID;
  event_name: AnalyticsEventName;
  path: string;
  visitor_id: UUID;
  session_id: UUID;
  claim_id?: string | null;
  referrer_origin?: string | null;
  properties?: Record<string, unknown>;
  created_at?: Timestamp;
};

export type AnalyticsEventUpdate = Partial<
  Omit<AnalyticsEventInsert, "event_name" | "visitor_id" | "session_id">
>;

export type FeedbackEntryRow = {
  id: UUID;
  page_path: string;
  visitor_id: UUID | null;
  use_case: FeedbackUseCase;
  rating: number;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: Timestamp;
};

export type FeedbackEntryInsert = {
  id?: UUID;
  page_path: string;
  visitor_id?: UUID | null;
  use_case: FeedbackUseCase;
  rating: number;
  summary: string;
  metadata?: Record<string, unknown>;
  created_at?: Timestamp;
};

export type FeedbackEntryUpdate = Partial<FeedbackEntryInsert>;

// Public growth labels are sanitized in SQL to safe tokens or redaction buckets.
export type PublicGrowthLabel = string;
export type PublicGrowthPath = string;

export type GrowthChannelDetail = {
  source: PublicGrowthLabel;
  visitors: number;
  page_views: number;
};

export type GrowthCampaignDetail = {
  utm_source: PublicGrowthLabel;
  utm_content: PublicGrowthLabel;
  ref: PublicGrowthLabel;
  landing_path: PublicGrowthPath;
  visitors: number;
  page_views: number;
};

export type GrowthFeedbackUseCaseDetail = {
  use_case: FeedbackUseCase;
  count: number;
  average_rating: number;
};

export type GrowthFeedbackSourceEventDetail = {
  source_event: PublicGrowthLabel;
  utm_source: PublicGrowthLabel;
  utm_content: PublicGrowthLabel;
  ref: PublicGrowthLabel;
  page_path: PublicGrowthPath;
  count: number;
  average_rating: number;
};

export type GrowthPathDetail = {
  path: PublicGrowthPath;
  page_views: number;
  visitors: number;
};

export type GrowthSnapshotDetail = Record<string, unknown> & {
  channels?: GrowthChannelDetail[];
  campaigns?: GrowthCampaignDetail[];
  use_cases?: GrowthFeedbackUseCaseDetail[];
  source_events?: GrowthFeedbackSourceEventDetail[];
  top_paths?: GrowthPathDetail[];
};

export type GrowthSnapshotRow = {
  metric: string;
  label: string;
  value: number;
  window_label: string;
  detail: GrowthSnapshotDetail;
  sort_order: number;
};

export type RelationshipContract = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type TableContract<
  Row,
  Insert,
  Update,
  Relationships extends RelationshipContract[] = []
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

export type FunctionContract<Args, Returns> = {
  Args: Args;
  Returns: Returns;
};

export type SupabaseDatabase = {
  public: {
    Tables: {
      profiles: TableContract<ProfileRow, ProfileInsert, ProfileUpdate>;
      sources: TableContract<
        SourceRow,
        SourceInsert,
        SourceUpdate,
        [
          {
            foreignKeyName: "sources_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      claims: TableContract<
        ClaimRow,
        ClaimInsert,
        ClaimUpdate,
        [
          {
            foreignKeyName: "claims_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "claims_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      evidence_entries: TableContract<
        EvidenceEntryRow,
        EvidenceEntryInsert,
        EvidenceEntryUpdate,
        [
          {
            foreignKeyName: "evidence_entries_claim_id_fkey";
            columns: ["claim_id"];
            isOneToOne: false;
            referencedRelation: "claims";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidence_entries_source_id_fkey";
            columns: ["source_id"];
            isOneToOne: false;
            referencedRelation: "sources";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "evidence_entries_submitted_by_fkey";
            columns: ["submitted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      attribution_scores: TableContract<
        AttributionScoreRow,
        AttributionScoreInsert,
        AttributionScoreUpdate,
        [
          {
            foreignKeyName: "attribution_scores_claim_id_fkey";
            columns: ["claim_id"];
            isOneToOne: false;
            referencedRelation: "claims";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attribution_scores_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      veracity_scores: TableContract<
        VeracityScoreRow,
        VeracityScoreInsert,
        VeracityScoreUpdate,
        [
          {
            foreignKeyName: "veracity_scores_claim_id_fkey";
            columns: ["claim_id"];
            isOneToOne: false;
            referencedRelation: "claims";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "veracity_scores_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ]
      >;
      analytics_events: TableContract<
        AnalyticsEventRow,
        AnalyticsEventInsert,
        AnalyticsEventUpdate
      >;
      feedback_entries: TableContract<
        FeedbackEntryRow,
        FeedbackEntryInsert,
        FeedbackEntryUpdate
      >;
    };
    Views: Record<string, never>;
    Functions: {
      get_growth_snapshot: FunctionContract<
        Record<PropertyKey, never>,
        GrowthSnapshotRow[]
      >;
    };
    Enums: {
      claim_domain: ClaimDomain;
      claim_stance: ClaimStance;
      assessment_target: AssessmentTarget;
      source_quality: SourceQuality;
      score_method: ScoreMethod;
      public_subject_kind: PublicSubjectKind;
      analytics_event_name: AnalyticsEventName;
    };
    CompositeTypes: Record<string, never>;
  };
};
