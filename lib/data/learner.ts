/**
 * Learner mode — subjects, grade levels, and shared types for the
 * kids' education experience (the soft-pivot alongside career mode).
 *
 * Phase 0: just the scaffolding. Lesson content lands in Phase 1.
 */

export type SubjectId = "math" | "english" | "filipino" | "science" | "araling-panlipunan";

export interface Subject {
  id: SubjectId;
  title: string;
  filipinoTitle: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  description: string;
  available: boolean; // false = "coming soon"
}

export const SUBJECTS: Subject[] = [
  {
    id: "math",
    title: "Math",
    filipinoTitle: "Matematika",
    emoji: "🔢",
    gradient: "from-sky-400 to-blue-600",
    accentColor: "#0ea5e9",
    description: "Numbers, shapes, and problem-solving — one quest at a time.",
    available: true,
  },
  {
    id: "english",
    title: "English",
    filipinoTitle: "Ingles",
    emoji: "📖",
    gradient: "from-violet-400 to-purple-600",
    accentColor: "#a855f7",
    description: "Reading, writing, and storytelling for confident young voices.",
    available: true,
  },
  {
    id: "filipino",
    title: "Filipino",
    filipinoTitle: "Filipino",
    emoji: "🇵🇭",
    gradient: "from-amber-400 to-orange-600",
    accentColor: "#f59e0b",
    description: "Salita, kwento, at kultura — mahalin ang sariling wika.",
    available: true,
  },
  {
    id: "science",
    title: "Science",
    filipinoTitle: "Agham",
    emoji: "🔬",
    gradient: "from-emerald-400 to-teal-600",
    accentColor: "#10b981",
    description: "How the world works, from plants to planets.",
    available: false,
  },
  {
    id: "araling-panlipunan",
    title: "Araling Panlipunan",
    filipinoTitle: "Araling Panlipunan",
    emoji: "🌏",
    gradient: "from-rose-400 to-pink-600",
    accentColor: "#f43f5e",
    description: "Philippine history, geography, and the people who shaped us.",
    available: false,
  },
];

export const MVP_GRADES = [3, 4, 5] as const;
export const ALL_GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type LearnerMode = "career" | "learner";

export function getSubject(id: string | null | undefined): Subject | undefined {
  return SUBJECTS.find((s) => s.id === id);
}

export function gradeLabel(grade: number): string {
  return `Grade ${grade}`;
}
