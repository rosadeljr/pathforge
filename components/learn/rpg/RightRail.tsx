"use client";

/**
 * RightRail — "what should I do next?" Active/available quests plus a single,
 * obvious recommended next action so a kid knows what to do within 5 seconds.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { questStatus } from "@/lib/rpg/state";
import { QUESTS, QUEST_TYPE_META, type Quest } from "@/lib/data/rpg-quests";
import { WORLD_MAPS, mapUnlockStatus } from "@/lib/data/rpg-maps";
import { Panel, PanelHeader, StatusChip } from "./primitives";
import { DailyGoalsCard } from "./DailyGoalsCard";

function recommend(ps: PlayerState): { quest?: Quest; reason: string } {
  // Prefer an in-progress quest in a started subject, else an available daily.
  const ranked = QUESTS.map((q) => ({ q, s: questStatus(q, ps) }));
  const inProgress = ranked.find((r) => r.s === "in-progress");
  if (inProgress) return { quest: inProgress.q, reason: "Continue where you left off" };
  const daily = ranked.find((r) => r.q.questType === "daily" && r.s !== "locked" && r.s !== "completed");
  if (daily) return { quest: daily.q, reason: "Your daily warm-up" };
  const anyAvail = ranked.find((r) => r.s === "available");
  return { quest: anyAvail?.q, reason: "A good next step" };
}

export function RightRail({ ps }: { ps: PlayerState }) {
  const { quest: rec, reason } = recommend(ps);

  // next recommended map (first unlocked, not fully cleared)
  const nextMap = WORLD_MAPS.find((m) => {
    const st = mapUnlockStatus(m, { characterLevel: ps.characterLevel, tier: ps.tier, startedMaps: ps.startedMapIds });
    return st.unlocked && !ps.clearedBossIds.has(m.boss.id);
  });

  const active = QUESTS.map((q) => ({ q, s: questStatus(q, ps) }))
    .filter((r) => r.s === "in-progress" || r.s === "available")
    .slice(0, 4);

  return (
    <div className="space-y-4">
      {/* daily engagement loop */}
      <DailyGoalsCard streak={ps.streak} />

      {/* recommended next action */}
      <Panel accent="#34d399" glow className="pb-4">
        <PanelHeader emoji="🎯" title="Recommended next" subtitle={reason} accent="#34d399" />
        <div className="px-4 pt-3">
          {rec ? (
            <Link
              href={`/learn/quests?focus=${rec.id}`}
              className="group flex items-center gap-3 rounded-xl p-3 transition hover:bg-white/[0.06]"
              style={{ background: "rgba(52,211,153,0.10)", border: "1px solid rgba(52,211,153,0.35)" }}
            >
              <span className="text-2xl">{QUEST_TYPE_META[rec.questType].emoji}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold text-white">{rec.title}</div>
                <div className="text-xs text-slate-400">
                  {QUEST_TYPE_META[rec.questType].label} · +{rec.xpReward} XP
                </div>
              </div>
              <ArrowRight size={16} className="text-emerald-300 transition group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <p className="text-xs text-slate-400">All caught up — explore the world map!</p>
          )}

          {nextMap && (
            <Link
              href={`/learn/map?focus=${nextMap.id}`}
              className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-300 transition hover:bg-white/[0.06]"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <span>{nextMap.emoji}</span>
              <span className="flex-1 truncate">Explore {nextMap.name}</span>
              <ArrowRight size={14} className="text-slate-400" />
            </Link>
          )}
        </div>
      </Panel>

      {/* active quests */}
      <Panel accent="#38bdf8" className="pb-3">
        <PanelHeader
          emoji="📜"
          title="Active quests"
          accent="#38bdf8"
          right={
            <Link href="/learn/quests" className="px-4 text-xs font-semibold text-sky-300 hover:text-sky-200">
              All
            </Link>
          }
        />
        <ul className="space-y-1.5 px-3 pt-3">
          {active.length === 0 && (
            <li className="flex flex-col items-start gap-2 px-1 pb-2">
              <span className="text-xs text-slate-400">No active quests yet — pick one to get started.</span>
              <Link
                href="/learn/quests"
                className="group inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold text-slate-900 transition hover:brightness-110"
                style={{ background: "#38bdf8" }}
              >
                Pick a quest
                <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
              </Link>
            </li>
          )}
          {active.map(({ q, s }) => (
            <li key={q.id}>
              <Link
                href={`/learn/quests?focus=${q.id}`}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition hover:bg-white/[0.06]"
              >
                <span className="text-base">{QUEST_TYPE_META[q.questType].emoji}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-slate-200">{q.title}</span>
                <StatusChip status={s === "in-progress" ? "in-progress" : "available"} />
              </Link>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
