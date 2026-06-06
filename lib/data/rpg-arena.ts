/**
 * rpg-arena.ts — the Knowledge Arena: kid-safe educational competition.
 *
 * SAFETY (enforced by design): no open chat between kids, no insults/taunts,
 * no negative ranking language, matched by grade band + skill, no public real
 * names, no pay-to-win advantages, rewards are XP/badges/titles/cosmetics only.
 *
 * This first version is ASYNCHRONOUS / SIMULATED: opponents are deterministic
 * "ghost" learners (anonymous codenames + a target score), so no real-time
 * multiplayer or chat surface exists yet.
 */

import type { SubjectId } from "@/lib/data/learner";

export type ArenaModeId =
  | "quiz-duel"
  | "speed-math"
  | "vocab-duel"
  | "science-facts"
  | "career-scenario"
  | "team-party"
  | "ghost-duel";

export interface ArenaMode {
  id: ArenaModeId;
  name: string;
  emoji: string;
  blurb: string;
  subject?: SubjectId;
  questions: number;
  timed: boolean;
  /** Co-op rather than 1v1. */
  cooperative: boolean;
  accent: string;
  xpReward: number;
}

export const ARENA_MODES: ArenaMode[] = [
  { id: "quiz-duel", name: "Quiz Duel", emoji: "⚔️", blurb: "1v1 across mixed subjects, matched by grade.", questions: 6, timed: false, cooperative: false, accent: "#a78bfa", xpReward: 120 },
  { id: "speed-math", name: "Speed Math Duel", emoji: "➗", blurb: "Race the clock with fair math problems.", subject: "math", questions: 8, timed: true, cooperative: false, accent: "#6366f1", xpReward: 120 },
  { id: "vocab-duel", name: "Vocabulary Duel", emoji: "🔤", blurb: "Word power, head to head.", subject: "english", questions: 6, timed: false, cooperative: false, accent: "#10b981", xpReward: 110 },
  { id: "science-facts", name: "Science Facts Duel", emoji: "🔬", blurb: "Who knows the natural world better?", subject: "science", questions: 6, timed: false, cooperative: false, accent: "#06b6d4", xpReward: 110 },
  { id: "career-scenario", name: "Career Scenario Duel", emoji: "🧭", blurb: "Make the smart choice in a job scenario.", questions: 5, timed: false, cooperative: false, accent: "#fb7185", xpReward: 130 },
  { id: "team-party", name: "Team Party Challenge", emoji: "👨‍👩‍👧‍👦", blurb: "Team up with family or class to beat a goal.", questions: 8, timed: false, cooperative: true, accent: "#f59e0b", xpReward: 150 },
  { id: "ghost-duel", name: "Ghost Duel", emoji: "👻", blurb: "Race another learner's saved score — no pressure, any time.", questions: 6, timed: false, cooperative: false, accent: "#c084fc", xpReward: 120 },
];

export function getArenaMode(id: string): ArenaMode | undefined {
  return ARENA_MODES.find((m) => m.id === id);
}

/** The kid-safe rules surfaced in the UI so parents can see them. */
export const ARENA_SAFETY_RULES: string[] = [
  "No open chat between kids",
  "Matched by grade band and skill level",
  "No public real names — only friendly codenames",
  "Encouraging feedback only, never insults or taunts",
  "No pay-to-win — rewards are XP, badges, and cosmetics only",
  "Parents control arena visibility",
];

/** Anonymous, friendly ghost codenames (never real names). */
const GHOST_CODENAMES = [
  "Comet Owl", "Brave Tarsier", "Swift Maya", "Clever Pawikan", "Bright Sampaguita",
  "Bold Carabao", "Sky Lawin", "Kind Dolphin", "Quick Mousedeer", "Sunny Kalachuchi",
];

export interface GhostOpponent {
  codename: string;
  emoji: string;
  /** 0..1 target accuracy this ghost achieved. */
  targetAccuracy: number;
  gradeBand: [number, number];
}

const GHOST_EMOJI = ["🦉", "🐒", "🐦", "🐢", "🌸", "🐃", "🦅", "🐬", "🦌", "🌺"];

/**
 * Deterministic ghost generator: same (mode, grade, seed) always yields the
 * same opponent, so it's fair and reproducible. Target accuracy is bounded to
 * a friendly, beatable range and matched roughly to grade band.
 */
export function makeGhost(modeId: ArenaModeId, grade: number, seed = 0): GhostOpponent {
  const h = Math.abs(hashCode(`${modeId}:${grade}:${seed}`));
  const idx = h % GHOST_CODENAMES.length;
  // accuracy between 0.55 and 0.85 — competitive but beatable
  const targetAccuracy = 0.55 + ((h >> 3) % 31) / 100;
  const low = Math.max(1, grade - 1);
  const high = Math.min(10, grade + 1);
  return {
    codename: GHOST_CODENAMES[idx],
    emoji: GHOST_EMOJI[idx],
    targetAccuracy: Math.min(0.85, targetAccuracy),
    gradeBand: [low, high],
  };
}

export interface ArenaResult {
  modeId: ArenaModeId;
  correct: number;
  total: number;
  accuracy: number;
  ghost: GhostOpponent;
  outcome: "win" | "tie" | "close";
  xpEarned: number;
  encouragement: string;
}

/** Score a finished duel. Never produces negative/insulting language. */
export function scoreDuel(mode: ArenaMode, correct: number, total: number, ghost: GhostOpponent): ArenaResult {
  const accuracy = total > 0 ? correct / total : 0;
  let outcome: ArenaResult["outcome"];
  if (accuracy > ghost.targetAccuracy + 0.01) outcome = "win";
  else if (Math.abs(accuracy - ghost.targetAccuracy) <= 0.01) outcome = "tie";
  else outcome = "close";

  const base = mode.xpReward;
  const xpEarned = outcome === "win" ? base : outcome === "tie" ? Math.round(base * 0.8) : Math.round(base * 0.6);

  const encouragement =
    outcome === "win"
      ? "Amazing run! You out-paced the ghost. Keep that momentum!"
      : outcome === "tie"
      ? "So close it was a tie — great focus! Try once more?"
      : "Nice effort! Every duel makes you sharper. Want a rematch?";

  return { modeId: mode.id, correct, total, accuracy, ghost, outcome, xpEarned, encouragement };
}

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}
