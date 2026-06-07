/**
 * lib/rpg/state.ts — derives a normalized PlayerState for the RPG UI from data
 * that ALREADY persists (profiles + analytics_events). This keeps the game loop
 * honest: character level, XP, coins, streak, subject XP, lesson completions,
 * and boss clears are all real. Class XP is derived from the class's focus
 * subjects until the optional rpg migration adds a dedicated column.
 *
 * Pure module (no React, no Supabase) so it can run on client or server.
 */

import type { SubjectId } from "@/lib/data/learner";
import { subjectXpFromEvents } from "@/lib/data/curriculum";
import { getEntitlements, type Tier } from "@/lib/entitlements";
import {
  characterLevelFromXp,
  levelProgress,
  rankForLevel,
  nextRank,
  classLevelFromXp,
  classLevelProgress,
  coinsFromXp,
  type CharacterRank,
} from "@/lib/data/rpg-progression";
import {
  getClass,
  classTitleForLevel,
  nextClassTitle,
  CLASS_ALIASES,
  type LearnerClass,
  type ClassId,
  type ClassAdvancement,
} from "@/lib/data/rpg-classes";
import { WORLD_MAPS, mapUnlockStatus, type MapId, type WorldMap } from "@/lib/data/rpg-maps";
import { QUESTS, type Quest } from "@/lib/data/rpg-quests";
import { skillsForClass, isSkillUnlocked } from "@/lib/data/rpg-skills";

export interface RawProfile {
  username?: string | null;
  learner_grade?: number | null;
  learner_avatar_class?: string | null;
  learner_selected_class?: string | null; // optional new column
  learner_subjects?: string[] | null;
  total_xp?: number | null;
  current_level?: number | null;
  streak_count?: number | null;
  subscription_tier?: string | null;
  dream_career_id?: string | null;
  // optional RPG columns (may not exist yet)
  rpg_class_xp?: number | null;
  rpg_unlocked_skills?: string[] | null;
  rpg_earned_rewards?: string[] | null;
}

export interface RawEvent {
  event_type?: string | null;
  event_payload?: Record<string, unknown> | null;
  xp_delta?: number | null;
  created_at?: string | null;
}

export type QuestStatus = "completed" | "in-progress" | "available" | "locked";

export interface PlayerState {
  name: string;
  grade: number;
  tier: Tier;
  // character
  totalXp: number;
  characterLevel: number;
  rank: CharacterRank;
  nextRank: CharacterRank | null;
  level: { level: number; intoLevel: number; span: number; pct: number };
  coins: number;
  streak: number;
  // class
  classId: ClassId | null;
  cls: LearnerClass | null;
  classXp: number;
  classLevel: number;
  classTitle: ClassAdvancement | null;
  nextClassTitle: ClassAdvancement | null;
  classLevel_: { level: number; intoLevel: number; span: number; pct: number };
  // learning
  subjectXp: Record<SubjectId, number>;
  completedLessonIds: Set<string>;
  startedMapIds: MapId[];
  clearedBossIds: Set<string>;
  unlockedSkillIds: string[];
  earnedRewardIds: string[];
  startedQuestIds: Set<string>;
  dreamCareerId: string | null;
}

const SUBJECTS: SubjectId[] = ["math", "english", "filipino", "science", "araling-panlipunan"];

export function buildPlayerState(profile: RawProfile | null, events: RawEvent[] = []): PlayerState {
  const grade = profile?.learner_grade ?? 4;
  const tier = (profile?.subscription_tier as Tier) || "free";
  const totalXp = Math.max(0, profile?.total_xp ?? 0);

  const characterLevel = characterLevelFromXp(totalXp);
  const lp = levelProgress(totalXp);
  const rank = rankForLevel(characterLevel);

  // subject XP from real events
  const subjectXp = subjectXpFromEvents(events as never) as Record<SubjectId, number>;

  // selected class: explicit column → avatar alias → null
  const rawClass = profile?.learner_selected_class || profile?.learner_avatar_class || null;
  const classId = rawClass ? ((CLASS_ALIASES[rawClass] ?? rawClass) as ClassId) : null;
  const cls = getClass(classId);

  // class XP: persisted column if present, else derived from focus subjects
  let classXp = profile?.rpg_class_xp ?? 0;
  if (!classXp && cls) {
    classXp = cls.focusSubjects.reduce((sum, s) => sum + (subjectXp[s] ?? 0), 0);
  }
  const classLevel = classLevelFromXp(classXp);
  const classLevel_ = classLevelProgress(classXp);

  // completed lessons + boss clears + durable RPG events
  const completedLessonIds = new Set<string>();
  const clearedBossIds = new Set<string>();
  const claimedRewardIds = new Set<string>();
  const startedQuestIds = new Set<string>();
  for (const e of events) {
    const t = e.event_type;
    const p = (e.event_payload ?? {}) as Record<string, unknown>;
    if (t === "lesson_completed" && typeof p.lesson_id === "string") completedLessonIds.add(p.lesson_id);
    if ((t === "boss_cleared" || t === "region_cleared") && typeof p.boss_id === "string") clearedBossIds.add(p.boss_id as string);
    if (t === "rpg_reward_claimed" && typeof p.reward_id === "string") claimedRewardIds.add(p.reward_id as string);
    if (t === "rpg_quest_started" && typeof p.quest_id === "string") startedQuestIds.add(p.quest_id as string);
  }

  // started maps = any subject XP in the map's focus subject
  const startedMapIds: MapId[] = WORLD_MAPS.filter((m) => (subjectXp[m.subjectFocus] ?? 0) > 0).map((m) => m.id);

  // unlocked skills: explicit + derived from class level
  const explicitSkills = profile?.rpg_unlocked_skills ?? [];
  const unlockedSkillIds = cls
    ? skillsForClass(cls.id)
        .filter((n) => isSkillUnlocked(n, classLevel, explicitSkills))
        .map((n) => n.id)
    : [];

  const earnedRewardIds = Array.from(new Set([...(profile?.rpg_earned_rewards ?? []), ...claimedRewardIds]));

  return {
    name: profile?.username || "Hero",
    grade,
    tier,
    totalXp,
    characterLevel,
    rank,
    nextRank: nextRank(characterLevel),
    level: lp,
    coins: coinsFromXp(totalXp),
    streak: Math.max(0, profile?.streak_count ?? 0),
    classId: classId ?? null,
    cls: cls ?? null,
    classXp,
    classLevel,
    classTitle: cls ? classTitleForLevel(cls, classLevel) : null,
    nextClassTitle: cls ? nextClassTitle(cls, classLevel) : null,
    classLevel_,
    subjectXp: ensureAllSubjects(subjectXp),
    completedLessonIds,
    startedMapIds,
    clearedBossIds,
    unlockedSkillIds,
    earnedRewardIds,
    startedQuestIds,
    dreamCareerId: profile?.dream_career_id ?? null,
  };
}

function ensureAllSubjects(partial: Record<string, number>): Record<SubjectId, number> {
  const out = {} as Record<SubjectId, number>;
  for (const s of SUBJECTS) out[s] = partial[s] ?? 0;
  return out;
}

/** Map unlock status for the player. */
export function mapStatusFor(map: WorldMap, ps: PlayerState) {
  return mapUnlockStatus(map, { characterLevel: ps.characterLevel, tier: ps.tier, startedMaps: ps.startedMapIds });
}

/** Approx progress (0..100) within a map from lessons done in its subject. */
export function mapProgressPct(map: WorldMap, ps: PlayerState): number {
  const xp = ps.subjectXp[map.subjectFocus] ?? 0;
  // soft curve: 600 subject XP ≈ "explored"; boss clear caps to 100
  if (ps.clearedBossIds.has(map.boss.id)) return 100;
  return Math.min(95, Math.round((xp / 600) * 100));
}

export function bossCleared(map: WorldMap, ps: PlayerState): boolean {
  return ps.clearedBossIds.has(map.boss.id);
}

/**
 * Derive a quest's status for the player.
 * - Locked: below required level or behind a paid gate.
 * - Completed: boss cleared, or (lesson/quiz quest) enough subject lessons done.
 * - In-progress: some progress in the subject.
 * - Available: otherwise.
 * Non-lesson quests (project/reflection/etc.) are never auto-"completed" here
 * because that activity isn't persisted yet (documented limitation).
 */
export function questStatus(quest: Quest, ps: PlayerState): QuestStatus {
  const ent = getEntitlements(ps.tier);
  void ent;
  const tierRank: Record<Tier, number> = { free: 0, pro: 1, family: 1 };
  if (tierRank[ps.tier] < tierRank[quest.paidTier] && quest.paidTier !== "free") return "locked";
  if (ps.characterLevel < quest.requiredLevel) return "locked";

  if (quest.questType === "capstone" && ps.clearedBossIds.has(quest.id)) return "completed";

  if ((quest.completionType === "lesson" || quest.completionType === "quiz") && quest.subject) {
    const done = ps.subjectXp[quest.subject] ?? 0;
    const need =
      quest.difficulty === "starter" ? 60 :
      quest.difficulty === "easy" ? 150 :
      quest.difficulty === "medium" ? 350 :
      quest.difficulty === "hard" ? 600 : 800;
    if (done >= need) return "completed";
    if (done > 0) return "in-progress";
  }
  if (ps.startedQuestIds.has(quest.id)) return "in-progress";
  return "available";
}

export function questCounts(ps: PlayerState): { completed: number; available: number; locked: number } {
  let completed = 0, available = 0, locked = 0;
  for (const q of QUESTS) {
    const s = questStatus(q, ps);
    if (s === "completed") completed++;
    else if (s === "locked") locked++;
    else available++;
  }
  return { completed, available, locked };
}
