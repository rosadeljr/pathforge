"use client";

/**
 * HubTown — the playable town square of PathForge. Original illustrated surface
 * (CSS/SVG skyline + landmark "buildings"), not a dashboard. Each landmark is a
 * clickable building with hover/press, locked/unlocked/completed state, a label,
 * and a clear next action. Subject portals link into the real lesson routes.
 */

import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import type { PlayerState } from "@/lib/rpg/state";
import { getSubject, type SubjectId } from "@/lib/data/learner";
import { mapForSubject } from "@/lib/data/rpg-maps";
import { questCounts } from "@/lib/rpg/state";
import { Panel, PanelHeader } from "./primitives";

interface Landmark {
  id: string;
  name: string;
  emoji: string;
  blurb: string;
  href: string;
  accent: string;
  status: "open" | "locked" | "done";
  action: string;
}

const SUBJECTS: SubjectId[] = ["math", "english", "filipino", "science", "araling-panlipunan"];

export function HubTown({ ps }: { ps: PlayerState }) {
  const reduced = useReducedMotion();
  const counts = questCounts(ps);

  const landmarks: Landmark[] = [
    { id: "quest-board", name: "Quest Board", emoji: "📜", blurb: `${counts.available} quests ready`, href: "/learn/quests", accent: "#38bdf8", status: "open", action: "Pick a quest" },
    { id: "class-hall", name: "Class Hall", emoji: ps.cls?.emoji ?? "🎭", blurb: ps.cls ? `${ps.classTitle?.title}` : "Choose your class", href: "/learn/skills", accent: ps.cls?.accent ?? "#a78bfa", status: "open", action: ps.cls ? "View class" : "Choose class" },
    { id: "guild-hall", name: "Career Guild Hall", emoji: "🏛️", blurb: "Find your dream job", href: "/learn/careers", accent: "#fb7185", status: "open", action: "Visit guilds" },
    { id: "skill-hall", name: "Skill Tree Hall", emoji: "🌳", blurb: `${ps.unlockedSkillIds.length} skills unlocked`, href: "/learn/skills#tree", accent: "#34d399", status: ps.cls ? "open" : "locked", action: "Grow skills" },
    { id: "reward-shop", name: "Reward Shop", emoji: "🛍️", blurb: `${ps.coins.toLocaleString()} coins`, href: "/learn/rewards", accent: "#fbbf24", status: "open", action: "Browse rewards" },
    { id: "arena", name: "Knowledge Arena", emoji: "⚔️", blurb: "Friendly duels", href: "/learn/arena", accent: "#f43f5e", status: ps.characterLevel >= 2 ? "open" : "locked", action: ps.characterLevel >= 2 ? "Enter arena" : "Reach Lv 2" },
    { id: "parent-center", name: "Parent Report Center", emoji: "🏡", blurb: "For grown-ups", href: "/parent", accent: "#60a5fa", status: "open", action: "View reports" },
  ];

  return (
    <div className="space-y-4">
      {/* town square hero with original skyline */}
      <Panel accent="#fbbf24" glow className="overflow-hidden">
        <div className="relative">
          <TownSkyline reduced={!!reduced} />
          <div className="relative z-10 px-5 py-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300/90">Forgeheart City</p>
            <h1 className="mt-1 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {ps.name}!
            </h1>
            <p className="mt-1 max-w-md text-sm text-slate-300">
              {ps.cls
                ? `Your ${ps.classTitle?.title} path awaits. Where to first?`
                : "Choose a class, explore the maps, and forge your future."}
            </p>
          </div>
        </div>
      </Panel>

      {/* subject portals */}
      <Panel accent="#a78bfa">
        <PanelHeader emoji="🌀" title="Subject Realm Portals" subtitle="Step into a learning world" accent="#a78bfa" />
        <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-3 md:grid-cols-5">
          {SUBJECTS.map((s) => {
            const subj = getSubject(s);
            const map = mapForSubject(s);
            if (!subj || !map) return null;
            const xp = ps.subjectXp[s] ?? 0;
            return (
              <Link
                key={s}
                href={`/learn/${s}`}
                className="group relative flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition active:scale-[0.97]"
                style={{
                  background: `radial-gradient(circle at 50% 30%, ${map.accent}22, rgba(8,11,18,0.55))`,
                  border: `1px solid ${map.accent}55`,
                }}
              >
                {/* portal ring */}
                <span
                  className="grid h-14 w-14 place-items-center rounded-full text-2xl transition-transform group-hover:scale-105"
                  style={{ background: `${map.accent}26`, border: `2px solid ${map.accent}aa`, boxShadow: `inset 0 0 12px ${map.accent}66` }}
                >
                  {map.emoji}
                </span>
                <span className="text-xs font-semibold text-white">{map.name}</span>
                <span className="text-[10px] text-slate-400">{subj.title} · {xp} XP</span>
              </Link>
            );
          })}
        </div>
      </Panel>

      {/* landmark buildings */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {landmarks.map((l) => (
          <LandmarkBuilding key={l.id} l={l} />
        ))}
      </div>

      {/* event notice board */}
      <Panel accent="#f59e0b">
        <PanelHeader emoji="📢" title="Event Notice Board" subtitle="What's happening in Forgeheart City" accent="#f59e0b" />
        <ul className="space-y-2 p-4">
          <NoticeItem emoji="🔥" text="Double daily-quest spirit! Keep your streak alive." />
          <NoticeItem emoji="🏆" text="Weekly Knowledge Arena ladder resets every Monday." />
          <NoticeItem emoji="🎁" text="New decorations in the Reward Shop." />
        </ul>
      </Panel>
    </div>
  );
}

function LandmarkBuilding({ l }: { l: Landmark }) {
  const locked = l.status === "locked";
  const Wrapper: React.ElementType = locked ? "div" : Link;
  const wrapperProps = locked ? {} : { href: l.href };
  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative block overflow-hidden rounded-2xl transition ${locked ? "cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(8,11,18,0.6))",
        border: "1px solid rgba(255,255,255,0.10)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.10), 0 8px 22px -14px rgba(0,0,0,0.8)",
        opacity: locked ? 0.6 : 1,
      }}
    >
      {/* rooftop accent */}
      <span aria-hidden className="block h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${l.accent}, ${l.accent}55)` }} />
      <div className="flex items-center gap-3 p-4">
        <span
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-2xl transition-transform group-hover:scale-105"
          style={{ background: `${l.accent}22`, border: `1px solid ${l.accent}66`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}
        >
          {l.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-sm font-bold text-white">{l.name}</h3>
            {l.status === "done" && <span className="text-xs text-emerald-400">✓</span>}
            {locked && <span className="text-xs">🔒</span>}
          </div>
          <p className="truncate text-xs text-slate-400">{l.blurb}</p>
        </div>
      </div>
      <div
        className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: locked ? "#94a3b8" : l.accent }}
      >
        <span>{l.action}</span>
        {!locked && <span className="transition group-hover:translate-x-0.5">→</span>}
      </div>
    </Wrapper>
  );
}

function NoticeItem({ emoji, text }: { emoji: string; text: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
      <span className="text-lg">{emoji}</span>
      <span className="text-xs text-slate-300">{text}</span>
    </li>
  );
}

/** Original CSS/SVG town skyline — layered silhouettes, no blob gradients. */
function TownSkyline({ reduced }: { reduced: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <svg viewBox="0 0 800 220" preserveAspectRatio="xMidYMax slice" className="h-full w-full opacity-90">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10172a" />
            <stop offset="100%" stopColor="#0a0f1c" />
          </linearGradient>
        </defs>
        <rect width="800" height="220" fill="url(#sky)" />
        {/* stars */}
        {!reduced &&
          Array.from({ length: 24 }).map((_, i) => (
            <circle key={i} cx={(i * 97) % 800} cy={(i * 37) % 90} r={(i % 3) * 0.6 + 0.5} fill="#cbd5e1" opacity={0.25 + ((i * 13) % 30) / 100} />
          ))}
        {/* back hills */}
        <path d="M0 170 Q 200 120 400 165 T 800 150 V220 H0 Z" fill="#16203a" />
        {/* towers */}
        <g fill="#1d2a44">
          <rect x="90" y="110" width="46" height="90" rx="4" />
          <polygon points="90,110 113,82 136,110" fill="#23335a" />
          <rect x="170" y="130" width="38" height="70" rx="4" />
          <rect x="640" y="120" width="44" height="80" rx="4" />
          <polygon points="640,120 662,92 684,120" fill="#23335a" />
          <rect x="710" y="135" width="34" height="65" rx="4" />
        </g>
        {/* central keep */}
        <g>
          <rect x="360" y="92" width="80" height="108" rx="6" fill="#243457" />
          <polygon points="360,92 400,58 440,92" fill="#2c3f6b" />
          <rect x="392" y="120" width="16" height="80" fill="#0e1626" />
          <circle cx="400" cy="78" r="4" fill="#fcd34d" />
        </g>
        {/* lit windows */}
        <g fill="#fcd34d" opacity="0.85">
          <rect x="102" y="124" width="6" height="8" /><rect x="118" y="124" width="6" height="8" />
          <rect x="102" y="146" width="6" height="8" /><rect x="118" y="146" width="6" height="8" />
          <rect x="652" y="134" width="6" height="8" /><rect x="668" y="134" width="6" height="8" />
          <rect x="372" y="132" width="6" height="8" /><rect x="424" y="132" width="6" height="8" />
        </g>
        {/* foreground ground */}
        <path d="M0 185 Q 400 205 800 185 V220 H0 Z" fill="#0c1322" />
      </svg>
    </div>
  );
}
