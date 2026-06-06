"use client";

/**
 * PlayerHUD — the top command-center bar: character identity, rank, level + XP,
 * class/job, coins, and streak. Data-driven from PlayerState.
 */

import { Coins, Flame, Star } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { Panel, StatPill } from "./primitives";
import { LevelProgressBar } from "./LevelProgressBar";

export function PlayerHUD({ ps }: { ps: PlayerState }) {
  const accent = ps.cls?.accent ?? ps.rank.accent;
  return (
    <Panel accent={accent} glow className="px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* identity crest */}
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl text-2xl"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${accent}44, rgba(8,11,18,0.8))`,
              border: `1px solid ${accent}88`,
              boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
          >
            {ps.cls?.emoji ?? ps.rank.emoji}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-base font-bold tracking-tight text-white">{ps.name}</h2>
              <span
                className="hidden rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline"
                style={{ background: `${ps.rank.accent}22`, color: ps.rank.accent, border: `1px solid ${ps.rank.accent}55` }}
              >
                {ps.rank.emoji} {ps.rank.title}
              </span>
            </div>
            <p className="truncate text-xs text-slate-400">
              {ps.cls ? (
                <>
                  <span style={{ color: accent }}>{ps.classTitle?.title ?? ps.cls.name}</span> · Class Lv {ps.classLevel}
                </>
              ) : (
                "Choose your class to begin"
              )}
            </p>
          </div>
        </div>

        {/* XP bar (grows) */}
        <div className="order-last w-full min-w-[180px] flex-1 sm:order-none sm:w-auto">
          <div className="mb-1 flex items-center justify-between text-[11px]">
            <span className="font-semibold text-white">Lv {ps.characterLevel}</span>
            <span className="tabular-nums text-slate-400">
              {ps.level.intoLevel.toLocaleString()} / {ps.level.span.toLocaleString()} XP
            </span>
          </div>
          <LevelProgressBar pct={ps.level.pct} accent={accent} />
        </div>

        {/* stats */}
        <div className="flex items-center gap-2">
          <StatPill icon={<Coins size={14} />} value={ps.coins.toLocaleString()} label="Coins" accent="#fbbf24" />
          <StatPill icon={<Flame size={14} />} value={ps.streak} label="Streak" accent="#fb923c" />
          <div className="hidden sm:block">
            <StatPill icon={<Star size={14} />} value={ps.totalXp.toLocaleString()} label="Total XP" accent="#a78bfa" />
          </div>
        </div>
      </div>
    </Panel>
  );
}
