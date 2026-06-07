import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated app + internal routes shouldn't be indexed.
      disallow: [
        "/api/",
        "/admin",
        "/learn",
        "/mentor",
        "/friends",
        "/achievements",
        "/leaderboard",
        "/settings",
      ],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
