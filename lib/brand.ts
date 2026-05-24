/**
 * Brand constants for PathForge.
 * Update here = update everywhere.
 */

export const BRAND = {
  productName: "PathForge",
  companyName: "ZenForge Technologies",
  domain: "pathforger.app",
  contact: {
    support: "support@pathforger.app",
    privacy: "privacy@pathforger.app",
    legal: "legal@pathforger.app",
  },
} as const;

/**
 * AI assistant personality.
 * "ForgeBot" — kid-safe tutor that adapts to the learner's age tier.
 * Real prompt + tone live in app/api/ai-mentor/route.ts.
 */
export const AI_ASSISTANT = {
  name: "ForgeBot",
  shortName: "ForgeBot",
  tagline: "Your friendly AI tutor",
  description:
    "ForgeBot is your kid-safe AI tutor on PathForge. Ask it anything about Math, English, Filipino, Science, or Araling Panlipunan — it adapts to your grade and explains things step-by-step.",
  voice: {
    style: "Warm, patient, age-appropriate. Like a kind kuya or ate.",
    avoid: "Anything unsafe for kids. Corporate-speak. Long lectures.",
    use: "Simple examples, encouragement, step-by-step thinking.",
  },
  greetings: [
    "Hi! I'm ForgeBot. What do you want to learn today?",
    "ForgeBot here. Got a question for me?",
    "Hey friend — I'm here to help you learn. What's up?",
  ],
} as const;
