import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";
import { AppToaster } from "@/components/ui/AppToaster";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "PathForge — Forge the career you actually want",
  description:
    "Personalized roadmaps, daily quests, and an AI mentor. Built for the ambitious — anywhere in the world.",
  openGraph: {
    title: "PathForge — Forge the career you actually want",
    description:
      "Personalized roadmaps, daily quests, and an AI mentor. Built for the ambitious.",
    siteName: "PathForge",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable}`}
      data-theme="dark"
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
