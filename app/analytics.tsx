"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient, hasSupabaseConfig } from "../lib/supabase";

const visitorStorageKey = "claimer.analytics.visitorId.v1";
const sessionStorageKey = "claimer.analytics.sessionId.v1";
const campaignStorageKey = "claimer.analytics.campaign.v1";
const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const campaignParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "ref"
] as const;

type CampaignProperties = Partial<Record<(typeof campaignParams)[number], string>> & {
  landing_path?: string;
};

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (
      Number(char) ^
      (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (Number(char) / 4)))
    ).toString(16)
  );
}

function storedId(storage: Storage, key: string) {
  try {
    const existing = storage.getItem(key);
    if (existing) {
      return existing;
    }

    const id = randomId();
    storage.setItem(key, id);
    return id;
  } catch {
    return randomId();
  }
}

function normalizedPath(pathname: string | null) {
  const rawPath = pathname || "/";
  const withoutBase =
    appBasePath && rawPath.startsWith(appBasePath)
      ? rawPath.slice(appBasePath.length) || "/"
      : rawPath;

  return withoutBase.replace(/[^A-Za-z0-9/_-]/g, "").slice(0, 256) || "/";
}

function claimIdFromPath(path: string) {
  const match = path.match(/^\/(?:claims|submit)\/([A-Za-z0-9_-]{1,120})\/?$/);
  return match?.[1] ?? null;
}

function sanitizeCampaignValue(value: string) {
  return value.replace(/[^A-Za-z0-9._-]/g, "").slice(0, 80);
}

function campaignFromSearch(path: string) {
  const params = new URLSearchParams(window.location.search);
  const campaign: CampaignProperties = {};

  for (const key of campaignParams) {
    const value = params.get(key);
    if (value) {
      campaign[key] = sanitizeCampaignValue(value);
    }
  }

  if (Object.keys(campaign).length === 0) {
    return null;
  }

  return { ...campaign, landing_path: path };
}

function storedCampaign(path: string) {
  try {
    const currentCampaign = campaignFromSearch(path);
    if (currentCampaign) {
      window.sessionStorage.setItem(
        campaignStorageKey,
        JSON.stringify(currentCampaign)
      );
      return currentCampaign;
    }

    const stored = window.sessionStorage.getItem(campaignStorageKey);
    if (!stored) {
      return {};
    }

    const parsed = JSON.parse(stored) as CampaignProperties;
    return isCampaignProperties(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function isCampaignProperties(value: unknown): value is CampaignProperties {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every((item) => typeof item === "string");
}

function claimIdFromLocation(path: string) {
  const pathClaimId = claimIdFromPath(path);
  if (pathClaimId) {
    return pathClaimId;
  }

  const params = new URLSearchParams(window.location.search);
  const queryClaimId = params.get("claim_id") ?? params.get("claim");

  if (!queryClaimId) {
    return null;
  }

  return sanitizeCampaignValue(queryClaimId) || null;
}

function referrerOrigin() {
  if (!document.referrer) {
    return null;
  }

  try {
    const referrer = new URL(document.referrer);
    return referrer.origin === window.location.origin ? null : referrer.origin;
  } catch {
    return null;
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      return;
    }

    const path = normalizedPath(pathname);
    if (lastTrackedPath.current === path) {
      return;
    }
    lastTrackedPath.current = path;

    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const visitorId = storedId(window.localStorage, visitorStorageKey);
    const sessionId = storedId(window.sessionStorage, sessionStorageKey);
    const campaign = storedCampaign(path);
    const claimId = claimIdFromLocation(path);

    void (async () => {
      try {
        await supabase.from("analytics_events").insert({
          event_name: "page_view",
          path,
          visitor_id: visitorId,
          session_id: sessionId,
          claim_id: claimId,
          referrer_origin: referrerOrigin(),
          properties: campaign
        });
      } catch {
        // Analytics must never block the claim workflow.
      }
    })();
  }, [pathname]);

  return null;
}
