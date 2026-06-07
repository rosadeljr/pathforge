"use client";

/**
 * SkillTree — a visual, connected node graph for the selected class. Nodes are
 * laid out by tier (root → branches → master) with SVG connectors derived from
 * each node's `requires`. Locked/unlocked/current states; a detail panel shows
 * the selected node's unlock requirements, subject and career relevance.
 */

import { useMemo, useState } from "react";
import type { ClassId } from "@/lib/data/rpg-classes";
import { getClass } from "@/lib/data/rpg-classes";
import { skillsForClass, isSkillUnlocked, type SkillNode as SkillNodeData } from "@/lib/data/rpg-skills";
import type { PlayerState } from "@/lib/rpg/state";
import { Panel, PanelHeader } from "./primitives";
import { SkillNode } from "./SkillNode";

export function SkillTree({ ps, classId }: { ps: PlayerState; classId: ClassId }) {
  const cls = getClass(classId)!;
  const accent = cls.accent;
  const nodes = skillsForClass(classId);

  // position map: x% by index within tier, y% by tier
  const positions = useMemo(() => layout(nodes), [nodes]);

  const [selectedId, setSelectedId] = useState<string>(nodes[0]?.id ?? "");
  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0];

  function stateOf(n: SkillNodeData): "unlocked" | "current" | "locked" {
    const unlocked = isSkillUnlocked(n, ps.classLevel, ps.unlockedSkillIds);
    if (!unlocked) return "locked";
    // "current" = unlocked but at the frontier (a child is still locked)
    const hasLockedChild = nodes.some((c) => c.requires.includes(n.id) && !isSkillUnlocked(c, ps.classLevel, ps.unlockedSkillIds));
    return hasLockedChild ? "current" : "unlocked";
  }

  return (
    <Panel accent={accent} glow>
      <PanelHeader
        emoji={cls.emoji}
        title={`${cls.name} Skill Tree`}
        subtitle={`${ps.unlockedSkillIds.length}/${nodes.length} unlocked · Class Lv ${ps.classLevel}`}
        accent={accent}
      />

      <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
        {/* tree canvas */}
        <div
          className="relative mx-auto w-full max-w-md rounded-2xl"
          style={{ aspectRatio: "4 / 3", background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04), rgba(8,11,18,0.4))", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          {/* connectors */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {nodes.flatMap((n) =>
              n.requires.map((reqId) => {
                const a = positions[reqId];
                const b = positions[n.id];
                if (!a || !b) return null;
                const lit = isSkillUnlocked(n, ps.classLevel, ps.unlockedSkillIds);
                return (
                  <line
                    key={`${reqId}-${n.id}`}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={lit ? accent : "rgba(255,255,255,0.12)"}
                    strokeWidth={lit ? 1.2 : 0.8}
                    strokeLinecap="round"
                  />
                );
              })
            )}
          </svg>
          {/* nodes */}
          {nodes.map((n) => {
            const p = positions[n.id];
            return (
              <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                <SkillNode node={n} accent={accent} state={stateOf(n)} selected={selectedId === n.id} onSelect={() => setSelectedId(n.id)} />
              </div>
            );
          })}
        </div>

        {/* detail panel */}
        {selected && (
          <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selected.emoji}</span>
              <div>
                <h4 className="font-display text-sm font-bold text-white">{selected.name}</h4>
                <p className="text-[11px] text-slate-400">Tier {selected.tier}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-300">{selected.description}</p>
            <dl className="mt-3 space-y-1.5 text-[11px]">
              <Row label="Perk" value={selected.perk} />
              <Row label="Unlocks at" value={`Class Lv ${selected.classLevel}`} />
              <Row
                label="Status"
                value={isSkillUnlocked(selected, ps.classLevel, ps.unlockedSkillIds) ? "✓ Unlocked" : "🔒 Locked"}
                valueColor={isSkillUnlocked(selected, ps.classLevel, ps.unlockedSkillIds) ? "#34d399" : "#94a3b8"}
              />
              {selected.requires.length > 0 && (
                <Row label="Needs" value={selected.requires.map((r) => skillsForClass(classId).find((s) => s.id === r)?.name).filter(Boolean).join(", ")} />
              )}
            </dl>
          </div>
        )}
      </div>
    </Panel>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-medium" style={{ color: valueColor ?? "#e2e8f0" }}>
        {value}
      </dd>
    </div>
  );
}

/** Assign x% per node spread within its tier; y% by tier depth. */
function layout(nodes: SkillNodeData[]): Record<string, { x: number; y: number }> {
  const byTier: Record<number, SkillNodeData[]> = {};
  for (const n of nodes) (byTier[n.tier] ||= []).push(n);
  const yForTier: Record<number, number> = { 1: 16, 2: 50, 3: 84 };
  const pos: Record<string, { x: number; y: number }> = {};
  for (const tierStr of Object.keys(byTier)) {
    const tier = Number(tierStr);
    const list = byTier[tier];
    const n = list.length;
    list.forEach((node, i) => {
      const x = n === 1 ? 50 : 50 + ((i - (n - 1) / 2) * (60 / Math.max(1, n - 1)));
      pos[node.id] = { x, y: yForTier[tier] ?? 50 };
    });
  }
  return pos;
}
