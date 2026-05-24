/**
 * Career Mastery Certificates
 *
 * Auto-awarded when a learner crosses the final stage of any career
 * adventure (total_xp >= max(career.xpToUnlock, 1500)).
 *
 * Used client-side in the lesson player + server-side in any flow
 * that mutates total_xp.
 */

import { CAREERS, getStages, type Career } from "@/lib/data/careers";

export interface CareerCertificate {
  id: string;
  user_id: string;
  career_id: string;
  credential_code: string;
  recipient_name: string;
  career_title: string;
  total_xp_at_award: number;
  awarded_at: string;
}

/** Returns true if the learner has reached the final stage of this career. */
export function hasMasteredCareer(career: Career, totalXp: number): boolean {
  const stages = getStages(career);
  const last = stages[stages.length - 1];
  return totalXp >= last.xpRequired;
}

/** Generate a short, human-readable credential code like "PF-AI-X7Y9Z2". */
export function generateCredentialCode(careerId: string): string {
  const slug = careerId.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "FORG";
  const random = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  return `PF-${slug}-${random}`;
}

/**
 * Returns all careers the learner has mastered (reached final stage) but
 * does NOT yet have a certificate for. Used for auto-awarding on XP change.
 */
export function newlyMasteredCareers(
  totalXp: number,
  existingCertCareerIds: string[]
): Career[] {
  const have = new Set(existingCertCareerIds);
  return CAREERS.filter((c) => hasMasteredCareer(c, totalXp) && !have.has(c.id));
}
