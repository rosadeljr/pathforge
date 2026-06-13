"use client";

/**
 * HubGreeting — a warm, personal welcome on the town hub, in the ForgeBot
 * voice ("like a kind kuya or ate"). Greets the kid by name with a time-of-day
 * Tagalog greeting and a streak-aware nudge, with the tone scaled to their age
 * tier. Pure client render from PlayerState — no fetch. Makes the hub feel like
 * someone's happy you showed up.
 */

import { useMemo } from "react";
import { Flame } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { ageTierForGrade } from "@/lib/data/learner";

export function HubGreeting({ ps }: { ps: PlayerState }) {
  // Computed once on the client (the hub only renders post-load, so no SSR
  // hydration mismatch from the local clock).
  const { greeting, emoji, nudge, accent } = useMemo(() => {
    const h = new Date().getHours();
    const tod =
      h < 12
        ? { greeting: "Magandang umaga", emoji: "🌅" }
        : h < 18
        ? { greeting: "Magandang hapon", emoji: "☀️" }
        : { greeting: "Magandang gabi", emoji: "🌙" };

    const tier = ageTierForGrade(ps.grade);
    const streak = ps.streak ?? 0;

    let nudge: string;
    let accent = "#fcd34d";
    if (streak >= 7) {
      nudge = `🔥 ${streak}-day streak — ang husay! You're unstoppable.`;
      accent = "#fb923c";
    } else if (streak >= 1) {
      nudge = `🔥 ${streak}-day streak going — keep it alive today!`;
      accent = "#fb923c";
    } else {
      nudge =
        tier === "little"
          ? "Tara, let's play and learn! 🎮"
          : tier === "junior"
          ? "Start a quest to kick off a new streak."
          : "One quick lesson gets your streak going.";
    }
    return { ...tod, nudge, accent };
  }, [ps.grade, ps.streak]);

  const firstName = (ps.name || "Forger").split(" ")[0];

  return (
    <div className="mb-3 flex items-center gap-3">
      <span aria-hidden className="text-2xl">{emoji}</span>
      <div className="min-w-0">
        <h1 className="truncate font-display text-lg font-black tracking-tight text-white sm:text-xl">
          {greeting}, {firstName}!
        </h1>
        <p className="flex items-center gap-1 truncate text-xs sm:text-[13px]" style={{ color: ps.streak ? accent : "#94a3b8" }}>
          {ps.streak ? <Flame size={12} className="flex-shrink-0" /> : null}
          <span className="truncate">{nudge.replace(/^🔥\s*/, "")}</span>
        </p>
      </div>
    </div>
  );
}
