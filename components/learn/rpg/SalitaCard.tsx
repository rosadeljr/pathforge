"use client";

/**
 * SalitaCard — "Salita ng Araw" (Word of the Day). A small, proudly-Filipino
 * daily delight on the town hub: a rotating Tagalog word, real bayani, or
 * culture fact (same for every kid each day). Kids tap to reveal the meaning —
 * a tiny anticipation → payoff learning moment — then see it used in a
 * sentence. Distinctly local, captivating, and a reason to come back tomorrow.
 */

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { todaysSalita, type SalitaCategory } from "@/lib/data/salita-ng-araw";
import { Panel } from "./primitives";

const CAT_META: Record<SalitaCategory, { label: string; tagalog: string; accent: string; icon: string }> = {
  salita: { label: "Word", tagalog: "Salita", accent: "#38bdf8", icon: "📖" },
  bayani: { label: "Hero", tagalog: "Bayani", accent: "#fbbf24", icon: "⭐" },
  kultura: { label: "Culture", tagalog: "Kultura", accent: "#fb7185", icon: "🌺" },
};

export function SalitaCard() {
  const entry = useMemo(() => todaysSalita(), []);
  const meta = CAT_META[entry.category];
  const [revealed, setRevealed] = useState(false);

  return (
    <Panel accent={meta.accent} className="overflow-hidden">
      {/* Philippine-sun glow header */}
      <div className="relative px-4 pt-4">
        <span aria-hidden className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full opacity-30 blur-2xl" style={{ background: meta.accent }} />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span aria-hidden className="text-base">🇵🇭</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: meta.accent }}>
              Salita ng Araw
            </span>
          </div>
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{ background: `${meta.accent}1f`, color: meta.accent, border: `1px solid ${meta.accent}55` }}
          >
            {meta.icon} {meta.tagalog}
          </span>
        </div>
      </div>

      <div className="px-4 pb-4 pt-2.5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl text-2xl" style={{ background: `${meta.accent}1a`, border: `1px solid ${meta.accent}44` }}>
            {entry.emoji}
          </span>
          <h3 className="font-display text-lg font-black leading-tight text-white">{entry.word}</h3>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!revealed ? (
            <motion.button
              key="reveal"
              onClick={() => setRevealed(true)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold text-white transition active:scale-[0.98]"
              style={{ background: `${meta.accent}1f`, border: `1px solid ${meta.accent}55` }}
            >
              <Sparkles size={13} style={{ color: meta.accent }} />
              Ano ang ibig sabihin? <span className="text-slate-400">(Tap to reveal)</span>
            </motion.button>
          ) : (
            <motion.div
              key="meaning"
              initial={{ opacity: 0, y: 8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="mt-3 overflow-hidden"
            >
              <p className="text-sm leading-snug text-slate-200">{entry.meaning}</p>
              {entry.example && (
                <p className="mt-2 rounded-lg border-l-2 px-3 py-1.5 text-[12px] italic leading-snug text-slate-300" style={{ borderColor: meta.accent, background: `${meta.accent}10` }}>
                  <span className="font-semibold not-italic" style={{ color: meta.accent }}>Halimbawa: </span>
                  {entry.example}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-3 text-center text-[10px] text-slate-500">🌅 Bagong salita bukas — come back tomorrow!</p>
      </div>
    </Panel>
  );
}
