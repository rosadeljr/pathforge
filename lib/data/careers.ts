/**
 * Career exploration — kid-friendly career data for ages 6–18.
 *
 * Each career is a "card" kids can discover, unlock, and pick as their
 * dream goal. Careers tie into specific subjects: doing more Math
 * lessons levels up "Engineer" / "Architect", more Science levels up
 * "Doctor" / "Scientist", etc.
 *
 * This is the gamification of career exploration — not the gamification
 * of building an actual career (that's the adult version we deleted).
 */

import type { SubjectId } from "./learner";

export type CareerCategory =
  | "STEM"
  | "Health"
  | "Arts"
  | "Sports"
  | "Business"
  | "Service"
  | "Creative";

export type CareerRarity = "common" | "uncommon" | "rare" | "legendary";

/**
 * A single stage in a career adventure. Kids progress through these by
 * earning XP — each stage is a checkpoint with its own theme and emoji.
 */
export interface CareerStage {
  title: string;
  emoji: string;
  xpRequired: number; // total XP needed to reach this stage
  whatYouLearn: string;
}

export interface Career {
  id: string;
  title: string;
  filipinoTitle?: string;
  emoji: string;
  category: CareerCategory;
  rarity: CareerRarity;

  // Kid-friendly framing
  oneLiner: string;
  whatTheyDo: string[];
  funFact: string;

  // Visual identity
  gradient: string;
  accentColor: string;

  // Subjects that help you become this
  helpfulSubjects: SubjectId[];

  // How many XP earned in helpful subjects unlocks this career card.
  // Set to 0 to unlock immediately.
  xpToUnlock: number;

  // Teen-tier extra info (Grade 8+)
  pathToBecome: string;
  collegeTrack: string;
  phContext?: string;

  // The "adventure" — 4–5 ordered stages from beginner to fully unlocked.
  // Auto-generated if missing (see generateStages below).
  stages?: CareerStage[];
}

/**
 * Auto-generate a 5-stage adventure from a career's xpToUnlock if the
 * career didn't define explicit stages. Stages span from "Day 1 cadet"
 * to "Full [Career]!" with intermediate checkpoints.
 */
export function getStages(c: Career): CareerStage[] {
  if (c.stages?.length) return c.stages;
  const cap = Math.max(c.xpToUnlock, 1500);
  return [
    {
      title: `${c.title} Cadet`,
      emoji: "🌱",
      xpRequired: 0,
      whatYouLearn: `Learn what a ${c.title.toLowerCase()} actually does day-to-day.`,
    },
    {
      title: `${c.title} Apprentice`,
      emoji: "📚",
      xpRequired: Math.round(cap * 0.25),
      whatYouLearn: "Build the foundation skills from your subjects.",
    },
    {
      title: `${c.title} Trainee`,
      emoji: "⚡",
      xpRequired: Math.round(cap * 0.5),
      whatYouLearn: "Practice harder problems and connect the dots.",
    },
    {
      title: `Junior ${c.title}`,
      emoji: "🎖️",
      xpRequired: Math.round(cap * 0.8),
      whatYouLearn: "Apply what you know to real-world challenges.",
    },
    {
      title: `Full ${c.title}! 🌟`,
      emoji: "🏆",
      xpRequired: cap,
      whatYouLearn: "You've mastered the journey. Time to keep growing.",
    },
  ];
}

/** Which stage is the learner currently on (0-indexed). */
export function currentStageIndex(c: Career, xp: number): number {
  const stages = getStages(c);
  let idx = 0;
  for (let i = 0; i < stages.length; i++) {
    if (xp >= stages[i].xpRequired) idx = i;
  }
  return idx;
}

const RARITY_META: Record<CareerRarity, { label: string; color: string; glow: string }> = {
  common: { label: "Common", color: "#94a3b8", glow: "rgba(148,163,184,0.4)" },
  uncommon: { label: "Uncommon", color: "#10b981", glow: "rgba(16,185,129,0.5)" },
  rare: { label: "Rare", color: "#3b82f6", glow: "rgba(59,130,246,0.5)" },
  legendary: { label: "Legendary", color: "#f59e0b", glow: "rgba(245,158,11,0.6)" },
};

export function rarityMeta(r: CareerRarity) {
  return RARITY_META[r];
}

export const CAREERS: Career[] = [
  // ============ STEM ============
  {
    id: "engineer",
    title: "Engineer",
    filipinoTitle: "Inhinyero",
    emoji: "🏗️",
    category: "STEM",
    rarity: "uncommon",
    oneLiner: "Builds bridges, buildings, machines, and roads.",
    whatTheyDo: [
      "Design structures and machines using math",
      "Solve real-world problems with science",
      "Work with teams to bring big ideas to life",
      "Check that buildings are safe and strong",
    ],
    funFact: "The Cebu-Cordova Link Bridge took 5 years and hundreds of engineers to build!",
    gradient: "from-amber-400 to-orange-600",
    accentColor: "#f59e0b",
    helpfulSubjects: ["math", "science"],
    xpToUnlock: 300,
    pathToBecome: "Strong in Math + Science → Engineering degree (5 years) → Board exam → Engineer.",
    collegeTrack: "STEM",
    phContext: "Top PH employers: Aboitiz, Ayala, Meralco, San Miguel.",
  },
  {
    id: "doctor",
    title: "Doctor",
    filipinoTitle: "Doktor",
    emoji: "🩺",
    category: "Health",
    rarity: "legendary",
    oneLiner: "Heals people and saves lives.",
    whatTheyDo: [
      "Diagnose what's wrong when someone is sick",
      "Prescribe medicine and treatment",
      "Perform surgeries to fix bodies",
      "Teach people how to stay healthy",
    ],
    funFact: "Becoming a doctor in the PH takes about 11–13 years after high school!",
    gradient: "from-rose-400 to-pink-600",
    accentColor: "#f43f5e",
    helpfulSubjects: ["science", "math"],
    xpToUnlock: 1500,
    pathToBecome:
      "Pre-med (4 yrs) → Medical school (4 yrs) → Internship → Board exam → Residency.",
    collegeTrack: "STEM",
    phContext: "Top schools: UP, UST, Ateneo, PLM. Specialties include surgery, pediatrics, OB-GYN.",
  },
  {
    id: "scientist",
    title: "Scientist",
    filipinoTitle: "Siyentista",
    emoji: "🔬",
    category: "STEM",
    rarity: "rare",
    oneLiner: "Discovers how the world works.",
    whatTheyDo: [
      "Ask big questions about nature and the universe",
      "Run experiments to test ideas",
      "Read, write, and share discoveries",
      "Solve problems like climate change or disease",
    ],
    funFact: "Filipino scientist Dr. Fe del Mundo invented an incubator for babies in remote villages!",
    gradient: "from-emerald-400 to-teal-600",
    accentColor: "#10b981",
    helpfulSubjects: ["science", "math"],
    xpToUnlock: 800,
    pathToBecome: "Science degree (4 yrs) → Masters → PhD → Research lab or university.",
    collegeTrack: "STEM",
    phContext: "Top research hubs: UP Diliman, DOST, IRRI (rice research).",
  },
  {
    id: "software-engineer",
    title: "Software Engineer",
    filipinoTitle: "Programmer",
    emoji: "💻",
    category: "STEM",
    rarity: "rare",
    oneLiner: "Codes the apps and websites we use every day.",
    whatTheyDo: [
      "Write code that becomes apps, games, and websites",
      "Solve puzzles and bugs",
      "Work with designers and other engineers",
      "Build things millions of people use",
    ],
    funFact: "Facebook started as a college coding project — now over 3 billion people use it.",
    gradient: "from-sky-400 to-blue-600",
    accentColor: "#0ea5e9",
    helpfulSubjects: ["math", "english"],
    xpToUnlock: 500,
    pathToBecome: "Comp Sci or IT degree (4 yrs) → Internship → Junior dev → Senior dev → Lead.",
    collegeTrack: "STEM",
    phContext: "Top PH tech companies: Kumu, Mynt (GCash), PayMongo, Sprout, Coins.ph.",
  },
  {
    id: "astronaut",
    title: "Astronaut",
    emoji: "🚀",
    category: "STEM",
    rarity: "legendary",
    oneLiner: "Travels to outer space.",
    whatTheyDo: [
      "Train for years to handle zero gravity",
      "Live on the International Space Station",
      "Do experiments in space",
      "Walk in space wearing huge suits",
    ],
    funFact: "An astronaut grows about 2 inches taller in space because gravity isn't squishing them!",
    gradient: "from-indigo-400 to-purple-600",
    accentColor: "#6366f1",
    helpfulSubjects: ["science", "math"],
    xpToUnlock: 3000,
    pathToBecome: "STEM degree → military pilot OR PhD scientist → astronaut training program.",
    collegeTrack: "STEM",
    phContext: "PH has the Philippine Space Agency (PhilSA) since 2019 — building Filipino space talent.",
  },

  // ============ HEALTH ============
  {
    id: "nurse",
    title: "Nurse",
    filipinoTitle: "Nars",
    emoji: "💉",
    category: "Health",
    rarity: "uncommon",
    oneLiner: "Cares for sick people and helps them get better.",
    whatTheyDo: [
      "Check patients' health every day",
      "Give medicine and treatment",
      "Help doctors during surgery",
      "Comfort and encourage patients",
    ],
    funFact: "Filipino nurses work in hospitals all over the world — we're known for caring hearts.",
    gradient: "from-pink-400 to-rose-500",
    accentColor: "#ec4899",
    helpfulSubjects: ["science", "english"],
    xpToUnlock: 400,
    pathToBecome: "Nursing degree (4 yrs) → Board exam → License → Hospital work.",
    collegeTrack: "STEM",
    phContext: "Top schools: UP, UST, Adventist, Velez College.",
  },
  {
    id: "vet",
    title: "Veterinarian",
    filipinoTitle: "Beterinaryo",
    emoji: "🐶",
    category: "Health",
    rarity: "rare",
    oneLiner: "A doctor for animals.",
    whatTheyDo: [
      "Take care of pets like dogs and cats",
      "Help farm animals stay healthy",
      "Do surgeries on animals",
      "Sometimes work with wild animals in zoos",
    ],
    funFact: "A dog's nose print is as unique as a human fingerprint — no two are the same!",
    gradient: "from-amber-400 to-yellow-500",
    accentColor: "#f59e0b",
    helpfulSubjects: ["science"],
    xpToUnlock: 700,
    pathToBecome: "Vet Med degree (6 yrs) → Board exam → Animal clinic or farm work.",
    collegeTrack: "STEM",
    phContext: "Top vet schools: UP Los Baños, DLSU-D, Central Mindanao University.",
  },

  // ============ EDUCATION & SERVICE ============
  {
    id: "teacher",
    title: "Teacher",
    filipinoTitle: "Guro",
    emoji: "👩‍🏫",
    category: "Service",
    rarity: "common",
    oneLiner: "Helps kids learn and grow.",
    whatTheyDo: [
      "Plan fun and clear lessons",
      "Teach reading, math, science, or any subject",
      "Cheer kids on when they're stuck",
      "Help shape the next generation",
    ],
    funFact: "Teachers in the Philippines are called 'second parents' — they really do help raise you!",
    gradient: "from-violet-400 to-purple-500",
    accentColor: "#a855f7",
    helpfulSubjects: ["english", "filipino"],
    xpToUnlock: 0,
    pathToBecome: "Education degree (4 yrs) → Licensure Exam for Teachers (LET) → School.",
    collegeTrack: "HUMSS",
    phContext: "K-12 teachers, college professors, or tutors — many paths to teach.",
  },
  {
    id: "lawyer",
    title: "Lawyer",
    filipinoTitle: "Abogado",
    emoji: "⚖️",
    category: "Service",
    rarity: "rare",
    oneLiner: "Defends people and fights for justice.",
    whatTheyDo: [
      "Read laws and figure out what they mean",
      "Argue in court for clients",
      "Write contracts and legal papers",
      "Stand up for people who can't defend themselves",
    ],
    funFact: "The Philippine Constitution has been rewritten 6 times — lawyers helped craft each one.",
    gradient: "from-slate-400 to-slate-600",
    accentColor: "#64748b",
    helpfulSubjects: ["english", "araling-panlipunan"],
    xpToUnlock: 1200,
    pathToBecome: "Pre-law degree → Law school (4 yrs) → Bar exam → Practice law.",
    collegeTrack: "HUMSS",
    phContext: "Top law schools: UP, Ateneo, San Beda, UST.",
  },
  {
    id: "soldier",
    title: "Soldier",
    filipinoTitle: "Sundalo",
    emoji: "🪖",
    category: "Service",
    rarity: "uncommon",
    oneLiner: "Protects the country and its people.",
    whatTheyDo: [
      "Train hard to stay strong and ready",
      "Defend the Philippines from threats",
      "Help during disasters and rescues",
      "Serve with honor",
    ],
    funFact: "The Philippine Military Academy (PMA) is one of the toughest schools in the country — only ~300 cadets get in per year.",
    gradient: "from-emerald-500 to-green-700",
    accentColor: "#10b981",
    helpfulSubjects: ["araling-panlipunan", "science"],
    xpToUnlock: 600,
    pathToBecome: "Pass PMA entrance OR enlist with high school diploma → military training.",
    collegeTrack: "GAS",
    phContext: "Armed Forces of the Philippines (AFP): Army, Navy, Air Force, Marines.",
  },
  {
    id: "firefighter",
    title: "Firefighter",
    filipinoTitle: "Bumbero",
    emoji: "🚒",
    category: "Service",
    rarity: "uncommon",
    oneLiner: "Rushes into danger to save lives.",
    whatTheyDo: [
      "Put out fires in homes and buildings",
      "Rescue people trapped in danger",
      "Teach people about fire safety",
      "Help during typhoons and earthquakes",
    ],
    funFact: "Firefighters in the PH wear ~25kg of gear into burning buildings — almost like carrying a kid!",
    gradient: "from-rose-500 to-red-600",
    accentColor: "#ef4444",
    helpfulSubjects: ["science", "araling-panlipunan"],
    xpToUnlock: 500,
    pathToBecome: "High school diploma → BFP entrance → Fire academy training.",
    collegeTrack: "GAS",
    phContext: "Bureau of Fire Protection (BFP) — over 22,000 firefighters nationwide.",
  },

  // ============ ARTS & CREATIVE ============
  {
    id: "artist",
    title: "Artist",
    filipinoTitle: "Pintor",
    emoji: "🎨",
    category: "Arts",
    rarity: "uncommon",
    oneLiner: "Creates beautiful things with their hands.",
    whatTheyDo: [
      "Paint, draw, sculpt, or design",
      "Show their feelings through art",
      "Sell paintings, illustrate books, design products",
      "Inspire others with their imagination",
    ],
    funFact: "Filipino painter Juan Luna won a top prize in Spain in 1884 — his painting was huge: 4 by 7 meters!",
    gradient: "from-pink-400 to-purple-600",
    accentColor: "#ec4899",
    helpfulSubjects: ["english", "araling-panlipunan"],
    xpToUnlock: 200,
    pathToBecome: "Practice daily → Art school (optional, 4 yrs) → Build portfolio → Gallery / freelance.",
    collegeTrack: "HUMSS or TVL",
    phContext: "Many top PH artists are self-taught — talent + practice matter more than degrees.",
  },
  {
    id: "writer",
    title: "Writer",
    filipinoTitle: "Manunulat",
    emoji: "✍️",
    category: "Arts",
    rarity: "uncommon",
    oneLiner: "Tells stories that move people.",
    whatTheyDo: [
      "Write novels, articles, or scripts",
      "Imagine new worlds and characters",
      "Edit and rewrite until it's just right",
      "Share their voice with readers everywhere",
    ],
    funFact: "Jose Rizal wrote two novels that helped spark the Philippine Revolution — words can change history.",
    gradient: "from-indigo-400 to-violet-500",
    accentColor: "#6366f1",
    helpfulSubjects: ["english", "filipino"],
    xpToUnlock: 300,
    pathToBecome: "Read a lot + write daily. Lit/Journalism degree helps but isn't required.",
    collegeTrack: "HUMSS",
    phContext: "Top PH writers today: Lualhati Bautista, Gémino Abad, F. Sionil José.",
  },
  {
    id: "musician",
    title: "Musician",
    filipinoTitle: "Musikero",
    emoji: "🎸",
    category: "Arts",
    rarity: "rare",
    oneLiner: "Makes music that moves crowds.",
    whatTheyDo: [
      "Play instruments and sing",
      "Write original songs",
      "Perform on stage or in studios",
      "Collaborate with other musicians",
    ],
    funFact: "Lea Salonga's voice was the singing voice of Disney's Mulan and Princess Jasmine!",
    gradient: "from-amber-400 to-pink-500",
    accentColor: "#f59e0b",
    helpfulSubjects: ["english", "filipino"],
    xpToUnlock: 600,
    pathToBecome: "Practice daily + perform live. Music school helps but talent + grit beat everything.",
    collegeTrack: "HUMSS or self-taught",
    phContext: "PH music scene: OPM, indie, rap (Shanti Dope, SB19), classical (UP/UST Conservatories).",
  },
  {
    id: "filmmaker",
    title: "Filmmaker",
    filipinoTitle: "Direktor",
    emoji: "🎬",
    category: "Creative",
    rarity: "rare",
    oneLiner: "Tells stories with cameras and editing.",
    whatTheyDo: [
      "Write scripts or storyboards",
      "Direct actors and the camera crew",
      "Edit footage into the final movie",
      "Make audiences laugh, cry, and think",
    ],
    funFact: "Lav Diaz makes Filipino films that can be 8+ hours long — and they win at Cannes!",
    gradient: "from-rose-400 to-amber-500",
    accentColor: "#f43f5e",
    helpfulSubjects: ["english", "araling-panlipunan"],
    xpToUnlock: 900,
    pathToBecome: "Film school (4 yrs) OR make your own short films + build portfolio.",
    collegeTrack: "HUMSS or TVL",
    phContext: "Top film schools: UP, DLSU, Mowelfund. Industry hubs in Quezon City.",
  },
  {
    id: "game-designer",
    title: "Game Designer",
    emoji: "🎮",
    category: "Creative",
    rarity: "rare",
    oneLiner: "Designs the games kids love to play.",
    whatTheyDo: [
      "Imagine fun game ideas and worlds",
      "Design characters, levels, and rules",
      "Test the game and fix what's not fun",
      "Work with artists, coders, and writers",
    ],
    funFact: "The PH has its own game studios — like Synergy88 and Indigo Entertainment — making games for the world!",
    gradient: "from-fuchsia-400 to-violet-600",
    accentColor: "#a855f7",
    helpfulSubjects: ["math", "english"],
    xpToUnlock: 800,
    pathToBecome: "Game Dev / CompSci degree (4 yrs) OR self-taught via game jams.",
    collegeTrack: "STEM",
    phContext: "Game studios in PH: Synergy88, Altitude Games, Boomzap, Kooapps.",
  },

  // ============ SPORTS ============
  {
    id: "athlete",
    title: "Athlete",
    filipinoTitle: "Atleta",
    emoji: "🏆",
    category: "Sports",
    rarity: "rare",
    oneLiner: "Competes at the highest level in their sport.",
    whatTheyDo: [
      "Train every single day",
      "Eat healthy and sleep well",
      "Compete in tournaments and the Olympics",
      "Inspire kids to chase their dreams",
    ],
    funFact: "Filipino weightlifter Hidilyn Diaz won the country's first-ever Olympic gold medal in 2020!",
    gradient: "from-emerald-400 to-teal-500",
    accentColor: "#10b981",
    helpfulSubjects: ["science"],
    xpToUnlock: 700,
    pathToBecome: "Train early + join clubs → Compete in tournaments → Scholarships or pro teams.",
    collegeTrack: "Sports / GAS",
    phContext: "PH success: Manny Pacquiao (boxing), EJ Obiena (pole vault), Carlos Yulo (gymnastics).",
  },

  // ============ BUSINESS ============
  {
    id: "entrepreneur",
    title: "Entrepreneur",
    filipinoTitle: "Negosyante",
    emoji: "💡",
    category: "Business",
    rarity: "uncommon",
    oneLiner: "Starts and runs their own business.",
    whatTheyDo: [
      "Spot problems people will pay to solve",
      "Build products or services",
      "Hire teams to help them grow",
      "Risk failure to chase big wins",
    ],
    funFact: "Henry Sy started with one shoe store and built SM Group — one of the biggest companies in PH!",
    gradient: "from-amber-400 to-orange-500",
    accentColor: "#f59e0b",
    helpfulSubjects: ["math", "english"],
    xpToUnlock: 400,
    pathToBecome: "Business / Entrepreneurship degree (4 yrs) OR just start a small biz now.",
    collegeTrack: "ABM",
    phContext: "Famous PH entrepreneurs: Tony Tan Caktiong (Jollibee), Cherry Tiu, Joey Concepcion.",
  },
  {
    id: "pilot",
    title: "Pilot",
    filipinoTitle: "Piloto",
    emoji: "✈️",
    category: "STEM",
    rarity: "rare",
    oneLiner: "Flies airplanes around the world.",
    whatTheyDo: [
      "Operate complex flight systems",
      "Plan flight paths and check weather",
      "Keep hundreds of passengers safe",
      "Travel the world while working",
    ],
    funFact: "Commercial pilots in the PH need ~1,500 flight hours to qualify — that's a lot of sky time!",
    gradient: "from-sky-400 to-cyan-500",
    accentColor: "#0ea5e9",
    helpfulSubjects: ["math", "science"],
    xpToUnlock: 900,
    pathToBecome: "Aviation school (2–4 yrs) → License → Airline interview → First officer → Captain.",
    collegeTrack: "STEM",
    phContext: "PH airlines hiring: PAL, Cebu Pacific, AirAsia. Top schools: PATTS, Omni Aviation.",
  },

  // ============ CULINARY ============
  {
    id: "chef",
    title: "Chef",
    filipinoTitle: "Tagaluto",
    emoji: "👨‍🍳",
    category: "Creative",
    rarity: "uncommon",
    oneLiner: "Cooks amazing food for a living.",
    whatTheyDo: [
      "Plan menus and invent new dishes",
      "Lead a kitchen team",
      "Cook for hundreds of diners a night",
      "Travel and learn from cuisines worldwide",
    ],
    funFact: "Filipino adobo has over 100 regional variations — every family has their secret version!",
    gradient: "from-orange-400 to-red-500",
    accentColor: "#f97316",
    helpfulSubjects: ["math", "science"],
    xpToUnlock: 350,
    pathToBecome: "Culinary school (2 yrs) + kitchen experience → Sous chef → Head chef.",
    collegeTrack: "TVL",
    phContext: "Top PH culinary schools: Enderun, ISCAHM, Center for Asian Culinary Studies.",
  },
];

/** Find a career by id. */
export function getCareer(id: string): Career | undefined {
  return CAREERS.find((c) => c.id === id);
}

/** All careers in a category. */
export function careersByCategory(cat: CareerCategory): Career[] {
  return CAREERS.filter((c) => c.category === cat);
}

/**
 * Decide if a career is unlocked for a learner based on their total XP
 * earned in helpful subjects. Currently using total XP as a proxy —
 * future iterations can use per-subject XP for sharper targeting.
 */
export function isCareerUnlocked(career: Career, totalXp: number): boolean {
  return totalXp >= career.xpToUnlock;
}

export const ALL_CATEGORIES: CareerCategory[] = [
  "STEM",
  "Health",
  "Arts",
  "Creative",
  "Service",
  "Sports",
  "Business",
];
