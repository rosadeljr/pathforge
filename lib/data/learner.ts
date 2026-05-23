/**
 * Learner mode — subjects, grade levels, age tiers, and shared types.
 *
 * Evolved for ages 6 → 18 (Grades 1–12, PH K-12 system).
 * Three age tiers drive UI tone, lesson difficulty, and tutor voice:
 *   - "little"  Grades 1–3   (ages 6–9)    — playful, colorful, big buttons
 *   - "junior"  Grades 4–7   (ages 10–13)  — balanced, engaging
 *   - "teen"    Grades 8–12  (ages 14–18)  — mature, study-focused, college-ready
 */

export type SubjectId =
  | "math"
  | "english"
  | "filipino"
  | "science"
  | "araling-panlipunan";

export type AgeTier = "little" | "junior" | "teen";

export interface Subject {
  id: SubjectId;
  title: string;
  filipinoTitle: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  description: string;
  available: boolean;
}

export const SUBJECTS: Subject[] = [
  {
    id: "math",
    title: "Math",
    filipinoTitle: "Matematika",
    emoji: "🔢",
    gradient: "from-sky-400 to-blue-600",
    accentColor: "#0ea5e9",
    description: "Numbers, shapes, and problem-solving — from counting to calculus.",
    available: true,
  },
  {
    id: "english",
    title: "English",
    filipinoTitle: "Ingles",
    emoji: "📖",
    gradient: "from-violet-400 to-purple-600",
    accentColor: "#a855f7",
    description: "Reading, writing, grammar, and storytelling — build a confident voice.",
    available: true,
  },
  {
    id: "filipino",
    title: "Filipino",
    filipinoTitle: "Filipino",
    emoji: "🇵🇭",
    gradient: "from-amber-400 to-orange-600",
    accentColor: "#f59e0b",
    description: "Salita, kwento, panitikan, at kultura — mahalin ang sariling wika.",
    available: true,
  },
  {
    id: "science",
    title: "Science",
    filipinoTitle: "Agham",
    emoji: "🔬",
    gradient: "from-emerald-400 to-teal-600",
    accentColor: "#10b981",
    description: "How the world works — from plants and weather to atoms and forces.",
    available: true,
  },
  {
    id: "araling-panlipunan",
    title: "Araling Panlipunan",
    filipinoTitle: "Araling Panlipunan",
    emoji: "🌏",
    gradient: "from-rose-400 to-pink-600",
    accentColor: "#f43f5e",
    description: "Philippine history, geography, and the people who shaped us.",
    available: true,
  },
];

/** Full K-12 grade range. */
export const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

/** Grades that have at least one shipped lesson. Updated as content lands. */
export const COVERED_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export type LearnerMode = "career" | "learner";

export function getSubject(id: string | null | undefined): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function gradeLabel(grade: number): string {
  // PH K-12 nomenclature for senior high.
  if (grade === 11) return "Grade 11 · Senior High";
  if (grade === 12) return "Grade 12 · Senior High";
  return `Grade ${grade}`;
}

/** Map a grade level to its age tier. */
export function ageTierForGrade(grade: number | null | undefined): AgeTier {
  if (!grade || grade <= 3) return "little";
  if (grade <= 7) return "junior";
  return "teen";
}

/** Approximate age range string for a tier (for marketing copy). */
export function ageRangeForTier(tier: AgeTier): string {
  if (tier === "little") return "Ages 6–9";
  if (tier === "junior") return "Ages 10–13";
  return "Ages 14–18";
}

/** Display copy for the tier — used in onboarding + dashboard. */
export const TIER_COPY: Record<AgeTier, { label: string; tagline: string; emoji: string }> = {
  little: {
    label: "Little Forgers",
    tagline: "Bright, playful learning — one game at a time.",
    emoji: "🌟",
  },
  junior: {
    label: "Junior Forgers",
    tagline: "Build core skills, level up, and climb the leaderboard.",
    emoji: "🚀",
  },
  teen: {
    label: "Teen Forgers",
    tagline: "Master subjects, prep for college, explore careers.",
    emoji: "🎯",
  },
};

/** Greeting that adapts to the age tier. */
export function tierGreeting(tier: AgeTier, name: string): string {
  if (tier === "little") return `Hi ${name}! Ready to play?`;
  if (tier === "junior") return `Hey ${name} — let's level up.`;
  return `Welcome back, ${name}.`;
}
