"use client";

/**
 * CharacterSprite — a robust, RPG-style character used for the hero and for
 * townsfolk NPCs. Original art (not derived from any game's sprites): cape,
 * trimmed tunic, belt, shoulder caps, boots, expressive face. Fully tintable so
 * outfits/hair can be swapped for the dress-up milestone. Feet sit at the
 * bottom of the viewBox.
 */

export interface CharacterLook {
  accent?: string; // tunic
  trim?: string; // collar/belt/cuffs/cape lining
  hair?: string;
  skin?: string;
  cape?: boolean;
}

export function CharacterSprite({
  accent = "#38bdf8",
  trim = "#fcd34d",
  hair = "#3b2a1a",
  skin = "#f6d3b0",
  cape = true,
  width = 58,
}: CharacterLook & { width?: number }) {
  const O = "#0c1018"; // outline
  return (
    <svg width={width} height={(width * 84) / 58} viewBox="0 0 58 84" style={{ display: "block", overflow: "visible" }}>
      {/* shadow */}
      <ellipse cx="29" cy="80" rx="16" ry="4.5" fill="#000" opacity="0.28" />

      {/* cape */}
      {cape && (
        <path d="M18 30 Q29 26 40 30 L44 60 Q29 66 14 60 Z" fill={trim} stroke={O} strokeWidth="1" opacity="0.92" />
      )}

      {/* legs + boots */}
      <rect x="22" y="55" width="6.5" height="16" rx="3" fill="#2a3344" stroke={O} strokeWidth="0.8" />
      <rect x="29.5" y="55" width="6.5" height="16" rx="3" fill="#2a3344" stroke={O} strokeWidth="0.8" />
      <path d="M20.5 68 h9 v4 q0 3 -3 3 h-3 q-3 0 -3 -3 z" fill="#5b3a21" stroke={O} strokeWidth="0.8" />
      <path d="M28.5 68 h9 v4 q0 3 -3 3 h-3 q-3 0 -3 -3 z" fill="#5b3a21" stroke={O} strokeWidth="0.8" />
      <rect x="20.5" y="67" width="9" height="2.4" rx="1" fill={trim} />
      <rect x="28.5" y="67" width="9" height="2.4" rx="1" fill={trim} />

      {/* torso / tunic */}
      <path d="M17 34 Q29 30 41 34 L39 57 Q29 61 19 57 Z" fill={accent} stroke={O} strokeWidth="1.1" />
      {/* tunic center trim */}
      <rect x="28" y="36" width="2" height="20" fill={trim} opacity="0.85" />
      {/* belt + buckle */}
      <rect x="18.5" y="52.5" width="21" height="4.5" rx="1.5" fill="#3a2a18" stroke={O} strokeWidth="0.6" />
      <rect x="26.5" y="52.7" width="5" height="4" rx="1" fill={trim} stroke={O} strokeWidth="0.5" />
      {/* shoulder caps */}
      <path d="M17 34 Q15 30 20 30 Q24 30 24 34 Z" fill={trim} stroke={O} strokeWidth="0.7" />
      <path d="M41 34 Q43 30 38 30 Q34 30 34 34 Z" fill={trim} stroke={O} strokeWidth="0.7" />
      {/* collar V */}
      <path d="M25 33 L29 39 L33 33" fill="none" stroke={trim} strokeWidth="1.6" strokeLinecap="round" />
      {/* tunic highlight */}
      <path d="M21 36 Q24 34 26 35 L25 50 Q23 51 21 50 Z" fill="#fff" opacity="0.10" />

      {/* arms */}
      <path d="M15 35 q-3 6 -1 14 l4 -1 q-1 -7 1 -12 z" fill={accent} stroke={O} strokeWidth="0.9" />
      <path d="M43 35 q3 6 1 14 l-4 -1 q1 -7 -1 -12 z" fill={accent} stroke={O} strokeWidth="0.9" />
      {/* cuffs + hands */}
      <rect x="14" y="47" width="6" height="2.5" rx="1" fill={trim} />
      <rect x="38" y="47" width="6" height="2.5" rx="1" fill={trim} />
      <circle cx="16.5" cy="51" r="2.8" fill={skin} stroke={O} strokeWidth="0.6" />
      <circle cx="41.5" cy="51" r="2.8" fill={skin} stroke={O} strokeWidth="0.6" />

      {/* neck */}
      <rect x="26" y="28" width="6" height="6" rx="2" fill={skin} stroke={O} strokeWidth="0.6" />

      {/* head */}
      <circle cx="29" cy="19" r="12.5" fill={skin} stroke={O} strokeWidth="1.1" />
      {/* ears */}
      <circle cx="16.8" cy="20" r="2.4" fill={skin} stroke={O} strokeWidth="0.6" />
      <circle cx="41.2" cy="20" r="2.4" fill={skin} stroke={O} strokeWidth="0.6" />

      {/* hair */}
      <path d="M16 19 Q15 5 29 4 Q43 5 42 19 Q40 12 33 11 Q29 8 25 11 Q18 12 16 19 Z" fill={hair} stroke={O} strokeWidth="0.8" />
      <path d="M16 19 Q17 13 22 11 L20 18 Z" fill="#fff" opacity="0.08" />
      {/* side fringe */}
      <path d="M40 13 q4 5 1 11 l-3 -1 q2 -5 0 -9 z" fill={hair} />

      {/* face */}
      <ellipse cx="23.5" cy="21.5" rx="2.7" ry="3.1" fill="#fff" />
      <ellipse cx="34.5" cy="21.5" rx="2.7" ry="3.1" fill="#fff" />
      <circle cx="24" cy="22" r="1.5" fill="#1f2937" />
      <circle cx="34" cy="22" r="1.5" fill="#1f2937" />
      <circle cx="23.4" cy="21.3" r="0.6" fill="#fff" />
      <circle cx="33.4" cy="21.3" r="0.6" fill="#fff" />
      {/* brows */}
      <path d="M21 17.5 q2.5 -1.4 5 -0.3" fill="none" stroke={hair} strokeWidth="1" strokeLinecap="round" />
      <path d="M32 17.2 q2.5 -1.1 5 0.3" fill="none" stroke={hair} strokeWidth="1" strokeLinecap="round" />
      {/* cheeks */}
      <circle cx="21" cy="25" r="1.8" fill="#fb7185" opacity="0.35" />
      <circle cx="37" cy="25" r="1.8" fill="#fb7185" opacity="0.35" />
      {/* smile */}
      <path d="M25 26.5 Q29 30 33 26.5" fill="none" stroke="#9a5b3b" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
