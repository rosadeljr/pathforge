/**
 * Daily Quests — 3 missions per day picked from a pool of 6.
 *
 * Rotates by date (UTC) so every kid sees the same 3 quests on the same
 * day. Quests refresh at midnight UTC (≈ 8am PHT). Progress is computed
 * client-side from today's analytics_events.
 */

import type { SubjectId } from "./learner";

export type QuestType =
  | "earn_xp"
  | "subjects_today"
  | "perfect_score"
  | "daily_goal"
  | "streak_keep"
  | "career_progress";

export interface Quest {
  id: QuestType;
  emoji: string;
  title: string;
  description: string;
  /** Bonus XP awarded the first time the quest is completed today. */
  xpReward: number;
  target: number;
  /** Tailwind gradient for the card */
  gradient: string;
  accentColor: string;
}

export const QUEST_POOL: Quest[] = [
  {
    id: "earn_xp",
    emoji: "⚡",
    title: "XP Hunter",
    description: "Earn 200 XP today across any lessons.",
    xpReward: 50,
    target: 200,
    gradient: "from-indigo-500 to-purple-600",
    accentColor: "#6366f1",
  },
  {
    id: "subjects_today",
    emoji: "🌈",
    title: "Subject Sampler",
    description: "Try lessons in 2 different subjects.",
    xpReward: 60,
    target: 2,
    gradient: "from-pink-400 to-rose-500",
    accentColor: "#ec4899",
  },
  {
    id: "perfect_score",
    emoji: "💯",
    title: "Perfectionist",
    description: "Ace 1 lesson — first try every question.",
    xpReward: 80,
    target: 1,
    gradient: "from-amber-400 to-orange-500",
    accentColor: "#f59e0b",
  },
  {
    id: "daily_goal",
    emoji: "🎯",
    title: "Goal Crusher",
    description: "Hit your daily XP goal.",
    xpReward: 40,
    target: 1,
    gradient: "from-emerald-400 to-teal-500",
    accentColor: "#10b981",
  },
  {
    id: "streak_keep",
    emoji: "🔥",
    title: "Streak Keeper",
    description: "Finish at least 1 lesson — keep the streak alive.",
    xpReward: 30,
    target: 1,
    gradient: "from-rose-400 to-red-500",
    accentColor: "#ef4444",
  },
  {
    id: "career_progress",
    emoji: "🚀",
    title: "Dream Chaser",
    description: "Work toward your dream career — finish any lesson.",
    xpReward: 50,
    target: 1,
    gradient: "from-violet-500 to-purple-700",
    accentColor: "#8b5cf6",
  },
];

/**
 * Pick 3 quests for the given date using a date-seeded hash. Same day =
 * same 3 quests across all kids. UTC-based so rotation is consistent.
 */
export function todaysQuests(date = new Date()): Quest[] {
  const seed = `${date.getUTCFullYear()}-${date.getUTCMonth()}-${date.getUTCDate()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = ((h << 5) - h + seed.charCodeAt(i)) | 0;
  }
  h = Math.abs(h);
  const picked: Quest[] = [];
  const used = new Set<number>();
  for (let i = 0; picked.length < 3 && i < 50; i++) {
    const idx = (h + i * 7) % QUEST_POOL.length;
    if (!used.has(idx)) {
      used.add(idx);
      picked.push(QUEST_POOL[idx]);
    }
  }
  return picked;
}

/** Stats computed from today's analytics_events + profile. */
export interface TodayStats {
  xpToday: number;
  lessonsToday: number;
  subjectsToday: Set<SubjectId>;
  perfectLessonsToday: number;
  dailyGoalHit: boolean;
  streakKept: boolean;
}

export interface QuestProgress {
  current: number;
  target: number;
  pct: number;
  done: boolean;
}

export function progressForQuest(quest: Quest, stats: TodayStats): QuestProgress {
  let current = 0;
  switch (quest.id) {
    case "earn_xp":
      current = stats.xpToday;
      break;
    case "subjects_today":
      current = stats.subjectsToday.size;
      break;
    case "perfect_score":
      current = stats.perfectLessonsToday;
      break;
    case "daily_goal":
      current = stats.dailyGoalHit ? 1 : 0;
      break;
    case "streak_keep":
      current = stats.streakKept ? 1 : 0;
      break;
    case "career_progress":
      current = stats.lessonsToday > 0 ? 1 : 0;
      break;
  }
  const clamped = Math.min(current, quest.target);
  return {
    current: clamped,
    target: quest.target,
    pct: Math.min(100, (current / quest.target) * 100),
    done: current >= quest.target,
  };
}
