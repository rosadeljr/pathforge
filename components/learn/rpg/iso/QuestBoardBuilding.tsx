"use client";

/** QuestBoardBuilding — the town quest board: a pinned-notice bulletin board. */

export function QuestBoardBuilding({ onClick, count }: { onClick?: () => void; count?: number }) {
  const accent = "#f59e0b";
  return (
    <button onClick={onClick} aria-label="Quest Board" className="group relative block outline-none" style={{ width: 150 }}>
      <svg width="150" height="132" viewBox="0 0 150 132" style={{ overflow: "visible", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.45))" }}>
        <ellipse cx="75" cy="124" rx="58" ry="11" fill="#000" opacity="0.28" />
        <ellipse cx="75" cy="120" rx="62" ry="13" fill="none" stroke={accent} strokeWidth="2" className="opacity-0 transition-opacity group-hover:opacity-80" />
        {/* posts */}
        <rect x="24" y="56" width="9" height="64" rx="3" fill="#5a4026" stroke="#0c1018" strokeWidth="1" />
        <rect x="117" y="56" width="9" height="64" rx="3" fill="#5a4026" stroke="#0c1018" strokeWidth="1" />
        {/* board */}
        <rect x="16" y="20" width="118" height="62" rx="6" fill="#7c5a36" stroke="#0c1018" strokeWidth="1.5" />
        <rect x="20" y="24" width="110" height="54" rx="4" fill="#6b4a2b" />
        {/* roof */}
        <path d="M10 22 L75 4 L140 22 Z" fill={accent} stroke="#0c1018" strokeWidth="1.5" />
        <path d="M10 22 L75 4 L75 13 Z" fill="#000" opacity="0.12" />
        {/* pinned notices */}
        <g stroke="#0c1018" strokeWidth="0.6">
          <rect x="28" y="32" width="26" height="32" rx="2" fill="#f5e8c8" transform="rotate(-5 41 48)" />
          <rect x="62" y="30" width="26" height="34" rx="2" fill="#fff7e6" transform="rotate(3 75 47)" />
          <rect x="96" y="33" width="26" height="31" rx="2" fill="#f5e8c8" transform="rotate(-3 109 48)" />
        </g>
        {/* wax seals (quest type) */}
        <circle cx="41" cy="60" r="4" fill="#ef4444" /><circle cx="75" cy="60" r="4" fill="#38bdf8" /><circle cx="109" cy="60" r="4" fill="#a78bfa" />
        {/* lines on notices */}
        <g stroke="#caa86a" strokeWidth="1">
          <line x1="32" y1="38" x2="50" y2="37" /><line x1="32" y1="43" x2="48" y2="42" />
          <line x1="66" y1="37" x2="84" y2="38" /><line x1="66" y1="42" x2="82" y2="43" />
          <line x1="100" y1="39" x2="118" y2="38" /><line x1="100" y1="44" x2="116" y2="43" />
        </g>
      </svg>
      {typeof count === "number" && (
        <div className="absolute right-3 top-1 grid h-6 min-w-6 place-items-center rounded-full px-1 text-[11px] font-black text-slate-900" style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }}>
          {count}
        </div>
      )}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: -4 }}>
        <div className="whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold text-amber-50 transition group-hover:scale-105" style={{ background: "linear-gradient(180deg,#7c5a36,#5a4026)", border: `1px solid ${accent}`, boxShadow: "0 2px 0 rgba(0,0,0,0.35)" }}>
          Quest Board
        </div>
      </div>
    </button>
  );
}
