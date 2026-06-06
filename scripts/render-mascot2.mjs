import sharp from "sharp";
import { writeFileSync } from "node:fs";

/* ── Geometry helpers for a bold, angular mecha-eagle emblem ── */
const rad = (d) => (d * Math.PI) / 180;
const f1 = (n) => n.toFixed(1);

// A sharp pointed armor blade (triangle: baseL → tip → baseR).
function blade(cx, cy, angleDeg, length, baseW) {
  const a = rad(angleDeg);
  const dx = Math.sin(a), dy = -Math.cos(a), px = Math.cos(a), py = Math.sin(a);
  const blx = cx - (px * baseW) / 2, bly = cy - (py * baseW) / 2;
  const brx = cx + (px * baseW) / 2, bry = cy + (py * baseW) / 2;
  const tx = cx + dx * length, ty = cy + dy * length;
  return { d: `M ${f1(blx)} ${f1(bly)} L ${f1(tx)} ${f1(ty)} L ${f1(brx)} ${f1(bry)} Z`, tip: [tx, ty], baseL: [blx, bly], baseR: [brx, bry] };
}

// One bold wing: stacked angular blades fanning up & out from a shoulder.
function buildWing(sx, sy, dir) {
  const N = 5;
  const blades = [];
  const tips = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const angle = dir * (24 + t * 50);       // inner up → outer swept out
    const length = 158 - t * 30;             // long, robust
    const baseW = 34 - t * 12;               // wide bases → solid
    const bx = sx + dir * t * 12;
    const by = sy - t * 10;
    const b = blade(bx, by, angle, length, baseW);
    blades.push({ ...b, gold: i === N - 1 });
    tips.push(b.tip);
  }
  // membrane fills the fan so it reads solid
  const membrane =
    `M ${f1(sx)} ${f1(sy + 14)} ` +
    `L ${f1(blades[0].baseL[0])} ${f1(blades[0].baseL[1])} ` +
    tips.map((p) => `L ${f1(p[0])} ${f1(p[1])}`).join(" ") +
    ` L ${f1(blades[N - 1].baseR[0])} ${f1(blades[N - 1].baseR[1])} Z`;
  return { blades, membrane };
}

const R = { x: 236, y: 214 }, L = { x: 164, y: 214 };
const wR = buildWing(R.x, R.y, 1), wL = buildWing(L.x, L.y, -1);

const defs = `
<linearGradient id="steel" x1="20%" y1="0%" x2="80%" y2="100%">
  <stop offset="0%" stop-color="#dbe3ee"/><stop offset="35%" stop-color="#9aa7b9"/>
  <stop offset="70%" stop-color="#5c6979"/><stop offset="100%" stop-color="#3a4453"/>
</linearGradient>
<linearGradient id="steelDark" x1="50%" y1="0%" x2="50%" y2="100%">
  <stop offset="0%" stop-color="#3d4756"/><stop offset="100%" stop-color="#161d28"/>
</linearGradient>
<linearGradient id="plate" x1="50%" y1="0%" x2="50%" y2="100%">
  <stop offset="0%" stop-color="#aeb9c8"/><stop offset="50%" stop-color="#6c7889"/><stop offset="100%" stop-color="#2c3542"/>
</linearGradient>
<linearGradient id="gold" x1="20%" y1="0%" x2="80%" y2="100%">
  <stop offset="0%" stop-color="#fde68a"/><stop offset="45%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/>
</linearGradient>
<radialGradient id="eye" cx="50%" cy="40%" r="60%">
  <stop offset="0%" stop-color="#ffffff"/><stop offset="40%" stop-color="#a5f3fc"/><stop offset="100%" stop-color="#22d3ee"/>
</radialGradient>
<radialGradient id="ring" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#22d3ee" stop-opacity="0"/><stop offset="78%" stop-color="#22d3ee" stop-opacity="0.10"/>
  <stop offset="92%" stop-color="#22d3ee" stop-opacity="0.30"/><stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/>
</radialGradient>
`;

const wingSvg = (w) => `
<path d="${w.membrane}" fill="url(#steelDark)" stroke="rgba(34,211,238,0.25)" stroke-width="1"/>
${w.blades.map((b) => `<path d="${b.d}" fill="${b.gold ? "url(#gold)" : "url(#plate)"}" stroke="rgba(10,15,25,0.5)" stroke-width="1"/>`).join("")}
${w.blades.map((b) => `<path d="M ${f1(b.baseL[0] + (b.tip[0]-b.baseL[0])*0.1)} ${f1(b.baseL[1] + (b.tip[1]-b.baseL[1])*0.1)} L ${f1(b.tip[0])} ${f1(b.tip[1])}" stroke="rgba(180,200,220,0.5)" stroke-width="0.8" fill="none"/>`).join("")}
`;

const svg = `<svg viewBox="0 0 400 440" width="400" height="440" xmlns="http://www.w3.org/2000/svg">
<defs>${defs}</defs>
<rect width="400" height="440" fill="#0b1220"/>
<circle cx="200" cy="210" r="180" fill="url(#ring)"/>

<!-- wings -->
<g>${wingSvg(wL)}</g>
<g>${wingSvg(wR)}</g>

<!-- chest shield -->
<path d="M 176 196 L 224 196 L 232 232 L 200 304 L 168 232 Z" fill="url(#steel)" stroke="rgba(10,15,25,0.5)" stroke-width="1.2"/>
<path d="M 200 210 L 200 296" stroke="rgba(34,211,238,0.5)" stroke-width="1.2"/>
<path d="M 178 220 L 200 210 L 222 220" stroke="rgba(10,15,25,0.4)" stroke-width="1" fill="none"/>
<path d="M 200 232 L 188 250 M 200 232 L 212 250" stroke="rgba(10,15,25,0.35)" stroke-width="1" fill="none"/>
<circle cx="200" cy="236" r="6.5" fill="#0b1220" stroke="rgba(34,211,238,0.6)" stroke-width="1"/>
<path d="M 200 231.5 L 201.4 235.2 L 205.2 235.2 L 202.1 237.6 L 203.3 241.4 L 200 239.1 L 196.7 241.4 L 197.9 237.6 L 194.8 235.2 L 198.6 235.2 Z" fill="#fde68a"/>

<!-- crest blades -->
<path d="M 184 118 L 176 70 L 196 110 Z" fill="url(#gold)"/>
<path d="M 200 112 L 200 58 L 212 108 Z" fill="url(#gold)"/>
<path d="M 216 118 L 224 70 L 204 110 Z" fill="url(#gold)"/>

<!-- head / helmet -->
<path d="M 200 108
  C 232 108 254 130 254 160
  C 254 180 244 196 226 206
  L 220 214 L 200 220 L 180 214 L 174 206
  C 156 196 146 180 146 160
  C 146 130 168 108 200 108 Z" fill="url(#steel)" stroke="rgba(10,15,25,0.45)" stroke-width="1.2"/>
<path d="M 200 110 L 200 150" stroke="rgba(10,15,25,0.3)" stroke-width="1"/>
<path d="M 162 150 Q 200 138 238 150" stroke="rgba(255,255,255,0.35)" stroke-width="1.2" fill="none"/>
<ellipse cx="180" cy="138" rx="20" ry="8" fill="rgba(255,255,255,0.5)"/>

<!-- visor band -->
<path d="M 156 158 C 168 150 184 150 200 156 C 216 150 232 150 244 158 C 248 172 240 184 224 188 C 210 190 200 188 200 188 C 200 188 190 190 176 188 C 160 184 152 172 156 158 Z" fill="#0b1220"/>
<path d="M 160 162 Q 200 154 240 162" stroke="rgba(34,211,238,0.4)" stroke-width="1" fill="none"/>
<!-- eyes -->
<path d="M 168 168 L 190 164 L 186 176 L 170 178 Z" fill="url(#eye)"/>
<path d="M 232 168 L 210 164 L 214 176 L 230 178 Z" fill="url(#eye)"/>
<path d="M 194 170 L 200 176 L 206 170" stroke="rgba(34,211,238,0.7)" stroke-width="1.4" fill="none"/>

<!-- beak -->
<path d="M 188 196 L 212 196 L 206 214 Q 200 226 200 226 Q 200 226 194 214 Z" fill="url(#gold)" stroke="rgba(120,53,15,0.5)" stroke-width="0.8"/>
<path d="M 200 226 Q 196 220 196 212 L 204 212 Q 204 220 200 226 Z" fill="#92400e"/>
<path d="M 194 200 L 206 200" stroke="rgba(120,53,15,0.5)" stroke-width="1"/>

<!-- hover base -->
<ellipse cx="200" cy="340" rx="60" ry="8" fill="none" stroke="#22d3ee" stroke-width="1.4" opacity="0.6"/>
<ellipse cx="200" cy="340" rx="40" ry="5" fill="none" stroke="#67e8f9" stroke-width="0.9" opacity="0.4"/>
</svg>`;

writeFileSync("/tmp/mascot2.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("/tmp/mascot2.png");
console.log("wrote /tmp/mascot2.png");
