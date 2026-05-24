"use client";

/**
 * ForgeBot Mascot v5 — "Holographic Companion."
 *
 * Big lesson from v4: thin outlines + low-contrast gradients vanish on dark.
 * v5 uses SOLID FILLED SHAPES with rich, saturated gradients that pop hard
 * against #0a0a0f. Sleek, cinematic, premium — feels like a Pixar mascot
 * rather than a wireframe sketch.
 *
 * Built with pure SVG + Framer Motion (no 3D libraries). The "3D" comes from:
 *   - Multi-stop radial gradients on every shape (top-left light source)
 *   - Layered rim-light strokes for edge definition
 *   - Perspective + rotateY/X on the container for parallax tilt
 *   - Cyan rim glow + ambient halo behind the figure
 *   - Saturn ring orbiting in 3D-illusion
 *   - Particle field + sparkles for "alive" energy
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
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-4, 4]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-2.5, 2.5]), springConfig);

  const [blink, setBlink] = useState(false);
  const [wave, setWave] = useState(false);
  const [pulse, setPulse] = useState(false);

  // Random blinks
  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 110);
        schedule();
      }, 2000 + Math.random() * 3500);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Periodic wave
  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setWave(true);
        setTimeout(() => setWave(false), 1400);
        schedule();
      }, 7000 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  // Periodic power burst
  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setPulse(true);
        setTimeout(() => setPulse(false), 700);
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

  // Orbit particles
  const orbitParticles = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        angle: (i / 12) * Math.PI * 2,
        delay: (i / 12) * 2.5,
        size: 1.8 + Math.random() * 1.6,
      })),
    []
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, perspective: "1300px" }}
    >
      {/* Big breathing halo */}
      <motion.div
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.08, 1] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(124,58,237,0.55), rgba(34,211,238,0.20) 35%, transparent 65%)",
          filter: "blur(10px)",
        }}
      />
      {/* Cyan rim halo */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 38%, rgba(34,211,238,0.35), transparent 50%)",
          filter: "blur(16px)",
        }}
      />

      {/* Float */}
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Tilt */}
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
            style={{ filter: "drop-shadow(0 30px 50px rgba(99,102,241,0.45))" }}
          >
            <defs>
              {/* HEAD — vibrant indigo→violet with top-light */}
              <radialGradient id="headFill" cx="32%" cy="20%" r="90%">
                <stop offset="0%" stopColor="#e0e7ff" />
                <stop offset="20%" stopColor="#a5b4fc" />
                <stop offset="50%" stopColor="#7c3aed" />
                <stop offset="85%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
              {/* BODY — slightly cooler */}
              <radialGradient id="bodyFill" cx="35%" cy="15%" r="100%">
                <stop offset="0%" stopColor="#c7d2fe" />
                <stop offset="25%" stopColor="#818cf8" />
                <stop offset="60%" stopColor="#4338ca" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </radialGradient>
              {/* FACE PLATE — deep glass */}
              <radialGradient id="faceFill" cx="30%" cy="25%" r="90%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="50%" stopColor="#020617" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              {/* JOINT — darker neutral */}
              <linearGradient id="jointFill" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
              {/* EYE — bright cyan */}
              <radialGradient id="eyeFill" cx="40%" cy="35%" r="65%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="25%" stopColor="#cffafe" />
                <stop offset="55%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
              </radialGradient>
              {/* POWER CORE — amber */}
              <radialGradient id="coreFill" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="20%" stopColor="#fde68a" />
                <stop offset="55%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#92400e" stopOpacity="0" />
              </radialGradient>
              {/* ANTENNA TIP — golden */}
              <radialGradient id="antennaFill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#fef08a" />
                <stop offset="70%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#854d0e" stopOpacity="0" />
              </radialGradient>
              {/* ORBITING RING */}
              <linearGradient id="ringFill" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="25%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
                <stop offset="75%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              {/* RIM CYAN STROKE */}
              <linearGradient id="rimCyan" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Glow filters */}
              <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
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
              <filter id="hugeBloom" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="22" />
              </filter>
            </defs>

            {/* ═══════════════════════════════════════════════════════════════
                BACKDROP — orbiting ring behind the bot (sells the 3D depth)
                ═══════════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
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
                strokeWidth="1"
                opacity="0.35"
                strokeDasharray="3 8"
              />
            </motion.g>

            {/* Floating data particles orbiting */}
            {orbitParticles.map((p, i) => {
              const cx = 180 + Math.cos(p.angle) * 150;
              const cy = 232 + Math.sin(p.angle) * 40;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={p.size}
                  fill="#22d3ee"
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.4, 1.6, 0.4],
                  }}
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

            {/* GROUND PLATFORM — holographic disc the bot floats on */}
            <ellipse
              cx="180"
              cy="378"
              rx="90"
              ry="11"
              fill="rgba(0,0,0,0.5)"
              style={{ filter: "blur(7px)" }}
            />
            <ellipse
              cx="180"
              cy="375"
              rx="72"
              ry="6"
              fill="url(#coreFill)"
              opacity="0.35"
              style={{ filter: "blur(12px)" }}
            />
            <motion.ellipse
              cx="180"
              cy="372"
              rx="60"
              ry="4"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1"
              animate={{ opacity: [0.4, 0.9, 0.4], rx: [55, 65, 55] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
            />

            {/* ═══════════════════════════════════════════════════════════════
                ANTENNA
                ═══════════════════════════════════════════════════════════════ */}
            <line
              x1="180"
              y1="65"
              x2="180"
              y2="32"
              stroke="#818cf8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Pulsing rings emanating from tip */}
            <motion.circle
              cx="180"
              cy="26"
              r="10"
              fill="none"
              stroke="#facc15"
              strokeWidth="1.5"
              animate={{ r: [8, 24, 8], opacity: [0.9, 0, 0.9] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="180"
              cy="26"
              r="10"
              fill="none"
              stroke="#facc15"
              strokeWidth="1.5"
              animate={{ r: [8, 24, 8], opacity: [0.9, 0, 0.9] }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: "easeOut",
                delay: 0.6,
              }}
            />
            {/* Glow tip */}
            <motion.circle
              cx="180"
              cy="26"
              r="8"
              fill="url(#antennaFill)"
              animate={{ r: [7, 10, 7] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 14px #facc15)" }}
            />
            {/* Lens-flare cross */}
            <g style={{ filter: "drop-shadow(0 0 4px #ffffff)" }} opacity="0.85">
              <line
                x1="180"
                y1="14"
                x2="180"
                y2="38"
                stroke="white"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
              <line
                x1="168"
                y1="26"
                x2="192"
                y2="26"
                stroke="white"
                strokeWidth="0.8"
                strokeLinecap="round"
              />
            </g>

            {/* ═══════════════════════════════════════════════════════════════
                HEAD — solid filled, big and clearly visible
                ═══════════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: [-1.2, 1.2, -1.2] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "180px 130px" }}
            >
              {/* Soft outer glow behind head */}
              <ellipse
                cx="180"
                cy="135"
                rx="100"
                ry="92"
                fill="#7c3aed"
                opacity="0.35"
                filter="url(#hugeBloom)"
              />

              {/* Main head — chamfered rounded rectangle */}
              <path
                d="M 100 75
                   Q 100 58 117 58
                   L 243 58
                   Q 260 58 260 75
                   L 260 178
                   Q 260 197 243 197
                   L 200 197
                   L 200 206
                   L 160 206
                   L 160 197
                   L 117 197
                   Q 100 197 100 178
                   Z"
                fill="url(#headFill)"
              />

              {/* Rim light right side (cyan) */}
              <path
                d="M 256 80 Q 260 80 260 90 L 260 175"
                stroke="url(#rimCyan)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
              />
              {/* Top specular highlight */}
              <path
                d="M 115 75 Q 145 62 195 62"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <ellipse
                cx="140"
                cy="78"
                rx="22"
                ry="6"
                fill="rgba(255,255,255,0.4)"
                style={{ filter: "blur(3px)" }}
              />
              {/* Bottom inner shadow */}
              <path
                d="M 110 180 Q 180 200 250 180"
                stroke="rgba(0,0,0,0.4)"
                strokeWidth="9"
                strokeLinecap="round"
                fill="none"
                opacity="0.6"
              />

              {/* SIDE EAR-PODS — round headphone-style accent */}
              <g>
                {/* Left pod */}
                <ellipse cx="93" cy="135" rx="11" ry="18" fill="url(#jointFill)" />
                <ellipse cx="93" cy="135" rx="7" ry="12" fill="#020617" />
                <motion.circle
                  cx="93"
                  cy="135"
                  r="3"
                  fill="#22d3ee"
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.4 }}
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                />
                {/* Right pod */}
                <ellipse cx="267" cy="135" rx="11" ry="18" fill="url(#jointFill)" />
                <ellipse cx="267" cy="135" rx="7" ry="12" fill="#020617" />
                <motion.circle
                  cx="267"
                  cy="135"
                  r="3"
                  fill="#22d3ee"
                  animate={{ opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                />
              </g>

              {/* FACE PLATE — recessed dark glass */}
              <path
                d="M 118 92
                   Q 118 82 130 82
                   L 230 82
                   Q 242 82 242 92
                   L 242 168
                   Q 242 184 226 184
                   L 134 184
                   Q 118 184 118 168
                   Z"
                fill="url(#faceFill)"
              />
              {/* Face plate top reflection */}
              <path
                d="M 128 90 Q 180 86 232 90"
                stroke="rgba(34,211,238,0.45)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Inner cyan glow border */}
              <path
                d="M 122 92 Q 122 86 132 86 L 228 86 Q 238 86 238 92 L 238 166 Q 238 180 226 180 L 134 180 Q 122 180 122 166 Z"
                fill="none"
                stroke="rgba(34,211,238,0.15)"
                strokeWidth="1.5"
              />

              {/* HUD readouts on visor — sci-fi flavor */}
              <text x="226" y="100" fontSize="6" fill="rgba(34,211,238,0.55)" fontFamily="monospace">
                ⚡01
              </text>
              <text x="128" y="178" fontSize="5.5" fill="rgba(34,211,238,0.45)" fontFamily="monospace">
                v5.0
              </text>
              <text x="180" y="178" fontSize="5" fill="rgba(167,139,250,0.5)" fontFamily="monospace">
                FORGE-BOT
              </text>

              {/* EYES — big, bright, cursor-tracking */}
              <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                {/* Left eye */}
                <motion.g
                  animate={blink ? { scaleY: 0.08 } : { scaleY: 1 }}
                  transition={{ duration: 0.09 }}
                  style={{ transformOrigin: "153px 130px" }}
                >
                  <ellipse
                    cx="153"
                    cy="130"
                    rx="17"
                    ry="17"
                    fill="url(#eyeFill)"
                    filter="url(#bloom)"
                  />
                  <ellipse cx="153" cy="130" rx="8" ry="9" fill="#0c4a6e" />
                  <ellipse cx="156" cy="126" rx="3" ry="3.5" fill="white" />
                  <circle cx="159" cy="124" r="1.5" fill="white" opacity="0.9" />
                </motion.g>
                {/* Right eye */}
                <motion.g
                  animate={blink ? { scaleY: 0.08 } : { scaleY: 1 }}
                  transition={{ duration: 0.09 }}
                  style={{ transformOrigin: "207px 130px" }}
                >
                  <ellipse
                    cx="207"
                    cy="130"
                    rx="17"
                    ry="17"
                    fill="url(#eyeFill)"
                    filter="url(#bloom)"
                  />
                  <ellipse cx="207" cy="130" rx="8" ry="9" fill="#0c4a6e" />
                  <ellipse cx="210" cy="126" rx="3" ry="3.5" fill="white" />
                  <circle cx="213" cy="124" r="1.5" fill="white" opacity="0.9" />
                </motion.g>
              </motion.g>

              {/* SMILE — animated glowing curve */}
              <motion.path
                d="M 152 158 Q 180 170 208 158"
                stroke="#67e8f9"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
                animate={{ d: ["M 152 158 Q 180 170 208 158", "M 152 158 Q 180 172 208 158", "M 152 158 Q 180 170 208 158"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
              />

              {/* CHEEK BLUSHES — adds warmth */}
              <ellipse
                cx="130"
                cy="155"
                rx="9"
                ry="5"
                fill="rgba(244,114,182,0.45)"
                style={{ filter: "blur(2px)" }}
              />
              <ellipse
                cx="230"
                cy="155"
                rx="9"
                ry="5"
                fill="rgba(244,114,182,0.45)"
                style={{ filter: "blur(2px)" }}
              />
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════════
                NECK CONNECTOR
                ═══════════════════════════════════════════════════════════════ */}
            <rect x="160" y="206" width="40" height="16" rx="4" fill="url(#jointFill)" />
            <rect x="165" y="210" width="30" height="2" fill="rgba(34,211,238,0.55)" />

            {/* ═══════════════════════════════════════════════════════════════
                BODY — substantial, solid
                ═══════════════════════════════════════════════════════════════ */}
            <path
              d="M 112 222
                 Q 112 215 120 215
                 L 240 215
                 Q 248 215 248 222
                 L 248 320
                 Q 248 338 230 340
                 L 130 340
                 Q 112 338 112 320
                 Z"
              fill="url(#bodyFill)"
            />
            {/* Top-left highlight */}
            <path
              d="M 125 230 Q 165 220 200 220"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            <ellipse
              cx="145"
              cy="230"
              rx="20"
              ry="5"
              fill="rgba(255,255,255,0.25)"
              style={{ filter: "blur(3px)" }}
            />
            {/* Right rim light */}
            <path
              d="M 244 232 Q 248 232 248 244 L 248 312"
              stroke="url(#rimCyan)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
            />
            {/* Bottom inner shadow */}
            <path
              d="M 118 322 Q 180 340 242 322"
              stroke="rgba(0,0,0,0.35)"
              strokeWidth="7"
              strokeLinecap="round"
              fill="none"
            />

            {/* CHEST POWER CORE — the centerpiece */}
            <motion.g
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "180px 285px" }}
            >
              {/* Big outer pulsing ring */}
              <motion.circle
                cx="180"
                cy="285"
                r={pulse ? 34 : 28}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1"
                animate={{ opacity: [0.55, 0.15, 0.55] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Rotating dashed inner ring */}
              <motion.g
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "180px 285px" }}
              >
                <circle
                  cx="180"
                  cy="285"
                  r="23"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="0.9"
                  strokeDasharray="2 5"
                  opacity="0.65"
                />
              </motion.g>
              {/* Inner glass case */}
              <circle cx="180" cy="285" r="20" fill="rgba(15,23,42,0.6)" stroke="rgba(34,211,238,0.3)" strokeWidth="1" />
              {/* Core blob with strong glow */}
              <motion.circle
                cx="180"
                cy="285"
                r={pulse ? 17 : 14}
                fill="url(#coreFill)"
                animate={{ r: [13, 16, 13] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                filter="url(#strongBloom)"
              />
              {/* Lightning bolt symbol */}
              <path
                d="M 183 273 L 173 287 L 180 287 L 176 297 L 188 282 L 181 282 Z"
                fill="white"
                opacity="0.98"
                style={{ filter: "drop-shadow(0 0 4px white)" }}
              />
            </motion.g>

            {/* CHEST LED BAR — small but premium detail */}
            <rect x="155" y="318" width="50" height="4" rx="2" fill="rgba(15,23,42,0.6)" />
            <motion.rect
              x="157"
              y="319"
              width="46"
              height="2"
              fill="#22d3ee"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
            />

            {/* SHOULDER LIGHT PORTS */}
            <circle
              cx="128"
              cy="230"
              r="3"
              fill="#22d3ee"
              style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }}
            />
            <circle
              cx="232"
              cy="230"
              r="3"
              fill="#22d3ee"
              style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }}
            />

            {/* ═══════════════════════════════════════════════════════════════
                ARMS — articulated with shoulder + forearm + hand
                ═══════════════════════════════════════════════════════════════ */}
            {/* Left arm — still */}
            <g>
              {/* Shoulder */}
              <circle cx="100" cy="240" r="18" fill="url(#bodyFill)" />
              <ellipse
                cx="93"
                cy="234"
                rx="7"
                ry="4"
                fill="rgba(255,255,255,0.45)"
              />
              {/* Upper arm */}
              <path
                d="M 84 245 Q 78 268 84 295 L 108 295 Q 112 268 108 246 Z"
                fill="url(#bodyFill)"
              />
              {/* Elbow joint */}
              <ellipse cx="90" cy="300" rx="13" ry="9" fill="url(#jointFill)" />
              {/* Forearm */}
              <path
                d="M 80 305 Q 76 322 82 342 L 102 342 Q 104 322 100 304 Z"
                fill="url(#bodyFill)"
              />
              {/* Hand */}
              <circle cx="89" cy="352" r="13" fill="url(#bodyFill)" />
              <circle
                cx="89"
                cy="351"
                r="3.5"
                fill="#22d3ee"
                style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }}
              />
            </g>

            {/* Right arm — waves */}
            <motion.g
              animate={
                wave ? { rotate: [0, -35, -18, -35, -18, 0] } : { rotate: 0 }
              }
              transition={{ duration: 1.4, ease: "easeInOut" }}
              style={{ transformOrigin: "260px 240px" }}
            >
              <circle cx="260" cy="240" r="18" fill="url(#bodyFill)" />
              <ellipse
                cx="267"
                cy="234"
                rx="7"
                ry="4"
                fill="rgba(255,255,255,0.45)"
              />
              <path
                d="M 252 246 Q 248 268 252 295 L 276 295 Q 282 268 276 245 Z"
                fill="url(#bodyFill)"
              />
              <ellipse cx="270" cy="300" rx="13" ry="9" fill="url(#jointFill)" />
              <path
                d="M 260 305 Q 256 322 262 342 L 282 342 Q 286 322 280 304 Z"
                fill="url(#bodyFill)"
              />
              <circle cx="271" cy="352" r="13" fill="url(#bodyFill)" />
              <circle
                cx="271"
                cy="351"
                r="3.5"
                fill="#22d3ee"
                style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
              />
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════════
                FOREGROUND ORBITING RING — passes IN FRONT for 3D illusion
                ═══════════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
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
                opacity="0.55"
                strokeDasharray="90 600"
                style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.9))" }}
              />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating sparkles outside the SVG */}
      <FloatingSparkle delay={0} top="6%" left="6%" emoji="✨" />
      <FloatingSparkle delay={1.4} top="16%" right="4%" emoji="⚡" />
      <FloatingSparkle delay={2.8} bottom="22%" left="2%" emoji="✦" />
      <FloatingSparkle delay={1.8} bottom="14%" right="6%" emoji="✨" />
      <FloatingSparkle delay={0.8} top="40%" left="0%" emoji="·" />
      <FloatingSparkle delay={2.3} top="55%" right="0%" emoji="·" />
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
        fontSize: "15px",
        color: "#67e8f9",
        textShadow: "0 0 10px rgba(34,211,238,0.95)",
      }}
      animate={{
        y: [0, -16, 0],
        opacity: [0, 1, 0],
        scale: [0.4, 1.3, 0.4],
        rotate: [0, 35, 0],
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
