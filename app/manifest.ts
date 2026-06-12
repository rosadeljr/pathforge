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
    // ?source=pwa lets analytics distinguish installed-app sessions.
    start_url: "/learn?source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    lang: "en-PH",
    dir: "ltr",
    categories: ["education", "kids", "productivity", "lifestyle"],
    prefer_related_applications: false,
    // Focus the already-open app window instead of spawning duplicates.
    launch_handler: { client_mode: ["navigate-existing", "auto"] },
    // Real in-game art — shown in the richer Chrome/Android install dialog.
    screenshots: [
      {
        src: "/screenshots/town-wide.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Forgeheart City — your learning hub",
      },
      {
        src: "/screenshots/town-narrow.png",
        sizes: "720x1280",
        type: "image/png",
        form_factor: "narrow",
        label: "Quests, careers, and a kid-safe arena",
      },
    ],
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
