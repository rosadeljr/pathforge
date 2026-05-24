import type { MetadataRoute } from "next";

/**
 * PWA manifest — controls how PathForge appears when added to a phone's
 * home screen. Designed for kid + parent install experience.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/learn",
    name: "PathForge — K-10 learning, gamified",
    short_name: "PathForge",
    description:
      "Fun, interactive K-10 lessons for Filipino kids ages 6–15. Quests, streaks, careers to unlock, and a kid-safe AI tutor.",
    start_url: "/learn",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    lang: "en-PH",
    dir: "ltr",
    categories: ["education", "kids", "productivity", "lifestyle"],
    icons: [
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    // Quick actions when long-pressing the home-screen icon (Android + supported PWAs)
    shortcuts: [
      {
        name: "Today's lesson",
        short_name: "Lesson",
        description: "Jump into today's mission",
        url: "/learn",
        icons: [{ src: "/icon", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Ask ForgeBot",
        short_name: "Tutor",
        description: "Chat with your AI tutor",
        url: "/mentor",
        icons: [{ src: "/icon", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Explore careers",
        short_name: "Careers",
        description: "Discover your dream career",
        url: "/learn/careers",
        icons: [{ src: "/icon", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
