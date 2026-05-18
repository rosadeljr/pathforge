import { z } from "zod";

// Auth
export const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  full_name: z.string().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

// Onboarding
export const OnboardingSchema = z.object({
  career_path_id: z.string().uuid(),
  current_skill_level: z.enum(["beginner", "intermediate", "advanced"]),
  target_salary_min: z.number().min(0),
  target_salary_max: z.number().min(0),
  target_timeline_months: z.number().min(1).max(120),
  weekly_availability_hours: z.number().min(1).max(168),
  primary_goal: z.string(),
});

// Quest
export const CompleteQuestSchema = z.object({
  quest_id: z.string().uuid(),
  proof_url: z.string().url().optional(),
  proof_notes: z.string().optional(),
});

// Project
export const CreateProjectSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  project_url: z.string().url().optional(),
  github_url: z.string().url().optional(),
  proof_url: z.string().url().optional(),
  skills_used: z.array(z.string()),
  lessons_learned: z.string().optional(),
});

// AI Mentor
export const MentorMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  context: z.record(z.string(), z.any()).optional(),
});

// Readiness Score
export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type OnboardingInput = z.infer<typeof OnboardingSchema>;
export type CompleteQuestInput = z.infer<typeof CompleteQuestSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type MentorMessageInput = z.infer<typeof MentorMessageSchema>;
