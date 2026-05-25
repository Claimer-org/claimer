"use client";

import { useEffect, useState } from "react";
import {
  type User,
  avatarUrl,
  displayName,
  ensureProfile,
  getCurrentUser,
  initials,
  signInWithGoogle,
  signInWithMagicLink,
  signOut
} from "../../lib/auth";
import { getSupabaseClient, hasSupabaseConfig } from "../../lib/supabase";

export default function AuthClient() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!hasSupabaseConfig()) {
      setLoading(false);
      setMessage("Supabase is not configured. Auth is unavailable in local mode.");
      return;
    }

    // Handle hash fragment from OAuth redirect
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      const supabase = getSupabaseClient();
      if (supabase) {
        // Supabase client auto-parses the hash fragment
        supabase.auth.getSession().then(({ data }) => {
          const sessionUser = data.session?.user ?? null;
          if (sessionUser) {
            setUser(sessionUser);
            ensureProfile(sessionUser);
            setMessage(`Welcome, ${displayName(sessionUser)}!`);
          }
          setLoading(false);
        });
        // Clean up the URL
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
    }

    getCurrentUser().then((u) => {
      if (u && !u.is_anonymous) {
        setUser(u);
      }
      setLoading(false);
    });

    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user ?? null;
      if (sessionUser && !sessionUser.is_anonymous) {
        setUser(sessionUser);
        ensureProfile(sessionUser);
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function handleMagicLink(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setSending(true);

    try {
      await signInWithMagicLink(email);
      setMessage("Check your email for a magic sign-in link.");
      setEmail("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Failed to send magic link."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleGoogleSignIn() {
    setMessage("");
    try {
      await signInWithGoogle();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Google sign-in failed."
      );
    }
  }

  async function handleSignOut() {
    await signOut();
    setUser(null);
    setMessage("Signed out successfully.");
  }

  if (loading) {
    return (
      <div className="auth-panel">
        <p className="auth-loading">Loading authentication…</p>
      </div>
    );
  }

  if (user && !user.is_anonymous) {
    const avatar = avatarUrl(user);
    const name = displayName(user);
    const userInitials = initials(user);

    return (
      <div className="auth-panel">
        <div className="auth-user">
          {avatar ? (
            <img
              alt={name}
              className="auth-avatar"
              height={64}
              src={avatar}
              width={64}
            />
          ) : (
            <span className="auth-avatar auth-avatar-fallback">
              {userInitials}
            </span>
          )}
          <div className="auth-user-info">
            <strong>{name}</strong>
            {user.email ? <span>{user.email}</span> : null}
          </div>
        </div>

        <div className="auth-actions">
          <button className="button" onClick={handleSignOut} type="button">
            Sign out
          </button>
        </div>

        {message ? <p className="form-message">{message}</p> : null}
      </div>
    );
  }

  return (
    <div className="auth-panel">
      <div className="auth-hero">
        <h2>Join the community</h2>
        <p>
          Sign in to submit claims, add evidence, and build your reputation as a
          trusted reviewer.
        </p>
      </div>

      <button
        className="auth-button-google"
        onClick={handleGoogleSignIn}
        type="button"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        Continue with Google
      </button>

      <div className="auth-divider">
        <span>or</span>
      </div>

      <form className="auth-form" onSubmit={handleMagicLink}>
        <label>
          Email address
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        <button
          className="button primary"
          disabled={sending}
          type="submit"
        >
          {sending ? "Sending…" : "Send magic link"}
        </button>
      </form>

      {message ? <p className="form-message">{message}</p> : null}

      <p className="auth-footer-note">
        No password needed. We&apos;ll send a one-time sign-in link to your email.
      </p>
    </div>
  );
}
