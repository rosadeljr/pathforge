"use client";

/**
 * HeroSprite — the player's avatar: a robust RPG character (CharacterSprite)
 * tinted by the chosen class, standing on a glowing energy ring with a soft
 * aura and a name banner. The CharacterLook here is the seam the dress-up /
 * wardrobe milestone will drive from equipped cosmetics.
 */

import { CharacterSprite } from "./CharacterSprite";

export function HeroSprite({ accent = "#38bdf8", name }: { accent?: string; name?: string }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* name banner */}
      {name && (
        <div
          className="mb-0.5 max-w-[100px] truncate rounded-md px-2 py-0.5 text-[10px] font-bold text-white"
          style={{ background: "rgba(8,15,25,0.7)", border: `1px solid ${accent}`, boxShadow: `0 0 10px ${accent}66` }}
        >
          {name}
        </div>
      )}
      <div className="relative">
        {/* aura */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 60, height: 60, background: `radial-gradient(circle, ${accent}33, transparent 70%)` }}
        />
        {/* energy ground ring */}
        <div
          aria-hidden
          className="absolute left-1/2 rounded-[50%]"
          style={{ bottom: 2, width: 38, height: 13, transform: "translateX(-50%)", background: `radial-gradient(ellipse at center, ${accent}55, transparent 70%)`, border: `1.5px solid ${accent}`, boxShadow: `0 0 10px ${accent}` }}
        />
        <CharacterSprite accent={accent} trim="#fcd34d" hair="#3b2a1a" hat="circlet" width={60} />
      </div>
    </div>
  );
}
