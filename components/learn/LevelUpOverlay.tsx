"use client";

/**
 * LevelUpOverlay — full-screen celebration when a kid levels up.
 *
 * Fires after lesson XP is awarded if the new total crosses a level
 * threshold. Auto-dismisses after 4 seconds; tap anywhere to skip.
 */

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface LevelUpOverlayProps {
  level: number;
  onClose: () => void;
}

export function LevelUpOverlay({ level, onClose }: LevelUpOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 36 }).map(() => ({
        emoji: ["🎉", "✨", "⭐", "🌟", "💫", "🎊"][Math.floor(Math.random() * 6)],
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2 + Math.random() * 1.5,
        rot: (Math.random() - 0.5) * 720,
      })),
    []
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-lg cursor-pointer"
        onClick={onClose}
      >
        {/* Falling confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((p, i) => (
            <motion.span
              key={i}
              initial={{ y: -40, opacity: 0, rotate: 0 }}
              animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: p.rot }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                ease: "linear",
              }}
              className="absolute text-3xl"
              style={{ left: `${p.left}%` }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </div>

        {/* Center content */}
        <motion.div
          initial={{ scale: 0.5, y: 60, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 16 }}
          className="text-center px-6 relative z-10"
        >
          {/* Radial glow behind the level number */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 60%, rgba(245,158,11,0.55), transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, -12, 12, -12, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{ duration: 1.2, delay: 0.2 }}
              className="text-7xl sm:text-8xl mb-3 inline-block"
            >
              🏆
            </motion.div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 mb-4">
              <Sparkles size={12} className="text-amber-300" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-amber-200">
                Level Up
              </span>
            </div>

            <h2
              className="text-7xl sm:text-8xl font-black tracking-tighter mb-3 bg-gradient-to-r from-amber-200 via-orange-300 to-pink-300 bg-clip-text text-transparent"
              style={{ filter: "drop-shadow(0 4px 20px rgba(245,158,11,0.6))" }}
            >
              Lv {level}
            </h2>

            <p className="text-base sm:text-lg text-amber-50 font-semibold mb-1">
              You're getting smarter every day.
            </p>
            <p className="text-xs text-slate-300 mb-8">
              Keep going — your dream career is closer.
            </p>

            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              Tap anywhere to continue
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
