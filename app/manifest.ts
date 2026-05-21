import type { MetadataRoute } from "next";

/**
 * PWA manifest — controls how PathForge appears when added to a phone's
 * home screen (icon, name, splash colors, standalone display).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PathForge — Career growth, gamified",
    short_name: "PathForge",
    description:
      "Personalized roadmaps, daily quests, and Jus AI — your career coach. Forge the career you actually want.",
    start_url: "/dashboard",
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
