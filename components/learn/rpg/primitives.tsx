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

/**
 * ScreenIntro — a soft, friendly "anime dusk" hero banner shown at the top of
 * each RPG screen (Quests / Skills / Arena …). Warm gradient, a big glowing
 * emoji badge, a plain-language title + description written for kids, gentle
 * twinkles, and an optional right slot. Keeps every screen feeling like part of
 * the same storybook world as Forgeheart City.
 */
export function ScreenIntro({
  emoji,
  title,
  blurb,
  accent = "#7c5cff",
  chips,
  right,
}: {
  emoji: ReactNode;
  title: string;
  blurb: string;
  accent?: string;
  chips?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl p-4 sm:p-5"
      style={{
        background: `linear-gradient(135deg, ${accent}33 0%, rgba(124,92,255,0.14) 38%, rgba(8,13,22,0.72) 100%)`,
        border: `1px solid ${accent}55`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.12), 0 16px 40px -22px ${accent}aa`,
      }}
    >
      {/* warm dusk glow + gentle twinkles */}
      <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-40 blur-2xl" style={{ background: accent }} />
      <span aria-hidden className="rpg-twinkle pointer-events-none absolute right-8 top-5 text-sm">✦</span>
      <span aria-hidden className="rpg-twinkle pointer-events-none absolute right-24 top-10 text-xs" style={{ animationDelay: "1.1s" }}>✦</span>
      <span aria-hidden className="rpg-twinkle pointer-events-none absolute right-14 bottom-4 text-[10px]" style={{ animationDelay: "0.6s" }}>✦</span>

      <div className="relative flex items-start gap-3 sm:gap-4">
        <span
          className="rpg-float grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-3xl sm:h-16 sm:w-16"
          style={{ background: `${accent}2e`, border: `1px solid ${accent}88`, boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), 0 0 22px ${accent}66` }}
        >
          {emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-black tracking-tight text-white sm:text-xl">{title}</h2>
          <p className="mt-0.5 max-w-xl text-sm text-slate-200/90">{blurb}</p>
          {chips && <div className="mt-2 flex flex-wrap gap-1.5">{chips}</div>}
        </div>
        {right && <div className="flex-shrink-0">{right}</div>}
      </div>
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
