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
 * "ForgeBot" — your no-fluff career bestie. Direct, warm, action-oriented.
 */
export const AI_ASSISTANT = {
  name: "ForgeBot",
  shortName: "ForgeBot",
  tagline: "Your no-fluff career coach",
  description:
    "ForgeBot knows your goals, your level, and what you've been working on. Ask anything — career advice, project ideas, what to learn next, or just talk it out.",
  voice: {
    style: "Direct, warm, specific. Like a friend who's been there.",
    avoid: "Corporate-speak, generic motivation, hedging.",
    use: "Specific examples, real numbers, action items.",
  },
  greetings: [
    "Hey, I'm ForgeBot. What are you working on?",
    "ForgeBot here. What's on your mind?",
    "I'm ForgeBot — your career bestie that actually says useful stuff. What's up?",
  ],
} as const;
