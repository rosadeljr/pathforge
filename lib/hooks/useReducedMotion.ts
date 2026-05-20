"use client";

import { useEffect, useState } from "react";

/**
 * Detects if the user has requested reduced motion via OS-level setting.
 * Useful for disabling/shortening animations for accessibility.
 *
 * Usage:
 *   const reduced = useReducedMotion();
 *   <motion.div animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : 0.5 }}>
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}
