"use client";

/**
 * ForgeheartTown — the PathForge isometric career-academy town, rendered as ONE
 * responsive SVG (vector art, viewBox-scaled) so it looks identical in the
 * browser and in static previews, with no fragile DOM/transform math.
 * Accessible <button> overlays sit over each landmark for client-side routing.
 *
 * Original PathForge art — classic isometric MMORPG *feeling* only (chibi
 * avatars, cobblestone plaza, stalls, banners, portals), no copied assets.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { PlayerState } from "@/lib/rpg/state";
import { WORLD_MAPS } from "@/lib/data/rpg-maps";
import { mapStatusFor } from "@/lib/rpg/state";

const VB_W = 1200;
const VB_H = 780;

type Look = { item: string; hat: string; acc: "none" | "shield" | "goggles" };
const CLASS_LOOK: Record<string, Look> = {
  scholar: { item: "book", hat: "glasses", acc: "none" },
  builder: { item: "tools", hat: "cap", acc: "goggles" },
  healer: { item: "satchel", hat: "hood", acc: "none" },
  storyteller: { item: "scroll", hat: "circlet", acc: "none" },
  explorer: { item: "compass", hat: "cap", acc: "none" },
  guardian: { item: "satchel", hat: "circlet", acc: "shield" },
  merchant: { item: "scroll", hat: "cap", acc: "none" },
  "tech-tinkerer": { item: "tools", hat: "glasses", acc: "goggles" },
  creator: { item: "notebook", hat: "circlet", acc: "none" },
  navigator: { item: "compass", hat: "hood", acc: "none" },
};

interface Hit { id: string; label: string; href: string; x: number; y: number; w: number; h: number; }

export function ForgeheartTown({ ps }: { ps: PlayerState }) {
  const router = useRouter();
  const classId = ps.cls?.id ?? "scholar";
  const accent = ps.cls?.accent ?? "#7c5cff";

  const totalMaps = WORLD_MAPS.length;
  const unlockedMapCount = useMemo(
    () => WORLD_MAPS.filter((m) => mapStatusFor(m, ps).unlocked).length,
    [ps]
  );

  const SUBJECTS: { id: string; name: string; accent: string }[] = [
    { id: "math", name: "Number Kingdom", accent: "#6366f1" },
    { id: "english", name: "Story Forest", accent: "#10b981" },
    { id: "filipino", name: "Bayani Isles", accent: "#f59e0b" },
    { id: "science", name: "Lab Reef", accent: "#06b6d4" },
    { id: "araling-panlipunan", name: "History Isles", accent: "#a78bfa" },
  ];
  const portalX = [210, 405, 600, 795, 990];

  const hits: Hit[] = [
    { id: "class", label: "Class Hall — skill tree & job progress", href: "/learn/skills", x: 150, y: 232, w: 135, h: 168 },
    { id: "guild", label: "Career Guild Hall — real career paths", href: "/learn/careers", x: 918, y: 232, w: 135, h: 168 },
    { id: "mentor", label: "Mentor Tower — kid-safe AI tutor", href: "/mentor", x: 1006, y: 430, w: 116, h: 205 },
    { id: "parent", label: "Parent Office — family reports", href: "/parent", x: 90, y: 480, w: 120, h: 156 },
    { id: "quest", label: "Quest Board — daily, class & career quests", href: "/learn/quests", x: 356, y: 404, w: 168, h: 156 },
    { id: "reward", label: "Reward Shop — cosmetics, badges & tokens", href: "/learn/rewards", x: 230, y: 556, w: 144, h: 124 },
    { id: "arena", label: "Arena Gate — safe quiz duels", href: "/learn/arena", x: 722, y: 500, w: 168, h: 168 },
    ...SUBJECTS.map((s, i) => ({ id: `portal-${s.id}`, label: `${s.name} realm — ${s.id} maps`, href: `/learn/${s.id}`, x: portalX[i] - 60, y: 30, w: 120, h: 132 })),
  ];

  const svg = useMemo(
    () => buildTownSvg({ classId, accent, name: ps.name, level: ps.characterLevel, rank: ps.rank.title, subjects: SUBJECTS, portalX, maps: `${unlockedMapCount}/${totalMaps}` }),
    [classId, accent, ps.name, ps.characterLevel, ps.rank.title, unlockedMapCount, totalMaps]
  );

  return (
    <div
      className="relative w-full overflow-x-auto rounded-2xl"
      style={{ border: "1px solid rgba(56,189,248,0.25)", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05), 0 18px 55px -22px #000" }}
    >
      <div className="relative" style={{ minWidth: 820 }}>
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

/* ===================== SVG art builder (vector, no emoji) ===================== */

const O = "#0c1018";

function buildTownSvg(opts: {
  classId: string;
  accent: string;
  name: string;
  level: number;
  rank: string;
  subjects: { id: string; name: string; accent: string }[];
  portalX: number[];
  maps: string;
}) {
  const { classId, accent, name, level, rank, subjects, portalX, maps } = opts;
  const look = CLASS_LOOK[classId] ?? CLASS_LOOK.scholar;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="100%" height="auto" style="display:block" role="img" aria-label="Forgeheart City town map">`;
  s += defs();
  s += `<rect width="${VB_W}" height="${VB_H}" fill="url(#fh-sky)"/>`;
  s += `<ellipse cx="600" cy="380" rx="520" ry="300" fill="#fde68a" opacity="0.10"/>`;
  s += floor();
  s += paths();
  // portals (back)
  subjects.forEach((sub, i) => (s += portal(portalX[i], 96, sub.accent, sub.name)));
  // fountain centerpiece
  s += fountain(600, 400);
  // back buildings
  s += building(215, 330, 58, 64, "#a78bfa", crestBook, "Class Hall", { banner: "#a78bfa", variant: "hall" });
  s += building(985, 330, 58, 64, "#fb7185", crestGuild, "Guild Hall", { banner: "#fb7185", variant: "guild" });
  s += building(1065, 560, 44, 96, "#2dd4bf", crestSpark, "Mentor Tower", { variant: "tower" });
  s += building(150, 575, 50, 62, "#60a5fa", crestHome, "Parent Office", { variant: "office" });
  // props
  s += lamp(150, 432) + lamp(1050, 432);
  s += planter(470, 372) + planter(730, 372);
  // front structures
  s += questBoard(440, 500);
  s += rewardStall(300, 625);
  s += building(805, 615, 54, 64, "#f43f5e", crestArena, "Arena Gate", { variant: "gate" });
  s += crate(372, 648);
  // NPCs
  s += npc(330, 432, { accent: "#2dd4bf", item: "compass" }, "Map Guide", "New realms await!");
  s += npc(520, 548, { accent: "#38bdf8", item: "scroll", hat: "glasses" }, "Quest Aide", "Quiz due?");
  s += npc(300, 548, { accent: "#f472b6", item: "notebook", hat: "cap" }, "Reward Keeper", "Trade tokens!", true);
  s += npc(770, 560, { accent: "#10b981", item: "satchel", hat: "hood" }, "Health Helper", "Care quest ready", true);
  // player
  s += player(610, 642, accent, look, name, level);
  // overlays: title + map counter
  s += `<g><rect x="18" y="18" width="208" height="30" rx="9" fill="rgba(8,15,25,0.6)" stroke="rgba(56,189,248,0.4)"/><circle cx="36" cy="33" r="4" fill="#22d3ee"/><text x="50" y="38" font-size="14" font-weight="700" fill="#cffafe" font-family="Inter,system-ui,sans-serif" letter-spacing="0.5">FORGEHEART CITY</text></g>`;
  s += `<g><rect x="${VB_W - 150}" y="18" width="132" height="30" rx="9" fill="rgba(8,15,25,0.6)" stroke="rgba(251,191,36,0.4)"/><text x="${VB_W - 84}" y="38" font-size="13" font-weight="700" fill="#fde68a" text-anchor="middle" font-family="Inter,system-ui,sans-serif">Realms ${maps}</text></g>`;
  s += `</svg>`;
  return s;
}

function defs() {
  return `<defs>
   <linearGradient id="fh-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#22354f"/><stop offset="55%" stop-color="#23433f"/><stop offset="100%" stop-color="#1d3a2c"/></linearGradient>
   <radialGradient id="fh-water" cx="50%" cy="38%" r="62%"><stop offset="0%" stop-color="#bdf3fc"/><stop offset="55%" stop-color="#34d0e0"/><stop offset="100%" stop-color="#0e7490"/></radialGradient>
   <linearGradient id="fh-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fcd34d"/><stop offset="1" stop-color="#f59e0b"/></linearGradient>
  </defs>`;
}

/* ---- isometric floor (single SVG, warm cobblestone + grass) ---- */
const TILE_W = 64, TILE_H = 32, COLS = 18, ROWS = 16, OX = 600, OY = 150;
const isoX = (c: number, r: number) => (c - r) * (TILE_W / 2) + OX;
const isoY = (c: number, r: number) => (c + r) * (TILE_H / 2) + OY;
function thash(c: number, r: number) { let h = (c * 73856093) ^ (r * 19349663); h = (h ^ (h >>> 13)) >>> 0; return (h % 1000) / 1000; }
function tileColor(c: number, r: number) {
  const d = Math.hypot(c - 8.5, r - 7.5);
  const n = thash(c, r);
  if (d > 9) return n < 0.5 ? "#3a9a63" : "#2f8a55";          // brighter grass border
  if (d < 2.4) return "#b89a64";                               // warm medallion
  if (c === 8 || c === 9 || r === 7 || r === 8) return n < 0.5 ? "#aa9c84" : "#b3a78c"; // worn path
  if (n < 0.05) return "#3fa6b8";                              // teal mosaic
  if (n < 0.09) return "#c98a7a";                              // rose mosaic
  const base = ["#8a8070", "#948a78", "#7d7464", "#8f8576"];   // lighter warm stone
  return base[Math.floor(n * 997) % base.length];
}
function floor() {
  let out = "";
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x = isoX(c, r), y = isoY(c, r);
    const crack = thash(c + 5, r + 9) < 0.08 ? `<line x1="${x - 8}" y1="${y + TILE_H / 2}" x2="${x + 6}" y2="${y + TILE_H * 0.7}" stroke="#000" opacity="0.18" stroke-width="1"/>` : "";
    out += `<polygon points="${x},${y} ${x + TILE_W / 2},${y + TILE_H / 2} ${x},${y + TILE_H} ${x - TILE_W / 2},${y + TILE_H / 2}" fill="${tileColor(c, r)}" stroke="rgba(0,0,0,0.14)" stroke-width="0.5"/>${crack}`;
  }
  return out;
}
function paths() { return ""; }

/* ---- crests (vector emblems, white) ---- */
function crestBook(x: number, y: number) { return `<g><path d="M${x - 9} ${y - 6} Q${x} ${y - 3} ${x + 9} ${y - 6} L${x + 9} ${y + 6} Q${x} ${y + 3} ${x - 9} ${y + 6} Z" fill="#f8fafc"/><line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="${O}" stroke-width="1.2"/></g>`; }
function crestGuild(x: number, y: number) { return `<g fill="#f8fafc"><rect x="${x - 9}" y="${y + 4}" width="18" height="3"/><rect x="${x - 8}" y="${y - 6}" width="3" height="10"/><rect x="${x - 1.5}" y="${y - 6}" width="3" height="10"/><rect x="${x + 5}" y="${y - 6}" width="3" height="10"/><polygon points="${x - 11},${y - 6} ${x},${y - 11} ${x + 11},${y - 6}"/></g>`; }
function crestSpark(x: number, y: number) { return `<g><circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#f8fafc" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2" fill="#a5f3fc"/></g>`; }
function crestHome(x: number, y: number) { return `<g fill="#f8fafc"><polygon points="${x},${y - 8} ${x + 9},${y} ${x - 9},${y}"/><rect x="${x - 6}" y="${y}" width="12" height="8"/><path d="M${x - 2} ${y + 3} h4 v5 h-4 z" fill="${O}"/></g>`; }
function crestArena(x: number, y: number) { return `<g stroke="#f8fafc" stroke-width="2.4" fill="none"><path d="M${x - 7} ${y - 7} L${x + 7} ${y + 7}"/><path d="M${x + 7} ${y - 7} L${x - 7} ${y + 7}"/></g><circle cx="${x}" cy="${y}" r="2" fill="#fde68a"/>`; }

/* ---- building (iso, with variants) ---- */
function building(cx: number, cy: number, bw: number, height: number, accent: string, crest: (x: number, y: number) => string, label: string, opts: { banner?: string; variant?: string } = {}) {
  const v = opts.variant || "default";
  const bh = bw / 2, roofH = bh + (v === "tower" ? 26 : 12), spire = v === "tower" ? 22 : 0;
  const L = `${cx - bw},${cy}`, R = `${cx + bw},${cy}`, B = `${cx},${cy + bh}`;
  const Lt = `${cx - bw},${cy - height}`, Rt = `${cx + bw},${cy - height}`, Bt = `${cx},${cy + bh - height}`, Tt = `${cx},${cy - bh - height}`;
  const apex = `${cx},${cy - bh - height - roofH}`;
  let s = `<ellipse cx="${cx}" cy="${cy + bh + 3}" rx="${bw + 6}" ry="13" fill="#000" opacity="0.3"/>`;
  s += `<polygon points="${cx - bw - 4},${cy + 2} ${cx},${cy + bh + 5} ${cx + bw + 4},${cy + 2} ${cx},${cy - bh - 1}" fill="#2a2f3b"/>`;
  if (v === "gate") s += `<rect x="${cx - bw - 4}" y="${cy - height - 18}" width="16" height="${height + 18}" rx="3" fill="#3c4150" stroke="${O}"/><rect x="${cx + bw - 12}" y="${cy - height - 18}" width="16" height="${height + 18}" rx="3" fill="#4b5163" stroke="${O}"/><polygon points="${cx - bw - 6},${cy - height - 18} ${cx - bw + 4},${cy - height - 32} ${cx - bw + 14},${cy - height - 18}" fill="${accent}"/><polygon points="${cx + bw - 14},${cy - height - 18} ${cx + bw - 4},${cy - height - 32} ${cx + bw + 6},${cy - height - 18}" fill="${accent}"/>`;
  s += `<polygon points="${Lt} ${Tt} ${apex}" fill="${accent}"/><polygon points="${Lt} ${Tt} ${apex}" fill="#000" opacity="0.24"/><polygon points="${Tt} ${Rt} ${apex}" fill="${accent}"/><polygon points="${Tt} ${Rt} ${apex}" fill="#000" opacity="0.13"/>`;
  s += `<polygon points="${L} ${B} ${Bt} ${Lt}" fill="#3c4150" stroke="${O}" stroke-width="1.2"/><polygon points="${B} ${R} ${Rt} ${Bt}" fill="#4b5163" stroke="${O}" stroke-width="1.2"/>`;
  s += `<polyline points="${Lt} ${Bt} ${Rt}" fill="none" stroke="${accent}" stroke-width="1.6" opacity="0.65"/>`;
  s += `<polygon points="${Lt} ${Bt} ${apex}" fill="${accent}" stroke="${O}" stroke-width="1"/><polygon points="${Bt} ${Rt} ${apex}" fill="${accent}" stroke="${O}" stroke-width="1"/><polygon points="${Bt} ${Rt} ${apex}" fill="#fff" opacity="0.12"/>`;
  s += `<line x1="${cx}" y1="${cy + bh - height}" x2="${cx}" y2="${cy - bh - height - roofH}" stroke="#fff" opacity="0.22" stroke-width="1.4"/>`;
  if (v === "tower") s += `<polygon points="${cx - 7},${cy - bh - height - roofH} ${cx + 7},${cy - bh - height - roofH} ${cx},${cy - bh - height - roofH - spire}" fill="${accent}" stroke="${O}"/><circle cx="${cx}" cy="${cy - bh - height - roofH - spire - 5}" r="5" fill="#fff" class="rpg-twinkle"/>`;
  // windows (warm)
  s += `<polygon points="${cx - bw * 0.55},${cy - height * 0.6} ${cx - bw * 0.32},${cy - height * 0.6 + 11} ${cx - bw * 0.32},${cy - height * 0.6 + 25} ${cx - bw * 0.55},${cy - height * 0.6 + 14}" fill="#ffe39a" opacity="0.9"/>`;
  if (v === "guild") s += [0.3, 0.5, 0.7].map((t) => `<polygon points="${cx + bw * t},${cy + bh * t - height + 8} ${cx + bw * t + 5},${cy + bh * t - height + 11} ${cx + bw * t + 5},${cy + bh * t - 6} ${cx + bw * t},${cy + bh * t - 9}" fill="#cdd3df" opacity="0.85"/>`).join("");
  else s += `<polygon points="${cx + bw * 0.4},${cy + bh * 0.4 - height * 0.55} ${cx + bw * 0.62},${cy + bh * 0.4 - height * 0.55 + 8} ${cx + bw * 0.62},${cy + bh * 0.4 - height * 0.55 + 22} ${cx + bw * 0.4},${cy + bh * 0.4 - height * 0.55 + 14}" fill="#ffe39a" opacity="0.85"/>`;
  // door
  s += `<path d="M${cx + bw * 0.05} ${cy + bh * 0.55} L${cx + bw * 0.05} ${cy + bh * 0.55 - 22} Q${cx + bw * 0.22} ${cy + bh * 0.22 - 26} ${cx + bw * 0.38} ${cy + bh * 0.22 - 4} L${cx + bw * 0.38} ${cy + bh * 0.22} Z" fill="#0a1322" stroke="${accent}"/>`;
  if (v === "office") s += `<rect x="${cx + bw * 0.4}" y="${cy - bh - height - 6}" width="8" height="16" rx="1.5" fill="#5a4026" stroke="${O}"/><circle cx="${cx + bw * 0.4 + 4}" cy="${cy - bh - height - 12}" r="3" fill="#cbd5e1" opacity="0.4"/><circle cx="${cx + bw * 0.4 + 7}" cy="${cy - bh - height - 18}" r="4" fill="#cbd5e1" opacity="0.25"/>`;
  // banner
  if (opts.banner) s += `<g class="fh-sway"><rect x="${cx + bw - 4}" y="${cy - height - bh - 6}" width="4" height="34" fill="#4a3a24"/><path d="M${cx + bw} ${cy - height - bh - 4} l24 4 l-6 12 l6 12 l-24 4 z" fill="${opts.banner}" stroke="${O}" stroke-width="0.8"/></g>`;
  // crest medallion
  const ey = cy - height - (v === "tower" ? roofH : 4);
  s += `<circle cx="${cx}" cy="${ey}" r="16" fill="rgba(8,15,25,0.8)" stroke="${accent}" stroke-width="1.4"/>${crest(cx, ey)}`;
  // sign
  const sw = label.length * 7 + 16;
  s += `<g><rect x="${cx - sw / 2}" y="${cy + bh + 6}" width="${sw}" height="20" rx="6" fill="#5a4026" stroke="${accent}"/><text x="${cx}" y="${cy + bh + 20}" font-size="12" font-weight="700" fill="#fde9c8" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${label}</text></g>`;
  return s;
}

function questBoard(cx: number, cy: number) {
  const a = "#f59e0b";
  return `<g><ellipse cx="${cx}" cy="${cy}" rx="58" ry="11" fill="#000" opacity="0.28"/><rect x="${cx - 51}" y="${cy - 64}" width="9" height="64" rx="3" fill="#5a4026"/><rect x="${cx + 42}" y="${cy - 64}" width="9" height="64" rx="3" fill="#5a4026"/><rect x="${cx - 59}" y="${cy - 100}" width="118" height="62" rx="6" fill="#7c5a36" stroke="${O}" stroke-width="1.5"/><rect x="${cx - 55}" y="${cy - 96}" width="110" height="54" rx="4" fill="#6b4a2b"/><path d="M${cx - 65} ${cy - 98} L${cx} ${cy - 118} L${cx + 65} ${cy - 98} Z" fill="${a}" stroke="${O}" stroke-width="1.5"/><rect x="${cx - 47}" y="${cy - 88}" width="26" height="32" rx="2" fill="#f5e8c8" transform="rotate(-5 ${cx - 34} ${cy - 72})"/><rect x="${cx - 13}" y="${cy - 90}" width="26" height="34" rx="2" fill="#fff7e6" transform="rotate(3 ${cx} ${cy - 73})"/><rect x="${cx + 21}" y="${cy - 87}" width="26" height="31" rx="2" fill="#f5e8c8" transform="rotate(-3 ${cx + 34} ${cy - 72})"/><circle cx="${cx - 34}" cy="${cy - 60}" r="4" fill="#ef4444"/><circle cx="${cx}" cy="${cy - 60}" r="4" fill="#38bdf8"/><circle cx="${cx + 34}" cy="${cy - 60}" r="4" fill="#a78bfa"/><rect x="${cx - 42}" y="${cy + 4}" width="84" height="20" rx="6" fill="#5a4026" stroke="${a}"/><text x="${cx}" y="${cy + 18}" font-size="12" font-weight="700" fill="#fde9c8" text-anchor="middle" font-family="Inter,system-ui,sans-serif">Quest Board</text></g>`;
}
function rewardStall(cx: number, cy: number) {
  const a = "#fbbf24";
  return `<g><ellipse cx="${cx}" cy="${cy}" rx="52" ry="10" fill="#000" opacity="0.28"/><rect x="${cx - 50}" y="${cy - 40}" width="6" height="40" fill="#6b4a2b"/><rect x="${cx + 44}" y="${cy - 40}" width="6" height="40" fill="#6b4a2b"/><rect x="${cx - 54}" y="${cy - 30}" width="108" height="30" rx="4" fill="#7c5a36" stroke="${O}"/><rect x="${cx - 54}" y="${cy - 30}" width="108" height="7" fill="#9a7349"/><circle cx="${cx - 32}" cy="${cy - 34}" r="7" fill="#ef4444"/><circle cx="${cx - 14}" cy="${cy - 34}" r="7" fill="#34d399"/><rect x="${cx - 2}" y="${cy - 42}" width="14" height="12" rx="2" fill="#a78bfa"/><circle cx="${cx + 26}" cy="${cy - 34}" r="7" fill="#38bdf8"/><path d="M${cx - 62} ${cy - 70} L${cx + 62} ${cy - 70} L${cx + 50} ${cy - 50} L${cx - 50} ${cy - 50} Z" fill="${a}" stroke="${O}"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${cx - 54 + i * 20} ${cy - 70} L${cx - 60 + i * 20} ${cy - 50} L${cx - 48 + i * 20} ${cy - 50} L${cx - 42 + i * 20} ${cy - 70} Z" fill="#fff" opacity="0.85"/>`).join("")}<rect x="${cx - 40}" y="${cy + 4}" width="80" height="20" rx="6" fill="#5a4026" stroke="${a}"/><text x="${cx}" y="${cy + 18}" font-size="12" font-weight="700" fill="#fde9c8" text-anchor="middle" font-family="Inter,system-ui,sans-serif">Reward Shop</text></g>`;
}
function fountain(cx: number, cy: number) {
  return `<g><ellipse cx="${cx}" cy="${cy + 16}" rx="64" ry="18" fill="#000" opacity="0.22"/><ellipse cx="${cx}" cy="${cy}" rx="56" ry="24" fill="#8a8478" stroke="#5a554c" stroke-width="2"/><ellipse cx="${cx}" cy="${cy - 4}" rx="44" ry="18" fill="url(#fh-water)"/><ellipse cx="${cx}" cy="${cy - 8}" rx="26" ry="10" fill="#8a8478"/><ellipse cx="${cx}" cy="${cy - 11}" rx="16" ry="6" fill="url(#fh-water)"/><rect x="${cx - 4}" y="${cy - 34}" width="8" height="24" rx="2" fill="#9a948a"/><circle cx="${cx}" cy="${cy - 36}" r="6" fill="#bdf3fc" class="rpg-twinkle"/><ellipse cx="${cx}" cy="${cy - 8}" rx="40" ry="15" fill="none" stroke="#fff" opacity="0.2" class="rpg-twinkle"/></g>`;
}
function portal(x: number, y: number, accent: string, label: string) {
  let s = `<g><path d="M ${x - 39} ${y} A 39 44 0 0 1 ${x + 39} ${y}" fill="none" stroke="${accent}" stroke-width="4"/><ellipse cx="${x}" cy="${y - 8}" rx="30" ry="34" fill="${accent}" opacity="0.18"/><ellipse cx="${x}" cy="${y - 8}" rx="26" ry="30" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="4 9" opacity="0.85" class="rpg-spin"/>${starShape(x, y - 6, "#fff", 7, 3)}<ellipse cx="${x}" cy="${y + 4}" rx="40" ry="9" fill="#000" opacity="0.3"/>`;
  const sw = label.length * 6.4 + 14;
  s += `<rect x="${x - sw / 2}" y="${y + 16}" width="${sw}" height="18" rx="6" fill="rgba(8,15,25,0.75)" stroke="${accent}88"/><text x="${x}" y="${y + 29}" font-size="11" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${label}</text></g>`;
  return s;
}
function lamp(x: number, y: number) { return `<g><ellipse cx="${x}" cy="${y + 2}" rx="7" ry="2.5" fill="#000" opacity="0.25"/><rect x="${x - 2}" y="${y - 42}" width="4" height="42" rx="2" fill="#2b3344"/><rect x="${x - 6}" y="${y - 52}" width="12" height="12" rx="3" fill="#1f2937" stroke="#3a4458"/><circle cx="${x}" cy="${y - 46}" r="4" fill="#ffe39a" class="rpg-twinkle"/></g>`; }
function planter(x: number, y: number) { return `<g><ellipse cx="${x}" cy="${y + 8}" rx="16" ry="4" fill="#000" opacity="0.2"/><rect x="${x - 14}" y="${y}" width="28" height="12" rx="3" fill="#7c5a36" stroke="${O}"/><circle cx="${x - 7}" cy="${y - 3}" r="6" fill="#2f8a55"/><circle cx="${x + 5}" cy="${y - 4}" r="7" fill="#34a06a"/><circle cx="${x - 7}" cy="${y - 5}" r="2" fill="#f472b6"/><circle cx="${x + 6}" cy="${y - 7}" r="2" fill="#fcd34d"/></g>`; }
function crate(x: number, y: number) { return `<g><ellipse cx="${x}" cy="${y + 14}" rx="26" ry="5" fill="#000" opacity="0.22"/><rect x="${x - 16}" y="${y - 8}" width="22" height="22" rx="2" fill="#7c5a36" stroke="${O}"/><path d="M${x - 16} ${y + 3} h22 M${x - 5} ${y - 8} v22" stroke="#5a4026"/><rect x="${x + 8}" y="${y - 2}" width="16" height="16" rx="2" fill="#6b4a2b" stroke="${O}"/></g>`; }

/* ---- chibi avatar (vector) ---- */
function starShape(cx: number, cy: number, c: string, o = 8, ii = 3.6) { let s = ""; for (let i = 0; i < 10; i++) { const r = i % 2 ? ii : o; const a = (Math.PI / 5) * i - Math.PI / 2; s += `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)} `; } return `<polygon points="${s}" fill="${c}"/>`; }
function itemVec(item: string) {
  switch (item) {
    case "book": return `<g transform="translate(42,42)"><rect x="-6" y="-5" width="12" height="10" rx="1.5" fill="#3b82f6" stroke="${O}"/><rect x="-4" y="-3" width="8" height="1.3" fill="#fff"/></g>`;
    case "scroll": return `<g transform="translate(42,42)"><rect x="-5" y="-6" width="10" height="12" rx="2" fill="#f5e8c8" stroke="${O}"/><rect x="-5" y="-6" width="10" height="2" fill="#caa86a"/></g>`;
    case "compass": return `<g transform="translate(42,42)"><circle r="6" fill="#d4af37" stroke="${O}"/><circle r="3.5" fill="#0e1626"/><path d="M0 -3 L1.5 0 L0 3 L-1.5 0 Z" fill="#ef4444"/></g>`;
    case "satchel": return `<g transform="translate(42,43)"><path d="M-7 -3 L7 -3 L5 7 L-5 7 Z" fill="#16a34a" stroke="${O}"/><rect x="-2" y="-3" width="4" height="4" fill="#fde68a"/></g>`;
    case "tools": return `<g transform="translate(42,42)"><rect x="-2" y="-7" width="4" height="14" rx="2" fill="#94a3b8" stroke="${O}"/><circle cx="0" cy="-7" r="3.5" fill="none" stroke="#cbd5e1" stroke-width="2"/></g>`;
    case "notebook": return `<g transform="translate(42,42)"><rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="#f472b6" stroke="${O}"/><rect x="-6" y="-6" width="2" height="12" fill="#be185d"/></g>`;
    default: return "";
  }
}
function hatVec(hat: string, a: string) {
  switch (hat) {
    case "circlet": return `<path d="M14 19 Q28 13 42 19" fill="none" stroke="#fcd34d" stroke-width="3" stroke-linecap="round"/><circle cx="28" cy="15.5" r="3" fill="#a5f3fc"/>`;
    case "cap": return `<path d="M12 21 Q28 2 44 21 Q40 13 28 13 Q16 13 12 21 Z" fill="${a}" stroke="${O}"/><rect x="10" y="19" width="36" height="4" rx="2" fill="#fcd34d"/>`;
    case "hood": return `<path d="M10 28 Q8 4 28 4 Q48 4 46 28 Q40 14 28 14 Q16 14 10 28 Z" fill="${a}" stroke="${O}"/>`;
    case "glasses": return `<g stroke="${O}" stroke-width="1.4" fill="none"><circle cx="21" cy="25" r="4.5" fill="rgba(165,243,252,0.4)"/><circle cx="35" cy="25" r="4.5" fill="rgba(165,243,252,0.4)"/><path d="M25.5 25 h5"/></g>`;
    default: return "";
  }
}
function chibi(x: number, y: number, look: { accent: string; item?: string; hat?: string; acc?: string }, width: number, flip = false) {
  const a = look.accent, item = look.item || "none", hat = look.hat || "none", acc = look.acc || "none";
  const sk = "#f6d3b0", hr = "#3b2a1a", t = "#fcd34d";
  const sc = width / 56, tx = x - 28 * sc, ty = y - 64 * sc;
  const noFace = hat === "glasses";
  const shield = acc === "shield" ? `<g transform="translate(13,44)"><path d="M0 -7 L6 -4 L6 3 Q6 8 0 10 Q-6 8 -6 3 L-6 -4 Z" fill="${a}" stroke="${O}"/><path d="M0 -3 L0 6 M-4 0 L4 0" stroke="#fff" stroke-width="1" opacity="0.7"/></g>` : "";
  const goggles = acc === "goggles" ? `<g stroke="${O}" stroke-width="1.2"><circle cx="22" cy="16" r="4" fill="#a5f3fc"/><circle cx="34" cy="16" r="4" fill="#a5f3fc"/><path d="M26 16 h4" /></g>` : "";
  return `<g transform="translate(${tx},${ty}) scale(${sc}) ${flip ? `translate(56,0) scale(-1,1)` : ""}"><ellipse cx="28" cy="61" rx="15" ry="4" fill="#000" opacity="0.28"/><rect x="23" y="50" width="4.5" height="9" rx="2" fill="#2a3344"/><rect x="28.5" y="50" width="4.5" height="9" rx="2" fill="#2a3344"/><ellipse cx="25" cy="59.5" rx="3.4" ry="2" fill="#0f172a"/><ellipse cx="31" cy="59.5" rx="3.4" ry="2" fill="#0f172a"/><path d="M18 40 Q28 35 38 40 L36 53 Q28 56 20 53 Z" fill="${a}" stroke="${O}"/><rect x="19.5" y="49" width="17" height="3" rx="1.5" fill="#3a2a18"/><path d="M24 39 L28 44 L32 39" fill="none" stroke="${t}" stroke-width="1.6" stroke-linecap="round"/><path d="M17 40 q-3 5 -1 10 l3 -1 q-1 -5 1 -8 z" fill="${a}" stroke="${O}"/><path d="M39 40 q3 5 1 10 l-3 -1 q1 -5 -1 -8 z" fill="${a}" stroke="${O}"/><circle cx="40" cy="46" r="2.6" fill="${sk}"/>${shield}${itemVec(item)}<circle cx="28" cy="24" r="16" fill="${sk}" stroke="${O}" stroke-width="1.1"/><path d="M12 24 Q11 7 28 6 Q45 7 44 24 Q41 15 33 14 Q28 10 23 14 Q15 15 12 24 Z" fill="${hr}" stroke="${O}"/>${hatVec(hat, a)}${goggles}${noFace || goggles ? `<circle cx="22.5" cy="26.5" r="1.5" fill="#1f2937"/><circle cx="34.5" cy="26.5" r="1.5" fill="#1f2937"/>` : `<ellipse cx="22" cy="26" rx="3" ry="3.6" fill="#fff"/><ellipse cx="34" cy="26" rx="3" ry="3.6" fill="#fff"/><circle cx="22.5" cy="27" r="1.9" fill="#1f2937"/><circle cx="34.5" cy="27" r="1.9" fill="#1f2937"/>`}<circle cx="19" cy="30" r="2" fill="#fb7185" opacity="0.35"/><circle cx="37" cy="30" r="2" fill="#fb7185" opacity="0.35"/><path d="M24 31 Q28 34 32 31" fill="none" stroke="#9a5b3b" stroke-width="1.3" stroke-linecap="round"/></g>`;
}
function bubble(x: number, y: number, text: string, a: string) {
  const w = text.length * 6.6 + 26;
  return `<g><rect x="${x - w / 2}" y="${y - 21}" width="${w}" height="21" rx="8" fill="rgba(255,255,255,0.96)" stroke="${a}" stroke-width="1.5"/><text x="${x}" y="${y - 7}" font-size="12" font-weight="600" fill="#0f172a" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${text}</text><polygon points="${x - 5},${y} ${x + 5},${y} ${x},${y + 6}" fill="rgba(255,255,255,0.96)"/></g>`;
}
function nameplate(x: number, y: number, text: string, a: string) {
  const w = text.length * 6 + 14;
  return `<g><rect x="${x - w / 2}" y="${y}" width="${w}" height="16" rx="5" fill="rgba(8,15,25,0.74)" stroke="${a}88"/><text x="${x}" y="${y + 12}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${text}</text></g>`;
}
function npc(x: number, y: number, look: { accent: string; item?: string; hat?: string }, name: string, line: string, flip = false) {
  return `<g class="rpg-float">${bubble(x, y - 64, line, look.accent)}${chibi(x, y, look, 56, flip)}${nameplate(x, y + 2, name, look.accent)}</g>`;
}
function player(x: number, y: number, accent: string, look: Look, name: string, level: number) {
  return `<g class="rpg-float-slow"><ellipse cx="${x}" cy="${y - 2}" rx="22" ry="7" fill="${accent}" opacity="0.25"/><ellipse cx="${x}" cy="${y - 2}" rx="22" ry="7" fill="none" stroke="${accent}" stroke-width="2" opacity="0.7"/>${bubble(x, y - 84, "That's me!", accent)}${chibi(x, y, { accent, item: look.item, hat: look.hat, acc: look.acc }, 72)}${nameplate(x, y + 4, `${name} · Lv ${level}`, accent)}</g>`;
}
