"use client";

/**
 * MapZoneCard — a single world-map zone surface. Shows subject, grade band,
 * progress, quests available, mastery (boss) status, career links, unlock
 * requirements, and a recommended highlight. Original tile-styled surface.
 */

import Link from "next/link";
import { Crown, MapPin } from "lucide-react";
import type { WorldMap } from "@/lib/data/rpg-maps";
import type { PlayerState } from "@/lib/rpg/state";
import { mapStatusFor, mapProgressPct, bossCleared } from "@/lib/rpg/state";
import { getSubject } from "@/lib/data/learner";
import { getCareer } from "@/lib/data/careers";
import { questsForMap } from "@/lib/data/rpg-quests";
import { LevelProgressBar } from "./LevelProgressBar";
import { LockedContentOverlay } from "./LockedContentOverlay";

export function MapZoneCard({ map, ps, recommended = false }: { map: WorldMap; ps: PlayerState; recommended?: boolean }) {
  const status = mapStatusFor(map, ps);
  const pct = mapProgressPct(map, ps);
  const cleared = bossCleared(map, ps);
  const subject = getSubject(map.subjectFocus);
  const questCount = questsForMap(map.id).length;
  const careers = map.careerLinks.map(getCareer).filter(Boolean).slice(0, 3);
  const locked = !status.unlocked;
  const needsUpgrade = status.reasons.some((r) => r.toLowerCase().includes("pro") || r.toLowerCase().includes("family"));

  const Wrapper: React.ElementType = locked ? "div" : Link;
  const wrapperProps = locked ? {} : { href: `/learn/${map.subjectFocus}` };

  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative block overflow-hidden rounded-2xl transition ${locked ? "" : "hover:-translate-y-0.5 active:translate-y-0"}`}
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(8,11,18,0.65))",
        border: `1px solid ${recommended ? `${map.accent}aa` : "rgba(255,255,255,0.10)"}`,
        boxShadow: recommended ? `0 0 0 1px ${map.accent}66, 0 10px 30px -14px ${map.accent}aa` : "inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
    >
      {/* zone banner */}
      <div
        className="relative flex items-center gap-3 px-4 pt-4 pb-3"
        style={{ background: `linear-gradient(135deg, ${map.accent}26, transparent 70%)` }}
      >
        <span
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl text-2xl"
          style={{ background: `${map.accent}26`, border: `1px solid ${map.accent}77`, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)" }}
        >
          {map.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate font-display text-sm font-bold text-white">{map.name}</h3>
            {recommended && (
              <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">Next up</span>
            )}
          </div>
          <p className="truncate text-[11px] text-slate-400">
            {subject?.title} · Grades {map.recommendedGrades[0]}–{map.recommendedGrades[1]}
          </p>
        </div>
        {cleared && <Crown size={18} className="text-amber-400" />}
      </div>

      <div className="space-y-3 px-4 pb-4">
        <p className="line-clamp-2 text-xs text-slate-400">{map.description}</p>

        <LevelProgressBar pct={pct} accent={map.accent} label="Zone progress" height={8} />

        {/* meta row */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.05] px-2 py-0.5 text-slate-300">
            <MapPin size={11} /> {questCount} quests
          </span>
          <span
            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5"
            style={{ background: cleared ? "rgba(52,211,153,0.15)" : "rgba(251,191,36,0.12)", color: cleared ? "#34d399" : "#fbbf24" }}
          >
            {map.boss.emoji} {cleared ? "Mastered" : map.boss.name}
          </span>
        </div>

        {/* career links */}
        {careers.length > 0 && (
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="text-[10px] uppercase tracking-wide text-slate-500">Careers</span>
            {careers.map((c) => (
              <span key={c!.id} title={c!.title} className="text-base">
                {c!.emoji}
              </span>
            ))}
          </div>
        )}
      </div>

      {locked && <LockedContentOverlay reasons={status.reasons} showUpgrade={needsUpgrade} />}
    </Wrapper>
  );
}
