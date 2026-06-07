"use client";

/** IsoTile — one cobblestone diamond floor tile (original CSS art). */

import { TILE_W, TILE_H } from "./iso";

const DIAMOND = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

export function IsoTile({ color, glow }: { color: string; glow?: string }) {
  return (
    <div
      style={{
        width: TILE_W,
        height: TILE_H,
        clipPath: DIAMOND,
        background: color,
        boxShadow: glow
          ? `inset 0 0 0 1px ${glow}`
          : "inset 2px 1px 0 rgba(255,255,255,0.09), inset -2px -2px 0 rgba(0,0,0,0.30)",
      }}
    />
  );
}
