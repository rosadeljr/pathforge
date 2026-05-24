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

// AI Tutor (ForgeBot)
export const MentorMessageSchema = z.object({
  message: z.string().min(1, "Message is required"),
  context: z.record(z.string(), z.any()).optional(),
});

export type SignUpInput = z.infer<typeof SignUpSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type MentorMessageInput = z.infer<typeof MentorMessageSchema>;
