"use client";

/**
 * /learn — Forgeheart City. The town is the hero surface: PlayerHUD + section
 * nav over the ForgeheartTown isometric city (a single responsive SVG hub).
 */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlayerHUD } from "@/components/learn/rpg/PlayerHUD";
import { SectionNav } from "@/components/learn/rpg/GameShell";
import { ForgeheartTown } from "@/components/learn/rpg/ForgeheartTown";
import { DailyGoalsCard } from "@/components/learn/rpg/DailyGoalsCard";
import { usePlayerState } from "@/components/learn/rpg/usePlayerState";

export default function LearnHubPage() {
  const router = useRouter();
  const { ps, loading, error, needsSetup, refresh } = usePlayerState();

  // Signed in but never onboarded → send to setup (restores prior behavior).
  useEffect(() => {
    if (needsSetup) router.replace("/learn/setup");
  }, [needsSetup, router]);

  // Not signed in → send to login rather than showing an error wall.
  useEffect(() => {
    if (error === "Not signed in") router.replace("/login");
  }, [error, router]);

  if (loading || needsSetup) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/15 border-t-amber-400" />
          <p className="text-sm">Entering Forgeheart City…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-3 px-4 text-center">
        <span className="text-3xl">🗺️</span>
        <p className="text-sm text-slate-300">We couldn&apos;t load your adventure.</p>
        <button onClick={refresh} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15">
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-24 pt-3 sm:px-4 lg:pb-8">
      <PlayerHUD ps={ps} />
      <div className="sticky top-2 z-30 mt-3">
        <SectionNav active="town" />
      </div>
      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <ForgeheartTown ps={ps} />
        <div className="lg:order-last">
          <DailyGoalsCard streak={ps.streak} />
        </div>
      </div>
    </div>
  );
}
