export type AttributionParams = Record<string, string>;

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

  return attribution;
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
