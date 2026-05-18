// Streak management logic

export function updateStreak(
  lastCompletionDate: string | null,
  currentStreak: number,
  currentDate: string
): { newStreak: number; broken: boolean } {
  if (!lastCompletionDate) {
    return { newStreak: 1, broken: false };
  }

  const last = new Date(lastCompletionDate);
  const today = new Date(currentDate);

  // Reset time to midnight for comparison
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const daysDiff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    // Same day, no change
    return { newStreak: currentStreak, broken: false };
  } else if (daysDiff === 1) {
    // Consecutive day
    return { newStreak: currentStreak + 1, broken: false };
  } else {
    // Streak broken
    return { newStreak: 1, broken: true };
  }
}

export function getStreakMilestones(): Array<{ days: number; reward: number; title: string }> {
  return [
    { days: 7, reward: 100, title: "Week Warrior" },
    { days: 14, reward: 250, title: "Fortnight Fighter" },
    { days: 30, reward: 500, title: "Monthly Master" },
    { days: 60, reward: 1000, title: "Two-Month Titan" },
    { days: 100, reward: 2000, title: "Century Champion" },
    { days: 365, reward: 5000, title: "Legendary Legend" },
  ];
}

export function getStreakRiskAlert(streak: number): string | null {
  if (streak > 0 && streak % 5 === 0) {
    return `🔥 You're on fire with a ${streak}-day streak! Keep it going!`;
  }
  if (streak >= 30) {
    return `💎 Incredible consistency! ${streak} days strong!`;
  }
  return null;
}
