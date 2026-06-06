"use client";

/**
 * GameShell — the RPG command center layout.
 *  - Top: PlayerHUD
 *  - Sticky section nav (Town/Map/Quests/Skills/Guilds/Arena/Rewards)
 *  - Desktop: left character rail · center stage · right "next up" rail
 *  - Mobile/Tablet: center stage with collapsible Character / Next-up drawers
 *    (kept as a top sticky scroll nav — NOT a fixed bottom bar — so it never
 *    collides with the app's existing mobile bottom tab bar).
 */

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Castle, Map as MapIcon, ScrollText, Network, Users, Swords, Gift, UserRound, Compass } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { PlayerHUD } from "./PlayerHUD";
import { CharacterPanel } from "./CharacterPanel";
import { RightRail } from "./RightRail";

export type SectionKey = "town" | "map" | "quests" | "skills" | "guilds" | "arena" | "rewards";

const NAV: { key: SectionKey; label: string; href: string; icon: ReactNode }[] = [
  { key: "town", label: "Town", href: "/learn", icon: <Castle size={16} /> },
  { key: "map", label: "Map", href: "/learn/map", icon: <MapIcon size={16} /> },
  { key: "quests", label: "Quests", href: "/learn/quests", icon: <ScrollText size={16} /> },
  { key: "skills", label: "Skills", href: "/learn/skills", icon: <Network size={16} /> },
  { key: "guilds", label: "Guilds", href: "/learn/guilds", icon: <Users size={16} /> },
  { key: "arena", label: "Arena", href: "/learn/arena", icon: <Swords size={16} /> },
  { key: "rewards", label: "Rewards", href: "/learn/rewards", icon: <Gift size={16} /> },
];

export function GameShell({
  ps,
  active,
  children,
}: {
  ps: PlayerState;
  active: SectionKey;
  children: ReactNode;
}) {
  const [drawer, setDrawer] = useState<null | "character" | "next">(null);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-24 pt-3 sm:px-4 lg:pb-8">
      {/* HUD */}
      <PlayerHUD ps={ps} />

      {/* Section nav */}
      <nav
        aria-label="Game sections"
        className="sticky top-2 z-30 mt-3 flex gap-1 overflow-x-auto rounded-2xl p-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ background: "rgba(10,12,18,0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}
      >
        {NAV.map((n) => {
          const isActive = n.key === active;
          return (
            <Link
              key={n.key}
              href={n.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                isActive ? "text-slate-900" : "text-slate-300 hover:bg-white/[0.06]"
              }`}
              style={isActive ? { background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4)" } : undefined}
            >
              {n.icon}
              <span>{n.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile drawer toggles */}
      <div className="mt-3 flex gap-2 lg:hidden">
        <DrawerToggle active={drawer === "character"} onClick={() => setDrawer(drawer === "character" ? null : "character")} icon={<UserRound size={14} />} label="Character" />
        <DrawerToggle active={drawer === "next"} onClick={() => setDrawer(drawer === "next" ? null : "next")} icon={<Compass size={14} />} label="Next up" />
      </div>
      {drawer === "character" && (
        <div className="mt-3 lg:hidden">
          <CharacterPanel ps={ps} />
        </div>
      )}
      {drawer === "next" && (
        <div className="mt-3 lg:hidden">
          <RightRail ps={ps} />
        </div>
      )}

      {/* Columns */}
      <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-4">
            <CharacterPanel ps={ps} />
          </div>
        </aside>

        <main className="min-w-0">{children}</main>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <RightRail ps={ps} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function DrawerToggle({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition ${
        active ? "bg-white/15 text-white" : "text-slate-300 hover:bg-white/[0.06]"
      }`}
      style={{ border: "1px solid rgba(255,255,255,0.08)" }}
    >
      {icon}
      {label}
    </button>
  );
}
