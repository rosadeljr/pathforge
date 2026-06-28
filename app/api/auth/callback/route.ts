import { createServerClient } from "@supabase/ssr";
import { serverAppUrl } from "@/lib/site-url";
import { NextRequest, NextResponse } from "next/server";

/**
 * OAuth callback — handles Supabase auth code exchange for Google sign-in
 * (and any other OAuth provider) plus email-confirmation / password-recovery
 * links.
 *
 * IMPORTANT (fixes the "log in twice" bug): the session cookies set during
 * exchangeCodeForSession are written DIRECTLY onto the redirect response we
 * return — not via next/headers cookies(), whose writes don't reliably attach
 * to a custom NextResponse.redirect(). If the cookies don't land on the
 * response, the very next page load looks signed-out and bounces to /login,
 * forcing a second sign-in.
 *
 * Other responsibilities:
 *   1. Surface OAuth error params (user-cancel, denied access) cleanly.
 *   2. Auto-create a profile row for Google-first sign-ins.
 *   3. Smart destination: parents → /parent, kids without a grade → setup,
 *      otherwise ?next= or /learn. Never block the redirect on a profile error.
 */

const SAFE_NEXT_PATHS = /^\/[^\s/]/; // must start with /, not //, not just /

function safeNext(raw: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("//") || /^https?:/i.test(raw)) return null;
  if (!SAFE_NEXT_PATHS.test(raw)) return null;
  if (raw.length > 256) return null;
  return raw;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  // Canonical origin for every redirect — prevents landing on a *.vercel.app
  // deployment host (which would orphan the auth cookie).
  const base = serverAppUrl(request);

  const redirectTo = (path: string) => {
    const url = new URL(path, base);
    return url;
  };

  // OAuth provider returned an error (user denied, popup closed, etc.)
  const oauthError = searchParams.get("error_description") || searchParams.get("error");
  if (oauthError) {
    const url = redirectTo("/login");
    url.searchParams.set("error", oauthError.slice(0, 160));
    return NextResponse.redirect(url);
  }

  if (!code) {
    return NextResponse.redirect(redirectTo("/login"));
  }

  // Collect the session cookies the exchange wants to set, keyed by name so the
  // newest write per cookie wins, then apply them to the final response.
  const cookieJar = new Map<string, { name: string; value: string; options: Record<string, unknown> }>();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const c of cookiesToSet) {
          cookieJar.set(c.name, { name: c.name, value: c.value, options: (c.options as Record<string, unknown>) || {} });
        }
      },
    },
  });

  // Finalize: build the redirect, then stamp every captured cookie onto it.
  const finish = (path: string) => {
    const res = NextResponse.redirect(redirectTo(path));
    for (const c of cookieJar.values()) {
      res.cookies.set(c.name, c.value, c.options);
    }
    return res;
  };

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) {
    console.error("[auth/callback] exchange failed:", exchangeError);
    const url = redirectTo("/login");
    url.searchParams.set("error", "auth_failed");
    return NextResponse.redirect(url);
  }

  // ── Decide destination (default /learn; never block on profile errors) ──
  let destination = next || "/learn";
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return finish(destination);

    const { data: existing } = await supabase
      .from("profiles")
      .select("id, learner_grade, is_parent_account, user_mode")
      .eq("id", user.id)
      .maybeSingle();

    let profile = existing;
    if (!profile) {
      const meta = (user.user_metadata || {}) as Record<string, unknown>;
      const usernameFromMeta =
        (meta.username as string) ||
        (meta.preferred_username as string) ||
        (meta.user_name as string) ||
        (meta.name as string) ||
        (user.email ? user.email.split("@")[0] : null);
      const fullNameFromMeta = (meta.full_name as string) || (meta.name as string) || usernameFromMeta;

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
      if (upsertErr) console.warn("[auth/callback] profile upsert non-fatal:", upsertErr.message);
      profile = created ?? null;
    }

    // Reconcile the parent flag carried through email confirmation. With
    // confirmation on, the signup page couldn't set is_parent_account (no
    // session yet) and the DB trigger creates the row defaulted to false — so
    // without this a confirmed parent would be misrouted into the kid setup.
    const wantsParent = ((user.user_metadata || {}) as Record<string, unknown>).is_parent === true;
    if (wantsParent && profile && !profile.is_parent_account) {
      const { error: flagErr } = await supabase
        .from("profiles")
        .update({ is_parent_account: true })
        .eq("id", user.id);
      if (flagErr) console.warn("[auth/callback] parent flag non-fatal:", flagErr.message);
      else profile = { ...profile, is_parent_account: true };
    }

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

  return finish(destination);
}
