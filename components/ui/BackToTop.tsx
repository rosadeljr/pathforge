"use client";

/**
 * BackToTop — a small floating button that appears after the user scrolls a
 * couple of screens down a long page, then smooth-scrolls back to the top.
 * Mobile-friendly (large tap target), keyboard-accessible, and respects
 * prefers-reduced-motion (jumps instantly instead of animating).
 */

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export function BackToTop({ showAfter = 800 }: { showAfter?: number }) {
  const [visible, setVisible] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > showAfter);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 8 }}
          transition={{ duration: 0.18 }}
          onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-5 right-5 z-40 grid h-11 w-11 place-items-center rounded-full text-slate-900 shadow-lg transition hover:brightness-110 active:scale-95"
          style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }}
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </AnimatePresence>
  );
}
