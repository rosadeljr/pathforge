/**
 * Tier entitlements — the single source of truth for what each plan unlocks.
 * Gate features off these helpers, never off a raw `subscription_tier` string.
 */

export type Tier = "free" | "pro" | "elite";

export interface Entitlements {
  tier: Tier;
  /** Max active quests at once. -1 = unlimited. */
  maxActiveQuests: number;
  /** Career paths a user can pursue. -1 = unlimited. */
  maxCareerPaths: number;
  /** ForgeBot messages per day. -1 = unlimited. */
  forgeBotDailyMessages: number;
  /** Can download + share the PathForge AI Academy certificate. */
  canDownloadCertificate: boolean;
  /** Can export the built resume to PDF (everyone can build & preview). */
  canExportResume: boolean;
  /** Resume optimizer + interview prep tools (Elite). */
  resumeTools: boolean;
  prioritySupport: boolean;
}

const TIERS: Record<Tier, Entitlements> = {
  free: {
    tier: "free",
    maxActiveQuests: 8,
    maxCareerPaths: 1,
    forgeBotDailyMessages: 10,
    canDownloadCertificate: false,
    canExportResume: false,
    resumeTools: false,
    prioritySupport: false,
  },
  pro: {
    tier: "pro",
    maxActiveQuests: -1,
    maxCareerPaths: -1,
    forgeBotDailyMessages: -1,
    canDownloadCertificate: true,
    canExportResume: true,
    resumeTools: false,
    prioritySupport: true,
  },
  elite: {
    tier: "elite",
    maxActiveQuests: -1,
    maxCareerPaths: -1,
    forgeBotDailyMessages: -1,
    canDownloadCertificate: true,
    canExportResume: true,
    resumeTools: true,
    prioritySupport: true,
  },
};

export function getEntitlements(tier: string | null | undefined): Entitlements {
  const t: Tier = tier === "pro" || tier === "elite" ? tier : "free";
  return TIERS[t];
}

export function isPaid(tier: string | null | undefined): boolean {
  return tier === "pro" || tier === "elite";
}

/**
 * Completed quests required (within a career path) to earn that path's
 * PathForge AI Academy certificate.
 */
export const CERTIFICATE_QUEST_THRESHOLD = 12;
