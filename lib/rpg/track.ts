"use client";

/**
 * lib/rpg/track.ts — best-effort RPG event logging. Writes to the existing
 * analytics_events table (no schema change), so quest starts, arena results and
 * reward claims become durable + visible to parent reports. All failures are
 * swallowed: telemetry must never break the learning UI.
 */

import { createClient } from "@/lib/supabase/client";

export type RpgEvent =
  | "rpg_quest_started"
  | "rpg_arena_completed"
  | "rpg_reward_claimed"
  | "rpg_map_entered";

export async function logRpgEvent(eventType: RpgEvent, payload: Record<string, unknown> = {}, xpDelta = 0) {
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const user = data?.user;
    if (!user) return;
    await supabase.from("analytics_events").insert({
      user_id: user.id,
      event_type: eventType,
      event_payload: payload,
      xp_delta: xpDelta,
    });
  } catch {
    /* telemetry is best-effort */
  }
}
