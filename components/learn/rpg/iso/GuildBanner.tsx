"use client";

/** GuildBanner — a hanging fantasy banner with a crest. */

export function GuildBanner({ color = "#fb7185", crest = "★", height = 64 }: { color?: string; crest?: string; height?: number }) {
  const w = height * 0.5;
  return (
    <svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ display: "block", overflow: "visible" }}>
      {/* pole bar */}
      <rect x={2} y={0} width={w - 4} height={4} rx={2} fill="#4a3a24" />
      {/* cloth */}
      <path d={`M3 3 L${w - 3} 3 L${w - 3} ${height - 10} L${w / 2} ${height} L3 ${height - 10} Z`} fill={color} stroke="#0c1018" strokeWidth={1} />
      <path d={`M3 3 L${w / 2} 3 L${w / 2} ${height - 5} L3 ${height - 10} Z`} fill="#fff" opacity={0.12} />
      <text x={w / 2} y={height * 0.5} fontSize={height * 0.34} textAnchor="middle" fill="#fff" fontFamily="Inter,sans-serif" fontWeight="700">
        {crest}
      </text>
    </svg>
  );
}
