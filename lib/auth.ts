import type { User } from "@supabase/supabase-js";
import { getSupabaseClient, hasSupabaseConfig } from "./supabase";

const appBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * Returns the URL to redirect users to after OAuth or magic link sign-in.
 * Points to the auth callback page which handles the token exchange.
 */
export function authRedirectUrl() {
  if (typeof window === "undefined") {
    return "";
  }
  return `${window.location.origin}${appBasePath}/auth/`;
}

/**
 * Returns the currently signed-in Supabase user, or null.
 */
export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabaseConfig()) {
    return null;
  }

  const supabase = getSupabaseClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase.auth.getSession();
  return data.session?.user ?? null;
}

/**
 * Signs in with email magic link.
 */
export async function signInWithMagicLink(email: string) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: authRedirectUrl()
    }
  });

  if (error) {
    throw new Error(`Magic link failed: ${error.message}`);
  }
}

/**
 * Signs in with Google OAuth.
 */
export async function signInWithGoogle() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: authRedirectUrl()
    }
  });

  if (error) {
    throw new Error(`Google sign-in failed: ${error.message}`);
  }
}

/**
 * Signs the user out.
 */
export async function signOut() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  await supabase.auth.signOut();
}

/**
 * Extracts a display name from the Supabase user object.
 */
export function displayName(user: User): string {
  const metadataName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : "";
  const emailName = user.email?.split("@")[0] ?? "";
  return metadataName || emailName || "Anonymous";
}

/**
 * Returns the user's avatar URL from Google metadata, or null.
 */
export function avatarUrl(user: User): string | null {
  const url = user.user_metadata?.avatar_url;
  return typeof url === "string" ? url : null;
}

/**
 * Returns initials for avatar fallback.
 */
export function initials(user: User): string {
  const name = displayName(user);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Ensures the user has a profile in the profiles table.
 * Creates one if it doesn't exist.
 */
export async function ensureProfile(user: User) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    await supabase.from("profiles").insert({
      id: user.id,
      display_name: displayName(user)
    });
  }
}

export type { User };
