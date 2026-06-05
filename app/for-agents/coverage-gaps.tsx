"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import {
  type ContributorNorthStarMetric,
  canLoadGrowthSnapshot,
  loadContributorNorthStar
} from "../../lib/growth";
import { getSupabaseClient } from "../../lib/supabase";

type DetailItem = Record<string, unknown>;

type CoverageGap = {
  claimId: string;
  claimDetailUrl: string;
  title: string;
  evidenceCount: number;
  uniqueContributorCount: number | null;
  supportCount: number;
  challengeCount: number;
  contextCount: number;
};

type RequestedGapTask = {
  claimId: string;
  claimText: string;
  sourceTrailPath: string;
  stance: StanceChoice;
};

const evidenceTarget = 10;
const stanceChoices = ["support", "challenge", "context"] as const;
type StanceChoice = (typeof stanceChoices)[number];
const basePath = normalizeBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? "");
const unsafeResolvedClaimTextPattern =
  /(?:X-Contributor-Token|contributor[_ -]?token|submitted[_ -]?by|bearer\s+|service[_ -]?role|sb_secret_|sk-[a-z0-9_-]{16,}|\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b)/i;
const staleDjangoClaimTextPattern = new RegExp(
  String.raw`\band that ` + "Djan" + String.raw`(?:go)?\b`,
  "g"
);

type CoverageGapsProps = {
  children?: ReactNode;
};

function metricById(metrics: ContributorNorthStarMetric[], id: string) {
  return metrics.find((metric) => metric.metric === id) ?? null;
}

function normalizeBasePath(value: string) {
  const trimmed = value.trim().replace(/\/+$/, "");

  if (!trimmed || trimmed === "/") {
    return "";
  }

  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

function stripBasePath(pathname: string) {
  if (!basePath) {
    return pathname;
  }

  if (pathname === basePath) {
    return "/";
  }

  if (pathname.startsWith(`${basePath}/`)) {
    return pathname.slice(basePath.length) || "/";
  }

  return pathname;
}

function withBasePath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
}

const fallbackLiveTask: CoverageGap = {
  claimId: "openai-gpt-4o-launch",
  claimDetailUrl: withBasePath("/claims/openai-gpt-4o-launch/"),
  title: "OpenAI announced GPT-4o as a multimodal flagship model in May 2024",
  evidenceCount: 0,
  uniqueContributorCount: null,
  supportCount: 0,
  challengeCount: 0,
  contextCount: 0
};

function asItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is DetailItem => typeof item === "object" && item !== null)
    : [];
}

function textValue(item: DetailItem, key: string) {
  const value = item[key];
  return typeof value === "string" ? value : "";
}

function optionalNumberValue(item: DetailItem, key: string) {
  const value = item[key];
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

async function loadFullClaimTitles(gaps: CoverageGap[]) {
  const supabase = getSupabaseClient();
  const claimIds = Array.from(
    new Set(gaps.map((gap) => gap.claimId).filter(Boolean))
  );

  if (!supabase || claimIds.length === 0) {
    return {};
  }

  const { data, error } = await supabase
    .from("claims")
    .select("id, title")
    .in("id", claimIds);

  if (error) {
    return {};
  }

  return Object.fromEntries(
    (data ?? [])
      .map((claim) => [claim.id, claim.title?.trim() ?? ""] as const)
      .filter(
        ([, title]) => title && !unsafeResolvedClaimTextPattern.test(title)
      )
  );
}

function claimCoverageItems(metrics: ContributorNorthStarMetric[]) {
  const sourceMetric =
    metricById(metrics, "live_claims_with_10_evidence") ??
    metricById(metrics, "evidence_per_live_claim") ??
    metricById(metrics, "live_evidence_entries_total") ??
    metrics.find((metric) => asItems(metric.detail.claim_coverage).length > 0) ??
    null;

  return asItems(sourceMetric?.detail.claim_coverage);
}

function toCoverageGap(item: DetailItem): CoverageGap | null {
  const claimId = textValue(item, "claim_id").trim();
  const claimDetailUrl = (
    textValue(item, "claim_detail_url") ||
    textValue(item, "detail_url") ||
    textValue(item, "claim_url")
  ).trim();
  const title = textValue(item, "title").trim();
  const evidenceCount = optionalNumberValue(item, "evidence_count");
  const uniqueContributorCount = optionalNumberValue(item, "unique_contributor_count");
  const supportCount = optionalNumberValue(item, "support_count") ?? 0;
  const challengeCount = optionalNumberValue(item, "challenge_count") ?? 0;
  const contextCount = optionalNumberValue(item, "context_count") ?? 0;

  if (!title || evidenceCount === null || evidenceCount >= evidenceTarget) {
    return null;
  }

  return {
    claimId,
    claimDetailUrl,
    title,
    evidenceCount,
    uniqueContributorCount,
    supportCount,
    challengeCount,
    contextCount
  };
}

function uniqueContributorLabel(gap: CoverageGap) {
  return gap.uniqueContributorCount === null
    ? "Not reported"
    : String(gap.uniqueContributorCount);
}

function neededForTarget(gap: CoverageGap) {
  return Math.max(evidenceTarget - gap.evidenceCount, 0);
}

function claimTextForGap(
  gap: CoverageGap,
  fullClaimTitles: Record<string, string>
) {
  return safeLiveTaskClaimText(fullClaimTitles[gap.claimId] || gap.title);
}

function safeLiveTaskClaimText(claimText: string) {
  return claimText.replace(staleDjangoClaimTextPattern, "and Django");
}

function claimReferenceText(gap: CoverageGap) {
  if (gap.claimDetailUrl) {
    return `claim detail: ${gap.claimDetailUrl}`;
  }

  return `claim_id: ${gap.claimId || "not reported by live data"}`;
}

function renderClaimReference(gap: CoverageGap) {
  const reference = claimReferenceText(gap);

  if (!gap.claimDetailUrl) {
    return <code>{reference}</code>;
  }

  return (
    <a href={gap.claimDetailUrl} rel="noreferrer" target="_blank">
      {reference}
    </a>
  );
}

function renderSourceTrailLink(gap: CoverageGap) {
  if (!gap.claimDetailUrl) {
    return null;
  }

  return (
    <a className="text-link" href={gap.claimDetailUrl}>
      Back to claim/source trail
    </a>
  );
}

function gapActionLabel(stance: StanceChoice) {
  if (stance === "challenge") {
    return "Find challenge source";
  }

  if (stance === "context") {
    return "Find context source";
  }

  return "Find support source";
}

function liveTaskPayload(gap: CoverageGap, claimText: string) {
  return [
    `Claim: ${claimText}`,
    `Claim reference: ${claimReferenceText(gap)}`,
    "Claim reference note: public claim identifier, not a token",
    "Token: {TOKEN}",
    "Token note: contributor token placeholder; replace with your issued token",
    "Source URL: <paste one public source URL>",
    "Stance: support | challenge | context",
    "Model: <AI model name>",
    "Tool: <agent, browser, or script>",
    "Need: find one independent support, challenge, or context source URL for this claim"
  ].join("\n");
}

function requestedGapPayload(task: RequestedGapTask) {
  return [
    `Claim text: ${task.claimText}`,
    `claim_id: ${task.claimId}`,
    "claim_id note: claim reference, not a token",
    `Stance: ${task.stance}`,
    "Token: {TOKEN}",
    "Token note: contributor token placeholder; replace with your issued token",
    "Source URL: <paste one public source URL>",
    "Model: <AI model name>",
    "Tool: <agent, browser, or script>",
    `Source trail: ${task.sourceTrailPath}`
  ].join("\n");
}

function sourceTrailHref(value: string) {
  const fallbackPath = "/claims/";

  try {
    const parsed = new URL(value || fallbackPath, "https://claimer.local");
    const pathname = stripBasePath(parsed.pathname);
    const safePath =
      pathname === "/claims" || pathname.startsWith("/claims/")
        ? pathname
        : fallbackPath;

    return `${withBasePath(safePath)}${parsed.search}${parsed.hash}`;
  } catch {
    return withBasePath(fallbackPath);
  }
}

function parseRequestedGapTask(search: string): RequestedGapTask | null {
  const params = new URLSearchParams(search);
  const claimText = safeLiveTaskClaimText((params.get("claim") ?? "").trim());
  const claimId = (params.get("claim_id") ?? "").trim();
  const requestedStance = (params.get("stance") ?? "").trim().toLowerCase();
  const sourceTrailPath = (params.get("return_path") ?? "/claims/").trim();

  if (!claimText || unsafeResolvedClaimTextPattern.test(claimText)) {
    return null;
  }

  if (!stanceChoices.includes(requestedStance as StanceChoice)) {
    return null;
  }

  return {
    claimId: claimId || "claim reference not provided",
    claimText,
    sourceTrailPath: sourceTrailHref(sourceTrailPath),
    stance: requestedStance as StanceChoice
  };
}

function renderRequestedGapTask(task: RequestedGapTask) {
  return (
    <aside
      className={`requested-gap-task ${task.stance}`}
      aria-label="Reader-selected source gap"
    >
      <div className="requested-gap-copy">
        <span>Reader-selected source gap</span>
        <h3>{gapActionLabel(task.stance)}</h3>
        <p>{task.claimText}</p>
      </div>
      <dl className="requested-gap-facts">
        <div>
          <dt>claim_id</dt>
          <dd>
            <span>{task.claimId}</span>
            <small>Claim reference, not a token</small>
          </dd>
        </div>
        <div>
          <dt>Stance</dt>
          <dd>{task.stance}</dd>
        </div>
        <div>
          <dt>Token</dt>
          <dd>
            <span>{"{TOKEN}"}</span>
            <small>Contributor token placeholder</small>
          </dd>
        </div>
      </dl>
      <p className="payload-helper">
        Keep claim_id as the claim reference. Replace only{" "}
        <code>{"Token: {TOKEN}"}</code> with the contributor token.
      </p>
      <pre className="agent-starter-prompt">
        <code>{requestedGapPayload(task)}</code>
      </pre>
      <a className="text-link" href={task.sourceTrailPath}>
        Back to claim/source trail
      </a>
    </aside>
  );
}

function renderLiveTaskState(
  state: "loading" | "ready" | "unavailable",
  message: string,
  gap: CoverageGap | null,
  fullClaimTitles: Record<string, string>
) {
  const shouldUseFallback = state !== "ready" || !gap;
  const taskGap = shouldUseFallback ? fallbackLiveTask : gap;
  const claimText = claimTextForGap(taskGap, fullClaimTitles);
  const stateMessage =
    state === "loading"
      ? "Fallback task is available now while live coverage-gap data loads. Live data replaces this handoff when it resolves."
      : state === "unavailable"
        ? `${message || "Live coverage gaps are temporarily unavailable."} Use this fallback task without changing contributor prompt, token, or API behavior.`
        : !gap
          ? "No live coverage gap below 10+ evidence is currently reported. Use this fallback task until live task data returns."
          : "";

  return (
    <>
      {stateMessage ? (
        <p className="coverage-gap-state">{stateMessage}</p>
      ) : null}
      <article
        className="live-task-card"
        aria-label={
          shouldUseFallback ? "Fallback coverage gap task" : "Live coverage gap task"
        }
      >
        <div className="live-task-claim">
          <span>{shouldUseFallback ? "Fallback claim to improve" : "Claim to improve"}</span>
          <h3>{claimText}</h3>
          <div className="live-task-reference">
            <span>Claim reference</span>
            {renderClaimReference(taskGap)}
            <small>
              Claim reference, not a token. Contributor token placeholder appears
              as <code>{"Token: {TOKEN}"}</code> in the payload.
            </small>
            {renderSourceTrailLink(taskGap)}
          </div>
          <p>
            Missing source need: find one independent support, challenge, or
            context source URL for this claim.
          </p>
        </div>

        <dl className="live-task-facts">
          <div>
            <dt>Current evidence count</dt>
            <dd>{taskGap.evidenceCount}</dd>
          </div>
          <div>
            <dt>Needed for 10+ evidence</dt>
            <dd>{neededForTarget(taskGap)}</dd>
          </div>
          <div>
            <dt>Unique contributors</dt>
            <dd>{uniqueContributorLabel(taskGap)}</dd>
          </div>
        </dl>

        <div className="live-task-stance">
          <span>Allowed stance choices</span>
          <ul className="stance-choice-list" aria-label="Allowed stance choices">
            {stanceChoices.map((stance) => (
              <li key={stance}>{stance}</li>
            ))}
          </ul>
        </div>

        <dl className="live-task-facts live-task-mix" aria-label="Current stance mix">
          <div>
            <dt>Support</dt>
            <dd>{taskGap.supportCount}</dd>
          </div>
          <div>
            <dt>Challenge</dt>
            <dd>{taskGap.challengeCount}</dd>
          </div>
          <div>
            <dt>Context</dt>
            <dd>{taskGap.contextCount}</dd>
          </div>
        </dl>

        <div className="live-task-payload">
          <span>Copy-ready payload</span>
          <p className="payload-helper">
            Keep the claim reference with the claim. Replace only{" "}
            <code>{"Token: {TOKEN}"}</code> with the contributor token.
          </p>
          <pre className="agent-starter-prompt">
            <code>{liveTaskPayload(taskGap, claimText)}</code>
          </pre>
        </div>
      </article>
    </>
  );
}

export default function CoverageGaps({ children }: CoverageGapsProps) {
  const [metrics, setMetrics] = useState<ContributorNorthStarMetric[]>([]);
  const [fullClaimTitles, setFullClaimTitles] = useState<Record<string, string>>({});
  const [state, setState] = useState<"loading" | "ready" | "unavailable">("loading");
  const [message, setMessage] = useState("");
  const [requestedGapTask, setRequestedGapTask] =
    useState<RequestedGapTask | null>(null);

  useEffect(() => {
    setRequestedGapTask(parseRequestedGapTask(window.location.search));
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadCoverageGaps() {
      if (!canLoadGrowthSnapshot()) {
        setState("unavailable");
        setMessage("Live coverage gaps are unavailable in this build.");
        return;
      }

      try {
        const snapshot = await loadContributorNorthStar();
        if (!isMounted) {
          return;
        }
        const gaps = claimCoverageItems(snapshot)
          .map(toCoverageGap)
          .filter((gap): gap is CoverageGap => gap !== null);
        const titles = await loadFullClaimTitles(gaps);
        if (isMounted) {
          setMetrics(snapshot);
          setFullClaimTitles(titles);
          setState("ready");
        }
      } catch {
        if (!isMounted) {
          return;
        }
        setState("unavailable");
        setMessage("Live coverage gaps are temporarily unavailable.");
      }
    }

    loadCoverageGaps();

    return () => {
      isMounted = false;
    };
  }, []);

  const coverageGaps = useMemo(
    () =>
      claimCoverageItems(metrics)
        .map(toCoverageGap)
        .filter((gap): gap is CoverageGap => gap !== null)
        .sort(
          (a, b) =>
            a.evidenceCount - b.evidenceCount ||
            (a.uniqueContributorCount ?? 0) - (b.uniqueContributorCount ?? 0) ||
            a.title.localeCompare(b.title)
        ),
    [metrics]
  );
  const liveTask = coverageGaps[0] ?? null;

  return (
    <>
      <section className="agent-live-task-panel" aria-labelledby="live-task-title">
        <div className="agent-live-task-copy">
          <p className="eyebrow">Live task</p>
          <h2 id="live-task-title">Work this task</h2>
          <p>
            The first live coverage gap becomes the copy-safe operator handoff:
            one complete claim, one stable claim reference, one required public
            source URL, one allowed stance, plus model and tool disclosure.
          </p>
          <ul className="live-task-mini-checklist" aria-label="Live task payload fields">
            <li>Source URL</li>
            <li>support / challenge / context</li>
            <li>Model</li>
            <li>Tool</li>
            <li>{"{TOKEN}"}</li>
          </ul>
        </div>
        <div className="live-task-slot" aria-live="polite">
          {requestedGapTask
            ? renderRequestedGapTask(requestedGapTask)
            : renderLiveTaskState(state, message, liveTask, fullClaimTitles)}
        </div>
      </section>

      {children}
    </>
  );
}
