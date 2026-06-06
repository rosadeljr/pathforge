"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";

/**
 * ForgeBot floating companion chip.
 *
 * Pinned bottom-right on /learn home (and other learner pages where we
 * mount it). Tapping opens a tiny prompt-style popover with starter
 * prompts that deep-link to /mentor with a seed message.
 *
 * v2 — Smart seeds: if the parent passes `reviewItems` (the kid's
 * current spaced-review queue), we prepend a personalized
 * "Help me with: <lesson>" prompt that seeds the mentor with that
 * specific lesson title. Static prompts stay as fallbacks.
 *
 * Every seed click fires a `mentor_started_from_seed` analytics event
 * so we can measure which starter prompts drive engagement.
 *
 * - Auto-dismisses the pulse hint after first interaction in a session.
 * - Sized so it never blocks the bottom nav on mobile.
 */

export interface ForgeBotReviewItem {
  lessonId: string;
  title: string;
  emoji: string;
  /** Optional subject id, just for analytics breakdown. */
  subject?: string;
}

interface ForgeBotCompanionProps {
  /** Up to a handful of lessons in the kid's review queue. */
  reviewItems?: ForgeBotReviewItem[];
}

const STATIC_PROMPTS = [
  {
    emoji: "❓",
    label: "Help with my lesson",
    seed: "Can you help me understand what I'm learning right now?",
    kind: "generic-help",
  },
  {
    emoji: "🎯",
    label: "What should I learn next?",
    seed: "Based on what I've finished, what should I learn next?",
    kind: "next-up",
  },
  {
    emoji: "🇵🇭",
    label: "Tell me about a Filipino hero",
    seed: "Tell me about a Filipino hero in a fun way.",
    kind: "filipino-hero",
  },
];

const STORAGE_KEY = "forgebot-companion-dismissed";

export function ForgeBotCompanion({ reviewItems = [] }: ForgeBotCompanionProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHint, setShowHint] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem(STORAGE_KEY);
      if (dismissed) setShowHint(false);
    }
  }, []);

  /**
   * Build the prompt list. Smart (review-queue) prompts come first —
   * those are the most useful for kids who need help. Static prompts
   * fill any remaining slots up to ~5 total so the popover stays scannable.
   */
  const smartPrompts = reviewItems.slice(0, 2).map((r) => ({
    emoji: r.emoji,
    label: `Help me with ${r.title}`,
    seed: `Can you walk me through the lesson "${r.title}"? I missed some questions on the first try.`,
    kind: "review-queue",
    subject: r.subject,
    lessonId: r.lessonId,
  }));
  const prompts = [...smartPrompts, ...STATIC_PROMPTS].slice(0, 5);

  /**
   * Fire the mentor_started_from_seed event and dismiss the hint.
   * Navigation happens via the Link wrapper — we don't preventDefault.
   */
  function handleSeedClick(prompt: (typeof prompts)[number]) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem(STORAGE_KEY, "1");
    }
    // Fire-and-forget — analytics must never block the navigation.
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await track(supabase, session.user.id, "mentor_started_from_seed", {
            payload: {
              kind: prompt.kind,
              ...("subject" in prompt && prompt.subject
                ? { subject: prompt.subject }
                : {}),
              ...("lessonId" in prompt && prompt.lessonId
                ? { lesson_id: prompt.lessonId }
                : {}),
            },
          });
        }
      } catch {
        /* analytics best-effort */
      }
    })();
  }

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
            className="pointer-events-auto absolute bottom-full right-0 mb-3 w-72 sm:w-80 rounded-2xl border border-indigo-400/30 bg-[#0c0c14]/95 backdrop-blur p-4 shadow-2xl shadow-indigo-500/20"
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
                <div className="text-[10px] text-slate-400">
                  {smartPrompts.length > 0
                    ? "I've got suggestions just for you"
                    : "Your study buddy"}
                </div>
              </div>
            </div>

            {/* Section: smart suggestions — only render when present */}
            {smartPrompts.length > 0 && (
              <>
                <div className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold mb-1.5 inline-flex items-center gap-1">
                  <BookOpen size={9} />
                  From your review queue
                </div>
                <div className="space-y-1.5 mb-3">
                  {smartPrompts.map((p) => (
                    <Link
                      key={p.lessonId}
                      href={`/mentor?seed=${encodeURIComponent(p.seed)}`}
                      onClick={() => handleSeedClick(p)}
                      className="group flex items-center gap-2.5 w-full text-left px-2.5 py-2 rounded-xl border border-cyan-400/25 bg-cyan-500/[0.05] hover:bg-cyan-500/[0.10] hover:border-cyan-400/45 transition-all"
                    >
                      <span className="text-base">{p.emoji}</span>
                      <span className="flex-1 text-xs font-medium text-slate-100 group-hover:text-white line-clamp-2">
                        {p.label}
                      </span>
                      <Sparkles size={11} className="text-cyan-300 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              </>
            )}

            <div className="text-[9px] uppercase tracking-wider text-slate-500 font-bold mb-1.5">
              Or ask anything
            </div>
            <div className="space-y-1.5">
              {STATIC_PROMPTS.map((p) => (
                <Link
                  key={p.label}
                  href={`/mentor?seed=${encodeURIComponent(p.seed)}`}
                  onClick={() => handleSeedClick(p)}
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
              onClick={() => {
                if (typeof window !== "undefined") {
                  sessionStorage.setItem(STORAGE_KEY, "1");
                }
              }}
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
            {smartPrompts.length > 0
              ? "I can help with your review queue 👇"
              : "Need help? Tap me 👇"}
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
            animate={{ opacity: open ? 0 : 1, scale: open ? 0.7 : 1 }}
            className="absolute inset-0 flex items-center justify-center text-xl"
          >
            🤖
          </motion.div>
          <motion.div
            animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.7 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <X size={18} className="text-white" />
          </motion.div>
          <motion.span
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute inset-0 rounded-2xl border-2 border-indigo-400 pointer-events-none"
          />
          {/* Subtle red-dot badge when there are smart suggestions */}
          {smartPrompts.length > 0 && !open && (
            <motion.span
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 1.6, repeat: Infinity }}
              className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-[#0a0a0f] flex items-center justify-center text-[8px] font-bold text-slate-900"
            >
              {smartPrompts.length}
            </motion.span>
          )}
        </motion.button>
      </div>
    </div>
  );
}
