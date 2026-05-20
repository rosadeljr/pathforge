"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

/**
 * Wraps a section and applies subtle parallax + fade-in as the user scrolls.
 * Game-dev "polish": every scroll feels intentional, every section earns its place.
 */
export function ScrollReveal({ children, intensity = 0.2 }: { children: ReactNode; intensity?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Parallax: section moves slightly slower than scroll
  const y = useTransform(scrollYProgress, [0, 1], [intensity * 50, intensity * -50]);
  // Opacity: fades in as it enters viewport, holds, then fades slightly as it leaves
  const opacity = useTransform(scrollYProgress, [0, 0.15, 0.85, 1], [0.6, 1, 1, 0.6]);

  return (
    <motion.div ref={ref} style={{ y, opacity }} className="will-change-transform">
      {children}
    </motion.div>
  );
}
