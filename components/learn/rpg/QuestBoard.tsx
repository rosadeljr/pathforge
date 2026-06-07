"use client";

/**
 * QuestBoard — the RPG quest board with type filters. Groups the catalog by
 * quest type and renders QuestCards. Highlights a focused quest (deep-link).
 */

import { useMemo, useState } from "react";
import type { PlayerState } from "@/lib/rpg/state";
import { questStatus } from "@/lib/rpg/state";
import { QUESTS, QUEST_TYPE_META, type QuestType } from "@/lib/data/rpg-quests";
import { Panel, PanelHeader, ScreenIntro } from "./primitives";
import { QuestCard } from "./QuestCard";

const TYPE_ORDER: QuestType[] = ["daily", "map", "class", "career", "party", "arena", "capstone", "job-change"];

export function QuestBoard({ ps, focusId }: { ps: PlayerState; focusId?: string }) {
  const [filter, setFilter] = useState<QuestType | "all">("all");

  const visible = useMemo(() => {
    const list = filter === "all" ? QUESTS : QUESTS.filter((q) => q.questType === filter);
    // sort: focused first, then in-progress/available before completed/locked
    const rank = (id: string) => {
      if (id === focusId) return -1;
      const s = questStatus(QUESTS.find((q) => q.id === id)!, ps);
      return s === "in-progress" ? 0 : s === "available" ? 1 : s === "completed" ? 2 : 3;
    };
    return [...list].sort((a, b) => rank(a.id) - rank(b.id));
  }, [filter, focusId, ps]);

  const tally = useMemo(() => {
    let cleared = 0, active = 0, ready = 0;
    for (const q of QUESTS) {
      const s = questStatus(q, ps);
      if (s === "completed") cleared++;
      else if (s === "in-progress") active++;
      else if (s === "available") ready++;
    }
    return { cleared, active, ready, total: QUESTS.length };
  }, [ps]);

  return (
    <div className="space-y-4">
      <ScreenIntro
        emoji="📜"
        eyebrow="Quest Log"
        title="Quest Board"
        blurb="Take on quests to earn XP, unlock skills, and level up your hero. Clear daily drills, map trials, and class challenges to climb the ranks."
        accent="#38bdf8"
        stats={[
          { value: tally.cleared, label: "Cleared" },
          { value: tally.active, label: "In progress" },
          { value: tally.ready, label: "Ready now" },
        ]}
        progress={{ pct: (tally.cleared / Math.max(1, tally.total)) * 100, label: "Quests cleared" }}
      />
      <Panel accent="#38bdf8" glow>
        <PanelHeader emoji="🔎" title="Find a quest" subtitle="Tap a tag to see just that kind of quest" accent="#38bdf8" />
        {/* filters */}
        <div className="flex gap-1.5 overflow-x-auto px-4 pb-4 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <FilterChip label="All" active={filter === "all"} onClick={() => setFilter("all")} />
          {TYPE_ORDER.map((t) => (
            <FilterChip
              key={t}
              label={`${QUEST_TYPE_META[t].emoji} ${QUEST_TYPE_META[t].label}`}
              active={filter === t}
              accent={QUEST_TYPE_META[t].accent}
              onClick={() => setFilter(t)}
            />
          ))}
        </div>
      </Panel>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {visible.map((q) => (
          <QuestCard key={q.id} quest={q} ps={ps} highlight={q.id === focusId} />
        ))}
      </div>
      {visible.length === 0 && <p className="px-1 text-sm text-slate-400">No quests of this type yet.</p>}
    </div>
  );
}

function FilterChip({ label, active, onClick, accent = "#38bdf8" }: { label: string; active: boolean; onClick: () => void; accent?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? "text-slate-900" : "text-slate-300 hover:bg-white/[0.06]"}`}
      style={active ? { background: accent } : { border: "1px solid rgba(255,255,255,0.10)" }}
    >
      {label}
    </button>
  );
}
