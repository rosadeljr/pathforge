"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Swords,
  Compass,
  Bot,
  Trophy,
  ArrowRight,
  Check,
} from "lucide-react";
import Link from "next/link";

const SLIDES = [
  {
    title: "Welcome to PathForge",
    subtitle: "You're about to forge a career.",
    description:
      "Pick missions, build proof, level up. Recruiters will see what you've shipped — not just what you've studied.",
    icon: Sparkles,
    accent: "#a855f7",
    accentLight: "from-violet-500 to-purple-600",
  },
  {
    title: "Complete quests, earn XP",
    subtitle: "Every quest is a real-world skill.",
    description:
      "8 hand-curated starter quests are already in your log. Each has resources, steps, and a clear deliverable.",
    icon: Swords,
    accent: "#6366f1",
    accentLight: "from-indigo-500 to-blue-600",
  },
  {
    title: "Climb the ranks",
    subtitle: "E → D → C → B → A → S → SS → SSS",
    description:
      "Streaks, achievements, and level-ups compound. The further you climb, the rarer your rank — and the more recruiters notice.",
    icon: Trophy,
    accent: "#f59e0b",
    accentLight: "from-amber-500 to-orange-600",
  },
  {
    title: "Meet ForgeBot.",
    subtitle: "Your AI career coach.",
    description:
      "Stuck? Confused? Wondering what to learn next? ForgeBot knows your level, goals, and progress — and answers like a friend who's actually been there.",
    icon: Bot,
    accent: "#ec4899",
    accentLight: "from-pink-500 to-rose-600",
  },
];

const LOCAL_STORAGE_KEY = "pathforge-welcome-seen-v1";

export function WelcomeModal() {
  const [open, setOpen] = useState(false);
  const [slide, setSlide] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    // Show only if never seen
    if (typeof window === "undefined") return;
    const seen = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!seen) {
      // Small delay so it doesn't fight with dashboard mount animation
      setTimeout(() => setOpen(true), 600);
    }
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_KEY, "1");
    }
  };

  const handleNext = () => {
    if (slide < SLIDES.length - 1) {
      setSlide(slide + 1);
    } else {
      handleClose();
    }
  };

  const current = SLIDES[slide];
  const isLast = slide === SLIDES.length - 1;
  const Icon = current.icon;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.96 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full sm:max-w-md bg-[#0a0a0f] border border-white/[0.08] sm:rounded-3xl shadow-2xl overflow-hidden"
          >
            {/* Background glow */}
            <div
              className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full opacity-25 pointer-events-none transition-colors duration-500"
              style={{ background: `radial-gradient(circle, ${current.accent}40, transparent 70%)` }}
            />

            {/* Close */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            >
              <X size={14} />
            </button>

            <div className="relative px-6 py-10 sm:px-8 sm:py-12">
              {/* Icon */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
                  transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
                  className={`w-16 h-16 mx-auto mb-6 rounded-3xl bg-gradient-to-br ${current.accentLight} flex items-center justify-center shadow-2xl`}
                  style={{ boxShadow: `0 12px 40px ${current.accent}40` }}
                >
                  <Icon size={28} className="text-white" strokeWidth={2} />
                </motion.div>
              </AnimatePresence>

              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={slide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                    {current.title}
                  </h2>
                  <p className="text-sm font-medium text-slate-300 mb-4">{current.subtitle}</p>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-sm mx-auto">
                    {current.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress dots */}
              <div className="flex items-center justify-center gap-1.5 mt-8">
                {SLIDES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === slide ? "w-6 bg-white" : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

              {/* CTA */}
              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  onClick={handleClose}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleNext}
                  className="group inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
                >
                  {isLast ? (
                    <>
                      Let's go
                      <Check size={14} />
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
