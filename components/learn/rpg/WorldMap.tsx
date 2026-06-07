"use client";

/**
 * WorldMap — the world map screen. Recommended next zone, a connected "journey
 * path" of the core subject realms, and the full grid of zones (subject realms
 * + career zones) with unlock/progress/mastery state.
 */

import type { PlayerState } from "@/lib/rpg/state";
import { mapStatusFor, bossCleared } from "@/lib/rpg/state";
import { WORLD_MAPS, type WorldMap as WorldMapData } from "@/lib/data/rpg-maps";
import { Panel, PanelHeader } from "./primitives";
import { MapZoneCard } from "./MapZoneCard";

export function WorldMap({ ps }: { ps: PlayerState }) {
  const recommended = pickRecommended(ps);

  const realms = WORLD_MAPS.filter((m) => ["number-kingdom", "story-forest", "bayani-isles", "lab-reef", "history-archipelago"].includes(m.id));
  const careerZones = WORLD_MAPS.filter((m) => !realms.includes(m));

  return (
    <div className="space-y-4">
      <Panel accent="#38bdf8" glow>
        <PanelHeader emoji="🗺️" title="World Map" subtitle="Choose where to adventure next" accent="#38bdf8" />
        <div className="px-4 pb-4 pt-2">
          <JourneyPath realms={realms} ps={ps} recommendedId={recommended?.id} />
        </div>
      </Panel>

      <section>
        <SectionTitle emoji="🌟" title="Subject Realms" subtitle="The five core worlds" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {realms.map((m) => (
            <MapZoneCard key={m.id} map={m} ps={ps} recommended={recommended?.id === m.id} />
          ))}
        </div>
      </section>

      <section>
        <SectionTitle emoji="🧭" title="Career Zones" subtitle="Advanced worlds tied to real jobs" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {careerZones.map((m) => (
            <MapZoneCard key={m.id} map={m} ps={ps} recommended={recommended?.id === m.id} />
          ))}
        </div>
      </section>
    </div>
  );
}

function pickRecommended(ps: PlayerState): WorldMapData | undefined {
  return WORLD_MAPS.find((m) => {
    const st = mapStatusFor(m, ps);
    return st.unlocked && !bossCleared(m, ps);
  });
}

function SectionTitle({ emoji, title, subtitle }: { emoji: string; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-lg">{emoji}</span>
      <h2 className="font-display text-base font-bold text-white">{title}</h2>
      <span className="text-xs text-slate-500">· {subtitle}</span>
    </div>
  );
}

/** A connected node path across the 5 core realms (visual journey). */
function JourneyPath({ realms, ps, recommendedId }: { realms: WorldMapData[]; ps: PlayerState; recommendedId?: string }) {
  return (
    <div className="relative overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="relative flex min-w-[520px] items-center justify-between gap-1 px-2 py-2">
        {/* connecting line */}
        <span aria-hidden className="absolute left-6 right-6 top-1/2 h-0.5 -translate-y-1/2" style={{ background: "linear-gradient(90deg, #38bdf855, #a78bfa55, #fbbf2455)" }} />
        {realms.map((m) => {
          const st = mapStatusFor(m, ps);
          const cleared = bossCleared(m, ps);
          const isRec = m.id === recommendedId;
          return (
            <div key={m.id} className="relative z-10 flex flex-1 flex-col items-center gap-1">
              <span
                className="grid h-12 w-12 place-items-center rounded-full text-xl transition"
                style={{
                  background: st.unlocked ? `${m.accent}26` : "rgba(255,255,255,0.04)",
                  border: `2px solid ${cleared ? "#34d399" : isRec ? m.accent : st.unlocked ? `${m.accent}88` : "rgba(255,255,255,0.12)"}`,
                  boxShadow: isRec ? `0 0 14px ${m.accent}aa` : "none",
                  filter: st.unlocked ? "none" : "grayscale(0.6) opacity(0.7)",
                }}
                title={m.name}
              >
                {cleared ? "👑" : st.unlocked ? m.emoji : "🔒"}
              </span>
              <span className="max-w-[72px] truncate text-center text-[10px] text-slate-400">{m.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
