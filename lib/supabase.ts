import { createClient } from "@supabase/supabase-js";
import type { SupabaseDatabase } from "./supabase-contract";

/**
 * Supabase client for browser/server use.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY from
 * environment variables. When running as a static export these will be
 * empty strings and the client will be null — the app gracefully falls
 * back to the local seed data in lib/claims.ts.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Returns a typed Supabase client, or null when the required env vars
 * are not configured (static-export / local-dev mode).
 */
export function getSupabaseClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }
  return createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey);
}

/**
 * Server-only Supabase client using the service role key.
 * Only use in API routes / server actions — never expose to the browser.
 */
export function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY ?? "";
  if (!supabaseUrl || !serviceKey) {
    return null;
  }
  return createClient<SupabaseDatabase>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });
}

export { supabaseUrl, supabaseAnonKey };
