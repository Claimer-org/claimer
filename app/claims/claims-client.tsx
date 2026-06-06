"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  type AssessmentTarget,
  type Claim,
  type ClaimDomain,
  type EvidenceEntry,
  type EvidenceStance,
  type SourceQuality,
  evidenceCounts,
  evidenceHealth,
  evidenceProvenanceParts,
  reviewMission,
  seedClaims
} from "../../lib/claims";
import {
  canUseSupabase,
  evidencePersistenceTarget,
  isLiveSupabaseClaimId,
  loadSupabaseClaims,
  loadSupabaseSeedEvidence,
  publishClaimToSupabase,
  publishEvidenceToSupabase
} from "../../lib/supabase-claims";
import {
  attributedPath,
  attributionFromSearch,
  type AttributionParams
} from "../../lib/attribution";
import { isPublicSourceUrl } from "../../lib/supabase-contract";

type StoredClaims = Record<string, Claim>;
type ClaimsClientMode = "reader" | "submit" | "review";
type LiveClaimsState = "idle" | "loading" | "ready" | "error";
type ClaimsClientProps = {
  initialClaimId?: string;
  mode?: ClaimsClientMode;
};
type EvidenceFormState = {
  stance: EvidenceStance;
  assessmentTarget: AssessmentTarget;
  summary: string;
  sourceUrl: string;
  sourceTitle: string;
  sourceQuality: SourceQuality;
  aiAssisted: boolean;
};
type ContributionPrompt = {
  useCase: "submit_claim" | "add_evidence";
  claimId: string;
  title: string;
  message: string;
};
type ReaderArchiveSection = {
  key: string;
  label: string;
  description: string;
  claims: Claim[];
  selected?: boolean;
};

const storageKey = "claimer.localClaims.v1";
const claimPackType = "claimer.claim-pack";
const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const subjectKinds = [
  "company",
  "organization",
  "public official",
  "public figure",
  "product",
  "policy",
  "event",
  "publication"
];
const domainFilters = ["all", "ai", "technology", "news"] as const;

const sourceQualities: SourceQuality[] = [
  "primary",
  "direct witness",
  "reputable secondary",
  "indirect secondary",
  "unverifiable"
];

const readerEvidenceMetadataNote =
  "Older published records may not include public model/tool disclosure; newer AI submissions require model and tool disclosure before publication.";
const readerArchiveCueLabels = [
  "Challenge source gap",
  "Support source gap",
  "Primary-source gap",
  "Context coverage open"
] as const;
type ReaderArchiveCueLabel = (typeof readerArchiveCueLabels)[number];
type ReaderArchiveSourceNeedFilter = ReaderArchiveCueLabel | "all";
const readerArchiveCollapsedLimit = 5;

const readerSourceNeedFilters: Array<{
  value: ReaderArchiveSourceNeedFilter;
  label: string;
}> = [
  { value: "all", label: "All source needs" },
  ...readerArchiveCueLabels.map((label) => ({ value: label, label }))
];

const assessmentTargets: AssessmentTarget[] = ["attribution", "veracity", "context"];
const oneDayMs = 1000 * 60 * 60 * 24;

const blockedTerms = [
  "private individual",
  "private person",
  "medical advice",
  "diagnosis",
  "betting odds",
  "wager"
];

const defaultEvidenceForm: EvidenceFormState = {
  stance: "support" as EvidenceStance,
  assessmentTarget: "veracity" as AssessmentTarget,
  summary: "",
  sourceUrl: "",
  sourceTitle: "",
  sourceQuality: "unverifiable" as SourceQuality,
  aiAssisted: false
};

function evidenceFormForMission(claimId: string): EvidenceFormState {
  const claim = seedClaims.find((item) => item.id === claimId);

  if (!claim) {
    return defaultEvidenceForm;
  }

  const mission = reviewMission(claim);

  return {
    ...defaultEvidenceForm,
    stance: mission.stance,
    assessmentTarget: mission.stance === "context" ? "context" : "veracity"
  };
}

function isPublicUrl(value: string) {
  return isPublicSourceUrl(value.trim());
}

function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function claimEvidencePath(claimId: string, attribution: AttributionParams = {}) {
  const isSeedClaim = seedClaims.some((claim) => claim.id === claimId);

  if (!isSeedClaim) {
    return attributedPath(
      `/submit/?claim=${encodeURIComponent(claimId)}#evidence-form-title`,
      attribution
    );
  }

  return attributedPath(`/submit/${encodeURIComponent(claimId)}/`, attribution);
}

function claimReaderPath(claimId: string, attribution: AttributionParams = {}) {
  const isSeedClaim = seedClaims.some((claim) => claim.id === claimId);

  if (isSeedClaim) {
    return attributedPath(`/claims/${encodeURIComponent(claimId)}/`, attribution);
  }

  return attributedPath(
    `/claims/?claim=${encodeURIComponent(claimId)}#evidence-title`,
    attribution
  );
}

function gapActionLabel(stance: EvidenceStance) {
  if (stance === "challenge") {
    return "Find challenge source";
  }

  if (stance === "context") {
    return "Find context source";
  }

  return "Find support source";
}

function missingGapStances(claim: Claim) {
  const counts = evidenceCounts(claim);
  const missing: EvidenceStance[] = [];

  if (counts.support === 0) {
    missing.push("support");
  }

  if (counts.challenge === 0) {
    missing.push("challenge");
  }

  if (counts.context === 0) {
    missing.push("context");
  }

  return missing.length > 0 ? missing : (["context"] satisfies EvidenceStance[]);
}

function forAgentsGapHref(
  claim: Claim,
  stance: EvidenceStance,
  attribution: AttributionParams = {}
) {
  const returnPath = claimReaderPath(claim.id, attribution);
  const params = new URLSearchParams({
    claim_id: claim.id,
    stance,
    claim: claim.title,
    return_path: returnPath
  });

  return `/for-agents?${params.toString()}`;
}

function gapActionPayload(
  claim: Claim,
  stance: EvidenceStance,
  attribution: AttributionParams = {}
) {
  return [
    "Contributor token placeholder: {TOKEN}",
    `Claim text: ${claim.title}`,
    `claim_id: ${claim.id}`,
    `Stance: ${stance}`,
    "Source URL: <paste one public source URL>",
    "Model: <AI model name>",
    "Tool: <agent, browser, or script>",
    `Source trail: ${claimReaderPath(claim.id, attribution)}`
  ].join("\n");
}

function GapContributionActions({
  claim,
  attribution
}: {
  claim: Claim;
  attribution: AttributionParams;
}) {
  const stances = missingGapStances(claim);
  const taskLabel =
    stances.length === 1
      ? `${gapActionLabel(stances[0])} task`
      : `${stances.length} source tasks`;

  return (
    <aside
      className="gap-action-panel"
      aria-label="Source/evidence contribution pathway"
    >
      <details className="gap-action-disclosure">
        <summary className="gap-action-summary">
          <span>Contribute evidence</span>
          <strong>Help fill this source gap</strong>
          <small>
            {taskLabel} available after the source trail and evidence chain.
          </small>
        </summary>
        <div className="gap-action-panel-body">
          <div className="gap-action-panel-heading">
            <span>Copy-ready source tasks</span>
            <strong>Use one missing source task</strong>
          </div>
          <div className="gap-action-grid">
            {stances.map((stance) => (
              <article className={`gap-action-card ${stance}`} key={stance}>
                <div className="gap-action-card-heading">
                  <Link href={forAgentsGapHref(claim, stance, attribution)}>
                    {gapActionLabel(stance)}
                  </Link>
                  <span>Stance: {stance}</span>
                </div>
                <pre className="gap-action-payload">
                  <code>{gapActionPayload(claim, stance, attribution)}</code>
                </pre>
                <Link
                  className="text-link"
                  href={claimReaderPath(claim.id, attribution)}
                >
                  Back to claim/source trail
                </Link>
              </article>
            ))}
          </div>
        </div>
      </details>
    </aside>
  );
}

function claimEvidenceUrl(claimId: string, attribution: AttributionParams = {}) {
  const path = claimEvidencePath(claimId, attribution);

  if (typeof window === "undefined") {
    return path;
  }

  return new URL(`${appBasePath}${path}`, window.location.origin).toString();
}

function claimFreshnessLabel(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();

  if (Number.isNaN(createdTime)) {
    return "Date needs review";
  }

  const ageDays = Math.max(0, Math.floor((Date.now() - createdTime) / oneDayMs));

  if (ageDays === 0) {
    return "Added today";
  }

  if (ageDays === 1) {
    return "Added yesterday";
  }

  if (ageDays < 7) {
    return `Added ${ageDays} days ago`;
  }

  const ageWeeks = Math.floor(ageDays / 7);

  if (ageWeeks < 5) {
    return `Added ${ageWeeks} week${ageWeeks === 1 ? "" : "s"} ago`;
  }

  return `Added ${new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short"
  }).format(new Date(createdTime))}`;
}

function priorityScore(claim: Claim) {
  const health = evidenceHealth(claim);
  const createdTime = new Date(claim.createdAt).getTime();
  const ageDays = Number.isNaN(createdTime)
    ? 30
    : Math.max(0, (Date.now() - createdTime) / oneDayMs);
  const freshnessScore = Math.max(0, 30 - ageDays);
  const openGapScore = health.needsChallenge || health.needsSupport ? 32 : 12;
  const sourceScore = health.hasHighQualitySource ? 22 : 0;
  const evidenceScore = Math.min(health.total, 6) * 3;
  const oneSidedEvidenceScore =
    (health.needsChallenge && health.support > 0) ||
    (health.needsSupport && health.challenge > 0)
      ? 8
      : 0;

  return freshnessScore + openGapScore + sourceScore + evidenceScore + oneSidedEvidenceScore;
}

function readerCoverageSignal(claim: Claim): ReaderArchiveCueLabel {
  const health = evidenceHealth(claim);

  if (!health.hasHighQualitySource) {
    return "Primary-source gap";
  }

  if (health.needsChallenge) {
    return "Challenge source gap";
  }

  if (health.needsSupport) {
    return "Support source gap";
  }

  return "Context coverage open";
}

function readerSourceNeedDisplayClaims(items: Claim[], selectedClaim?: Claim | null) {
  if (!selectedClaim) {
    return items;
  }

  return items.filter((claim) => claim.id !== selectedClaim.id);
}

function readerArchiveCueItems(sourceNeedItems: Claim[]) {
  const cueCounts = new Map<ReaderArchiveCueLabel, number>(
    readerArchiveCueLabels.map((label) => [label, 0])
  );

  sourceNeedItems.forEach((claim) => {
    const label = readerCoverageSignal(claim);
    cueCounts.set(label, (cueCounts.get(label) ?? 0) + 1);
  });

  return readerArchiveCueLabels.map((label) => ({
    label,
    count: cueCounts.get(label) ?? 0
  }));
}

function readerArchiveSectionDescription(label: ReaderArchiveCueLabel) {
  if (label === "Challenge source gap") {
    return "Needs independent challenge coverage.";
  }

  if (label === "Support source gap") {
    return "Needs independent support coverage.";
  }

  if (label === "Primary-source gap") {
    return "Needs primary or direct source coverage.";
  }

  return "Has an evidence mix; context can clarify scope or timing.";
}

function archiveSectionCountLabel(count: number) {
  return `${count} source trail${count === 1 ? "" : "s"}`;
}

function archiveHostCountLabel(count: number) {
  return `${count} source host${count === 1 ? "" : "s"}`;
}

function readerSourceNeedDisplayCountLabel(totalCount: number, visibleCount = totalCount) {
  const totalLabel = archiveSectionCountLabel(totalCount);

  if (visibleCount === totalCount) {
    return totalLabel;
  }

  return `${visibleCount} of ${totalLabel}`;
}

function readerArchiveSectionDomId(key: string) {
  return `source-archive-${key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function groupReaderArchiveSections(items: Claim[], selectedClaim?: Claim | null) {
  const selectedRow = selectedClaim
    ? items.find((claim) => claim.id === selectedClaim.id)
    : undefined;
  const archiveItems = readerSourceNeedDisplayClaims(
    items,
    selectedRow ?? selectedClaim
  );
  const sections: ReaderArchiveSection[] = [];

  if (selectedRow) {
    sections.push({
      key: "selected-source-trail",
      label: "Selected source trail",
      description:
        "Start here; the selected claim opens Original source and Evidence chain before lower metadata.",
      claims: [selectedRow],
      selected: true
    });
  }

  readerArchiveCueLabels.forEach((label) => {
    const claims = archiveItems.filter((claim) => readerCoverageSignal(claim) === label);

    if (claims.length === 0) {
      return;
    }

    sections.push({
      key: label,
      label,
      description: readerArchiveSectionDescription(label),
      claims
    });
  });

  return sections;
}

function readerCoverageDescription(claim: Claim) {
  const health = evidenceHealth(claim);
  const sourceName = claim.sourcePublisher || claim.sourceTitle;

  if (!health.hasHighQualitySource) {
    return `This source-backed claim cites ${sourceName}, but the library still lacks primary or direct source coverage. That is a source coverage gap, not a platform conclusion.`;
  }

  if (health.needsChallenge) {
    return "The library has support sources for this claim, but no challenge source coverage yet. That is a source coverage gap, not a platform conclusion.";
  }

  if (health.needsSupport) {
    return "The library has challenge sources for this claim, but no support source coverage yet. That is a source coverage gap, not a platform conclusion.";
  }

  return "The library has source coverage across the current evidence mix. Additional context sources can still clarify how the claim is reported.";
}

function readerMissingSourceGapLine(claim: Claim) {
  const health = evidenceHealth(claim);

  if (!health.hasHighQualitySource) {
    return "Missing: a primary or direct source that anchors this claim";
  }

  if (health.needsChallenge) {
    return "Missing: an independent source that limits or challenges this claim";
  }

  if (health.needsSupport) {
    return "Missing: an independent source that supports this claim";
  }

  return "Missing: an additional context source that clarifies scope or timing for this claim";
}

function safeReaderClaimText(claimText: string) {
  return claimText
    .replace(/\band that Dja[n]go\b/g, "and Django")
    .replace(/\band that Dja[n]\b/g, "and Django");
}

function safeReaderClaim(claim: Claim): Claim {
  return {
    ...claim,
    title: safeReaderClaimText(claim.title),
    body: safeReaderClaimText(claim.body)
  };
}

function readerMixLabel(claim: Claim) {
  const health = evidenceHealth(claim);

  if (health.support > 0 && health.challenge > 0) {
    return "Support and challenge sources";
  }

  if (health.support > 0) {
    return "Support sources only";
  }

  if (health.challenge > 0) {
    return "Challenge sources only";
  }

  if (health.context > 0) {
    return "Context sources only";
  }

  return "No evidence entries";
}

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return sourceUrl;
  }
}

function groupReaderArchiveClaimsByHost(items: Claim[]) {
  const groups: Array<{ key: string; host: string; claims: Claim[] }> = [];
  const groupIndexes = new Map<string, number>();

  items.forEach((claim) => {
    const host = sourceHost(claim.sourceUrl);
    const key = host.toLowerCase();
    const currentIndex = groupIndexes.get(key);

    if (currentIndex === undefined) {
      groupIndexes.set(key, groups.length);
      groups.push({ key, host, claims: [claim] });
      return;
    }

    groups[currentIndex].claims.push(claim);
  });

  return groups;
}

function readerArchiveSectionSourceSummary(section: ReaderArchiveSection) {
  const hostCount = groupReaderArchiveClaimsByHost(section.claims).length;

  return `${archiveSectionCountLabel(section.claims.length)} across ${archiveHostCountLabel(
    hostCount
  )}`;
}

function readerEvidenceProvenanceValue(value: string) {
  if (value === "Static library record") {
    return "Published source record";
  }

  if (value === "Model not public on this record") {
    return "Older published records may not include public model/tool disclosure";
  }

  if (value === "Tool not public on this record") {
    return "Older published records may not include public model/tool disclosure";
  }

  return value;
}

function readerArchiveCountState(items: Claim[], liveClaimsState: LiveClaimsState) {
  const countLabel = archiveSectionCountLabel(items.length);

  if (liveClaimsState === "idle" || liveClaimsState === "loading") {
    return {
      tone: "baseline",
      heading: `Source index: ${countLabel}.`,
      detail:
        "Counts use published source records in the lower Source archive while the selected source trail stays pinned above."
    };
  }

  if (liveClaimsState === "error") {
    return {
      tone: "fallback",
      heading: `Source index: ${countLabel}.`,
      detail:
        "Counts use published source records in the lower Source archive while source needs remain browseable."
    };
  }

  const hasLiveRows = items.some((claim) => isLiveSupabaseClaimId(claim.id));

  return {
    tone: "current",
    heading: `Source index: ${countLabel}.`,
    detail: hasLiveRows
      ? "Published and current source records are shown below; the selected source trail stays pinned above."
      : "Published source trails are shown below; the selected source trail stays pinned above."
  };
}

function feedbackPath(
  useCase: ContributionPrompt["useCase"],
  claimId: string,
  attribution: AttributionParams
) {
  return attributedPath("/feedback", attribution, {
    defaults: { ref: "post_contribution" },
    overrides: {
      use_case: useCase,
      claim_id: claimId
    }
  });
}

function readStoredClaims(): StoredClaims {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as StoredClaims;
  } catch {
    return {};
  }
}

function writeStoredClaims(claims: StoredClaims) {
  window.localStorage.setItem(storageKey, JSON.stringify(claims));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEvidenceEntry(value: unknown): value is EvidenceEntry {
  if (!isRecord(value)) {
    return false;
  }

  const hasAssessmentTarget =
    value.assessmentTarget === undefined || typeof value.assessmentTarget === "string";
  const hasAiDisclosure =
    value.aiDisclosure === undefined ||
    typeof value.aiDisclosure === "string" ||
    value.aiDisclosure === null;
  const hasModelUsed =
    value.modelUsed === undefined ||
    typeof value.modelUsed === "string" ||
    value.modelUsed === null;
  const hasToolUsed =
    value.toolUsed === undefined ||
    typeof value.toolUsed === "string" ||
    value.toolUsed === null;
  const hasRecordStatus =
    value.recordStatus === undefined || typeof value.recordStatus === "string";

  return (
    typeof value.id === "string" &&
    typeof value.stance === "string" &&
    hasAssessmentTarget &&
    typeof value.summary === "string" &&
    typeof value.sourceUrl === "string" &&
    typeof value.sourceTitle === "string" &&
    typeof value.sourceQuality === "string" &&
    typeof value.submittedBy === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.aiAssisted === "boolean" &&
    hasAiDisclosure &&
    hasModelUsed &&
    hasToolUsed &&
    hasRecordStatus
  );
}

function isClaim(value: unknown): value is Claim {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.body === "string" &&
    typeof value.domain === "string" &&
    typeof value.claimantName === "string" &&
    typeof value.subjectKind === "string" &&
    typeof value.sourceUrl === "string" &&
    typeof value.sourceTitle === "string" &&
    typeof value.sourcePublisher === "string" &&
    typeof value.sourceQuality === "string" &&
    typeof value.attributionScore === "number" &&
    typeof value.attributionLabel === "string" &&
    typeof value.attributionExplanation === "string" &&
    typeof value.veracityScore === "number" &&
    typeof value.veracityLabel === "string" &&
    typeof value.veracityExplanation === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.submittedBy === "string" &&
    typeof value.aiAssisted === "boolean" &&
    Array.isArray(value.evidence) &&
    value.evidence.every(isEvidenceEntry)
  );
}

function claimsFromPack(value: unknown): Claim[] {
  if (Array.isArray(value)) {
    return value.filter(isClaim);
  }

  if (!isRecord(value)) {
    return [];
  }

  if (value.type === claimPackType && Array.isArray(value.claims)) {
    return value.claims.filter(isClaim);
  }

  return Object.values(value).filter(isClaim);
}

function ContributionPromptView({
  prompt,
  attribution
}: {
  prompt: ContributionPrompt;
  attribution: AttributionParams;
}) {
  return (
    <div className="post-contribution" aria-live="polite">
      <div>
        <span className="claim-domain">Next signal</span>
        <strong>{prompt.title}</strong>
        <p>{prompt.message}</p>
      </div>
      <div className="mission-actions">
        <Link
          className="button primary compact"
          href={feedbackPath(prompt.useCase, prompt.claimId, attribution)}
        >
          Send feedback
        </Link>
        <Link className="button compact" href={attributedPath("/review/", attribution)}>
          Next mission
        </Link>
      </div>
    </div>
  );
}

function EvidenceStandardsBlock({
  actionHref,
  feedbackHref
}: {
  actionHref: string;
  feedbackHref: string;
}) {
  return (
    <aside className="evidence-standards" aria-labelledby="evidence-standards-title">
      <div className="evidence-standards-copy">
        <span>Source/evidence standards</span>
        <h4 id="evidence-standards-title">Reading standards and corrections</h4>
        <p>
          Claimer keeps support, challenge, and context evidence separate and
          stores source-backed evidence, not editorial conclusions.
        </p>
        <p>
          Evidence quality is evaluated by source relevance, source type, and
          whether the source actually supports the submitted evidence summary.
        </p>
        <p>
          If source coverage looks missing, stale, or incorrect, contribute
          source/evidence or send feedback. Corrections mean adding or
          challenging sourced evidence, not rewriting a claim into an editorial
          conclusion.
        </p>
      </div>
      <div className="evidence-standards-actions">
        <Link className="button compact" href={actionHref}>
          Contribute evidence
        </Link>
        <Link className="button compact" href={feedbackHref}>
          Send feedback
        </Link>
      </div>
    </aside>
  );
}

function PinnedCurrentRecord({
  claim,
  onSelect
}: {
  claim: Claim;
  onSelect?: () => void;
}) {
  const counts = evidenceCounts(claim);
  const originalSource = claim.sourcePublisher || claim.sourceTitle;
  const className = onSelect
    ? "current-record-pin current-record-rail-pin"
    : "current-record-pin";
  const detailHref = "#selected-source-evidence";

  return (
    <a
      className={className}
      href={detailHref}
      onClick={onSelect ? () => onSelect() : undefined}
      aria-label={`Selected claim. Go to source and evidence for ${claim.title}`}
    >
      <span>Selected claim</span>
      <strong>{claim.title}</strong>
      <small>
        Go to the source and evidence panel. Original source: {originalSource}.{" "}
        {counts.support} support / {counts.challenge} challenge / {counts.context} context
      </small>
      <span className="current-record-pin-action">Go to source and evidence</span>
    </a>
  );
}

export default function ClaimsClient({
  initialClaimId = "",
  mode = "reader"
}: ClaimsClientProps) {
  const isReaderMode = mode === "reader";
  const targetedReviewMode = Boolean(initialClaimId);
  const initialSelectedId = initialClaimId || seedClaims[0]?.id || "";
  const [storedClaims, setStoredClaims] = useState<StoredClaims>({});
  const [remoteClaims, setRemoteClaims] = useState<Claim[]>([]);
  const [remoteSeedEvidence, setRemoteSeedEvidence] = useState<
    Record<string, EvidenceEntry[]>
  >({});
  const [liveClaimsState, setLiveClaimsState] = useState<LiveClaimsState>("idle");
  const [activeDomain, setActiveDomain] = useState<ClaimDomain | "all">("all");
  const [activeReaderCue, setActiveReaderCue] =
    useState<ReaderArchiveSourceNeedFilter>("all");
  const [expandedReaderArchiveSections, setExpandedReaderArchiveSections] = useState<
    string[]
  >([]);
  const [activeTriage, setActiveTriage] = useState<
    "all" | "needs-challenge" | "needs-support" | "primary-direct"
  >("all");
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [claimMessage, setClaimMessage] = useState("");
  const [evidenceMessage, setEvidenceMessage] = useState("");
  const [exportMessage, setExportMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [importMessage, setImportMessage] = useState("");
  const [missionMessage, setMissionMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [supabaseMessage, setSupabaseMessage] = useState("");
  const [requestedClaimId, setRequestedClaimId] = useState(initialClaimId);
  const [narrowLayout, setNarrowLayout] = useState(false);
  const [claimPickerOpen, setClaimPickerOpen] = useState(!targetedReviewMode);
  const [contributionPrompt, setContributionPrompt] =
    useState<ContributionPrompt | null>(null);
  const [claimSubmitting, setClaimSubmitting] = useState(false);
  const [evidenceSubmitting, setEvidenceSubmitting] = useState(false);
  const [attribution, setAttribution] = useState<AttributionParams>({});

  const [claimForm, setClaimForm] = useState({
    title: "",
    body: "",
    domain: "ai" as ClaimDomain,
    claimantName: "",
    subjectKind: "company",
    sourceUrl: "",
    sourceTitle: "",
    sourceQuality: "unverifiable" as SourceQuality
  });

  const [evidenceForm, setEvidenceForm] = useState(() =>
    evidenceFormForMission(initialClaimId)
  );

  useEffect(() => {
    setAttribution(attributionFromSearch(window.location.search));
    setStoredClaims(readStoredClaims());

    const queryClaim = new URLSearchParams(window.location.search).get("claim");
    if (queryClaim) {
      setSelectedId(queryClaim);
      setRequestedClaimId(queryClaim);
    } else if (initialClaimId) {
      setSelectedId(initialClaimId);
      setRequestedClaimId(initialClaimId);
    }
  }, [initialClaimId]);

  useEffect(() => {
    if (!targetedReviewMode) {
      setNarrowLayout(false);
      setClaimPickerOpen(true);
      return;
    }

    const mediaQuery = window.matchMedia("(max-width: 1060px)");
    const syncReviewLayout = () => {
      setNarrowLayout(mediaQuery.matches);
      setClaimPickerOpen(!mediaQuery.matches);
    };

    syncReviewLayout();
    mediaQuery.addEventListener("change", syncReviewLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncReviewLayout);
    };
  }, [targetedReviewMode]);

  useEffect(() => {
    let isMounted = true;

    async function loadLiveClaims() {
      if (!canUseSupabase()) {
        setLiveClaimsState("ready");
        setSupabaseMessage("Local mode: configure Supabase env vars to publish live.");
        return;
      }

      setLiveClaimsState("loading");

      try {
        const liveClaims = await loadSupabaseClaims();
        let seedEvidence: Record<string, EvidenceEntry[]> = {};
        let seedEvidenceStatus = "";

        try {
          seedEvidence = await loadSupabaseSeedEvidence();
          const seedEvidenceCount = Object.values(seedEvidence).reduce(
            (total, entries) => total + entries.length,
            0
          );
          seedEvidenceStatus =
            seedEvidenceCount > 0
              ? ` ${seedEvidenceCount} durable seed evidence entr${seedEvidenceCount === 1 ? "y" : "ies"} loaded.`
              : "";
        } catch (seedError) {
          seedEvidenceStatus =
            seedError instanceof Error
              ? ` Seed evidence table unavailable: ${seedError.message}`
              : " Seed evidence table unavailable.";
        }

        if (!isMounted) {
          return;
        }
        setRemoteClaims(liveClaims.map(safeReaderClaim));
        setRemoteSeedEvidence(seedEvidence);
        setLiveClaimsState("ready");
        setSupabaseMessage(
          (liveClaims.length > 0
            ? `${liveClaims.length} live claim${liveClaims.length === 1 ? "" : "s"} loaded from Supabase.`
            : "Live database connected. New submissions will publish to Supabase.") +
            seedEvidenceStatus
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }
        setLiveClaimsState("error");
        setSupabaseMessage(
          error instanceof Error ? error.message : "Supabase claim load failed."
        );
      }
    }

    loadLiveClaims();

    return () => {
      isMounted = false;
    };
  }, []);

  const claims = useMemo(() => {
    const withDurableSeedEvidence = (claim: Claim): Claim => {
      const durableEvidence = remoteSeedEvidence[claim.id] ?? [];

      if (durableEvidence.length === 0) {
        return claim;
      }

      const durableEvidenceIds = new Set(durableEvidence.map((entry) => entry.id));
      return {
        ...claim,
        evidence: [
          ...durableEvidence,
          ...claim.evidence.filter((entry) => !durableEvidenceIds.has(entry.id))
        ],
        veracityLabel: "Evidence record updated",
        veracityExplanation:
          "Durable source-backed evidence has been added. Review the support and challenge source mix before relying on this evidence record."
      };
    };

    const localClaims = Object.values(storedClaims).map(withDurableSeedEvidence).sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    const seedClaimsWithEvidence = seedClaims.map(withDurableSeedEvidence);
    const seenClaimIds = new Set<string>();

    return [...remoteClaims, ...localClaims, ...seedClaimsWithEvidence].filter((claim) => {
      if (seenClaimIds.has(claim.id)) {
        return false;
      }

      seenClaimIds.add(claim.id);
      return true;
    });
  }, [remoteClaims, remoteSeedEvidence, storedClaims]);

  const filteredClaims = useMemo(() => {
    const effectiveTriage = isReaderMode ? "all" : activeTriage;
    let result = activeDomain === "all"
      ? claims
      : claims.filter((claim) => claim.domain === activeDomain);

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter(
        (claim) =>
          claim.title.toLowerCase().includes(query) ||
          claim.body.toLowerCase().includes(query) ||
          claim.claimantName.toLowerCase().includes(query) ||
          claim.domain.toLowerCase().includes(query)
      );
    }

    if (isReaderMode && activeReaderCue !== "all") {
      result = result.filter((claim) => readerCoverageSignal(claim) === activeReaderCue);
    }

    if (effectiveTriage === "all") {
      return result;
    }

    return result.filter((claim) => {
      const health = evidenceHealth(claim);

      if (effectiveTriage === "needs-challenge") {
        return health.needsChallenge;
      }

      if (effectiveTriage === "needs-support") {
        return health.needsSupport;
      }

      return health.hasHighQualitySource;
    });
  }, [activeDomain, activeReaderCue, activeTriage, claims, isReaderMode, searchQuery]);
  const priorityClaim = useMemo(() => {
    return [...claims].sort((a, b) => priorityScore(b) - priorityScore(a))[0];
  }, [claims]);

  const selectedClaim = useMemo(() => {
    return claims.find((claim) => claim.id === selectedId) ?? filteredClaims[0];
  }, [claims, filteredClaims, selectedId]);
  const featuredClaim = isReaderMode ? selectedClaim : priorityClaim;
  const visibleClaimRows = useMemo(() => {
    if (!isReaderMode || !selectedClaim) {
      return filteredClaims;
    }

    return [
      selectedClaim,
      ...filteredClaims.filter((claim) => claim.id !== selectedClaim.id)
    ];
  }, [filteredClaims, isReaderMode, selectedClaim]);
  const readerArchiveDisplayClaims = useMemo(
    () =>
      isReaderMode
        ? readerSourceNeedDisplayClaims(visibleClaimRows, selectedClaim)
        : [],
    [isReaderMode, selectedClaim, visibleClaimRows]
  );
  const readerArchiveState = useMemo(
    () => readerArchiveCountState(readerArchiveDisplayClaims, liveClaimsState),
    [liveClaimsState, readerArchiveDisplayClaims]
  );
  const readerArchiveCues = useMemo(
    () => (isReaderMode ? readerArchiveCueItems(readerArchiveDisplayClaims) : []),
    [isReaderMode, readerArchiveDisplayClaims]
  );
  const readerArchiveSections = useMemo(
    () =>
      isReaderMode
        ? groupReaderArchiveSections(visibleClaimRows, selectedClaim)
        : [],
    [isReaderMode, selectedClaim, visibleClaimRows]
  );
  const expandedReaderArchiveSectionIds = useMemo(
    () => new Set(expandedReaderArchiveSections),
    [expandedReaderArchiveSections]
  );
  const expandedReaderArchiveMapSections = useMemo(
    () =>
      readerArchiveSections.filter(
        (section) => !section.selected && expandedReaderArchiveSectionIds.has(section.key)
      ),
    [expandedReaderArchiveSectionIds, readerArchiveSections]
  );
  const showLiveClaimsSkeleton =
    liveClaimsState === "loading" && (!isReaderMode || visibleClaimRows.length === 0);

  useEffect(() => {
    if (selectedClaim && selectedClaim.id !== selectedId) {
      setSelectedId(selectedClaim.id);
    }
  }, [selectedClaim, selectedId]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.location.hash !== "#selected-source-evidence") {
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      document
        .getElementById("selected-source-evidence")
        ?.scrollIntoView({ block: "start" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [selectedClaim?.id]);

  useEffect(() => {
    if (!requestedClaimId) {
      return;
    }

    const requestedClaim = claims.find((claim) => claim.id === requestedClaimId);

    if (!requestedClaim) {
      return;
    }

    const mission = reviewMission(requestedClaim);
    setSelectedId(requestedClaim.id);
    setEvidenceForm((currentForm) => ({
      ...currentForm,
      stance: mission.stance,
      assessmentTarget: mission.stance === "context" ? "context" : "veracity"
    }));
    if (!isReaderMode) {
      setEvidenceMessage(`Ready to add ${mission.stance} evidence for this claim.`);
    }
    setRequestedClaimId("");
  }, [claims, isReaderMode, requestedClaimId]);

  function saveClaims(nextClaims: StoredClaims) {
    setStoredClaims(nextClaims);
    writeStoredClaims(nextClaims);
  }

  function selectClaim(claimId: string) {
    setSelectedId(claimId);
    const claim = claims.find((item) => item.id === claimId);

    if (claim) {
      const mission = reviewMission(claim);
      setEvidenceForm((currentForm) => ({
        ...currentForm,
        stance: mission.stance,
        assessmentTarget: mission.stance === "context" ? "context" : "veracity"
      }));
    }

    if (targetedReviewMode && narrowLayout) {
      setClaimPickerOpen(false);
    }
  }

  function toggleReaderArchiveSection(sectionKey: string) {
    const sectionWillExpand = !expandedReaderArchiveSectionIds.has(sectionKey);

    setExpandedReaderArchiveSections((currentSections) =>
      currentSections.includes(sectionKey)
        ? currentSections.filter((key) => key !== sectionKey)
        : [...currentSections, sectionKey]
    );

    if (sectionWillExpand) {
      window.requestAnimationFrame(() => {
        document
          .getElementById(readerArchiveSectionDomId(sectionKey))
          ?.scrollIntoView({ block: "start" });
      });
    }
  }

  async function submitClaim(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClaimMessage("");
    setContributionPrompt(null);

    const searchableText = `${claimForm.title} ${claimForm.body}`.toLowerCase();
    const blockedTerm = blockedTerms.find((term) => searchableText.includes(term));

    if (!claimForm.title.trim() || !claimForm.claimantName.trim()) {
      setClaimMessage("Add a claim title and claimant before publishing.");
      return;
    }

    if (!isPublicUrl(claimForm.sourceUrl)) {
      setClaimMessage("Claims require a public http or https source URL.");
      return;
    }

    if (claimForm.subjectKind === "private person" || blockedTerm) {
      setClaimMessage(
        "The MVP excludes private-person, medical, betting, and broad high-risk claims."
      );
      return;
    }

    setClaimSubmitting(true);

    try {
      if (canUseSupabase()) {
        try {
          const liveClaim = await publishClaimToSupabase(claimForm);
          setRemoteClaims((currentClaims) => [
            liveClaim,
            ...currentClaims.filter((claim) => claim.id !== liveClaim.id)
          ]);
          setSelectedId(liveClaim.id);
          setClaimForm({
            title: "",
            body: "",
            domain: "ai",
            claimantName: "",
            subjectKind: "company",
            sourceUrl: "",
            sourceTitle: "",
            sourceQuality: "unverifiable"
          });
          setClaimMessage("Claim published to the live Supabase database.");
          setSupabaseMessage("Live database write succeeded.");
          setContributionPrompt({
            useCase: "submit_claim",
            claimId: liveClaim.id,
            title: "Claim saved",
            message:
              "Share what would make this flow worth returning to, or move straight into another evidence mission."
          });
          return;
        } catch (error) {
          setSupabaseMessage(
            error instanceof Error
              ? `${error.message} Saved this submission locally instead.`
              : "Supabase write failed. Saved this submission locally instead."
          );
        }
      }

      const now = new Date().toISOString();
      const sourceTitle =
        claimForm.sourceTitle.trim() || new URL(claimForm.sourceUrl).hostname;
      const claim: Claim = {
        id: makeId("claim"),
        title: claimForm.title.trim(),
        body: claimForm.body.trim(),
        domain: claimForm.domain,
        claimantName: claimForm.claimantName.trim(),
        subjectKind: claimForm.subjectKind,
        sourceUrl: claimForm.sourceUrl.trim(),
        sourceTitle,
        sourcePublisher: new URL(claimForm.sourceUrl).hostname,
        sourceQuality: claimForm.sourceQuality,
        attributionScore: 50,
        attributionLabel: "Needs source coverage",
        attributionExplanation:
          "This claim was submitted locally and needs source coverage for the attribution source.",
        veracityScore: 50,
        veracityLabel: "Evidence still developing",
        veracityExplanation:
          "One source is present. Add support and challenge evidence before treating the evidence record as useful.",
        createdAt: now,
        submittedBy: "Local user",
        aiAssisted: false,
        evidence: [
          {
            id: makeId("ev"),
            stance: "context",
            assessmentTarget: "attribution",
            summary: "Initial attribution source submitted with the claim.",
            sourceUrl: claimForm.sourceUrl.trim(),
            sourceTitle,
            sourceQuality: claimForm.sourceQuality,
            submittedBy: "Local user",
            createdAt: now,
            aiAssisted: false,
            recordStatus: "Saved reader"
          }
        ]
      };

      const nextClaims = { ...storedClaims, [claim.id]: claim };
      saveClaims(nextClaims);
      setSelectedId(claim.id);
      setClaimForm({
        title: "",
        body: "",
        domain: "ai",
        claimantName: "",
        subjectKind: "company",
        sourceUrl: "",
        sourceTitle: "",
        sourceQuality: "unverifiable"
      });
      setClaimMessage("Claim published locally with a required source URL.");
      setContributionPrompt({
        useCase: "submit_claim",
        claimId: claim.id,
        title: "Claim saved locally",
        message:
          "Tell us what would make claim submission better, then keep the review loop moving with another mission."
      });
    } finally {
      setClaimSubmitting(false);
    }
  }

  async function submitEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEvidenceMessage("");
    setContributionPrompt(null);

    if (!selectedClaim) {
      setEvidenceMessage("Select a claim before adding evidence.");
      return;
    }

    if (!evidenceForm.summary.trim()) {
      setEvidenceMessage("Add a short evidence summary.");
      return;
    }

    if (!isPublicUrl(evidenceForm.sourceUrl)) {
      setEvidenceMessage("Evidence requires a public http or https source URL.");
      return;
    }

    setEvidenceSubmitting(true);

    try {
      const persistenceTarget = evidencePersistenceTarget(selectedClaim.id);
      let seedDurableFallback = false;

      if (canUseSupabase() && persistenceTarget !== "local") {
        try {
          const durableEvidence = await publishEvidenceToSupabase(
            selectedClaim.id,
            evidenceForm
          );

          if (persistenceTarget === "live") {
            setRemoteClaims((currentClaims) =>
              currentClaims.map((claim) =>
                claim.id === selectedClaim.id
                  ? {
                      ...claim,
                      evidence: [durableEvidence, ...claim.evidence],
                      veracityLabel: "Evidence record updated",
                      veracityExplanation:
                        "New live evidence has been added. Review the support and challenge source mix before relying on this evidence record."
                    }
                  : claim
              )
            );
          } else {
            setRemoteSeedEvidence((currentEvidence) => ({
              ...currentEvidence,
              [selectedClaim.id]: [
                durableEvidence,
                ...(currentEvidence[selectedClaim.id] ?? [])
              ]
            }));
          }

          setEvidenceForm(defaultEvidenceForm);
          setEvidenceMessage(
            persistenceTarget === "live"
              ? "Evidence published to the live Supabase database."
              : "Evidence saved durably for this seed claim."
          );
          setSupabaseMessage(
            persistenceTarget === "live"
              ? "Live evidence write succeeded."
              : "Seed evidence write succeeded."
          );
          setContributionPrompt({
            useCase: "add_evidence",
            claimId: selectedClaim.id,
            title:
              persistenceTarget === "live"
                ? "Evidence captured"
                : "Seed evidence captured",
            message:
              "Leave one note on what slowed you down, or pick the next source gap from the mission queue."
          });
          return;
        } catch (error) {
          if (persistenceTarget === "live") {
            setEvidenceMessage(
              error instanceof Error ? error.message : "Supabase evidence write failed."
            );
            return;
          }

          seedDurableFallback = true;
          setSupabaseMessage(
            error instanceof Error
              ? `${error.message} Saved this seed-claim evidence locally instead.`
              : "Seed evidence write failed. Saved this seed-claim evidence locally instead."
          );
        }
      }

      const evidence: EvidenceEntry = {
        id: makeId("ev"),
        stance: evidenceForm.stance,
        assessmentTarget: evidenceForm.assessmentTarget,
        summary: evidenceForm.summary.trim(),
        sourceUrl: evidenceForm.sourceUrl.trim(),
        sourceTitle:
          evidenceForm.sourceTitle.trim() || new URL(evidenceForm.sourceUrl).hostname,
        sourceQuality: evidenceForm.sourceQuality,
        submittedBy: "Local user",
        createdAt: new Date().toISOString(),
        aiAssisted: evidenceForm.aiAssisted,
        aiDisclosure: evidenceForm.aiAssisted
          ? "Submitted as an AI-assisted summary."
          : null,
        recordStatus: "Saved reader"
      };

      const baseClaim = storedClaims[selectedClaim.id] ?? selectedClaim;
      const nextClaim: Claim = {
        ...baseClaim,
        evidence: [evidence, ...baseClaim.evidence],
        veracityLabel: "Evidence record updated",
        veracityExplanation:
          "New local evidence has been added. Review the support and challenge source mix before relying on this evidence record."
      };

      const nextClaims = { ...storedClaims, [nextClaim.id]: nextClaim };
      saveClaims(nextClaims);
      setSelectedId(nextClaim.id);
      setEvidenceForm(defaultEvidenceForm);
      setEvidenceMessage(
        seedDurableFallback
          ? "Seed evidence saved locally because the durable database write failed."
          : "Evidence added locally with source link."
      );
      setContributionPrompt({
        useCase: "add_evidence",
        claimId: nextClaim.id,
        title: "Evidence captured locally",
        message:
          "Send one friction note while the task is fresh, or continue to another open review mission."
      });
    } finally {
      setEvidenceSubmitting(false);
    }
  }

  async function exportLocalClaims() {
    setExportMessage("");
    const localClaims = Object.values(storedClaims);

    if (localClaims.length === 0) {
      setExportMessage("No local claims to export yet.");
      return;
    }

    const payload = JSON.stringify(
      {
        type: claimPackType,
        version: 1,
        exportedAt: new Date().toISOString(),
        claims: localClaims
      },
      null,
      2
    );

    try {
      await navigator.clipboard.writeText(payload);
      setExportMessage(
        `${localClaims.length} local claim${localClaims.length === 1 ? "" : "s"} copied as a claim pack.`
      );
    } catch {
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `claimer-claim-pack-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setExportMessage("Claim pack downloaded because clipboard access was unavailable.");
    }
  }

  function importLocalClaims(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setImportMessage("");

    try {
      const importedClaims = claimsFromPack(JSON.parse(importText));

      if (importedClaims.length === 0) {
        setImportMessage("Paste a valid Claimer claim pack before importing.");
        return;
      }

      const nextClaims = { ...storedClaims };
      importedClaims.forEach((claim) => {
        nextClaims[claim.id] = claim;
      });

      saveClaims(nextClaims);
      setSelectedId(importedClaims[0].id);
      setImportText("");
      setImportMessage(
        `${importedClaims.length} claim${importedClaims.length === 1 ? "" : "s"} imported into this browser.`
      );
    } catch {
      setImportMessage("Claim pack JSON could not be parsed.");
    }
  }

  async function copyReviewMission() {
    setMissionMessage("");

    if (!selectedClaim) {
      setMissionMessage("Select a claim before copying a review mission.");
      return;
    }

    const mission = reviewMission(selectedClaim);
    const payload = [
      "Claimer review mission",
      `Claim: ${selectedClaim.title}`,
      `Claim ID: ${selectedClaim.id}`,
      `Current source: ${selectedClaim.sourceUrl}`,
      `Needed stance: ${mission.stance}`,
      `Assessment target: ${mission.stance === "context" ? "attribution/context" : "claim evidence"}`,
      `Task: ${mission.prompt}`,
      "Rules: use a public http/https source URL, avoid private-person claims, and disclose AI-assisted summaries.",
      `Submit at: ${claimEvidenceUrl(selectedClaim.id, attribution)}`
    ].join("\n");

    try {
      await navigator.clipboard.writeText(payload);
      setMissionMessage("Review mission copied for tester handoff.");
    } catch {
      setMissionMessage(payload);
    }
  }

  function renderReaderArchiveRow(claim: Claim) {
    const counts = evidenceCounts(claim);
    const originalSource = claim.sourcePublisher || claim.sourceTitle;
    const originalSourceHost = sourceHost(claim.sourceUrl);
    const isSelectedClaimRow = selectedClaim?.id === claim.id;
    const coverageSignal = readerCoverageSignal(claim);
    const claimRowClassName = [
      "claim-row",
      "source-list-row",
      "compact",
      isSelectedClaimRow ? "active selected-source-row" : "archive-source-row"
    ].join(" ");

    const selectArchiveRow = () => {
      selectClaim(claim.id);
      window.requestAnimationFrame(() => {
        document
          .getElementById("selected-source-evidence")
          ?.scrollIntoView({ block: "start" });
      });
    };
    const rowAriaLabel = `${
      isSelectedClaimRow ? "Selected claim. " : ""
    }${claim.title}. Original source: ${originalSource}. Source host: ${originalSourceHost}. Evidence mix: ${counts.support} support, ${counts.challenge} challenge, ${counts.context} context. Source gap cue: ${coverageSignal}. Selects this source trail and opens the evidence chain.`;

    if (isSelectedClaimRow) {
      return (
        <a
          className={claimRowClassName}
          href="#selected-source-evidence"
          key={claim.id}
          onClick={selectArchiveRow}
          title={claim.title}
          aria-label={rowAriaLabel}
        >
          <span className="claim-row-purpose">
            <span className="claim-row-purpose-label">Selected source trail</span>
            <strong>{claim.title}</strong>
          </span>
          <span
            className="claim-row-source"
            aria-label={`Original source ${originalSource}; source host ${originalSourceHost}`}
          >
            <span className="claim-row-source-label">Original source</span>
            <span className="claim-row-source-name">{originalSource}</span>
            <span className="claim-row-source-host">{originalSourceHost}</span>
          </span>
          <span className="claim-row-facts">
            <span className="claim-row-evidence">
              <span className="claim-row-fact-label">Evidence mix</span>
              <span className="claim-row-mix">
                {counts.support} support / {counts.challenge} challenge / {counts.context}{" "}
                context
              </span>
            </span>
            <span className="claim-row-need">
              <span className="claim-row-fact-label">Source need</span>
              <span className="claim-row-coverage">{coverageSignal}</span>
            </span>
          </span>
          <span className="claim-row-action">Select this source trail</span>
        </a>
      );
    }

    return (
      <a
        className={claimRowClassName}
        href="#selected-source-evidence"
        key={claim.id}
        onClick={selectArchiveRow}
        title={claim.title}
        aria-label={rowAriaLabel}
      >
        <span
          className="claim-row-summary claim-row-archive-summary"
          aria-label={`Source need ${coverageSignal}; Original source ${originalSource}; source host ${originalSourceHost}; evidence mix ${counts.support} support, ${counts.challenge} challenge, ${counts.context} context`}
        >
          <span className="claim-row-need claim-row-archive-need">
            <span className="claim-row-fact-label">Source need</span>
            <span className="claim-row-coverage">{coverageSignal}</span>
          </span>
          <span className="claim-row-source-stack">
            <span
              className="claim-row-source-line"
              aria-label={`Original source ${originalSource}`}
            >
              <span className="claim-row-source-label">Original source</span>
              <span className="claim-row-source-name">{originalSource}</span>
            </span>
            <span
              className="claim-row-host-line"
              aria-label={`Source host ${originalSourceHost}`}
            >
              <span className="claim-row-source-host-label">Source host</span>
              <span className="claim-row-source-host">{originalSourceHost}</span>
            </span>
          </span>
          <span className="claim-row-evidence claim-row-archive-evidence">
            <span className="claim-row-fact-label">Evidence mix</span>
            <span className="claim-row-mix">
              {counts.support} support / {counts.challenge} challenge / {counts.context}{" "}
              context
            </span>
          </span>
        </span>
        <span
          className="claim-row-context"
          aria-label={`source trail purpose and claim context: ${claim.title}`}
        >
          <span className="claim-row-context-label">Claim context</span>
          <strong>{claim.title}</strong>
        </span>
        <span className="claim-row-action">Select this source trail</span>
      </a>
    );
  }

  const workspaceClassName = [
    "workspace",
    isReaderMode ? "reader-workspace" : "",
    targetedReviewMode ? "targeted-review-workspace" : ""
  ]
    .filter(Boolean)
    .join(" ");
  const claimPickerBodyId = targetedReviewMode ? "targeted-claim-picker-body" : undefined;
  const showClaimPickerBody = !targetedReviewMode || claimPickerOpen;

  return (
    <section className={workspaceClassName}>
      {!targetedReviewMode && featuredClaim ? (
        <section className="priority-claim" aria-labelledby="priority-claim-title">
          {(() => {
            const counts = evidenceCounts(featuredClaim);
            const health = evidenceHealth(featuredClaim);
            const mission = reviewMission(featuredClaim);
            const featuredSourceHost = sourceHost(featuredClaim.sourceUrl);
            const actionLabel =
              mission.stance === "context"
                ? "Add context"
                : `Add ${mission.stance} evidence`;

            return (
              <>
                <div className="priority-claim-copy">
                  <div className="priority-claim-kicker">
                    <span className="claim-domain">{featuredClaim.domain}</span>
                    {isLiveSupabaseClaimId(featuredClaim.id) ? (
                      <span className="claim-domain">
                        {isReaderMode ? "Live contributor submission" : "Live source"}
                      </span>
                    ) : null}
                    <span>{claimFreshnessLabel(featuredClaim.createdAt)}</span>
                    <span>{featuredClaim.sourceQuality} source</span>
                  </div>
                  <h2 id="priority-claim-title">
                    {isReaderMode ? "Claim under inspection" : "Priority review"}
                  </h2>
                  <h3>{featuredClaim.title}</h3>
                  {isReaderMode ? (
                    <dl
                      className="priority-source-summary"
                      aria-label="Original source summary"
                    >
                      <div>
                        <dt>Original source</dt>
                        <dd>{featuredClaim.sourcePublisher || featuredSourceHost}</dd>
                      </div>
                      <div>
                        <dt>Source host</dt>
                        <dd>{featuredSourceHost}</dd>
                      </div>
                      <div>
                        <dt>Evidence mix</dt>
                        <dd>
                          {counts.support} support / {counts.challenge} challenge /{" "}
                          {counts.context} context
                        </dd>
                      </div>
                      <div>
                        <dt>Next panel</dt>
                        <dd>
                          <a
                            href="#selected-source-evidence"
                            onClick={() => selectClaim(featuredClaim.id)}
                          >
                            source and evidence
                          </a>
                        </dd>
                      </div>
                    </dl>
                  ) : null}
                  <p>
                    {isReaderMode
                      ? "Start with the selected claim, its original source, and visible source coverage."
                      : "Ranked first by freshness, source strength, and an open evidence gap."}{" "}
                    Original source: {featuredClaim.sourcePublisher}.
                  </p>
                  <div className="priority-evidence" aria-label="Priority evidence counts">
                    <span className="support">{counts.support} support</span>
                    <span className="challenge">{counts.challenge} challenge</span>
                    <span>{counts.context} context</span>
                    {!isReaderMode ? (
                      <span>{health.highQualityCount} primary/direct</span>
                    ) : null}
                  </div>
                </div>
                {isReaderMode ? (
                  <div className="priority-action">
                    <span>Evidence view</span>
                    <strong>Read the source and evidence chain</strong>
                    <p>
                      Review the source line and current support / challenge / context
                      entries as public source coverage, not a platform conclusion.
                    </p>
                    <div className="priority-actions">
                      {seedClaims.some((claim) => claim.id === featuredClaim.id) ? (
                        <Link
                          className="button primary compact"
                          href={`/claims/${featuredClaim.id}`}
                        >
                          Inspect details
                        </Link>
                      ) : null}
                      <a
                        className="button compact"
                        href="#selected-source-evidence"
                        onClick={() => selectClaim(featuredClaim.id)}
                      >
                        Read source and evidence
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="priority-action">
                    <span>Next evidence action</span>
                    <strong>{mission.title}</strong>
                    <p>{mission.description}</p>
                    <div className="priority-actions">
                      <Link
                        className="button primary compact"
                        href={claimEvidencePath(featuredClaim.id, attribution)}
                      >
                        {actionLabel}
                      </Link>
                      <button
                        className="button compact"
                        onClick={() => selectClaim(featuredClaim.id)}
                        type="button"
                      >
                        Focus details
                      </button>
                    </div>
                  </div>
                )}
              </>
            );
          })()}
        </section>
      ) : null}

      <aside
        className={targetedReviewMode ? "claim-rail targeted-claim-picker" : "claim-rail"}
        aria-label={targetedReviewMode ? "Change claim" : "Claim list"}
      >
        <div className="rail-header">
          <div>
            <p className="eyebrow">
              {targetedReviewMode
                ? "Optional"
                : isReaderMode
                  ? "Public evidence library"
                  : "Contribution workspace"}
            </p>
            <h1>{targetedReviewMode ? "Change claim" : "Claims"}</h1>
          </div>
          {targetedReviewMode ? (
            <button
              aria-controls={claimPickerBodyId}
              aria-expanded={claimPickerOpen}
              className="button compact"
              onClick={() => setClaimPickerOpen((isOpen) => !isOpen)}
              type="button"
            >
              {claimPickerOpen ? "Hide list" : "Show claims"}
            </button>
          ) : !isReaderMode ? (
            <Link className="button compact" href="/review/">
              Review
            </Link>
          ) : null}
        </div>

        {targetedReviewMode && !claimPickerOpen && selectedClaim ? (
          <p className="claim-picker-current">Current review: {selectedClaim.title}</p>
        ) : null}

        {isReaderMode && !targetedReviewMode && selectedClaim ? (
          <PinnedCurrentRecord
            claim={selectedClaim}
            onSelect={() => selectClaim(selectedClaim.id)}
          />
        ) : null}

        <div
          className="claim-picker-body"
          hidden={!showClaimPickerBody}
          id={claimPickerBodyId}
        >
          <div className="search-box" aria-label="Search claims">
            <input
              type="search"
              placeholder="Search claims…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              id="claim-search"
            />
          </div>

          {!isReaderMode ? (
            <>
              <div className="filters" aria-label="Claim domain filters">
                {domainFilters.map((domain) => (
                  <button
                    className={activeDomain === domain ? "chip active" : "chip"}
                    key={domain}
                    onClick={() => setActiveDomain(domain)}
                    type="button"
                  >
                    {domain}
                  </button>
                ))}
              </div>

              <div className="filters triage-filters" aria-label="Evidence triage filters">
                {[
                  ["all", "All"],
                  ["needs-challenge", "Needs challenge"],
                  ["needs-support", "Needs support"],
                  ["primary-direct", "Primary/direct"]
                ].map(([key, label]) => (
                  <button
                    className={activeTriage === key ? "chip active" : "chip"}
                    key={key}
                    onClick={() =>
                      setActiveTriage(
                        key as "all" | "needs-challenge" | "needs-support" | "primary-direct"
                      )
                    }
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          ) : null}
          {!isReaderMode && supabaseMessage ? (
            <p className="form-message">{supabaseMessage}</p>
          ) : null}

          <div className="claim-list-heading">
            <strong>{isReaderMode ? "Source archive" : "Full claim list"}</strong>
            {isReaderMode ? (
              <span>Selected first; rows carry source-gap cues</span>
            ) : (
              <span>{filteredClaims.length} showing</span>
            )}
          </div>
          {isReaderMode ? (
            <>
              <div
                className="source-archive-guide"
                aria-label="Source archive source and evidence groups"
              >
                <div
                  className={`claim-count-note source-list-note source-archive-count-state ${readerArchiveState.tone}`}
                  aria-label="Source archive count state"
                >
                  <strong>{readerArchiveState.heading}</strong>
                  <span>{readerArchiveState.detail}</span>
                </div>
                <p>
                  Filters and cue links move through the public source index;
                  rows keep source need, Original source, Source host, and
                  Evidence mix visible.
                </p>
                <div className="source-archive-control-row">
                  <div className="reader-filter-grid" aria-label="Source archive filters">
                    <label className="reader-filter-row" htmlFor="reader-domain-filter">
                      <span className="reader-filter-label">Topic</span>
                      <select
                        aria-label="Topic filter"
                        id="reader-domain-filter"
                        onChange={(event) =>
                          setActiveDomain(event.target.value as ClaimDomain | "all")
                        }
                        value={activeDomain}
                      >
                        {domainFilters.map((domain) => (
                          <option key={domain} value={domain}>
                            {domain === "all" ? "All topics" : domain}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label
                      className="reader-filter-row"
                      htmlFor="reader-source-need-filter"
                    >
                      <span className="reader-filter-label">Source need</span>
                      <select
                        aria-label="Source need filter"
                        id="reader-source-need-filter"
                        onChange={(event) =>
                          setActiveReaderCue(
                            event.target.value as ReaderArchiveSourceNeedFilter
                          )
                        }
                        value={activeReaderCue}
                      >
                        {readerSourceNeedFilters.map((filter) => (
                          <option key={filter.value} value={filter.value}>
                            {filter.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <div className="source-archive-cues" aria-label="Source need cue links">
                    {readerArchiveCues.map((cue) => (
                      <a
                        aria-disabled={cue.count === 0}
                        className={cue.count === 0 ? "disabled" : undefined}
                        href={`#${readerArchiveSectionDomId(cue.label)}`}
                        key={cue.label}
                        onClick={(event) => {
                          if (cue.count === 0) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <strong>{cue.count}</strong>
                        {cue.label}
                      </a>
                    ))}
                  </div>
                </div>
                {expandedReaderArchiveMapSections.length > 0 ? (
                  <div
                    className="source-archive-expanded-map"
                    aria-label="expanded archive map source need navigation"
                  >
                    <div className="source-archive-expanded-map-heading">
                      <span>Expanded archive map</span>
                      <strong>
                        {expandedReaderArchiveMapSections.length} source need{" "}
                        {expandedReaderArchiveMapSections.length === 1
                          ? "band"
                          : "bands"}
                      </strong>
                    </div>
                    <div className="source-archive-expanded-map-items">
                      {expandedReaderArchiveMapSections.map((section) => (
                        <div className="source-archive-expanded-map-item" key={section.key}>
                          <a href={`#${readerArchiveSectionDomId(section.key)}`}>
                            <strong>{section.label}</strong>
                            <span>{readerArchiveSectionSourceSummary(section)}</span>
                          </a>
                          <button
                            aria-label={`Show fewer source trails in ${section.label}`}
                            className="source-archive-map-collapse"
                            onClick={() => toggleReaderArchiveSection(section.key)}
                            type="button"
                          >
                            Show fewer source trails
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
                {selectedClaim ? (
                  <a
                    className="source-archive-selected-mini"
                    href="#selected-source-evidence"
                    onClick={() => selectClaim(selectedClaim.id)}
                    aria-label={`Return to selected source trail and Evidence chain for ${selectedClaim.title}`}
                  >
                    <span className="source-archive-selected-label">
                      Selected source trail
                    </span>
                    <strong>{selectedClaim.title}</strong>
                    <span className="source-archive-selected-source">
                      Original source:{" "}
                      {selectedClaim.sourcePublisher || sourceHost(selectedClaim.sourceUrl)}
                    </span>
                    <span className="source-archive-return-action">
                      Return to source and evidence
                    </span>
                  </a>
                ) : null}
              </div>
            </>
          ) : null}

          <div
            className={isReaderMode ? "claim-list source-list compact" : "claim-list"}
            aria-busy={showLiveClaimsSkeleton}
            aria-live="polite"
          >
            {showLiveClaimsSkeleton ? (
              <div className="skeleton-list" aria-label="Source record placeholders">
                <span className="skeleton-row" />
                <span className="skeleton-row" />
              </div>
            ) : null}

            {isReaderMode ? (
              readerArchiveSections.length > 0 ? (
                readerArchiveSections.map((section) => {
                  const sectionExpanded =
                    section.selected || expandedReaderArchiveSectionIds.has(section.key);
                  const visibleSectionClaims = sectionExpanded
                    ? section.claims
                    : section.claims.slice(0, readerArchiveCollapsedLimit);
                  const hiddenSectionCount =
                    section.claims.length - visibleSectionClaims.length;
                  const showSectionToggle =
                    !section.selected &&
                    section.claims.length > readerArchiveCollapsedLimit;

                  return (
                    <section
                      className={`source-archive-section${
                        section.selected ? " selected" : ""
                      }${sectionExpanded && !section.selected ? " expanded" : ""}`}
                      id={readerArchiveSectionDomId(section.key)}
                      key={section.key}
                      aria-label={`${section.label} archive section`}
                    >
                      <div className="source-archive-section-heading">
                        <div className="source-archive-section-title">
                          <span>{section.label}</span>
                        </div>
                        <strong>
                          {readerSourceNeedDisplayCountLabel(
                            section.claims.length,
                            visibleSectionClaims.length
                          )}
                        </strong>
                        <p>{section.description}</p>
                        {sectionExpanded && !section.selected ? (
                          <div
                            className="source-archive-section-summary"
                            aria-label={`${section.label} source need navigation`}
                          >
                            <span>Expanded source need navigation</span>
                            <strong>{readerArchiveSectionSourceSummary(section)}</strong>
                            <button
                              aria-label={`Show fewer source trails in ${section.label}`}
                              className="source-archive-toggle source-archive-heading-toggle"
                              onClick={() => toggleReaderArchiveSection(section.key)}
                              type="button"
                            >
                              Show fewer source trails
                            </button>
                          </div>
                        ) : null}
                      </div>
                      <div className="source-archive-section-rows">
                        {groupReaderArchiveClaimsByHost(visibleSectionClaims).map(
                          (group) => (
                            <div
                              className="source-archive-host-group"
                              key={`${section.key}-${group.key}`}
                            >
                              {!section.selected ? (
                                <div className="source-archive-host-heading">
                                  <span>{group.host}</span>
                                  <small>{archiveSectionCountLabel(group.claims.length)}</small>
                                </div>
                              ) : null}
                              <div className="source-archive-host-rows">
                                {group.claims.map((claim) => renderReaderArchiveRow(claim))}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                      {showSectionToggle ? (
                        <div className="source-archive-section-footer">
                          <span>
                            {sectionExpanded
                              ? `All ${archiveSectionCountLabel(
                                  section.claims.length
                                )} visible in this source-need band.`
                              : `Showing ${readerSourceNeedDisplayCountLabel(
                                  section.claims.length,
                                  visibleSectionClaims.length
                                )} in this source-need band.`}
                          </span>
                          <button
                            aria-label={
                              sectionExpanded
                                ? `Show fewer source trails in ${section.label}`
                                : `Show ${hiddenSectionCount} more source trails in ${section.label}`
                            }
                            className="source-archive-toggle"
                            onClick={() => toggleReaderArchiveSection(section.key)}
                            type="button"
                          >
                            {sectionExpanded
                              ? "Show fewer source trails"
                              : hiddenSectionCount > 0
                                ? `Show ${hiddenSectionCount} more source trails`
                                : "Show more source trails"}
                          </button>
                        </div>
                      ) : null}
                    </section>
                  );
                })
              ) : liveClaimsState !== "loading" ? (
                <div className="empty-state compact">
                  <strong>No claims match these filters.</strong>
                  <span>Clear a filter or submit a sourced public claim.</span>
                </div>
              ) : null
            ) : filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => {
                const counts = evidenceCounts(claim);
                const health = evidenceHealth(claim);
                const originalSource = claim.sourcePublisher || claim.sourceTitle;
                const isSelectedClaimRow = selectedClaim?.id === claim.id;

                return (
                  <button
                    className={`claim-row${isSelectedClaimRow ? " active" : ""}`}
                    key={claim.id}
                    onClick={() => selectClaim(claim.id)}
                    type="button"
                  >
                    <span className="claim-domain">{claim.domain}</span>
                    {isLiveSupabaseClaimId(claim.id) ? (
                      <span className="claim-domain">Live source</span>
                    ) : null}
                    <strong>{claim.title}</strong>
                    <span className="claim-row-source">Original source: {originalSource}</span>
                    <span className="claim-row-mix">
                      {counts.support} support / {counts.challenge} challenge /{" "}
                      {counts.context} context
                    </span>
                    <span className={health.needsChallenge ? "triage need" : "triage"}>
                      {health.balanceLabel} · {health.highQualityCount} strong source
                      {health.highQualityCount === 1 ? "" : "s"}
                    </span>
                  </button>
                );
              })
            ) : liveClaimsState !== "loading" ? (
              <div className="empty-state compact">
                <strong>No claims match these filters.</strong>
                <span>Clear a filter or submit a sourced public claim.</span>
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      <div className="claim-main">
        {selectedClaim ? (
          <>
            <article className="detail" id="selected-source-evidence">
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">{selectedClaim.claimantName}</p>
                  {isLiveSupabaseClaimId(selectedClaim.id) ? (
                    <span className="claim-domain">
                      {isReaderMode ? "Live contributor submission" : "Live source"}
                    </span>
                  ) : null}
                  <h2>{selectedClaim.title}</h2>
                </div>
                {seedClaims.some((claim) => claim.id === selectedClaim.id) ? (
                  <Link className="button compact" href={`/claims/${selectedClaim.id}`}>
                    Detail page
                  </Link>
                ) : null}
              </div>
              <p>{selectedClaim.body}</p>

              <section className="source-inspection" aria-labelledby="selected-source-title">
                <div>
                  <span>Original source</span>
                  <h3 id="selected-source-title">
                    {isReaderMode ? "Original source, then evidence" : "Original source"}
                  </h3>
                  <p>Publisher: {selectedClaim.sourcePublisher}</p>
                </div>
                <div className="source-reference">
                  {isLiveSupabaseClaimId(selectedClaim.id) ? (
                    <span>{isReaderMode ? "Live contributor submission" : "Live source"}</span>
                  ) : null}
                  <span>{selectedClaim.sourceQuality} source</span>
                  <a href={selectedClaim.sourceUrl} rel="noreferrer" target="_blank">
                    {selectedClaim.sourceTitle}
                  </a>
                  <small>{selectedClaim.sourcePublisher}</small>
                  <code className="source-url">{selectedClaim.sourceUrl}</code>
                </div>
              </section>

              <section className="evidence-section" aria-labelledby="evidence-title">
                <h3 id="evidence-title">Evidence chain</h3>
                <div className="evidence-list">
                  {selectedClaim.evidence.map((item) => (
                    <article className={`evidence ${item.stance}`} key={item.id}>
                      <div>
                        <span>{item.stance}</span>
                        <em>{item.sourceQuality}</em>
                        {!isReaderMode ? <em>{item.assessmentTarget ?? "veracity"}</em> : null}
                        {!isReaderMode && item.aiAssisted ? <em>AI-assisted summary</em> : null}
                      </div>
                      <p>{item.summary}</p>
                      <div className="evidence-source">
                        <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                          {item.sourceTitle}
                        </a>
                        <small>{item.sourceUrl}</small>
                      </div>
                      {!isReaderMode ? (
                        <p className="evidence-provenance">
                          {evidenceProvenanceParts(item).map((part) => (
                            <span key={part.label}>
                              <strong>{part.label}:</strong>{" "}
                              {readerEvidenceProvenanceValue(part.value)}
                            </span>
                          ))}
                        </p>
                      ) : null}
                    </article>
                  ))}
                </div>
                {isReaderMode ? (
                  <>
                    <p className="source-gap-line">
                      {readerMissingSourceGapLine(selectedClaim)}
                    </p>
                    <p className="evidence-metadata-note">
                      <strong>Model/tool metadata:</strong> {readerEvidenceMetadataNote}
                    </p>
                    <div
                      className="evidence-provenance-list"
                      aria-label="Evidence provenance details"
                    >
                      {selectedClaim.evidence.map((item) => (
                        <p className="evidence-provenance" key={`${item.id}-provenance`}>
                          <span>
                            <strong>Evidence:</strong> {item.sourceTitle}
                          </span>
                          {evidenceProvenanceParts(item).map((part) => (
                            <span key={part.label}>
                              <strong>{part.label}:</strong>{" "}
                              {readerEvidenceProvenanceValue(part.value)}
                            </span>
                          ))}
                        </p>
                      ))}
                    </div>
                  </>
                ) : null}
                {isReaderMode ? (
                  <EvidenceStandardsBlock
                    actionHref={claimEvidencePath(selectedClaim.id, attribution)}
                    feedbackHref={feedbackPath(
                      "add_evidence",
                      selectedClaim.id,
                      attribution
                    )}
                  />
                ) : null}
                {isReaderMode ? (
                  <GapContributionActions
                    claim={selectedClaim}
                    attribution={attribution}
                  />
                ) : null}
              </section>

              <section className="metric-strip evidence-health" aria-label="Evidence health">
                {(() => {
                  const health = evidenceHealth(selectedClaim);
                  return (
                    <>
                      <div>
                        <strong>{health.total}</strong>
                        <span>evidence entries</span>
                      </div>
                      <div>
                        <strong>{health.highQualityCount}</strong>
                        <span>primary/direct</span>
                      </div>
                      <div>
                        <strong>
                          {isReaderMode ? readerMixLabel(selectedClaim) : health.balanceLabel}
                        </strong>
                        <span>support / challenge / context mix</span>
                      </div>
                    </>
                  );
                })()}
              </section>

              {!isReaderMode ? (
                <div className="score-grid">
                  <section className="score">
                    <span>Source trace</span>
                    <strong>{selectedClaim.attributionScore}%</strong>
                    <p>{selectedClaim.attributionLabel}</p>
                    <small>{selectedClaim.attributionExplanation}</small>
                  </section>
                  <section className="score">
                    <span>Evidence record</span>
                    <strong>{selectedClaim.veracityScore}%</strong>
                    <p>{selectedClaim.veracityLabel}</p>
                    <small>{selectedClaim.veracityExplanation}</small>
                  </section>
                </div>
              ) : null}

              {isReaderMode ? (
                <section className="review-mission" aria-labelledby="library-coverage-gap-title">
                  {(() => {
                    return (
                      <div>
                        <span>{readerCoverageSignal(selectedClaim)}</span>
                        <h3 id="library-coverage-gap-title">Source coverage gap</h3>
                        <p>{readerCoverageDescription(selectedClaim)}</p>
                      </div>
                    );
                  })()}
                </section>
              ) : null}

              {!isReaderMode ? (
                <section className="review-mission" aria-labelledby="review-mission-title">
                  {(() => {
                    const mission = reviewMission(selectedClaim);
                    return (
                      <>
                        <div>
                          <span>{mission.stance}</span>
                          <h3 id="review-mission-title">{mission.title}</h3>
                          <p>{mission.description}</p>
                        </div>
                        <button className="button compact" onClick={copyReviewMission} type="button">
                          Copy mission
                        </button>
                      </>
                    );
                  })()}
                </section>
              ) : null}
              {!isReaderMode && missionMessage ? (
                <p className="form-message">{missionMessage}</p>
              ) : null}

              <section className="assessment-checklist" aria-label="Evidence coverage readiness">
                {(() => {
                  const health = evidenceHealth(selectedClaim);
                  const hasStrongAttributionSource = ["primary", "direct witness"].includes(
                    selectedClaim.sourceQuality
                  );
                  const checks = [
                    {
                      label: "Attribution source",
                      done: Boolean(selectedClaim.sourceUrl),
                      detail: selectedClaim.sourceTitle
                    },
                    {
                      label: "Strong attribution quality",
                      done: hasStrongAttributionSource,
                      detail: selectedClaim.sourceQuality
                    },
                    {
                      label: "Support evidence",
                      done: health.support > 0,
                      detail: `${health.support} source${health.support === 1 ? "" : "s"}`
                    },
                    {
                      label: "Challenge evidence",
                      done: health.challenge > 0,
                      detail: `${health.challenge} source${health.challenge === 1 ? "" : "s"}`
                    }
                  ];

                  return checks.map((check) => (
                    <div className={check.done ? "check-item done" : "check-item"} key={check.label}>
                      <span>
                        {isReaderMode
                          ? check.done
                            ? "Present"
                            : "Coverage gap"
                          : check.done
                            ? "Ready"
                            : "Gap"}
                      </span>
                      <strong>{check.label}</strong>
                      <small>{check.detail}</small>
                    </div>
                  ));
                })()}
              </section>

              {isReaderMode ? (
                <section
                  className="coverage-metadata"
                  aria-labelledby="library-source-summary-title"
                >
                  <h2 id="library-source-summary-title">Source coverage summary</h2>
                  {(() => {
                    const health = evidenceHealth(selectedClaim);
                    const supportChallengeContextSummary = `${health.support} support / ${health.challenge} challenge / ${health.context} context`;

                    return (
                      <dl>
                        <div>
                          <dt>Original source</dt>
                          <dd>
                            {selectedClaim.sourceQuality} source from{" "}
                            {selectedClaim.sourcePublisher}
                          </dd>
                        </div>
                        <div>
                          <dt>Evidence count</dt>
                          <dd>
                            {health.total} source{" "}
                            {health.total === 1 ? "entry" : "entries"} for reader
                            inspection
                          </dd>
                        </div>
                        <div>
                          <dt>support / challenge / context</dt>
                          <dd>{supportChallengeContextSummary}</dd>
                        </div>
                        <div>
                          <dt>Source note</dt>
                          <dd>{selectedClaim.attributionExplanation}</dd>
                        </div>
                      </dl>
                    );
                  })()}
                </section>
              ) : null}
            </article>

            {isReaderMode ? (
              <section className="reader-route-panel" aria-labelledby="reader-route-title">
                <div className="reader-route-copy">
                  <p className="eyebrow">Browse paths</p>
                  <h2 id="reader-route-title">Keep reading source context</h2>
                  <p>
                    Use the selected claim detail, current source, and evidence chain
                    for reading. Evidence actions stay on separate routes.
                  </p>
                </div>
                <div className="reader-route-grid">
                  <Link
                    className="reader-route-card"
                    href={claimReaderPath(selectedClaim.id, attribution)}
                  >
                    <span>Browse</span>
                    <strong>Inspect details</strong>
                    <p>Open the claim detail or return to the evidence chain.</p>
                  </Link>
                  <Link className="reader-route-card" href="/sources/">
                    <span>Sources</span>
                    <strong>Compare source directory</strong>
                    <p>Review publishers and source links used across public claims.</p>
                  </Link>
                </div>
              </section>
            ) : (
              <section className="form-panel" aria-labelledby="evidence-form-title">
                <h2 id="evidence-form-title">Submit evidence</h2>
                <form className="form-grid" onSubmit={submitEvidence}>
                <label>
                  Stance
                  <select
                    onChange={(event) =>
                      setEvidenceForm({
                        ...evidenceForm,
                        stance: event.target.value as EvidenceStance
                      })
                    }
                    value={evidenceForm.stance}
                  >
                    <option value="support">Support</option>
                    <option value="challenge">Challenge</option>
                    <option value="context">Context</option>
                  </select>
                </label>
                <label>
                  Assessment target
                  <select
                    onChange={(event) =>
                      setEvidenceForm({
                        ...evidenceForm,
                        assessmentTarget: event.target.value as AssessmentTarget
                      })
                    }
                    value={evidenceForm.assessmentTarget}
                  >
                    {assessmentTargets.map((target) => (
                      <option key={target} value={target}>
                        {target}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="wide">
                  Summary
                  <textarea
                    onChange={(event) =>
                      setEvidenceForm({ ...evidenceForm, summary: event.target.value })
                    }
                    required
                    value={evidenceForm.summary}
                  />
                </label>
                <label>
                  Source URL
                  <input
                    onChange={(event) =>
                      setEvidenceForm({ ...evidenceForm, sourceUrl: event.target.value })
                    }
                    placeholder="https://..."
                    pattern="https?://.+"
                    required
                    title="Use a public http or https URL."
                    type="url"
                    value={evidenceForm.sourceUrl}
                  />
                </label>
                <label>
                  Source title
                  <input
                    onChange={(event) =>
                      setEvidenceForm({ ...evidenceForm, sourceTitle: event.target.value })
                    }
                    value={evidenceForm.sourceTitle}
                  />
                </label>
                <label>
                  Source quality
                  <select
                    onChange={(event) =>
                      setEvidenceForm({
                        ...evidenceForm,
                        sourceQuality: event.target.value as SourceQuality
                      })
                    }
                    value={evidenceForm.sourceQuality}
                  >
                    {sourceQualities.map((quality) => (
                      <option key={quality} value={quality}>
                        {quality}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="check">
                  <input
                    checked={evidenceForm.aiAssisted}
                    onChange={(event) =>
                      setEvidenceForm({
                        ...evidenceForm,
                        aiAssisted: event.target.checked
                      })
                    }
                    type="checkbox"
                  />
                  AI-assisted summary
                </label>
                <button
                  className="button primary"
                  disabled={evidenceSubmitting}
                  type="submit"
                >
                  {evidenceSubmitting ? "Submitting..." : "Submit evidence"}
                </button>
                </form>
                {evidenceMessage ? <p className="form-message">{evidenceMessage}</p> : null}
                {contributionPrompt?.useCase === "add_evidence" ? (
                  <ContributionPromptView
                    attribution={attribution}
                    prompt={contributionPrompt}
                  />
                ) : null}
              </section>
            )}
          </>
        ) : (
          <section className="empty-state">
            <h2>No claim selected</h2>
            <p>Choose a claim from the queue or submit a sourced public claim.</p>
          </section>
        )}
      </div>

      {!isReaderMode ? (
        <aside className="submit-panel" aria-labelledby="claim-form-title">
          <h2 id="claim-form-title">Submit claim</h2>
          <form className="form-grid" onSubmit={submitClaim}>
          <label className="wide">
            Claim title
            <input
              onChange={(event) =>
                setClaimForm({ ...claimForm, title: event.target.value })
              }
              required
              value={claimForm.title}
            />
          </label>
          <label className="wide">
            Claim text
            <textarea
              onChange={(event) => setClaimForm({ ...claimForm, body: event.target.value })}
              value={claimForm.body}
            />
          </label>
          <label>
            Domain
            <select
              onChange={(event) =>
                setClaimForm({
                  ...claimForm,
                  domain: event.target.value as ClaimDomain
                })
              }
              value={claimForm.domain}
            >
              <option value="ai">AI</option>
              <option value="technology">Technology</option>
              <option value="news">News</option>
            </select>
          </label>
          <label>
            Claimant
            <input
              onChange={(event) =>
                setClaimForm({ ...claimForm, claimantName: event.target.value })
              }
              required
              value={claimForm.claimantName}
            />
          </label>
          <label>
            Subject kind
            <select
              onChange={(event) =>
                setClaimForm({ ...claimForm, subjectKind: event.target.value })
              }
              value={claimForm.subjectKind}
            >
              {subjectKinds.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>
          <label>
            Source URL
            <input
              onChange={(event) =>
                setClaimForm({ ...claimForm, sourceUrl: event.target.value })
              }
              placeholder="https://..."
              pattern="https?://.+"
              required
              title="Use a public http or https URL."
              type="url"
              value={claimForm.sourceUrl}
            />
          </label>
          <label className="wide">
            Source title
            <input
              onChange={(event) =>
                setClaimForm({ ...claimForm, sourceTitle: event.target.value })
              }
              value={claimForm.sourceTitle}
            />
          </label>
          <label>
            Source quality
            <select
              onChange={(event) =>
                setClaimForm({
                  ...claimForm,
                  sourceQuality: event.target.value as SourceQuality
                })
              }
              value={claimForm.sourceQuality}
            >
              {sourceQualities.map((quality) => (
                <option key={quality} value={quality}>
                  {quality}
                </option>
              ))}
            </select>
          </label>
          <button className="button primary" disabled={claimSubmitting} type="submit">
            {claimSubmitting
              ? "Publishing..."
              : canUseSupabase()
                ? "Publish live"
                : "Publish locally"}
          </button>
          </form>
          {claimMessage ? <p className="form-message">{claimMessage}</p> : null}
          {contributionPrompt?.useCase === "submit_claim" ? (
            <ContributionPromptView
              attribution={attribution}
              prompt={contributionPrompt}
            />
          ) : null}

          <section className="handoff-panel" aria-labelledby="handoff-title">
            <h3 id="handoff-title">Local claim handoff</h3>
            <p>
              Copy browser-local submissions as a JSON claim pack, or paste a pack
              from another tester.
            </p>
            <button className="button" onClick={exportLocalClaims} type="button">
              Copy claim pack
            </button>
            {exportMessage ? <p className="form-message">{exportMessage}</p> : null}
            <form className="form-grid import-form" onSubmit={importLocalClaims}>
              <label className="wide">
                Import claim pack
                <textarea
                  onChange={(event) => setImportText(event.target.value)}
                  placeholder="{ ... }"
                  value={importText}
                />
              </label>
              <button className="button" type="submit">
                Import pack
              </button>
            </form>
            {importMessage ? <p className="form-message">{importMessage}</p> : null}
          </section>
        </aside>
      ) : null}
    </section>
  );
}
