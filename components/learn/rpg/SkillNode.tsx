"use client";

/** SkillNode — a single skill tree node with locked/unlocked/current states. */

import type { SkillNode as SkillNodeData } from "@/lib/data/rpg-skills";

export function SkillNode({
  node,
  accent,
  state,
  onSelect,
  selected,
}: {
  node: SkillNodeData;
  accent: string;
  state: "unlocked" | "current" | "locked";
  onSelect?: () => void;
  selected?: boolean;
}) {
  const unlocked = state !== "locked";
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className="group flex w-[84px] flex-col items-center gap-1 outline-none"
      title={`${node.name} — ${node.description}`}
    >
      <span
        className="relative grid h-14 w-14 place-items-center rounded-2xl text-xl transition-transform group-hover:scale-105 group-focus-visible:ring-2"
        style={{
          background: unlocked ? `radial-gradient(circle at 50% 35%, ${accent}40, rgba(8,11,18,0.7))` : "rgba(255,255,255,0.04)",
          border: `2px solid ${state === "current" ? accent : unlocked ? `${accent}99` : "rgba(255,255,255,0.12)"}`,
          boxShadow: state === "current" ? `0 0 16px ${accent}aa` : unlocked ? `inset 0 1px 0 rgba(255,255,255,0.2)` : "none",
          filter: unlocked ? "none" : "grayscale(0.7) opacity(0.6)",
          // @ts-expect-error css var for ring color
          "--tw-ring-color": accent,
        }}
      >
        {unlocked ? node.emoji : "🔒"}
        {state === "current" && (
          <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1 text-[8px] font-bold text-slate-900">NEW</span>
        )}
      </span>
      <span className={`text-center text-[10px] font-medium leading-tight ${unlocked ? "text-slate-200" : "text-slate-500"}`}>
        {node.name}
      </span>
    </button>
  );
}
