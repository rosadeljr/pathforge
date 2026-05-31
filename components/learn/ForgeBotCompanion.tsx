"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Sparkles } from "lucide-react";

/**
 * ForgeBot floating companion chip.
 *
 * Pinned bottom-right on /learn home (and other learner pages where we
 * mount it). Tapping opens a tiny prompt-style popover with 2-3 starter
 * prompts that deep-link to /mentor with a seed message. The goal is to
 * make the AI tutor feel like a companion you can summon, not a buried
 * route the kid forgets exists.
 *
 * - Auto-dismisses after first interaction in a session (sessionStorage).
 * - Respects reduced-motion users (still works, just no big bounces).
 * - Sized so it never blocks the bottom nav on mobile (positioned above it).
 * - Cosmetic emoji-first; no real model call happens here — taps just
 *   navigate to /mentor with a `?seed=` param the mentor page can read.
 */

const STARTER_PROMPTS = [
  { emoji: "❓", label: "Help with my lesson", seed: "Can you help me understand what I'm learning right now?" },
  { emoji: "🎯", label: "What should I learn next?", seed: "Based on what I've finished, what should I learn next?" },
  { emoji: "🇵🇭", label: "Tell me about a Filipino hero", seed: "Tell me about a Filipino hero in a fun way." },
];

const STORAGE_KEY = "forgebot-companion-dismissed";

export function ForgeBotCompanion() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHint, setShowHint] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Per-session dismissal — don't pulse the hint over and over for
    // returning kids who've already noticed the chip exists.
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (dismissed) setShowHint(false);
    }
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed z-40 bottom-20 right-4 sm:bottom-6 sm:right-6 pointer-events-none"
      aria-label="ForgeBot tutor companion"
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="pointer-events-auto absolute bottom-full right-0 mb-3 w-72 rounded-2xl border border-indigo-400/30 bg-[#0c0c14]/95 backdrop-blur p-4 shadow-2xl shadow-indigo-500/20"
          >
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-2 right-2 w-6 h-6 rounded-md flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              <X size={12} />
            </button>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base">
                🤖
              </div>
              <div>
                <div className="text-sm font-semibold leading-tight">ForgeBot</div>
                <div className="text-[10px] text-slate-400">Your study buddy</div>
              </div>
            </div>
            <div className="space-y-1.5">
              {STARTER_PROMPTS.map((p) => (
                <Link
                  key={p.label}
                  href={`/mentor?seed=${encodeURIComponent(p.seed)}`}
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      sessionStorage.setItem(STORAGE_KEY, "1");
                    }
                  }}
                  className="group flex items-center gap-2.5 w-full text-left px-2.5 py-2 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/[0.16] transition-all"
                >
                  <span className="text-base">{p.emoji}</span>
                  <span className="flex-1 text-xs font-medium text-slate-200 group-hover:text-white">
                    {p.label}
                  </span>
                  <Sparkles size={11} className="text-indigo-300 opacity-60 group-hover:opacity-100" />
                </Link>
              ))}
            </div>
            <Link
              href="/mentor"
              className="mt-3 block text-center text-[11px] text-indigo-300 hover:text-indigo-200 font-medium"
            >
              Open full chat →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative pointer-events-auto">
        {/* Pulse hint — only on first session */}
        {showHint && !open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5, duration: 0.6 }}
            className="absolute bottom-full right-0 mb-2 whitespace-nowrap text-[10px] font-semibold text-indigo-200 bg-indigo-500/20 border border-indigo-400/40 rounded-full px-2.5 py-1 backdrop-blur"
          >
            Need help? Tap me 👇
          </motion.div>
        )}
        <motion.button
          onClick={() => {
            setOpen((v) => !v);
            setShowHint(false);
            if (typeof window !== "undefined") {
              sessionStorage.setItem(STORAGE_KEY, "1");
            }
          }}
          aria-label={open ? "Close ForgeBot" : "Open ForgeBot"}
          animate={
            showHint && !open
              ? { y: [0, -4, 0], rotate: [0, -4, 4, 0] }
              : {}
          }
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/60 transition-shadow group"
        >
          <motion.div
            animate={{
              opacity: open ? 0 : 1,
              scale: open ? 0.7 : 1,
            }}
            className="absolute inset-0 flex items-center justify-center text-xl"
          >
            🤖
          </motion.div>
          <motion.div
            animate={{
              opacity: open ? 1 : 0,
              scale: open ? 1 : 0.7,
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </motion.div>
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border-2 border-indigo-400 pointer-events-none"
          />
        </motion.button>
      </div>
    </div>
  );
}
