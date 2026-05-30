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

const sourceQualities: SourceQuality[] = [
  "primary",
  "direct witness",
  "reputable secondary",
  "indirect secondary",
  "unverifiable"
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
    typeof value.aiAssisted === "boolean"
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
  const [liveClaimsState, setLiveClaimsState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [activeDomain, setActiveDomain] = useState<ClaimDomain | "all">("all");
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
              ? ` Seed evidence table unavailable until migration is applied: ${seedError.message}`
              : " Seed evidence table unavailable until migration is applied.";
        }

        if (!isMounted) {
          return;
        }
        setRemoteClaims(liveClaims);
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
        veracityLabel: "Community assessment updated",
        veracityExplanation:
          "Durable community evidence has been added. Review the support and challenge source mix before relying on the assessment."
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

    if (activeTriage === "all") {
      return result;
    }

    return result.filter((claim) => {
      const health = evidenceHealth(claim);

      if (activeTriage === "needs-challenge") {
        return health.needsChallenge;
      }

      if (activeTriage === "needs-support") {
        return health.needsSupport;
      }

      return health.hasHighQualitySource;
    });
  }, [activeDomain, activeTriage, claims, searchQuery]);

  const priorityClaim = useMemo(() => {
    return [...claims].sort((a, b) => priorityScore(b) - priorityScore(a))[0];
  }, [claims]);

  const selectedClaim = useMemo(() => {
    return claims.find((claim) => claim.id === selectedId) ?? filteredClaims[0];
  }, [claims, filteredClaims, selectedId]);

  useEffect(() => {
    if (selectedClaim && selectedClaim.id !== selectedId) {
      setSelectedId(selectedClaim.id);
    }
  }, [selectedClaim, selectedId]);

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
        attributionLabel: "Needs community review",
        attributionExplanation:
          "This claim was submitted locally and needs community assessment of the attribution source.",
        veracityScore: 50,
        veracityLabel: "Evidence still developing",
        veracityExplanation:
          "One source is present. Add support and challenge evidence before treating the assessment as useful.",
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
            aiAssisted: false
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
                      veracityLabel: "Community assessment updated",
                      veracityExplanation:
                        "New live evidence has been added. Review the support and challenge source mix before relying on the score."
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
        aiAssisted: evidenceForm.aiAssisted
      };

      const baseClaim = storedClaims[selectedClaim.id] ?? selectedClaim;
      const nextClaim: Claim = {
        ...baseClaim,
        evidence: [evidence, ...baseClaim.evidence],
        veracityLabel: "Community assessment updated",
        veracityExplanation:
          "New local evidence has been added. Review the support and challenge source mix before relying on the score."
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
      {!targetedReviewMode && priorityClaim ? (
        <section className="priority-claim" aria-labelledby="priority-claim-title">
          {(() => {
            const counts = evidenceCounts(priorityClaim);
            const health = evidenceHealth(priorityClaim);
            const mission = reviewMission(priorityClaim);
            const actionLabel =
              mission.stance === "context"
                ? "Add context"
                : `Add ${mission.stance} evidence`;

            return (
              <>
                <div className="priority-claim-copy">
                  <div className="priority-claim-kicker">
                    <span className="claim-domain">{priorityClaim.domain}</span>
                    {isLiveSupabaseClaimId(priorityClaim.id) ? (
                      <span className="claim-domain">Live database</span>
                    ) : null}
                    <span>{claimFreshnessLabel(priorityClaim.createdAt)}</span>
                    <span>{priorityClaim.sourceQuality} source</span>
                  </div>
                  <h2 id="priority-claim-title">
                    {isReaderMode ? "Browse focus" : "Priority review"}
                  </h2>
                  <h3>{priorityClaim.title}</h3>
                  <p>
                    {isReaderMode
                      ? "Start with a claim that has source-backed evidence and an open source gap."
                      : "Ranked first by freshness, source strength, and an open evidence gap."}{" "}
                    Current source: {priorityClaim.sourcePublisher}.
                  </p>
                  <div className="priority-evidence" aria-label="Priority evidence counts">
                    <span className="support">{counts.support} support</span>
                    <span className="challenge">{counts.challenge} challenge</span>
                    <span>{counts.context} context</span>
                    <span>{health.highQualityCount} primary/direct</span>
                  </div>
                </div>
                {isReaderMode ? (
                  <div className="priority-action">
                    <span>Reader path</span>
                    <strong>Inspect source and evidence chain</strong>
                    <p>
                      Review the source line and current support, challenge, and
                      context entries before choosing a contribution route.
                    </p>
                    <div className="priority-actions">
                      {seedClaims.some((claim) => claim.id === priorityClaim.id) ? (
                        <Link
                          className="button primary compact"
                          href={`/claims/${priorityClaim.id}`}
                        >
                          Inspect details
                        </Link>
                      ) : null}
                      <button
                        className="button compact"
                        onClick={() => selectClaim(priorityClaim.id)}
                        type="button"
                      >
                        Focus claim
                      </button>
                      <Link className="button compact" href="/review/">
                        Review missions
                      </Link>
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
                        href={claimEvidencePath(priorityClaim.id, attribution)}
                      >
                        {actionLabel}
                      </Link>
                      <button
                        className="button compact"
                        onClick={() => selectClaim(priorityClaim.id)}
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
                  ? "Browse claims"
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
          ) : isReaderMode ? (
            <Link className="button compact" href="/submit/">
              Contribute
            </Link>
          ) : (
            <Link className="button compact" href="/review/">
              Review
            </Link>
          )}
        </div>

        {targetedReviewMode && !claimPickerOpen && selectedClaim ? (
          <p className="claim-picker-current">Current review: {selectedClaim.title}</p>
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

          <div className="filters" aria-label="Claim domain filters">
            {(["all", "ai", "technology", "news"] as const).map((domain) => (
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
          {supabaseMessage ? <p className="form-message">{supabaseMessage}</p> : null}

          <div className="claim-list-heading">
            <strong>Full claim list</strong>
            <span>{filteredClaims.length} showing</span>
          </div>

          <div
            className="claim-list"
            aria-busy={liveClaimsState === "loading"}
            aria-live="polite"
          >
            {liveClaimsState === "loading" ? (
              <div className="skeleton-list" aria-label="Loading live claims">
                <span className="skeleton-row" />
                <span className="skeleton-row" />
              </div>
            ) : null}

            {filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => {
                const counts = evidenceCounts(claim);
                const health = evidenceHealth(claim);
                return (
                  <button
                    className={selectedClaim?.id === claim.id ? "claim-row active" : "claim-row"}
                    key={claim.id}
                    onClick={() => selectClaim(claim.id)}
                    type="button"
                  >
                    <span className="claim-domain">{claim.domain}</span>
                    {isLiveSupabaseClaimId(claim.id) ? (
                      <span className="claim-domain">Live database</span>
                    ) : null}
                    <strong>{claim.title}</strong>
                    <span>
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
            <article className="detail">
              <div className="detail-heading">
                <div>
                  <p className="eyebrow">{selectedClaim.claimantName}</p>
                  {isLiveSupabaseClaimId(selectedClaim.id) ? (
                    <span className="claim-domain">Live database</span>
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

              <div className="score-grid">
                <section className="score">
                  <span>Attribution accuracy</span>
                  <strong>{selectedClaim.attributionScore}%</strong>
                  <p>{selectedClaim.attributionLabel}</p>
                  <small>{selectedClaim.attributionExplanation}</small>
                </section>
                <section className="score">
                  <span>Evidence coverage</span>
                  <strong>{selectedClaim.veracityScore}%</strong>
                  <p>{selectedClaim.veracityLabel}</p>
                  <small>{selectedClaim.veracityExplanation}</small>
                </section>
              </div>

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
                        <strong>{health.balanceLabel}</strong>
                        <span>balance check</span>
                      </div>
                    </>
                  );
                })()}
              </section>

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
                      {isReaderMode ? (
                        <Link className="button compact" href="/review/">
                          Review missions
                        </Link>
                      ) : (
                        <button className="button compact" onClick={copyReviewMission} type="button">
                          Copy mission
                        </button>
                      )}
                    </>
                  );
                })()}
              </section>
              {!isReaderMode && missionMessage ? (
                <p className="form-message">{missionMessage}</p>
              ) : null}

              <section className="assessment-checklist" aria-label="Assessment readiness">
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
                      label: "Veracity support",
                      done: health.support > 0,
                      detail: `${health.support} source${health.support === 1 ? "" : "s"}`
                    },
                    {
                      label: "Veracity challenge",
                      done: health.challenge > 0,
                      detail: `${health.challenge} source${health.challenge === 1 ? "" : "s"}`
                    }
                  ];

                  return checks.map((check) => (
                    <div className={check.done ? "check-item done" : "check-item"} key={check.label}>
                      <span>{check.done ? "Ready" : "Gap"}</span>
                      <strong>{check.label}</strong>
                      <small>{check.detail}</small>
                    </div>
                  ));
                })()}
              </section>

              <div className="source-line">
                {isLiveSupabaseClaimId(selectedClaim.id) ? (
                  <span>Live database</span>
                ) : null}
                <span>{selectedClaim.sourceQuality}</span>
                <a href={selectedClaim.sourceUrl} rel="noreferrer" target="_blank">
                  {selectedClaim.sourceTitle}
                </a>
              </div>

              <section className="evidence-section" aria-labelledby="evidence-title">
                <h3 id="evidence-title">Evidence chain</h3>
                <div className="evidence-list">
                  {selectedClaim.evidence.map((item) => (
                    <article className={`evidence ${item.stance}`} key={item.id}>
                      <div>
                        <span>{item.stance}</span>
                        <em>{item.assessmentTarget ?? "veracity"}</em>
                        <em>{item.sourceQuality}</em>
                        {item.aiAssisted ? <em>AI-assisted summary</em> : null}
                      </div>
                      <p>{item.summary}</p>
                      <a href={item.sourceUrl} rel="noreferrer" target="_blank">
                        {item.sourceTitle}
                      </a>
                    </article>
                  ))}
                </div>
              </section>
            </article>

            {isReaderMode ? (
              <section className="reader-route-panel" aria-labelledby="reader-route-title">
                <div className="reader-route-copy">
                  <p className="eyebrow">Browse paths</p>
                  <h2 id="reader-route-title">Inspect sources before contributing</h2>
                  <p>
                    Use the selected claim detail, current source, and evidence chain
                    for reading. Submit and review routes keep contribution controls
                    separate from this page.
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
                  <Link
                    className="reader-route-card"
                    href={claimEvidencePath(selectedClaim.id, attribution)}
                  >
                    <span>Contribute</span>
                    <strong>Contribute a source</strong>
                    <p>Use the explicit submit route for source-backed evidence.</p>
                  </Link>
                  <Link className="reader-route-card" href="/review/">
                    <span>Review</span>
                    <strong>Review missions</strong>
                    <p>Choose an evidence gap from the reviewer queue.</p>
                  </Link>
                </div>
              </section>
            ) : (
              <section className="form-panel" aria-labelledby="evidence-form-title">
                <h2 id="evidence-form-title">Add evidence</h2>
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
                  {evidenceSubmitting ? "Adding..." : "Add evidence"}
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
