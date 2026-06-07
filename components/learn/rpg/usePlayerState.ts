"use client";

/**
 * usePlayerState — loads the learner profile + analytics events (the data that
 * already persists) and builds a normalized PlayerState for the RPG screens.
 * Also exposes selectClass(), which optimistically updates and attempts to
 * persist to the optional `learner_selected_class` column (no-op if the column
 * isn't present yet — see the RPG migration).
 */

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildPlayerState, type PlayerState, type RawProfile, type RawEvent } from "@/lib/rpg/state";
import type { ClassId } from "@/lib/data/rpg-classes";

export function usePlayerState() {
  const [profile, setProfile] = useState<RawProfile | null>(null);
  const [events, setEvents] = useState<RawEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [override, setOverride] = useState<Partial<RawProfile>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setError("Not signed in");
        setLoading(false);
        return;
      }
      const [{ data: prof }, { data: evs }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase
          .from("analytics_events")
          .select("event_type, event_payload, xp_delta, created_at")
          .eq("user_id", user.id)
          .limit(2000),
      ]);
      setProfile((prof as RawProfile) ?? null);
      setEvents((evs as RawEvent[]) ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const selectClass = useCallback(async (id: ClassId) => {
    setSaving(true);
    setOverride((o) => ({ ...o, learner_selected_class: id }));
    try {
      const supabase = createClient();
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (user) {
        // Attempt to persist; silently tolerate a missing column (pre-migration).
        await supabase.from("profiles").update({ learner_selected_class: id }).eq("id", user.id);
      }
    } catch {
      /* tolerated — selection stays optimistic for this session */
    } finally {
      setSaving(false);
    }
  }, []);

  const merged: RawProfile | null = profile || Object.keys(override).length ? { ...(profile ?? {}), ...override } : null;
  const ps: PlayerState = buildPlayerState(merged, events);

  return { ps, loading, error, saving, refresh: load, selectClass };
}
