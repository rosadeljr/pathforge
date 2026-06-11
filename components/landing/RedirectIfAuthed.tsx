"use client";

/**
 * RedirectIfAuthed — on the public landing page, send already-signed-in users
 * straight into the app instead of showing them marketing. Uses getSession()
 * (a local cookie read, no network round-trip) so anonymous ad traffic is never
 * slowed down; only logged-in users trigger the profile read + redirect.
 */

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function RedirectIfAuthed() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (cancelled || !session?.user) return; // anonymous → stay on landing

        let dest = "/learn";
        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("is_parent_account, learner_grade")
            .eq("id", session.user.id)
            .maybeSingle();
          if (prof?.is_parent_account) dest = "/parent";
          else if (prof && prof.learner_grade == null) dest = "/learn/setup";
        } catch {
          /* fall back to /learn — its own guard handles parent/setup state */
        }
        if (!cancelled) window.location.replace(dest);
      } catch {
        /* no session / supabase unavailable → stay on landing */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
