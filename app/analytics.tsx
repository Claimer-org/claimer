"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getSupabaseClient, hasSupabaseConfig } from "../lib/supabase";

const visitorStorageKey = "claimer.analytics.visitorId.v1";
const sessionStorageKey = "claimer.analytics.sessionId.v1";
const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
  const match = path.match(/^\/claims\/([A-Za-z0-9_-]{1,120})\/?$/);
  return match?.[1] ?? null;
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

    void (async () => {
      try {
        await supabase.from("analytics_events").insert({
          event_name: "page_view",
          path,
          visitor_id: visitorId,
          session_id: sessionId,
          claim_id: claimIdFromPath(path),
          referrer_origin: referrerOrigin(),
          properties: {}
        });
      } catch {
        // Analytics must never block the claim workflow.
      }
    })();
  }, [pathname]);

  return null;
}
