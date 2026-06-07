"use client";

/**
 * ForgeheartTown — renders the Forgeheart City vector art (one responsive SVG
 * from forgeheartArt, the single source of truth shared with previews) and
 * layers accessible <button> overlays for client-side routing.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PlayerState } from "@/lib/rpg/state";
import { WORLD_MAPS } from "@/lib/data/rpg-maps";
import { mapStatusFor } from "@/lib/rpg/state";
import { buildTownSvg, SUBJECTS, PORTAL_X, VB_W, VB_H } from "./forgeheartArt";

interface Hit { id: string; label: string; href: string; x: number; y: number; w: number; h: number; }

export function ForgeheartTown({ ps }: { ps: PlayerState }) {
  const router = useRouter();
  const classId = ps.cls?.id ?? "scholar";
  const accent = ps.cls?.accent ?? "#7c5cff";
  const totalMaps = WORLD_MAPS.length;
  const unlockedMapCount = useMemo(() => WORLD_MAPS.filter((m) => mapStatusFor(m, ps).unlocked).length, [ps]);

  const hits: Hit[] = [
    { id: "class", label: "Class Hall — skill tree & job progress", href: "/learn/skills", x: 140, y: 205, w: 150, h: 222 },
    { id: "guild", label: "Career Guild Hall — real career paths", href: "/learn/careers", x: 930, y: 205, w: 150, h: 222 },
    { id: "mentor", label: "Mentor Tower — kid-safe AI tutor", href: "/mentor", x: 1028, y: 360, w: 124, h: 272 },
    { id: "parent", label: "Parent Office — family reports", href: "/parent", x: 66, y: 432, w: 132, h: 192 },
    { id: "quest", label: "Quest Board — daily, class & career quests", href: "/learn/quests", x: 322, y: 392, w: 136, h: 156 },
    { id: "reward", label: "Reward Shop — cosmetics, badges & tokens", href: "/learn/rewards", x: 220, y: 558, w: 130, h: 116 },
    { id: "arena", label: "Arena Gate — safe quiz duels", href: "/learn/arena", x: 760, y: 503, w: 140, h: 174 },
    ...SUBJECTS.map((s, i) => ({ id: `p-${s.id}`, label: `${s.name} realm — ${s.id} maps`, href: `/learn/${s.id}`, x: PORTAL_X[i] - 56, y: 70, w: 112, h: 120 })),
  ];

  const svg = useMemo(
    () => buildTownSvg({ classId, accent, name: ps.name, level: ps.characterLevel, maps: `${unlockedMapCount}/${totalMaps}` }),
    [classId, accent, ps.name, ps.characterLevel, unlockedMapCount, totalMaps]
  );

  return (
    <div className="relative w-full overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(56,189,248,0.25)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), 0 18px 55px -22px #000" }}>
      <div className="relative" style={{ minWidth: 860 }}>
        <div dangerouslySetInnerHTML={{ __html: svg }} />
        {hits.map((h) => (
          <button
            key={h.id}
            className="fh-hit"
            aria-label={h.label}
            onClick={() => router.push(h.href)}
            style={{ left: `${(h.x / VB_W) * 100}%`, top: `${(h.y / VB_H) * 100}%`, width: `${(h.w / VB_W) * 100}%`, height: `${(h.h / VB_H) * 100}%` }}
          />
        ))}
      </div>
    </div>
  );
}
