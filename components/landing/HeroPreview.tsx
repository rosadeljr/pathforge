"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, MouseEvent } from "react";
import { Swords, Zap, Flame, Trophy, Sparkles, ArrowRight } from "lucide-react";

/**
 * Animated dashboard preview shown in the landing hero.
 * Now with 3D mouse-tracking tilt for that futuristic feel.
 */
export function HeroPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Spring smoothing for buttery-smooth tilt
  const springConfig = { stiffness: 100, damping: 30 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative"
      style={{ perspective: "1200px" }}
    >
      {/* Outer glow */}
      <div
        className="absolute -inset-8 opacity-50 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(168,85,247,0.4), rgba(99,102,241,0.2), transparent 70%)",
        }}
      />

      {/* Browser chrome — with 3D tilt */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative rounded-2xl border border-white/[0.08] bg-[#0a0a0f]/95 backdrop-blur-xl shadow-2xl overflow-hidden will-change-transform"
      >
        {/* Browser bar */}
        <div className="flex items-center gap-2 px-4 h-9 border-b border-white/[0.06] bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
          </div>
          <div className="mx-auto inline-flex items-center gap-1.5 px-3 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
            <div className="w-2 h-2 rounded-sm bg-emerald-400/60" />
            <span className="text-[10px] text-slate-400 font-mono">pathforge.app/dashboard</span>
          </div>
        </div>

        {/* Dashboard mock body */}
        <div className="grid grid-cols-[1fr_2.5fr] min-h-[420px]">
          {/* Sidebar mock */}
          <div className="hidden sm:block border-r border-white/[0.06] bg-white/[0.01] p-4">
            {/* User card */}
            <div className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="relative">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold">
                    JD
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded bg-amber-500 border border-[#0a0a0f] flex items-center justify-center text-[7px] font-bold text-slate-900">
                    12
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold truncate">jdrocks</div>
                  <div className="text-[8px] text-slate-500 tracking-wider uppercase">Lv 12 · C-Rank</div>
                </div>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Nav items */}
            <div className="space-y-0.5">
              {[
                { label: "Dashboard", active: true },
                { label: "Quests", active: false },
                { label: "Roadmap", active: false },
                { label: "Jus AI", active: false },
                { label: "Portfolio", active: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`text-[10px] px-2 py-1.5 rounded ${
                    item.active
                      ? "bg-white/[0.06] text-white font-medium"
                      : "text-slate-500"
                  }`}
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main panel */}
          <div className="p-5 lg:p-6 space-y-4">
            {/* Greeting */}
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">Good morning, jdrocks</div>
              <div className="text-base lg:text-lg font-semibold tracking-tight">Let's forge today.</div>
            </div>

            {/* Level hero card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="relative overflow-hidden rounded-xl border border-white/[0.08] p-4 bg-gradient-to-br from-white/[0.04] to-transparent"
            >
              <div
                className="absolute -top-16 -right-16 w-32 h-32 rounded-full opacity-25"
                style={{
                  background:
                    "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)",
                }}
              />
              <div className="relative flex items-end justify-between mb-3">
                <div>
                  <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 mb-2">
                    <Sparkles size={8} />
                    C-RANK
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">Level</div>
                  <div className="text-3xl lg:text-4xl font-semibold tabular-nums leading-none">12</div>
                </div>
                <div className="text-right">
                  <div className="text-[9px] uppercase tracking-wider text-slate-500 mb-0.5">XP</div>
                  <div className="text-sm font-semibold tabular-nums">8,420</div>
                </div>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1.4, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                />
              </div>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Zap, label: "XP", value: "8.4k", color: "#6366f1" },
                { icon: Flame, label: "Streak", value: "12d", color: "#f59e0b" },
                { icon: Trophy, label: "Quests", value: "23", color: "#ec4899" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.8 + i * 0.1 }}
                  className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <s.icon size={10} style={{ color: s.color }} className="mb-1" />
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider">{s.label}</div>
                  <div className="text-sm font-semibold tabular-nums">{s.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Next quest spotlight */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              className="relative overflow-hidden rounded-xl border border-white/[0.08] p-3 hover:border-white/[0.16] transition-colors"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                  B
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
                    Next quest
                  </div>
                  <div className="text-xs font-semibold truncate">Build weather app with React + API</div>
                  <div className="flex items-center gap-2 text-[9px] mt-0.5">
                    <span className="text-indigo-300 font-semibold inline-flex items-center gap-0.5">
                      <Zap size={8} />
                      +600 XP
                    </span>
                    <span className="text-slate-500">4h</span>
                  </div>
                </div>
                <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating achievement badge — stays inside viewport on mobile, escapes on lg+ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: 30, y: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 1.6, type: "spring", stiffness: 200 }}
        className="hidden sm:flex absolute right-2 sm:right-4 lg:-right-10 top-12 z-20 items-center gap-2.5 p-3 rounded-2xl border border-white/[0.12] bg-[#0a0a0f]/90 backdrop-blur-xl shadow-2xl"
        style={{ boxShadow: "0 20px 60px rgba(168,85,247,0.3)" }}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
          <Trophy size={16} className="text-white" />
        </div>
        <div className="pr-1">
          <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold mb-0.5">
            Achievement unlocked
          </div>
          <div className="text-xs font-semibold">7-Day Streak</div>
          <div className="text-[9px] text-slate-400">+200 XP earned</div>
        </div>
      </motion.div>

      {/* Floating quest complete toast — stays inside viewport on mobile, escapes on lg+ */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -30, y: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 1.9, type: "spring", stiffness: 200 }}
        className="hidden md:flex absolute left-2 md:left-4 lg:-left-8 bottom-16 z-20 items-center gap-2.5 p-2.5 rounded-xl border border-white/[0.12] bg-[#0a0a0f]/90 backdrop-blur-xl shadow-2xl"
        style={{ boxShadow: "0 20px 60px rgba(99,102,241,0.3)" }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
          <Swords size={14} className="text-white" />
        </div>
        <div className="pr-1">
          <div className="text-[10px] font-semibold">Quest completed</div>
          <div className="text-[9px] text-emerald-300 font-semibold">+450 XP</div>
        </div>
      </motion.div>
    </div>
  );
}
