"use client";

/**
 * HeroSprite — the player's top-down avatar, drawn in SVG and tinted by the
 * chosen class accent. A foundation for the dress-up/wardrobe milestone: the
 * outfit/hair/accessory layers can be swapped later. Feet sit at the bottom
 * (the parent anchors translate(-50%,-100%) so the sprite stands on its point).
 */

export function HeroSprite({ accent = "#38bdf8", name }: { accent?: string; name?: string }) {
  return (
    <div className="relative flex flex-col items-center">
      {/* name tag */}
      {name && (
        <div
          className="mb-0.5 max-w-[90px] truncate rounded px-1.5 py-0.5 text-[9px] font-bold text-white"
          style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${accent}88` }}
        >
          {name}
        </div>
      )}
      <svg width="44" height="64" viewBox="0 0 44 64" style={{ display: "block", overflow: "visible" }}>
        {/* energy ground ring + aura */}
        <ellipse cx="22" cy="60" rx="16" ry="5.5" fill={accent} opacity="0.22" />
        <ellipse cx="22" cy="60" rx="16" ry="5.5" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
        <ellipse cx="22" cy="34" rx="17" ry="22" fill={accent} opacity="0.10" />
        {/* ground shadow */}
        <ellipse cx="22" cy="59" rx="12" ry="3.5" fill="#000" opacity="0.28" />

        {/* cape/back accent */}
        <path d="M13 26 Q22 30 31 26 L29 46 Q22 50 15 46 Z" fill={accent} opacity="0.35" />

        {/* legs */}
        <rect x="16" y="42" width="5" height="13" rx="2.5" fill="#1f2937" />
        <rect x="23" y="42" width="5" height="13" rx="2.5" fill="#1f2937" />
        {/* boots */}
        <rect x="15.5" y="52" width="6" height="5" rx="2" fill="#0f172a" />
        <rect x="22.5" y="52" width="6" height="5" rx="2" fill="#0f172a" />

        {/* body / tunic */}
        <path d="M13 28 Q22 24 31 28 L30 44 Q22 47 14 44 Z" fill={accent} stroke="#0c1018" strokeWidth="1" />
        {/* belt */}
        <rect x="14" y="41" width="16" height="3" rx="1.5" fill="#0c1018" opacity="0.5" />
        {/* chest emblem */}
        <circle cx="22" cy="34" r="2.6" fill="#fff" opacity="0.85" />

        {/* arms */}
        <rect x="9" y="29" width="5" height="12" rx="2.5" fill={accent} stroke="#0c1018" strokeWidth="0.8" />
        <rect x="30" y="29" width="5" height="12" rx="2.5" fill={accent} stroke="#0c1018" strokeWidth="0.8" />
        {/* hands */}
        <circle cx="11.5" cy="42" r="2.6" fill="#f1c9a5" />
        <circle cx="32.5" cy="42" r="2.6" fill="#f1c9a5" />

        {/* head */}
        <circle cx="22" cy="17" r="11" fill="#f6d3b0" stroke="#0c1018" strokeWidth="1" />
        {/* hair */}
        <path d="M11 16 Q12 5 22 5 Q32 5 33 16 Q30 11 22 11 Q14 11 11 16 Z" fill="#3b2a1a" />
        {/* eyes */}
        <circle cx="18" cy="18" r="1.6" fill="#1f2937" />
        <circle cx="26" cy="18" r="1.6" fill="#1f2937" />
        {/* smile */}
        <path d="M18.5 22 Q22 25 25.5 22" fill="none" stroke="#9a5b3b" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
