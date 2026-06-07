"use client";

/** SpeechBubble — a floating town speech bubble with a tail. */

export function SpeechBubble({ text, accent = "#38bdf8", icon }: { text: string; accent?: string; icon?: string }) {
  return (
    <div className="relative inline-block">
      <div
        className="whitespace-nowrap rounded-xl px-2.5 py-1 text-[11px] font-semibold text-slate-900 shadow-md"
        style={{ background: "rgba(255,255,255,0.95)", border: `1.5px solid ${accent}` }}
      >
        {icon && <span className="mr-1" style={{ color: accent }}>{icon}</span>}
        {text}
      </div>
      <span
        aria-hidden
        className="absolute left-1/2 top-full -translate-x-1/2"
        style={{ width: 0, height: 0, borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "7px solid rgba(255,255,255,0.95)" }}
      />
    </div>
  );
}
