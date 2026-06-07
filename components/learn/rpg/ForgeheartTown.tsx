"use client";

/**
 * ForgeheartTown — renders the Forgeheart City vector art (one responsive SVG
 * from forgeheartArt, the single source of truth shared with previews) and
 * layers accessible, kid-friendly <button> overlays for client-side routing.
 *
 * Kid-UX layer on top of the art:
 *  - every clickable place wears a visible "tap me" marker so kids know it's
 *    interactive (no hidden hotspots),
 *  - hover / focus / tap shows a plain-language tooltip explaining the place,
 *  - a gentle "Start here" beacon points at the recommended next stop,
 *  - a one-time coachmark explains how to play,
 *  - a readable "Places to explore" button row gives little kids an easy way
 *    to navigate without having to hit small map buildings.
 */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { PlayerState } from "@/lib/rpg/state";
import { WORLD_MAPS } from "@/lib/data/rpg-maps";
import { mapStatusFor } from "@/lib/rpg/state";
import { buildTownSvg, SUBJECTS, PORTAL_X, VB_W, VB_H, type AvatarLook } from "./forgeheartArt";
import { loadAvatar, hydrateAvatar } from "./useAvatar";

interface Hit {
  id: string;
  name: string;       // short, friendly name shown to kids
  emoji: string;      // quick visual cue
  tip: string;        // plain-language "what you can do here"
  href: string;
  x: number; y: number; w: number; h: number; // hotspot box in viewBox units
}

const COACH_KEY = "fh-coach-seen-v1";

export function ForgeheartTown({ ps }: { ps: PlayerState }) {
  const router = useRouter();
  const classId = ps.cls?.id ?? "scholar";
  const accent = ps.cls?.accent ?? "#7c5cff";
  const totalMaps = WORLD_MAPS.length;
  const unlockedMapCount = useMemo(() => WORLD_MAPS.filter((m) => mapStatusFor(m, ps).unlocked).length, [ps]);

  // saved hero cosmetics (worn in town)
  const [look, setLook] = useState<AvatarLook>({});
  useEffect(() => {
    setLook(loadAvatar());
    hydrateAvatar().then((s) => { if (s) setLook(s); });
  }, []);

  // first-visit coachmark
  const [showCoach, setShowCoach] = useState(false);
  useEffect(() => {
    try { if (!localStorage.getItem(COACH_KEY)) setShowCoach(true); } catch { /* ignore */ }
  }, []);
  const dismissCoach = () => {
    setShowCoach(false);
    try { localStorage.setItem(COACH_KEY, "1"); } catch { /* ignore */ }
  };

  const [hover, setHover] = useState<string | null>(null);

  const hits: Hit[] = [
    { id: "class", name: "Class Hall", emoji: "📘", tip: "Grow your hero's powers and skills.", href: "/learn/skills", x: 140, y: 205, w: 150, h: 222 },
    { id: "guild", name: "Career Guild", emoji: "🏛️", tip: "Peek at cool jobs you could grow into.", href: "/learn/careers", x: 930, y: 205, w: 150, h: 222 },
    { id: "mentor", name: "Mentor Tower", emoji: "🧙", tip: "Ask your friendly helper for a hand.", href: "/mentor", x: 1028, y: 360, w: 124, h: 272 },
    { id: "parent", name: "Parent Office", emoji: "🏠", tip: "A spot for grown-ups to see your wins.", href: "/parent", x: 66, y: 432, w: 132, h: 192 },
    { id: "quest", name: "Quest Board", emoji: "📜", tip: "Pick a fun quest and start learning!", href: "/learn/quests", x: 322, y: 392, w: 136, h: 156 },
    { id: "reward", name: "Reward Shop", emoji: "🎁", tip: "Spend tokens on hats, capes and badges.", href: "/learn/rewards", x: 220, y: 558, w: 130, h: 116 },
    { id: "arena", name: "Arena", emoji: "⚔️", tip: "Friendly quiz duels — no one gets hurt!", href: "/learn/arena", x: 760, y: 503, w: 140, h: 174 },
    { id: "avatar", name: "Dress Up", emoji: "✨", tip: "Make your hero look just like you.", href: "/learn/avatar", x: 578, y: 600, w: 84, h: 110 },
    ...SUBJECTS.map((s, i) => ({
      id: `p-${s.id}`,
      name: s.name,
      emoji: ["🔢", "📖", "🦅", "🔬", "🗺️"][i] ?? "🌟",
      tip: "Step through the portal to play and learn.",
      href: `/learn/${s.id}`,
      x: PORTAL_X[i] - 56, y: 70, w: 112, h: 120,
    })),
  ];

  // Recommended next stop: the Quest Board is always a safe, fun starting point.
  const startId = "quest";

  const svg = useMemo(
    () => buildTownSvg({ classId, accent, name: ps.name, level: ps.characterLevel, maps: `${unlockedMapCount}/${totalMaps}`, look }),
    [classId, accent, ps.name, ps.characterLevel, unlockedMapCount, totalMaps, look]
  );

  const go = (href: string) => router.push(href);

  return (
    <section aria-label="Forgeheart City map">
      {/* Friendly how-to coachmark (first visit) */}
      {showCoach && (
        <div className="mb-3 flex items-start gap-3 rounded-2xl p-3 sm:p-4" style={{ background: "linear-gradient(180deg, rgba(124,92,255,0.18), rgba(8,13,22,0.6))", border: "1px solid rgba(124,92,255,0.4)" }}>
          <span className="text-2xl" aria-hidden>🗺️</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-white">Welcome to Forgeheart City!</p>
            <p className="mt-0.5 text-xs text-slate-300">Tap any glowing place on the map — or a button below — to play. The <span className="font-semibold text-amber-300">Quest Board</span> is a great place to start. ✨</p>
          </div>
          <button onClick={dismissCoach} className="flex-shrink-0 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20">Got it</button>
        </div>
      )}

      {/* The town map with kid-friendly overlays */}
      <div className="relative w-full overflow-x-auto rounded-2xl" style={{ border: "1px solid rgba(56,189,248,0.25)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), 0 18px 55px -22px #000" }}>
        <div className="relative" style={{ minWidth: 860 }}>
          <div dangerouslySetInnerHTML={{ __html: svg }} />

          {hits.map((h) => {
            const cx = ((h.x + h.w / 2) / VB_W) * 100;
            const isStart = h.id === startId;
            const isHover = hover === h.id;
            return (
              <div key={h.id}>
                {/* clickable area */}
                <button
                  className="fh-hit"
                  aria-label={`${h.name}. ${h.tip}`}
                  onClick={() => go(h.href)}
                  onMouseEnter={() => setHover(h.id)}
                  onMouseLeave={() => setHover((v) => (v === h.id ? null : v))}
                  onFocus={() => setHover(h.id)}
                  onBlur={() => setHover((v) => (v === h.id ? null : v))}
                  style={{ left: `${(h.x / VB_W) * 100}%`, top: `${(h.y / VB_H) * 100}%`, width: `${(h.w / VB_W) * 100}%`, height: `${(h.h / VB_H) * 100}%` }}
                />

                {/* always-visible "tap me" marker so kids know it's interactive */}
                <span
                  aria-hidden
                  className={`fh-marker${isStart ? " fh-marker-start" : ""}`}
                  style={{ left: `${cx}%`, top: `${(h.y / VB_H) * 100}%` }}
                >
                  {h.emoji}
                </span>

                {/* "Start here" beacon on the recommended stop */}
                {isStart && (
                  <span aria-hidden className="fh-beacon" style={{ left: `${cx}%`, top: `${(h.y / VB_H) * 100}%` }}>
                    Start here ✨
                  </span>
                )}

                {/* plain-language tooltip on hover / focus */}
                {isHover && (
                  <span className="fh-tip" style={{ left: `${cx}%`, top: `${((h.y - 6) / VB_H) * 100}%` }}>
                    <span className="font-bold">{h.name}</span>
                    <span className="block text-[11px] font-normal opacity-90">{h.tip}</span>
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Readable "Places to explore" row — easy navigation for little kids who
          struggle to tap small map buildings. Plain words + big targets. */}
      <div className="mt-3">
        <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-400">Places to explore</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {hits.filter((h) => !h.id.startsWith("p-")).map((h) => (
            <button
              key={h.id}
              onClick={() => go(h.href)}
              onMouseEnter={() => setHover(h.id)}
              onMouseLeave={() => setHover((v) => (v === h.id ? null : v))}
              className="group flex items-center gap-3 rounded-2xl p-3 text-left transition hover:-translate-y-0.5"
              style={{ background: "linear-gradient(180deg, rgba(22,32,52,0.85), rgba(8,13,22,0.85))", border: `1px solid ${h.id === startId ? "rgba(252,211,77,0.55)" : "rgba(56,189,248,0.18)"}` }}
            >
              <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl text-xl" style={{ background: "rgba(56,189,248,0.12)" }} aria-hidden>{h.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-bold text-white">{h.name}</span>
                <span className="block truncate text-[11px] text-slate-400">{h.tip}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
