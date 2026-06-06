"use client";

/**
 * RegionClearOverlay — full-screen celebration when a kid finishes
 * every lesson in a Realm Region.
 *
 * Mirrors the LevelUpOverlay pattern: full-bleed bg, falling emoji
 * confetti, big animated medallion with the region emoji, region name +
 * realm name, auto-dismiss after ~5s, tap anywhere to skip.
 *
 * Fired from the lesson done screen after persistCompletion when the
 * kid's region progress for that subject just hit 100%.
 */

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface RegionClearOverlayProps {
  /** Region display name, e.g. "Plains of Addition". */
  regionName: string;
  /** Emoji to anchor the medallion. */
  regionEmoji: string;
  /** Realm name, used as the sub-line ("Number Kingdom"). */
  realmName: string;
  /** Realm accent color — drives the glow + medallion ring. */
  accentColor: string;
  /** Total lessons cleared in this region. Shown in the stat row. */
  lessonsCleared: number;
  /** Optional: how many boss crowns the kid picked up in the region. */
  bossCrowns?: number;
  onClose: () => void;
}

export function RegionClearOverlay({
  regionName,
  regionEmoji,
  realmName,
  accentColor,
  lessonsCleared,
  bossCrowns = 0,
  onClose,
}: RegionClearOverlayProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5200);
    return () => clearTimeout(t);
  }, [onClose]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 42 }).map(() => ({
        emoji: ["🏆", "✨", "⭐", "👑", "💫", "🌟", "🎊"][
          Math.floor(Math.random() * 7)
        ],
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2.2 + Math.random() * 1.6,
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
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-lg cursor-pointer p-6"
        onClick={onClose}
        role="dialog"
        aria-label={`Region cleared: ${regionName}`}
      >
        {/* Color-graded ambient backdrop */}
        <motion.div
          animate={{ opacity: [0.35, 0.55, 0.35] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${accentColor}55, transparent 65%)`,
          }}
        />

        {/* Falling confetti */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {confetti.map((p, i) => (
            <motion.span
              key={i}
              initial={{ y: -40, opacity: 0, rotate: 0 }}
              animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: p.rot }}
              transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
              className="absolute text-3xl"
              style={{ left: `${p.left}%` }}
            >
              {p.emoji}
            </motion.span>
          ))}
        </div>

        {/* Centerpiece card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.05 }}
          className="relative max-w-md w-full text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Medallion */}
          <div className="relative inline-block mb-6">
            {/* Outer glow ring */}
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: `0 0 60px 20px ${accentColor}55`,
              }}
            />
            {/* Medallion disc */}
            <motion.div
              animate={{ rotate: [0, -6, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-32 h-32 rounded-full flex items-center justify-center text-6xl shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${accentColor}33, ${accentColor}88)`,
                border: `3px solid ${accentColor}`,
                boxShadow: `0 16px 48px ${accentColor}55, inset 0 -8px 16px rgba(0,0,0,0.25)`,
              }}
            >
              {regionEmoji}
            </motion.div>
            {/* Spinning laurel ring around the medallion */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-3 rounded-full pointer-events-none"
              style={{
                border: `1.5px dashed ${accentColor}80`,
              }}
            />
          </div>

          {/* Eyebrow */}
          <div
            className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2"
            style={{ color: accentColor }}
          >
            ⚔️ Region Cleared
          </div>

          {/* Region name */}
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-1">
            {regionName}
          </h2>
          <p className="text-sm text-slate-400 mb-6">
            of {realmName}
          </p>

          {/* Stat row */}
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-6">
            <Stat
              label="Lessons"
              value={lessonsCleared.toString()}
              accent={accentColor}
            />
            {bossCrowns > 0 && (
              <>
                <span className="text-slate-700">·</span>
                <Stat
                  label="Crowns"
                  value={`👑 ${bossCrowns}`}
                  accent="#fbbf24"
                />
              </>
            )}
          </div>

          <p className="text-xs text-slate-400">Tap anywhere to continue ✨</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="text-center">
      <div className="text-base font-bold tabular-nums" style={{ color: accent }}>
        {value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-slate-500 font-semibold">
        {label}
      </div>
    </div>
  );
}
