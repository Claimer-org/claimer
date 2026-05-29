"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ensureProfile, getCurrentUser } from "../../lib/auth";
import { getSupabaseClient, hasSupabaseConfig } from "../../lib/supabase";
import { isLiveSupabaseClaimId } from "../../lib/supabase-claims";
import type {
  ClaimRow,
  EvidenceEntryRow,
  ProfileRow
} from "../../lib/supabase-contract";

type ProfileClaim = Pick<
  ClaimRow,
  "id" | "domain" | "title" | "source_url" | "created_at"
>;

type EvidenceClaim = Pick<ClaimRow, "id" | "title">;

type ProfileEvidence = Pick<
  EvidenceEntryRow,
  | "id"
  | "claim_id"
  | "stance"
  | "assessment_target"
  | "summary"
  | "source_url"
  | "created_at"
> & {
  claims?: EvidenceClaim | EvidenceClaim[] | null;
};

type ProfileState = {
  profile: ProfileRow | null;
  claims: ProfileClaim[];
  evidence: ProfileEvidence[];
};

type DirectoryState = {
  profiles: ProfileRow[];
  loading: boolean;
};

const emptyProfileState: ProfileState = {
  profile: null,
  claims: [],
  evidence: []
};

function profileHref(profileId: string) {
  return `/profiles?user=${encodeURIComponent(profileId)}`;
}

function profileClaimHref(claimId: string) {
  if (isLiveSupabaseClaimId(claimId)) {
    return `/claims/?claim=${encodeURIComponent(claimId)}`;
  }

  return `/claims/${claimId}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function firstRelation<T>(relation: T | T[] | null | undefined) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }
  return relation ?? null;
}

function handleLabel(profile: ProfileRow) {
  return profile.handle ? `@${profile.handle}` : "No handle yet";
}

function sourceHost(sourceUrl: string) {
  try {
    return new URL(sourceUrl).hostname.replace(/^www\./, "");
  } catch {
    return "source";
  }
}

function provisionalScore(claims: ProfileClaim[], evidence: ProfileEvidence[]) {
  const stanceSpread = new Set(evidence.map((entry) => entry.stance)).size;
  return claims.length * 5 + evidence.length * 3 + stanceSpread * 4;
}

function DirectoryLoadingState() {
  return (
    <div className="skeleton-list" aria-label="Loading contributors">
      <span className="skeleton-row" />
      <span className="skeleton-row" />
      <span className="skeleton-row" />
    </div>
  );
}

function ProfileLoadingState() {
  return (
    <div className="profile-loading" aria-label="Loading profile">
      <span className="profile-avatar-large skeleton-dot" />
      <div className="skeleton-stack">
        <span className="skeleton-line short" />
        <span className="skeleton-line" />
        <span className="skeleton-line medium" />
      </div>
    </div>
  );
}

export default function ProfilesClient() {
  const [profileState, setProfileState] =
    useState<ProfileState>(emptyProfileState);
  const [directoryState, setDirectoryState] = useState<DirectoryState>({
    profiles: [],
    loading: true
  });
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfiles() {
      try {
        if (!hasSupabaseConfig()) {
          setLoadingProfile(false);
          setDirectoryState({ profiles: [], loading: false });
          setMessage("Live profiles need Supabase env vars in this build.");
          return;
        }

        const supabase = getSupabaseClient();
        if (!supabase) {
          setLoadingProfile(false);
          setDirectoryState({ profiles: [], loading: false });
          setMessage("Supabase client unavailable.");
          return;
        }

        const requestedUserId = new URLSearchParams(window.location.search).get(
          "user"
        );
        const currentUser = await getCurrentUser();
        const realUser = currentUser && !currentUser.is_anonymous ? currentUser : null;

        if (realUser) {
          await ensureProfile(realUser);
        }

        const profileId = requestedUserId ?? realUser?.id ?? "";
        if (isMounted) {
          setCurrentUserId(realUser?.id ?? "");
          setSelectedUserId(profileId);
        }

        const { data: directory, error: directoryError } = await supabase
          .from("profiles")
          .select("id, display_name, handle, bio, reputation_points, created_at, updated_at")
          .order("created_at", { ascending: false })
          .limit(24);

        if (!isMounted) {
          return;
        }

        if (directoryError) {
          setMessage(`Profile directory failed: ${directoryError.message}`);
          setDirectoryState({ profiles: [], loading: false });
        } else {
          setDirectoryState({
            profiles: (directory ?? []) as ProfileRow[],
            loading: false
          });
        }

        if (!profileId) {
          setLoadingProfile(false);
          setProfileState(emptyProfileState);
          return;
        }

        const [
          { data: profile, error: profileError },
          { data: claims, error: claimsError },
          { data: evidence, error: evidenceError }
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, display_name, handle, bio, reputation_points, created_at, updated_at"
            )
            .eq("id", profileId)
            .maybeSingle(),
          supabase
            .from("claims")
            .select("id, domain, title, source_url, created_at")
            .eq("submitted_by", profileId)
            .order("created_at", { ascending: false })
            .limit(20),
          supabase
            .from("evidence_entries")
            .select(
              `
                id,
                claim_id,
                stance,
                assessment_target,
                summary,
                source_url,
                created_at,
                claims (
                  id,
                  title
                )
              `
            )
            .eq("submitted_by", profileId)
            .order("created_at", { ascending: false })
            .limit(20)
        ]);

        if (!isMounted) {
          return;
        }

        if (profileError || claimsError || evidenceError) {
          setMessage(
            profileError?.message ??
              claimsError?.message ??
              evidenceError?.message ??
              "Profile activity failed to load."
          );
        } else if (requestedUserId && !profile) {
          setMessage("That public profile is not available yet.");
        }

        setProfileState({
          profile: (profile as ProfileRow | null) ?? null,
          claims: (claims ?? []) as ProfileClaim[],
          evidence: (evidence ?? []) as ProfileEvidence[]
        });
        setLoadingProfile(false);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setMessage(
          error instanceof Error
            ? `Profile load failed: ${error.message}`
            : "Profile load failed."
        );
        setDirectoryState({ profiles: [], loading: false });
        setProfileState(emptyProfileState);
        setLoadingProfile(false);
      }
    }

    loadProfiles();

    return () => {
      isMounted = false;
    };
  }, []);

  const stats = useMemo(() => {
    const { claims, evidence } = profileState;
    const support = evidence.filter((entry) => entry.stance === "support").length;
    const challenge = evidence.filter(
      (entry) => entry.stance === "challenge"
    ).length;
    return {
      claims: claims.length,
      evidence: evidence.length,
      support,
      challenge,
      score: provisionalScore(claims, evidence)
    };
  }, [profileState]);

  const { profile, claims, evidence } = profileState;

  return (
    <div className="profiles-layout">
      <section className="profile-directory" aria-labelledby="directory-title">
        <div className="section-heading">
          <h2 id="directory-title">Public contributors</h2>
          {currentUserId ? (
            <a href={profileHref(currentUserId)}>Your profile</a>
          ) : (
            <Link href="/auth">Sign in</Link>
          )}
        </div>

        {directoryState.loading ? (
          <DirectoryLoadingState />
        ) : directoryState.profiles.length > 0 ? (
          <div className="profile-list">
            {directoryState.profiles.map((directoryProfile) => (
              <a
                className={
                  directoryProfile.id === selectedUserId
                    ? "profile-row active"
                    : "profile-row"
                }
                href={profileHref(directoryProfile.id)}
                key={directoryProfile.id}
              >
                <span className="profile-avatar-small">
                  {directoryProfile.display_name.slice(0, 2).toUpperCase()}
                </span>
                <span>
                  <strong>{directoryProfile.display_name}</strong>
                  <small>{handleLabel(directoryProfile)}</small>
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p className="profile-empty">No live profiles have been created yet.</p>
        )}
      </section>

      <section className="profile-detail" aria-live="polite">
        {message ? <p className="form-message">{message}</p> : null}

        {loadingProfile ? (
          <ProfileLoadingState />
        ) : profile ? (
          <>
            <div className="profile-hero">
              <span className="profile-avatar-large">
                {profile.display_name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <span className="claim-domain">Public profile</span>
                <h2>{profile.display_name}</h2>
                <p>{handleLabel(profile)}</p>
                {profile.bio ? <p>{profile.bio}</p> : null}
              </div>
            </div>

            <div className="profile-score-grid">
              <div>
                <span>Provisional reputation</span>
                <strong>
                  {Math.max(profile.reputation_points, stats.score)}
                </strong>
                <small>Activity-weighted placeholder</small>
              </div>
              <div>
                <span>Claims</span>
                <strong>{stats.claims}</strong>
                <small>Submitted by this profile</small>
              </div>
              <div>
                <span>Evidence</span>
                <strong>{stats.evidence}</strong>
                <small>
                  {stats.support} support / {stats.challenge} challenge
                </small>
              </div>
            </div>

            <div className="profile-activity-grid">
              <section className="profile-activity">
                <h3>Submitted claims</h3>
                {claims.length > 0 ? (
                  <div className="activity-list">
                    {claims.map((claim) => (
                      <article className="activity-item" key={claim.id}>
                        <span className="claim-domain">{claim.domain}</span>
                        <h4>
                          <Link href={profileClaimHref(claim.id)}>
                            {claim.title}
                          </Link>
                        </h4>
                        <small>
                          {formatDate(claim.created_at)} · {sourceHost(claim.source_url)}
                        </small>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="profile-empty">
                    No live claims from this profile yet.
                  </p>
                )}
              </section>

              <section className="profile-activity">
                <h3>Evidence activity</h3>
                {evidence.length > 0 ? (
                  <div className="activity-list">
                    {evidence.map((entry) => {
                      const claim = firstRelation(entry.claims);
                      return (
                        <article className="activity-item" key={entry.id}>
                          <span className={`stance-badge ${entry.stance}`}>
                            {entry.stance}
                          </span>
                          <h4>
                            {claim ? (
                              <Link href={profileClaimHref(claim.id)}>
                                {claim.title}
                              </Link>
                            ) : (
                              "Claim activity"
                            )}
                          </h4>
                          <p>{entry.summary}</p>
                          <small>
                            {formatDate(entry.created_at)} ·{" "}
                            {entry.assessment_target} ·{" "}
                            {sourceHost(entry.source_url)}
                          </small>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <p className="profile-empty">
                    No live evidence from this profile yet.
                  </p>
                )}
              </section>
            </div>
          </>
        ) : (
          <div className="profile-empty-state">
            <h2>No profile selected</h2>
            <p>
              Sign in to create your Claimer profile, or open a public
              contributor from the directory.
            </p>
            <Link className="button primary" href="/auth">
              Sign in
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
