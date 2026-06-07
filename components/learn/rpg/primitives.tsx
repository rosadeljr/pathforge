"use client";

/**
 * RPG UI primitives — original "game surface" building blocks shared across the
 * PathForge RPG screens. Beveled panels with layered borders + inner highlights
 * (no SaaS cards, no decorative blob gradients). Lightweight CSS only.
 */

import { forwardRef, type ReactNode } from "react";

/** A beveled game panel: layered ring, inner top highlight, soft inner shadow. */
export const Panel = forwardRef<
  HTMLDivElement,
  {
    children: ReactNode;
    accent?: string;
    className?: string;
    glow?: boolean;
    as?: "div" | "section" | "article";
  }
>(function Panel({ children, accent = "#38bdf8", className = "", glow = false }, ref) {
  return (
    <div
      ref={ref}
      className={`relative rounded-2xl ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 18%, rgba(8,11,18,0.6) 100%)",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: glow
          ? `inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(0,0,0,0.4), 0 10px 30px -12px ${accent}66`
          : "inset 0 1px 0 rgba(255,255,255,0.10), 0 6px 18px -10px rgba(0,0,0,0.7)",
      }}
    >
      {/* accent top hairline */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 top-0 h-px rounded-full opacity-70"
        style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
      />
      {children}
    </div>
  );
});

/** One live metric shown in a ScreenIntro stat strip. */
export interface ScreenStat {
  icon?: ReactNode;
  value: ReactNode;
  label: string;
}

/**
 * ScreenIntro — a sleek "mission console" header shown atop each RPG screen
 * (Quests / Skills / Arena …). Deep panel with a left accent spine, a faint
 * holo-grid, a framed tech-badge icon, an uppercase section label, a bold title
 * and a confident one-line brief. Optionally carries a live stat strip + a
 * progress bar so each header doubles as an at-a-glance dashboard. Tuned to read
 * for ages 7–15 — game-UI, not a toddler app — while staying part of Forgeheart.
 */
export function ScreenIntro({
  emoji,
  title,
  blurb,
  accent = "#7c5cff",
  eyebrow,
  chips,
  right,
  stats,
  progress,
}: {
  emoji: ReactNode;
  title: string;
  blurb: string;
  accent?: string;
  eyebrow?: string;
  chips?: ReactNode;
  right?: ReactNode;
  stats?: ScreenStat[];
  progress?: { pct: number; label: string };
}) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-4 pl-5 sm:p-5 sm:pl-6"
      style={{
        background:
          "linear-gradient(120deg, rgba(13,18,30,0.96) 0%, rgba(10,14,24,0.92) 55%, rgba(8,11,20,0.9) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), 0 14px 36px -22px ${accent}99`,
      }}
    >
      {/* left accent spine */}
      <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-[3px]" style={{ background: `linear-gradient(180deg, ${accent}, ${accent}33)` }} />
      {/* one-corner accent glow */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-25 blur-2xl" style={{ background: accent }} />
      {/* faint holo grid */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
          maskImage: "radial-gradient(120% 90% at 100% 0%, #000 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(120% 90% at 100% 0%, #000 0%, transparent 70%)",
        }}
      />

      <div className="relative flex items-center gap-3 sm:gap-4">
        {/* tech-badge icon: diamond accent ring behind a framed tile */}
        <span className="relative grid h-14 w-14 flex-shrink-0 place-items-center sm:h-[60px] sm:w-[60px]">
          <span aria-hidden className="absolute inset-1 rotate-45 rounded-[10px] opacity-60" style={{ border: `1.5px solid ${accent}` }} />
          <span
            className="grid h-11 w-11 place-items-center rounded-xl text-2xl sm:h-12 sm:w-12"
            style={{ background: `${accent}1f`, border: `1px solid ${accent}66`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15), 0 0 18px ${accent}55` }}
          >
            {emoji}
          </span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
            <span className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: accent }}>
              {eyebrow ?? "Forgeheart"}
            </span>
          </div>
          <h2 className="mt-0.5 font-display text-xl font-black tracking-tight text-white sm:text-2xl">{title}</h2>
          <p className="mt-1 max-w-2xl text-[13px] leading-snug text-slate-300/90 sm:text-sm">{blurb}</p>
          {chips && <div className="mt-2.5 flex flex-wrap gap-1.5">{chips}</div>}
        </div>
        {right && <div className="flex-shrink-0 self-start">{right}</div>}
      </div>

      {/* live stat strip */}
      {stats && stats.length > 0 && (
        <div className="relative mt-3.5 flex flex-wrap items-stretch gap-2 border-t pt-3" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {stats.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-2 rounded-lg px-2.5 py-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              {s.icon != null && (
                <span className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-md text-[13px]" style={{ background: `${accent}1c`, color: accent }}>
                  {s.icon}
                </span>
              )}
              <span className="leading-tight">
                <span className="block text-sm font-bold tabular-nums text-white">{s.value}</span>
                <span className="block text-[9px] font-medium uppercase tracking-wide text-slate-400">{s.label}</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* progress bar */}
      {progress && (
        <div className="relative mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            <span>{progress.label}</span>
            <span className="tabular-nums" style={{ color: accent }}>{Math.round(progress.pct)}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div
              className="h-full rounded-full transition-[width] duration-700"
              style={{ width: `${Math.max(0, Math.min(100, progress.pct))}%`, background: `linear-gradient(90deg, ${accent}, ${accent}cc)`, boxShadow: `0 0 10px ${accent}` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/** Small header used inside panels (icon chip + title + optional right slot). */
export function PanelHeader({
  emoji,
  title,
  subtitle,
  accent = "#38bdf8",
  right,
}: {
  emoji?: ReactNode;
  title: string;
  subtitle?: string;
  accent?: string;
  right?: ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 pt-4">
      {emoji != null && (
        <span
          className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-xl text-lg"
          style={{ background: `${accent}22`, border: `1px solid ${accent}55`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.15)` }}
        >
          {emoji}
        </span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-display text-sm font-semibold tracking-tight text-white">{title}</h3>
        {subtitle && <p className="truncate text-xs text-slate-400">{subtitle}</p>}
      </div>
      {right}
    </div>
  );
}

/** Compact stat pill for the HUD (icon + value + label). */
export function StatPill({
  icon,
  value,
  label,
  accent = "#38bdf8",
}: {
  icon: ReactNode;
  value: ReactNode;
  label: string;
  accent?: string;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-2.5 py-1.5"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg text-sm" style={{ background: `${accent}22`, color: accent }}>
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-sm font-semibold tabular-nums text-white">{value}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      </div>
    </div>
  );
}

/** A small status chip: completed / available / in-progress / locked. */
export function StatusChip({ status }: { status: "completed" | "available" | "in-progress" | "locked" }) {
  const map = {
    completed: { label: "Completed", color: "#34d399", bg: "rgba(52,211,153,0.15)" },
    available: { label: "Ready", color: "#38bdf8", bg: "rgba(56,189,248,0.15)" },
    "in-progress": { label: "In progress", color: "#fbbf24", bg: "rgba(251,191,36,0.15)" },
    locked: { label: "Locked", color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
  }[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ color: map.color, background: map.bg, border: `1px solid ${map.color}44` }}
    >
      {status === "completed" ? "✓" : status === "locked" ? "🔒" : status === "in-progress" ? "…" : "▸"}
      {map.label}
    </span>
  );
}
