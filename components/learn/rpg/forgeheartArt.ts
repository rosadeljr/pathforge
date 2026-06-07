/**
 * forgeheartArt — framework-agnostic vector-art builder for Forgeheart City.
 * Returns one SVG string (gradient-shaded, futuristic). Imported by the
 * ForgeheartTown component AND by the local preview renderer, so the browser
 * and previews always match. Animation classes (rpg- and fh- prefixed) live in
 * globals.css and are no-ops under prefers-reduced-motion / static rendering.
 */

export const VB_W = 1200;
export const VB_H = 780;
const OL = "rgba(10,16,26,0.55)";
const TILE_W = 64, TILE_H = 32, OX = 600, OY = 70;
const FX = 615, FY = 412;
const isoX = (c: number, r: number) => (c - r) * (TILE_W / 2) + OX;
const isoY = (c: number, r: number) => (c + r) * (TILE_H / 2) + OY;

type Look = { item: string; hat: string; acc: "none" | "shield" | "goggles" };
export const CLASS_LOOK: Record<string, Look> = {
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
export const SUBJECTS = [
  { id: "math", name: "Number Kingdom", accent: "#6366f1" },
  { id: "english", name: "Story Forest", accent: "#22c55e" },
  { id: "filipino", name: "Bayani Isles", accent: "#f59e0b" },
  { id: "science", name: "Lab Reef", accent: "#06b6d4" },
  { id: "araling-panlipunan", name: "History Isles", accent: "#a78bfa" },
];
export const PORTAL_X = [235, 425, 615, 805, 995];

function thash(c: number, r: number) { let h = (c * 73856093) ^ (r * 19349663); h = (h ^ (h >>> 13)) >>> 0; return (h % 1000) / 1000; }
function tileColor(c: number, r: number) {
  const n = thash(c, r); const sx = isoX(c, r), sy = isoY(c, r) + TILE_H / 2; const d = Math.hypot(sx - FX, (sy - FY) / 0.6);
  if (d < 250) { if (n < 0.05) return "#2f7d9e"; if (n < 0.09) return "#5a4a9e"; const b = ["#34405c", "#2c3850", "#3a4768", "#303c58"]; return b[Math.floor(n * 997) % b.length]; }
  return n < 0.5 ? "#1f5a48" : "#1a4d3e";
}
function floor() {
  let out = ""; const COLS = 30, ROWS = 30;
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const x = isoX(c, r), y = isoY(c, r);
    if (x < -40 || x > VB_W + 40 || y < -40 || y > VB_H + 40) continue;
    out += `<polygon points="${x},${y} ${x + TILE_W / 2},${y + TILE_H / 2} ${x},${y + TILE_H} ${x - TILE_W / 2},${y + TILE_H / 2}" fill="${tileColor(c, r)}" stroke="rgba(120,220,255,0.06)" stroke-width="0.5"/>`;
  }
  return out;
}
function plazaHolo() {
  return `<g><ellipse cx="${FX}" cy="${FY}" rx="250" ry="150" fill="url(#plazaGlow)"/><ellipse cx="${FX}" cy="${FY}" rx="210" ry="126" fill="none" stroke="#67e8f9" stroke-width="2" opacity="0.35"/><ellipse cx="${FX}" cy="${FY}" rx="150" ry="90" fill="none" stroke="#a78bfa" stroke-width="1.5" opacity="0.35"/><ellipse cx="${FX}" cy="${FY}" rx="185" ry="111" fill="none" stroke="#67e8f9" stroke-width="1.5" stroke-dasharray="3 18" opacity="0.5" class="rpg-spin"/></g>`;
}
function paths(t: [number, number][]) {
  let s = `<g stroke-linecap="round">`;
  for (const [tx, ty] of t) s += `<line x1="${FX}" y1="${FY + 12}" x2="${tx}" y2="${ty}" stroke="#2b3650" stroke-width="30" opacity="0.85"/>`;
  for (const [tx, ty] of t) s += `<line x1="${FX}" y1="${FY + 12}" x2="${tx}" y2="${ty}" stroke="#3a4768" stroke-width="26" opacity="0.6"/>`;
  for (const [tx, ty] of t) s += `<line x1="${FX}" y1="${FY + 12}" x2="${tx}" y2="${ty}" stroke="#67e8f9" stroke-width="2" opacity="0.5" stroke-dasharray="3 12"/>`;
  return s + `</g>`;
}
function defs() {
  return `<defs>
 <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#ffd9a8"/><stop offset="24%" stop-color="#f6a8b8"/><stop offset="48%" stop-color="#9c8fd6"/><stop offset="72%" stop-color="#3f6f8e"/><stop offset="100%" stop-color="#173a4e"/></linearGradient>
 <radialGradient id="sun" cx="78%" cy="14%" r="36%"><stop offset="0%" stop-color="#fff6e0" stop-opacity="0.95"/><stop offset="40%" stop-color="#ffd9a0" stop-opacity="0.55"/><stop offset="100%" stop-color="#ffd9a0" stop-opacity="0"/></radialGradient>
 <radialGradient id="iris" cx="50%" cy="35%" r="70%"><stop offset="0%" stop-color="#bdf0ff"/><stop offset="55%" stop-color="#3aa0e0"/><stop offset="100%" stop-color="#1b3a78"/></radialGradient>
 <linearGradient id="warmlight" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffe9c2" stop-opacity="0.16"/><stop offset="45%" stop-color="#ffe9c2" stop-opacity="0"/></linearGradient>
 <radialGradient id="plazaGlow" cx="50%" cy="46%" r="60%"><stop offset="0%" stop-color="#1a4a66" stop-opacity="0.9"/><stop offset="60%" stop-color="#143a52" stop-opacity="0.5"/><stop offset="100%" stop-color="#0e2230" stop-opacity="0"/></radialGradient>
 <radialGradient id="water" cx="50%" cy="36%" r="62%"><stop offset="0%" stop-color="#e0fbff"/><stop offset="50%" stop-color="#34d0e0"/><stop offset="100%" stop-color="#0e6f8e"/></radialGradient>
 <linearGradient id="metalL" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#3c4760"/><stop offset="100%" stop-color="#1c2334"/></linearGradient>
 <linearGradient id="metalR" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#4c5872"/><stop offset="100%" stop-color="#28324a"/></linearGradient>
 <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#fff" stop-opacity="0.28"/><stop offset="60%" stop-color="#fff" stop-opacity="0"/></linearGradient>
 <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.34"/></linearGradient>
 <radialGradient id="win" cx="50%" cy="35%" r="65%"><stop offset="0%" stop-color="#d6fbff"/><stop offset="60%" stop-color="#5fd6ee"/><stop offset="100%" stop-color="#0e7490"/></radialGradient>
 <radialGradient id="vig" cx="50%" cy="48%" r="72%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.5"/></radialGradient>
 <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0b1a26" stop-opacity="0.6"/><stop offset="100%" stop-color="#0b1a26" stop-opacity="0"/></linearGradient>
 <pattern id="scan" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="#081320" opacity="0.5"/></pattern>
</defs>`;
}
const crestBook = (x: number, y: number) => `<g><path d="M${x - 9} ${y - 6} Q${x} ${y - 3} ${x + 9} ${y - 6} L${x + 9} ${y + 6} Q${x} ${y + 3} ${x - 9} ${y + 6} Z" fill="#eaf6ff"/><line x1="${x}" y1="${y - 5}" x2="${x}" y2="${y + 5}" stroke="#0c1018" stroke-width="1.2"/></g>`;
const crestGuild = (x: number, y: number) => `<g fill="#eaf6ff"><rect x="${x - 9}" y="${y + 4}" width="18" height="3"/><rect x="${x - 8}" y="${y - 6}" width="3" height="10"/><rect x="${x - 1.5}" y="${y - 6}" width="3" height="10"/><rect x="${x + 5}" y="${y - 6}" width="3" height="10"/><polygon points="${x - 11},${y - 6} ${x},${y - 11} ${x + 11},${y - 6}"/></g>`;
const crestSpark = (x: number, y: number) => `<g><circle cx="${x}" cy="${y}" r="6" fill="none" stroke="#eaf6ff" stroke-width="2"/><circle cx="${x}" cy="${y}" r="2" fill="#a5f3fc"/></g>`;
const crestHome = (x: number, y: number) => `<g fill="#eaf6ff"><polygon points="${x},${y - 8} ${x + 9},${y} ${x - 9},${y}"/><rect x="${x - 6}" y="${y}" width="12" height="8"/><path d="M${x - 2} ${y + 3} h4 v5 h-4 z" fill="#0c1018"/></g>`;
const crestArena = (x: number, y: number) => `<g stroke="#eaf6ff" stroke-width="2.4" fill="none"><path d="M${x - 7} ${y - 7} L${x + 7} ${y + 7}"/><path d="M${x + 7} ${y - 7} L${x - 7} ${y + 7}"/></g><circle cx="${x}" cy="${y}" r="2" fill="#fde68a"/>`;
function building(cx: number, cy: number, bw: number, height: number, accent: string, crest: (x: number, y: number) => string, label: string, opts: { banner?: string; variant?: string } = {}) {
  const v = opts.variant || "default"; const bh = bw / 2, roofH = bh + (v === "tower" ? 28 : 14), spire = v === "tower" ? 24 : 0;
  const L = `${cx - bw},${cy}`, R = `${cx + bw},${cy}`, B = `${cx},${cy + bh}`, Lt = `${cx - bw},${cy - height}`, Rt = `${cx + bw},${cy - height}`, Bt = `${cx},${cy + bh - height}`, Tt = `${cx},${cy - bh - height}`, apex = `${cx},${cy - bh - height - roofH}`;
  const wallL = `${L} ${B} ${Bt} ${Lt}`, wallR = `${B} ${R} ${Rt} ${Bt}`;
  let s = `<ellipse cx="${cx}" cy="${cy + bh + 4}" rx="${bw + 9}" ry="15" fill="#000" opacity="0.32"/>`;
  s += `<ellipse cx="${cx}" cy="${cy - height * 0.3}" rx="${bw + 10}" ry="${(height + roofH) * 0.55}" fill="${accent}" opacity="0.06"/>`;
  if (v === "gate") s += `<rect x="${cx - bw - 6}" y="${cy - height - 20}" width="18" height="${height + 20}" rx="3" fill="url(#metalL)" stroke="${OL}"/><rect x="${cx + bw - 12}" y="${cy - height - 20}" width="18" height="${height + 20}" rx="3" fill="url(#metalR)" stroke="${OL}"/><polygon points="${cx - bw - 8},${cy - height - 20} ${cx - bw + 3},${cy - height - 38} ${cx - bw + 14},${cy - height - 20}" fill="${accent}"/><polygon points="${cx + bw - 14},${cy - height - 20} ${cx + bw - 3},${cy - height - 38} ${cx + bw + 10},${cy - height - 20}" fill="${accent}"/><circle cx="${cx - bw + 3}" cy="${cy - height - 30}" r="2.5" fill="#fff"/><circle cx="${cx + bw - 3}" cy="${cy - height - 30}" r="2.5" fill="#fff"/>`;
  s += `<polygon points="${Lt} ${Tt} ${apex}" fill="${accent}"/><polygon points="${Lt} ${Tt} ${apex}" fill="url(#shade)"/><polygon points="${Tt} ${Rt} ${apex}" fill="${accent}"/><polygon points="${Tt} ${Rt} ${apex}" fill="#000" opacity="0.12"/>`;
  s += `<polygon points="${wallL}" fill="url(#metalL)" stroke="${OL}" stroke-width="1"/><polygon points="${wallR}" fill="url(#metalR)" stroke="${OL}" stroke-width="1"/>`;
  s += `<line x1="${cx - bw * 0.5}" y1="${cy + bh * 0.5}" x2="${cx - bw * 0.5}" y2="${cy + bh * 0.5 - height}" stroke="#000" opacity="0.12"/><line x1="${cx + bw * 0.5}" y1="${cy + bh * 0.5}" x2="${cx + bw * 0.5}" y2="${cy + bh * 0.5 - height}" stroke="#000" opacity="0.12"/>`;
  s += `<polyline points="${Lt} ${Bt} ${Rt}" fill="none" stroke="${accent}" stroke-width="2.4" opacity="0.95"/><polyline points="${Lt} ${Bt} ${Rt}" fill="none" stroke="#fff" stroke-width="0.8" opacity="0.5"/>`;
  s += `<polygon points="${Lt} ${Bt} ${apex}" fill="${accent}" stroke="${OL}" stroke-width="0.8"/><polygon points="${Bt} ${Rt} ${apex}" fill="${accent}" stroke="${OL}" stroke-width="0.8"/><polygon points="${Lt} ${Bt} ${apex} ${Rt}" fill="url(#sheen)"/>`;
  s += `<line x1="${cx}" y1="${cy + bh - height}" x2="${cx}" y2="${cy - bh - height - roofH}" stroke="#fff" opacity="0.3" stroke-width="1.4"/>`;
  if (v === "tower") s += `<polygon points="${cx - 7},${cy - bh - height - roofH} ${cx + 7},${cy - bh - height - roofH} ${cx},${cy - bh - height - roofH - spire}" fill="${accent}" stroke="${OL}"/><circle cx="${cx}" cy="${cy - bh - height - roofH - spire - 5}" r="9" fill="${accent}" opacity="0.25"/><circle cx="${cx}" cy="${cy - bh - height - roofH - spire - 5}" r="5" fill="#eaffff" class="rpg-twinkle"/>`;
  else s += `<circle cx="${cx}" cy="${cy - bh - height - roofH}" r="7" fill="${accent}" opacity="0.3"/><circle cx="${cx}" cy="${cy - bh - height - roofH}" r="2.4" fill="#eaffff" class="rpg-twinkle"/>`;
  s += `<polygon points="${cx - bw * 0.55},${cy - height * 0.6} ${cx - bw * 0.32},${cy - height * 0.6 + 11} ${cx - bw * 0.32},${cy - height * 0.6 + 25} ${cx - bw * 0.55},${cy - height * 0.6 + 14}" fill="url(#win)"/>`;
  if (v === "guild") s += [0.3, 0.5, 0.7].map((t) => `<polygon points="${cx + bw * t},${cy + bh * t - height + 8} ${cx + bw * t + 5},${cy + bh * t - height + 11} ${cx + bw * t + 5},${cy + bh * t - 6} ${cx + bw * t},${cy + bh * t - 9}" fill="#dbe3f2" opacity="0.9"/>`).join("");
  else s += `<polygon points="${cx + bw * 0.4},${cy + bh * 0.4 - height * 0.55} ${cx + bw * 0.62},${cy + bh * 0.4 - height * 0.55 + 8} ${cx + bw * 0.62},${cy + bh * 0.4 - height * 0.55 + 22} ${cx + bw * 0.4},${cy + bh * 0.4 - height * 0.55 + 14}" fill="url(#win)"/>`;
  s += `<path d="M${cx + bw * 0.05} ${cy + bh * 0.55} L${cx + bw * 0.05} ${cy + bh * 0.55 - 24} Q${cx + bw * 0.22} ${cy + bh * 0.22 - 28} ${cx + bw * 0.4} ${cy + bh * 0.22 - 4} L${cx + bw * 0.4} ${cy + bh * 0.22} Z" fill="#0a1726" stroke="${accent}" stroke-width="1.2"/><path d="M${cx + bw * 0.07} ${cy + bh * 0.5} L${cx + bw * 0.07} ${cy + bh * 0.5 - 18}" stroke="${accent}" stroke-width="2" opacity="0.6"/>`;
  if (v === "office") s += `<rect x="${cx + bw * 0.4}" y="${cy - bh - height - 6}" width="8" height="16" rx="1.5" fill="#46506a" stroke="${OL}"/><circle cx="${cx + bw * 0.4 + 4}" cy="${cy - bh - height - 12}" r="3" fill="#cbd5e1" opacity="0.4"/>`;
  if (opts.banner) s += `<g class="fh-sway"><rect x="${cx + bw - 4}" y="${cy - height - bh - 8}" width="3" height="38" fill="#46506a"/><path d="M${cx + bw} ${cy - height - bh - 6} l26 5 l-7 13 l7 13 l-26 5 z" fill="${opts.banner}"/><path d="M${cx + bw} ${cy - height - bh - 6} l26 5 l-7 13 l7 13 l-26 5 z" fill="url(#sheen)"/></g>`;
  const ey = cy - height - (v === "tower" ? roofH : 4); s += `<circle cx="${cx}" cy="${ey}" r="22" fill="${accent}" opacity="0.12"/><circle cx="${cx}" cy="${ey}" r="18" fill="#0a1726" opacity="0.85"/><circle cx="${cx}" cy="${ey}" r="18" fill="none" stroke="${accent}" stroke-width="1.5"/>${crest(cx, ey)}`;
  const sw = label.length * 7.4 + 20; s += `<g><rect x="${cx - sw / 2}" y="${cy + bh + 8}" width="${sw}" height="22" rx="6" fill="rgba(10,26,40,0.82)" stroke="${accent}"/><rect x="${cx - sw / 2}" y="${cy + bh + 8}" width="${sw}" height="22" rx="6" fill="url(#sheen)" opacity="0.5"/><text x="${cx}" y="${cy + bh + 23}" font-size="13" font-weight="700" fill="#eaf6ff" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${label}</text></g>`;
  return s;
}
function questBoard(cx: number, cy: number) { const a = "#f59e0b"; return `<g><ellipse cx="${cx}" cy="${cy}" rx="64" ry="12" fill="#000" opacity="0.3"/><rect x="${cx - 56}" y="${cy - 70}" width="10" height="70" rx="3" fill="#46506a"/><rect x="${cx + 46}" y="${cy - 70}" width="10" height="70" rx="3" fill="#46506a"/><rect x="${cx - 64}" y="${cy - 110}" width="128" height="68" rx="8" fill="#1c2740" stroke="${a}" stroke-width="1.5"/><rect x="${cx - 64}" y="${cy - 110}" width="128" height="68" rx="8" fill="url(#sheen)" opacity="0.4"/><path d="M${cx - 70} ${cy - 108} L${cx} ${cy - 130} L${cx + 70} ${cy - 108} Z" fill="${a}"/><path d="M${cx - 70} ${cy - 108} L${cx} ${cy - 130} L${cx + 70} ${cy - 108} Z" fill="url(#shade)"/><rect x="${cx - 50}" y="${cy - 97}" width="28" height="34" rx="2" fill="#eaf3ff" transform="rotate(-5 ${cx - 36} ${cy - 80})"/><rect x="${cx - 14}" y="${cy - 99}" width="28" height="36" rx="2" fill="#ffffff" transform="rotate(3 ${cx} ${cy - 81})"/><rect x="${cx + 23}" y="${cy - 96}" width="28" height="33" rx="2" fill="#eaf3ff" transform="rotate(-3 ${cx + 37} ${cy - 80})"/><circle cx="${cx - 36}" cy="${cy - 66}" r="4" fill="#ef4444"/><circle cx="${cx}" cy="${cy - 66}" r="4" fill="#38bdf8"/><circle cx="${cx + 37}" cy="${cy - 66}" r="4" fill="#a78bfa"/><rect x="${cx - 46}" y="${cy + 4}" width="92" height="22" rx="6" fill="rgba(10,26,40,0.82)" stroke="${a}"/><text x="${cx}" y="${cy + 19}" font-size="13" font-weight="700" fill="#fde9c8" text-anchor="middle" font-family="Inter,system-ui,sans-serif">Quest Board</text></g>`; }
function rewardStall(cx: number, cy: number) { const a = "#fbbf24"; return `<g><ellipse cx="${cx}" cy="${cy}" rx="58" ry="11" fill="#000" opacity="0.3"/><rect x="${cx - 54}" y="${cy - 44}" width="7" height="44" fill="#46506a"/><rect x="${cx + 47}" y="${cy - 44}" width="7" height="44" fill="#46506a"/><rect x="${cx - 58}" y="${cy - 32}" width="116" height="32" rx="4" fill="#1c2740" stroke="${OL}"/><rect x="${cx - 58}" y="${cy - 32}" width="116" height="8" fill="#2c3a56"/><circle cx="${cx - 34}" cy="${cy - 37}" r="8" fill="#ef4444"/><circle cx="${cx - 14}" cy="${cy - 37}" r="8" fill="#34d399"/><rect x="${cx - 2}" y="${cy - 46}" width="15" height="14" rx="2" fill="#a78bfa"/><circle cx="${cx + 28}" cy="${cy - 37}" r="8" fill="#38bdf8"/><path d="M${cx - 66} ${cy - 74} L${cx + 66} ${cy - 74} L${cx + 53} ${cy - 52} L${cx - 53} ${cy - 52} Z" fill="${a}"/><path d="M${cx - 66} ${cy - 74} L${cx + 66} ${cy - 74} L${cx + 53} ${cy - 52} L${cx - 53} ${cy - 52} Z" fill="url(#shade)"/>${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M${cx - 58 + i * 22} ${cy - 74} L${cx - 64 + i * 22} ${cy - 52} L${cx - 52 + i * 22} ${cy - 52} L${cx - 46 + i * 22} ${cy - 74} Z" fill="#eef3fb" opacity="0.9"/>`).join("")}<rect x="${cx - 44}" y="${cy + 4}" width="88" height="22" rx="6" fill="rgba(10,26,40,0.82)" stroke="${a}"/><text x="${cx}" y="${cy + 19}" font-size="13" font-weight="700" fill="#fde9c8" text-anchor="middle" font-family="Inter,system-ui,sans-serif">Reward Shop</text></g>`; }
function fountain(cx: number, cy: number) { return `<g><ellipse cx="${cx}" cy="${cy + 18}" rx="72" ry="20" fill="#000" opacity="0.25"/><ellipse cx="${cx}" cy="${cy}" rx="62" ry="26" fill="#2c3850" stroke="#46506a" stroke-width="2"/><ellipse cx="${cx}" cy="${cy - 4}" rx="50" ry="20" fill="url(#water)"/><ellipse cx="${cx}" cy="${cy - 9}" rx="28" ry="11" fill="#2c3850"/><ellipse cx="${cx}" cy="${cy - 12}" rx="17" ry="6" fill="url(#water)"/><rect x="${cx - 5}" y="${cy - 42}" width="10" height="30" rx="2" fill="#3a4660"/><circle cx="${cx}" cy="${cy - 44}" r="12" fill="#67e8f9" opacity="0.3"/><circle cx="${cx}" cy="${cy - 44}" r="7" fill="#d6fbff" class="rpg-twinkle"/><ellipse cx="${cx}" cy="${cy - 8}" rx="46" ry="17" fill="none" stroke="#bdf3fc" opacity="0.4" class="rpg-twinkle"/></g>`; }
function starShape(cx: number, cy: number, c: string, o = 8, ii = 3.6) { let s = ""; for (let i = 0; i < 10; i++) { const r = i % 2 ? ii : o; const a = (Math.PI / 5) * i - Math.PI / 2; s += `${(cx + Math.cos(a) * r).toFixed(1)},${(cy + Math.sin(a) * r).toFixed(1)} `; } return `<polygon points="${s}" fill="${c}"/>`; }
function portal(x: number, y: number, accent: string, label: string) { let s = `<g><polygon points="${x - 10},${y - 8} ${x + 10},${y - 8} ${x + 4},${y - 150} ${x - 4},${y - 150}" fill="${accent}" opacity="0.12"/><rect x="${x - 1.5}" y="${y - 150}" width="3" height="142" fill="#eaffff" opacity="0.35"/><ellipse cx="${x}" cy="${y + 6}" rx="42" ry="10" fill="#000" opacity="0.3"/><ellipse cx="${x}" cy="${y - 8}" rx="40" ry="44" fill="${accent}" opacity="0.16"/><path d="M ${x - 40} ${y} A 40 46 0 0 1 ${x + 40} ${y}" fill="none" stroke="${accent}" stroke-width="5"/><path d="M ${x - 40} ${y} A 40 46 0 0 1 ${x + 40} ${y}" fill="none" stroke="#eaffff" stroke-width="1.5" opacity="0.6"/><ellipse cx="${x}" cy="${y - 8}" rx="30" ry="34" fill="${accent}" opacity="0.28"/><ellipse cx="${x}" cy="${y - 8}" rx="27" ry="31" fill="none" stroke="#eaffff" stroke-width="2" stroke-dasharray="4 9" opacity="0.8" class="rpg-spin"/><ellipse cx="${x}" cy="${y - 8}" rx="17" ry="20" fill="none" stroke="${accent}" stroke-width="2" stroke-dasharray="3 7" opacity="0.7"/>${starShape(x, y - 6, "#fff", 8, 3.2)}`; const sw = label.length * 6.8 + 16; s += `<rect x="${x - sw / 2}" y="${y + 16}" width="${sw}" height="19" rx="6" fill="rgba(10,26,40,0.85)" stroke="${accent}"/><text x="${x}" y="${y + 29}" font-size="12" font-weight="700" fill="#eaf6ff" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${label}</text></g>`; return s; }
const pylon = (x: number, y: number, c: string) => `<g><ellipse cx="${x}" cy="${y + 2}" rx="7" ry="2.5" fill="#000" opacity="0.25"/><rect x="${x - 3}" y="${y - 44}" width="6" height="44" rx="3" fill="#2c3850" stroke="${OL}"/><rect x="${x - 5}" y="${y - 52}" width="10" height="10" rx="2" fill="#0a1726" stroke="${c}"/><circle cx="${x}" cy="${y - 47}" r="6" fill="${c}" opacity="0.3"/><circle cx="${x}" cy="${y - 47}" r="3.5" fill="${c}" class="rpg-twinkle"/></g>`;
const planter = (x: number, y: number) => `<g><ellipse cx="${x}" cy="${y + 8}" rx="18" ry="5" fill="#000" opacity="0.22"/><rect x="${x - 16}" y="${y}" width="32" height="13" rx="3" fill="#26324a" stroke="${OL}"/><circle cx="${x - 8}" cy="${y - 3}" r="7" fill="#2f8a66"/><circle cx="${x + 6}" cy="${y - 4}" r="8" fill="#39a87a"/><circle cx="${x - 8}" cy="${y - 5}" r="2" fill="#67e8f9"/><circle cx="${x + 7}" cy="${y - 8}" r="2" fill="#a78bfa"/></g>`;
const crate = (x: number, y: number) => `<g><ellipse cx="${x}" cy="${y + 14}" rx="28" ry="6" fill="#000" opacity="0.24"/><rect x="${x - 18}" y="${y - 9}" width="24" height="24" rx="3" fill="#26324a" stroke="${OL}"/><rect x="${x - 18}" y="${y - 9}" width="24" height="24" rx="3" fill="url(#sheen)" opacity="0.3"/><path d="M${x - 18} ${y + 3} h24 M${x - 6} ${y - 9} v24" stroke="#3a4768"/><rect x="${x + 9}" y="${y - 2}" width="17" height="17" rx="2" fill="#22304a" stroke="${OL}"/><circle cx="${x - 6}" cy="${y + 3}" r="2" fill="#67e8f9"/></g>`;
function itemVec(item: string) { switch (item) { case "book": return `<g transform="translate(42,42)"><rect x="-6" y="-5" width="12" height="10" rx="1.5" fill="#3b82f6"/><rect x="-4" y="-3" width="8" height="1.3" fill="#fff"/></g>`; case "scroll": return `<g transform="translate(42,42)"><rect x="-5" y="-6" width="10" height="12" rx="2" fill="#f5e8c8"/></g>`; case "compass": return `<g transform="translate(42,42)"><circle r="6" fill="#d4af37"/><circle r="3.5" fill="#0e1626"/><path d="M0 -3 L1.5 0 L0 3 L-1.5 0 Z" fill="#ef4444"/></g>`; case "satchel": return `<g transform="translate(42,43)"><path d="M-7 -3 L7 -3 L5 7 L-5 7 Z" fill="#16a34a"/></g>`; case "notebook": return `<g transform="translate(42,42)"><rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="#f472b6"/></g>`; default: return ""; } }
function hatVec(hat: string, a: string) { switch (hat) { case "circlet": return `<path d="M16.5 11 Q28 6.5 39.5 11" fill="none" stroke="#fcd34d" stroke-width="2.4" stroke-linecap="round"/><circle cx="28" cy="8.3" r="2.4" fill="#bfeaf2" stroke="#3b3548" stroke-width="0.4"/>`; case "cap": return `<path d="M16 11 Q28 -1.5 40 11 Q37 6 28 6 Q19 6 16 11 Z" fill="${a}" stroke="#3b3548" stroke-width="0.5"/><rect x="14.5" y="9.6" width="27" height="3.2" rx="1.6" fill="#fcd34d"/>`; case "hood": return `<path d="M13 21 Q12 0.5 28 0.5 Q44 0.5 43 21 Q38 7 28 7 Q18 7 13 21 Z" fill="${a}" stroke="#3b3548" stroke-width="0.5"/>`; case "glasses": return `<rect x="17" y="14.6" width="22" height="6.2" rx="3.1" fill="#0a1726" stroke="#3b3548" stroke-width="0.8"/><rect x="18" y="15.7" width="20" height="3" rx="1.5" fill="#67e8f9" opacity="0.9"/><rect x="18.6" y="15.9" width="6" height="2.4" rx="1.2" fill="#ffffff" opacity="0.55"/>`; default: return ""; } }
function chibi(x: number, y: number, look: { accent: string; item?: string; hat?: string; acc?: string; skin?: string; hair?: string }, width: number, flip = false) {
  const a = look.accent, item = look.item || "none", hat = look.hat || "none", acc = look.acc || "none";
  const sk = look.skin || "#f4d4b6", hr = look.hair || "#b9a07a", ol = "#3b3548", eye = "#4f93a8";
  const sc = width / 56, tx = x - 28 * sc, ty = y - 64 * sc; const noFace = hat === "glasses";
  const shield = acc === "shield" ? `<g transform="translate(12,42)"><path d="M0 -6 L5 -3.5 L5 2.6 Q5 6.6 0 8.4 Q-5 6.6 -5 2.6 L-5 -3.5 Z" fill="${a}" stroke="${ol}" stroke-width="0.5"/></g>` : "";
  const goggles = acc === "goggles" ? `<g stroke="${ol}" stroke-width="0.9"><circle cx="23" cy="10" r="2.8" fill="#bfeaf2"/><circle cx="33" cy="10" r="2.8" fill="#bfeaf2"/><path d="M25.8 10 h4.4"/></g>` : "";
  return `<g transform="translate(${tx},${ty}) scale(${sc}) ${flip ? `translate(56,0) scale(-1,1)` : ""}">
  <ellipse cx="28" cy="61" rx="11" ry="2.8" fill="#000" opacity="0.22"/>
  <rect x="24.4" y="45" width="3.3" height="14.5" rx="1.6" fill="#2b3142"/><rect x="28.3" y="45" width="3.3" height="14.5" rx="1.6" fill="#2b3142"/>
  <path d="M24.4 52 h3.3 v7.5 h-3.3 z" fill="#000" opacity="0.12"/>
  <path d="M22.9 57.6 h5.2 v2.2 q0 1.5 -1.5 1.5 h-2.2 q-1.5 0 -1.5 -1.5 z" fill="#1c2233"/><path d="M27.9 57.6 h5.2 v2.2 q0 1.5 -1.5 1.5 h-2.2 q-1.5 0 -1.5 -1.5 z" fill="#1c2233"/>
  <path d="M20.8 31 Q28 28 35.2 31 L32.8 47 Q28 49 23.2 47 Z" fill="${a}" stroke="${ol}" stroke-width="0.6"/>
  <path d="M28 28.6 Q31.6 29.4 35.2 31 L32.8 47 Q30.4 48.4 28 48.7 Z" fill="#000" opacity="0.10"/>
  <path d="M20.8 31 Q24.4 29.4 28 28.6 L28 48.7 Q25.6 48.4 23.2 47 Z" fill="#fff" opacity="0.08"/>
  <path d="M24.6 30.4 L28 34.2 L31.4 30.4" fill="none" stroke="#fff" stroke-width="1" opacity="0.5" stroke-linecap="round"/>
  <circle cx="28" cy="36" r="1.1" fill="#fff" opacity="0.8"/>
  <path d="M20.2 31 q-2.8 6.5 -1.5 11.8 l2.5 -0.7 q-1.1 -5 0.8 -9.6 z" fill="${a}" stroke="${ol}" stroke-width="0.5"/>
  <path d="M35.8 31 q2.8 6.5 1.5 11.8 l-2.5 -0.7 q1.1 -5 -0.8 -9.6 z" fill="${a}" stroke="${ol}" stroke-width="0.5"/>
  <circle cx="18.8" cy="43.6" r="1.9" fill="${sk}"/><circle cx="37.2" cy="43.6" r="1.9" fill="${sk}"/>
  ${itemVec(item)}
  <rect x="25.9" y="25.6" width="4.2" height="4" rx="1.6" fill="${sk}"/><path d="M25.9 25.6 h4.2 v1.5 q-2.1 1.1 -4.2 0 z" fill="#000" opacity="0.08"/>
  <circle cx="28" cy="16" r="12" fill="${sk}" stroke="${ol}" stroke-width="0.6"/>
  <path d="M28 5 a12 12 0 0 1 11 9 a12 12 0 0 0 -22 0 a12 12 0 0 1 11 -9" fill="#fff" opacity="0.07"/>
  <path d="M14 18 Q13 3 28 3 Q43 3 42 18 Q39 8 33 7 Q28 4.5 23 7 Q17 8 14 18 Z" fill="${hr}" stroke="${ol}" stroke-width="0.5"/>
  <path d="M15.6 17.5 Q14.6 8 20 6 L18.4 18 Z" fill="${hr}"/><path d="M40.4 17.5 Q41.4 8 36 6 L37.6 18 Z" fill="${hr}"/>
  <path d="M17.5 9 Q24 4.6 31.5 6.6" stroke="#fff" stroke-width="1.4" opacity="0.22" fill="none" stroke-linecap="round"/>
  ${hatVec(hat, a)}
  ${shield}${goggles}
  ${noFace ? "" : `<path d="M20.4 13.4 Q23 12.6 25.2 13.4" stroke="${hr}" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M30.8 13.4 Q33 12.6 35.6 13.4" stroke="${hr}" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.9"/><path d="M20.5 15.9 Q22.9 14.8 25.1 15.9" stroke="#2a2433" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M30.9 15.9 Q33.1 14.8 35.5 15.9" stroke="#2a2433" stroke-width="1.3" fill="none" stroke-linecap="round"/><ellipse cx="22.8" cy="18" rx="2" ry="2.7" fill="#fff"/><ellipse cx="33.2" cy="18" rx="2" ry="2.7" fill="#fff"/><ellipse cx="22.9" cy="18.3" rx="1.7" ry="2.3" fill="${eye}"/><ellipse cx="33.1" cy="18.3" rx="1.7" ry="2.3" fill="${eye}"/><circle cx="22.9" cy="18.8" r="0.9" fill="#13233a"/><circle cx="33.1" cy="18.8" r="0.9" fill="#13233a"/><circle cx="22.1" cy="16.9" r="0.85" fill="#fff"/><circle cx="32.3" cy="16.9" r="0.85" fill="#fff"/><circle cx="23.6" cy="19.4" r="0.45" fill="#dff4ff"/><circle cx="33.8" cy="19.4" r="0.45" fill="#dff4ff"/><ellipse cx="28" cy="20.3" rx="0.5" ry="0.4" fill="#000" opacity="0.1"/><path d="M26.4 22 Q28 23.1 29.6 22" stroke="#a86a4a" stroke-width="0.9" fill="none" stroke-linecap="round"/><ellipse cx="20.6" cy="20.6" rx="1.8" ry="1.05" fill="#fb9bb0" opacity="0.3"/><ellipse cx="35.4" cy="20.6" rx="1.8" ry="1.05" fill="#fb9bb0" opacity="0.3"/>`}
  </g>`;
}
function esc(s: string) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function bubble(x: number, y: number, text: string, a: string) { const w = text.length * 6.8 + 28; return `<g><rect x="${x - w / 2}" y="${y - 22}" width="${w}" height="22" rx="9" fill="rgba(245,251,255,0.97)" stroke="${a}" stroke-width="1.5"/><text x="${x}" y="${y - 7}" font-size="13" font-weight="600" fill="#0f1b2a" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${esc(text)}</text><polygon points="${x - 5},${y} ${x + 5},${y} ${x},${y + 6}" fill="rgba(245,251,255,0.97)"/></g>`; }
function nameplate(x: number, y: number, text: string, a: string) { const w = text.length * 6.2 + 16; return `<g><rect x="${x - w / 2}" y="${y}" width="${w}" height="17" rx="6" fill="rgba(10,22,38,0.82)" stroke="${a}"/><text x="${x}" y="${y + 12}" font-size="11" font-weight="700" fill="#eaf6ff" text-anchor="middle" font-family="Inter,system-ui,sans-serif">${esc(text)}</text></g>`; }
const npc = (x: number, y: number, look: { accent: string; item?: string; hat?: string }, name: string, line: string, flip = false) => `<g class="rpg-float">${bubble(x, y - 66, line, look.accent)}${chibi(x, y, look, 58, flip)}${nameplate(x, y + 2, name, look.accent)}</g>`;
type HeroLook = { accent?: string; item?: string; hat?: string; acc?: string; skin?: string; hair?: string };
const playerSvg = (x: number, y: number, accent: string, look: HeroLook, name: string, level: number) => `<g class="rpg-float-slow"><ellipse cx="${x}" cy="${y - 2}" rx="26" ry="9" fill="${accent}" opacity="0.22"/><ellipse cx="${x}" cy="${y - 2}" rx="26" ry="9" fill="none" stroke="${accent}" stroke-width="2.5" opacity="0.8"/><ellipse cx="${x}" cy="${y - 2}" rx="18" ry="6" fill="none" stroke="#eaffff" stroke-width="1" opacity="0.5"/>${bubble(x, y - 92, "That's me!", accent)}${chibi(x, y, { ...look, accent }, 80)}${nameplate(x, y + 6, `${name} · Lv ${level}`, accent)}</g>`;

/** Standalone big hero portrait (for the Avatar Creator live preview). */
export type AvatarLook = { accent?: string; skin?: string; hair?: string; item?: string; hat?: string; acc?: "none" | "shield" | "goggles" };
export function heroSvg(look: AvatarLook, width = 180) {
  const l = { accent: look.accent || "#7c5cff", skin: look.skin, hair: look.hair, item: look.item, hat: look.hat, acc: look.acc };
  const h = Math.round((width * 78) / 56);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 78" width="${width}" height="${h}" style="display:block">${chibi(28, 70, l, 56)}</svg>`;
}

export function buildTownSvg(opts: { classId: string; accent: string; name: string; level: number; maps: string; look?: AvatarLook }) {
  const { classId, accent, name, level, maps } = opts;
  const base = CLASS_LOOK[classId] ?? CLASS_LOOK.scholar;
  // merge saved avatar customization over the class default look
  const look = { ...base, ...(opts.look || {}) };
  const heroAccent = opts.look?.accent || accent;
  let parts = ""; let psr = 1234; const pc = ["#67e8f9", "#a78bfa", "#fcd34d"];
  for (let i = 0; i < 26; i++) { psr = (psr * 1103515245 + 12345) & 0x7fffffff; const x = psr % VB_W, y = (psr >> 8) % VB_H, r = 0.8 + (psr % 3) * 0.6; parts += `<circle cx="${x}" cy="${y}" r="${r}" fill="${pc[i % 3]}" opacity="0.5" class="rpg-twinkle"/>`; }
  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${VB_W} ${VB_H}" width="100%" height="auto" style="display:block" role="img" aria-label="Forgeheart City town map">`;
  s += defs();
  s += `<rect width="${VB_W}" height="${VB_H}" fill="url(#sky)"/>`;
  // anime dusk: sun glow + soft clouds
  s += `<rect width="${VB_W}" height="${VB_H}" fill="url(#sun)"/>`;
  s += `<circle cx="936" cy="96" r="34" fill="#fff6e0" opacity="0.9"/><circle cx="936" cy="96" r="52" fill="#ffe9b8" opacity="0.3"/>`;
  s += `<g fill="#ffffff" opacity="0.5"><ellipse cx="250" cy="70" rx="80" ry="20"/><ellipse cx="300" cy="60" rx="56" ry="18"/><ellipse cx="210" cy="62" rx="46" ry="15"/></g>`;
  s += `<g fill="#ffe7ef" opacity="0.4"><ellipse cx="640" cy="44" rx="70" ry="16"/><ellipse cx="690" cy="38" rx="46" ry="13"/></g>`;
  // aurora bands + constellation
  s += `<ellipse cx="360" cy="60" rx="460" ry="120" fill="#22d3ee" opacity="0.07"/><ellipse cx="880" cy="40" rx="460" ry="110" fill="#a78bfa" opacity="0.07"/>`;
  let cst = ""; let cs = 555; const star2: [number, number][] = [];
  for (let i = 0; i < 14; i++) { cs = (cs * 1103515245 + 12345) & 0x7fffffff; const x = cs % VB_W, y = (cs >> 9) % 150; star2.push([x, y]); cst += `<circle cx="${x}" cy="${y}" r="${1 + (cs % 2)}" fill="#cfeefc" opacity="0.6" class="rpg-twinkle"/>`; }
  for (let i = 0; i < star2.length - 1; i += 3) { const a1 = star2[i], b1 = star2[i + 1]; if (b1) cst += `<line x1="${a1[0]}" y1="${a1[1]}" x2="${b1[0]}" y2="${b1[1]}" stroke="#67e8f9" stroke-width="0.6" opacity="0.18"/>`; }
  s += cst;
  s += floor();
  s += plazaHolo();
  s += paths([[210, 380], [1000, 380], [1085, 590], [150, 590], [390, 520], [300, 650], [830, 630], [615, 150]]);
  SUBJECTS.forEach((sub, i) => (s += portal(PORTAL_X[i], 120, sub.accent, sub.name)));
  s += fountain(615, 412);
  // floating holographic town crest above the fountain
  s += `<g class="rpg-float-slow"><polygon points="615,338 631,360 615,382 599,360" fill="#67e8f9" opacity="0.18"/><polygon points="615,344 627,360 615,376 603,360" fill="none" stroke="#a5f3fc" stroke-width="1.5" opacity="0.85"/><polygon points="615,350 622,360 615,370 608,360" fill="#bdf3fc" opacity="0.9"/></g>`;
  s += building(210, 360, 64, 74, "#a78bfa", crestBook, "Class Hall", { banner: "#a78bfa", variant: "hall" });
  s += building(1000, 360, 64, 74, "#fb7185", crestGuild, "Guild Hall", { banner: "#fb7185", variant: "guild" });
  s += building(1085, 575, 48, 104, "#2dd4bf", crestSpark, "Mentor Tower", { variant: "tower" });
  s += building(130, 580, 56, 70, "#60a5fa", crestHome, "Parent Office", { variant: "office" });
  s += pylon(150, 470, "#67e8f9") + pylon(1055, 470, "#a78bfa") + planter(505, 360) + planter(725, 360);
  s += questBoard(390, 505) + rewardStall(285, 635) + building(830, 615, 60, 74, "#f43f5e", crestArena, "Arena Gate", { variant: "gate" }) + crate(360, 660);
  s += npc(470, 300, { accent: "#2dd4bf", item: "compass" }, "Map Guide", "New realms await!");
  s += npc(540, 560, { accent: "#38bdf8", item: "scroll", hat: "glasses" }, "Quest Aide", "Quiz due?");
  s += npc(235, 560, { accent: "#f472b6", item: "notebook", hat: "cap" }, "Reward Keeper", "Trade tokens!", true);
  s += npc(700, 575, { accent: "#10b981", item: "satchel", hat: "hood" }, "Health Helper", "Care quest ready", true);
  s += playerSvg(620, 680, heroAccent, look, name, level);
  s += `<g>${parts}</g>`;
  // drifting sakura-style petals (anime ambience)
  let petals = ""; let pp = 9182;
  for (let i = 0; i < 16; i++) { pp = (pp * 1103515245 + 12345) & 0x7fffffff; const x = pp % VB_W, y = (pp >> 7) % VB_H, r = 2.6 + (pp % 3); const rot = pp % 360; petals += `<g transform="translate(${x},${y}) rotate(${rot})" class="rpg-float-slow" style="animation-delay:${(pp % 50) / 10}s"><path d="M0 ${-r} Q${r} 0 0 ${r} Q${-r} 0 0 ${-r} Z" fill="#ffc7dd" opacity="0.7"/></g>`; }
  s += petals;
  // warm key light + scanline + fog + vignette
  s += `<rect width="${VB_W}" height="${VB_H}" fill="url(#warmlight)"/>`;
  s += `<rect width="${VB_W}" height="180" fill="url(#fog)"/>`;
  s += `<rect width="${VB_W}" height="${VB_H}" fill="url(#scan)" opacity="0.07"/>`;
  s += `<rect width="${VB_W}" height="${VB_H}" fill="url(#vig)"/>`;
  s += `<g><rect x="18" y="18" width="218" height="30" rx="9" fill="rgba(10,22,38,0.66)" stroke="rgba(103,232,249,0.5)"/><circle cx="36" cy="33" r="4" fill="#22d3ee"/><text x="50" y="38" font-size="14" font-weight="700" fill="#cffafe" font-family="Inter,system-ui,sans-serif" letter-spacing="0.5">FORGEHEART CITY</text></g>`;
  s += `<g><rect x="${VB_W - 152}" y="18" width="134" height="30" rx="9" fill="rgba(10,22,38,0.66)" stroke="rgba(251,191,36,0.4)"/><text x="${VB_W - 85}" y="38" font-size="13" font-weight="700" fill="#fde68a" text-anchor="middle" font-family="Inter,system-ui,sans-serif">Realms ${maps}</text></g>`;
  s += `</svg>`;
  return s;
}
