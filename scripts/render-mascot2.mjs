import sharp from "sharp";
import { writeFileSync } from "node:fs";

const rad = (d) => (d * Math.PI) / 180;
const f1 = (n) => n.toFixed(1);

function blade(cx, cy, angleDeg, length, baseW) {
  const a = rad(angleDeg);
  const dx = Math.sin(a), dy = -Math.cos(a), px = Math.cos(a), py = Math.sin(a);
  const blx = cx - (px * baseW) / 2, bly = cy - (py * baseW) / 2;
  const brx = cx + (px * baseW) / 2, bry = cy + (py * baseW) / 2;
  const tx = cx + dx * length, ty = cy + dy * length;
  return { d: `M ${f1(blx)} ${f1(bly)} L ${f1(tx)} ${f1(ty)} L ${f1(brx)} ${f1(bry)} Z`, tip: [tx, ty], baseL: [blx, bly], baseR: [brx, bry] };
}
function buildWing(sx, sy, dir) {
  const N = 5;
  const blades = [];
  const tips = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const angle = dir * (22 + t * 52);
    const length = 168 - t * 34;
    const baseW = 30 - t * 11;
    const bx = sx + dir * t * 13;
    const by = sy - t * 11;
    const b = blade(bx, by, angle, length, baseW);
    blades.push({ ...b, gold: i === N - 1 });
    tips.push(b.tip);
  }
  const membrane = `M ${f1(sx)} ${f1(sy + 14)} L ${f1(blades[0].baseL[0])} ${f1(blades[0].baseL[1])} ` +
    tips.map((p) => `L ${f1(p[0])} ${f1(p[1])}`).join(" ") + ` L ${f1(blades[N - 1].baseR[0])} ${f1(blades[N - 1].baseR[1])} Z`;
  const leading = `M ${f1(blades[0].tip[0])} ${f1(blades[0].tip[1])} ` + tips.slice(1).map((p) => `L ${f1(p[0])} ${f1(p[1])}`).join(" ");
  return { blades, membrane, leading };
}
const R = { x: 238, y: 214 }, L = { x: 162, y: 214 };
const wR = buildWing(R.x, R.y, 1), wL = buildWing(L.x, L.y, -1);

const defs = `
<linearGradient id="steel" x1="25%" y1="0%" x2="75%" y2="100%">
  <stop offset="0%" stop-color="#e6edf6"/><stop offset="30%" stop-color="#aab8cb"/>
  <stop offset="62%" stop-color="#5b6a80"/><stop offset="100%" stop-color="#2f3a4b"/></linearGradient>
<linearGradient id="steelDark" x1="50%" y1="0%" x2="50%" y2="100%">
  <stop offset="0%" stop-color="#364254"/><stop offset="100%" stop-color="#10161f"/></linearGradient>
<linearGradient id="plate" x1="50%" y1="0%" x2="50%" y2="100%">
  <stop offset="0%" stop-color="#c2cedd"/><stop offset="45%" stop-color="#73829a"/><stop offset="100%" stop-color="#28313f"/></linearGradient>
<linearGradient id="gold" x1="20%" y1="0%" x2="80%" y2="100%">
  <stop offset="0%" stop-color="#fff0c2"/><stop offset="45%" stop-color="#f5a814"/><stop offset="100%" stop-color="#a4560a"/></linearGradient>
<radialGradient id="eye" cx="50%" cy="40%" r="60%">
  <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#bdf6fd"/><stop offset="100%" stop-color="#22d3ee"/></radialGradient>
<radialGradient id="core" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#ffffff"/><stop offset="35%" stop-color="#a5f3fc"/><stop offset="75%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#0e7490" stop-opacity="0"/></radialGradient>
<radialGradient id="ring" cx="50%" cy="50%" r="50%">
  <stop offset="0%" stop-color="#22d3ee" stop-opacity="0"/><stop offset="74%" stop-color="#22d3ee" stop-opacity="0.08"/>
  <stop offset="90%" stop-color="#22d3ee" stop-opacity="0.28"/><stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
`;

const wingSvg = (w) => `
<path d="${w.membrane}" fill="url(#steelDark)" stroke="rgba(34,211,238,0.22)" stroke-width="1"/>
${w.blades.map((b) => `<path d="${b.d}" fill="${b.gold ? "url(#gold)" : "url(#plate)"}" stroke="rgba(8,12,22,0.55)" stroke-width="1"/>`).join("")}
${w.blades.map((b) => `<path d="M ${f1(b.baseL[0] + (b.tip[0]-b.baseL[0])*0.12)} ${f1(b.baseL[1] + (b.tip[1]-b.baseL[1])*0.12)} L ${f1(b.tip[0])} ${f1(b.tip[1])}" stroke="rgba(200,215,232,0.5)" stroke-width="0.8" fill="none"/>`).join("")}
<path d="${w.leading}" stroke="rgba(103,232,249,0.7)" stroke-width="1.4" fill="none" stroke-linejoin="round"/>
`;

// HUD corner bracket
const bracket = (x, y, sx, sy) => `<path d="M ${x + 22*sx} ${y} L ${x} ${y} L ${x} ${y + 22*sy}" stroke="rgba(34,211,238,0.35)" stroke-width="1.4" fill="none"/>`;

const svg = `<svg viewBox="0 0 400 440" width="400" height="440" xmlns="http://www.w3.org/2000/svg">
<defs>${defs}</defs>
<rect width="400" height="440" fill="#0a0f1a"/>
<circle cx="200" cy="208" r="184" fill="url(#ring)"/>
<polygon points="200,44 360,140 360,300 200,396 40,300 40,140" fill="none" stroke="rgba(34,211,238,0.12)" stroke-width="1"/>
<circle cx="200" cy="208" r="150" fill="none" stroke="rgba(34,211,238,0.10)" stroke-width="1" stroke-dasharray="2 9"/>
${bracket(54,90,1,1)}${bracket(346,90,-1,1)}${bracket(54,330,1,-1)}${bracket(346,330,-1,-1)}

<!-- wings -->
<g>${wingSvg(wL)}</g>
<g>${wingSvg(wR)}</g>

<!-- shoulder light nodes -->
<circle cx="${L.x}" cy="${L.y}" r="3" fill="#a5f3fc"/><circle cx="${R.x}" cy="${R.y}" r="3" fill="#a5f3fc"/>

<!-- chest shield -->
<path d="M 174 196 L 226 196 L 234 234 L 200 306 L 166 234 Z" fill="url(#steel)" stroke="rgba(8,12,22,0.55)" stroke-width="1.2"/>
<path d="M 178 220 L 200 210 L 222 220" stroke="rgba(8,12,22,0.4)" stroke-width="1" fill="none"/>
<path d="M 184 250 L 200 244 L 216 250 L 200 300 Z" fill="url(#steelDark)" opacity="0.5"/>
<path d="M 200 210 L 200 300" stroke="rgba(34,211,238,0.45)" stroke-width="1"/>
<!-- hex core -->
<circle cx="200" cy="234" r="14" fill="url(#core)" opacity="0.5"/>
<polygon points="200,224 209,229 209,239 200,244 191,239 191,229" fill="#0a1019" stroke="rgba(34,211,238,0.7)" stroke-width="1.2"/>
<path d="M 200 229.5 L 201.5 233.4 L 205.6 233.4 L 202.3 235.9 L 203.6 239.8 L 200 237.4 L 196.4 239.8 L 197.7 235.9 L 194.4 233.4 L 198.5 233.4 Z" fill="#ffe9a8"/>

<!-- crown band + swept crest -->
<path d="M 176 116 Q 200 104 224 116 L 221 124 Q 200 114 179 124 Z" fill="url(#steel)" stroke="rgba(8,12,22,0.5)" stroke-width="0.8"/>
<path d="M 184 116 L 172 64 L 192 112 Z" fill="url(#gold)"/>
<path d="M 197 112 L 201 54 L 209 110 Z" fill="url(#gold)"/>
<path d="M 216 116 L 228 64 L 208 112 Z" fill="url(#gold)"/>

<!-- helmet head -->
<path d="M 200 108 C 233 108 256 131 256 161 C 256 181 246 197 227 207 L 220 216 L 200 222 L 180 216 L 173 207 C 154 197 144 181 144 161 C 144 131 167 108 200 108 Z" fill="url(#steel)" stroke="rgba(8,12,22,0.5)" stroke-width="1.2"/>
<path d="M 200 110 L 200 150" stroke="rgba(8,12,22,0.28)" stroke-width="1"/>
<path d="M 158 168 Q 162 192 180 208" stroke="rgba(8,12,22,0.3)" stroke-width="1" fill="none"/>
<path d="M 242 168 Q 238 192 220 208" stroke="rgba(8,12,22,0.3)" stroke-width="1" fill="none"/>
<path d="M 182 214 Q 200 222 218 214" stroke="rgba(8,12,22,0.3)" stroke-width="1" fill="none"/>
<ellipse cx="180" cy="136" rx="20" ry="8" fill="rgba(255,255,255,0.5)"/>
<path d="M 253 140 Q 258 165 246 192" stroke="rgba(103,232,249,0.55)" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M 147 140 Q 142 165 154 192" stroke="rgba(167,139,250,0.45)" stroke-width="1.8" fill="none" stroke-linecap="round"/>

<!-- angular visor -->
<path d="M 152 158 L 176 149 L 198 158 L 200 163 L 202 158 L 224 149 L 248 158 L 244 181 L 224 191 L 202 187 L 200 185 L 198 187 L 176 191 L 156 181 Z" fill="#0a1019" stroke="rgba(34,211,238,0.25)" stroke-width="0.8"/>
<!-- fierce angular eyes -->
<path d="M 166 164 L 193 171 L 188 180 L 168 177 Z" fill="url(#eye)"/>
<path d="M 234 164 L 207 171 L 212 180 L 232 177 Z" fill="url(#eye)"/>
<path d="M 175 173 L 187 175" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
<path d="M 225 173 L 213 175" stroke="#ffffff" stroke-width="1.2" opacity="0.8"/>
<path d="M 194 175 L 200 182 L 206 175" stroke="rgba(34,211,238,0.7)" stroke-width="1.5" fill="none"/>
<path d="M 160 186 Q 200 178 240 186" stroke="rgba(34,211,238,0.55)" stroke-width="1.2" fill="none"/>

<!-- beak -->
<path d="M 188 197 L 212 197 L 205 215 Q 200 227 200 227 Q 200 227 195 215 Z" fill="url(#gold)" stroke="rgba(120,53,15,0.5)" stroke-width="0.8"/>
<path d="M 200 227 Q 196 221 196 213 L 204 213 Q 204 221 200 227 Z" fill="#8a3d0c"/>
<path d="M 194 201 L 206 201" stroke="rgba(120,53,15,0.5)" stroke-width="1"/>

<!-- hover disc -->
<ellipse cx="200" cy="344" rx="62" ry="8" fill="none" stroke="#22d3ee" stroke-width="1.4" opacity="0.6"/>
<ellipse cx="200" cy="344" rx="42" ry="5" fill="none" stroke="#67e8f9" stroke-width="0.9" opacity="0.4"/>
</svg>`;

writeFileSync("/tmp/mascot2.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("/tmp/mascot2.png");
console.log("wrote /tmp/mascot2.png");
