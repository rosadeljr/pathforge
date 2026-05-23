import type { MetadataRoute } from "next";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pathforge-zeta.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app + internal routes shouldn't be indexed.
      disallow: [
        "/api/",
        "/admin",
        "/welcome",
        "/learn",
        "/dashboard",
        "/quests",
        "/roadmap",
        "/academy",
        "/resume",
        "/mock-interview",
        "/mentor",
        "/portfolio",
        "/achievements",
        "/leaderboard",
        "/settings",
        "/onboarding",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
