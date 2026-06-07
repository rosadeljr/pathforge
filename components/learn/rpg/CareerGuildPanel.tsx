"use client";

/**
 * CareerGuildPanel — the Career Guild Hall directory. Each guild shows its
 * master title, the learner's current rank (derived from total XP), progress to
 * the next rank, and links to the full career/guild page. Guilds tie classes to
 * real dream jobs.
 */

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { GUILDS, currentRank, unlockedRewards } from "@/lib/data/guilds";
import { getCareer } from "@/lib/data/careers";
import { Panel, PanelHeader } from "./primitives";
import { LevelProgressBar } from "./LevelProgressBar";

export function CareerGuildPanel({ ps }: { ps: PlayerState }) {
  // recommend the guild matching the learner's dream career or class careers
  const recommendedCareerIds = new Set<string>([
    ...(ps.dreamCareerId ? [ps.dreamCareerId] : []),
    ...(ps.cls?.recommendedCareers ?? []),
  ]);

  return (
    <div className="space-y-4">
      <Panel accent="#fb7185" glow>
        <PanelHeader emoji="🏛️" title="Career Guild Hall" subtitle="Join a guild and climb toward a real dream job" accent="#fb7185" />
        <p className="px-4 pb-4 pt-1 text-xs text-slate-400">
          Guild rank grows with your total XP. Each guild leads to real careers and a capstone certificate.
        </p>
      </Panel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {GUILDS.map((guild) => {
          const career = getCareer(guild.careerId);
          const { idx, rank } = currentRank(guild, ps.totalXp);
          const next = guild.ranks[idx + 1];
          const pct = next ? Math.min(100, Math.round(((ps.totalXp - rank.xpThreshold) / (next.xpThreshold - rank.xpThreshold)) * 100)) : 100;
          const rewards = unlockedRewards(guild, ps.totalXp);
          const recommended = recommendedCareerIds.has(guild.careerId);
          const accent = career?.accentColor ?? "#fb7185";

          return (
            <Link
              key={guild.careerId}
              href={`/learn/careers/${guild.careerId}`}
              className="group relative overflow-hidden rounded-2xl p-4 transition hover:-translate-y-0.5"
              style={{
                background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(8,11,18,0.65))",
                border: `1px solid ${recommended ? `${accent}aa` : "rgba(255,255,255,0.10)"}`,
                boxShadow: recommended ? `0 0 0 1px ${accent}55, 0 10px 26px -16px ${accent}aa` : "inset 0 1px 0 rgba(255,255,255,0.08)",
              }}
            >
              {/* guild banner */}
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-xl text-2xl" style={{ background: `${accent}22`, border: `1px solid ${accent}66` }}>
                  {career?.emoji ?? "🏛️"}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-display text-sm font-bold text-white">{guild.name}</h3>
                    {recommended && <span className="rounded-full bg-rose-400/20 px-2 py-0.5 text-[9px] font-bold text-rose-300">For you</span>}
                  </div>
                  <p className="truncate text-[11px] text-slate-400">{guild.masterTitle}</p>
                </div>
                <ChevronRight size={16} className="text-slate-500 transition group-hover:translate-x-0.5" />
              </div>

              {/* rank */}
              <div className="mt-3 flex items-center gap-2 text-xs">
                <span className="text-base">{rank.emoji}</span>
                <span className="font-semibold text-white">{rank.title}</span>
                <span className="ml-auto text-[10px] text-slate-500">{rewards.length} rewards</span>
              </div>
              <div className="mt-2">
                <LevelProgressBar pct={pct} accent={accent} height={6} showShine={false} label={next ? `Next: ${next.title}` : "Master rank reached"} />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
