"use client";

/** IsoTile — one cobblestone diamond floor tile (original CSS art). */

import { TILE_W, TILE_H } from "./iso";

const DIAMOND = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

export type TileVariant = "a" | "b" | "path" | "accent" | "grass";

const FILLS: Record<TileVariant, string> = {
  a: "#3a4458",
  b: "#333d52",
  path: "#46526c",
  accent: "#2e3b57",
  grass: "#1f6b4f",
};

export function IsoTile({ variant = "a", glow }: { variant?: TileVariant; glow?: string }) {
  return (
    <div
      style={{
        width: TILE_W,
        height: TILE_H,
        clipPath: DIAMOND,
        background: FILLS[variant],
        boxShadow: glow ? `inset 0 0 0 1px ${glow}` : "inset 2px 1px 0 rgba(255,255,255,0.06), inset -2px -1px 0 rgba(0,0,0,0.28)",
      }}
    />
  );
}
