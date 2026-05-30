/**
 * Guilds — the RPG layer over PathForge careers.
 *
 * Every career becomes a Guild a Forger can pledge into. Pledging
 * surfaces a clear set of subject XP requirements (already gated via
 * career.requiredSubjectXp) and a personalised next-quest path.
 *
 * Safe-by-design rules:
 *   - Guilds are FREE to join. No paid guilds, no random rolls.
 *   - Guild rewards are cosmetic (avatar trinkets) — never academic.
 *   - Only one active dream guild at a time, but a kid can leave/swap.
 */

import type { Career } from "./careers";

export interface GuildBadge {
  /** Stable id, used in profile.unlocked_badges. */
  id: string;
  /** Display label. */
  name: string;
  /** Single emoji used as the badge icon. */
  emoji: string;
  /** Award reason — drives the unlock animation copy. */
  earnedBy: string;
}

export interface Guild {
  careerId: string;
  /** Guild name in English. */
  name: string;
  /** Filipino name for the guild master's title. */
  masterTitle: string;
  /** Guild master quote — sets the vibe + frames why this work matters. */
  masterQuote: string;
  /** 2–3 sentence kid-voice description of the guild. */
  description: string;
  /** Five-stage guild rank ladder (Initiate → Apprentice → Adept → Veteran → Master). */
  ranks: { title: string; emoji: string; xpThreshold: number }[];
  /** Cosmetic rewards unlocked as the kid progresses inside the guild. */
  rewards: GuildBadge[];
}

/**
 * Realm-style guild metadata for our careers. We only define guilds for
 * the most aspirational PH-relevant paths first — others can be added
 * incrementally without breaking anything (UI degrades to the existing
 * career card view).
 */
export const GUILDS: Guild[] = [
  {
    careerId: "doctor",
    name: "Healer's Guild",
    masterTitle: "Dakilang Manggagamot",
    masterQuote:
      "We do not heal alone. Every Filipino who learns biology helps our country live longer.",
    description:
      "The Healer's Guild trains Forgers who want to study how the body works and how to make it well. Required skills: Science first, Math second.",
    ranks: [
      { title: "Aspirant Healer", emoji: "🩹", xpThreshold: 0 },
      { title: "Healer Apprentice", emoji: "💊", xpThreshold: 400 },
      { title: "Healer Adept", emoji: "🩺", xpThreshold: 900 },
      { title: "Field Medic", emoji: "🏥", xpThreshold: 1500 },
      { title: "Master Healer", emoji: "👨‍⚕️", xpThreshold: 2500 },
    ],
    rewards: [
      { id: "white-coat", name: "White Coat", emoji: "🥼", earnedBy: "Reach Healer Apprentice" },
      { id: "stethoscope", name: "Stethoscope", emoji: "🩺", earnedBy: "Reach Healer Adept" },
      { id: "medic-cross", name: "Medic Cross", emoji: "✝️", earnedBy: "Reach Master Healer" },
    ],
  },
  {
    careerId: "engineer",
    name: "Builder's Guild",
    masterTitle: "Punong Inhinyero",
    masterQuote:
      "Bridges, skyscrapers, machines — Filipinos built the Cebu-Cordova bridge. We build the future.",
    description:
      "The Builder's Guild forges Forgers who solve real-world problems with math and science. Strong Math is required to even step inside.",
    ranks: [
      { title: "Site Trainee", emoji: "🪜", xpThreshold: 0 },
      { title: "Junior Builder", emoji: "🔧", xpThreshold: 300 },
      { title: "Site Engineer", emoji: "🏗️", xpThreshold: 800 },
      { title: "Senior Engineer", emoji: "🏢", xpThreshold: 1500 },
      { title: "Master Builder", emoji: "🌉", xpThreshold: 2500 },
    ],
    rewards: [
      { id: "hard-hat", name: "Hard Hat", emoji: "⛑️", earnedBy: "Reach Junior Builder" },
      { id: "blueprint", name: "Blueprint Scroll", emoji: "📐", earnedBy: "Reach Site Engineer" },
      { id: "master-tools", name: "Master Toolkit", emoji: "🧰", earnedBy: "Reach Master Builder" },
    ],
  },
  {
    careerId: "teacher",
    name: "Guro Guild",
    masterTitle: "Gurong Punò",
    masterQuote:
      "Teachers shape the next generation. Every Forger who teaches lifts five more.",
    description:
      "The Guro Guild is for Forgers who want to pass what they've learned to others. English, Filipino, and patience required.",
    ranks: [
      { title: "Tutor Pupil", emoji: "📚", xpThreshold: 0 },
      { title: "Junior Guro", emoji: "✏️", xpThreshold: 200 },
      { title: "Class Guro", emoji: "👩‍🏫", xpThreshold: 600 },
      { title: "Senior Guro", emoji: "🎓", xpThreshold: 1200 },
      { title: "Master Guro", emoji: "🏆", xpThreshold: 2000 },
    ],
    rewards: [
      { id: "chalk", name: "Wise Chalk", emoji: "🖍️", earnedBy: "Reach Junior Guro" },
      { id: "lesson-plan", name: "Lesson Plan", emoji: "📋", earnedBy: "Reach Class Guro" },
      { id: "guro-medal", name: "Master Guro Medal", emoji: "🏅", earnedBy: "Reach Master Guro" },
    ],
  },
  {
    careerId: "seafarer",
    name: "Mariners' Guild",
    masterTitle: "Kapitan ng Dagat",
    masterQuote:
      "The seas are our home. One in four sailors on Earth is Filipino — and we are proud.",
    description:
      "The Mariners' Guild trains Forgers for the open ocean. Math for navigation, science for the engine room, English to talk with the world.",
    ranks: [
      { title: "Deck Cadet", emoji: "🧢", xpThreshold: 0 },
      { title: "Ordinary Seaman", emoji: "⚓", xpThreshold: 300 },
      { title: "Officer in Watch", emoji: "🧭", xpThreshold: 800 },
      { title: "Chief Mate", emoji: "🚢", xpThreshold: 1500 },
      { title: "Kapitan", emoji: "🎖️", xpThreshold: 2500 },
    ],
    rewards: [
      { id: "compass", name: "Brass Compass", emoji: "🧭", earnedBy: "Reach Ordinary Seaman" },
      { id: "navy-cap", name: "Officer Cap", emoji: "🧢", earnedBy: "Reach Officer in Watch" },
      { id: "kapitan-medal", name: "Kapitan's Medal", emoji: "🎖️", earnedBy: "Reach Kapitan" },
    ],
  },
  {
    careerId: "entrepreneur",
    name: "Negosyo Guild",
    masterTitle: "Negosyante Hari",
    masterQuote:
      "Henry Sy started with one shoe store. Tony Tan Caktiong started with one Jollibee. You start by trying.",
    description:
      "The Negosyo Guild is for Forgers who want to start things. Math for accounting, English for pitching, courage for the rest.",
    ranks: [
      { title: "Sari-Sari Trainee", emoji: "🛍️", xpThreshold: 0 },
      { title: "Junior Vendor", emoji: "📦", xpThreshold: 200 },
      { title: "Shop Owner", emoji: "🏪", xpThreshold: 700 },
      { title: "Business Builder", emoji: "📈", xpThreshold: 1500 },
      { title: "Negosyante", emoji: "💼", xpThreshold: 2500 },
    ],
    rewards: [
      { id: "first-peso", name: "First Peso Earned", emoji: "💵", earnedBy: "Reach Junior Vendor" },
      { id: "ledger", name: "Founder's Ledger", emoji: "📒", earnedBy: "Reach Shop Owner" },
      { id: "ceo-suit", name: "CEO Coat", emoji: "🤵", earnedBy: "Reach Negosyante" },
    ],
  },
  {
    careerId: "chef",
    name: "Kusinero Guild",
    masterTitle: "Punong Kusinero",
    masterQuote:
      "The kitchen tells the story of a people. Filipino food deserves the world.",
    description:
      "The Kusinero Guild is for Forgers who want to feed people. Science for chemistry, math for ratios, taste for everything else.",
    ranks: [
      { title: "Apprentice Cook", emoji: "🍳", xpThreshold: 0 },
      { title: "Line Cook", emoji: "🥘", xpThreshold: 200 },
      { title: "Sous Chef", emoji: "🥗", xpThreshold: 600 },
      { title: "Head Chef", emoji: "👨‍🍳", xpThreshold: 1200 },
      { title: "Master Chef", emoji: "🏆", xpThreshold: 2000 },
    ],
    rewards: [
      { id: "chef-knife", name: "Trusted Knife", emoji: "🔪", earnedBy: "Reach Line Cook" },
      { id: "toque", name: "Chef Toque", emoji: "🎩", earnedBy: "Reach Sous Chef" },
      { id: "michelin", name: "Adobo Crown", emoji: "👑", earnedBy: "Reach Master Chef" },
    ],
  },
  {
    careerId: "artist",
    name: "Artisan Guild",
    masterTitle: "Pintor na Bayani",
    masterQuote:
      "Juan Luna won Madrid in 1884. Filipino art has always shouted truth — louder than any colonizer.",
    description:
      "The Artisan Guild is for Forgers who see the world differently. English for stories, Filipino for soul, Araling Panlipunan for the history we paint.",
    ranks: [
      { title: "Sketch Pupil", emoji: "✏️", xpThreshold: 0 },
      { title: "Apprentice Painter", emoji: "🎨", xpThreshold: 200 },
      { title: "Studio Artist", emoji: "🖼️", xpThreshold: 600 },
      { title: "Gallery Master", emoji: "🏛️", xpThreshold: 1200 },
      { title: "Pintor Laureate", emoji: "🏅", xpThreshold: 2000 },
    ],
    rewards: [
      { id: "brush", name: "First Brush", emoji: "🖌️", earnedBy: "Reach Apprentice Painter" },
      { id: "easel", name: "Studio Easel", emoji: "🖼️", earnedBy: "Reach Studio Artist" },
      { id: "laurel", name: "Laurel Crown", emoji: "🌿", earnedBy: "Reach Pintor Laureate" },
    ],
  },
  {
    careerId: "pilot",
    name: "Aviator Guild",
    masterTitle: "Punong Piloto",
    masterQuote:
      "The sky is open to anyone who dares. Filipinos fly long-haul routes for the world's biggest airlines.",
    description:
      "The Aviator Guild trains Forgers to fly. Math for navigation, Science for weather, English for the global tower.",
    ranks: [
      { title: "Ground School", emoji: "🛫", xpThreshold: 0 },
      { title: "Student Pilot", emoji: "🛩️", xpThreshold: 400 },
      { title: "First Officer", emoji: "✈️", xpThreshold: 1000 },
      { title: "Captain", emoji: "🧑‍✈️", xpThreshold: 2000 },
      { title: "Senior Captain", emoji: "🎖️", xpThreshold: 3500 },
    ],
    rewards: [
      { id: "wings", name: "Cadet Wings", emoji: "🪽", earnedBy: "Reach Student Pilot" },
      { id: "pilot-license", name: "Pilot License", emoji: "🪪", earnedBy: "Reach First Officer" },
      { id: "captain-bars", name: "Captain's Bars", emoji: "🏅", earnedBy: "Reach Senior Captain" },
    ],
  },
  {
    careerId: "public-service-officer",
    name: "Lingkod-Bayan Guild",
    masterTitle: "Pinunong Lingkod",
    masterQuote:
      "Real service is quiet. Show up. Process the papers. Help the kuya at the LTO. That is the bayan.",
    description:
      "The Lingkod-Bayan Guild is for Forgers who want to serve through government. AP, English, and a steady heart required.",
    ranks: [
      { title: "Civic Volunteer", emoji: "🤝", xpThreshold: 0 },
      { title: "Barangay Aide", emoji: "🏘️", xpThreshold: 300 },
      { title: "LGU Officer", emoji: "🏢", xpThreshold: 800 },
      { title: "Department Lead", emoji: "📑", xpThreshold: 1500 },
      { title: "Senior Lingkod", emoji: "🏛️", xpThreshold: 2500 },
    ],
    rewards: [
      { id: "civic-id", name: "Civic ID", emoji: "🪪", earnedBy: "Reach Barangay Aide" },
      { id: "lgu-pin", name: "LGU Pin", emoji: "📌", earnedBy: "Reach LGU Officer" },
      { id: "service-sash", name: "Service Sash", emoji: "🎗️", earnedBy: "Reach Senior Lingkod" },
    ],
  },
  {
    careerId: "game-designer",
    name: "Game Forge Guild",
    masterTitle: "Pinuno ng Game Forge",
    masterQuote:
      "Mobile Legends has 100M+ players. Filipinos built parts of it. Your favorite game tomorrow could start with your code today.",
    description:
      "The Game Forge Guild is for Forgers who want to make games. Math for physics, English for the world, imagination for everything else.",
    ranks: [
      { title: "Player-Tester", emoji: "🕹️", xpThreshold: 0 },
      { title: "Game Trainee", emoji: "🎮", xpThreshold: 300 },
      { title: "Junior Designer", emoji: "🎲", xpThreshold: 800 },
      { title: "Studio Designer", emoji: "🧩", xpThreshold: 1500 },
      { title: "Lead Designer", emoji: "🏆", xpThreshold: 2500 },
    ],
    rewards: [
      { id: "controller", name: "Designer Controller", emoji: "🎮", earnedBy: "Reach Game Trainee" },
      { id: "level-tool", name: "Level Editor", emoji: "🛠️", earnedBy: "Reach Junior Designer" },
      { id: "goty", name: "Game-of-the-Year Trophy", emoji: "🏆", earnedBy: "Reach Lead Designer" },
    ],
  },
];

export function guildForCareer(careerId: string): Guild | undefined {
  return GUILDS.find((g) => g.careerId === careerId);
}

/** Current rank inside a guild based on the kid's career-relevant XP. */
export function currentRank(guild: Guild, xp: number): { idx: number; rank: Guild["ranks"][number] } {
  let idx = 0;
  for (let i = 0; i < guild.ranks.length; i++) {
    if (xp >= guild.ranks[i].xpThreshold) idx = i;
  }
  return { idx, rank: guild.ranks[idx] };
}

/** Which cosmetic rewards has the kid unlocked given their XP? */
export function unlockedRewards(guild: Guild, _xp: number): GuildBadge[] {
  // Rewards are tied to rank progression — currently 1 reward per
  // checkpoint rank. We grant rewards at rank index 1, 2, and last.
  const { idx } = currentRank(guild, _xp);
  const milestones = [1, 2, guild.ranks.length - 1];
  return guild.rewards.filter((_r, i) => milestones[i] !== undefined && idx >= milestones[i]);
}
