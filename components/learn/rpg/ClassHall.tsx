"use client";

/**
 * ClassHall — choose or view your learner class (job). Shows the current class
 * identity + advancement, and a picker to choose/change class. Starter classes
 * are free; advanced classes are marked as Pro paths.
 */

import { useState } from "react";
import { Check } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { LEARNER_CLASSES, type ClassId } from "@/lib/data/rpg-classes";
import { Panel, PanelHeader } from "./primitives";

export function ClassHall({
  ps,
  onSelectClass,
  saving,
}: {
  ps: PlayerState;
  onSelectClass: (id: ClassId) => void;
  saving: boolean;
}) {
  const [picking, setPicking] = useState(!ps.cls);

  return (
    <Panel accent={ps.cls?.accent ?? "#a78bfa"} glow>
      <PanelHeader
        emoji="🏰"
        title="Class Hall"
        subtitle={ps.cls ? `You are a ${ps.cls.name}` : "Choose your learner class"}
        accent={ps.cls?.accent ?? "#a78bfa"}
        right={
          ps.cls ? (
            <button onClick={() => setPicking((p) => !p)} className="px-4 text-xs font-semibold text-sky-300 hover:text-sky-200">
              {picking ? "Cancel" : "Change"}
            </button>
          ) : undefined
        }
      />

      {ps.cls && !picking && (
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-start gap-3 rounded-2xl p-3" style={{ background: `${ps.cls.accent}14`, border: `1px solid ${ps.cls.accent}44` }}>
            <span className="text-3xl">{ps.cls.emoji}</span>
            <div>
              <p className="text-sm font-semibold text-white">{ps.cls.tagline}</p>
              <p className="mt-1 text-xs text-slate-400">{ps.cls.description}</p>
              <p className="mt-2 text-[11px] text-slate-500">
                Path: {ps.cls.advancement.map((a) => a.title).join(" → ")}
              </p>
            </div>
          </div>
        </div>
      )}

      {picking && (
        <div className="grid grid-cols-2 gap-2.5 p-4 sm:grid-cols-3 lg:grid-cols-5">
          {LEARNER_CLASSES.map((c) => {
            const selected = ps.classId === c.id;
            return (
              <button
                key={c.id}
                onClick={() => onSelectClass(c.id)}
                disabled={saving}
                className="group relative flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center transition hover:-translate-y-0.5 disabled:opacity-60"
                style={{
                  background: selected ? `${c.accent}26` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selected ? c.accent : "rgba(255,255,255,0.10)"}`,
                }}
              >
                {!c.starter && <span className="absolute right-1.5 top-1.5 rounded bg-amber-400/20 px-1 text-[8px] font-bold text-amber-300">PRO</span>}
                {selected && (
                  <span className="absolute left-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-emerald-400 text-slate-900">
                    <Check size={11} />
                  </span>
                )}
                <span className="grid h-12 w-12 place-items-center rounded-xl text-2xl" style={{ background: `${c.accent}22`, border: `1px solid ${c.accent}55` }}>
                  {c.emoji}
                </span>
                <span className="text-xs font-semibold text-white">{c.name}</span>
                <span className="line-clamp-2 text-[10px] text-slate-400">{c.tagline}</span>
              </button>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
