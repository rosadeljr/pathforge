import sharp from "sharp";
import { writeFileSync } from "node:fs";

/* Constellation eagle — star nodes joined by glowing lines, eagle in flight. */
const f = (n) => n.toFixed(1);

// Nodes: [x, y, size] (size: 0=small star, 1=med, 2=hub)
const N = {
  // head + beak
  H:  [200, 44, 2], HL: [186, 50, 0], HR: [214, 50, 0],
  BK: [200, 70, 1],
  // spine / body
  NK: [200, 92, 1], CH: [200, 134, 2], LB: [200, 176, 1], TB: [200, 196, 1],
  TT: [200, 244, 1], TL: [182, 224, 0], TR: [218, 224, 0],
  // right wing
  RS: [234, 104, 2], R1: [278, 80, 1], R2: [324, 72, 1], R3: [366, 86, 1],
  RT: [392, 118, 2], R4: [350, 128, 1], R5: [300, 132, 1], R6: [256, 126, 1],
  // left wing (mirror)
  LS: [166, 104, 2], L1: [122, 80, 1], L2: [76, 72, 1], L3: [34, 86, 1],
  LT: [8, 118, 2], L4: [50, 128, 1], L5: [100, 132, 1], L6: [144, 126, 1],
};

// Edges (constellation lines)
const E = [
  // head
  ["H","HL"],["H","HR"],["HL","HR"],["HL","NK"],["HR","NK"],["H","BK"],["BK","NK"],
  // spine
  ["NK","CH"],["CH","LB"],["LB","TB"],["TB","TT"],
  // tail fan
  ["TB","TL"],["TB","TR"],["TL","TT"],["TR","TT"],["TL","TR"],
  // right wing outline
  ["RS","R1"],["R1","R2"],["R2","R3"],["R3","RT"],["RT","R4"],["R4","R5"],["R5","R6"],["R6","RS"],
  // right wing connect + struts
  ["RS","NK"],["R6","CH"],["R5","CH"],["R1","R6"],["R2","R5"],["R3","R4"],["NK","RS"],
  // left wing outline
  ["LS","L1"],["L1","L2"],["L2","L3"],["L3","LT"],["LT","L4"],["L4","L5"],["L5","L6"],["L6","LS"],
  // left wing connect + struts
  ["LS","NK"],["L6","CH"],["L5","CH"],["L1","L6"],["L2","L5"],["L3","L4"],
];

const goldNodes = new Set(["H","RT","LT","BK"]);

const lines = E.map(([a,b]) => {
  const [x1,y1] = N[a], [x2,y2] = N[b];
  return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}" stroke="rgba(103,232,249,0.55)" stroke-width="1" />`;
}).join("\n");

const dots = Object.entries(N).map(([k,[x,y,s]]) => {
  const gold = goldNodes.has(k);
  const r = s === 2 ? 3.6 : s === 1 ? 2.4 : 1.5;
  const fill = gold ? "#ffe9a8" : "#dffaff";
  const glow = gold ? "#fbbf24" : "#22d3ee";
  return `<circle cx="${f(x)}" cy="${f(y)}" r="${r}" fill="${fill}" filter="url(#g)"/>`;
}).join("\n");

// scattered background stars (deterministic)
let bg = "";
for (let i=0;i<40;i++){
  const x = ((i*97)%400);
  const y = ((i*53)%270)+6;
  const r = 0.5 + ((i*29)%10)/12;
  bg += `<circle cx="${x}" cy="${y}" r="${r.toFixed(2)}" fill="#9fb4d8" opacity="${(0.15+((i*13)%30)/100).toFixed(2)}"/>`;
}

const svg = `<svg viewBox="0 0 400 280" width="800" height="560" xmlns="http://www.w3.org/2000/svg">
<defs>
  <filter id="g" x="-300%" y="-300%" width="700%" height="700%">
    <feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
  <radialGradient id="neb" cx="50%" cy="45%" r="55%">
    <stop offset="0%" stop-color="rgba(34,211,238,0.16)"/><stop offset="55%" stop-color="rgba(167,139,250,0.08)"/><stop offset="100%" stop-color="transparent"/>
  </radialGradient>
</defs>
<rect width="400" height="280" fill="#0a0f1a"/>
<ellipse cx="200" cy="125" rx="210" ry="120" fill="url(#neb)"/>
${bg}
<g style="filter:drop-shadow(0 0 6px rgba(34,211,238,0.5))">${lines}</g>
${dots}
</svg>`;

writeFileSync("/tmp/constellation.svg", svg);
await sharp(Buffer.from(svg)).png().toFile("/tmp/constellation.png");
console.log("wrote /tmp/constellation.png");
