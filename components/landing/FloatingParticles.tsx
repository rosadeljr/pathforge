"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * Subtle floating light particles for the landing background.
 * Adds depth and a sense of motion without being distracting.
 *
 * Particles are deterministic (no Math.random on render) to avoid
 * SSR/hydration mismatches.
 */

interface Particle {
  size: number;
  x: number;
  y: number;
  duration: number;
  delay: number;
  opacity: number;
  color: string;
}

const COLORS = [
  "rgba(99, 102, 241, 0.6)",
  "rgba(168, 85, 247, 0.6)",
  "rgba(236, 72, 153, 0.5)",
  "rgba(6, 182, 212, 0.5)",
];

// Pre-computed deterministic positions (no hydration issues)
const PARTICLES: Particle[] = [
  { size: 3, x: 10, y: 15, duration: 14, delay: 0, opacity: 0.6, color: COLORS[0] },
  { size: 2, x: 25, y: 30, duration: 11, delay: 1.5, opacity: 0.5, color: COLORS[1] },
  { size: 4, x: 45, y: 18, duration: 17, delay: 0.8, opacity: 0.7, color: COLORS[2] },
  { size: 2, x: 65, y: 25, duration: 13, delay: 2.2, opacity: 0.5, color: COLORS[3] },
  { size: 3, x: 80, y: 12, duration: 15, delay: 0.4, opacity: 0.6, color: COLORS[0] },
  { size: 2, x: 90, y: 35, duration: 18, delay: 1.8, opacity: 0.4, color: COLORS[1] },
  { size: 3, x: 15, y: 55, duration: 12, delay: 1.2, opacity: 0.5, color: COLORS[2] },
  { size: 2, x: 38, y: 65, duration: 16, delay: 0.6, opacity: 0.6, color: COLORS[3] },
  { size: 4, x: 58, y: 50, duration: 14, delay: 2.5, opacity: 0.5, color: COLORS[0] },
  { size: 2, x: 78, y: 60, duration: 13, delay: 1.1, opacity: 0.7, color: COLORS[1] },
  { size: 3, x: 5, y: 75, duration: 17, delay: 0.3, opacity: 0.5, color: COLORS[2] },
  { size: 2, x: 30, y: 85, duration: 15, delay: 2.0, opacity: 0.6, color: COLORS[3] },
  { size: 4, x: 55, y: 78, duration: 19, delay: 0.9, opacity: 0.5, color: COLORS[0] },
  { size: 2, x: 70, y: 88, duration: 12, delay: 1.6, opacity: 0.7, color: COLORS[1] },
  { size: 3, x: 88, y: 70, duration: 14, delay: 0.5, opacity: 0.6, color: COLORS[2] },
  { size: 2, x: 20, y: 45, duration: 16, delay: 2.3, opacity: 0.5, color: COLORS[3] },
];

export function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {PARTICLES.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [p.opacity * 0.3, p.opacity, p.opacity * 0.3],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
