"use client";

/**
 * ForgeBot Mascot v6 — "Sleek Companion Drone."
 *
 * v5 leaned too cute (round eyes + pupils + cheek blushes + curved smile).
 * v6 targets 6–15: still friendly + approachable, but mature, cool, and
 * mechanical. Inspired by EVE (Wall-E), Vector (Anki), and Baymax with
 * a combat-drone upgrade. Slate/cyan palette, geometric paneling, single
 * visor band with slit-eyes + an audio waveform mouth.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  className?: string;
}

export function ForgeBotMascot({ size = 360, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 70, damping: 14, mass: 0.7 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [14, -14]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-8, 8]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-3, 3]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-1.5, 1.5]), springConfig);

  const [blink, setBlink] = useState(false);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 90);
        schedule();
      }, 3000 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
        schedule();
      }, 5000 + Math.random() * 3000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mouseX.set(x);
    mouseY.set(y);
  }
  function handleLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const orbitParticles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        angle: (i / 14) * Math.PI * 2,
        delay: (i / 14) * 2.5,
        size: 1.6 + Math.random() * 1.4,
      })),
    []
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, perspective: "1400px" }}
    >
      {/* Cyan back-light halo */}
      <motion.div
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(34,211,238,0.45), rgba(124,58,237,0.18) 35%, transparent 65%)",
          filter: "blur(10px)",
        }}
      />

      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: "100%" }}
      >
        <motion.div
          style={{
            rotateY,
            rotateX,
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
          }}
        >
          <svg
            viewBox="0 0 360 400"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 28px 50px rgba(34,211,238,0.35))" }}
          >
            <defs>
              {/* ─── METALLIC BODY (gunmetal w/ top highlight) ─── */}
              <linearGradient id="metalFill" x1="30%" y1="0%" x2="60%" y2="100%">
                <stop offset="0%" stopColor="#cbd5e1" />
                <stop offset="15%" stopColor="#94a3b8" />
                <stop offset="45%" stopColor="#475569" />
                <stop offset="80%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
              </linearGradient>
              {/* Darker metal for chest plate */}
              <linearGradient id="darkMetal" x1="30%" y1="0%" x2="60%" y2="100%">
                <stop offset="0%" stopColor="#64748b" />
                <stop offset="30%" stopColor="#334155" />
                <stop offset="70%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </linearGradient>
              {/* Joint accent */}
              <radialGradient id="jointFill" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="60%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              {/* VISOR PLATE — deep glassy with cyan tint */}
              <linearGradient id="visorFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0c0a1f" />
                <stop offset="40%" stopColor="#020617" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              {/* CYAN EYES */}
              <linearGradient id="eyeFill" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#a5f3fc" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
              {/* POWER CORE — electric blue/cyan (not warm amber) */}
              <radialGradient id="coreFill" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#cffafe" />
                <stop offset="55%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
              </radialGradient>
              {/* ANTENNA TIP */}
              <radialGradient id="antennaFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#a5f3fc" />
                <stop offset="75%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
              </radialGradient>
              {/* ORBIT RING */}
              <linearGradient id="ringFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
                <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              {/* RIM LIGHT (cyan on right side of forms) */}
              <linearGradient id="rimCyan" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.95" />
                <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.3" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Filters */}
              <filter id="bloom" x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation="2.5" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="strongBloom" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="5" result="b1" />
                <feGaussianBlur stdDeviation="14" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ═══════════════════════════════════════════════════════════
                BACKDROP — orbiting ring (behind)
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "180px 230px" }}
            >
              <ellipse
                cx="180"
                cy="230"
                rx="155"
                ry="42"
                fill="none"
                stroke="url(#ringFill)"
                strokeWidth="2"
                opacity="0.55"
                style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.6))" }}
              />
              <ellipse
                cx="180"
                cy="236"
                rx="138"
                ry="36"
                fill="none"
                stroke="url(#ringFill)"
                strokeWidth="0.8"
                opacity="0.3"
                strokeDasharray="3 8"
              />
            </motion.g>

            {/* Orbit particles */}
            {orbitParticles.map((p, i) => {
              const cx = 180 + Math.cos(p.angle) * 152;
              const cy = 232 + Math.sin(p.angle) * 40;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={p.size}
                  fill="#22d3ee"
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.5, 0.4] }}
                  transition={{
                    duration: 2.8,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }}
                />
              );
            })}

            {/* ═══════════════════════════════════════════════════════════
                GROUND PLATFORM
                ═══════════════════════════════════════════════════════════ */}
            <ellipse cx="180" cy="378" rx="92" ry="10" fill="rgba(0,0,0,0.55)" style={{ filter: "blur(7px)" }} />
            <ellipse
              cx="180"
              cy="375"
              rx="72"
              ry="5"
              fill="#22d3ee"
              opacity="0.35"
              style={{ filter: "blur(10px)" }}
            />
            <motion.ellipse
              cx="180"
              cy="372"
              rx="60"
              ry="3.5"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              animate={{ opacity: [0.4, 0.9, 0.4], rx: [56, 64, 56] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }}
            />

            {/* ═══════════════════════════════════════════════════════════
                ANTENNA — sleek mechanical
                ═══════════════════════════════════════════════════════════ */}
            {/* Stem with mid joint */}
            <line
              x1="180"
              y1="62"
              x2="180"
              y2="42"
              stroke="#475569"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect x="176" y="48" width="8" height="3" fill="#1e293b" />
            {/* Pulsing rings */}
            <motion.circle
              cx="180"
              cy="32"
              r="9"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              animate={{ r: [7, 22, 7], opacity: [0.9, 0, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="180"
              cy="32"
              r="9"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.5"
              animate={{ r: [7, 22, 7], opacity: [0.9, 0, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut", delay: 0.6 }}
            />
            {/* Tip */}
            <motion.circle
              cx="180"
              cy="32"
              r="7"
              fill="url(#antennaFill)"
              animate={{ r: [6, 8, 6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 14px #22d3ee)" }}
            />

            {/* ═══════════════════════════════════════════════════════════
                HEAD — sleek visor-helmet (wider top, tapered)
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: [-0.8, 0.8, -0.8] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "180px 135px" }}
            >
              {/* Soft glow behind head */}
              <ellipse
                cx="180"
                cy="140"
                rx="92"
                ry="80"
                fill="#22d3ee"
                opacity="0.18"
                style={{ filter: "blur(20px)" }}
              />

              {/* Helmet — angular with notched chin */}
              <path
                d="M 96 78
                   Q 96 65 110 65
                   L 250 65
                   Q 264 65 264 78
                   L 264 174
                   Q 264 192 248 195
                   L 215 200
                   L 215 210
                   L 145 210
                   L 145 200
                   L 112 195
                   Q 96 192 96 174
                   Z"
                fill="url(#metalFill)"
              />

              {/* Top specular highlight */}
              <path
                d="M 110 78 Q 145 66 200 66"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse
                cx="135"
                cy="80"
                rx="22"
                ry="5"
                fill="rgba(255,255,255,0.55)"
                style={{ filter: "blur(3px)" }}
              />

              {/* Right rim cyan light */}
              <path
                d="M 260 80 Q 264 80 264 92 L 264 170"
                stroke="url(#rimCyan)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />

              {/* Bottom shadow groove */}
              <path
                d="M 112 188 Q 180 198 248 188"
                stroke="rgba(0,0,0,0.5)"
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
              />

              {/* HEAD PANEL SEAMS — mechanical detail */}
              <line x1="180" y1="66" x2="180" y2="82" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              <line x1="115" y1="120" x2="120" y2="120" stroke="rgba(34,211,238,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="240" y1="120" x2="245" y2="120" stroke="rgba(34,211,238,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="113" y1="130" x2="118" y2="130" stroke="rgba(34,211,238,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="242" y1="130" x2="247" y2="130" stroke="rgba(34,211,238,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="111" y1="140" x2="116" y2="140" stroke="rgba(34,211,238,0.4)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="244" y1="140" x2="249" y2="140" stroke="rgba(34,211,238,0.4)" strokeWidth="1.5" strokeLinecap="round" />

              {/* ═══ VISOR BAND — single wide horizontal panel ═══ */}
              <path
                d="M 120 100
                   Q 120 92 130 92
                   L 230 92
                   Q 240 92 240 100
                   L 240 162
                   Q 240 176 226 176
                   L 134 176
                   Q 120 176 120 162
                   Z"
                fill="url(#visorFill)"
              />
              {/* Visor top reflection band */}
              <path
                d="M 128 98 Q 180 94 232 98"
                stroke="rgba(34,211,238,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Subtle inner cyan border */}
              <path
                d="M 124 100 Q 124 94 132 94 L 228 94 Q 236 94 236 100 L 236 160 Q 236 172 226 172 L 134 172 Q 124 172 124 160 Z"
                fill="none"
                stroke="rgba(34,211,238,0.18)"
                strokeWidth="1.5"
              />

              {/* HUD micro-text — much smaller and subtler */}
              <text x="226" y="106" fontSize="5" fill="rgba(34,211,238,0.55)" fontFamily="monospace">
                ⚡
              </text>
              <text x="128" y="172" fontSize="4.5" fill="rgba(34,211,238,0.4)" fontFamily="monospace">
                FB-v6
              </text>

              {/* ═══ SLIT EYES — angular, geometric (NOT round) ═══ */}
              <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                <motion.g
                  animate={blink ? { scaleY: 0.1 } : { scaleY: 1 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformOrigin: "180px 130px" }}
                >
                  {/* Left eye — slanted oval */}
                  <path
                    d="M 142 122
                       Q 145 116 162 117
                       Q 173 119 168 132
                       Q 165 138 152 137
                       Q 140 134 142 122 Z"
                    fill="url(#eyeFill)"
                    filter="url(#bloom)"
                  />
                  {/* Highlight on left eye */}
                  <ellipse cx="155" cy="123" rx="4" ry="2" fill="white" opacity="0.9" />

                  {/* Right eye — mirrored */}
                  <path
                    d="M 218 122
                       Q 215 116 198 117
                       Q 187 119 192 132
                       Q 195 138 208 137
                       Q 220 134 218 122 Z"
                    fill="url(#eyeFill)"
                    filter="url(#bloom)"
                  />
                  <ellipse cx="205" cy="123" rx="4" ry="2" fill="white" opacity="0.9" />
                </motion.g>
              </motion.g>

              {/* ═══ AUDIO WAVEFORM MOUTH (not a smile) ═══ */}
              <g style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.8))" }}>
                {/* Mouth base line */}
                <line
                  x1="156"
                  y1="158"
                  x2="204"
                  y2="158"
                  stroke="rgba(34,211,238,0.25)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
                {/* Animated audio bars */}
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.rect
                    key={i}
                    x={158 + i * 7}
                    y={155}
                    width="3"
                    height="6"
                    rx="1"
                    fill="#67e8f9"
                    animate={{
                      height: [3, 6 + Math.random() * 4, 3],
                      y: [157, 154, 157],
                    }}
                    transition={{
                      duration: 0.8 + Math.random() * 0.4,
                      repeat: Infinity,
                      delay: i * 0.08,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </g>
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                NECK CONNECTOR — mechanical hinge
                ═══════════════════════════════════════════════════════════ */}
            <rect x="160" y="210" width="40" height="14" rx="3" fill="url(#jointFill)" />
            <line x1="167" y1="217" x2="193" y2="217" stroke="#0f172a" strokeWidth="1" />
            <circle cx="172" cy="217" r="1.5" fill="#22d3ee" opacity="0.7" />
            <circle cx="188" cy="217" r="1.5" fill="#22d3ee" opacity="0.7" />

            {/* ═══════════════════════════════════════════════════════════
                BODY — armored chest plate
                ═══════════════════════════════════════════════════════════ */}
            {/* Back/under layer */}
            <path
              d="M 108 226
                 Q 108 218 116 218
                 L 244 218
                 Q 252 218 252 226
                 L 252 322
                 Q 252 340 232 342
                 L 128 342
                 Q 108 340 108 322
                 Z"
              fill="url(#darkMetal)"
            />
            {/* Top chest plate (slightly inset) */}
            <path
              d="M 116 230
                 L 244 230
                 L 244 250
                 Q 244 256 238 256
                 L 122 256
                 Q 116 256 116 250
                 Z"
              fill="url(#metalFill)"
            />
            {/* Plate seam highlights */}
            <line x1="180" y1="230" x2="180" y2="256" stroke="rgba(0,0,0,0.4)" strokeWidth="1" />
            <line
              x1="120"
              y1="234"
              x2="240"
              y2="234"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="1"
            />

            {/* Right rim cyan light on body */}
            <path
              d="M 248 232 Q 252 232 252 244 L 252 318"
              stroke="url(#rimCyan)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Top-left highlight */}
            <ellipse
              cx="135"
              cy="236"
              rx="22"
              ry="4"
              fill="rgba(255,255,255,0.3)"
              style={{ filter: "blur(3px)" }}
            />

            {/* Side accent stripes (violet) */}
            <rect x="113" y="270" width="3" height="40" rx="1.5" fill="#a78bfa" opacity="0.65" style={{ filter: "drop-shadow(0 0 3px #a78bfa)" }} />
            <rect x="244" y="270" width="3" height="40" rx="1.5" fill="#a78bfa" opacity="0.65" style={{ filter: "drop-shadow(0 0 3px #a78bfa)" }} />

            {/* ═══ CENTER POWER REACTOR ═══ */}
            <motion.g
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "180px 295px" }}
            >
              {/* Outer crosshair frame */}
              <line x1="180" y1="265" x2="180" y2="270" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="180" y1="320" x2="180" y2="325" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="148" y1="295" x2="153" y2="295" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="207" y1="295" x2="212" y2="295" stroke="rgba(34,211,238,0.6)" strokeWidth="1.5" strokeLinecap="round" />

              {/* Outer pulse ring */}
              <motion.circle
                cx="180"
                cy="295"
                r={pulse ? 30 : 25}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1"
                animate={{ opacity: [0.6, 0.15, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Rotating reticle ring */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "180px 295px" }}
              >
                <circle
                  cx="180"
                  cy="295"
                  r="20"
                  fill="none"
                  stroke="#67e8f9"
                  strokeWidth="0.8"
                  strokeDasharray="4 8"
                  opacity="0.7"
                />
                <circle cx="180" cy="275" r="1.5" fill="#22d3ee" />
                <circle cx="200" cy="295" r="1.5" fill="#22d3ee" />
                <circle cx="180" cy="315" r="1.5" fill="#22d3ee" />
                <circle cx="160" cy="295" r="1.5" fill="#22d3ee" />
              </motion.g>
              {/* Glass case */}
              <circle cx="180" cy="295" r="16" fill="rgba(15,23,42,0.7)" stroke="rgba(34,211,238,0.4)" strokeWidth="1" />
              {/* Core blob */}
              <motion.circle
                cx="180"
                cy="295"
                r={pulse ? 14 : 11}
                fill="url(#coreFill)"
                animate={{ r: [10, 13, 10] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                filter="url(#strongBloom)"
              />
              {/* Lightning bolt */}
              <path
                d="M 182 284 L 174 296 L 180 296 L 177 304 L 186 292 L 180 292 Z"
                fill="white"
                opacity="0.95"
                style={{ filter: "drop-shadow(0 0 3px white)" }}
              />
            </motion.g>

            {/* Chest panel ventilation lines (right side) */}
            <line x1="216" y1="328" x2="232" y2="328" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
            <line x1="216" y1="332" x2="232" y2="332" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
            <line x1="216" y1="336" x2="232" y2="336" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
            <line x1="128" y1="328" x2="144" y2="328" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
            <line x1="128" y1="332" x2="144" y2="332" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
            <line x1="128" y1="336" x2="144" y2="336" stroke="rgba(0,0,0,0.5)" strokeWidth="1" />

            {/* Bottom shadow */}
            <path
              d="M 115 325 Q 180 343 245 325"
              stroke="rgba(0,0,0,0.4)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* ═══════════════════════════════════════════════════════════
                ARMS — mechanical with visible joints
                ═══════════════════════════════════════════════════════════ */}
            {/* Left arm */}
            <g>
              {/* Shoulder ball */}
              <circle cx="98" cy="245" r="17" fill="url(#metalFill)" />
              <ellipse cx="92" cy="240" rx="6" ry="3.5" fill="rgba(255,255,255,0.45)" />
              <circle cx="98" cy="245" r="6" fill="url(#jointFill)" />
              {/* Upper arm */}
              <path
                d="M 84 250 Q 78 270 84 295 L 108 295 Q 112 270 108 250 Z"
                fill="url(#metalFill)"
              />
              {/* Elbow joint */}
              <ellipse cx="92" cy="300" rx="13" ry="9" fill="url(#jointFill)" />
              <circle cx="92" cy="300" r="3" fill="#22d3ee" opacity="0.55" />
              {/* Forearm */}
              <path
                d="M 80 305 Q 76 325 84 348 L 104 348 Q 108 325 100 304 Z"
                fill="url(#metalFill)"
              />
              {/* Hand pad */}
              <circle cx="92" cy="357" r="13" fill="url(#metalFill)" />
              <circle cx="92" cy="356" r="3.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }} />
            </g>

            {/* Right arm */}
            <g>
              <circle cx="262" cy="245" r="17" fill="url(#metalFill)" />
              <ellipse cx="268" cy="240" rx="6" ry="3.5" fill="rgba(255,255,255,0.45)" />
              <circle cx="262" cy="245" r="6" fill="url(#jointFill)" />
              <path
                d="M 252 250 Q 248 270 252 295 L 276 295 Q 282 270 276 250 Z"
                fill="url(#metalFill)"
              />
              <ellipse cx="268" cy="300" rx="13" ry="9" fill="url(#jointFill)" />
              <circle cx="268" cy="300" r="3" fill="#22d3ee" opacity="0.55" />
              <path
                d="M 260 305 Q 256 325 264 348 L 284 348 Q 288 325 280 304 Z"
                fill="url(#metalFill)"
              />
              <circle cx="272" cy="357" r="13" fill="url(#metalFill)" />
              <circle cx="272" cy="356" r="3.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }} />
            </g>

            {/* Shoulder light ports */}
            <circle cx="125" cy="232" r="2.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }} />
            <circle cx="235" cy="232" r="2.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }} />

            {/* ═══════════════════════════════════════════════════════════
                FOREGROUND ORBIT — passes IN FRONT for depth
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "180px 230px" }}
            >
              <ellipse
                cx="180"
                cy="230"
                rx="155"
                ry="42"
                fill="none"
                stroke="url(#ringFill)"
                strokeWidth="2.5"
                opacity="0.5"
                strokeDasharray="100 600"
                style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.9))" }}
              />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Subtle ambient sparkles */}
      <FloatingSparkle delay={0} top="8%" left="8%" emoji="✦" />
      <FloatingSparkle delay={1.6} top="18%" right="6%" emoji="·" />
      <FloatingSparkle delay={3} bottom="22%" left="4%" emoji="✦" />
      <FloatingSparkle delay={2} bottom="14%" right="8%" emoji="·" />
    </div>
  );
}

function FloatingSparkle({
  delay,
  top,
  bottom,
  left,
  right,
  emoji = "·",
}: {
  delay: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  emoji?: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top,
        bottom,
        left,
        right,
        fontSize: "12px",
        color: "#67e8f9",
        textShadow: "0 0 8px rgba(34,211,238,0.9)",
      }}
      animate={{
        y: [0, -12, 0],
        opacity: [0, 0.8, 0],
        scale: [0.5, 1.1, 0.5],
      }}
      transition={{
        duration: 3.2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {emoji}
    </motion.div>
  );
}
