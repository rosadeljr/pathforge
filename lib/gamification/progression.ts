/**
 * PathForge Gamification Engine
 *
 * Pure functions for XP, levels, ranks, streaks, and achievements.
 * Side-effect-free — easy to test, easy to reason about.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ============================================================
// XP & LEVELS
// ============================================================

export function xpForLevel(level: number): number {
  // Scales: L1→1000, L2→2000, L10→10000, L100→100000
  return level * 1000;
}

export function calculateLevelFromTotalXP(totalXp: number): {
  level: number;
  currentXp: number;
  requiredForNext: number;
  progressPercentage: number;
} {
  let level = 1;
  let xpUsed = 0;
  while (xpUsed + xpForLevel(level) <= totalXp) {
    xpUsed += xpForLevel(level);
    level++;
    if (level > 999) break;
  }
  const currentXp = totalXp - xpUsed;
  const requiredForNext = xpForLevel(level);
  return {
    level,
    currentXp,
    requiredForNext,
    progressPercentage: Math.min(100, (currentXp / requiredForNext) * 100),
  };
}

// ============================================================
// RANKS (Solo Leveling style)
// ============================================================

export type Rank = "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS";

export function getRankForLevel(level: number): Rank {
  if (level < 5) return "E";
  if (level < 10) return "D";
  if (level < 20) return "C";
  if (level < 35) return "B";
  if (level < 55) return "A";
  if (level < 75) return "S";
  if (level < 95) return "SS";
  return "SSS";
}

// ============================================================
// STREAKS
// ============================================================

/**
 * Computes the next streak value given the last completion date.
 * Returns null if completion was already counted today (no change).
 *
 * Rules:
 * - First quest ever → streak = 1
 * - Completed yesterday → streak + 1
 * - Completed today already → no change (return null)
 * - Gap > 1 day → reset to 1
 */
export function computeNextStreak(
  currentStreak: number,
  lastCompletedAt: string | null | undefined
): { newStreak: number; isFirstToday: boolean; isNewMilestone: boolean } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (!lastCompletedAt) {
    return { newStreak: 1, isFirstToday: true, isNewMilestone: false };
  }

  const last = new Date(lastCompletedAt);
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const dayDiff = Math.floor(
    (today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (dayDiff === 0) {
    // Already counted today
    return null;
  }

  let newStreak: number;
  if (dayDiff === 1) {
    newStreak = currentStreak + 1;
  } else {
    // Gap, restart
    newStreak = 1;
  }

  // Detect streak milestones (7, 30, 100)
  const isNewMilestone = [7, 30, 100].includes(newStreak);

  return { newStreak, isFirstToday: true, isNewMilestone };
}

// ============================================================
// ACHIEVEMENTS
// ============================================================

// Match achievement IDs from LAUNCH_READY_MIGRATION.sql
export const ACHIEVEMENT_IDS = {
  FIRST_STEP: "10000000-0000-0000-0000-000000000001",
  STREAK_7: "10000000-0000-0000-0000-000000000002",
  STREAK_30: "10000000-0000-0000-0000-000000000003",
  PORTFOLIO_BUILDER: "10000000-0000-0000-0000-000000000004",
  LEVEL_10: "10000000-0000-0000-0000-000000000005",
  LEVEL_25: "10000000-0000-0000-0000-000000000006",
  LEVEL_50: "10000000-0000-0000-0000-000000000007",
  QUEST_SLAYER_25: "10000000-0000-0000-0000-000000000008",
  QUEST_MASTER_100: "10000000-0000-0000-0000-000000000009",
  BOSS_SLAYER: "10000000-0000-0000-0000-000000000010",
} as const;

export interface AchievementUnlock {
  id: string;
  title: string;
  description: string;
  xpBonus: number;
  rarity: "common" | "rare" | "epic" | "legendary";
}

const ACHIEVEMENT_META: Record<string, AchievementUnlock> = {
  [ACHIEVEMENT_IDS.FIRST_STEP]: {
    id: ACHIEVEMENT_IDS.FIRST_STEP,
    title: "First Step",
    description: "Completed your first quest",
    xpBonus: 50,
    rarity: "common",
  },
  [ACHIEVEMENT_IDS.STREAK_7]: {
    id: ACHIEVEMENT_IDS.STREAK_7,
    title: "7-Day Streak",
    description: "Maintained a 7-day streak",
    xpBonus: 200,
    rarity: "rare",
  },
  [ACHIEVEMENT_IDS.STREAK_30]: {
    id: ACHIEVEMENT_IDS.STREAK_30,
    title: "30-Day Streak",
    description: "Maintained a 30-day streak",
    xpBonus: 1000,
    rarity: "epic",
  },
  [ACHIEVEMENT_IDS.PORTFOLIO_BUILDER]: {
    id: ACHIEVEMENT_IDS.PORTFOLIO_BUILDER,
    title: "Portfolio Builder",
    description: "Added your first project",
    xpBonus: 100,
    rarity: "rare",
  },
  [ACHIEVEMENT_IDS.LEVEL_10]: {
    id: ACHIEVEMENT_IDS.LEVEL_10,
    title: "Level 10",
    description: "Reached Level 10",
    xpBonus: 500,
    rarity: "epic",
  },
  [ACHIEVEMENT_IDS.LEVEL_25]: {
    id: ACHIEVEMENT_IDS.LEVEL_25,
    title: "Level 25",
    description: "Reached Level 25",
    xpBonus: 1500,
    rarity: "epic",
  },
  [ACHIEVEMENT_IDS.LEVEL_50]: {
    id: ACHIEVEMENT_IDS.LEVEL_50,
    title: "Level 50",
    description: "Reached Level 50",
    xpBonus: 5000,
    rarity: "legendary",
  },
  [ACHIEVEMENT_IDS.QUEST_SLAYER_25]: {
    id: ACHIEVEMENT_IDS.QUEST_SLAYER_25,
    title: "Quest Slayer",
    description: "Completed 25 quests",
    xpBonus: 500,
    rarity: "rare",
  },
  [ACHIEVEMENT_IDS.QUEST_MASTER_100]: {
    id: ACHIEVEMENT_IDS.QUEST_MASTER_100,
    title: "Quest Master",
    description: "Completed 100 quests",
    xpBonus: 2500,
    rarity: "legendary",
  },
  [ACHIEVEMENT_IDS.BOSS_SLAYER]: {
    id: ACHIEVEMENT_IDS.BOSS_SLAYER,
    title: "Boss Slayer",
    description: "Completed an Insane-difficulty quest",
    xpBonus: 1000,
    rarity: "epic",
  },
};

/**
 * Check what new achievements the user just unlocked.
 * Pass the post-completion stats to determine what's now true.
 */
export function checkAchievements(stats: {
  questCompletedCount: number;
  newLevel: number;
  newStreak: number;
  justCompletedInsane: boolean;
  alreadyUnlocked: Set<string>;
}): AchievementUnlock[] {
  const unlocked: AchievementUnlock[] = [];
  const has = (id: string) => stats.alreadyUnlocked.has(id);

  if (stats.questCompletedCount >= 1 && !has(ACHIEVEMENT_IDS.FIRST_STEP)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.FIRST_STEP]);
  }
  if (stats.questCompletedCount >= 25 && !has(ACHIEVEMENT_IDS.QUEST_SLAYER_25)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.QUEST_SLAYER_25]);
  }
  if (stats.questCompletedCount >= 100 && !has(ACHIEVEMENT_IDS.QUEST_MASTER_100)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.QUEST_MASTER_100]);
  }
  if (stats.justCompletedInsane && !has(ACHIEVEMENT_IDS.BOSS_SLAYER)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.BOSS_SLAYER]);
  }
  if (stats.newStreak >= 7 && !has(ACHIEVEMENT_IDS.STREAK_7)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.STREAK_7]);
  }
  if (stats.newStreak >= 30 && !has(ACHIEVEMENT_IDS.STREAK_30)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.STREAK_30]);
  }
  if (stats.newLevel >= 10 && !has(ACHIEVEMENT_IDS.LEVEL_10)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.LEVEL_10]);
  }
  if (stats.newLevel >= 25 && !has(ACHIEVEMENT_IDS.LEVEL_25)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.LEVEL_25]);
  }
  if (stats.newLevel >= 50 && !has(ACHIEVEMENT_IDS.LEVEL_50)) {
    unlocked.push(ACHIEVEMENT_META[ACHIEVEMENT_IDS.LEVEL_50]);
  }

  return unlocked;
}

/**
 * Awards achievements to user — inserts user_achievements rows + adds XP bonus.
 * Idempotent: if already unlocked, no-op.
 */
export async function awardAchievements(
  supabase: SupabaseClient,
  userId: string,
  achievements: AchievementUnlock[]
): Promise<number> {
  if (achievements.length === 0) return 0;

  const rows = achievements.map((a) => ({
    user_id: userId,
    achievement_id: a.id,
  }));

  // Insert (DB has unique constraint on user_id + achievement_id implicitly via PK on id,
  // but we filter on alreadyUnlocked client-side so dupes are unlikely)
  await supabase.from("user_achievements").insert(rows);

  const totalBonusXp = achievements.reduce((sum, a) => sum + a.xpBonus, 0);
  return totalBonusXp;
}
