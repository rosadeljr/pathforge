/**
 * rpg-progression.ts — the math + naming of PathForge's career-adventure
 * progression. This sits ON TOP of the existing profile XP/level fields
 * (total_xp, current_level) and adds RPG-flavored derived ranks. It never
 * redefines how core XP is earned — it only interprets it.
 *
 * Language is deliberately non-combat: mastery, trials, challenges, growth.
 */

/** Global character rank ladder shown across the hub. */
export type CharacterRankId =
  | "novice-learner"
  | "first-class"
  | "guild-apprentice"
  | "specialist"
  | "future-professional";

export interface CharacterRank {
  id: CharacterRankId;
  title: string;
  emoji: string;
  /** Character level at which this rank begins. */
  minLevel: number;
  blurb: string;
  accent: string;
}

export const CHARACTER_RANKS: CharacterRank[] = [
  {
    id: "novice-learner",
    title: "Novice Learner",
    emoji: "🌱",
    minLevel: 1,
    blurb: "Every legend starts here. Explore, try, and grow.",
    accent: "#34d399",
  },
  {
    id: "first-class",
    title: "First Class",
    emoji: "⭐",
    minLevel: 5,
    blurb: "You chose your path and earned your class colors.",
    accent: "#38bdf8",
  },
  {
    id: "guild-apprentice",
    title: "Guild Apprentice",
    emoji: "🛡️",
    minLevel: 12,
    blurb: "A career guild has welcomed you. Real skills now.",
    accent: "#a78bfa",
  },
  {
    id: "specialist",
    title: "Specialist",
    emoji: "🎯",
    minLevel: 22,
    blurb: "Deep mastery in your subjects and your craft.",
    accent: "#fbbf24",
  },
  {
    id: "future-professional",
    title: "Future Professional",
    emoji: "🏆",
    minLevel: 35,
    blurb: "Ready to forge a real-world dream job.",
    accent: "#fb7185",
  },
];

/**
 * Character level from total XP. Mirrors the existing app convention where a
 * level costs roughly level*1000 XP, expressed as a cumulative curve so it is
 * stable and monotonic. Level 1 = 0 XP.
 */
export function characterLevelFromXp(totalXp: number): number {
  const xp = Math.max(0, Math.floor(totalXp || 0));
  let level = 1;
  let need = 0;
  // cumulative cost to REACH level L is sum_{i=1}^{L-1} i*1000
  while (true) {
    const costToNext = level * 1000;
    if (xp < need + costToNext) break;
    need += costToNext;
    level += 1;
  }
  return level;
}

/** XP boundaries for the current level: { floor, ceil, intoLevel, span, pct }. */
export function levelProgress(totalXp: number): {
  level: number;
  floor: number;
  ceil: number;
  intoLevel: number;
  span: number;
  pct: number;
} {
  const xp = Math.max(0, Math.floor(totalXp || 0));
  const level = characterLevelFromXp(xp);
  let floor = 0;
  for (let i = 1; i < level; i++) floor += i * 1000;
  const span = level * 1000;
  const intoLevel = xp - floor;
  const ceil = floor + span;
  return { level, floor, ceil, intoLevel, span, pct: Math.min(100, Math.round((intoLevel / span) * 100)) };
}

export function rankForLevel(level: number): CharacterRank {
  let current = CHARACTER_RANKS[0];
  for (const r of CHARACTER_RANKS) if (level >= r.minLevel) current = r;
  return current;
}

export function nextRank(level: number): CharacterRank | null {
  return CHARACTER_RANKS.find((r) => r.minLevel > level) ?? null;
}

/**
 * Class level from class XP. Class XP is a new, separate currency earned from
 * class quests. Lighter curve than character level (classes advance faster so
 * kids feel job growth). Level 1 = 0 class XP, each level costs 600 + 120*level.
 */
export function classLevelFromXp(classXp: number): number {
  const xp = Math.max(0, Math.floor(classXp || 0));
  let level = 1;
  let need = 0;
  while (true) {
    const costToNext = 600 + 120 * level;
    if (xp < need + costToNext) break;
    need += costToNext;
    level += 1;
  }
  return level;
}

export function classLevelProgress(classXp: number): { level: number; intoLevel: number; span: number; pct: number } {
  const xp = Math.max(0, Math.floor(classXp || 0));
  const level = classLevelFromXp(xp);
  let floor = 0;
  for (let i = 1; i < level; i++) floor += 600 + 120 * i;
  const span = 600 + 120 * level;
  const intoLevel = xp - floor;
  return { level, intoLevel, span, pct: Math.min(100, Math.round((intoLevel / span) * 100)) };
}

/** Coins are a soft, non-predatory currency: ~1 coin per 10 XP, plus quest bonuses. */
export function coinsFromXp(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp || 0) / 10);
}
