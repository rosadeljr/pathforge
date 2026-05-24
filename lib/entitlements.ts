/**
 * Tier entitlements — single source of truth for what each plan unlocks.
 * Gate features off these helpers, never off a raw `subscription_tier` string.
 */

export type Tier = "free" | "pro" | "family";

export interface Entitlements {
  tier: Tier;
  /** ForgeBot tutor messages per day. -1 = unlimited. */
  forgeBotDailyMessages: number;
  /** Daily lesson cap for the learner. -1 = unlimited. */
  dailyLessonCap: number;
  /** Can pick & save a dream career goal. */
  canPickDreamCareer: boolean;
  /** Multiple kid profiles under one account (family plan). */
  multiKidProfiles: boolean;
  /** Parent dashboard with progress reports. */
  parentDashboard: boolean;
  prioritySupport: boolean;
}

const TIERS: Record<Tier, Entitlements> = {
  free: {
    tier: "free",
    forgeBotDailyMessages: 10,
    dailyLessonCap: 5,
    canPickDreamCareer: true,
    multiKidProfiles: false,
    parentDashboard: false,
    prioritySupport: false,
  },
  pro: {
    tier: "pro",
    forgeBotDailyMessages: -1,
    dailyLessonCap: -1,
    canPickDreamCareer: true,
    multiKidProfiles: false,
    parentDashboard: true,
    prioritySupport: true,
  },
  family: {
    tier: "family",
    forgeBotDailyMessages: -1,
    dailyLessonCap: -1,
    canPickDreamCareer: true,
    multiKidProfiles: true,
    parentDashboard: true,
    prioritySupport: true,
  },
};

export function getEntitlements(tier: string | null | undefined): Entitlements {
  const t: Tier = tier === "pro" || tier === "family" ? tier : "free";
  return TIERS[t];
}

export function isPaid(tier: string | null | undefined): boolean {
  return tier === "pro" || tier === "family";
}
