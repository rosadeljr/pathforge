// XP calculation and level progression

const LEVEL_BASE = 100;
const LEVEL_EXPONENT = 1.45;

export function calculateRequiredXP(level: number): number {
  return Math.floor(LEVEL_BASE * Math.pow(level, LEVEL_EXPONENT));
}

export function getTotalXPForLevel(level: number): number {
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += calculateRequiredXP(i);
  }
  return total;
}

export function calculateLevelFromTotalXP(totalXP: number): {
  level: number;
  currentXP: number;
  requiredForNext: number;
  progressPercentage: number;
} {
  let level = 1;
  let accumulatedXP = 0;

  while (true) {
    const nextLevelXP = calculateRequiredXP(level);
    if (accumulatedXP + nextLevelXP > totalXP) {
      const currentXP = totalXP - accumulatedXP;
      const progressPercentage = (currentXP / nextLevelXP) * 100;
      return {
        level,
        currentXP,
        requiredForNext: nextLevelXP,
        progressPercentage,
      };
    }
    accumulatedXP += nextLevelXP;
    level++;
  }
}

export function getLevelTitle(level: number): string {
  if (level < 5) return "Novice";
  if (level < 15) return "Apprentice";
  if (level < 30) return "Specialist";
  if (level < 50) return "Expert";
  if (level < 100) return "Master";
  return "Legendary";
}

export function getQuestXPReward(difficulty: "easy" | "medium" | "hard" | "boss"): number {
  const rewards = {
    easy: 50,
    medium: 150,
    hard: 350,
    boss: 1000,
  };
  return rewards[difficulty];
}

export function calculateXPDeltaForReadiness(questDifficulty: string): number {
  const mapping: Record<string, number> = {
    easy: 2,
    medium: 5,
    hard: 12,
    boss: 30,
  };
  return mapping[questDifficulty] || 2;
}
