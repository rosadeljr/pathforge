"use client";

/**
 * IsoBuilding — an original isometric building (two visible walls + hip roof),
 * with door, lit windows, an emblem, a hanging sign, optional banner, hover
 * glow, and locked/open/done states. Clickable (routes via parent onClick).
 */

import type { ReactNode } from "react";
import { GuildBanner } from "./GuildBanner";

export type BuildingStatus = "open" | "locked" | "done";

export function IsoBuilding({
  label,
  emoji,
  accent,
  bw = 58,
  height = 64,
  status = "open",
  onClick,
  banner,
}: {
  label: string;
  emoji: ReactNode;
  accent: string;
  bw?: number;
  height?: number;
  status?: BuildingStatus;
  onClick?: () => void;
  banner?: { color: string; crest?: string };
}) {
  const bh = bw / 2;
  const roofH = bh + 12;
  const pad = 16;
  const svgW = 2 * bw + 2 * pad;
  const svgH = height + bh + roofH + pad + 10;
  const cx = svgW / 2;
  const cy = svgH - bh - 8;

  const P = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const L = P(cx - bw, cy), R = P(cx + bw, cy), B = P(cx, cy + bh);
  const Lt = P(cx - bw, cy - height), Rt = P(cx + bw, cy - height), Bt = P(cx, cy + bh - height), Tt = P(cx, cy - bh - height);
  const apex = P(cx, cy - bh - height - roofH);
  const locked = status === "locked";

  return (
    <button
      onClick={onClick}
      disabled={locked}
      aria-label={`${label}${locked ? " (locked)" : status === "done" ? " (completed)" : ""}`}
      className={`group relative block outline-none ${locked ? "cursor-not-allowed" : ""}`}
      style={{ width: svgW, filter: locked ? "grayscale(0.7)" : undefined, opacity: locked ? 0.7 : 1 }}
    >
      {banner && (
        <div className="absolute -top-1 right-2 z-10 transition-transform group-hover:-translate-y-0.5">
          <GuildBanner color={banner.color} crest={banner.crest} height={46} />
        </div>
      )}

      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="transition-[filter] duration-150"
        style={{ filter: locked ? "none" : `drop-shadow(0 6px 10px rgba(0,0,0,0.45))` }}
      >
        {/* ground shadow */}
        <ellipse cx={cx} cy={cy + bh + 2} rx={bw + 4} ry={12} fill="#000" opacity={0.28} />
        {/* hover glow ring */}
        <ellipse cx={cx} cy={cy + bh} rx={bw + 6} ry={14} fill="none" stroke={accent} strokeWidth={2} className="opacity-0 transition-opacity group-hover:opacity-80 group-focus-visible:opacity-80" />

        {/* roof back faces */}
        <polygon points={`${Lt} ${Tt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Lt} ${Tt} ${apex}`} fill="#000" opacity={0.22} />
        <polygon points={`${Tt} ${Rt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Tt} ${Rt} ${apex}`} fill="#000" opacity={0.14} />

        {/* walls */}
        <polygon points={`${L} ${B} ${Bt} ${Lt}`} fill="#222c3e" stroke="#0c1018" strokeWidth={1.2} />
        <polygon points={`${B} ${R} ${Rt} ${Bt}`} fill="#2f3b54" stroke="#0c1018" strokeWidth={1.2} />
        {/* neon trim along eaves */}
        <polyline points={`${Lt} ${Bt} ${Rt}`} fill="none" stroke={accent} strokeWidth={1.4} opacity={0.6} />

        {/* roof front faces */}
        <polygon points={`${Lt} ${Bt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Bt} ${Rt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Bt} ${Rt} ${apex}`} fill="#fff" opacity={0.1} />

        {/* lit windows on left wall */}
        <rect x={cx - bw * 0.62} y={cy - height * 0.62} width={10} height={10} rx={1.5} fill="#a5f3fc" opacity={0.85} transform={`skewY(26)`} />
        {/* door on right wall */}
        <g transform={`skewY(-26)`}>
          <rect x={cx + bw * 0.22} y={cy + bh * 0.2 - height * 0.18} width={16} height={26} rx={4} fill="#0a1322" stroke={accent} strokeWidth={1} />
          <rect x={cx + bw * 0.22} y={cy + bh * 0.2 - height * 0.18} width={16} height={3} rx={1.5} fill={accent} opacity={0.8} />
        </g>
      </svg>

      {/* emblem */}
      <div
        className="pointer-events-none absolute grid place-items-center rounded-full text-lg"
        style={{ left: cx - 16, top: cy - height - 2, width: 32, height: 32, background: "rgba(8,15,25,0.7)", border: `1px solid ${accent}`, boxShadow: `0 0 10px ${accent}66` }}
      >
        {emoji}
      </div>

      {/* hanging sign */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -2 }}>
        <div
          className="whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold text-amber-50 transition group-hover:scale-105"
          style={{ background: status === "done" ? "#15803d" : "linear-gradient(180deg,#7c5a36,#5a4026)", border: `1px solid ${accent}`, boxShadow: "0 2px 0 rgba(0,0,0,0.35)" }}
        >
          {status === "done" && "✓ "}
          {status === "locked" && "🔒 "}
          {label}
        </div>
      </div>
    </button>
  );
}
