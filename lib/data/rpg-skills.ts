/**
 * rpg-skills.ts — per-class skill trees. Skills are non-combat learning powers
 * (study habits, real-world abilities). A node unlocks when its class reaches
 * the node's class level AND its prerequisite nodes are unlocked.
 *
 * Unlock state is DERIVED from class level in this pass (see isSkillUnlocked),
 * with an optional explicit-unlock list for future manual unlocks.
 */

import type { ClassId } from "@/lib/data/rpg-classes";

export interface SkillNode {
  id: string;
  classId: ClassId;
  name: string;
  emoji: string;
  description: string;
  /** Visual row/depth in the tree (1 = root). */
  tier: 1 | 2 | 3;
  /** Node ids that must be unlocked first. */
  requires: string[];
  /** Class level needed to unlock. */
  classLevel: number;
  /** A perk label shown to kids (cosmetic/flavor; no pay-to-win stats). */
  perk: string;
}

function tree(classId: ClassId, nodes: Omit<SkillNode, "classId">[]): SkillNode[] {
  return nodes.map((n) => ({ ...n, classId }));
}

export const SKILL_TREES: Record<ClassId, SkillNode[]> = {
  scholar: tree("scholar", [
    { id: "sk-scholar-focus", name: "Deep Focus", emoji: "🎯", tier: 1, requires: [], classLevel: 1, description: "Start strong — finish what you begin.", perk: "Focus title flair" },
    { id: "sk-scholar-notes", name: "Smart Notes", emoji: "🗒️", tier: 2, requires: ["sk-scholar-focus"], classLevel: 3, description: "Turn lessons into memory.", perk: "Notebook cosmetic" },
    { id: "sk-scholar-method", name: "Scientific Method", emoji: "🔬", tier: 2, requires: ["sk-scholar-focus"], classLevel: 5, description: "Ask, test, learn.", perk: "Lab badge" },
    { id: "sk-scholar-master", name: "Master Thinker", emoji: "🧠", tier: 3, requires: ["sk-scholar-notes", "sk-scholar-method"], classLevel: 10, description: "Connect ideas across subjects.", perk: "Aura: Insight" },
  ]),
  builder: tree("builder", [
    { id: "sk-builder-measure", name: "Measure Twice", emoji: "📏", tier: 1, requires: [], classLevel: 1, description: "Plan before you build.", perk: "Blueprint flair" },
    { id: "sk-builder-tools", name: "Right Tools", emoji: "🧰", tier: 2, requires: ["sk-builder-measure"], classLevel: 4, description: "Pick the tool for the job.", perk: "Toolbelt cosmetic" },
    { id: "sk-builder-physics", name: "Force & Motion", emoji: "⚙️", tier: 2, requires: ["sk-builder-measure"], classLevel: 6, description: "Understand how things move.", perk: "Gear badge" },
    { id: "sk-builder-master", name: "Master Builder", emoji: "🏗️", tier: 3, requires: ["sk-builder-tools", "sk-builder-physics"], classLevel: 11, description: "Design things that last.", perk: "Aura: Sturdy" },
  ]),
  healer: tree("healer", [
    { id: "sk-healer-care", name: "First Care", emoji: "💚", tier: 1, requires: [], classLevel: 1, description: "Kindness is a skill.", perk: "Care flair" },
    { id: "sk-healer-body", name: "How Bodies Work", emoji: "🫀", tier: 2, requires: ["sk-healer-care"], classLevel: 4, description: "Learn the human body.", perk: "Anatomy badge" },
    { id: "sk-healer-safety", name: "Stay Safe", emoji: "🧼", tier: 2, requires: ["sk-healer-care"], classLevel: 6, description: "Health and hygiene first.", perk: "Safety cosmetic" },
    { id: "sk-healer-master", name: "Trusted Healer", emoji: "🩺", tier: 3, requires: ["sk-healer-body", "sk-healer-safety"], classLevel: 11, description: "Care with knowledge.", perk: "Aura: Calm" },
  ]),
  storyteller: tree("storyteller", [
    { id: "sk-story-read", name: "Close Reading", emoji: "📖", tier: 1, requires: [], classLevel: 1, description: "Find meaning in words.", perk: "Reader flair" },
    { id: "sk-story-voice", name: "Find Your Voice", emoji: "🗣️", tier: 2, requires: ["sk-story-read"], classLevel: 3, description: "Write like you mean it.", perk: "Quill cosmetic" },
    { id: "sk-story-two", name: "Two Languages", emoji: "🌏", tier: 2, requires: ["sk-story-read"], classLevel: 5, description: "English and Filipino, both strong.", perk: "Bilingual badge" },
    { id: "sk-story-master", name: "Master Storyteller", emoji: "📜", tier: 3, requires: ["sk-story-voice", "sk-story-two"], classLevel: 10, description: "Move people with stories.", perk: "Aura: Eloquent" },
  ]),
  explorer: tree("explorer", [
    { id: "sk-explore-observe", name: "Sharp Eyes", emoji: "👀", tier: 1, requires: [], classLevel: 1, description: "Notice the details.", perk: "Scout flair" },
    { id: "sk-explore-map", name: "Map Sense", emoji: "🗺️", tier: 2, requires: ["sk-explore-observe"], classLevel: 4, description: "Read the world's maps.", perk: "Compass cosmetic" },
    { id: "sk-explore-nature", name: "Nature Lore", emoji: "🌿", tier: 2, requires: ["sk-explore-observe"], classLevel: 6, description: "Understand living things.", perk: "Field badge" },
    { id: "sk-explore-master", name: "Master Explorer", emoji: "🌍", tier: 3, requires: ["sk-explore-map", "sk-explore-nature"], classLevel: 11, description: "Go far, learn everywhere.", perk: "Aura: Wander" },
  ]),
  guardian: tree("guardian", [
    { id: "sk-guard-fair", name: "Fair Play", emoji: "🤝", tier: 1, requires: [], classLevel: 1, description: "Stand up for what's right.", perk: "Honor flair" },
    { id: "sk-guard-team", name: "Team Leader", emoji: "🎖️", tier: 2, requires: ["sk-guard-fair"], classLevel: 4, description: "Lead and listen.", perk: "Banner cosmetic" },
    { id: "sk-guard-community", name: "Community Sense", emoji: "🏛️", tier: 2, requires: ["sk-guard-fair"], classLevel: 6, description: "Understand how groups work.", perk: "Civic badge" },
    { id: "sk-guard-master", name: "Trusted Guardian", emoji: "🛡️", tier: 3, requires: ["sk-guard-team", "sk-guard-community"], classLevel: 11, description: "Protect and serve fairly.", perk: "Aura: Steadfast" },
  ]),
  merchant: tree("merchant", [
    { id: "sk-merch-count", name: "Money Smarts", emoji: "🪙", tier: 1, requires: [], classLevel: 1, description: "Count, save, plan.", perk: "Coin flair" },
    { id: "sk-merch-plan", name: "Plan a Stall", emoji: "🧺", tier: 2, requires: ["sk-merch-count"], classLevel: 4, description: "Turn an idea into a plan.", perk: "Ledger cosmetic" },
    { id: "sk-merch-people", name: "People Skills", emoji: "💬", tier: 2, requires: ["sk-merch-count"], classLevel: 6, description: "Listen to customers.", perk: "Trust badge" },
    { id: "sk-merch-master", name: "Young Founder", emoji: "🏪", tier: 3, requires: ["sk-merch-plan", "sk-merch-people"], classLevel: 11, description: "Grow a small venture.", perk: "Aura: Enterprising" },
  ]),
  "tech-tinkerer": tree("tech-tinkerer", [
    { id: "sk-tech-logic", name: "Logic Blocks", emoji: "🔣", tier: 1, requires: [], classLevel: 1, description: "Think step by step.", perk: "Coder flair" },
    { id: "sk-tech-debug", name: "Debug It", emoji: "🐞", tier: 2, requires: ["sk-tech-logic"], classLevel: 4, description: "Find and fix mistakes.", perk: "Bug badge" },
    { id: "sk-tech-design", name: "Game Sense", emoji: "🎮", tier: 2, requires: ["sk-tech-logic"], classLevel: 6, description: "Design fun, fair systems.", perk: "Controller cosmetic" },
    { id: "sk-tech-master", name: "Systems Designer", emoji: "🕹️", tier: 3, requires: ["sk-tech-debug", "sk-tech-design"], classLevel: 11, description: "Build games and apps.", perk: "Aura: Logical" },
  ]),
  creator: tree("creator", [
    { id: "sk-create-sketch", name: "Sketch It", emoji: "✏️", tier: 1, requires: [], classLevel: 1, description: "Get ideas out of your head.", perk: "Artist flair" },
    { id: "sk-create-color", name: "Color & Sound", emoji: "🎨", tier: 2, requires: ["sk-create-sketch"], classLevel: 4, description: "Make it feel alive.", perk: "Palette cosmetic" },
    { id: "sk-create-story", name: "Story in Media", emoji: "🎬", tier: 2, requires: ["sk-create-sketch"], classLevel: 6, description: "Tell stories with media.", perk: "Reel badge" },
    { id: "sk-create-master", name: "Showcase Pro", emoji: "🌟", tier: 3, requires: ["sk-create-color", "sk-create-story"], classLevel: 11, description: "Share work that inspires.", perk: "Aura: Inspired" },
  ]),
  navigator: tree("navigator", [
    { id: "sk-nav-route", name: "Plan a Route", emoji: "🧭", tier: 1, requires: [], classLevel: 1, description: "From here to there, safely.", perk: "Navigator flair" },
    { id: "sk-nav-weather", name: "Read the Sky", emoji: "🌦️", tier: 2, requires: ["sk-nav-route"], classLevel: 4, description: "Understand weather.", perk: "Barometer badge" },
    { id: "sk-nav-geo", name: "World Geography", emoji: "🌐", tier: 2, requires: ["sk-nav-route"], classLevel: 6, description: "Know the seas and lands.", perk: "Atlas cosmetic" },
    { id: "sk-nav-master", name: "Master Navigator", emoji: "⚓", tier: 3, requires: ["sk-nav-weather", "sk-nav-geo"], classLevel: 11, description: "Lead safe voyages.", perk: "Aura: Steady Course" },
  ]),
};

export function skillsForClass(classId: ClassId): SkillNode[] {
  return SKILL_TREES[classId] ?? [];
}

export function getSkill(id: string): SkillNode | undefined {
  for (const list of Object.values(SKILL_TREES)) {
    const found = list.find((s) => s.id === id);
    if (found) return found;
  }
  return undefined;
}

/**
 * Derived unlock check. A node is unlocked if the class level meets its
 * requirement and all prerequisite nodes are unlocked. `explicitUnlocked` can
 * force-unlock specific ids (e.g. from persisted unlocked_skills).
 */
export function isSkillUnlocked(
  node: SkillNode,
  classLevel: number,
  explicitUnlocked: string[] = []
): boolean {
  if (explicitUnlocked.includes(node.id)) return true;
  if (classLevel < node.classLevel) return false;
  const all = SKILL_TREES[node.classId];
  return node.requires.every((reqId) => {
    const req = all.find((n) => n.id === reqId);
    return req ? isSkillUnlocked(req, classLevel, explicitUnlocked) : true;
  });
}

export function unlockedSkillCount(classId: ClassId, classLevel: number, explicit: string[] = []): number {
  return skillsForClass(classId).filter((n) => isSkillUnlocked(n, classLevel, explicit)).length;
}
