"use client";

/**
 * Celebration — a one-shot confetti burst + message for rewarding moments
 * (e.g. collecting all Daily Goals). Self-contained, no new deps (framer-motion
 * only), pointer-events-none so it never blocks the UI, and auto-dismisses.
 * Respects prefers-reduced-motion: falls back to a calm static badge.
 */

import { useEffect, useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { playRewardChime, haptic } from "@/lib/effects/celebration";

const COLORS = ["#fcd34d", "#34d399", "#38bdf8", "#a78bfa", "#fb7185", "#f59e0b"];

export function Celebration({
  show,
  title,
  subtitle,
  onDone,
  duration = 2400,
}: {
  show: boolean;
  title: string;
  subtitle?: string;
  onDone: () => void;
  duration?: number;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!show) return;
    playRewardChime(); // sound-only; no-op when the user muted sound
    haptic("win"); // tactile reward on mobile; no-op without the Vibration API
    const t = setTimeout(onDone, duration);
    return () => clearTimeout(t);
  }, [show, duration, onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => {
        const angle = (Math.PI * 2 * i) / 36 + Math.random() * 0.4;
        const dist = 120 + Math.random() * 220;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40, // bias upward
          rot: Math.random() * 720 - 360,
          color: COLORS[i % COLORS.length],
          size: 7 + Math.random() * 7,
          delay: Math.random() * 0.08,
          round: Math.random() > 0.5,
        };
      }),
    []
  );

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[70] flex items-center justify-center" aria-hidden>
      {/* particles */}
      {!reduce &&
        pieces.map((p) => (
          <motion.span
            key={p.id}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, x: p.x, y: p.y, rotate: p.rot, scale: 0.6 }}
            transition={{ duration: 1.5, delay: p.delay, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
            style={{ width: p.size, height: p.size, background: p.color, borderRadius: p.round ? "9999px" : "2px" }}
          />
        ))}

      {/* message card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="relative flex flex-col items-center rounded-2xl px-6 py-5 text-center"
        style={{
          background: "linear-gradient(160deg, rgba(16,22,36,0.96), rgba(9,12,20,0.96))",
          border: "1px solid rgba(52,211,153,0.4)",
          boxShadow: "0 24px 60px -18px rgba(52,211,153,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <motion.span
          initial={{ scale: 0.4, rotate: -20 }}
          animate={reduce ? { scale: 1, rotate: 0 } : { scale: [0.4, 1.25, 1], rotate: [-20, 8, 0] }}
          transition={{ duration: 0.6 }}
          className="text-4xl"
        >
          🎉
        </motion.span>
        <h3 className="mt-2 font-display text-lg font-black tracking-tight text-white">{title}</h3>
        {subtitle && <p className="mt-0.5 text-sm font-semibold text-emerald-300">{subtitle}</p>}
      </motion.div>
    </div>
  );
}
