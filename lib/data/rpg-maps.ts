/**
 * rpg-maps.ts — PathForge world map. Original educational zones, each tied to
 * school subjects and to real careers. The five "subject realm" maps reuse the
 * existing realms.ts worldbuilding; the rest are career-themed zones.
 */

import type { SubjectId } from "@/lib/data/learner";
import type { Tier } from "@/lib/entitlements";
import type { ClassId } from "@/lib/data/rpg-classes";

export type MapId =
  | "number-kingdom"
  | "story-forest"
  | "bayani-isles"
  | "lab-reef"
  | "history-archipelago"
  | "builders-yard"
  | "health-harbor"
  | "merchant-market"
  | "creator-studio"
  | "navigator-docks"
  | "code-workshop";

export interface MapUnlock {
  /** Character level required to enter. */
  characterLevel: number;
  /** Other maps that must be started/cleared first. */
  requiresMaps: MapId[];
  /** Subscription tier gate. "free" maps are always available. */
  paidTier: Tier;
}

export interface BossChallenge {
  id: string; // matches a quest id of type "capstone"/boss in rpg-quests.ts
  name: string;
  emoji: string;
  blurb: string;
  /** Quest ids that must be completed before the boss unlocks. */
  prerequisiteQuestIds: string[];
  /** Rewards on clearing (reward ids from rpg-rewards.ts). */
  rewardIds: string[];
  /** Map unlocked next, if any. */
  unlocksMap?: MapId;
}

export interface WorldMap {
  id: MapId;
  name: string;
  emoji: string;
  /** Short kid-facing description. */
  description: string;
  /** Longer atmosphere/lore line. */
  lore: string;
  subjectFocus: SubjectId;
  /** Extra subjects touched in this zone. */
  secondarySubjects: SubjectId[];
  recommendedGrades: [number, number];
  /** Careers this map connects to (career ids). */
  careerLinks: string[];
  /** Classes that feel most at home here. */
  classAffinity: ClassId[];
  questIds: string[];
  unlock: MapUnlock;
  boss: BossChallenge;
  // visual theme metadata
  accent: string;
  gradient: string;
  tileStyle: "kingdom" | "forest" | "isles" | "reef" | "archipelago" | "yard" | "harbor" | "market" | "studio" | "docks" | "workshop";
}

export const WORLD_MAPS: WorldMap[] = [
  {
    id: "number-kingdom",
    name: "Number Kingdom",
    emoji: "🏰",
    description: "A realm built from patterns, logic, and numbers.",
    lore: "In the Kaharian ng Bilang, every gate opens to a kid who can spot the pattern.",
    subjectFocus: "math",
    secondarySubjects: [],
    recommendedGrades: [1, 10],
    careerLinks: ["engineer", "data-scientist", "scientist", "entrepreneur"],
    classAffinity: ["scholar", "builder", "merchant", "tech-tinkerer"],
    questIds: ["q-math-daily", "q-math-map-1", "q-math-map-2", "q-math-party"],
    unlock: { characterLevel: 1, requiresMaps: [], paidTier: "free" },
    boss: {
      id: "boss-number-kingdom",
      name: "Pattern Gate Challenge",
      emoji: "🔢",
      blurb: "Prove your number sense at the great gate.",
      prerequisiteQuestIds: ["q-math-map-1", "q-math-map-2"],
      rewardIds: ["badge-pattern-gate", "stamp-number-kingdom", "cert-math-mastery"],
      unlocksMap: "builders-yard",
    },
    accent: "#6366f1",
    gradient: "from-indigo-500 via-violet-500 to-blue-500",
    tileStyle: "kingdom",
  },
  {
    id: "story-forest",
    name: "Story Forest",
    emoji: "🌲",
    description: "A living forest where words grow into stories.",
    lore: "The Gubat ng Kwento whispers to those who read closely and write bravely.",
    subjectFocus: "english",
    secondarySubjects: ["filipino"],
    recommendedGrades: [1, 10],
    careerLinks: ["writer", "teacher", "lawyer", "filmmaker"],
    classAffinity: ["storyteller", "scholar", "creator"],
    questIds: ["q-eng-daily", "q-eng-map-1", "q-eng-map-2", "q-eng-class"],
    unlock: { characterLevel: 1, requiresMaps: [], paidTier: "free" },
    boss: {
      id: "boss-story-forest",
      name: "Reading Guardian Challenge",
      emoji: "📖",
      blurb: "Read deeply and answer the Guardian of the Grove.",
      prerequisiteQuestIds: ["q-eng-map-1", "q-eng-map-2"],
      rewardIds: ["badge-reading-guardian", "stamp-story-forest", "cert-english-mastery"],
      unlocksMap: "creator-studio",
    },
    accent: "#10b981",
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    tileStyle: "forest",
  },
  {
    id: "bayani-isles",
    name: "Bayani Isles",
    emoji: "🏝️",
    description: "Islands that honor heroes, language, and culture.",
    lore: "Sa Mga Pulo ng Bayani, bawat salita ay may kuwento ng tapang.",
    subjectFocus: "filipino",
    secondarySubjects: ["araling-panlipunan"],
    recommendedGrades: [1, 10],
    careerLinks: ["teacher", "writer", "public-service-officer"],
    classAffinity: ["storyteller", "guardian", "explorer"],
    questIds: ["q-fil-daily", "q-fil-map-1", "q-fil-map-2"],
    unlock: { characterLevel: 2, requiresMaps: [], paidTier: "free" },
    boss: {
      id: "boss-bayani-isles",
      name: "Salita Mastery Trial",
      emoji: "🗣️",
      blurb: "Patunayan ang galing sa wika at kultura.",
      prerequisiteQuestIds: ["q-fil-map-1", "q-fil-map-2"],
      rewardIds: ["badge-salita-master", "stamp-bayani-isles", "cert-filipino-mastery"],
    },
    accent: "#f59e0b",
    gradient: "from-amber-500 via-orange-500 to-red-500",
    tileStyle: "isles",
  },
  {
    id: "lab-reef",
    name: "Lab Reef",
    emoji: "🔬",
    description: "An underwater lab humming with experiments.",
    lore: "The Kanlungan-Lab rewards curiosity, observation, and careful testing.",
    subjectFocus: "science",
    secondarySubjects: ["math"],
    recommendedGrades: [1, 10],
    careerLinks: ["scientist", "doctor", "nurse", "vet", "ai-engineer"],
    classAffinity: ["scholar", "healer", "explorer", "tech-tinkerer"],
    questIds: ["q-sci-daily", "q-sci-map-1", "q-sci-map-2", "q-sci-career"],
    unlock: { characterLevel: 3, requiresMaps: [], paidTier: "free" },
    boss: {
      id: "boss-lab-reef",
      name: "Lab Trial",
      emoji: "🧪",
      blurb: "Run the experiment. Read the results. Pass the trial.",
      prerequisiteQuestIds: ["q-sci-map-1", "q-sci-map-2"],
      rewardIds: ["badge-lab-trial", "stamp-lab-reef", "cert-science-mastery"],
      unlocksMap: "health-harbor",
    },
    accent: "#06b6d4",
    gradient: "from-cyan-500 via-sky-500 to-blue-500",
    tileStyle: "reef",
  },
  {
    id: "history-archipelago",
    name: "History Archipelago",
    emoji: "🗺️",
    description: "Islands connected by stories of the past.",
    lore: "Sa Pulo-Pulo ng Kasaysayan, natututo tayo mula sa mga nauna sa atin.",
    subjectFocus: "araling-panlipunan",
    secondarySubjects: ["filipino"],
    recommendedGrades: [3, 10],
    careerLinks: ["public-service-officer", "lawyer", "teacher", "entrepreneur"],
    classAffinity: ["explorer", "guardian", "navigator"],
    questIds: ["q-ap-daily", "q-ap-map-1", "q-ap-map-2"],
    unlock: { characterLevel: 4, requiresMaps: [], paidTier: "free" },
    boss: {
      id: "boss-history-archipelago",
      name: "Community Wisdom Trial",
      emoji: "🏛️",
      blurb: "Show what history teaches about people and choices.",
      prerequisiteQuestIds: ["q-ap-map-1", "q-ap-map-2"],
      rewardIds: ["badge-community-wisdom", "stamp-history-archipelago", "cert-ap-mastery"],
      unlocksMap: "navigator-docks",
    },
    accent: "#a78bfa",
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    tileStyle: "archipelago",
  },
  {
    id: "builders-yard",
    name: "Builder's Yard",
    emoji: "🏗️",
    description: "A workshop yard for engineering and trades.",
    lore: "Where blueprints become bridges, and math becomes machines.",
    subjectFocus: "math",
    secondarySubjects: ["science"],
    recommendedGrades: [4, 10],
    careerLinks: ["engineer", "robotics", "electrician-trade", "cloud-architect"],
    classAffinity: ["builder", "tech-tinkerer"],
    questIds: ["q-build-career-1", "q-build-project"],
    unlock: { characterLevel: 8, requiresMaps: ["number-kingdom"], paidTier: "pro" },
    boss: {
      id: "boss-builders-yard",
      name: "Blueprint Mastery Check",
      emoji: "📐",
      blurb: "Design and defend a working plan.",
      prerequisiteQuestIds: ["q-build-career-1", "q-build-project"],
      rewardIds: ["badge-master-builder", "stamp-builders-yard", "emblem-engineers-guild"],
    },
    accent: "#f59e0b",
    gradient: "from-amber-500 via-yellow-500 to-orange-500",
    tileStyle: "yard",
  },
  {
    id: "health-harbor",
    name: "Health Harbor",
    emoji: "⚓",
    description: "A harbor town for medicine and care careers.",
    lore: "Here, science meets kindness — the work of healers.",
    subjectFocus: "science",
    secondarySubjects: ["english"],
    recommendedGrades: [4, 10],
    careerLinks: ["doctor", "nurse", "vet"],
    classAffinity: ["healer", "scholar"],
    questIds: ["q-health-career-1", "q-health-reflection"],
    unlock: { characterLevel: 9, requiresMaps: ["lab-reef"], paidTier: "pro" },
    boss: {
      id: "boss-health-harbor",
      name: "Caregiver's Trial",
      emoji: "🩺",
      blurb: "Make safe, caring decisions in a health scenario.",
      prerequisiteQuestIds: ["q-health-career-1", "q-health-reflection"],
      rewardIds: ["badge-caregiver", "stamp-health-harbor", "emblem-healers-guild"],
    },
    accent: "#10b981",
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    tileStyle: "harbor",
  },
  {
    id: "merchant-market",
    name: "Merchant Market",
    emoji: "🏪",
    description: "A bustling market for business and ideas.",
    lore: "Plan, trade, and grow — the marketplace of young founders.",
    subjectFocus: "math",
    secondarySubjects: ["english"],
    recommendedGrades: [4, 10],
    careerLinks: ["entrepreneur", "customer-service-bpo"],
    classAffinity: ["merchant", "scholar"],
    questIds: ["q-market-career-1", "q-market-project"],
    unlock: { characterLevel: 7, requiresMaps: ["number-kingdom"], paidTier: "pro" },
    boss: {
      id: "boss-merchant-market",
      name: "Founder's Pitch Check",
      emoji: "💡",
      blurb: "Plan a tiny business and pitch the idea.",
      prerequisiteQuestIds: ["q-market-career-1", "q-market-project"],
      rewardIds: ["badge-young-founder", "stamp-merchant-market", "emblem-founders-guild"],
    },
    accent: "#eab308",
    gradient: "from-yellow-500 via-amber-500 to-orange-500",
    tileStyle: "market",
  },
  {
    id: "creator-studio",
    name: "Creator Studio",
    emoji: "🎨",
    description: "A studio for arts, design, and media.",
    lore: "Imagination plus craft — where creators are made.",
    subjectFocus: "english",
    secondarySubjects: ["filipino"],
    recommendedGrades: [3, 10],
    careerLinks: ["artist", "musician", "filmmaker", "ux-designer", "vr-ar"],
    classAffinity: ["creator", "storyteller"],
    questIds: ["q-create-career-1", "q-create-project"],
    unlock: { characterLevel: 7, requiresMaps: ["story-forest"], paidTier: "pro" },
    boss: {
      id: "boss-creator-studio",
      name: "Showcase Mastery Check",
      emoji: "🌟",
      blurb: "Create and present an original piece.",
      prerequisiteQuestIds: ["q-create-career-1", "q-create-project"],
      rewardIds: ["badge-showcase", "stamp-creator-studio", "emblem-creators-guild"],
    },
    accent: "#f43f5e",
    gradient: "from-rose-500 via-pink-500 to-orange-500",
    tileStyle: "studio",
  },
  {
    id: "navigator-docks",
    name: "Navigator Docks",
    emoji: "🚢",
    description: "Docks for maritime, travel, and geography.",
    lore: "Read the map, plan the route, lead the voyage.",
    subjectFocus: "araling-panlipunan",
    secondarySubjects: ["math", "science"],
    recommendedGrades: [4, 10],
    careerLinks: ["seafarer", "pilot", "farmer-agri"],
    classAffinity: ["navigator", "explorer"],
    questIds: ["q-nav-career-1", "q-nav-project"],
    unlock: { characterLevel: 9, requiresMaps: ["history-archipelago"], paidTier: "pro" },
    boss: {
      id: "boss-navigator-docks",
      name: "Voyage Plan Trial",
      emoji: "🧭",
      blurb: "Chart a safe route and explain your plan.",
      prerequisiteQuestIds: ["q-nav-career-1", "q-nav-project"],
      rewardIds: ["badge-navigator", "stamp-navigator-docks", "emblem-navigators-guild"],
    },
    accent: "#0ea5e9",
    gradient: "from-sky-500 via-cyan-500 to-blue-600",
    tileStyle: "docks",
  },
  {
    id: "code-workshop",
    name: "Code Workshop",
    emoji: "🕹️",
    description: "A workshop for tech and game design.",
    lore: "Logic puzzles, code blocks, and games that teach themselves.",
    subjectFocus: "math",
    secondarySubjects: ["science"],
    recommendedGrades: [4, 10],
    careerLinks: ["software-engineer", "game-designer", "game-developer", "ai-engineer", "cybersecurity"],
    classAffinity: ["tech-tinkerer", "builder"],
    questIds: ["q-code-career-1", "q-code-project"],
    unlock: { characterLevel: 10, requiresMaps: ["number-kingdom", "lab-reef"], paidTier: "pro" },
    boss: {
      id: "boss-code-workshop",
      name: "Logic Systems Check",
      emoji: "🤖",
      blurb: "Solve a logic build and trace your steps.",
      prerequisiteQuestIds: ["q-code-career-1", "q-code-project"],
      rewardIds: ["badge-logic-systems", "stamp-code-workshop", "emblem-tech-guild"],
    },
    accent: "#8b5cf6",
    gradient: "from-violet-500 via-purple-500 to-indigo-600",
    tileStyle: "workshop",
  },
];

export function getMap(id: string | null | undefined): WorldMap | undefined {
  return WORLD_MAPS.find((m) => m.id === id);
}

export function mapForSubject(subject: SubjectId): WorldMap | undefined {
  // returns the primary subject-realm map
  const realmMap: Record<SubjectId, MapId> = {
    math: "number-kingdom",
    english: "story-forest",
    filipino: "bayani-isles",
    science: "lab-reef",
    "araling-panlipunan": "history-archipelago",
  };
  return getMap(realmMap[subject]);
}

export interface MapStatus {
  unlocked: boolean;
  reasons: string[];
}

/** Pure unlock check given a learner's level, tier, and started/cleared maps. */
export function mapUnlockStatus(
  map: WorldMap,
  opts: { characterLevel: number; tier: Tier; startedMaps: MapId[] }
): MapStatus {
  const reasons: string[] = [];
  if (opts.characterLevel < map.unlock.characterLevel) {
    reasons.push(`Reach character level ${map.unlock.characterLevel}`);
  }
  for (const req of map.unlock.requiresMaps) {
    if (!opts.startedMaps.includes(req)) {
      reasons.push(`Explore ${getMap(req)?.name ?? req} first`);
    }
  }
  if (map.unlock.paidTier !== "free") {
    const rank: Record<Tier, number> = { free: 0, pro: 1, family: 1 };
    if (rank[opts.tier] < rank[map.unlock.paidTier]) {
      reasons.push(`Unlocks with ${map.unlock.paidTier === "pro" ? "Pro" : "Family"}`);
    }
  }
  return { unlocked: reasons.length === 0, reasons };
}
