"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, MouseEvent } from "react";
import {
  Zap,
  Flame,
  Trophy,
  Sparkles,
  ArrowRight,
  Home,
  Bot,
  Compass,
  Users,
  Crown,
  Heart,
} from "lucide-react";

/**
 * Animated learner-dashboard preview shown in the landing hero.
 * 3D mouse-tracking tilt + floating reward toasts.
 *
 * Content reflects the actual /learn experience — lessons, careers,
 * streaks, age-tier badges — so visitors get a real preview of what
 * their kid will see after signup.
 */
export function HeroPreview() {
  const cardRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

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

      {/* Browser chrome with 3D tilt */}
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
            <span className="text-[10px] text-slate-400 font-mono">pathforge.app/learn</span>
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
                    LA
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded bg-amber-500 border border-[#0a0a0f] flex items-center justify-center text-[7px] font-bold text-slate-900">
                    8
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold truncate">lara</div>
                  <div className="text-[8px] text-slate-500 tracking-wider uppercase">Junior Forger · Lv 8</div>
                </div>
              </div>
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "62%" }}
                  transition={{ duration: 1.2, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Nav items */}
            <div className="space-y-0.5">
              {[
                { Icon: Home, label: "Home", active: true },
                { Icon: Bot, label: "Tutor", active: false },
                { Icon: Compass, label: "Careers", active: false },
                { Icon: Users, label: "Friends", active: false },
                { Icon: Sparkles, label: "Badges", active: false },
                { Icon: Crown, label: "Ranks", active: false },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 text-[10px] px-2 py-1.5 rounded ${
                    item.active
                      ? "bg-white/[0.06] text-white font-medium"
                      : "text-slate-500"
                  }`}
                >
                  <item.Icon size={10} />
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Main panel */}
          <div className="p-5 lg:p-6 space-y-3">
            {/* Greeting */}
            <div>
              <div className="text-[10px] text-slate-500 mb-0.5">🚀 Junior Forger</div>
              <div className="text-base lg:text-lg font-semibold tracking-tight">
                Hey lara — let's level up.
              </div>
            </div>

            {/* Daily goal bar */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative overflow-hidden rounded-xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent p-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between mb-1">
                    <div className="text-[10px] font-semibold">Today's goal</div>
                    <div className="text-[9px] text-slate-400 tabular-nums">
                      <span className="text-white font-semibold">140</span> / 200 XP
                    </div>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: "0%" }}
                      animate={{ width: "70%" }}
                      transition={{ duration: 1.4, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Zap, label: "XP", value: "3.2k", color: "#6366f1" },
                { icon: Flame, label: "Streak", value: "12d", color: "#f59e0b" },
                { icon: Trophy, label: "Lessons", value: "18", color: "#ec4899" },
              ].map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 + i * 0.08 }}
                  className="p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                >
                  <s.icon size={10} style={{ color: s.color }} className="mb-1" />
                  <div className="text-[8px] text-slate-500 uppercase tracking-wider">{s.label}</div>
                  <div className="text-sm font-semibold tabular-nums">{s.value}</div>
                </motion.div>
              ))}
            </div>

            {/* Today's mission lesson */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="relative overflow-hidden rounded-xl border border-white/[0.08] p-3"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/[0.10] via-orange-500/[0.04] to-transparent" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-base flex-shrink-0">
                  🧮
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] uppercase tracking-wider text-amber-300 font-bold mb-0.5">
                    Today's mission
                  </div>
                  <div className="text-xs font-semibold truncate">
                    Adding with regrouping
                  </div>
                  <div className="flex items-center gap-2 text-[9px] mt-0.5">
                    <span className="text-indigo-300 font-semibold inline-flex items-center gap-0.5">
                      <Zap size={8} />
                      +120 XP
                    </span>
                    <span className="text-slate-500">5 questions · 4 min</span>
                  </div>
                </div>
                <ArrowRight size={12} className="text-slate-400 flex-shrink-0" />
              </div>
            </motion.div>

            {/* Dream career */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              className="relative overflow-hidden rounded-xl border border-rose-400/20 p-3"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/[0.10] via-pink-500/[0.04] to-transparent" />
              <div className="relative flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-base flex-shrink-0">
                  🔬
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[8px] uppercase tracking-wider text-rose-300 font-bold mb-0.5 inline-flex items-center gap-1">
                    <Heart size={8} fill="currentColor" />
                    Dream career
                  </div>
                  <div className="text-xs font-semibold truncate">📚 Scientist Apprentice</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">Stage 2 of 5 · 800 XP to next</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Floating achievement badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: 30, y: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 1.6, type: "spring", stiffness: 200 }}
        className="hidden sm:flex absolute right-2 sm:right-4 lg:-right-10 top-12 z-20 items-center gap-2.5 p-3 rounded-2xl border border-white/[0.12] bg-[#0a0a0f]/90 backdrop-blur-xl shadow-2xl"
        style={{ boxShadow: "0 20px 60px rgba(245,158,11,0.3)" }}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
          <Trophy size={16} className="text-white" />
        </div>
        <div className="pr-1">
          <div className="text-[9px] uppercase tracking-wider text-amber-300 font-bold mb-0.5">
            Achievement unlocked
          </div>
          <div className="text-xs font-semibold">12-Day Streak</div>
          <div className="text-[9px] text-slate-400">+200 XP earned</div>
        </div>
      </motion.div>

      {/* Floating lesson complete toast */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5, x: -30, y: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 1.9, type: "spring", stiffness: 200 }}
        className="hidden md:flex absolute left-2 md:left-4 lg:-left-8 bottom-16 z-20 items-center gap-2.5 p-2.5 rounded-xl border border-white/[0.12] bg-[#0a0a0f]/90 backdrop-blur-xl shadow-2xl"
        style={{ boxShadow: "0 20px 60px rgba(99,102,241,0.3)" }}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-white" />
        </div>
        <div className="pr-1">
          <div className="text-[10px] font-semibold">Lesson complete!</div>
          <div className="text-[9px] text-emerald-300 font-semibold">+150 XP</div>
        </div>
      </motion.div>
    </div>
  );
}
