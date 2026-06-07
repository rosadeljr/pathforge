"use client";

/** RewardShopStall — a cozy market stall for the reward shop. */

export function RewardShopStall({ onClick, accent = "#fbbf24" }: { onClick?: () => void; accent?: string }) {
  return (
    <button onClick={onClick} aria-label="Reward Shop" className="group relative block outline-none" style={{ width: 132 }}>
      <svg width="132" height="120" viewBox="0 0 132 120" style={{ overflow: "visible", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}>
        <ellipse cx="66" cy="112" rx="52" ry="10" fill="#000" opacity="0.28" />
        <ellipse cx="66" cy="108" rx="56" ry="12" fill="none" stroke={accent} strokeWidth="2" className="opacity-0 transition-opacity group-hover:opacity-80" />
        {/* posts */}
        <rect x="16" y="34" width="6" height="74" fill="#6b4a2b" stroke="#0c1018" strokeWidth="0.8" />
        <rect x="110" y="34" width="6" height="74" fill="#6b4a2b" stroke="#0c1018" strokeWidth="0.8" />
        {/* counter */}
        <rect x="12" y="74" width="108" height="30" rx="4" fill="#7c5a36" stroke="#0c1018" strokeWidth="1.2" />
        <rect x="12" y="74" width="108" height="7" fill="#9a7349" />
        {/* goods */}
        <circle cx="34" cy="70" r="7" fill="#ef4444" stroke="#0c1018" strokeWidth="0.6" />
        <circle cx="52" cy="70" r="7" fill="#34d399" stroke="#0c1018" strokeWidth="0.6" />
        <rect x="64" y="62" width="14" height="12" rx="2" fill="#a78bfa" stroke="#0c1018" strokeWidth="0.6" />
        <circle cx="92" cy="70" r="7" fill="#38bdf8" stroke="#0c1018" strokeWidth="0.6" />
        {/* striped awning */}
        <path d="M4 34 L128 34 L116 54 L16 54 Z" fill={accent} stroke="#0c1018" strokeWidth="1.2" />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <path key={i} d={`M${12 + i * 20} 34 L${6 + i * 20} 54 L${18 + i * 20} 54 L${24 + i * 20} 34 Z`} fill="#fff" opacity="0.85" />
        ))}
        <rect x="4" y="32" width="124" height="4" rx="2" fill={accent} />
        {/* hanging coin */}
        <line x1="66" y1="34" x2="66" y2="44" stroke="#0c1018" strokeWidth="1" />
        <circle cx="66" cy="48" r="6" fill="#fcd34d" stroke="#b45309" strokeWidth="1" />
      </svg>
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -4 }}>
        <div className="whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold text-amber-50 transition group-hover:scale-105" style={{ background: "linear-gradient(180deg,#7c5a36,#5a4026)", border: `1px solid ${accent}`, boxShadow: "0 2px 0 rgba(0,0,0,0.35)" }}>
          Reward Shop
        </div>
      </div>
    </button>
  );
}
