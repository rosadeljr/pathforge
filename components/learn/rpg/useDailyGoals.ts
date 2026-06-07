"use client";

/** Reactive view over the Daily Goals store. Re-reads on the custom
 *  "pf-daily-change" event (fired by bumpDailyGoal) and when the tab regains
 *  focus, so progress stays live across pages without a global store. */

import { useCallback, useEffect, useState } from "react";
import {
  readDaily,
  goalsForDate,
  allGoalsDone,
  claimDaily,
  type DailyState,
  type DailyGoal,
} from "@/lib/rpg/daily-goals";
import { logRpgEvent } from "@/lib/rpg/track";

export function useDailyGoals() {
  const [state, setState] = useState<DailyState | null>(null);

  const sync = useCallback(() => setState(readDaily()), []);

  useEffect(() => {
    sync();
    const onChange = () => sync();
    window.addEventListener("pf-daily-change", onChange);
    window.addEventListener("focus", onChange);
    document.addEventListener("visibilitychange", onChange);
    return () => {
      window.removeEventListener("pf-daily-change", onChange);
      window.removeEventListener("focus", onChange);
      document.removeEventListener("visibilitychange", onChange);
    };
  }, [sync]);

  const goals: DailyGoal[] = state ? goalsForDate(state.date) : [];
  const progress = state?.progress ?? { lesson: 0, quest: 0, arena: 0 };
  const completed = goals.filter((g) => (progress[g.metric] ?? 0) >= g.target).length;
  const allDone = state ? allGoalsDone(state) : false;
  const claimed = state?.claimed ?? false;
  const bonusXp = goals.reduce((n, g) => n + g.xp, 0);

  const claim = useCallback(() => {
    if (!allDone || claimed) return;
    claimDaily();
    void logRpgEvent("rpg_daily_claimed", { goals: goals.map((g) => g.id) }, bonusXp);
    sync();
  }, [allDone, claimed, goals, bonusXp, sync]);

  return { ready: state != null, goals, progress, completed, allDone, claimed, bonusXp, claim };
}
