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
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://pathforger.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "PathForge — Where kids forge their future",
    template: "%s · PathForge",
  },
  description:
    "Fun, interactive K-12 lessons for Filipino kids ages 6–18. Quests, streaks, careers to unlock, and a kid-safe AI tutor. Built for Filipino families.",
  applicationName: "PathForge",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "PathForge",
    statusBarStyle: "black-translucent",
    startupImage: ["/apple-icon"],
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    title: "PathForge — Where kids forge their future",
    description:
      "K-12 learning, gamified · Ages 6–18 · Built for Filipino students.",
    siteName: "PathForge",
    type: "website",
    locale: "en_PH",
  },
  twitter: {
    card: "summary_large_image",
    title: "PathForge — Where kids forge their future",
    description: "K-12 learning, gamified. Filipino-built. Ages 6–18.",
  },
  keywords: [
    "PathForge",
    "Filipino kids learning",
    "K-12 Philippines",
    "kids education app",
    "AI tutor for kids",
    "gamified learning",
    "Math English Filipino Science Araling Panlipunan",
    "career exploration for kids",
  ],
  authors: [{ name: "ZenForge Technologies" }],
  creator: "ZenForge Technologies",
  publisher: "ZenForge Technologies",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-PH"
      className={`dark ${inter.variable}`}
      data-theme="dark"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* iOS PWA full-screen support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="PathForge" />
        {/* Prevent iOS auto-zoom when focusing inputs */}
        <meta
          name="format-detection"
          content="telephone=no, email=no, address=no, date=no"
        />
        {/* Lock dark theme — kids' app is dark-only. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                document.documentElement.setAttribute('data-theme', 'dark');
                document.documentElement.classList.add('dark');
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
