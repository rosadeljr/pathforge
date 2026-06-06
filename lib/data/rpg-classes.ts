/**
 * rpg-classes.ts — PathForge learner classes (jobs). Original worldbuilding.
 * Each class is a kid-friendly identity that maps to real subjects and real
 * careers, with a non-combat advancement path toward a dream job.
 *
 * NOTE: This is a superset of the cosmetic `avatar-classes.ts`. The five
 * avatar classes (scholar/explorer/inventor/guardian/storyteller) are kept as
 * aliases so existing profiles keep working — see CLASS_ALIASES below.
 */

import type { SubjectId } from "@/lib/data/learner";

export type ClassId =
  | "scholar"
  | "builder"
  | "healer"
  | "storyteller"
  | "explorer"
  | "guardian"
  | "merchant"
  | "tech-tinkerer"
  | "creator"
  | "navigator";

/** Class-specific advancement ladder (Novice → … → Future Professional flavored per class). */
export interface ClassAdvancement {
  tier: number;
  title: string;
  emoji: string;
  /** Class level at which this title is reached. */
  classLevel: number;
}

export interface LearnerClass {
  id: ClassId;
  name: string;
  emoji: string;
  tagline: string;
  description: string;
  accent: string; // hex
  gradient: string; // tailwind from-/via-/to- triple
  focusSubjects: SubjectId[];
  recommendedCareers: string[]; // career ids from careers.ts
  /** Skill tree id (1:1 with class id; see rpg-skills.ts). */
  skillTreeId: ClassId;
  /** Quest ids that belong to this class (see rpg-quests.ts). */
  classQuestIds: string[];
  /** Reward ids unlocked through this class (see rpg-rewards.ts). */
  outfitRewards: string[];
  advancement: ClassAdvancement[];
  /** Free starter classes available without a subscription. */
  starter: boolean;
}

/** Map old cosmetic avatar-class ids onto the richer RPG classes. */
export const CLASS_ALIASES: Record<string, ClassId> = {
  scholar: "scholar",
  explorer: "explorer",
  inventor: "tech-tinkerer",
  guardian: "guardian",
  storyteller: "storyteller",
};

function ladder(parts: Array<[string, string, number]>): ClassAdvancement[] {
  return parts.map(([title, emoji, classLevel], i) => ({ tier: i + 1, title, emoji, classLevel }));
}

export const LEARNER_CLASSES: LearnerClass[] = [
  {
    id: "scholar",
    name: "Scholar",
    emoji: "📚",
    tagline: "Curious. Sharp. Always asking why.",
    description:
      "Scholars love figuring things out. They turn questions into knowledge and lead the way in every subject.",
    accent: "#6366f1",
    gradient: "from-indigo-500 via-violet-500 to-purple-500",
    focusSubjects: ["math", "english", "science"],
    recommendedCareers: ["scientist", "teacher", "lawyer", "data-scientist"],
    skillTreeId: "scholar",
    classQuestIds: ["cq-scholar-1", "cq-scholar-2", "cq-scholar-3"],
    outfitRewards: ["outfit-scholar-robe", "title-the-curious"],
    advancement: ladder([
      ["Novice Scholar", "🌱", 1],
      ["Study Apprentice", "📖", 4],
      ["Knowledge Specialist", "🧠", 10],
      ["Future Researcher", "🔬", 18],
    ]),
    starter: true,
  },
  {
    id: "builder",
    name: "Builder",
    emoji: "🛠️",
    tagline: "Plans it. Measures it. Makes it real.",
    description:
      "Builders use math and science to design and create. From bridges to robots, they make ideas stand up.",
    accent: "#f59e0b",
    gradient: "from-amber-500 via-orange-500 to-yellow-500",
    focusSubjects: ["math", "science"],
    recommendedCareers: ["engineer", "robotics", "electrician-trade", "cloud-architect"],
    skillTreeId: "builder",
    classQuestIds: ["cq-builder-1", "cq-builder-2", "cq-builder-3"],
    outfitRewards: ["outfit-builder-vest", "title-the-maker"],
    advancement: ladder([
      ["Junior Builder", "🔧", 1],
      ["Systems Maker", "⚙️", 5],
      ["Design Specialist", "📐", 11],
      ["Future Engineer", "🏗️", 19],
    ]),
    starter: true,
  },
  {
    id: "healer",
    name: "Healer",
    emoji: "🩺",
    tagline: "Caring. Steady. Helps others feel better.",
    description:
      "Healers learn how the body and mind work, and how to care for people. Science and kindness, together.",
    accent: "#10b981",
    gradient: "from-emerald-500 via-teal-500 to-green-500",
    focusSubjects: ["science", "english"],
    recommendedCareers: ["doctor", "nurse", "vet"],
    skillTreeId: "healer",
    classQuestIds: ["cq-healer-1", "cq-healer-2", "cq-healer-3"],
    outfitRewards: ["outfit-healer-coat", "title-the-caring"],
    advancement: ladder([
      ["Health Helper", "💚", 1],
      ["Junior Medic", "🚑", 5],
      ["Care Specialist", "🏥", 11],
      ["Future Doctor", "👩‍⚕️", 19],
    ]),
    starter: true,
  },
  {
    id: "storyteller",
    name: "Storyteller",
    emoji: "✍️",
    tagline: "Words that move people.",
    description:
      "Storytellers master language — reading, writing, and speaking. They share ideas that others remember.",
    accent: "#ec4899",
    gradient: "from-pink-500 via-rose-500 to-fuchsia-500",
    focusSubjects: ["english", "filipino"],
    recommendedCareers: ["writer", "teacher", "lawyer", "filmmaker"],
    skillTreeId: "storyteller",
    classQuestIds: ["cq-storyteller-1", "cq-storyteller-2", "cq-storyteller-3"],
    outfitRewards: ["outfit-storyteller-cloak", "title-the-wordsmith"],
    advancement: ladder([
      ["Word Sprout", "🌱", 1],
      ["Page Crafter", "📝", 4],
      ["Narrative Specialist", "📜", 10],
      ["Future Author", "🖋️", 18],
    ]),
    starter: true,
  },
  {
    id: "explorer",
    name: "Explorer",
    emoji: "🧭",
    tagline: "Goes far. Learns everywhere.",
    description:
      "Explorers love the world — places, people, and history. They connect every subject to real journeys.",
    accent: "#06b6d4",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    focusSubjects: ["araling-panlipunan", "science", "english"],
    recommendedCareers: ["scientist", "pilot", "seafarer", "farmer-agri"],
    skillTreeId: "explorer",
    classQuestIds: ["cq-explorer-1", "cq-explorer-2", "cq-explorer-3"],
    outfitRewards: ["outfit-explorer-gear", "title-the-wayfinder"],
    advancement: ladder([
      ["Trail Scout", "🌱", 1],
      ["Field Researcher", "🗺️", 5],
      ["Expedition Specialist", "⛺", 11],
      ["Future Explorer", "🌍", 19],
    ]),
    starter: true,
  },
  {
    id: "guardian",
    name: "Guardian",
    emoji: "🛡️",
    tagline: "Brave. Fair. Protects the team.",
    description:
      "Guardians study communities, safety, and leadership. They stand up for others and keep things fair.",
    accent: "#3b82f6",
    gradient: "from-blue-500 via-indigo-500 to-cyan-500",
    focusSubjects: ["araling-panlipunan", "filipino"],
    recommendedCareers: ["public-service-officer", "soldier", "firefighter", "lawyer"],
    skillTreeId: "guardian",
    classQuestIds: ["cq-guardian-1", "cq-guardian-2", "cq-guardian-3"],
    outfitRewards: ["outfit-guardian-armor", "title-the-brave"],
    advancement: ladder([
      ["Community Helper", "🤝", 1],
      ["Junior Leader", "🎖️", 5],
      ["Service Specialist", "🏛️", 11],
      ["Future Public Servant", "⚖️", 19],
    ]),
    starter: false,
  },
  {
    id: "merchant",
    name: "Merchant",
    emoji: "🪙",
    tagline: "Plans, trades, and grows ideas.",
    description:
      "Merchants learn money smarts, planning, and people skills. They turn small ideas into big ventures.",
    accent: "#eab308",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    focusSubjects: ["math", "english"],
    recommendedCareers: ["entrepreneur", "customer-service-bpo"],
    skillTreeId: "merchant",
    classQuestIds: ["cq-merchant-1", "cq-merchant-2", "cq-merchant-3"],
    outfitRewards: ["outfit-merchant-coat", "title-the-founder"],
    advancement: ladder([
      ["Shop Planner", "🧺", 1],
      ["Young Founder", "💡", 5],
      ["Venture Specialist", "📊", 11],
      ["Future Entrepreneur", "🏪", 19],
    ]),
    starter: false,
  },
  {
    id: "tech-tinkerer",
    name: "Tech Tinkerer",
    emoji: "💡",
    tagline: "Logic, code, and clever machines.",
    description:
      "Tech Tinkerers love logic and building with code. They solve puzzles and design games and apps.",
    accent: "#8b5cf6",
    gradient: "from-violet-500 via-purple-500 to-indigo-500",
    focusSubjects: ["math", "science"],
    recommendedCareers: ["software-engineer", "game-designer", "game-developer", "ai-engineer", "cybersecurity"],
    skillTreeId: "tech-tinkerer",
    classQuestIds: ["cq-tech-1", "cq-tech-2", "cq-tech-3"],
    outfitRewards: ["outfit-tinkerer-hoodie", "title-the-logician"],
    advancement: ladder([
      ["Logic Coder", "🔣", 1],
      ["Game Systems Designer", "🎮", 5],
      ["Software Specialist", "🖥️", 11],
      ["Future Game Designer", "🕹️", 19],
    ]),
    starter: false,
  },
  {
    id: "creator",
    name: "Creator",
    emoji: "🎨",
    tagline: "Imagines it, then shares it.",
    description:
      "Creators make art, music, design, and media. They mix imagination with craft to inspire people.",
    accent: "#f43f5e",
    gradient: "from-rose-500 via-pink-500 to-orange-500",
    focusSubjects: ["english", "filipino"],
    recommendedCareers: ["artist", "musician", "filmmaker", "ux-designer", "vr-ar"],
    skillTreeId: "creator",
    classQuestIds: ["cq-creator-1", "cq-creator-2", "cq-creator-3"],
    outfitRewards: ["outfit-creator-smock", "title-the-imaginative"],
    advancement: ladder([
      ["Idea Sketcher", "✏️", 1],
      ["Media Maker", "🎬", 5],
      ["Design Specialist", "🎨", 11],
      ["Future Creative Pro", "🌟", 19],
    ]),
    starter: false,
  },
  {
    id: "navigator",
    name: "Navigator",
    emoji: "⚓",
    tagline: "Reads maps, plans routes, leads voyages.",
    description:
      "Navigators master geography, math, and weather. They plan safe journeys across sea, land, and air.",
    accent: "#0ea5e9",
    gradient: "from-sky-500 via-cyan-500 to-blue-600",
    focusSubjects: ["araling-panlipunan", "math", "science"],
    recommendedCareers: ["seafarer", "pilot", "farmer-agri"],
    skillTreeId: "navigator",
    classQuestIds: ["cq-navigator-1", "cq-navigator-2", "cq-navigator-3"],
    outfitRewards: ["outfit-navigator-jacket", "title-the-pathfinder"],
    advancement: ladder([
      ["Route Planner", "🧭", 1],
      ["Maritime Cadet", "🚢", 5],
      ["Voyage Specialist", "🌊", 11],
      ["Future Seafarer", "⚓", 19],
    ]),
    starter: false,
  },
];

export function getClass(id: string | null | undefined): LearnerClass | undefined {
  if (!id) return undefined;
  const canonical = CLASS_ALIASES[id] ?? (id as ClassId);
  return LEARNER_CLASSES.find((c) => c.id === canonical);
}

export function starterClasses(): LearnerClass[] {
  return LEARNER_CLASSES.filter((c) => c.starter);
}

/** Which class advancement title applies at a given class level. */
export function classTitleForLevel(cls: LearnerClass, classLevel: number): ClassAdvancement {
  let current = cls.advancement[0];
  for (const a of cls.advancement) if (classLevel >= a.classLevel) current = a;
  return current;
}

export function nextClassTitle(cls: LearnerClass, classLevel: number): ClassAdvancement | null {
  return cls.advancement.find((a) => a.classLevel > classLevel) ?? null;
}
