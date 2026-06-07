"use client";

/** TownSign — a wooden signpost with a label. */

export function TownSign({ text, accent = "#fcd34d" }: { text: string; accent?: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="whitespace-nowrap rounded-md px-2 py-1 text-[10px] font-bold text-amber-50"
        style={{ background: "linear-gradient(180deg,#7c5a36,#5a4026)", border: `1px solid ${accent}`, boxShadow: "0 2px 0 rgba(0,0,0,0.35)" }}
      >
        {text}
      </div>
      <div style={{ width: 4, height: 14, background: "#4a3a24" }} />
    </div>
  );
}
