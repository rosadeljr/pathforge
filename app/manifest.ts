import type { MetadataRoute } from "next";

/**
 * PWA manifest — controls how PathForge appears when added to a phone's
 * home screen (icon, name, splash colors, standalone display).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PathForge — K-12 learning, gamified",
    short_name: "PathForge",
    description:
      "Fun, interactive K-12 lessons for Filipino kids ages 6–18. Quests, streaks, mascots, and a kid-safe AI tutor.",
    start_url: "/learn",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    categories: ["education", "productivity", "lifestyle"],
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
  };
}
