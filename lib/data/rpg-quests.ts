/**
 * rpg-quests.ts — the PathForge quest catalog. Quests connect school subjects
 * and real careers to the game loop. Each quest can be fulfilled by real
 * lessons (completionType "lesson"/"quiz") or by richer activities (project,
 * reflection, parent_review, ai_feedback) introduced for the RPG layer.
 *
 * Lesson-backed quests derive completion from the existing analytics_events
 * (lesson_completed) data — see recommendedLessonsForQuest() + lib/learner.
 */

import type { SubjectId } from "@/lib/data/learner";
import type { Tier } from "@/lib/entitlements";
import type { ClassId } from "@/lib/data/rpg-classes";
import type { MapId } from "@/lib/data/rpg-maps";
import { getLessonsBySubject } from "@/lib/data/learner-lessons";

export type QuestType =
  | "daily"
  | "map"
  | "class"
  | "career"
  | "party"
  | "arena"
  | "capstone"
  | "job-change";

export type QuestDifficulty = "starter" | "easy" | "medium" | "hard" | "boss";

export type CompletionType =
  | "lesson"
  | "quiz"
  | "project"
  | "reflection"
  | "parent_review"
  | "ai_feedback";

export interface Quest {
  id: string;
  title: string;
  description: string;
  questType: QuestType;
  mapId?: MapId;
  classIds: ClassId[];
  careerIds: string[];
  subject?: SubjectId;
  gradeBand: [number, number];
  difficulty: QuestDifficulty;
  xpReward: number;
  classXpReward: number;
  skillRewards: string[]; // skill node ids unlocked/advanced
  requiredLevel: number;
  requiredSkills: string[];
  recommendedLessonIds: string[];
  paidTier: Tier;
  estimatedMinutes: number;
  completionType: CompletionType;
}

type QuestInput = Partial<Quest> & Pick<Quest, "id" | "title" | "questType">;

function q(input: QuestInput): Quest {
  return {
    description: input.title,
    classIds: [],
    careerIds: [],
    gradeBand: [1, 10],
    difficulty: "easy",
    xpReward: 100,
    classXpReward: 60,
    skillRewards: [],
    requiredLevel: 1,
    requiredSkills: [],
    recommendedLessonIds: [],
    paidTier: "free",
    estimatedMinutes: 10,
    completionType: "lesson",
    ...input,
  } as Quest;
}

export const QUESTS: Quest[] = [
  // ---------- DAILY (one per subject realm) ----------
  q({ id: "q-math-daily", title: "Daily Number Drill", questType: "daily", subject: "math", mapId: "number-kingdom", careerIds: ["engineer"], difficulty: "starter", xpReward: 60, classXpReward: 30, estimatedMinutes: 8, description: "Warm up with a quick set of number challenges." }),
  q({ id: "q-eng-daily", title: "Daily Reading Spark", questType: "daily", subject: "english", mapId: "story-forest", difficulty: "starter", xpReward: 60, classXpReward: 30, estimatedMinutes: 8, description: "Read a short passage and answer a few questions." }),
  q({ id: "q-fil-daily", title: "Salita ng Araw", questType: "daily", subject: "filipino", mapId: "bayani-isles", difficulty: "starter", xpReward: 60, classXpReward: 30, estimatedMinutes: 8, description: "Matuto ng bagong salita at gamitin ito." }),
  q({ id: "q-sci-daily", title: "Daily Curiosity Quest", questType: "daily", subject: "science", mapId: "lab-reef", difficulty: "starter", xpReward: 60, classXpReward: 30, estimatedMinutes: 8, description: "Observe, predict, and learn something new." }),
  q({ id: "q-ap-daily", title: "Daily Community Quest", questType: "daily", subject: "araling-panlipunan", mapId: "history-archipelago", difficulty: "starter", xpReward: 60, classXpReward: 30, estimatedMinutes: 8, description: "Learn one thing about people and places." }),

  // ---------- MAP QUESTS (training quests within a zone) ----------
  q({ id: "q-math-map-1", title: "Counting Crossroads", questType: "map", subject: "math", mapId: "number-kingdom", careerIds: ["engineer", "data-scientist"], difficulty: "easy", xpReward: 120, classXpReward: 70, gradeBand: [1, 5], skillRewards: ["sk-scholar-focus"], description: "Travel the crossroads using addition and patterns." }),
  q({ id: "q-math-map-2", title: "Bridge of Operations", questType: "map", subject: "math", mapId: "number-kingdom", careerIds: ["engineer"], difficulty: "medium", xpReward: 160, classXpReward: 90, gradeBand: [3, 8], requiredLevel: 3, description: "Cross the bridge by mastering operations." }),
  q({ id: "q-eng-map-1", title: "Whispering Words", questType: "map", subject: "english", mapId: "story-forest", difficulty: "easy", xpReward: 120, classXpReward: 70, gradeBand: [1, 5], description: "Grow your vocabulary in the forest clearing." }),
  q({ id: "q-eng-map-2", title: "Path of Comprehension", questType: "map", subject: "english", mapId: "story-forest", difficulty: "medium", xpReward: 160, classXpReward: 90, gradeBand: [3, 8], requiredLevel: 3, description: "Read deeper passages and find the meaning." }),
  q({ id: "q-fil-map-1", title: "Daan ng mga Salita", questType: "map", subject: "filipino", mapId: "bayani-isles", difficulty: "easy", xpReward: 120, classXpReward: 70, gradeBand: [1, 6], description: "Palawakin ang talasalitaan sa mga pulo." }),
  q({ id: "q-fil-map-2", title: "Kwento ng Bayani", questType: "map", subject: "filipino", mapId: "bayani-isles", difficulty: "medium", xpReward: 160, classXpReward: 90, gradeBand: [4, 10], requiredLevel: 3, description: "Basahin at unawain ang kwento ng mga bayani." }),
  q({ id: "q-sci-map-1", title: "Tidepool Discoveries", questType: "map", subject: "science", mapId: "lab-reef", difficulty: "easy", xpReward: 120, classXpReward: 70, gradeBand: [1, 6], description: "Observe living things in the tidepools." }),
  q({ id: "q-sci-map-2", title: "Currents & Forces", questType: "map", subject: "science", mapId: "lab-reef", difficulty: "medium", xpReward: 160, classXpReward: 90, gradeBand: [4, 10], requiredLevel: 4, description: "Investigate how forces move the reef." }),
  q({ id: "q-ap-map-1", title: "Island Stories", questType: "map", subject: "araling-panlipunan", mapId: "history-archipelago", difficulty: "easy", xpReward: 120, classXpReward: 70, gradeBand: [3, 7], description: "Discover the stories of nearby islands." }),
  q({ id: "q-ap-map-2", title: "Voyages of the Past", questType: "map", subject: "araling-panlipunan", mapId: "history-archipelago", difficulty: "medium", xpReward: 160, classXpReward: 90, gradeBand: [5, 10], requiredLevel: 4, description: "Trace how people shaped our history." }),

  // ---------- CLASS QUESTS (per class, 3 each) ----------
  q({ id: "cq-scholar-1", title: "The Curious Mind", questType: "class", classIds: ["scholar"], subject: "science", careerIds: ["scientist"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-scholar-focus"], completionType: "lesson", description: "Ask a question and find the answer through a lesson." }),
  q({ id: "cq-scholar-2", title: "Notes That Stick", questType: "class", classIds: ["scholar"], difficulty: "medium", classXpReward: 130, xpReward: 120, requiredLevel: 3, skillRewards: ["sk-scholar-notes"], completionType: "reflection", paidTier: "pro", description: "Write a short reflection on what you learned this week." }),
  q({ id: "cq-scholar-3", title: "Connect the Subjects", questType: "class", classIds: ["scholar"], difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-scholar-master"], completionType: "ai_feedback", paidTier: "pro", description: "Explain how two subjects connect; get AI mentor feedback." }),

  q({ id: "cq-builder-1", title: "Measure & Plan", questType: "class", classIds: ["builder"], subject: "math", careerIds: ["engineer"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-builder-measure"], description: "Use measurement to plan a small build." }),
  q({ id: "cq-builder-2", title: "Build a Model", questType: "class", classIds: ["builder"], difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-builder-tools"], completionType: "project", paidTier: "pro", description: "Make a simple model and snap a photo for review." }),
  q({ id: "cq-builder-3", title: "Force & Motion Trial", questType: "class", classIds: ["builder"], subject: "science", difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-builder-master"], paidTier: "pro", description: "Show you understand how things move." }),

  q({ id: "cq-healer-1", title: "First Care Basics", questType: "class", classIds: ["healer"], subject: "science", careerIds: ["nurse"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-healer-care"], description: "Learn the basics of caring for others." }),
  q({ id: "cq-healer-2", title: "How the Body Works", questType: "class", classIds: ["healer"], subject: "science", difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-healer-body"], paidTier: "pro", description: "Explore the human body in a lesson." }),
  q({ id: "cq-healer-3", title: "Caring Choices", questType: "class", classIds: ["healer"], difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-healer-master"], completionType: "reflection", paidTier: "pro", description: "Reflect on a time you helped someone." }),

  q({ id: "cq-storyteller-1", title: "Read Closely", questType: "class", classIds: ["storyteller"], subject: "english", careerIds: ["writer"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-story-read"], description: "Read a passage and find its meaning." }),
  q({ id: "cq-storyteller-2", title: "Write Your Voice", questType: "class", classIds: ["storyteller"], difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 3, skillRewards: ["sk-story-voice"], completionType: "project", paidTier: "pro", description: "Write a short story or poem." }),
  q({ id: "cq-storyteller-3", title: "Two Languages", questType: "class", classIds: ["storyteller"], subject: "filipino", difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-story-master"], paidTier: "pro", description: "Show strength in English at Filipino." }),

  q({ id: "cq-explorer-1", title: "Sharp Eyes", questType: "class", classIds: ["explorer"], subject: "science", difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-explore-observe"], description: "Notice details in the world around you." }),
  q({ id: "cq-explorer-2", title: "Read the Map", questType: "class", classIds: ["explorer"], subject: "araling-panlipunan", careerIds: ["seafarer"], difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-explore-map"], paidTier: "pro", description: "Learn to read and use maps." }),
  q({ id: "cq-explorer-3", title: "Field Journal", questType: "class", classIds: ["explorer"], difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-explore-master"], completionType: "project", paidTier: "pro", description: "Keep a small field journal of observations." }),

  q({ id: "cq-guardian-1", title: "Fair Play", questType: "class", classIds: ["guardian"], subject: "araling-panlipunan", careerIds: ["public-service-officer"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-guard-fair"], paidTier: "pro", description: "Learn what fairness means in a community." }),
  q({ id: "cq-guardian-2", title: "Lead the Team", questType: "class", classIds: ["guardian"], difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-guard-team"], completionType: "reflection", paidTier: "pro", description: "Reflect on a time you helped lead." }),
  q({ id: "cq-guardian-3", title: "Community Sense", questType: "class", classIds: ["guardian"], subject: "araling-panlipunan", difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-guard-master"], paidTier: "pro", description: "Show how communities work together." }),

  q({ id: "cq-merchant-1", title: "Money Smarts", questType: "class", classIds: ["merchant"], subject: "math", careerIds: ["entrepreneur"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-merch-count"], paidTier: "pro", description: "Practice counting, saving, and planning." }),
  q({ id: "cq-merchant-2", title: "Plan a Stall", questType: "class", classIds: ["merchant"], difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-merch-plan"], completionType: "project", paidTier: "pro", description: "Plan a tiny pretend business." }),
  q({ id: "cq-merchant-3", title: "Founder Mindset", questType: "class", classIds: ["merchant"], difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-merch-master"], completionType: "ai_feedback", paidTier: "pro", description: "Pitch your idea and get mentor feedback." }),

  q({ id: "cq-tech-1", title: "Logic Blocks", questType: "class", classIds: ["tech-tinkerer"], subject: "math", careerIds: ["software-engineer", "game-designer"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-tech-logic"], paidTier: "pro", description: "Think step by step like a coder." }),
  q({ id: "cq-tech-2", title: "Debug the Puzzle", questType: "class", classIds: ["tech-tinkerer"], difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-tech-debug"], paidTier: "pro", description: "Find and fix the mistake in a puzzle." }),
  q({ id: "cq-tech-3", title: "Design a Game Rule", questType: "class", classIds: ["tech-tinkerer"], difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-tech-master"], completionType: "project", paidTier: "pro", description: "Invent a fair, fun game rule." }),

  q({ id: "cq-creator-1", title: "Sketch an Idea", questType: "class", classIds: ["creator"], subject: "english", careerIds: ["artist", "ux-designer"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-create-sketch"], paidTier: "pro", description: "Get an idea out of your head and onto paper." }),
  q({ id: "cq-creator-2", title: "Color & Sound", questType: "class", classIds: ["creator"], difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-create-color"], completionType: "project", paidTier: "pro", description: "Make something feel alive with color or sound." }),
  q({ id: "cq-creator-3", title: "Tell It in Media", questType: "class", classIds: ["creator"], difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-create-master"], completionType: "project", paidTier: "pro", description: "Tell a short story using media." }),

  q({ id: "cq-navigator-1", title: "Plan a Route", questType: "class", classIds: ["navigator"], subject: "math", careerIds: ["seafarer", "pilot"], difficulty: "easy", classXpReward: 100, xpReward: 110, skillRewards: ["sk-nav-route"], paidTier: "pro", description: "Plan a safe path from here to there." }),
  q({ id: "cq-navigator-2", title: "Read the Sky", questType: "class", classIds: ["navigator"], subject: "science", difficulty: "medium", classXpReward: 140, xpReward: 130, requiredLevel: 4, skillRewards: ["sk-nav-weather"], paidTier: "pro", description: "Understand weather for a journey." }),
  q({ id: "cq-navigator-3", title: "World Geography", questType: "class", classIds: ["navigator"], subject: "araling-panlipunan", difficulty: "hard", classXpReward: 180, xpReward: 160, requiredLevel: 8, skillRewards: ["sk-nav-master"], paidTier: "pro", description: "Map the seas and lands of the world." }),

  // ---------- CAREER QUESTS (career-themed maps) ----------
  q({ id: "q-build-career-1", title: "Engineer's Apprenticeship", questType: "career", mapId: "builders-yard", classIds: ["builder"], careerIds: ["engineer", "robotics"], subject: "math", difficulty: "medium", xpReward: 160, classXpReward: 110, requiredLevel: 8, paidTier: "pro", description: "Take on a real engineering challenge." }),
  q({ id: "q-build-project", title: "Bridge Build Project", questType: "career", mapId: "builders-yard", classIds: ["builder"], careerIds: ["engineer"], difficulty: "hard", xpReward: 200, classXpReward: 140, requiredLevel: 9, completionType: "project", paidTier: "pro", description: "Design a bridge and submit it for review." }),
  q({ id: "q-health-career-1", title: "Junior Medic Rounds", questType: "career", mapId: "health-harbor", classIds: ["healer"], careerIds: ["doctor", "nurse"], subject: "science", difficulty: "medium", xpReward: 160, classXpReward: 110, requiredLevel: 9, paidTier: "pro", description: "Learn how medics keep people healthy." }),
  q({ id: "q-health-reflection", title: "Caregiver Reflection", questType: "career", mapId: "health-harbor", classIds: ["healer"], careerIds: ["nurse"], difficulty: "medium", xpReward: 150, classXpReward: 110, requiredLevel: 9, completionType: "reflection", paidTier: "pro", description: "Reflect on caring for others safely." }),
  q({ id: "q-market-career-1", title: "Market Day Plan", questType: "career", mapId: "merchant-market", classIds: ["merchant"], careerIds: ["entrepreneur"], subject: "math", difficulty: "medium", xpReward: 160, classXpReward: 110, requiredLevel: 7, paidTier: "pro", description: "Plan a market stall and a budget." }),
  q({ id: "q-market-project", title: "Tiny Business Pitch", questType: "career", mapId: "merchant-market", classIds: ["merchant"], careerIds: ["entrepreneur"], difficulty: "hard", xpReward: 200, classXpReward: 140, requiredLevel: 8, completionType: "ai_feedback", paidTier: "pro", description: "Pitch a small business idea." }),
  q({ id: "q-create-career-1", title: "Studio Commission", questType: "career", mapId: "creator-studio", classIds: ["creator"], careerIds: ["artist", "filmmaker"], subject: "english", difficulty: "medium", xpReward: 160, classXpReward: 110, requiredLevel: 7, paidTier: "pro", description: "Create art for a studio brief." }),
  q({ id: "q-create-project", title: "Showcase Piece", questType: "career", mapId: "creator-studio", classIds: ["creator"], careerIds: ["artist"], difficulty: "hard", xpReward: 200, classXpReward: 140, requiredLevel: 8, completionType: "project", paidTier: "pro", description: "Make and present an original work." }),
  q({ id: "q-nav-career-1", title: "Harbor Pilot Training", questType: "career", mapId: "navigator-docks", classIds: ["navigator"], careerIds: ["seafarer", "pilot"], subject: "araling-panlipunan", difficulty: "medium", xpReward: 160, classXpReward: 110, requiredLevel: 9, paidTier: "pro", description: "Learn to guide ships safely." }),
  q({ id: "q-nav-project", title: "Chart a Voyage", questType: "career", mapId: "navigator-docks", classIds: ["navigator"], careerIds: ["seafarer"], difficulty: "hard", xpReward: 200, classXpReward: 140, requiredLevel: 10, completionType: "project", paidTier: "pro", description: "Plan a full voyage route." }),
  q({ id: "q-code-career-1", title: "Code Apprentice", questType: "career", mapId: "code-workshop", classIds: ["tech-tinkerer"], careerIds: ["software-engineer", "game-developer"], subject: "math", difficulty: "medium", xpReward: 160, classXpReward: 110, requiredLevel: 10, paidTier: "pro", description: "Solve logic challenges like a coder." }),
  q({ id: "q-code-project", title: "Build a Mini Game", questType: "career", mapId: "code-workshop", classIds: ["tech-tinkerer"], careerIds: ["game-designer"], difficulty: "hard", xpReward: 220, classXpReward: 150, requiredLevel: 11, completionType: "project", paidTier: "pro", description: "Design the rules for a mini game." }),

  // ---------- PARTY QUESTS (family/classroom co-op) ----------
  q({ id: "q-math-party", title: "Family Number Relay", questType: "party", subject: "math", mapId: "number-kingdom", difficulty: "easy", xpReward: 140, classXpReward: 60, estimatedMinutes: 15, completionType: "parent_review", paidTier: "family", description: "Team up with family to solve number challenges." }),
  q({ id: "q-eng-class", title: "Reading Circle Party", questType: "party", subject: "english", mapId: "story-forest", difficulty: "easy", xpReward: 140, classXpReward: 60, estimatedMinutes: 15, completionType: "parent_review", paidTier: "family", description: "Read together and share favorite parts." }),
  q({ id: "q-sci-career", title: "Family Science Hunt", questType: "party", subject: "science", mapId: "lab-reef", difficulty: "medium", xpReward: 160, classXpReward: 70, estimatedMinutes: 20, completionType: "parent_review", paidTier: "family", description: "Find science in your home together." }),

  // ---------- ARENA CHALLENGES ----------
  q({ id: "q-arena-quiz", title: "Quiz Duel: Mixed Subjects", questType: "arena", difficulty: "medium", xpReward: 120, classXpReward: 50, estimatedMinutes: 6, completionType: "quiz", description: "A friendly 1v1 quiz duel, matched by grade." }),
  q({ id: "q-arena-speedmath", title: "Speed Math Duel", questType: "arena", subject: "math", difficulty: "medium", xpReward: 120, classXpReward: 50, estimatedMinutes: 5, completionType: "quiz", description: "Race the clock in a fair math duel." }),
  q({ id: "q-arena-vocab", title: "Vocabulary Duel", questType: "arena", subject: "english", difficulty: "easy", xpReward: 110, classXpReward: 50, estimatedMinutes: 5, completionType: "quiz", description: "Word power, head to head." }),

  // ---------- CAPSTONE / BOSS (one per map) ----------
  q({ id: "boss-number-kingdom", title: "Pattern Gate Challenge", questType: "capstone", subject: "math", mapId: "number-kingdom", difficulty: "boss", xpReward: 300, classXpReward: 160, requiredLevel: 5, completionType: "quiz", description: "A mastery check of your number sense." }),
  q({ id: "boss-story-forest", title: "Reading Guardian Challenge", questType: "capstone", subject: "english", mapId: "story-forest", difficulty: "boss", xpReward: 300, classXpReward: 160, requiredLevel: 5, completionType: "quiz", description: "A mastery check of your reading." }),
  q({ id: "boss-bayani-isles", title: "Salita Mastery Trial", questType: "capstone", subject: "filipino", mapId: "bayani-isles", difficulty: "boss", xpReward: 300, classXpReward: 160, requiredLevel: 6, completionType: "quiz", description: "Pagsusulit ng kahusayan sa wika." }),
  q({ id: "boss-lab-reef", title: "Lab Trial", questType: "capstone", subject: "science", mapId: "lab-reef", difficulty: "boss", xpReward: 300, classXpReward: 160, requiredLevel: 6, completionType: "quiz", description: "A mastery check of your science." }),
  q({ id: "boss-history-archipelago", title: "Community Wisdom Trial", questType: "capstone", subject: "araling-panlipunan", mapId: "history-archipelago", difficulty: "boss", xpReward: 300, classXpReward: 160, requiredLevel: 7, completionType: "quiz", description: "A mastery check of community wisdom." }),
  q({ id: "boss-builders-yard", title: "Blueprint Mastery Check", questType: "capstone", subject: "math", mapId: "builders-yard", difficulty: "boss", xpReward: 320, classXpReward: 180, requiredLevel: 9, completionType: "project", paidTier: "pro", description: "Defend a working build plan." }),
  q({ id: "boss-health-harbor", title: "Caregiver's Trial", questType: "capstone", subject: "science", mapId: "health-harbor", difficulty: "boss", xpReward: 320, classXpReward: 180, requiredLevel: 10, completionType: "reflection", paidTier: "pro", description: "Make safe, caring decisions." }),
  q({ id: "boss-merchant-market", title: "Founder's Pitch Check", questType: "capstone", subject: "math", mapId: "merchant-market", difficulty: "boss", xpReward: 320, classXpReward: 180, requiredLevel: 8, completionType: "ai_feedback", paidTier: "pro", description: "Pitch a small business plan." }),
  q({ id: "boss-creator-studio", title: "Showcase Mastery Check", questType: "capstone", subject: "english", mapId: "creator-studio", difficulty: "boss", xpReward: 320, classXpReward: 180, requiredLevel: 8, completionType: "project", paidTier: "pro", description: "Create and present an original piece." }),
  q({ id: "boss-navigator-docks", title: "Voyage Plan Trial", questType: "capstone", subject: "araling-panlipunan", mapId: "navigator-docks", difficulty: "boss", xpReward: 320, classXpReward: 180, requiredLevel: 10, completionType: "project", paidTier: "pro", description: "Chart and explain a safe voyage." }),
  q({ id: "boss-code-workshop", title: "Logic Systems Check", questType: "capstone", subject: "math", mapId: "code-workshop", difficulty: "boss", xpReward: 340, classXpReward: 200, requiredLevel: 11, completionType: "project", paidTier: "pro", description: "Solve and trace a logic build." }),

  // ---------- JOB CHANGE QUESTS (class advancement) ----------
  q({ id: "jc-healer-medic", title: "Job Change: Junior Medic", questType: "job-change", classIds: ["healer"], careerIds: ["doctor", "nurse"], difficulty: "boss", xpReward: 280, classXpReward: 220, requiredLevel: 5, completionType: "ai_feedback", paidTier: "pro", description: "Prove your readiness to advance from Health Helper to Junior Medic." }),
  q({ id: "jc-builder-systems", title: "Job Change: Systems Maker", questType: "job-change", classIds: ["builder"], careerIds: ["engineer"], difficulty: "boss", xpReward: 280, classXpReward: 220, requiredLevel: 5, completionType: "project", paidTier: "pro", description: "Advance from Junior Builder to Systems Maker." }),
  q({ id: "jc-merchant-founder", title: "Job Change: Young Founder", questType: "job-change", classIds: ["merchant"], careerIds: ["entrepreneur"], difficulty: "boss", xpReward: 280, classXpReward: 220, requiredLevel: 5, completionType: "ai_feedback", paidTier: "pro", description: "Advance from Shop Planner to Young Founder." }),
  q({ id: "jc-tech-designer", title: "Job Change: Game Systems Designer", questType: "job-change", classIds: ["tech-tinkerer"], careerIds: ["game-designer"], difficulty: "boss", xpReward: 280, classXpReward: 220, requiredLevel: 5, completionType: "project", paidTier: "pro", description: "Advance from Logic Coder to Game Systems Designer." }),
  q({ id: "jc-navigator-cadet", title: "Job Change: Maritime Cadet", questType: "job-change", classIds: ["navigator"], careerIds: ["seafarer"], difficulty: "boss", xpReward: 280, classXpReward: 220, requiredLevel: 5, completionType: "project", paidTier: "pro", description: "Advance from Route Planner to Maritime Cadet." }),
];

// ---------- lookups ----------
export function getQuest(id: string): Quest | undefined {
  return QUESTS.find((x) => x.id === id);
}
export function questsByType(t: QuestType): Quest[] {
  return QUESTS.filter((x) => x.questType === t);
}
export function questsForMap(mapId: MapId): Quest[] {
  return QUESTS.filter((x) => x.mapId === mapId);
}
export function questsForClass(classId: ClassId): Quest[] {
  return QUESTS.filter((x) => x.classIds.includes(classId));
}
export function questsForCareer(careerId: string): Quest[] {
  return QUESTS.filter((x) => x.careerIds.includes(careerId));
}

/** Resolve real lessons that satisfy a lesson/quiz quest, by subject + grade. */
export function recommendedLessonsForQuest(quest: Quest, grade?: number) {
  if (quest.recommendedLessonIds.length) {
    return quest.recommendedLessonIds;
  }
  if (!quest.subject) return [];
  const lessons = getLessonsBySubject(quest.subject, grade);
  return lessons.slice(0, 5).map((l) => l.id);
}

export const QUEST_TYPE_META: Record<QuestType, { label: string; emoji: string; accent: string }> = {
  daily: { label: "Daily Quest", emoji: "📅", accent: "#34d399" },
  map: { label: "Map Quest", emoji: "🗺️", accent: "#38bdf8" },
  class: { label: "Class Quest", emoji: "🎓", accent: "#a78bfa" },
  career: { label: "Career Quest", emoji: "🧭", accent: "#fb7185" },
  party: { label: "Party Quest", emoji: "👨‍👩‍👧‍👦", accent: "#f59e0b" },
  arena: { label: "Arena Challenge", emoji: "⚔️", accent: "#f43f5e" },
  capstone: { label: "Mastery Challenge", emoji: "👑", accent: "#fbbf24" },
  "job-change": { label: "Job Change Quest", emoji: "✨", accent: "#c084fc" },
};

export const DIFFICULTY_META: Record<QuestDifficulty, { label: string; color: string }> = {
  starter: { label: "Starter", color: "#34d399" },
  easy: { label: "Easy", color: "#38bdf8" },
  medium: { label: "Medium", color: "#a78bfa" },
  hard: { label: "Hard", color: "#fb923c" },
  boss: { label: "Mastery", color: "#fbbf24" },
};
