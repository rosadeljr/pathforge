"use client";

/**
 * FirstRunWelcome — the new learner's first 30 seconds. A single, polished
 * overlay that greets them by hero, explains Forgeheart in three beats, and
 * sends them straight into a real first lesson. Shown once (localStorage flag)
 * for brand-new learners (no XP, no lessons yet). Tuned for ages 7–15 — game
 * onboarding, not a baby tutorial.
 */

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ScrollText, Compass, Target, ArrowRight, X } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { heroSvg, CLASS_LOOK } from "./forgeheartArt";
import { loadAvatar } from "./useAvatar";
import { QUESTS, questLessonHref } from "@/lib/data/rpg-quests";

const FLAG = "pf_welcomed_v1";

export function hasSeenWelcome(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(FLAG) === "1";
  } catch {
    return true;
  }
}
function markSeen() {
  try {
    window.localStorage.setItem(FLAG, "1");
  } catch {
    /* non-fatal */
  }
}

export function FirstRunWelcome({ ps, onClose }: { ps: PlayerState; onClose: () => void }) {
  const router = useRouter();

  const heroMarkup = useMemo(() => {
    const base = ps.classId ? CLASS_LOOK[ps.classId] : undefined;
    const look = { ...(base || {}), ...loadAvatar(), accent: ps.cls?.accent ?? "#7c5cff" };
    return { __html: heroSvg(look, 116) };
  }, [ps.classId, ps.cls?.accent]);

  // Where "Start my first quest" goes: into a real, grade-appropriate first
  // lesson if we can resolve one, otherwise the quest board.
  const firstQuestHref = useMemo(() => {
    const daily = QUESTS.find((q) => q.questType === "daily" && q.subject);
    return (daily && questLessonHref(daily, ps.grade)) || "/learn/quests";
  }, [ps.grade]);

  function go(href: string) {
    markSeen();
    onClose();
    router.push(href);
  }
  function dismiss() {
    markSeen();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Welcome to Forgeheart City">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={dismiss}
      />
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="relative w-full max-w-lg overflow-hidden rounded-3xl p-6 sm:p-7"
        style={{
          background: "linear-gradient(160deg, rgba(16,22,36,0.98), rgba(9,12,20,0.98))",
          border: "1px solid rgba(124,92,255,0.35)",
          boxShadow: "0 30px 80px -20px rgba(124,92,255,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        {/* glow + grid */}
        <span aria-hidden className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-25 blur-3xl" style={{ background: "#7c5cff" }} />
        <button onClick={dismiss} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/10 hover:text-white">
          <X size={16} />
        </button>

        <div className="relative flex flex-col items-center text-center">
          {/* hero */}
          <div className="rpg-float-slow mb-1" style={{ filter: "drop-shadow(0 8px 22px rgba(124,92,255,0.5))" }} dangerouslySetInnerHTML={heroMarkup} />
          <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-violet-300">Welcome to Forgeheart City</span>
          <h2 className="mt-1 font-display text-2xl font-black tracking-tight text-white sm:text-3xl">
            Let&apos;s go, {ps.name}!
          </h2>
          <p className="mt-1.5 max-w-md text-sm text-slate-300">
            You&apos;re a {ps.cls?.name ?? "new hero"}. Finish lessons to earn XP, level up your hero, and unlock new powers, gear, and careers.
          </p>

          {/* three beats */}
          <div className="mt-5 grid w-full grid-cols-3 gap-2">
            <Beat icon={<ScrollText size={16} />} title="Quests" text="Bite-size lessons that earn XP" accent="#38bdf8" />
            <Beat icon={<Target size={16} />} title="Daily Goals" text="3 a day keeps your streak alive" accent="#f59e0b" />
            <Beat icon={<Compass size={16} />} title="Careers" text="Train toward a real dream job" accent="#fb7185" />
          </div>

          {/* CTAs */}
          <button
            onClick={() => go(firstQuestHref)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-black text-slate-900 transition active:scale-[0.98]"
            style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.45), 0 0 22px rgba(245,158,11,0.5)" }}
          >
            Start my first quest <ArrowRight size={16} />
          </button>
          <button onClick={dismiss} className="mt-2 text-xs font-semibold text-slate-400 transition hover:text-white">
            I&apos;ll explore the town first
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function Beat({ icon, title, text, accent }: { icon: React.ReactNode; title: string; text: string; accent: string }) {
  return (
    <div className="rounded-xl p-2.5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
      <span className="mx-auto grid h-9 w-9 place-items-center rounded-lg" style={{ background: `${accent}1f`, color: accent, border: `1px solid ${accent}44` }}>
        {icon}
      </span>
      <div className="mt-1.5 text-xs font-bold text-white">{title}</div>
      <div className="mt-0.5 text-[10px] leading-tight text-slate-400">{text}</div>
    </div>
  );
}
