import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback — handles Supabase auth code exchange for Google sign-in
 * (and any other OAuth provider) plus email-confirmation links.
 *
 * Responsibilities:
 *   1. Surface OAuth error params (user-cancel, denied access) cleanly.
 *   2. Exchange the code for a session.
 *   3. Auto-create a profile row if Supabase only created the auth.users
 *      record (Google-first sign-ins). Email signups do this client-side
 *      but OAuth has no client-side hook for it.
 *   4. Decide a smart destination: parents → /parent, kids without a grade
 *      set → /learn/setup, otherwise → ?next= or /learn.
 *
 * Why we don't fail on profile errors: RLS could be stricter than expected,
 * or the columns may not yet exist on older deploys. Auth itself
 * succeeded — never block the user on an admin-data error.
 */

const SAFE_NEXT_PATHS = /^\/[^\s/]/; // must start with /, not //, not just /

function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  // Block protocol-relative and absolute URLs to prevent open redirects.
  if (raw.startsWith("//") || /^https?:/i.test(raw)) return null;
  if (!SAFE_NEXT_PATHS.test(raw)) return null;
  // Cap length so we don't shove huge data through redirects.
  if (raw.length > 256) return null;
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  // OAuth provider returned an error (user denied, popup closed, etc.)
  const oauthError =
    searchParams.get("error_description") || searchParams.get("error");
  if (oauthError) {
    const url = new URL("/login", request.url);
    url.searchParams.set(
      "error",
      // Keep the error message short — it shows in a toast.
      oauthError.slice(0, 160)
    );
    return NextResponse.redirect(url);
  }

  if (!code) {
    // Direct hit on /api/auth/callback without a code is just a stray
    // browser hit (back button, etc.). Send them home.
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );
  if (exchangeError) {
    console.error("[auth/callback] exchange failed:", exchangeError);
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(url);
  }

  // ── Decide destination ───────────────────────────────────────────────
  // Default for any unknown state is /learn (kid home). Specific roles
  // override that below. We deliberately don't block the redirect on any
  // profile error — auth succeeded, the kid should not get stuck.
  let destination = next || "/learn";
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // Try to read the profile. If it doesn't exist (Google first-time
    // sign-in), create a minimal one from auth metadata. RLS allows a
    // user to upsert their own row by id.
    const { data: existing } = await supabase
      .from("profiles")
      .select("id, learner_grade, is_parent_account, user_mode")
      .eq("id", user.id)
      .maybeSingle();

    let profile = existing;
    if (!profile) {
      // Username falls back through metadata sources so the kid sees a
      // real handle on /learn rather than "friend".
      const meta = (user.user_metadata || {}) as Record<string, unknown>;
      const usernameFromMeta =
        (meta.username as string) ||
        (meta.preferred_username as string) ||
        (meta.user_name as string) ||
        (meta.name as string) ||
        (user.email ? user.email.split("@")[0] : null);
      const fullNameFromMeta =
        (meta.full_name as string) ||
        (meta.name as string) ||
        usernameFromMeta;

      const { data: created, error: upsertErr } = await supabase
        .from("profiles")
        .upsert(
          {
            id: user.id,
            email: user.email ?? null,
            username: usernameFromMeta,
            full_name: fullNameFromMeta,
            user_mode: "learner",
          },
          { onConflict: "id" }
        )
        .select("id, learner_grade, is_parent_account, user_mode")
        .maybeSingle();
      if (upsertErr) {
        console.warn(
          "[auth/callback] profile upsert non-fatal:",
          upsertErr.message
        );
      }
      profile = created ?? null;
    }

    // Destination decision:
    //   1. Parents → /parent (their dashboard, not the kid home)
    //   2. Kids without a grade → /learn/setup (must finish onboarding)
    //   3. next= takes precedence ONLY for users who've already completed
    //      setup — protects new users from being deep-linked past setup.
    if (profile?.is_parent_account) {
      destination = "/parent";
    } else if (!profile?.learner_grade) {
      destination = "/learn/setup";
    } else {
      destination = next || "/learn";
    }
  } catch (e) {
    console.warn("[auth/callback] profile lookup non-fatal:", e);
  }

  return NextResponse.redirect(new URL(destination, request.url));
}
