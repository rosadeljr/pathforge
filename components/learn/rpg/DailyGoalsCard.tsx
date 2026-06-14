"use client";

/**
 * DailyGoalsCard — the daily engagement loop. Three goals refresh each day; the
 * bars fill from real actions (lessons, quests, duels). Clearing all three
 * lights up a "Collect" moment and a streak shield. Designed to give kids a
 * clear, fun reason to come back every day.
 */

import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Flame, Check, Sparkles, ArrowRight } from "lucide-react";
import { Panel, PanelHeader } from "./primitives";
import { useDailyGoals } from "./useDailyGoals";
import { Celebration } from "./Celebration";

export function DailyGoalsCard({ streak = 0 }: { streak?: number }) {
  const { ready, goals, progress, completed, allDone, claimed, bonusXp, claim } = useDailyGoals();
  const [celebrate, setCelebrate] = useState(false);
  const reduce = useReducedMotion();

  // Avoid SSR/first-paint flicker until localStorage is read. Show a skeleton
  // (rather than collapsing to nothing) so the rail doesn't jump on load.
  if (!ready) {
    return (
      <Panel accent="#f59e0b">
        <PanelHeader emoji="🎯" title="Daily Goals" subtitle="Loading today's goals…" accent="#f59e0b" />
        <div className="space-y-2 px-3 pb-3 pt-2" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <span className="h-9 w-9 flex-shrink-0 animate-pulse rounded-lg bg-white/10" />
              <div className="min-w-0 flex-1 space-y-2">
                <div className="h-3 w-2/3 animate-pulse rounded bg-white/10" />
                <div className="h-1.5 w-full animate-pulse rounded-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </Panel>
    );
  }

  function handleClaim() {
    claim();
    setCelebrate(true);
  }

  const accent = allDone ? "#34d399" : "#f59e0b";

  return (
    <Panel accent={accent} glow>
      <PanelHeader
        emoji="🎯"
        title="Daily Goals"
        subtitle={`${completed} of ${goals.length} done today`}
        accent={accent}
        right={
          <span
            className="mr-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold"
            style={{ background: "rgba(251,146,60,0.16)", color: "#fdba74", border: "1px solid rgba(251,146,60,0.4)" }}
            title="Day streak"
          >
            <Flame size={13} /> {streak}
          </span>
        }
      />

      <div className="space-y-2 px-3 pb-3 pt-2">
        {goals.map((g) => {
          const have = Math.min(g.target, progress[g.metric] ?? 0);
          const done = have >= g.target;
          const pct = (have / g.target) * 100;
          return (
            <Link
              key={g.id}
              href={g.href}
              className="group flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-white/[0.05]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <motion.span
                // Re-key on completion so the icon pops the moment a goal is cleared.
                key={done ? "done" : "todo"}
                initial={done && !reduce ? { scale: 0.5 } : false}
                animate={done && !reduce ? { scale: [0.5, 1.25, 1] } : { scale: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg text-lg"
                style={{ background: done ? "rgba(52,211,153,0.18)" : "rgba(245,158,11,0.14)", border: `1px solid ${done ? "#34d39955" : "#f59e0b44"}` }}
              >
                {done ? <Check size={16} className="text-emerald-300" /> : g.emoji}
              </motion.span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className={`truncate text-sm font-semibold ${done ? "text-emerald-200 line-through/0" : "text-white"}`}>{g.title}</span>
                  <span className="flex-shrink-0 text-[11px] font-bold tabular-nums text-slate-400">{have}/{g.target}</span>
                </div>
                <div
                  className="mt-1 h-1.5 w-full overflow-hidden rounded-full"
                  style={{ background: "rgba(255,255,255,0.06)" }}
                  role="progressbar"
                  aria-label={`${g.title}: ${have} of ${g.target}`}
                  aria-valuenow={have}
                  aria-valuemin={0}
                  aria-valuemax={g.target}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{ width: `${pct}%`, background: done ? "#34d399" : "linear-gradient(90deg,#fcd34d,#f59e0b)" }}
                  />
                </div>
              </div>
              {!done && <ArrowRight size={14} className="flex-shrink-0 text-slate-500 transition group-hover:translate-x-0.5" />}
            </Link>
          );
        })}

        {/* collect / status row */}
        {allDone ? (
          claimed ? (
            <div className="mt-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500/12 py-2 text-xs font-bold text-emerald-300" style={{ border: "1px solid rgba(52,211,153,0.3)" }}>
              <Check size={14} /> All goals collected — see you tomorrow!
            </div>
          ) : (
            <button
              onClick={handleClaim}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-black text-slate-900 transition active:scale-[0.98]"
              style={{ background: "linear-gradient(180deg,#6ee7b7,#34d399)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 0 18px rgba(52,211,153,0.5)" }}
            >
              <Sparkles size={15} /> Collect +{bonusXp} XP
            </button>
          )
        ) : (
          <p className="px-1 pt-0.5 text-center text-[11px] text-slate-500">
            Clear all three to collect <span className="font-semibold text-amber-300">+{bonusXp} XP</span> and grow your streak.
          </p>
        )}
      </div>

      <Celebration
        show={celebrate}
        title="Daily Goals complete!"
        subtitle={`+${bonusXp} XP · ${streak + 1}-day streak`}
        onDone={() => setCelebrate(false)}
      />
    </Panel>
  );
}
