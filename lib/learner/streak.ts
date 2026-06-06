/**
 * Streak math — the daily-rollover engine.
 *
 * The schema has `streak_count` and `longest_streak` columns since day
 * one but no code maintained them — every UI showed 0d. This module
 * computes the next streak state given the previous state + today.
 *
 * Streak rules (kid-safe, generous):
 *   - Day buckets are UTC midnights so timezone churn doesn't break it.
 *   - Same day as last completion → no change (you already counted).
 *   - Exactly 1 day later (the "consecutive" case) → streak += 1.
 *   - 2+ days later AND freezes remaining → consume 1 freeze per missed
 *     day (we shield up to MAX_FREEZE_DAYS in a single gap) and treat
 *     the return as the next consecutive day.
 *   - 2+ days later AND no freezes → streak resets to 1 (today counts).
 *
 * A freeze is only consumed by the FIRST gap day; if the kid keeps
 * missing days beyond what their stockpile can cover, the streak resets
 * to 1 regardless. We never let freezes silently bury weeks of inactivity.
 */

/** Maximum consecutive missed days a stockpile can shield (not the
 * stockpile cap — that's enforced by the DB CHECK constraint). */
const MAX_FREEZE_DAYS = 2;

export interface StreakState {
  streakCount: number;
  longestStreak: number;
  freezesRemaining: number;
  /** Was a freeze just used? UI uses this for the 24h "protected" badge. */
  freezeUsed: boolean;
}

export interface StreakInput {
  prevStreakCount: number | null;
  prevLongestStreak: number | null;
  prevLastCompletedAt: string | null;
  freezesRemaining: number | null;
  /** Override clock for tests. Production passes Date.now(). */
  nowMs?: number;
}

/** Convert any ISO/Date-ish input to that day's UTC midnight epoch ms. */
function utcDayMs(input: string | number | Date): number {
  const d = typeof input === "number" ? new Date(input) : new Date(input);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/**
 * Compute the next streak state given the previous state and the
 * timestamp of the lesson completion that just happened.
 *
 * Pure function — no DB calls, easy to test.
 */
export function nextStreakState(input: StreakInput): StreakState {
  const now = input.nowMs ?? Date.now();
  const todayMs = utcDayMs(now);
  const prevStreak = Math.max(0, input.prevStreakCount ?? 0);
  const prevLongest = Math.max(0, input.prevLongestStreak ?? 0);
  const freezes = Math.max(0, input.freezesRemaining ?? 0);

  // First-ever completion (or column reset) → start the streak.
  if (!input.prevLastCompletedAt) {
    const streak = 1;
    return {
      streakCount: streak,
      longestStreak: Math.max(prevLongest, streak),
      freezesRemaining: freezes,
      freezeUsed: false,
    };
  }

  const lastMs = utcDayMs(input.prevLastCompletedAt);
  const dayDelta = Math.round((todayMs - lastMs) / (24 * 60 * 60 * 1000));

  // Same UTC day → already counted today; no change.
  if (dayDelta <= 0) {
    return {
      streakCount: prevStreak === 0 ? 1 : prevStreak,
      longestStreak: Math.max(prevLongest, prevStreak === 0 ? 1 : prevStreak),
      freezesRemaining: freezes,
      freezeUsed: false,
    };
  }

  // Exactly one day later → consecutive day.
  if (dayDelta === 1) {
    const streak = prevStreak + 1;
    return {
      streakCount: streak,
      longestStreak: Math.max(prevLongest, streak),
      freezesRemaining: freezes,
      freezeUsed: false,
    };
  }

  // Gap of 2+ days. Try to shield with freezes — one freeze per missed
  // day, up to MAX_FREEZE_DAYS. Anything larger forces a reset.
  const missedDays = dayDelta - 1;
  if (missedDays <= MAX_FREEZE_DAYS && freezes >= missedDays) {
    const streak = prevStreak + 1;
    return {
      streakCount: streak,
      longestStreak: Math.max(prevLongest, streak),
      freezesRemaining: freezes - missedDays,
      freezeUsed: true,
    };
  }

  // Reset — today counts as day 1.
  return {
    streakCount: 1,
    longestStreak: Math.max(prevLongest, 1),
    freezesRemaining: freezes,
    freezeUsed: false,
  };
}

/**
 * Was a freeze used recently enough to deserve a UI badge?
 * Default window: 24h.
 */
export function isFreezeProtected(
  frozenAt: string | null,
  nowMs: number = Date.now()
): boolean {
  if (!frozenAt) return false;
  const ageMs = nowMs - new Date(frozenAt).getTime();
  return ageMs >= 0 && ageMs < 24 * 60 * 60 * 1000;
}
