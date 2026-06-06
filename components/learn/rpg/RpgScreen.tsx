"use client";

/**
 * RpgScreen — shared wrapper that loads PlayerState and renders the GameShell
 * with a given active section. The center stage is provided via a render prop so
 * each route can use ps + class actions.
 */

import type { ReactNode } from "react";
import { GameShell, type SectionKey } from "./GameShell";
import { usePlayerState } from "./usePlayerState";
import type { PlayerState } from "@/lib/rpg/state";
import type { ClassId } from "@/lib/data/rpg-classes";

export interface RpgScreenApi {
  ps: PlayerState;
  selectClass: (id: ClassId) => void;
  saving: boolean;
  refresh: () => void;
}

export function RpgScreen({ active, children }: { active: SectionKey; children: (api: RpgScreenApi) => ReactNode }) {
  const { ps, loading, error, saving, refresh, selectClass } = usePlayerState();

  if (loading) {
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
        <p className="text-xs text-slate-500">{error}</p>
        <button onClick={refresh} className="rounded-xl bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15">
          Try again
        </button>
      </div>
    );
  }

  return (
    <GameShell ps={ps} active={active}>
      {children({ ps, selectClass, saving, refresh })}
    </GameShell>
  );
}
