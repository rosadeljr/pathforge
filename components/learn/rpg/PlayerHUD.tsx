"use client";

/**
 * PlayerHUD — a premium game HUD: hero crest with level badge, identity + rank,
 * a segmented glowing XP bar with rank progress, and glowing resource chips
 * (coins / streak / total XP). Data-driven from PlayerState; matches the
 * futuristic world styling.
 */

import { Coins, Flame, Star } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";

export function PlayerHUD({ ps }: { ps: PlayerState }) {
  const accent = ps.cls?.accent ?? ps.rank.accent;
  return (
    <div
      className="relative overflow-hidden rounded-2xl px-3 py-3 sm:px-4"
      style={{
        background: "linear-gradient(180deg, rgba(22,32,52,0.92), rgba(8,13,22,0.92))",
        border: "1px solid rgba(56,189,248,0.22)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px -16px #000, 0 0 0 1px rgba(0,0,0,0.3)`,
      }}
    >
      {/* neon top hairline */}
      <span aria-hidden className="pointer-events-none absolute inset-x-4 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.8 }} />
      {/* corner ticks */}
      <span aria-hidden className="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 rounded-tl-lg" style={{ borderTop: `2px solid ${accent}66`, borderLeft: `2px solid ${accent}66` }} />
      <span aria-hidden className="pointer-events-none absolute right-1.5 top-1.5 h-3 w-3 rounded-tr-lg" style={{ borderTop: `2px solid ${accent}66`, borderRight: `2px solid ${accent}66` }} />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        {/* crest */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex-shrink-0">
            <div
              className="grid h-14 w-14 place-items-center rounded-2xl text-2xl"
              style={{
                background: `radial-gradient(circle at 50% 35%, ${accent}55, rgba(8,11,18,0.9))`,
                border: `2px solid ${accent}`,
                boxShadow: `0 0 18px ${accent}77, inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              {ps.cls?.emoji ?? ps.rank.emoji}
            </div>
            {/* level badge */}
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-black text-slate-900"
              style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: "0 2px 6px rgba(0,0,0,0.5)" }}
            >
              LV {ps.characterLevel}
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="truncate font-display text-base font-bold tracking-tight text-white">{ps.name}</h2>
              <span
                className="hidden flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold sm:inline"
                style={{ background: `${ps.rank.accent}22`, color: ps.rank.accent, border: `1px solid ${ps.rank.accent}66` }}
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

        {/* XP bar */}
        <div className="order-last w-full min-w-[200px] flex-1 sm:order-none sm:w-auto">
          <div className="mb-1 flex items-end justify-between text-[11px]">
            <span className="font-bold text-white">
              XP <span className="tabular-nums text-slate-400">{ps.level.intoLevel.toLocaleString()} / {ps.level.span.toLocaleString()}</span>
            </span>
            <span className="text-[10px] text-slate-500">
              {ps.nextRank ? `Next rank: ${ps.nextRank.title}` : "Max rank"}
            </span>
          </div>
          <SegmentedXP pct={ps.level.pct} accent={accent} />
        </div>

        {/* resource chips */}
        <div className="flex items-center gap-2">
          <ResChip icon={<Coins size={14} />} value={ps.coins.toLocaleString()} label="Coins" accent="#fbbf24" />
          <ResChip icon={<Flame size={14} />} value={ps.streak} label="Streak" accent="#fb923c" />
          <div className="hidden md:block">
            <ResChip icon={<Star size={14} />} value={ps.totalXp.toLocaleString()} label="Total XP" accent="#a78bfa" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SegmentedXP({ pct, accent }: { pct: number; accent: string }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div
      className="relative h-3 w-full overflow-hidden rounded-full"
      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.10)" }}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700"
        style={{ width: `${clamped}%`, background: `linear-gradient(90deg, ${accent}, ${accent}dd)`, boxShadow: `0 0 12px ${accent}` }}
      >
        <span aria-hidden className="absolute inset-y-0 right-0 w-6 opacity-70" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7))" }} />
      </div>
      {/* segment ticks */}
      <div aria-hidden className="absolute inset-0 flex justify-between px-[10%]">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="my-auto h-2 w-px" style={{ background: "rgba(255,255,255,0.18)" }} />
        ))}
      </div>
    </div>
  );
}

function ResChip({ icon, value, label, accent }: { icon: React.ReactNode; value: React.ReactNode; label: string; accent: string }) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-2 py-1.5"
      style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${accent}33`, boxShadow: `0 0 10px ${accent}1f` }}
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${accent}22`, color: accent, boxShadow: `inset 0 0 8px ${accent}33` }}>
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-sm font-bold tabular-nums text-white">{value}</div>
        <div className="text-[9px] uppercase tracking-wide text-slate-400">{label}</div>
      </div>
    </div>
  );
}
