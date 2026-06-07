"use client";

/**
 * TownAvatar — original PathForge chibi avatar (big head, small body), friendly
 * student/adventurer look. Class-themed via accent + a school/career item
 * (no combat weapons). Fully tintable for the dress-up milestone.
 */

export type AvatarItem = "none" | "book" | "scroll" | "compass" | "tools" | "satchel" | "notebook";
export type AvatarHat = "none" | "circlet" | "cap" | "hood" | "wizard" | "glasses";

export interface AvatarLook {
  accent?: string;
  trim?: string;
  hair?: string;
  skin?: string;
  item?: AvatarItem;
  hat?: AvatarHat;
}

const O = "#0c1018";

function itemSvg(item: AvatarItem) {
  switch (item) {
    case "book": return `<g transform="translate(42,42)"><rect x="-6" y="-5" width="12" height="10" rx="1.5" fill="#3b82f6" stroke="${O}" stroke-width="0.8"/><rect x="-4" y="-3" width="8" height="1.3" fill="#fff"/><rect x="-4" y="0" width="8" height="1.3" fill="#fff"/></g>`;
    case "scroll": return `<g transform="translate(42,42)"><rect x="-5" y="-6" width="10" height="12" rx="2" fill="#f5e8c8" stroke="${O}" stroke-width="0.8"/><rect x="-5" y="-6" width="10" height="2" fill="#caa86a"/><rect x="-5" y="4" width="10" height="2" fill="#caa86a"/></g>`;
    case "compass": return `<g transform="translate(42,42)"><circle r="6" fill="#d4af37" stroke="${O}" stroke-width="0.8"/><circle r="3.5" fill="#0e1626"/><path d="M0 -3 L1.5 0 L0 3 L-1.5 0 Z" fill="#ef4444"/></g>`;
    case "tools": return `<g transform="translate(42,42)"><rect x="-2" y="-7" width="4" height="14" rx="2" fill="#94a3b8" stroke="${O}" stroke-width="0.7"/><path d="M-4 -7 a4 4 0 1 1 8 0 l-2 0 a2 2 0 1 0 -4 0 z" fill="#cbd5e1"/></g>`;
    case "satchel": return `<g transform="translate(42,43)"><path d="M-7 -3 L7 -3 L5 7 L-5 7 Z" fill="#16a34a" stroke="${O}" stroke-width="0.8"/><path d="M-4 -3 Q-4 -8 0 -8 Q4 -8 4 -3" fill="none" stroke="${O}" stroke-width="1.4"/><rect x="-2" y="-3" width="4" height="4" fill="#fde68a"/></g>`;
    case "notebook": return `<g transform="translate(42,42)"><rect x="-6" y="-6" width="12" height="12" rx="1.5" fill="#f472b6" stroke="${O}" stroke-width="0.8"/><rect x="-6" y="-6" width="2" height="12" fill="#be185d"/><rect x="-1" y="-7" width="3" height="3" fill="#fbbf24"/></g>`;
    default: return "";
  }
}

function hatSvg(hat: AvatarHat, accent: string, trim: string) {
  switch (hat) {
    case "circlet": return `<path d="M14 19 Q28 13 42 19" fill="none" stroke="#fcd34d" stroke-width="3" stroke-linecap="round"/><circle cx="28" cy="15.5" r="3" fill="#a5f3fc" stroke="${O}" stroke-width="0.6"/>`;
    case "cap": return `<path d="M12 21 Q28 2 44 21 Q40 13 28 13 Q16 13 12 21 Z" fill="${accent}" stroke="${O}" stroke-width="0.9"/><rect x="10" y="19" width="36" height="4" rx="2" fill="${trim}"/><circle cx="28" cy="5" r="2.6" fill="${trim}"/>`;
    case "hood": return `<path d="M10 28 Q8 4 28 4 Q48 4 46 28 Q40 14 28 14 Q16 14 10 28 Z" fill="${accent}" stroke="${O}" stroke-width="1"/>`;
    case "wizard": return `<path d="M28 -10 L44 22 L12 22 Z" fill="${accent}" stroke="${O}" stroke-width="1"/><rect x="10" y="19" width="36" height="5" rx="2.5" fill="${trim}"/><circle cx="28" cy="-9" r="2.4" fill="#a5f3fc"/>`;
    case "glasses": return `<g stroke="${O}" stroke-width="1.4" fill="none"><circle cx="21" cy="25" r="4.5" fill="rgba(165,243,252,0.4)"/><circle cx="35" cy="25" r="4.5" fill="rgba(165,243,252,0.4)"/><path d="M25.5 25 h5"/></g>`;
    default: return "";
  }
}

export function TownAvatar({
  accent = "#38bdf8",
  trim = "#fcd34d",
  hair = "#3b2a1a",
  skin = "#f6d3b0",
  item = "none",
  hat = "none",
  width = 54,
  flip = false,
}: AvatarLook & { width?: number; flip?: boolean }) {
  const h = (width * 64) / 56;
  return (
    <svg width={width} height={h} viewBox="0 0 56 64" style={{ display: "block", overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }}>
      {/* shadow */}
      <ellipse cx="28" cy="61" rx="15" ry="4" fill="#000" opacity="0.28" />
      {/* legs + shoes */}
      <rect x="23" y="50" width="4.5" height="9" rx="2" fill="#2a3344" stroke={O} strokeWidth="0.6" />
      <rect x="28.5" y="50" width="4.5" height="9" rx="2" fill="#2a3344" stroke={O} strokeWidth="0.6" />
      <ellipse cx="25" cy="59.5" rx="3.4" ry="2" fill="#0f172a" />
      <ellipse cx="31" cy="59.5" rx="3.4" ry="2" fill="#0f172a" />
      {/* body */}
      <path d="M18 40 Q28 35 38 40 L36 53 Q28 56 20 53 Z" fill={accent} stroke={O} strokeWidth="1" />
      <rect x="19.5" y="49" width="17" height="3" rx="1.5" fill="#3a2a18" />
      <path d="M24 39 L28 44 L32 39" fill="none" stroke={trim} strokeWidth="1.6" strokeLinecap="round" />
      {/* arms + hands */}
      <path d="M17 40 q-3 5 -1 10 l3 -1 q-1 -5 1 -8 z" fill={accent} stroke={O} strokeWidth="0.8" />
      <path d="M39 40 q3 5 1 10 l-3 -1 q1 -5 -1 -8 z" fill={accent} stroke={O} strokeWidth="0.8" />
      <circle cx="17.5" cy="50" r="2.6" fill={skin} stroke={O} strokeWidth="0.5" />
      <circle cx="40" cy="46" r="2.6" fill={skin} stroke={O} strokeWidth="0.5" />
      {/* item held */}
      <g dangerouslySetInnerHTML={{ __html: itemSvg(item) }} />
      {/* big head */}
      <circle cx="28" cy="24" r="16" fill={skin} stroke={O} strokeWidth="1.1" />
      <circle cx="13.5" cy="25" r="2.4" fill={skin} stroke={O} strokeWidth="0.6" />
      <circle cx="42.5" cy="25" r="2.4" fill={skin} stroke={O} strokeWidth="0.6" />
      {/* hair */}
      <path d="M12 24 Q11 7 28 6 Q45 7 44 24 Q41 15 33 14 Q28 10 23 14 Q15 15 12 24 Z" fill={hair} stroke={O} strokeWidth="0.8" />
      {/* hat */}
      <g dangerouslySetInnerHTML={{ __html: hatSvg(hat, accent, trim) }} />
      {/* face (chibi) */}
      {hat !== "glasses" && (
        <>
          <ellipse cx="22" cy="26" rx="3" ry="3.6" fill="#fff" />
          <ellipse cx="34" cy="26" rx="3" ry="3.6" fill="#fff" />
          <circle cx="22.5" cy="27" r="1.9" fill="#1f2937" />
          <circle cx="34.5" cy="27" r="1.9" fill="#1f2937" />
          <circle cx="21.7" cy="26" r="0.7" fill="#fff" />
          <circle cx="33.7" cy="26" r="0.7" fill="#fff" />
        </>
      )}
      {hat === "glasses" && (
        <>
          <circle cx="22.5" cy="26.5" r="1.5" fill="#1f2937" />
          <circle cx="34.5" cy="26.5" r="1.5" fill="#1f2937" />
        </>
      )}
      <circle cx="19" cy="30" r="2" fill="#fb7185" opacity="0.35" />
      <circle cx="37" cy="30" r="2" fill="#fb7185" opacity="0.35" />
      <path d="M24 31 Q28 34 32 31" fill="none" stroke="#9a5b3b" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
