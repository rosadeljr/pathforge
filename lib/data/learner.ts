/**
 * Learner mode — subjects, grade levels, age tiers, and shared types.
 *
 * Built for ages 6 → 15 (Grades 1–10, PH Elementary + Junior High).
 * Three age tiers drive UI tone, lesson difficulty, and tutor voice:
 *   - "little"  Grades 1–3   (ages 6–9)    — playful, colorful, big buttons
 *   - "junior"  Grades 4–7   (ages 10–13)  — balanced, engaging
 *   - "teen"    Grades 8–10  (ages 14–15)  — mature, study-focused
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

/** Supported grade range — PH Elementary (1–6) + Junior High (7–10). */
export const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

/** Grades that have at least one shipped lesson. Updated as content lands. */
export const COVERED_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type LearnerMode = "career" | "learner";

export function getSubject(id: string | null | undefined): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function gradeLabel(grade: number): string {
  // PH K-10 nomenclature: Grades 1-6 = Elementary, 7-10 = Junior High.
  if (grade >= 7 && grade <= 10) return `Grade ${grade} · Junior High`;
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
  return "Ages 14–15";
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

/**
 * Real-world job connection for each subject. Shown inline in lessons so
 * kids see how the skill ties to actual careers — bridges learning to
 * dream-job exploration.
 */
export interface RealWorldHook {
  career: string;
  emoji: string;
  blurb: string;
}

export const SUBJECT_REAL_WORLD: Record<SubjectId, RealWorldHook[]> = {
  math: [
    { career: "Engineers", emoji: "🏗️", blurb: "use math to design bridges and buildings that don't fall down." },
    { career: "Pilots", emoji: "✈️", blurb: "use math every flight to plan fuel, altitude, and timing." },
    { career: "Game designers", emoji: "🎮", blurb: "use math to make game physics feel real — jumps, gravity, scoring." },
    { career: "Doctors", emoji: "🩺", blurb: "use math to calculate exactly how much medicine a patient needs." },
    { career: "Astronauts", emoji: "🚀", blurb: "use math to launch rockets and dock with the space station." },
  ],
  english: [
    { career: "Writers", emoji: "✍️", blurb: "craft stories and books that change how people see the world." },
    { career: "Lawyers", emoji: "⚖️", blurb: "use clear English to defend people and argue cases in court." },
    { career: "Journalists", emoji: "📰", blurb: "write articles that inform millions of readers." },
    { career: "Software engineers", emoji: "💻", blurb: "read and write English to code with teammates worldwide." },
    { career: "Doctors", emoji: "🩺", blurb: "explain treatments clearly so patients understand what to do." },
  ],
  filipino: [
    { career: "Teachers", emoji: "👩‍🏫", blurb: "use Filipino to teach the next generation of bayani." },
    { career: "Writers", emoji: "✍️", blurb: "ang mga manunulat na tulad ni Rizal — binago ang ating bansa sa salita." },
    { career: "Filmmakers", emoji: "🎬", blurb: "direct stories in Filipino that win at film festivals around the world." },
    { career: "Journalists", emoji: "📺", blurb: "report news in Filipino so every Pilipino can understand." },
    { career: "Lawyers", emoji: "⚖️", blurb: "argue cases in Filipino courts and write contracts in our language." },
  ],
  science: [
    { career: "Doctors", emoji: "🩺", blurb: "use science to figure out what's wrong and how to heal you." },
    { career: "Scientists", emoji: "🔬", blurb: "do experiments that lead to vaccines, clean energy, and discoveries." },
    { career: "Veterinarians", emoji: "🐶", blurb: "use biology to keep animals healthy." },
    { career: "Engineers", emoji: "🏗️", blurb: "apply physics to build everything from skyscrapers to phones." },
    { career: "Astronauts", emoji: "🚀", blurb: "study physics, biology, and chemistry to live and work in space." },
  ],
  "araling-panlipunan": [
    { career: "Lawyers", emoji: "⚖️", blurb: "study Philippine history and constitution to defend justice today." },
    { career: "Diplomats", emoji: "🌏", blurb: "understand world history to represent the Philippines abroad." },
    { career: "Soldiers", emoji: "🪖", blurb: "study PH geography and history to protect every island." },
    { career: "Entrepreneurs", emoji: "💡", blurb: "understand the PH economy to grow businesses that hire Filipinos." },
    { career: "Teachers", emoji: "👩‍🏫", blurb: "pass our country's story to the next generation." },
  ],
};

/** Pick a real-world hook for a subject, deterministic by lessonId so it's stable per lesson. */
export function pickRealWorldHook(subject: SubjectId, lessonId: string): RealWorldHook {
  const hooks = SUBJECT_REAL_WORLD[subject] || [];
  if (!hooks.length) return { career: "Many people", emoji: "🌟", blurb: "use this every day." };
  // Hash the lesson id to pick a stable hook
  let h = 0;
  for (let i = 0; i < lessonId.length; i++) h = (h * 31 + lessonId.charCodeAt(i)) >>> 0;
  return hooks[h % hooks.length];
}
