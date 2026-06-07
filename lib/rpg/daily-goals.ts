/**
 * Daily Goals — a lightweight, honest daily engagement loop for learners.
 *
 * Three goals refresh every day (a study goal, a quest goal, and an arena
 * goal) chosen deterministically from the local date so every kid on the same
 * day sees the same set. Progress is tracked client-side in localStorage and
 * incremented by real in-app actions (finishing a lesson, starting a quest,
 * playing a duel) via bumpDailyGoal(); it resets automatically at local
 * midnight. No fake progress — the bars only move when the kid actually does
 * the thing. Completing all three is a satisfying "collect" moment that also
 * logs an analytics event so streak/credit can be derived server-side.
 */

export type GoalMetric = "lesson" | "quest" | "arena";

export interface DailyGoal {
  id: string;
  metric: GoalMetric;
  target: number;
  emoji: string;
  title: string;
  href: string;
  xp: number;
}

const STUDY_GOALS: DailyGoal[] = [
  { id: "study-1", metric: "lesson", target: 1, emoji: "📚", title: "Finish 1 lesson", href: "/learn/quests", xp: 50 },
  { id: "study-2", metric: "lesson", target: 2, emoji: "📚", title: "Finish 2 lessons", href: "/learn/quests", xp: 90 },
];
const QUEST_GOALS: DailyGoal[] = [
  { id: "quest-1", metric: "quest", target: 1, emoji: "📜", title: "Take on a quest", href: "/learn/quests", xp: 40 },
  { id: "quest-2", metric: "quest", target: 2, emoji: "📜", title: "Take on 2 quests", href: "/learn/quests", xp: 70 },
];
const ARENA_GOALS: DailyGoal[] = [
  { id: "arena-1", metric: "arena", target: 1, emoji: "⚔️", title: "Play an Arena duel", href: "/learn/arena", xp: 40 },
];

const KEY = "pf_daily_v1";

/** Local YYYY-MM-DD (not UTC) so goals reset at the learner's midnight. */
export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** The three goals for a given day — always one study, one quest, one duel. */
export function goalsForDate(dateKey: string): DailyGoal[] {
  const h = hash(dateKey);
  return [
    STUDY_GOALS[h % STUDY_GOALS.length],
    QUEST_GOALS[(h >> 3) % QUEST_GOALS.length],
    ARENA_GOALS[(h >> 6) % ARENA_GOALS.length],
  ];
}

export interface DailyState {
  date: string;
  progress: Record<GoalMetric, number>;
  claimed: boolean;
}

function fresh(date: string): DailyState {
  return { date, progress: { lesson: 0, quest: 0, arena: 0 }, claimed: false };
}

/** Read today's state, auto-resetting when the day has rolled over. */
export function readDaily(): DailyState {
  const today = todayKey();
  if (typeof window === "undefined") return fresh(today);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const s = JSON.parse(raw) as DailyState;
      if (s.date === today && s.progress) {
        const progress = { lesson: 0, quest: 0, arena: 0 } as Record<GoalMetric, number>;
        Object.assign(progress, s.progress);
        return { date: today, progress, claimed: !!s.claimed };
      }
    }
  } catch {
    /* ignore corrupt cache */
  }
  return fresh(today);
}

function writeDaily(s: DailyState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
    window.dispatchEvent(new CustomEvent("pf-daily-change"));
  } catch {
    /* storage full / unavailable — non-fatal */
  }
}

/** Record real progress toward a metric. Called from quest/arena/lesson flows. */
export function bumpDailyGoal(metric: GoalMetric, n = 1) {
  const s = readDaily();
  s.progress[metric] = (s.progress[metric] ?? 0) + n;
  writeDaily(s);
}

/** Mark today's goals as collected (only meaningful once all are complete). */
export function claimDaily() {
  const s = readDaily();
  s.claimed = true;
  writeDaily(s);
}

/** Whether every goal for the day is met. */
export function allGoalsDone(state: DailyState): boolean {
  return goalsForDate(state.date).every((g) => (state.progress[g.metric] ?? 0) >= g.target);
}
