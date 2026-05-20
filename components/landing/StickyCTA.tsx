"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

/**
 * Appears after the user scrolls past the hero on the landing page.
 * Mobile-prominent (bottom drawer), subtle on desktop (bottom-right pill).
 * User can dismiss it.
 */
export function StickyCTA() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Show after user scrolls past first viewport
    const threshold = typeof window !== "undefined" ? window.innerHeight * 0.8 : 800;
    const onScroll = () => {
      if (window.scrollY > threshold && !dismissed) {
        setVisible(true);
      } else if (window.scrollY < threshold * 0.6) {
        setVisible(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [dismissed]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:bottom-6 z-40 max-w-sm sm:ml-auto"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0a0a0f]/90 backdrop-blur-xl shadow-2xl">
            {/* Subtle gradient glow */}
            <div
              className="absolute -top-12 -right-8 w-32 h-32 rounded-full opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)",
              }}
            />

            {/* Dismiss */}
            <button
              onClick={() => {
                setDismissed(true);
                setVisible(false);
              }}
              aria-label="Dismiss"
              className="absolute top-2 right-2 w-6 h-6 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] flex items-center justify-center transition-colors"
            >
              <X size={12} />
            </button>

            <div className="relative px-4 py-3.5 sm:py-4 pr-9 flex items-center gap-3">
              <div className="hidden sm:flex flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold mb-0.5">Ready to forge?</div>
                <div className="text-[11px] text-slate-400">Takes 2 minutes to start.</div>
              </div>
              <Link
                href="/signup"
                className="group flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-[linear-gradient(110deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)] bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all shadow-lg shadow-indigo-500/30"
              >
                Start
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
