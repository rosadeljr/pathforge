/**
 * rpg-rewards.ts — PathForge's non-predatory reward economy.
 *
 * Rules baked in: NO lootboxes, NO gambling, NO random paid rewards, NO paid
 * stat boosts, NO pressure timers. Coins are earned only from learning. Shop
 * items are cosmetic. Everything here is deterministic and transparent.
 */

export type RewardType =
  | "outfit"
  | "title"
  | "badge"
  | "stamp"
  | "emblem"
  | "certificate"
  | "decoration";

export interface Reward {
  id: string;
  type: RewardType;
  name: string;
  emoji: string;
  description: string;
  /** How it's obtained, for transparency. */
  source: "quest" | "boss" | "class" | "guild" | "shop";
  /** Coin price when buyable in the shop (0 = not for sale). */
  coinPrice: number;
  accent: string;
}

const ACCENTS: Record<RewardType, string> = {
  outfit: "#a78bfa",
  title: "#38bdf8",
  badge: "#fbbf24",
  stamp: "#34d399",
  emblem: "#fb7185",
  certificate: "#f59e0b",
  decoration: "#c084fc",
};

function r(
  id: string,
  type: RewardType,
  name: string,
  emoji: string,
  description: string,
  source: Reward["source"],
  coinPrice = 0
): Reward {
  return { id, type, name, emoji, description, source, coinPrice, accent: ACCENTS[type] };
}

export const REWARDS: Reward[] = [
  // ----- class outfits + titles -----
  r("outfit-scholar-robe", "outfit", "Scholar's Robe", "🥼", "A robe for deep thinkers.", "class"),
  r("title-the-curious", "title", "The Curious", "🔎", "For minds that never stop asking why.", "class"),
  r("outfit-builder-vest", "outfit", "Builder's Vest", "🦺", "Pockets for every tool.", "class"),
  r("title-the-maker", "title", "The Maker", "🔧", "Ideas become real.", "class"),
  r("outfit-healer-coat", "outfit", "Healer's Coat", "🥼", "Care, ready to go.", "class"),
  r("title-the-caring", "title", "The Caring", "💚", "Kindness with knowledge.", "class"),
  r("outfit-storyteller-cloak", "outfit", "Storyteller's Cloak", "🧥", "Woven with words.", "class"),
  r("title-the-wordsmith", "title", "The Wordsmith", "✍️", "Words that move people.", "class"),
  r("outfit-explorer-gear", "outfit", "Explorer's Gear", "🎒", "Ready for any trail.", "class"),
  r("title-the-wayfinder", "title", "The Wayfinder", "🧭", "Always finds the path.", "class"),
  r("outfit-guardian-armor", "outfit", "Guardian's Armor", "🛡️", "Stands for what's right.", "class"),
  r("title-the-brave", "title", "The Brave", "🦁", "Courage, fairly used.", "class"),
  r("outfit-merchant-coat", "outfit", "Merchant's Coat", "🧥", "Built for the market.", "class"),
  r("title-the-founder", "title", "The Founder", "💡", "Small ideas, big growth.", "class"),
  r("outfit-tinkerer-hoodie", "outfit", "Tinkerer's Hoodie", "🧥", "Comfort for long builds.", "class"),
  r("title-the-logician", "title", "The Logician", "🔣", "Step by careful step.", "class"),
  r("outfit-creator-smock", "outfit", "Creator's Smock", "🎨", "Paint-proof and proud.", "class"),
  r("title-the-imaginative", "title", "The Imaginative", "🌈", "Sees what isn't there yet.", "class"),
  r("outfit-navigator-jacket", "outfit", "Navigator's Jacket", "🧥", "For sea, land, and sky.", "class"),
  r("title-the-pathfinder", "title", "The Pathfinder", "⚓", "Charts a steady course.", "class"),

  // ----- boss badges -----
  r("badge-pattern-gate", "badge", "Pattern Gate", "🔢", "Cleared the Pattern Gate Challenge.", "boss"),
  r("badge-reading-guardian", "badge", "Reading Guardian", "📖", "Bested the Reading Guardian.", "boss"),
  r("badge-salita-master", "badge", "Salita Master", "🗣️", "Pumasa sa Salita Mastery Trial.", "boss"),
  r("badge-lab-trial", "badge", "Lab Trial", "🧪", "Passed the Lab Trial.", "boss"),
  r("badge-community-wisdom", "badge", "Community Wisdom", "🏛️", "Earned the Community Wisdom Trial.", "boss"),
  r("badge-master-builder", "badge", "Master Builder", "🏗️", "Defended a winning blueprint.", "boss"),
  r("badge-caregiver", "badge", "Caregiver", "🩺", "Passed the Caregiver's Trial.", "boss"),
  r("badge-young-founder", "badge", "Young Founder", "💡", "Nailed the Founder's Pitch.", "boss"),
  r("badge-showcase", "badge", "Showcase", "🌟", "Aced the Showcase Mastery Check.", "boss"),
  r("badge-navigator", "badge", "Navigator", "🧭", "Passed the Voyage Plan Trial.", "boss"),
  r("badge-logic-systems", "badge", "Logic Systems", "🤖", "Cleared the Logic Systems Check.", "boss"),

  // ----- map stamps (collect them all) -----
  r("stamp-number-kingdom", "stamp", "Number Kingdom Stamp", "🏰", "Visited and conquered.", "boss"),
  r("stamp-story-forest", "stamp", "Story Forest Stamp", "🌲", "Explored every clearing.", "boss"),
  r("stamp-bayani-isles", "stamp", "Bayani Isles Stamp", "🏝️", "Sailed every isle.", "boss"),
  r("stamp-lab-reef", "stamp", "Lab Reef Stamp", "🔬", "Ran every experiment.", "boss"),
  r("stamp-history-archipelago", "stamp", "History Archipelago Stamp", "🗺️", "Learned every story.", "boss"),
  r("stamp-builders-yard", "stamp", "Builder's Yard Stamp", "🏗️", "Built it all.", "boss"),
  r("stamp-health-harbor", "stamp", "Health Harbor Stamp", "⚓", "Cared for the harbor.", "boss"),
  r("stamp-merchant-market", "stamp", "Merchant Market Stamp", "🏪", "Traded with the best.", "boss"),
  r("stamp-creator-studio", "stamp", "Creator Studio Stamp", "🎨", "Made the studio shine.", "boss"),
  r("stamp-navigator-docks", "stamp", "Navigator Docks Stamp", "🚢", "Charted every route.", "boss"),
  r("stamp-code-workshop", "stamp", "Code Workshop Stamp", "🕹️", "Solved every puzzle.", "boss"),

  // ----- guild emblems -----
  r("emblem-engineers-guild", "emblem", "Engineers' Guild Emblem", "⚙️", "Recognized by the Engineers' Guild.", "guild"),
  r("emblem-healers-guild", "emblem", "Healers' Guild Emblem", "💊", "Recognized by the Healers' Guild.", "guild"),
  r("emblem-founders-guild", "emblem", "Founders' Guild Emblem", "📈", "Recognized by the Founders' Guild.", "guild"),
  r("emblem-creators-guild", "emblem", "Creators' Guild Emblem", "🎭", "Recognized by the Creators' Guild.", "guild"),
  r("emblem-navigators-guild", "emblem", "Navigators' Guild Emblem", "🧭", "Recognized by the Navigators' Guild.", "guild"),
  r("emblem-tech-guild", "emblem", "Tech Guild Emblem", "💻", "Recognized by the Tech Guild.", "guild"),

  // ----- certificates (parent-visible proof) -----
  r("cert-math-mastery", "certificate", "Math Mastery Certificate", "📜", "Proof of Number Kingdom mastery.", "boss"),
  r("cert-english-mastery", "certificate", "English Mastery Certificate", "📜", "Proof of Story Forest mastery.", "boss"),
  r("cert-filipino-mastery", "certificate", "Filipino Mastery Certificate", "📜", "Patunay ng kahusayan sa Filipino.", "boss"),
  r("cert-science-mastery", "certificate", "Science Mastery Certificate", "📜", "Proof of Lab Reef mastery.", "boss"),
  r("cert-ap-mastery", "certificate", "AP Mastery Certificate", "📜", "Proof of History Archipelago mastery.", "boss"),

  // ----- shop decorations (cosmetic, coin-only, transparent prices) -----
  r("deco-banner-cyan", "decoration", "Cyan Guild Banner", "🚩", "Hang it in your room.", "shop", 150),
  r("deco-banner-gold", "decoration", "Gold Guild Banner", "🏴", "A banner of achievement.", "shop", 150),
  r("deco-desk-globe", "decoration", "Explorer's Globe", "🌐", "A globe for your study nook.", "shop", 220),
  r("deco-trophy-shelf", "decoration", "Trophy Shelf", "🏆", "Show off your badges.", "shop", 300),
  r("deco-plant", "decoration", "Study Plant", "🪴", "A little green friend.", "shop", 120),
  r("deco-lamp", "decoration", "Focus Lamp", "💡", "Warm light for learning.", "shop", 120),
];

export function getReward(id: string): Reward | undefined {
  return REWARDS.find((x) => x.id === id);
}
export function rewardsByType(t: RewardType): Reward[] {
  return REWARDS.filter((x) => x.type === t);
}
export function shopRewards(): Reward[] {
  return REWARDS.filter((x) => x.coinPrice > 0);
}
export function getRewards(ids: string[]): Reward[] {
  return ids.map(getReward).filter((x): x is Reward => Boolean(x));
}

export const REWARD_TYPE_META: Record<RewardType, { label: string; emoji: string }> = {
  outfit: { label: "Outfit", emoji: "🧥" },
  title: { label: "Title", emoji: "🏷️" },
  badge: { label: "Badge", emoji: "🏅" },
  stamp: { label: "Map Stamp", emoji: "📍" },
  emblem: { label: "Guild Emblem", emoji: "🛡️" },
  certificate: { label: "Certificate", emoji: "📜" },
  decoration: { label: "Decoration", emoji: "🪴" },
};
