/**
 * Avatar starter classes — cosmetic identity hook for learners.
 *
 * Picked once at setup. Persists on `profiles.learner_avatar_class`.
 * Pure cosmetic: no XP buff, no gameplay advantage, no microtransaction,
 * no random roll. Each class implies a vibe and ties loosely to a
 * subject the learner is likely to enjoy — but doesn't gate anything.
 *
 * Foundation for future unlockable outfits (capes, helmets, etc.)
 * earned through lesson completion / boss battle clears.
 */

export type AvatarClassId =
  | "scholar"
  | "explorer"
  | "inventor"
  | "guardian"
  | "storyteller";

export interface AvatarClass {
  id: AvatarClassId;
  name: string;
  emoji: string;
  tagline: string;
  vibe: string;
  /** Color hint used for borders/glows around the avatar. */
  accent: string;
  /** Subjects this class loosely aligns with — purely for picker copy. */
  loves: string[];
}

export const AVATAR_CLASSES: AvatarClass[] = [
  {
    id: "scholar",
    name: "The Scholar",
    emoji: "📚",
    tagline: "Curious. Sharp. Always asking why.",
    vibe: "Loves figuring things out. Reads everything. Asks the best questions.",
    accent: "#6366f1", // indigo
    loves: ["Math", "English"],
  },
  {
    id: "explorer",
    name: "The Explorer",
    emoji: "🧭",
    tagline: "Adventurous. Bold. Loves discovering new places.",
    vibe: "Wants to see the world. Loves maps, history, and PH heroes.",
    accent: "#10b981", // emerald
    loves: ["History", "Geography"],
  },
  {
    id: "inventor",
    name: "The Inventor",
    emoji: "🛠️",
    tagline: "Builder. Tinkerer. Future engineer or scientist.",
    vibe: "Loves taking things apart, building stuff, and asking 'what if?'",
    accent: "#f59e0b", // amber
    loves: ["Science", "Math"],
  },
  {
    id: "guardian",
    name: "The Guardian",
    emoji: "🛡️",
    tagline: "Kind. Brave. Looks out for others.",
    vibe: "Helps classmates. Cares about people and the planet.",
    accent: "#06b6d4", // cyan
    loves: ["Values", "Science"],
  },
  {
    id: "storyteller",
    name: "The Storyteller",
    emoji: "🎭",
    tagline: "Creative. Expressive. Loves words and pictures.",
    vibe: "Writes, draws, performs. Makes everything come alive.",
    accent: "#ec4899", // pink
    loves: ["English", "Filipino"],
  },
];

export function getAvatarClass(id: string | null | undefined): AvatarClass | null {
  if (!id) return null;
  return AVATAR_CLASSES.find((c) => c.id === id) || null;
}
