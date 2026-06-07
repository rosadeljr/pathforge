"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clientAppUrl } from "@/lib/site-url";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

/**
 * One-click Google sign-in. Requires the Google provider to be enabled in
 * the Supabase dashboard (Auth → Providers → Google) and the site's
 * /api/auth/callback URL added to the allowed Redirect URLs.
 *
 * Forwards the current page's `?returnTo=` param to the callback as `next`
 * so paid-tier flows (e.g. /signup?returnTo=/pricing?upgrade=pro) land
 * back on the right page after the OAuth round-trip.
 */
export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleGoogle = async () => {
    setLoading(true);
    try {
      // Read returnTo from the *current* URL. Only forward it if it's a
      // same-origin path (prevents open-redirect abuse via OAuth flow).
      let nextParam = "";
      if (typeof window !== "undefined") {
        const here = new URL(window.location.href);
        const raw = here.searchParams.get("returnTo");
        if (raw && raw.startsWith("/") && !raw.startsWith("//")) {
          nextParam = `?next=${encodeURIComponent(raw)}`;
        }
      }

      // Pin the OAuth round-trip to the canonical origin so the session
      // cookie is written for pathforger.app (not a *.vercel.app host).
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${clientAppUrl()}/api/auth/callback${nextParam}`,
        },
      });
      if (error) throw error;
      // On success the browser redirects to Google — nothing else to do.
    } catch (e: any) {
      toast.error(
        e?.message || "Google sign-in isn't available right now. Use email instead."
      );
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className="w-full inline-flex items-center justify-center gap-2.5 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.1] text-sm font-semibold text-slate-200 hover:bg-white/[0.06] hover:border-white/[0.16] disabled:opacity-60 transition-colors"
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </svg>
      )}
      {label}
    </button>
  );
}
