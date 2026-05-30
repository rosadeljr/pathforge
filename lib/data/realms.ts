/**
 * Knowledge Realms — the RPG layer over PathForge subjects.
 *
 * Each PH K-10 subject is themed as an explorable realm. Realms exist
 * purely as narrative scaffolding — they sit on top of the existing
 * Lesson/Subject data without changing any educational mechanics.
 *
 * Design constraints:
 *   - No advantage from cosmetic choices.
 *   - No "buy a realm" mechanics — every realm is free.
 *   - Names + lore must respect Filipino culture (Bayani Isles uses
 *     real PH heroes, History Archipelago is an actual island chain).
 */

import type { SubjectId } from "./learner";

/** A sub-area inside a realm. Roughly maps to a grade band. */
export interface RealmRegion {
  /** Slug id (stable across UI changes). */
  id: string;
  /** Display name, e.g. "Plains of Addition". */
  name: string;
  /** Grade band covered. */
  gradeRange: [number, number];
  /** Kid-voice flavor for the region card. */
  blurb: string;
  /** Emoji that fronts the region in lists. */
  emoji: string;
}

export interface Realm {
  /** Subject this realm wraps. */
  subjectId: SubjectId;
  /** Realm name in English. */
  name: string;
  /** Filipino name when natural. */
  filipinoName?: string;
  /** One-line vibe. */
  tagline: string;
  /** The realm's master / final boss persona. */
  guardian: string;
  /** Short kid-voice lore (1–2 sentences). */
  lore: string;
  /** Theme emoji used across UI. */
  emoji: string;
  /** Tailwind gradient (matches subject palette). */
  gradient: string;
  /** Hex accent for glows / borders. */
  accentColor: string;
  /** Atmosphere keyword — useful for art direction later. */
  atmosphere: string;
  /** Sub-regions inside the realm. */
  regions: RealmRegion[];
}

export const REALMS: Realm[] = [
  {
    subjectId: "math",
    name: "Number Kingdom",
    filipinoName: "Kaharian ng Bilang",
    tagline: "Where every number has a story.",
    guardian: "King Counter",
    lore: "A kingdom of castles built from arithmetic. Add the bricks, multiply the towers, divide the gold. The Royal Calculus Library lies somewhere deep within.",
    emoji: "🏰",
    gradient: "from-sky-400 to-blue-600",
    accentColor: "#0ea5e9",
    atmosphere: "royal · sunlit stone · clear sky",
    regions: [
      {
        id: "counting-village",
        name: "Counting Village",
        gradeRange: [1, 2],
        blurb: "Where every Forger begins. Count the chickens, the mangoes, the stars.",
        emoji: "🐔",
      },
      {
        id: "plains-of-addition",
        name: "Plains of Addition",
        gradeRange: [2, 4],
        blurb: "Wide grassy fields where numbers gather to combine into bigger ones.",
        emoji: "➕",
      },
      {
        id: "tower-of-multiplication",
        name: "Tower of Multiplication",
        gradeRange: [3, 5],
        blurb: "A spiraling tower where each floor stacks more times than the last.",
        emoji: "✖️",
      },
      {
        id: "fortress-of-fractions",
        name: "Fortress of Fractions",
        gradeRange: [4, 6],
        blurb: "Brick by brick, the fortress walls divide and conquer.",
        emoji: "🍕",
      },
      {
        id: "royal-algebra-library",
        name: "Royal Algebra Library",
        gradeRange: [7, 10],
        blurb: "Hidden scrolls of variables. Solve for x to enter the inner sanctum.",
        emoji: "📜",
      },
    ],
  },
  {
    subjectId: "english",
    name: "Story Forest",
    filipinoName: "Gubat ng Kwento",
    tagline: "Every tree holds a tale.",
    guardian: "The Lorekeeper",
    lore: "An enchanted forest where the trees whisper poems and the rivers carry sentences downstream. Beware the Grammar Goblins — they eat lazy punctuation.",
    emoji: "🌳",
    gradient: "from-violet-400 to-purple-600",
    accentColor: "#a855f7",
    atmosphere: "twilight forest · golden hour · drifting fireflies",
    regions: [
      {
        id: "library-glade",
        name: "Library Glade",
        gradeRange: [1, 3],
        blurb: "A sun-dappled clearing where you learn your first sight words.",
        emoji: "📖",
      },
      {
        id: "grammar-grove",
        name: "Grammar Grove",
        gradeRange: [3, 6],
        blurb: "Trees grow according to rules. Get the grammar right or the path stays hidden.",
        emoji: "✒️",
      },
      {
        id: "vocab-vale",
        name: "Vocab Vale",
        gradeRange: [4, 8],
        blurb: "A valley where new words bloom every day. Pick the ones you want.",
        emoji: "💐",
      },
      {
        id: "essay-canyon",
        name: "Essay Canyon",
        gradeRange: [7, 10],
        blurb: "Wide open cliffs where Forgers shout their best arguments into the wind.",
        emoji: "🏔️",
      },
    ],
  },
  {
    subjectId: "filipino",
    name: "Bayani Isles",
    filipinoName: "Mga Pulo ng Bayani",
    tagline: "Honor the heroes. Speak their tongue.",
    guardian: "Lapu-Lapu the Eternal",
    lore: "An archipelago where every island guards a story from our bayani. Learn the language, earn the right to walk these shores.",
    emoji: "🏝️",
    gradient: "from-amber-400 to-orange-600",
    accentColor: "#f59e0b",
    atmosphere: "tropical · warm sea · bamboo · sunset",
    regions: [
      {
        id: "abakada-shore",
        name: "Abakada Shore",
        gradeRange: [1, 2],
        blurb: "The first beach. Letters wash up with every wave.",
        emoji: "🐚",
      },
      {
        id: "panitikan-cliffs",
        name: "Panitikan Cliffs",
        gradeRange: [3, 6],
        blurb: "High cliffs carved with old poems. Pay attention or you'll miss the meaning.",
        emoji: "📿",
      },
      {
        id: "rizal-strait",
        name: "Rizal Strait",
        gradeRange: [6, 8],
        blurb: "Cross the strait reading Noli Me Tangere. The wind only blows for the brave.",
        emoji: "⛵",
      },
      {
        id: "bonifacio-bay",
        name: "Bonifacio Bay",
        gradeRange: [8, 10],
        blurb: "The deep bay echoes with the cry of the Katipunan. Speak Filipino with pride.",
        emoji: "🇵🇭",
      },
    ],
  },
  {
    subjectId: "science",
    name: "Lab Reef",
    filipinoName: "Kanlungan-Lab",
    tagline: "Discover everything. Break nothing.",
    guardian: "Dr. Salt",
    lore: "An underwater research dome built into a glowing coral reef. Plants, planets, particles — every secret of the universe is being studied here.",
    emoji: "🪸",
    gradient: "from-emerald-400 to-teal-600",
    accentColor: "#10b981",
    atmosphere: "underwater · bioluminescent · curious",
    regions: [
      {
        id: "tide-pool-basics",
        name: "Tidepool Basics",
        gradeRange: [1, 3],
        blurb: "The shallow end. Living vs non-living. What grows and what doesn't.",
        emoji: "🐚",
      },
      {
        id: "weather-current",
        name: "Weather Current",
        gradeRange: [4, 6],
        blurb: "A swirling current of clouds, rain, and the whole water cycle.",
        emoji: "🌦️",
      },
      {
        id: "biology-grove",
        name: "Biology Grove",
        gradeRange: [5, 8],
        blurb: "Photosynthesis, cells, ecosystems — the green machinery of life.",
        emoji: "🌿",
      },
      {
        id: "reactor-reef",
        name: "Reactor Reef",
        gradeRange: [8, 10],
        blurb: "The deep core where physics and chemistry power everything.",
        emoji: "⚛️",
      },
    ],
  },
  {
    subjectId: "araling-panlipunan",
    name: "History Archipelago",
    filipinoName: "Pulo-Pulo ng Kasaysayan",
    tagline: "Every island, a chapter.",
    guardian: "Chronicler Rizal",
    lore: "Hop from island to island, each one frozen at a different moment in PH history. Pre-colonial barangays. Spanish galleons. Today's bustling Manila.",
    emoji: "🗺️",
    gradient: "from-rose-400 to-pink-600",
    accentColor: "#f43f5e",
    atmosphere: "weathered map · seafarer compass · island wind",
    regions: [
      {
        id: "barangay-coast",
        name: "Barangay Coast",
        gradeRange: [1, 3],
        blurb: "Pre-colonial PH. Learn what our country was before strangers came.",
        emoji: "🛶",
      },
      {
        id: "heroes-archipelago",
        name: "Heroes Archipelago",
        gradeRange: [4, 6],
        blurb: "Islands named after our bayani. Walk where they walked.",
        emoji: "🗿",
      },
      {
        id: "asean-passage",
        name: "ASEAN Passage",
        gradeRange: [6, 8],
        blurb: "Sail outside PH waters. Meet our neighbors in Southeast Asia.",
        emoji: "🌏",
      },
      {
        id: "civic-citadel",
        name: "Civic Citadel",
        gradeRange: [8, 10],
        blurb: "Government, economy, civic duty. The home port of every citizen.",
        emoji: "🏛️",
      },
    ],
  },
];

/** Lookup a realm by its subject. */
export function realmForSubject(subjectId: SubjectId): Realm | undefined {
  return REALMS.find((r) => r.subjectId === subjectId);
}

/** Find the region that contains the learner's current grade. */
export function regionForGrade(
  realm: Realm,
  grade: number | null | undefined
): RealmRegion | undefined {
  if (!grade) return realm.regions[0];
  return (
    realm.regions.find(
      (r) => grade >= r.gradeRange[0] && grade <= r.gradeRange[1]
    ) ?? realm.regions[0]
  );
}
