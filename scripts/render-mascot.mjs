import sharp from "sharp";
import { writeFileSync } from "node:fs";

/* Mirror of the geometry helpers in ForgeBotMascot.tsx (resting state). */
function shard(cx, cy, angleDeg, length, baseW) {
  const a = (angleDeg * Math.PI) / 180;
  const dx = Math.sin(a), dy = -Math.cos(a), px = Math.cos(a), py = Math.sin(a);
  const blx = cx - (px * baseW) / 2, bly = cy - (py * baseW) / 2;
  const brx = cx + (px * baseW) / 2, bry = cy + (py * baseW) / 2;
  const tipx = cx + dx * length, tipy = cy + dy * length;
  const mLx = cx + dx * length * 0.5 - px * baseW * 0.28;
  const mLy = cy + dy * length * 0.5 - py * baseW * 0.28;
  const mRx = cx + dx * length * 0.5 + px * baseW * 0.28;
  const mRy = cy + dy * length * 0.5 + py * baseW * 0.28;
  const f = (n) => n.toFixed(1);
  return `M ${f(blx)} ${f(bly)} Q ${f(mLx)} ${f(mLy)} ${f(tipx)} ${f(tipy)} Q ${f(mRx)} ${f(mRy)} ${f(brx)} ${f(bry)} Z`;
}
function shardSpine(cx, cy, angleDeg, length) {
  const a = (angleDeg * Math.PI) / 180;
  const tipx = cx + Math.sin(a) * length, tipy = cy - Math.cos(a) * length;
  const f = (n) => n.toFixed(1);
  return `M ${f(cx)} ${f(cy)} L ${f(tipx)} ${f(tipy)}`;
}
function shardTip(cx, cy, angleDeg, length) {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + Math.sin(a) * length, cy - Math.cos(a) * length];
}
function buildWing(ax, ay, dir) {
  const primaries = [];
  const bases = [], tips = [];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const bx = ax + dir * f * 34;
    const by = ay - f * 28;
    const angle = dir * (8 + f * 64);
    const length = 150 - f * 48;
    const baseW = 26 - f * 11;
    const tip = shardTip(bx, by, angle, length);
    bases.push([bx, by]); tips.push(tip);
    primaries.push({ d: shard(bx, by, angle, length, baseW), spine: shardSpine(bx, by, angle, length * 0.9), tip, gold: i >= N - 4 });
  }
  const fmt = (p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const membrane = `M ${fmt(bases[0])} ` + bases.slice(1).map((p) => `L ${fmt(p)}`).join(" ") + " " + [...tips].reverse().map((p) => `L ${fmt(p)}`).join(" ") + " Z";
  const coverts = [];
  const M = 7;
  for (let i = 0; i < M; i++) {
    const f = i / (M - 1);
    const bx = ax + dir * (4 + f * 22);
    const by = ay + 8 - f * 14;
    const angle = dir * (18 + f * 44);
    const length = 60 - f * 26;
    const baseW = 17 - f * 6;
    coverts.push(shard(bx, by, angle, length, baseW));
  }
  return { primaries, coverts, membrane };
}
const R = { x: 232, y: 240 }, L = { x: 168, y: 240 };
const wingR = buildWing(R.x, R.y, 1), wingL = buildWing(L.x, L.y, -1);
const tail = [];
{ const N = 7; for (let i = 0; i < N; i++) { const t = (i / (N - 1)) * 2 - 1; const angle = 180 + t * 26; const length = 70 - Math.abs(t) * 16; tail.push({ d: shard(200, 312, angle, length, 16 - Math.abs(t) * 3), tip: shardTip(200, 312, angle, length) }); } }
const crest = [];
{ const ax = 196, ay = 150, N = 7; for (let i = 0; i < N; i++) { const t = i / (N - 1); const angle = -64 + t * 58; const length = 60 - t * 18; const baseW = 9 - t * 3; const [tx, ty] = shardTip(ax, ay, angle, length); crest.push({ outer: shard(ax, ay, angle, length, baseW), spine: shardSpine(ax, ay, angle, length * 0.9), tipX: tx, tipY: ty }); } }

const defs = `
<radialGradient id="headGrad" cx="40%" cy="22%" r="84%"><stop offset="0%" stop-color="#ffffff"/><stop offset="46%" stop-color="#eef2f7"/><stop offset="80%" stop-color="#cdd6e2"/><stop offset="100%" stop-color="#a3aebd"/></radialGradient>
<linearGradient id="bodyGrad" x1="30%" y1="0%" x2="70%" y2="100%"><stop offset="0%" stop-color="#6c7c93"/><stop offset="50%" stop-color="#3a4862"/><stop offset="100%" stop-color="#1b2536"/></linearGradient>
<linearGradient id="bellyGrad" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stop-color="#9fb0c6"/><stop offset="100%" stop-color="#dbe4f0"/></linearGradient>
<linearGradient id="featherGrad" x1="50%" y1="100%" x2="50%" y2="0%"><stop offset="0%" stop-color="#1b2330"/><stop offset="55%" stop-color="#46566b"/><stop offset="100%" stop-color="#8d9cb1"/></linearGradient>
<linearGradient id="featherGold" x1="50%" y1="100%" x2="50%" y2="0%"><stop offset="0%" stop-color="#1b2330"/><stop offset="68%" stop-color="#46566b"/><stop offset="86%" stop-color="#d97706"/><stop offset="100%" stop-color="#fde68a"/></linearGradient>
<linearGradient id="holoSheen" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#22d3ee" stop-opacity="0"/><stop offset="42%" stop-color="#22d3ee" stop-opacity="0.18"/><stop offset="60%" stop-color="#a78bfa" stop-opacity="0.22"/><stop offset="80%" stop-color="#fbbf24" stop-opacity="0.16"/><stop offset="100%" stop-color="#22d3ee" stop-opacity="0"/></linearGradient>
<radialGradient id="coreGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#ffffff"/><stop offset="30%" stop-color="#a5f3fc"/><stop offset="70%" stop-color="#22d3ee"/><stop offset="100%" stop-color="#0e7490" stop-opacity="0"/></radialGradient>
<linearGradient id="crestGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#334155"/><stop offset="60%" stop-color="#d97706"/><stop offset="100%" stop-color="#fcd34d"/></linearGradient>
<linearGradient id="beakGrad" x1="20%" y1="0%" x2="80%" y2="100%"><stop offset="0%" stop-color="#fde68a"/><stop offset="40%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></linearGradient>
<radialGradient id="eyeGrad" cx="40%" cy="35%" r="70%"><stop offset="0%" stop-color="#fde68a"/><stop offset="60%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#b45309"/></radialGradient>
`;

const wingSvg = (w) => `
<path d="${w.membrane}" fill="url(#featherGrad)" stroke="rgba(34,211,238,0.4)" stroke-width="1"/>
<path d="${w.membrane}" fill="url(#holoSheen)"/>
${w.coverts.map((d) => `<path d="${d}" fill="url(#bodyGrad)" stroke="rgba(8,12,24,0.4)" stroke-width="0.6" opacity="0.92"/>`).join("")}
${w.primaries.map((ft) => `<path d="${ft.d}" fill="${ft.gold ? "url(#featherGold)" : "url(#featherGrad)"}" stroke="rgba(8,12,24,0.45)" stroke-width="0.6"/><path d="${ft.spine}" stroke="rgba(103,232,249,0.55)" stroke-width="0.9" fill="none" stroke-linecap="round"/>`).join("")}
${w.primaries.map((ft) => `<circle cx="${ft.tip[0].toFixed(1)}" cy="${ft.tip[1].toFixed(1)}" r="1.7" fill="${ft.gold ? "#fde68a" : "#a5f3fc"}"/>`).join("")}
`;

const svg = `<svg viewBox="0 0 400 440" width="400" height="440" xmlns="http://www.w3.org/2000/svg">
<defs>${defs}</defs>
<rect width="400" height="440" fill="#0b1020"/>
<ellipse cx="200" cy="416" rx="56" ry="5" fill="rgba(0,0,0,0.55)"/>
<g>${wingSvg(wingL)}</g>
<g>${wingSvg(wingR)}</g>
<g>${tail.map((tf) => `<path d="${tf.d}" fill="url(#featherGrad)" stroke="rgba(8,12,24,0.4)" stroke-width="0.6"/><circle cx="${tf.tip[0].toFixed(1)}" cy="${tf.tip[1].toFixed(1)}" r="3.4" fill="#eef2f7" opacity="0.9"/>`).join("")}</g>
<path d="M 200 196 C 224 198 240 214 244 244 C 247 268 242 296 228 318 C 220 330 210 336 200 336 C 190 336 180 330 172 318 C 158 296 153 268 156 244 C 160 214 176 198 200 196 Z" fill="url(#bodyGrad)"/>
<path d="M 200 232 C 214 234 222 250 222 272 C 222 296 213 318 200 326 C 187 318 178 296 178 272 C 178 250 186 234 200 232 Z" fill="url(#bellyGrad)" opacity="0.92"/>
<g stroke="rgba(8,12,24,0.45)" stroke-width="0.9" fill="none" stroke-linecap="round"><path d="M 200 214 L 200 236"/><path d="M 178 246 Q 200 240 222 246"/><path d="M 172 300 Q 200 312 228 300"/><path d="M 184 318 L 190 328 M 216 318 L 210 328"/></g>
<g stroke="rgba(34,211,238,0.4)" stroke-width="0.6" fill="none" stroke-linecap="round"><path d="M 200 216 L 200 250"/><path d="M 182 300 Q 200 310 218 300"/></g>
<circle cx="200" cy="280" r="15" fill="url(#coreGlow)" opacity="0.55"/>
<circle cx="200" cy="280" r="9" fill="none" stroke="rgba(34,211,238,0.7)" stroke-width="1.2"/>
<circle cx="200" cy="280" r="6" fill="none" stroke="rgba(167,139,250,0.6)" stroke-width="0.8" stroke-dasharray="2 3"/>
<path d="M 200 273 L 201.8 278 L 207 278 L 202.8 281.2 L 204.4 286 L 200 283 L 195.6 286 L 197.2 281.2 L 193 278 L 198.2 278 Z" fill="#fde68a"/>
<circle cx="200" cy="262" r="1.5" fill="#fbbf24"/><circle cx="184" cy="294" r="1.5" fill="#fbbf24"/><circle cx="216" cy="294" r="1.5" fill="#fbbf24"/>
<g stroke="#92400e" stroke-width="0.6"><path d="M 186 326 q -4 8 -2 16 q 1 4 5 4 q -3 -6 -1 -12 q -2 5 -5 7 q 4 -8 1 -15 Z" fill="url(#beakGrad)"/><path d="M 210 328 q 4 8 2 16 q -1 4 -5 4 q 3 -6 1 -12 q 2 5 5 7 q -4 -8 -1 -15 Z" fill="url(#beakGrad)"/></g>
<path d="M 180 200 Q 200 188 220 200 Q 214 214 200 216 Q 186 214 180 200 Z" fill="url(#bodyGrad)"/>
<g>${crest.map((c) => `<path d="${c.outer}" fill="url(#crestGrad)" stroke="rgba(8,12,24,0.4)" stroke-width="0.5"/><path d="${c.spine}" stroke="rgba(103,232,249,0.5)" stroke-width="0.8" fill="none" stroke-linecap="round"/><circle cx="${c.tipX.toFixed(1)}" cy="${c.tipY.toFixed(1)}" r="2" fill="#fef3c7"/>`).join("")}</g>
<path d="M 168 158 C 168 134 186 120 208 122 C 228 124 242 140 242 160 C 242 174 236 186 224 194 C 232 196 240 200 246 206 C 236 210 224 210 214 206 C 206 210 196 212 186 210 C 174 206 166 196 164 184 C 162 174 163 166 168 158 Z" fill="url(#headGrad)"/>
<ellipse cx="190" cy="142" rx="22" ry="9" fill="rgba(255,255,255,0.9)"/>
<path d="M 170 134 Q 162 158 174 192" stroke="#67e8f9" stroke-width="2.6" fill="none" stroke-linecap="round" opacity="0.55"/>
<path d="M 184 126 Q 206 132 222 150" stroke="rgba(148,163,184,0.5)" stroke-width="0.8" fill="none" stroke-linecap="round"/>
<path d="M 196 150 Q 220 142 240 154 Q 234 162 224 164 Q 210 158 198 162 Q 196 156 196 150 Z" fill="url(#bodyGrad)"/>
<path d="M 197 153 Q 218 145 238 156" stroke="rgba(34,211,238,0.7)" stroke-width="1.3" fill="none" stroke-linecap="round"/>
<g stroke="rgba(103,232,249,0.6)" stroke-width="0.8" stroke-linecap="round"><line x1="218" y1="154" x2="218" y2="158"/><line x1="230" y1="159" x2="233" y2="161"/><line x1="206" y1="159" x2="203" y2="161"/></g>
<ellipse cx="218" cy="168" rx="10.5" ry="8.5" fill="url(#eyeGrad)" stroke="#78350f" stroke-width="0.8"/>
<circle cx="221" cy="168" r="4.2" fill="#1a0f02"/><circle cx="219.4" cy="166" r="1.6" fill="#a5f3fc"/>
<path d="M 232 168 Q 244 166 250 172 Q 248 178 242 180 Q 236 178 232 174 Z" fill="#d97706"/><circle cx="240" cy="172" r="1.2" fill="#451a03"/>
<path d="M 240 174 Q 258 172 268 178 Q 274 184 270 192 Q 264 200 254 200 Q 258 194 256 190 Q 250 196 244 194 Q 238 190 238 184 Q 238 178 240 174 Z" fill="url(#beakGrad)"/>
<path d="M 254 200 Q 264 200 270 192 Q 268 202 258 205 Q 253 205 254 200 Z" fill="#92400e"/>
<path d="M 244 178 Q 258 176 266 182" stroke="rgba(255,255,255,0.55)" stroke-width="1.1" fill="none" stroke-linecap="round"/>
<ellipse cx="200" cy="250" rx="178" ry="50" fill="none" stroke="#22d3ee" stroke-width="1" opacity="0.3"/>
</svg>`;

writeFileSync("/tmp/mascot.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("/tmp/mascot.png");
console.log("wrote /tmp/mascot.png");
