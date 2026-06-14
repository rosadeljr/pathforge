"use client";

/**
 * /learn/avatar — Avatar Creator. Kids customize their hero (skin, hair, outfit
 * color, headgear, gear, title) with a live preview, then save. The choices are
 * worn by the hero in Forgeheart City. Original CSS/SVG art, kid-safe.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { heroSvg, type AvatarLook } from "@/components/learn/rpg/forgeheartArt";
import { loadAvatar, hydrateAvatar, saveAvatar, type SavedAvatar } from "@/components/learn/rpg/useAvatar";

const SKINS = ["#f7d6b3", "#f2c79b", "#e8b88f", "#d39b75", "#a9744f", "#7c4f33"];
const HAIRS = ["#3b2a1a", "#5b3a21", "#1f2937", "#8a5a12", "#b04a3a", "#6b21a8", "#0ea5e9", "#e879f9"];
const OUTFITS = ["#7c5cff", "#10b981", "#38bdf8", "#f59e0b", "#fb7185", "#22c55e", "#06b6d4", "#f472b6"];
const HATS: { id: string; label: string }[] = [
  { id: "none", label: "None" }, { id: "circlet", label: "Circlet" }, { id: "cap", label: "Cap" }, { id: "hood", label: "Hood" }, { id: "glasses", label: "Glasses" },
];
const GEAR: { id: string; label: string }[] = [
  { id: "none", label: "None" }, { id: "book", label: "Book" }, { id: "scroll", label: "Scroll" }, { id: "compass", label: "Compass" }, { id: "satchel", label: "Satchel" }, { id: "notebook", label: "Notebook" }, { id: "tools", label: "Tools" },
];
const ACCS: { id: "none" | "shield" | "goggles"; label: string }[] = [
  { id: "none", label: "None" }, { id: "shield", label: "Shield" }, { id: "goggles", label: "Goggles" },
];
const TITLES = ["New Explorer", "Junior Coder", "Future Doctor", "Mini Architect", "Creative Explorer", "Science Scout", "Kindness Hero", "Problem Solver"];

export default function AvatarCreatorPage() {
  const [look, setLook] = useState<SavedAvatar>({ accent: "#7c5cff", skin: SKINS[0], hair: HAIRS[0], hat: "circlet", item: "book", acc: "none", title: TITLES[0] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const a = loadAvatar();
    if (Object.keys(a).length) setLook((l) => ({ ...l, ...a }));
    hydrateAvatar().then((s) => { if (s) setLook((l) => ({ ...l, ...s })); });
  }, []);

  const previewSvg = useMemo(() => heroSvg(look as AvatarLook, 200), [look]);

  function set<K extends keyof SavedAvatar>(k: K, v: SavedAvatar[K]) {
    setLook((l) => ({ ...l, [k]: v }));
    setSaved(false);
  }
  function onSave() {
    saveAvatar(look);
    setSaved(true);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-4 lg:pb-10">
      <Link href="/learn" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white">
        <ArrowLeft size={16} /> Back to Forgeheart City
      </Link>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
        {/* preview */}
        <div
          className="flex flex-col items-center gap-3 rounded-2xl p-5"
          style={{ background: "linear-gradient(180deg, rgba(124,92,255,0.14), rgba(8,11,18,0.6))", border: "1px solid rgba(124,92,255,0.35)" }}
        >
          <h1 className="font-display text-xl font-bold text-white sm:text-2xl">Choose your hero look!</h1>
          <div
            className="grid place-items-center rounded-2xl p-3"
            style={{ width: 220, height: 240, background: `radial-gradient(circle at 50% 35%, ${look.accent}33, rgba(8,11,18,0.7))`, border: `1px solid ${look.accent}66` }}
            dangerouslySetInnerHTML={{ __html: previewSvg }}
          />
          <div className="rounded-full px-3 py-1 text-xs font-bold text-slate-900" style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }}>
            {look.title}
          </div>
          <button
            onClick={onSave}
            className="mt-1 w-full rounded-xl py-2.5 text-sm font-bold text-slate-900 transition active:scale-[0.98]"
            style={{ background: saved ? "rgba(52,211,153,0.9)" : "linear-gradient(180deg,#fcd34d,#f59e0b)" }}
          >
            {saved ? "✓ Saved — worn in town!" : "Save hero"}
          </button>
          <p className="text-center text-[11px] text-slate-400">Your hero wears this in Forgeheart City.</p>
        </div>

        {/* options */}
        <div className="space-y-4">
          <Group label="Skin">
            {SKINS.map((c) => <Swatch key={c} color={c} active={look.skin === c} onClick={() => set("skin", c)} />)}
          </Group>
          <Group label="Hair">
            {HAIRS.map((c) => <Swatch key={c} color={c} active={look.hair === c} onClick={() => set("hair", c)} />)}
          </Group>
          <Group label="Outfit color">
            {OUTFITS.map((c) => <Swatch key={c} color={c} active={look.accent === c} onClick={() => set("accent", c)} />)}
          </Group>
          <Group label="Headgear">
            {HATS.map((h) => <Pill key={h.id} label={h.label} active={look.hat === h.id} onClick={() => set("hat", h.id)} accent={look.accent} />)}
          </Group>
          <Group label="Gear">
            {GEAR.map((g) => <Pill key={g.id} label={g.label} active={look.item === g.id} onClick={() => set("item", g.id)} accent={look.accent} />)}
          </Group>
          <Group label="Accessory">
            {ACCS.map((a) => <Pill key={a.id} label={a.label} active={look.acc === a.id} onClick={() => set("acc", a.id)} accent={look.accent} />)}
          </Group>
          <Group label="Title">
            {TITLES.map((t) => <Pill key={t} label={t} active={look.title === t} onClick={() => set("title", t)} accent={look.accent} />)}
          </Group>
        </div>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-300">{label}</h2>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
function Swatch({ color, active, onClick }: { color: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} aria-label={`Choose ${color}`} className="relative h-9 w-9 rounded-full transition active:scale-90" style={{ background: color, border: active ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)", boxShadow: active ? `0 0 10px ${color}` : "none" }}>
      {active && <Check size={14} className="absolute inset-0 m-auto text-white" style={{ filter: "drop-shadow(0 0 1px #000)" }} />}
    </button>
  );
}
function Pill({ label, active, onClick, accent }: { label: string; active: boolean; onClick: () => void; accent?: string }) {
  return (
    <button onClick={onClick} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${active ? "text-slate-900" : "text-slate-300 hover:bg-white/[0.06]"}`} style={active ? { background: accent || "#fcd34d" } : { border: "1px solid rgba(255,255,255,0.12)" }}>
      {label}
    </button>
  );
}
