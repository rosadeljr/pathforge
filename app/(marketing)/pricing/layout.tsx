import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "PathForge plans for Filipino families — Free, Pro, and Family. Unlock more quests, careers, certificates, and the kid-safe AI tutor. Ages 6–15.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "PathForge Pricing — Free, Pro & Family plans",
    description: "Start free. Upgrade for more quests, careers, and the kid-safe AI tutor.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
