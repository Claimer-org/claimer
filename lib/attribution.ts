export type AttributionParams = Record<string, string>;

export const askNostrWorkflowSourceEvent =
  "ed74e5b3b76d355005e48ecb9424ae22abc2d8febc6618d39836165432fdae9d";

export const attributionParamKeys = [
  "ref",
  "claim_id",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "source_event"
] as const;

const askNostrLaunchCampaign = "milestone4-launch";
const askNostrLaunchContents = new Set([
  "asknostr_workflow_review",
  "reviewer_feedback_cta"
]);

type QueryParamsInput = Record<string, string | number | boolean | null | undefined>;

type AttributedPathOptions = {
  defaults?: QueryParamsInput;
  fallback?: QueryParamsInput;
  overrides?: QueryParamsInput;
};

function sanitizedQueryValue(value: string) {
  return value.replace(/[^\w .:/?&=%-]/g, "").slice(0, 180);
}

function setParams(params: URLSearchParams, values: QueryParamsInput | undefined) {
  if (!values) {
    return;
  }

  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    const sanitized = sanitizedQueryValue(String(value));
    if (sanitized) {
      params.set(key, sanitized);
    }
  });
}

function normalizedAttributionValue(value: string | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

export function isAskNostrLaunchAttribution(attribution: AttributionParams) {
  return (
    normalizedAttributionValue(attribution.utm_source) === "nostr" &&
    normalizedAttributionValue(attribution.utm_campaign) === askNostrLaunchCampaign &&
    askNostrLaunchContents.has(normalizedAttributionValue(attribution.utm_content))
  );
}

export function withBoundedAskNostrSourceEvent(attribution: AttributionParams) {
  if (attribution.source_event || !isAskNostrLaunchAttribution(attribution)) {
    return attribution;
  }

  return {
    ...attribution,
    source_event: askNostrWorkflowSourceEvent
  };
}

export function attributionFromSearch(search: string) {
  const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  const attribution: AttributionParams = {};

  attributionParamKeys.forEach((key) => {
    const value = params.get(key);
    if (!value) {
      return;
    }

    const sanitized = sanitizedQueryValue(value);
    if (sanitized) {
      attribution[key] = sanitized;
    }
  });

  return withBoundedAskNostrSourceEvent(attribution);
}

export function hasAttributionParams(attribution: AttributionParams) {
  return Object.keys(attribution).length > 0;
}

export function attributedPath(
  href: string,
  attribution: AttributionParams = {},
  options: AttributedPathOptions = {}
) {
  const url = new URL(href, "https://claimer.local");
  const params = new URLSearchParams(url.search);
  const activeAttribution = hasAttributionParams(attribution)
    ? attribution
    : options.fallback;

  setParams(params, options.defaults);
  setParams(params, activeAttribution);
  setParams(params, options.overrides);

  const query = params.toString();
  return `${url.pathname}${query ? `?${query}` : ""}${url.hash}`;
}
