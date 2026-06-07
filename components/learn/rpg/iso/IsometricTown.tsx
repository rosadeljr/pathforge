"use client";

/**
 * IsometricTown — Forgeheart City as an original isometric educational RPG hub.
 * An iso cobblestone plaza (IsoTile grid) with clickable landmarks (class hall,
 * guild hall, quest board, mentor tower, reward shop, arena gate, parent
 * office), subject realm portals, chibi mentors/avatars with speech bubbles,
 * banners, signs and props. Clickable, hover-glow, locked states, responsive.
 */

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { PlayerState } from "@/lib/rpg/state";
import { TILE_W, TILE_H, isoToScreen } from "./iso";
import { IsoTile, type TileVariant } from "./IsoTile";
import { IsoBuilding } from "./IsoBuilding";
import { QuestBoardBuilding } from "./QuestBoardBuilding";
import { RewardShopStall } from "./RewardShopStall";
import { SubjectPortal } from "./SubjectPortal";
import { ClassMentorNpc } from "./ClassMentorNpc";
import { TownAvatar, type AvatarItem } from "./TownAvatar";
import { SpeechBubble } from "./SpeechBubble";

const COLS = 16;
const ROWS = 16;
const OX = 520;
const OY = 76;
const SW = 1060;
const SH = 760;

function tileVariant(col: number, row: number): TileVariant {
  const d = Math.hypot(col - 7.5, row - 7.5);
  if (d > 8.6) return "grass";
  if (d < 2.4) return "accent";
  if (col === 7 || col === 8 || row === 7 || row === 8) return "path";
  return (col + row) % 2 === 0 ? "a" : "b";
}

const CLASS_ITEM: Record<string, AvatarItem> = {
  scholar: "book", builder: "tools", healer: "satchel", storyteller: "notebook",
  explorer: "compass", guardian: "satchel", merchant: "scroll", "tech-tinkerer": "tools",
  creator: "notebook", navigator: "compass",
};

interface Pos { x: number; y: number; }

export function IsometricTown({ ps }: { ps: PlayerState }) {
  const router = useRouter();
  const go = (href: string) => () => router.push(href);
  const heroAccent = ps.cls?.accent ?? "#38bdf8";

  // landmark + actor screen positions within the stage
  const PORTALS: { name: string; accent: string; emoji: string; route: string; pos: Pos }[] = [
    { name: "Number Kingdom", accent: "#6366f1", emoji: "🏰", route: "/learn/math", pos: { x: 150, y: 70 } },
    { name: "Story Forest", accent: "#10b981", emoji: "🌲", route: "/learn/english", pos: { x: 330, y: 56 } },
    { name: "Bayani Isles", accent: "#f59e0b", emoji: "🏝️", route: "/learn/filipino", pos: { x: 530, y: 50 } },
    { name: "Lab Reef", accent: "#06b6d4", emoji: "🔬", route: "/learn/science", pos: { x: 730, y: 56 } },
    { name: "History Archipelago", accent: "#a78bfa", emoji: "🗺️", route: "/learn/araling-panlipunan", pos: { x: 910, y: 70 } },
  ];

  // entities rendered with painter depth (sorted by y)
  const entities: { y: number; z?: number; node: ReactNode }[] = [];
  const add = (x: number, y: number, node: ReactNode, dz = 0) =>
    entities.push({ y, node: <Positioned x={x} y={y} z={Math.round(y) + dz}>{node}</Positioned> });

  // portals (back)
  PORTALS.forEach((p) => add(p.pos.x, p.pos.y, <SubjectPortal name={p.name} accent={p.accent} emoji={p.emoji} onClick={go(p.route)} />));

  // fountain (behind board)
  add(530, 300, <Fountain />);

  // buildings
  add(250, 300, <IsoBuilding label="Class Hall" emoji="🎓" accent="#a78bfa" onClick={go("/learn/skills")} banner={{ color: "#a78bfa", crest: "✦" }} />);
  add(820, 300, <IsoBuilding label="Career Guild Hall" emoji="🏛️" accent="#fb7185" onClick={go("/learn/guilds")} banner={{ color: "#fb7185", crest: "⚜" }} />);
  add(940, 470, <IsoBuilding label="Mentor Tower" emoji="🔮" accent="#38bdf8" height={92} bw={46} onClick={go("/mentor")} />);
  add(120, 470, <IsoBuilding label="Parent Office" emoji="🏡" accent="#60a5fa" bw={50} onClick={go("/parent")} />);
  add(530, 430, <QuestBoardBuilding onClick={go("/learn/quests")} count={undefined} />);
  add(330, 560, <RewardShopStall onClick={go("/learn/rewards")} />);
  add(720, 560, <IsoBuilding label="Arena Gate" emoji="⚔️" accent="#f43f5e" bw={52} status={ps.characterLevel >= 2 ? "open" : "locked"} onClick={go("/learn/arena")} />);

  // mentors / townsfolk (chibi) with speech bubbles
  add(360, 360, <ClassMentorNpc name="Mentor Vale" line="Welcome, Scholar!" accent="#6366f1" item="book" hat="glasses" />);
  add(640, 500, <ClassMentorNpc name="Pip" line="Quiz duel?" accent="#22d3ee" item="scroll" flip />);
  add(430, 600, <ClassMentorNpc name="Lumi" line="Trade stickers!" accent="#f472b6" item="notebook" hat="cap" />);
  add(700, 470, <ClassMentorNpc name="Coach Bru" line="Good luck!" accent="#f43f5e" item="satchel" hat="hood" flip />);
  add(210, 560, <ClassMentorNpc name="Tala" line="New maps await!" accent="#34d399" item="compass" />);

  // signs + props
  add(470, 470, <TownSignProp text="Plaza" />, -2);
  add(150, 360, <Lamp />);
  add(900, 360, <Lamp />);
  add(300, 640, <Crates />);
  add(760, 640, <Crates />);

  // player avatar (front-center)
  add(
    540,
    640,
    <div className="relative flex flex-col items-center">
      <div className="absolute bottom-full mb-1">
        <SpeechBubble text={ps.cls ? `${ps.classTitle?.title ?? ps.cls.name}` : "Pick a class!"} accent={heroAccent} icon="★" />
      </div>
      <TownAvatar accent={heroAccent} trim="#fcd34d" item={ps.cls ? CLASS_ITEM[ps.cls.id] : "book"} hat="circlet" width={66} />
      <div className="mt-0.5 rounded px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: "rgba(8,15,25,0.75)", border: `1px solid ${heroAccent}` }}>
        {ps.name} · Lv {ps.characterLevel}
      </div>
    </div>,
    50
  );

  entities.sort((a, b) => a.y - b.y);

  // floor tiles
  const tiles: ReactNode[] = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const { x, y } = isoToScreen(col, row, OX, OY);
      tiles.push(
        <div key={`${col}-${row}`} className="absolute" style={{ left: x - TILE_W / 2, top: y, zIndex: 0 }}>
          <IsoTile variant={tileVariant(col, row)} />
        </div>
      );
    }
  }

  return (
    <div
      className="relative w-full overflow-auto rounded-2xl"
      style={{ height: "70vh", minHeight: 480, border: "1px solid rgba(56,189,248,0.25)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), 0 18px 55px -22px #000", background: "radial-gradient(120% 90% at 50% 0%, #14403a, #0a2018 70%)" }}
    >
      {/* stage */}
      <div className="relative mx-auto" style={{ width: SW, height: SH }}>
        {/* plaza glow under center */}
        <div aria-hidden className="absolute" style={{ left: SW / 2 - 220, top: 200, width: 440, height: 300, background: "radial-gradient(ellipse at center, rgba(103,232,249,0.12), transparent 70%)", pointerEvents: "none" }} />
        {tiles}
        {entities.map((e, i) => (
          <div key={i}>{e.node}</div>
        ))}
      </div>

      {/* fixed overlays */}
      <div className="pointer-events-none sticky left-3 top-3 z-50 inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-[11px] font-bold tracking-wide text-cyan-100 backdrop-blur" style={{ background: "rgba(8,15,25,0.6)", border: "1px solid rgba(56,189,248,0.35)" }}>
        <span className="inline-block h-2 w-2 rounded-full bg-cyan-400" style={{ boxShadow: "0 0 8px #22d3ee" }} />
        FORGEHEART CITY
      </div>
    </div>
  );
}

function Positioned({ x, y, z, children }: { x: number; y: number; z: number; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: x, top: y, transform: "translate(-50%, -100%)", zIndex: z }}>
      {children}
    </div>
  );
}

/* ---- small props ---- */
function Fountain() {
  return (
    <svg width="120" height="96" viewBox="0 0 120 96" style={{ overflow: "visible", filter: "drop-shadow(0 6px 8px rgba(0,0,0,0.4))" }}>
      <ellipse cx="60" cy="86" rx="50" ry="12" fill="#000" opacity="0.25" />
      <ellipse cx="60" cy="74" rx="48" ry="20" fill="#3a4458" stroke="#222c3e" strokeWidth="2" />
      <ellipse cx="60" cy="70" rx="38" ry="15" fill="#22d3ee" opacity="0.9" />
      <ellipse cx="60" cy="66" rx="24" ry="9" fill="#3a4458" stroke="#222c3e" strokeWidth="1.5" />
      <ellipse cx="60" cy="63" rx="15" ry="6" fill="#67e8f9" />
      <rect x="56" y="40" width="8" height="22" rx="2" fill="#46587a" />
      <circle cx="60" cy="38" r="6" fill="#a5f3fc" style={{ filter: "drop-shadow(0 0 6px #67e8f9)" }} />
    </svg>
  );
}
function Lamp() {
  return (
    <svg width="20" height="56" viewBox="0 0 20 56" style={{ overflow: "visible" }}>
      <ellipse cx="10" cy="54" rx="7" ry="2.5" fill="#000" opacity="0.25" />
      <rect x="8" y="14" width="4" height="40" rx="2" fill="#2b3344" />
      <rect x="4" y="4" width="12" height="12" rx="3" fill="#1f2937" stroke="#3a4458" />
      <circle cx="10" cy="10" r="4" fill="#fde68a" style={{ filter: "drop-shadow(0 0 6px #fbbf24)" }} />
    </svg>
  );
}
function Crates() {
  return (
    <svg width="56" height="44" viewBox="0 0 56 44" style={{ overflow: "visible" }}>
      <ellipse cx="28" cy="42" rx="26" ry="5" fill="#000" opacity="0.22" />
      <rect x="6" y="18" width="22" height="22" rx="2" fill="#7c5a36" stroke="#0c1018" />
      <rect x="6" y="18" width="22" height="22" rx="2" fill="none" stroke="#9a7349" strokeWidth="1" />
      <path d="M6 29 H28 M17 18 V40" stroke="#5a4026" strokeWidth="1" />
      <rect x="30" y="24" width="18" height="16" rx="2" fill="#6b4a2b" stroke="#0c1018" />
      <circle cx="39" cy="20" r="6" fill="#ef4444" />
      <circle cx="44" cy="22" r="5" fill="#34d399" />
    </svg>
  );
}
function TownSignProp({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="whitespace-nowrap rounded-md px-2 py-0.5 text-[9px] font-bold text-amber-50" style={{ background: "linear-gradient(180deg,#7c5a36,#5a4026)", border: "1px solid #fcd34d" }}>
        {text}
      </div>
      <div style={{ width: 3, height: 12, background: "#4a3a24" }} />
    </div>
  );
}
