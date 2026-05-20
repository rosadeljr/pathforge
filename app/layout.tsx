import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "PathForge — Forge the career you actually want",
  description:
    "Personalized roadmaps, daily quests, and an AI mentor. Built for ambitious Filipinos and the Gen Z freelance economy.",
  openGraph: {
    title: "PathForge — Forge the career you actually want",
    description:
      "Personalized roadmaps, daily quests, and an AI mentor. Built for ambitious Filipinos.",
    siteName: "PathForge",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
