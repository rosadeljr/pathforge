"use client";

/**
 * ForgeBot Mascot v2 — holographic guardian style.
 *
 * Inspired by Iron Man's HUD + BB-8 + a futuristic Disney mascot.
 * Built with pure SVG + Framer Motion (no 3D library). The "wow"
 * comes from:
 *   - Sleek cohesive silhouette (no floating disconnected parts)
 *   - Multi-layer glow filters (rim light + bloom + drop shadow)
 *   - Orbiting saturn-like holographic ring with depth
 *   - Pulsing power core with concentric energy rings
 *   - Holographic visor with twin glowing pupils that track the cursor
 *   - Streaming data particles + lens flare at antenna tip
 *   - Parallax tilt to mouse via CSS perspective
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  className?: string;
}

export function ForgeBotMascot({ size = 320, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 80, damping: 14, mass: 0.6 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [16, -16]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-10, 10]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-3.5, 3.5]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-2, 2]), springConfig);

  const [blink, setBlink] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Blink randomly — feels alive
  useEffect(() => {
    let timer: any;
    const schedule = () => {
      const delay = 2200 + Math.random() * 3500;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 110);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // Periodic power-core pulse (extra burst)
  useEffect(() => {
    let timer: any;
    const schedule = () => {
      timer = setTimeout(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 800);
        schedule();
      }, 6000 + Math.random() * 3000);
    };
    schedule();
    return () => clearTimeout(timer);
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

  // Particle ring positions (calculated once)
  const dataParticles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        angle: (i / 14) * Math.PI * 2,
        delay: (i / 14) * 2,
        size: 1.5 + Math.random() * 1.5,
      })),
    []
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, perspective: "1200px" }}
    >
      {/* Outer glow halo */}
      <motion.div
        animate={{ opacity: [0.6, 0.85, 0.6], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(99,102,241,0.45), rgba(168,85,247,0.20) 30%, transparent 60%)",
          filter: "blur(6px)",
        }}
      />
      {/* Cyan rim glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(34,211,238,0.25), transparent 45%)",
          filter: "blur(12px)",
        }}
      />

      {/* Bobbing wrapper */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Tilt wrapper */}
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
            viewBox="0 0 320 360"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 30px 50px rgba(99,102,241,0.4))" }}
          >
            <defs>
              {/* ── HEAD GRADIENTS ─────────────────────────── */}
              <radialGradient id="helmetGrad" cx="35%" cy="22%" r="85%">
                <stop offset="0%" stopColor="#f0f9ff" />
                <stop offset="15%" stopColor="#c7d2fe" />
                <stop offset="45%" stopColor="#818cf8" />
                <stop offset="80%" stopColor="#4f46e5" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
              {/* Rim light on right side of helmet (cool blue) */}
              <linearGradient id="rimGrad" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.15" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Visor — glassy dark with cyan tint */}
              <radialGradient id="visorGrad" cx="35%" cy="25%" r="90%">
                <stop offset="0%" stopColor="#0c1437" />
                <stop offset="50%" stopColor="#020617" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              {/* Body */}
              <radialGradient id="bodyGrad" cx="35%" cy="20%" r="90%">
                <stop offset="0%" stopColor="#c7d2fe" />
                <stop offset="30%" stopColor="#818cf8" />
                <stop offset="70%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
              {/* Power core */}
              <radialGradient id="coreGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="20%" stopColor="#fde68a" />
                <stop offset="55%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
              </radialGradient>
              {/* Eyes */}
              <radialGradient id="eyeGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#67e8f9" />
                <stop offset="70%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
              </radialGradient>
              {/* Antenna tip */}
              <radialGradient id="antennaGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#a16207" stopOpacity="0" />
              </radialGradient>
              {/* Holographic ring */}
              <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
                <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="b1" />
                <feMerge>
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Strong glow for power core */}
              <filter id="strongGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="b1" />
                <feGaussianBlur stdDeviation="14" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Circuit pattern for body */}
              <pattern id="circuit" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 0 10 L 5 10 L 5 5 L 10 5 M 15 5 L 15 10 L 20 10 M 10 15 L 10 20"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="0.5"
                  fill="none"
                />
              </pattern>
            </defs>

            {/* ╔═══════════════════════════════════════════╗
                BACKGROUND — holographic orbiting ring
                Sits BEHIND the bot to create depth
                ╚═══════════════════════════════════════════╝ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "160px 200px" }}
            >
              {/* Outer ellipse — perspective-tilted to suggest 3D rotation */}
              <ellipse
                cx="160"
                cy="200"
                rx="135"
                ry="38"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="1.5"
                opacity="0.6"
                style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6))" }}
              />
              {/* Inner ring slightly offset */}
              <ellipse
                cx="160"
                cy="205"
                rx="120"
                ry="32"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="0.8"
                opacity="0.4"
                strokeDasharray="3 6"
              />
            </motion.g>

            {/* Floating data particles around the bot */}
            {dataParticles.map((p, i) => {
              const cx = 160 + Math.cos(p.angle) * 130;
              const cy = 200 + Math.sin(p.angle) * 36;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={p.size}
                  fill="#22d3ee"
                  animate={{
                    opacity: [0, 0.9, 0],
                    scale: [0.5, 1.4, 0.5],
                  }}
                  transition={{
                    duration: 2.5,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                />
              );
            })}

            {/* Ground reflection oval */}
            <motion.ellipse
              cx="160"
              cy="340"
              rx="78"
              ry="6"
              fill="rgba(0,0,0,0.55)"
              animate={{ rx: [78, 72, 78], opacity: [0.55, 0.4, 0.55] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "blur(5px)" }}
            />
            {/* Cyan ground glow reflection */}
            <ellipse
              cx="160"
              cy="338"
              rx="60"
              ry="4"
              fill="rgba(34,211,238,0.4)"
              style={{ filter: "blur(10px)" }}
            />

            {/* ╔═══════════════════════════════════════════╗
                ANTENNA
                ╚═══════════════════════════════════════════╝ */}
            {/* Stem */}
            <line
              x1="160"
              y1="68"
              x2="160"
              y2="38"
              stroke="url(#helmetGrad)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Outer pulsing rings around antenna tip */}
            <motion.circle
              cx="160"
              cy="32"
              r="14"
              fill="none"
              stroke="#facc15"
              strokeWidth="1"
              animate={{ r: [10, 22, 10], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="160"
              cy="32"
              r="14"
              fill="none"
              stroke="#facc15"
              strokeWidth="1"
              animate={{ r: [10, 22, 10], opacity: [0.8, 0, 0.8] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.6,
              }}
            />
            {/* Glowing tip */}
            <motion.circle
              cx="160"
              cy="32"
              r="8"
              fill="url(#antennaGrad)"
              animate={{ r: [7, 9, 7] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 12px #facc15)" }}
            />
            {/* Lens flare cross */}
            <g style={{ filter: "drop-shadow(0 0 4px #ffffff)" }} opacity="0.9">
              <line x1="160" y1="22" x2="160" y2="42" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
              <line x1="150" y1="32" x2="170" y2="32" stroke="white" strokeWidth="0.6" strokeLinecap="round" />
            </g>

            {/* ╔═══════════════════════════════════════════╗
                HEAD / HELMET (cohesive with body)
                ╚═══════════════════════════════════════════╝ */}
            <motion.g
              animate={{ rotate: [0, -1.5, 0, 1.5, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "160px 130px" }}
            >
              {/* Helmet base — sleek rounded shape that connects to body */}
              <path
                d="M 95 75
                   Q 95 60 110 60
                   L 210 60
                   Q 225 60 225 75
                   L 225 165
                   Q 225 180 210 185
                   L 200 188
                   L 200 195
                   L 120 195
                   L 120 188
                   L 110 185
                   Q 95 180 95 165
                   Z"
                fill="url(#helmetGrad)"
              />
              {/* Circuit overlay on helmet */}
              <path
                d="M 95 75
                   Q 95 60 110 60
                   L 210 60
                   Q 225 60 225 75
                   L 225 165
                   Q 225 180 210 185
                   L 200 188
                   L 200 195
                   L 120 195
                   L 120 188
                   L 110 185
                   Q 95 180 95 165
                   Z"
                fill="url(#circuit)"
              />
              {/* Rim light (right side highlight) */}
              <path
                d="M 218 75 Q 225 75 225 85 L 225 160"
                stroke="url(#rimGrad)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              {/* Top-left highlight crescent */}
              <path
                d="M 105 75 Q 130 65 165 65"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Subtle inner shadow on bottom */}
              <path
                d="M 100 165 Q 160 195 220 165"
                stroke="rgba(0,0,0,0.25)"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />

              {/* ── VISOR (single glassy panel housing both eyes) ── */}
              <path
                d="M 115 88
                   Q 115 80 124 80
                   L 196 80
                   Q 205 80 205 88
                   L 205 140
                   Q 205 152 193 152
                   L 127 152
                   Q 115 152 115 140
                   Z"
                fill="url(#visorGrad)"
              />
              {/* Visor top reflection */}
              <path
                d="M 122 88 Q 145 84 198 86"
                stroke="rgba(255,255,255,0.22)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Visor bottom reflection */}
              <path
                d="M 130 145 Q 160 148 190 145"
                stroke="rgba(34,211,238,0.15)"
                strokeWidth="1"
                strokeLinecap="round"
                fill="none"
              />

              {/* ── EYES (track mouse + blink) ── */}
              <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                {/* Left eye */}
                <motion.g
                  animate={blink ? { scaleY: 0.05 } : { scaleY: 1 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformOrigin: "140px 115px" }}
                >
                  <circle
                    cx="140"
                    cy="115"
                    r="14"
                    fill="url(#eyeGrad)"
                    filter="url(#glow)"
                  />
                  <circle cx="140" cy="115" r="7" fill="#0e7490" />
                  <circle cx="142" cy="112" r="2.5" fill="white" />
                </motion.g>
                {/* Right eye */}
                <motion.g
                  animate={blink ? { scaleY: 0.05 } : { scaleY: 1 }}
                  transition={{ duration: 0.08 }}
                  style={{ transformOrigin: "180px 115px" }}
                >
                  <circle
                    cx="180"
                    cy="115"
                    r="14"
                    fill="url(#eyeGrad)"
                    filter="url(#glow)"
                  />
                  <circle cx="180" cy="115" r="7" fill="#0e7490" />
                  <circle cx="182" cy="112" r="2.5" fill="white" />
                </motion.g>
              </motion.g>

              {/* Smile — soft glowing curve */}
              <path
                d="M 138 138 Q 160 146 182 138"
                stroke="#67e8f9"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
              />

              {/* Tiny HUD details */}
              <text x="200" y="98" fontSize="6" fill="rgba(34,211,238,0.5)" fontFamily="monospace">
                ⚡01
              </text>
              <text x="120" y="148" fontSize="6" fill="rgba(34,211,238,0.5)" fontFamily="monospace">
                v2.0
              </text>
            </motion.g>

            {/* ╔═══════════════════════════════════════════╗
                BODY — connects seamlessly to head
                ╚═══════════════════════════════════════════╝ */}
            {/* Neck transition piece */}
            <rect x="142" y="190" width="36" height="14" rx="3" fill="url(#bodyGrad)" />

            {/* Main body */}
            <path
              d="M 100 200
                 Q 100 195 105 195
                 L 215 195
                 Q 220 195 220 200
                 L 220 285
                 Q 220 300 205 305
                 L 115 305
                 Q 100 300 100 285
                 Z"
              fill="url(#bodyGrad)"
            />
            {/* Circuit pattern overlay */}
            <path
              d="M 100 200
                 Q 100 195 105 195
                 L 215 195
                 Q 220 195 220 200
                 L 220 285
                 Q 220 300 205 305
                 L 115 305
                 Q 100 300 100 285
                 Z"
              fill="url(#circuit)"
            />
            {/* Body rim light */}
            <path
              d="M 215 200 Q 220 200 220 210 L 220 280"
              stroke="url(#rimGrad)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Body top-left highlight */}
            <path
              d="M 110 210 Q 140 200 175 200"
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />

            {/* Holographic chest core area */}
            {/* Outer ring */}
            <motion.circle
              cx="160"
              cy="250"
              r={pulse ? 36 : 28}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="0.8"
              opacity="0.4"
              animate={{
                r: [26, 32, 26],
                opacity: [0.5, 0.2, 0.5],
              }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            />
            {/* Middle ring (rotating) */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "160px 250px" }}
            >
              <circle
                cx="160"
                cy="250"
                r="22"
                fill="none"
                stroke="#a78bfa"
                strokeWidth="0.8"
                strokeDasharray="2 4"
                opacity="0.6"
              />
            </motion.g>
            {/* Power core */}
            <motion.circle
              cx="160"
              cy="250"
              r="18"
              fill="url(#coreGrad)"
              animate={{
                r: pulse ? [18, 26, 18] : [16, 19, 16],
                opacity: [1, 0.85, 1],
              }}
              transition={{ duration: pulse ? 0.8 : 2, repeat: Infinity, ease: "easeInOut" }}
              filter="url(#strongGlow)"
            />
            {/* Lightning bolt inside core */}
            <path
              d="M 162 240 L 154 252 L 159 252 L 156 262 L 165 248 L 160 248 Z"
              fill="white"
              opacity="0.95"
              style={{ filter: "drop-shadow(0 0 3px white)" }}
            />

            {/* ╔═══════════════════════════════════════════╗
                ARMS — attached to body shoulders
                ╚═══════════════════════════════════════════╝ */}
            {/* Left shoulder + arm */}
            <ellipse cx="100" cy="205" rx="12" ry="10" fill="url(#bodyGrad)" />
            <motion.g
              animate={{ rotate: [0, -4, 0, 4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "100px 205px" }}
            >
              <rect x="88" y="210" width="20" height="55" rx="9" fill="url(#bodyGrad)" />
              {/* Forearm rim */}
              <path
                d="M 105 215 L 105 260"
                stroke="rgba(34,211,238,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Hand */}
              <circle cx="98" cy="270" r="12" fill="url(#bodyGrad)" />
              <circle cx="98" cy="269" r="3" fill="#22d3ee" opacity="0.7" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
            </motion.g>

            {/* Right shoulder + arm */}
            <ellipse cx="220" cy="205" rx="12" ry="10" fill="url(#bodyGrad)" />
            <motion.g
              animate={{ rotate: [0, 4, 0, -4, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              style={{ transformOrigin: "220px 205px" }}
            >
              <rect x="212" y="210" width="20" height="55" rx="9" fill="url(#bodyGrad)" />
              <path
                d="M 215 215 L 215 260"
                stroke="rgba(34,211,238,0.5)"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <circle cx="222" cy="270" r="12" fill="url(#bodyGrad)" />
              <circle cx="222" cy="269" r="3" fill="#22d3ee" opacity="0.7" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
            </motion.g>

            {/* Shoulder light ports (top) */}
            <circle cx="118" cy="200" r="2" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />
            <circle cx="202" cy="200" r="2" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />

            {/* ╔═══════════════════════════════════════════╗
                FOREGROUND ORBITING RING — passes IN FRONT
                Gives depth illusion
                ╚═══════════════════════════════════════════╝ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "160px 200px" }}
            >
              {/* Only render the front half by clipping the rotation phase — keep ring */}
              <ellipse
                cx="160"
                cy="200"
                rx="135"
                ry="38"
                fill="none"
                stroke="url(#ringGrad)"
                strokeWidth="2"
                opacity="0.4"
                strokeDasharray="80 600"
                style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.8))" }}
              />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating sparkles outside the SVG */}
      <FloatingSparkle delay={0} top="8%" left="6%" emoji="✨" />
      <FloatingSparkle delay={1.5} top="18%" right="4%" emoji="⚡" />
      <FloatingSparkle delay={3} bottom="24%" left="2%" emoji="✦" />
      <FloatingSparkle delay={2} bottom="14%" right="6%" emoji="✨" />
      <FloatingSparkle delay={1} top="40%" left="0%" emoji="·" />
      <FloatingSparkle delay={2.5} top="55%" right="0%" emoji="·" />
    </div>
  );
}

function FloatingSparkle({
  delay,
  top,
  bottom,
  left,
  right,
  emoji = "✨",
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
        fontSize: "14px",
        color: "#67e8f9",
        textShadow: "0 0 8px rgba(34,211,238,0.8)",
      }}
      animate={{
        y: [0, -14, 0],
        opacity: [0, 1, 0],
        scale: [0.4, 1.2, 0.4],
        rotate: [0, 30, 0],
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
