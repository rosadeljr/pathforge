"use client";

/** LevelProgressBar — a segmented XP bar with a moving fill. Reduced-motion aware. */

import { motion, useReducedMotion } from "framer-motion";

export function LevelProgressBar({
  pct,
  accent = "#38bdf8",
  label,
  height = 10,
  showShine = true,
}: {
  pct: number;
  accent?: string;
  label?: string;
  height?: number;
  showShine?: boolean;
}) {
  const reduced = useReducedMotion();
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="w-full">
      {label && (
        <div className="mb-1 flex items-center justify-between text-[11px] text-slate-400">
          <span>{label}</span>
          <span className="tabular-nums font-semibold text-slate-300">{clamped}%</span>
        </div>
      )}
      <div
        className="relative w-full overflow-hidden rounded-full"
        style={{ height, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)" }}
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || "Progress"}
      >
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${accent}, ${accent}cc)`,
            boxShadow: `0 0 12px ${accent}99`,
          }}
          initial={reduced ? false : { width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          {showShine && !reduced && (
            <span
              aria-hidden
              className="absolute inset-y-0 right-0 w-8 opacity-60"
              style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6))" }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}
