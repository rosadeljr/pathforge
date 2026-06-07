"use client";

/**
 * IsoBuilding — an original isometric building (two visible walls + hip roof)
 * with a stone foundation, lit windows, door, emblem, hanging sign, optional
 * banner, hover glow, and locked/open/done states. `variant` adds distinctive
 * architecture per landmark (hall / guild / tower / gate / office).
 */

import type { ReactNode } from "react";
import { GuildBanner } from "./GuildBanner";

export type BuildingStatus = "open" | "locked" | "done";
export type BuildingVariant = "default" | "hall" | "guild" | "tower" | "gate" | "office";

export function IsoBuilding({
  label,
  emoji,
  accent,
  bw = 58,
  height = 64,
  status = "open",
  variant = "default",
  onClick,
  banner,
}: {
  label: string;
  emoji: ReactNode;
  accent: string;
  bw?: number;
  height?: number;
  status?: BuildingStatus;
  variant?: BuildingVariant;
  onClick?: () => void;
  banner?: { color: string; crest?: string };
}) {
  const bh = bw / 2;
  const roofH = bh + (variant === "tower" ? 26 : 12);
  const spire = variant === "tower" ? 22 : 0;
  const pad = 18;
  const svgW = 2 * bw + 2 * pad;
  const svgH = height + bh + roofH + spire + pad + 12;
  const cx = svgW / 2;
  const cy = svgH - bh - 8;

  const P = (x: number, y: number) => `${x.toFixed(1)},${y.toFixed(1)}`;
  const L = P(cx - bw, cy), R = P(cx + bw, cy), B = P(cx, cy + bh);
  const Lt = P(cx - bw, cy - height), Rt = P(cx + bw, cy - height), Bt = P(cx, cy + bh - height), Tt = P(cx, cy - bh - height);
  const apex = P(cx, cy - bh - height - roofH);
  const locked = status === "locked";

  // warm-neutral stone walls (lighter than the old cool slate)
  const wallL = "#3c4150";
  const wallR = "#4b5163";

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
          <GuildBanner color={banner.color} crest={banner.crest} height={48} />
        </div>
      )}

      <svg
        width={svgW}
        height={svgH}
        viewBox={`0 0 ${svgW} ${svgH}`}
        className="transition-[filter] duration-150"
        style={{ filter: locked ? "none" : "drop-shadow(0 7px 11px rgba(0,0,0,0.5))" }}
      >
        {/* ground shadow */}
        <ellipse cx={cx} cy={cy + bh + 3} rx={bw + 6} ry={13} fill="#000" opacity={0.3} />
        {/* hover glow ring */}
        <ellipse cx={cx} cy={cy + bh} rx={bw + 7} ry={15} fill="none" stroke={accent} strokeWidth={2.5} className="opacity-0 transition-opacity group-hover:opacity-90 group-focus-visible:opacity-90" />

        {/* stone foundation plinth */}
        <polygon points={`${P(cx - bw - 4, cy + 2)} ${P(cx, cy + bh + 5)} ${P(cx + bw + 4, cy + 2)} ${P(cx, cy - bh - 1)}`} fill="#2a2f3b" />

        {/* gate variant: side turrets behind */}
        {variant === "gate" && (
          <g>
            <rect x={cx - bw - 4} y={cy - height - 18} width={16} height={height + 18} rx={3} fill="#3c4150" stroke="#0c1018" strokeWidth={1} />
            <rect x={cx + bw - 12} y={cy - height - 18} width={16} height={height + 18} rx={3} fill="#4b5163" stroke="#0c1018" strokeWidth={1} />
            <polygon points={`${cx - bw - 6},${cy - height - 18} ${cx - bw + 4},${cy - height - 32} ${cx - bw + 14},${cy - height - 18}`} fill={accent} />
            <polygon points={`${cx + bw - 14},${cy - height - 18} ${cx + bw - 4},${cy - height - 32} ${cx + bw + 6},${cy - height - 18}`} fill={accent} />
          </g>
        )}

        {/* roof back faces */}
        <polygon points={`${Lt} ${Tt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Lt} ${Tt} ${apex}`} fill="#000" opacity={0.24} />
        <polygon points={`${Tt} ${Rt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Tt} ${Rt} ${apex}`} fill="#000" opacity={0.14} />

        {/* walls */}
        <polygon points={`${L} ${B} ${Bt} ${Lt}`} fill={wallL} stroke="#0c1018" strokeWidth={1.2} />
        <polygon points={`${B} ${R} ${Rt} ${Bt}`} fill={wallR} stroke="#0c1018" strokeWidth={1.2} />
        {/* warm pilaster lines */}
        <line x1={cx - bw * 0.5} y1={cy + bh * 0.5} x2={cx - bw * 0.5} y2={cy + bh * 0.5 - height} stroke="#000" opacity={0.15} strokeWidth={1} />
        <line x1={cx + bw * 0.5} y1={cy + bh * 0.5} x2={cx + bw * 0.5} y2={cy + bh * 0.5 - height} stroke="#000" opacity={0.15} strokeWidth={1} />
        {/* neon eave trim */}
        <polyline points={`${Lt} ${Bt} ${Rt}`} fill="none" stroke={accent} strokeWidth={1.6} opacity={0.65} />

        {/* roof front faces + ridge highlight */}
        <polygon points={`${Lt} ${Bt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Bt} ${Rt} ${apex}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
        <polygon points={`${Bt} ${Rt} ${apex}`} fill="#fff" opacity={0.12} />
        <line x1={cx} y1={cy + bh - height} x2={cx} y2={cy - bh - height - roofH} stroke="#fff" opacity={0.22} strokeWidth={1.4} />

        {/* tower spire + orb */}
        {variant === "tower" && (
          <g>
            <polygon points={`${cx - 7},${cy - bh - height - roofH} ${cx + 7},${cy - bh - height - roofH} ${cx},${cy - bh - height - roofH - spire}`} fill={accent} stroke="#0c1018" strokeWidth={1} />
            <circle cx={cx} cy={cy - bh - height - roofH - spire - 5} r={5} fill="#fff" style={{ filter: `drop-shadow(0 0 6px ${accent})` }} />
          </g>
        )}

        {/* lit windows */}
        <rect x={cx - bw * 0.62} y={cy - height * 0.62} width={11} height={11} rx={1.5} fill="#ffe39a" opacity={0.9} transform="skewY(26)" />
        <rect x={cx - bw * 0.62} y={cy - height * 0.30} width={11} height={11} rx={1.5} fill="#ffe39a" opacity={0.7} transform="skewY(26)" />
        {/* guild columns on right wall */}
        {variant === "guild" ? (
          <g transform="skewY(-26)">
            {[0.28, 0.5, 0.72].map((t, i) => (
              <rect key={i} x={cx + bw * t} y={cy + bh * t - height + 6} width={6} height={height - 14} rx={3} fill="#cdd3df" opacity={0.85} />
            ))}
          </g>
        ) : (
          <>
            <rect x={cx + bw * 0.42} y={cy + bh * 0.2 - height * 0.55} width={11} height={11} rx={1.5} fill="#ffe39a" opacity={0.85} transform="skewY(-26)" />
            <rect x={cx + bw * 0.18} y={cy + bh * 0.1 - height * 0.5} width={11} height={11} rx={1.5} fill="#ffe39a" opacity={0.7} transform="skewY(-26)" />
          </>
        )}

        {/* hall arched windows */}
        {variant === "hall" && (
          <g transform="skewY(-26)" fill="#a5d8ff" opacity={0.85} stroke="#0c1018" strokeWidth={0.6}>
            <path d={`M ${cx + bw * 0.3} ${cy + bh * 0.15 - height * 0.2} h8 v14 h-8 z`} />
            <path d={`M ${cx + bw * 0.3} ${cy + bh * 0.15 - height * 0.2} q4 -7 8 0`} fill="#a5d8ff" />
          </g>
        )}

        {/* door */}
        <g transform="skewY(-26)">
          <path
            d={`M ${cx + bw * 0.22} ${cy + bh * 0.22} h16 v -16 q -8 -9 -16 0 z`}
            fill="#0a1322"
            stroke={accent}
            strokeWidth={1}
          />
          <rect x={cx + bw * 0.22} y={cy + bh * 0.22 - 3} width={16} height={3} fill={accent} opacity={0.8} />
        </g>

        {/* office chimney + smoke */}
        {variant === "office" && (
          <g>
            <rect x={cx + bw * 0.4} y={cy - bh - height - 6} width={8} height={16} rx={1.5} fill="#5a4026" stroke="#0c1018" strokeWidth={0.8} />
            <circle cx={cx + bw * 0.4 + 4} cy={cy - bh - height - 12} r={3} fill="#cbd5e1" opacity={0.4} />
            <circle cx={cx + bw * 0.4 + 7} cy={cy - bh - height - 18} r={4} fill="#cbd5e1" opacity={0.25} />
          </g>
        )}
      </svg>

      {/* emblem */}
      <div
        className="pointer-events-none absolute grid place-items-center rounded-full text-lg"
        style={{ left: cx - 17, top: cy - height - (variant === "tower" ? roofH : 4), width: 34, height: 34, background: "rgba(8,15,25,0.72)", border: `1.5px solid ${accent}`, boxShadow: `0 0 12px ${accent}77` }}
      >
        {emoji}
      </div>

      {/* hanging sign */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -2 }}>
        <div
          className="whitespace-nowrap rounded-md px-2.5 py-1 text-[11px] font-bold text-amber-50 transition group-hover:scale-105"
          style={{ background: status === "done" ? "#15803d" : "linear-gradient(180deg,#8a6a40,#5a4026)", border: `1px solid ${accent}`, boxShadow: "0 2px 0 rgba(0,0,0,0.4)" }}
        >
          {status === "done" && "✓ "}
          {status === "locked" && "🔒 "}
          {label}
        </div>
      </div>
    </button>
  );
}
