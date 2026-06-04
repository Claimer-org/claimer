"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  type User,
  avatarUrl,
  displayName,
  getCurrentUser,
  initials,
  signOut
} from "../lib/auth";
import { getSupabaseClient, hasSupabaseConfig } from "../lib/supabase";

export default function AuthWidget() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setLoading(false);
      return;
    }

    getCurrentUser().then((u) => {
      setUser(u);
      setLoading(false);
    });

    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading || !hasSupabaseConfig()) {
    return null;
  }

  if (!user || user.is_anonymous) {
    return null;
  }

  const avatar = avatarUrl(user);
  const name = displayName(user);
  const userInitials = initials(user);

  return (
    <div className="auth-widget">
      <Link className="auth-widget-user" href={`/profiles?user=${user.id}`}>
        {avatar ? (
          <img
            alt={name}
            className="auth-widget-avatar"
            height={28}
            src={avatar}
            width={28}
          />
        ) : (
          <span className="auth-widget-avatar auth-widget-avatar-fallback">
            {userInitials}
          </span>
        )}
        <span className="auth-widget-name">{name}</span>
      </Link>
      <button
        className="auth-widget-signout"
        onClick={() => {
          signOut().then(() => setUser(null));
        }}
        type="button"
      >
        Sign out
      </button>
    </div>
  );
}
