"use client";

/**
 * LockedContentOverlay — a frosted lock layer for gated maps/quests/skills.
 * Shows WHY it's locked (level / prerequisite / tier) and a clear next action.
 */

import Link from "next/link";
import { Lock } from "lucide-react";

export function LockedContentOverlay({
  reasons,
  showUpgrade = false,
  compact = false,
}: {
  reasons: string[];
  showUpgrade?: boolean;
  compact?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-2xl p-3 text-center"
      style={{ background: "rgba(8,11,18,0.72)", backdropFilter: "blur(3px)" }}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-200">
        <Lock size={16} />
      </span>
      {!compact && <p className="text-xs font-semibold text-slate-200">Locked</p>}
      <ul className="space-y-0.5">
        {reasons.slice(0, compact ? 1 : 3).map((reason, i) => (
          <li key={i} className="text-[11px] text-slate-400">
            {reason}
          </li>
        ))}
      </ul>
      {showUpgrade && (
        <Link
          href="/pricing"
          className="mt-1 rounded-full bg-amber-400/90 px-3 py-1 text-[11px] font-bold text-slate-900 transition hover:bg-amber-300"
        >
          Unlock with Pro
        </Link>
      )}
    </div>
  );
}
