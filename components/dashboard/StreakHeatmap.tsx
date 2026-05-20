"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface CompletionDay {
  date: string; // YYYY-MM-DD
  count: number;
}

interface StreakHeatmapProps {
  completions: CompletionDay[];
  days?: number; // default 365
  className?: string;
}

/**
 * GitHub-style activity heatmap showing quest completions.
 * Each cell = 1 day; color intensity = number of quests completed.
 */
export function StreakHeatmap({ completions, days = 365, className }: StreakHeatmapProps) {
  const cells = useMemo(() => {
    // Build a map for O(1) lookup
    const map = new Map<string, number>();
    completions.forEach((c) => map.set(c.date, c.count));

    // Generate last N days, ending today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: Array<{ date: string; count: number; isFuture: boolean }> = [];

    // Pad to start on a Sunday for clean grid alignment
    const oneDay = 24 * 60 * 60 * 1000;
    const totalDays = days;
    const startDate = new Date(today.getTime() - (totalDays - 1) * oneDay);
    // Walk back to most recent Sunday
    const startDay = startDate.getDay();
    startDate.setTime(startDate.getTime() - startDay * oneDay);

    const totalCells = Math.ceil(((today.getTime() - startDate.getTime()) / oneDay) + 1);
    const futureCells = 6 - today.getDay(); // pad to end of week

    for (let i = 0; i <= totalCells + futureCells; i++) {
      const d = new Date(startDate.getTime() + i * oneDay);
      const key = d.toISOString().slice(0, 10);
      const isFuture = d.getTime() > today.getTime();
      result.push({
        date: key,
        count: map.get(key) || 0,
        isFuture,
      });
    }

    return result;
  }, [completions, days]);

  // Group cells into weeks (columns)
  const weeks = useMemo(() => {
    const groups: typeof cells[] = [];
    for (let i = 0; i < cells.length; i += 7) {
      groups.push(cells.slice(i, i + 7));
    }
    return groups;
  }, [cells]);

  const total = completions.reduce((sum, c) => sum + c.count, 0);
  const maxDay = Math.max(...completions.map((c) => c.count), 1);

  const getColor = (count: number, isFuture: boolean): string => {
    if (isFuture) return "rgba(255,255,255,0.02)";
    if (count === 0) return "rgba(255,255,255,0.04)";
    const intensity = Math.min(count / maxDay, 1);
    if (intensity <= 0.25) return "rgba(99,102,241,0.35)";
    if (intensity <= 0.5) return "rgba(139,92,246,0.55)";
    if (intensity <= 0.75) return "rgba(168,85,247,0.75)";
    return "rgba(236,72,153,0.95)";
  };

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-end justify-between mb-3 gap-2">
        <div>
          <h3 className="text-sm font-semibold mb-0.5">Activity</h3>
          <p className="text-xs text-slate-400">
            {total} quest{total === 1 ? "" : "s"} completed in the last {days} days
          </p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-sm"
              style={{ background: getColor(i * maxDay, false) }}
            />
          ))}
          <span>More</span>
        </div>
      </div>

      {/* Grid */}
      <div className="relative overflow-x-auto">
        <div className="flex gap-[3px] min-w-max">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.map((cell, di) => (
                <motion.div
                  key={cell.date}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.3,
                    delay: Math.min(wi * 0.003 + di * 0.001, 0.6),
                  }}
                  className="w-2.5 h-2.5 rounded-sm group relative"
                  style={{ background: getColor(cell.count, cell.isFuture) }}
                  title={`${cell.date}: ${cell.count} quest${cell.count === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
