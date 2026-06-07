"use client";

/** SubjectPortal — a glowing realm gate (iso oval portal) with a label. */

import { useReducedMotion } from "framer-motion";

export function SubjectPortal({
  name,
  accent,
  emoji,
  locked,
  onClick,
}: {
  name: string;
  accent: string;
  emoji?: string;
  locked?: boolean;
  onClick?: () => void;
}) {
  const reduced = useReducedMotion();
  return (
    <button
      onClick={onClick}
      disabled={locked}
      aria-label={`Enter ${name}${locked ? " (locked)" : ""}`}
      className={`group relative flex flex-col items-center outline-none ${locked ? "cursor-not-allowed" : ""}`}
    >
      {/* archway */}
      <div className="relative" style={{ width: 92, height: 96 }}>
        <div
          className="absolute left-1/2 top-0 -translate-x-1/2"
          style={{ width: 78, height: 88, borderRadius: "50% 50% 46% 46%", border: `4px solid ${accent}`, borderBottom: "none", boxShadow: locked ? "none" : `0 0 22px ${accent}aa`, opacity: locked ? 0.4 : 1, background: "linear-gradient(180deg, rgba(8,15,25,0.2), rgba(8,15,25,0.7))" }}
        />
        {/* swirl */}
        <div
          className={`absolute left-1/2 top-3 -translate-x-1/2 ${reduced || locked ? "" : "rpg-spin"}`}
          style={{ width: 60, height: 70, borderRadius: "50%", background: `radial-gradient(ellipse at 50% 40%, ${accent}, ${accent}55 55%, transparent 72%)`, opacity: locked ? 0.25 : 0.9 }}
        />
        <span className="absolute left-1/2 top-9 -translate-x-1/2 text-2xl" style={{ filter: `drop-shadow(0 0 6px ${accent})` }}>
          {locked ? "🔒" : emoji}
        </span>
        {/* base */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2" style={{ width: 84, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.3)" }} />
      </div>
      <div
        className="mt-0.5 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold text-white transition group-hover:scale-105"
        style={{ background: "rgba(8,15,25,0.72)", border: `1px solid ${accent}88` }}
      >
        {name}
      </div>
    </button>
  );
}
