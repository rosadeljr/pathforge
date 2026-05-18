import { Profile, UserSkill, Project } from "@/types";

export type ReadinessScoreBreakdown = {
  questCompletion: number;
  skillMastery: number;
  portfolioProof: number;
  consistency: number;
  interviewPrep: number;
  totalScore: number;
};

export function calculateReadinessScore(
  questsCompleted: number,
  skills: UserSkill[],
  projects: Project[],
  streak: number,
  interviewPrep: number = 0
): ReadinessScoreBreakdown {
  // Quest Completion: 25%
  // Assume 0-100 quests is reasonable range
  const questScore = Math.min((questsCompleted / 50) * 100, 100);

  // Skill Mastery: 25%
  // Average mastery across all unlocked skills
  const unlockedSkills = skills.filter((s) => s.unlocked);
  const skillScore =
    unlockedSkills.length > 0
      ? (unlockedSkills.reduce((acc, s) => acc + s.mastery_percentage, 0) /
          unlockedSkills.length) * 0.25
      : 0;

  // Portfolio Proof: 25%
  const verifiedProjects = projects.filter((p) => p.status === "verified").length;
  const portfolioScore = Math.min((verifiedProjects / 5) * 100, 100);

  // Consistency: 15%
  // Streak of 7 days = 50%, 30 days = 100%
  const consistencyScore = Math.min((streak / 30) * 100, 100);

  // Interview Prep: 10%
  const interviewScore = interviewPrep;

  const totalScore = Math.round(
    (questScore * 0.25 +
      (skillScore / 0.25) * 0.25 +
      portfolioScore * 0.25 +
      consistencyScore * 0.15 +
      interviewScore * 0.1) /
      1
  );

  return {
    questCompletion: Math.round(questScore),
    skillMastery: Math.round(skillScore / 0.25),
    portfolioProof: Math.round(portfolioScore),
    consistency: Math.round(consistencyScore),
    interviewPrep: Math.round(interviewScore),
    totalScore: Math.min(totalScore, 100),
  };
}

export function getReadinessRecommendation(breakdown: ReadinessScoreBreakdown): string {
  const weakest = Object.entries(breakdown)
    .filter(([key]) => key !== "totalScore")
    .reduce((min, [key, value]) => (value < min[1] ? [key, value] : min));

  const recommendations: Record<string, string> = {
    questCompletion: "Focus on completing more daily quests to build momentum.",
    skillMastery: "Deepen your skills by practicing and building projects.",
    portfolioProof: "Ship more portfolio projects to prove your capabilities.",
    consistency: "Maintain your daily streak—consistency is your strongest asset.",
    interviewPrep: "Start preparing for interviews with mock questions and practice.",
  };

  return recommendations[weakest[0]] || "Keep building and stay consistent!";
}
