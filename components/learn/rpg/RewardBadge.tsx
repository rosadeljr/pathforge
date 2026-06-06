"use client";

/** RewardBadge — a collectible badge/medal surface for rewards & cosmetics. */

import type { Reward } from "@/lib/data/rpg-rewards";

export function RewardBadge({
  reward,
  earned = true,
  size = "md",
  onClick,
}: {
  reward: Reward;
  earned?: boolean;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}) {
  const dim = size === "lg" ? 84 : size === "sm" ? 52 : 66;
  const font = size === "lg" ? 34 : size === "sm" ? 20 : 26;
  const Comp = onClick ? "button" : "div";
  return (
    <Comp
      onClick={onClick}
      className={`group flex flex-col items-center gap-1.5 ${onClick ? "cursor-pointer" : ""}`}
      title={`${reward.name} — ${reward.description}`}
    >
      <span
        className="relative grid place-items-center rounded-2xl transition-transform group-hover:-translate-y-0.5"
        style={{
          width: dim,
          height: dim,
          fontSize: font,
          background: earned
            ? `radial-gradient(circle at 50% 35%, ${reward.accent}33, rgba(8,11,18,0.7))`
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${earned ? `${reward.accent}88` : "rgba(255,255,255,0.08)"}`,
          boxShadow: earned ? `inset 0 1px 0 rgba(255,255,255,0.2), 0 6px 16px -8px ${reward.accent}aa` : "none",
          filter: earned ? "none" : "grayscale(1) opacity(0.5)",
        }}
      >
        {reward.emoji}
        {!earned && <span className="absolute bottom-1 right-1 text-[10px]">🔒</span>}
      </span>
      <span className="max-w-[88px] truncate text-center text-[10px] font-medium text-slate-300">{reward.name}</span>
    </Comp>
  );
}
