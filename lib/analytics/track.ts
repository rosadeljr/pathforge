import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Server- and client-safe event tracking.
 * Writes to analytics_events table for in-app analytics.
 */

export type AnalyticsEvent =
  | "signup"
  | "onboarding_completed"
  | "onboarding_changed_path"
  | "quest_completed"
  | "quest_generated"
  | "level_up"
  | "achievement_unlocked"
  | "streak_milestone"
  | "project_added"
  | "subscription_upgraded"
  | "subscription_canceled"
  | "page_view"
  | "mentor_message_sent"
  // ── Ad-funnel events (for Meta/Google attribution + retention math) ──
  | "landing_view"
  | "signup_start"
  | "signup_complete"
  | "setup_complete"
  | "first_lesson_complete"
  | "parent_linked"
  | "pricing_viewed"
  | "payment_submitted"
  | "payment_approved"
  // ── Mastery/learning ──
  | "lesson_completed"
  | "boss_cleared"
  | "mastery_review_needed"
  | "region_cleared"
  // ── ForgeBot ──
  | "mentor_started_from_seed";

interface TrackOptions {
  payload?: Record<string, any>;
  xpDelta?: number;
  readinessDelta?: number;
}

/**
 * Fire-and-forget event tracking.
 * Errors are logged but never thrown — analytics should never break the app.
 */
export async function track(
  supabase: SupabaseClient,
  userId: string,
  event: AnalyticsEvent,
  options: TrackOptions = {}
): Promise<void> {
  try {
    await supabase.from("analytics_events").insert({
      user_id: userId,
      event_type: event,
      event_payload: options.payload || {},
      xp_delta: options.xpDelta || 0,
      readiness_delta: options.readinessDelta || 0,
    });
  } catch (err) {
    // Non-fatal — analytics should never break the user flow
    console.warn("[analytics] track failed:", event, err);
  }
}
