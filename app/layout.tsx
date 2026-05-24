import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/ui/AppToaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Canonical origin — set NEXT_PUBLIC_APP_URL in Vercel if a custom domain is used.
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pathforge-zeta.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "PathForge — Where kids forge their future",
  description:
    "Fun, interactive K-12 lessons for Filipino kids ages 6–18. Quests, streaks, careers to unlock, and a kid-safe AI tutor. Built for Filipino families.",
  applicationName: "PathForge",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PathForge",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "PathForge — Where kids forge their future",
    description:
      "K-12 learning, gamified · Ages 6–18 · Built for Filipino students.",
    siteName: "PathForge",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathForge — Where kids forge their future",
    description: "K-12 learning, gamified. Filipino-built. Ages 6–18.",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable}`}
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Inline script to set theme BEFORE first paint — avoids FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const t = localStorage.getItem('pathforge-theme') || 'dark';
                document.documentElement.setAttribute('data-theme', t);
                if (t === 'dark') document.documentElement.classList.add('dark');
                else document.documentElement.classList.remove('dark');
              } catch {}
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased">
        <ThemeProvider>
          {children}
          <AppToaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
