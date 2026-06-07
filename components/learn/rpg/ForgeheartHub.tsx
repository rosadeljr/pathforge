"use client";

/**
 * ForgeheartHub — a clean, premium learn hub (center stage of the GameShell).
 * Reliable responsive layout (no isometric/transform math): a hero banner with
 * the player's chibi avatar, subject realm portals, and big readable landmark
 * tiles that each map to a real learning activity.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { getSubject, type SubjectId } from "@/lib/data/learner";
import { mapForSubject } from "@/lib/data/rpg-maps";
import { questCounts } from "@/lib/rpg/state";
import { Panel, PanelHeader } from "./primitives";
import { TownAvatar, type AvatarItem, type AvatarHat } from "./iso/TownAvatar";

const SUBJECTS: SubjectId[] = ["math", "english", "filipino", "science", "araling-panlipunan"];

const CLASS_LOOK: Record<string, { item: AvatarItem; hat: AvatarHat }> = {
  scholar: { item: "book", hat: "glasses" },
  builder: { item: "tools", hat: "cap" },
  healer: { item: "satchel", hat: "hood" },
  storyteller: { item: "notebook", hat: "circlet" },
  explorer: { item: "compass", hat: "cap" },
  guardian: { item: "satchel", hat: "circlet" },
  merchant: { item: "scroll", hat: "cap" },
  "tech-tinkerer": { item: "tools", hat: "glasses" },
  creator: { item: "notebook", hat: "circlet" },
  navigator: { item: "compass", hat: "hood" },
};

interface Landmark {
  id: string;
  name: string;
  emoji: string;
  value: string; // the learning activity it represents
  href: string;
  accent: string;
  status: "open" | "locked";
  lockNote?: string;
}

export function ForgeheartHub({ ps }: { ps: PlayerState }) {
  const counts = questCounts(ps);
  const accent = ps.cls?.accent ?? "#38bdf8";
  const look = (ps.cls && CLASS_LOOK[ps.cls.id]) || { item: "book", hat: "circlet" };

  const landmarks: Landmark[] = [
    { id: "quests", name: "Quest Board", emoji: "📜", value: `${counts.available} daily, class & career quests`, href: "/learn/quests", accent: "#f59e0b", status: "open" },
    { id: "class", name: "Class Hall", emoji: "🎓", value: ps.cls ? "Skill tree & job progress" : "Choose your class", href: "/learn/skills", accent: "#a78bfa", status: "open" },
    { id: "guild", name: "Career Guild Hall", emoji: "🏛️", value: "Explore real dream-job paths", href: "/learn/guilds", accent: "#fb7185", status: "open" },
    { id: "map", name: "Realm Gates", emoji: "🗺️", value: "Subject worlds & adventure maps", href: "/learn/map", accent: "#38bdf8", status: "open" },
    { id: "arena", name: "Knowledge Arena", emoji: "⚔️", value: "Friendly, safe quiz duels", href: "/learn/arena", accent: "#f43f5e", status: ps.characterLevel >= 2 ? "open" : "locked", lockNote: "Reach level 2" },
    { id: "mentor", name: "Mentor Tower", emoji: "🔮", value: "Ask your kid-safe AI tutor", href: "/mentor", accent: "#2dd4bf", status: "open" },
    { id: "rewards", name: "Reward Shop", emoji: "🛍️", value: `${ps.coins.toLocaleString()} coins · cosmetics & badges`, href: "/learn/rewards", accent: "#fbbf24", status: "open" },
    { id: "parent", name: "Parent Center", emoji: "🏡", value: "Progress & weekly reports", href: "/parent", accent: "#60a5fa", status: "open" },
  ];

  return (
    <div className="space-y-4">
      {/* hero banner */}
      <Panel accent={accent} glow className="overflow-hidden">
        <div className="relative flex items-center gap-4 p-5">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{ background: `radial-gradient(120% 140% at 12% 0%, ${accent}22, transparent 55%), radial-gradient(120% 140% at 100% 100%, rgba(251,191,36,0.14), transparent 55%)` }}
          />
          <div className="relative flex-shrink-0 rpg-float-slow">
            <div className="grid place-items-center rounded-2xl" style={{ width: 92, height: 92, background: `radial-gradient(circle at 50% 30%, ${accent}33, rgba(8,11,18,0.7))`, border: `1px solid ${accent}66` }}>
              <TownAvatar accent={accent} trim="#fcd34d" item={look.item} hat={look.hat} width={70} />
            </div>
          </div>
          <div className="relative min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-300/90">Forgeheart City</p>
            <h1 className="mt-0.5 truncate font-display text-2xl font-bold tracking-tight text-white">Welcome back, {ps.name}!</h1>
            <p className="mt-1 text-sm text-slate-300">
              {ps.cls ? (
                <>
                  <span style={{ color: accent }}>{ps.classTitle?.title ?? ps.cls.name}</span> · Character Lv {ps.characterLevel} · {ps.rank.title}
                </>
              ) : (
                "Choose a class to begin your adventure."
              )}
            </p>
          </div>
        </div>
      </Panel>

      {/* subject realm portals */}
      <Panel accent="#38bdf8">
        <PanelHeader emoji="🌀" title="Subject Realms" subtitle="Step into a learning world" accent="#38bdf8" />
        <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-3 md:grid-cols-5">
          {SUBJECTS.map((s) => {
            const subj = getSubject(s);
            const m = mapForSubject(s);
            if (!subj || !m) return null;
            const xp = ps.subjectXp[s] ?? 0;
            return (
              <Link
                key={s}
                href={`/learn/${s}`}
                aria-label={`Enter ${m.name} (${subj.title})`}
                className="group flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: `radial-gradient(circle at 50% 25%, ${m.accent}22, rgba(8,11,18,0.5))`, border: `1px solid ${m.accent}55` }}
              >
                <span className="grid h-14 w-14 place-items-center rounded-full text-2xl transition-transform group-hover:scale-105" style={{ background: `${m.accent}26`, border: `2px solid ${m.accent}aa`, boxShadow: `inset 0 0 12px ${m.accent}55` }}>
                  {m.emoji}
                </span>
                <span className="text-xs font-semibold text-white">{m.name}</span>
                <span className="text-[10px] text-slate-400">{subj.title} · {xp} XP</span>
              </Link>
            );
          })}
        </div>
      </Panel>

      {/* landmark tiles */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {landmarks.map((l) => (
          <LandmarkTile key={l.id} l={l} />
        ))}
      </div>
    </div>
  );
}

function LandmarkTile({ l }: { l: Landmark }) {
  const locked = l.status === "locked";
  const Wrapper: React.ElementType = locked ? "div" : Link;
  const props = locked ? {} : { href: l.href, "aria-label": `${l.name}: ${l.value}` };
  return (
    <Wrapper
      {...props}
      className={`group relative flex flex-col overflow-hidden rounded-2xl transition ${locked ? "cursor-not-allowed" : "hover:-translate-y-0.5 active:translate-y-0"}`}
      style={{
        background: `linear-gradient(160deg, ${l.accent}1f, rgba(8,11,18,0.6) 60%)`,
        border: `1px solid ${locked ? "rgba(255,255,255,0.10)" : `${l.accent}66`}`,
        boxShadow: locked ? "none" : `inset 0 1px 0 rgba(255,255,255,0.08)`,
        opacity: locked ? 0.65 : 1,
      }}
    >
      <span aria-hidden className="block h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${l.accent}, ${l.accent}44)` }} />
      <div className="flex items-center gap-3 p-4">
        <span
          className="grid h-14 w-14 flex-shrink-0 place-items-center rounded-2xl text-2xl transition-transform group-hover:scale-105"
          style={{ background: `${l.accent}26`, border: `1px solid ${l.accent}66`, boxShadow: `0 0 14px ${l.accent}33, inset 0 1px 0 rgba(255,255,255,0.18)` }}
        >
          {l.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-display text-base font-bold text-white">{l.name}</h3>
          <p className="mt-0.5 text-xs leading-snug text-slate-400">{l.value}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between px-4 py-2.5 text-xs font-semibold" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: locked ? "#94a3b8" : l.accent }}>
        <span>{locked ? `🔒 ${l.lockNote ?? "Locked"}` : "Open"}</span>
        {!locked && <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />}
      </div>
    </Wrapper>
  );
}
