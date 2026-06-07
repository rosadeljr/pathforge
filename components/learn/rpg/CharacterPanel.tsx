"use client";

/**
 * CharacterPanel — polished character progression: character level, class/job
 * level, current title, class path with next advancement, XP to next, unlocked
 * skills, and earned cosmetics count. Left rail of the game shell.
 */

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { skillsForClass } from "@/lib/data/rpg-skills";
import { Panel, PanelHeader } from "./primitives";
import { LevelProgressBar } from "./LevelProgressBar";

export function CharacterPanel({ ps }: { ps: PlayerState }) {
  const accent = ps.cls?.accent ?? ps.rank.accent;

  if (!ps.cls) {
    return (
      <Panel accent={accent} className="p-4">
        <PanelHeader emoji="🎭" title="Choose your class" subtitle="Pick a path to begin" accent={accent} />
        <div className="px-4 pb-4 pt-3">
          <p className="text-xs text-slate-400">Your class shapes your quests, skills, and dream-job path.</p>
          <Link
            href="/learn/skills"
            className="mt-3 inline-flex items-center gap-1 rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
          >
            Explore classes <ChevronRight size={14} />
          </Link>
        </div>
      </Panel>
    );
  }

  const totalSkills = skillsForClass(ps.cls.id).length;
  const earnedCount = ps.earnedRewardIds.length;

  return (
    <Panel accent={accent} className="pb-4">
      <PanelHeader emoji={ps.cls.emoji} title={ps.cls.name} subtitle={ps.classTitle?.title} accent={accent} />

      <div className="space-y-4 px-4 pt-3">
        {/* character + class levels */}
        <div className="grid grid-cols-2 gap-2">
          <LevelStat label="Character Lv" value={ps.characterLevel} accent={ps.rank.accent} sub={ps.rank.title} />
          <LevelStat label="Class Lv" value={ps.classLevel} accent={accent} sub={ps.classTitle?.title} />
        </div>

        {/* class XP bar to next title */}
        <div>
          <LevelProgressBar
            pct={ps.classLevel_.pct}
            accent={accent}
            label={ps.nextClassTitle ? `Next: ${ps.nextClassTitle.title}` : "Top of class path"}
          />
        </div>

        {/* class advancement path */}
        <div>
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Class path</p>
          <ol className="space-y-1">
            {ps.cls.advancement.map((a) => {
              const reached = ps.classLevel >= a.classLevel;
              const current = ps.classTitle?.tier === a.tier;
              return (
                <li
                  key={a.tier}
                  className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs"
                  style={{
                    background: current ? `${accent}1f` : "transparent",
                    border: current ? `1px solid ${accent}55` : "1px solid transparent",
                  }}
                >
                  <span className={reached ? "" : "opacity-40"}>{a.emoji}</span>
                  <span className={`flex-1 truncate ${reached ? "text-white" : "text-slate-500"}`}>{a.title}</span>
                  <span className="text-[10px] text-slate-500">Lv {a.classLevel}</span>
                </li>
              );
            })}
          </ol>
        </div>

        {/* quick counters */}
        <div className="grid grid-cols-2 gap-2">
          <MiniCounter icon={<Sparkles size={13} />} label="Skills" value={`${ps.unlockedSkillIds.length}/${totalSkills}`} accent={accent} href="/learn/skills" />
          <MiniCounter icon={<span className="text-[13px]">🏅</span>} label="Rewards" value={`${earnedCount}`} accent="#fbbf24" href="/learn/rewards" />
        </div>
      </div>
    </Panel>
  );
}

function LevelStat({ label, value, accent, sub }: { label: string; value: number; accent: string; sub?: string }) {
  return (
    <div className="rounded-xl px-3 py-2" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      <div className="font-display text-xl font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
      {sub && <div className="truncate text-[10px] text-slate-500">{sub}</div>}
    </div>
  );
}

function MiniCounter({ icon, label, value, accent, href }: { icon: React.ReactNode; label: string; value: string; accent: string; href: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-xl px-3 py-2 transition hover:bg-white/[0.06]"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <span className="grid h-7 w-7 place-items-center rounded-lg" style={{ background: `${accent}22`, color: accent }}>
        {icon}
      </span>
      <div className="leading-tight">
        <div className="text-sm font-bold tabular-nums text-white">{value}</div>
        <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
      </div>
    </Link>
  );
}
