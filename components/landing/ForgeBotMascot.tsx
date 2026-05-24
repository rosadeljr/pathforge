"use client";

/**
 * ForgeBot Mascot v4 — bold, friendly, clearly visible on dark.
 *
 * Lesson learned from v3: pure-white gradients vanish against a dark
 * background. v4 uses saturated indigo/violet body + cyan accents that
 * pop clearly. Sleek, cohesive silhouette. No floating parts.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  className?: string;
}

export function ForgeBotMascot({ size = 340, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 80, damping: 14, mass: 0.6 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [12, -12]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-7, 7]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-4, 4]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-2, 2]), springConfig);

  const [blink, setBlink] = useState(false);
  const [wave, setWave] = useState(false);

  useEffect(() => {
    let timer: any;
    const schedule = () => {
      const delay = 2200 + Math.random() * 3000;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 120);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    let timer: any;
    const schedule = () => {
      timer = setTimeout(() => {
        setWave(true);
        setTimeout(() => setWave(false), 1300);
        schedule();
      }, 7500 + Math.random() * 4000);
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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, perspective: "1200px" }}
    >
      {/* Ambient halo */}
      <motion.div
        animate={{ opacity: [0.65, 0.9, 0.65], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(99,102,241,0.45), rgba(34,211,238,0.18) 35%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />

      {/* Float */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
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
            viewBox="0 0 320 360"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 24px 40px rgba(99,102,241,0.4))" }}
          >
            <defs>
              {/* Body indigo-violet — clearly visible on dark */}
              <linearGradient id="body" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="40%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </linearGradient>
              {/* Head — slightly cooler/brighter */}
              <linearGradient id="head" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#c7d2fe" />
                <stop offset="40%" stopColor="#a5b4fc" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
              {/* Visor — deep dark with cyan tint */}
              <linearGradient id="visor" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="60%" stopColor="#0c0a1f" />
                <stop offset="100%" stopColor="#000000" />
              </linearGradient>
              {/* Joint — darker */}
              <linearGradient id="joint" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="#3730a3" />
                <stop offset="100%" stopColor="#1e1b4b" />
              </linearGradient>
              {/* Eye glow */}
              <radialGradient id="eyeGlow" cx="50%" cy="50%" r="55%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#a5f3fc" />
                <stop offset="70%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
              </radialGradient>
              {/* Power core */}
              <radialGradient id="core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef9c3" />
                <stop offset="30%" stopColor="#fbbf24" />
                <stop offset="80%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#78350f" stopOpacity="0" />
              </radialGradient>
              {/* Antenna */}
              <radialGradient id="ant" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#a16207" stopOpacity="0" />
              </radialGradient>
              {/* Bloom filter */}
              <filter id="bloom" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Strong bloom for core */}
              <filter id="strongBloom" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="6" result="b1" />
                <feGaussianBlur stdDeviation="14" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* GROUND SHADOW */}
            <ellipse cx="160" cy="335" rx="75" ry="7" fill="rgba(0,0,0,0.55)" style={{ filter: "blur(6px)" }} />
            <ellipse cx="160" cy="333" rx="55" ry="4" fill="rgba(99,102,241,0.45)" style={{ filter: "blur(10px)" }} />

            {/* ─── ANTENNA ─── */}
            <line x1="160" y1="62" x2="160" y2="32" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
            {/* Pulsing rings */}
            <motion.circle
              cx="160"
              cy="28"
              r="8"
              fill="none"
              stroke="#facc15"
              strokeWidth="1"
              animate={{ r: [6, 18, 6], opacity: [0.8, 0, 0.8] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
            />
            <motion.circle
              cx="160"
              cy="28"
              r="6"
              fill="url(#ant)"
              animate={{ r: [5, 7, 5] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 10px #facc15)" }}
            />

            {/* ─── HEAD ─── solid pill shape */}
            <motion.g
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "160px 110px" }}
            >
              {/* Head body */}
              <path
                d="M 90 70
                   Q 90 56 105 56
                   L 215 56
                   Q 230 56 230 70
                   L 230 158
                   Q 230 172 215 172
                   L 105 172
                   Q 90 172 90 158
                   Z"
                fill="url(#head)"
              />
              {/* Top-left specular highlight */}
              <path
                d="M 102 72 Q 130 60 175 60"
                stroke="rgba(255,255,255,0.5)"
                strokeWidth="3"
                strokeLinecap="round"
                fill="none"
              />
              {/* Bottom shadow line */}
              <path
                d="M 100 162 Q 160 175 220 162"
                stroke="rgba(15,23,42,0.35)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />

              {/* VISOR */}
              <path
                d="M 110 82
                   Q 110 74 120 74
                   L 200 74
                   Q 210 74 210 82
                   L 210 142
                   Q 210 154 198 154
                   L 122 154
                   Q 110 154 110 142
                   Z"
                fill="url(#visor)"
              />
              {/* Visor top reflection */}
              <path
                d="M 118 82 Q 160 78 202 82"
                stroke="rgba(34,211,238,0.4)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Inner cyan glow border */}
              <path
                d="M 114 82 Q 114 76 122 76 L 198 76 Q 206 76 206 82 L 206 142 Q 206 150 196 150 L 124 150 Q 114 150 114 142 Z"
                fill="none"
                stroke="rgba(34,211,238,0.15)"
                strokeWidth="1.5"
              />

              {/* EYES — bright cyan curved smiles */}
              <motion.g
                style={{ x: eyeOffsetX, y: eyeOffsetY }}
                animate={blink ? { scaleY: 0.1 } : { scaleY: 1 }}
                transition={{ duration: 0.1 }}
              >
                {/* Left eye — upward curve */}
                <path
                  d="M 130 118 Q 142 105 156 118 Q 152 124 144 122 Q 136 122 130 118 Z"
                  fill="url(#eyeGlow)"
                  filter="url(#bloom)"
                />
                {/* Right eye */}
                <path
                  d="M 164 118 Q 178 105 190 118 Q 184 122 176 122 Q 168 124 164 118 Z"
                  fill="url(#eyeGlow)"
                  filter="url(#bloom)"
                />
                {/* Inner shine */}
                <ellipse cx="143" cy="115" rx="5" ry="3" fill="white" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
                <ellipse cx="177" cy="115" rx="5" ry="3" fill="white" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
              </motion.g>

              {/* Small HUD details */}
              <text x="195" y="95" fontSize="6" fill="rgba(34,211,238,0.6)" fontFamily="monospace">⚡</text>
              <text x="118" y="146" fontSize="5" fill="rgba(34,211,238,0.45)" fontFamily="monospace">v4.0</text>

              {/* Right ear sensor */}
              <circle cx="232" cy="115" r="14" fill="url(#joint)" />
              <circle cx="232" cy="115" r="9" fill="#020617" />
              <motion.circle
                cx="232"
                cy="115"
                r="3"
                fill="#22d3ee"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.8, repeat: Infinity }}
                style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
              />
              {/* Left ear sensor */}
              <ellipse cx="86" cy="115" rx="7" ry="13" fill="url(#joint)" />
            </motion.g>

            {/* ─── NECK ─── small connector */}
            <rect x="146" y="170" width="28" height="12" rx="3" fill="url(#joint)" />

            {/* ─── ARMS ─── */}
            {/* Left arm */}
            <g>
              {/* Shoulder ball */}
              <circle cx="80" cy="195" r="16" fill="url(#body)" />
              <ellipse cx="76" cy="190" rx="6" ry="4" fill="rgba(255,255,255,0.3)" />
              {/* Upper arm */}
              <path d="M 68 200 Q 64 215 68 235 L 92 235 Q 96 215 92 200 Z" fill="url(#body)" />
              {/* Hand */}
              <circle cx="80" cy="245" r="13" fill="url(#body)" />
              <circle cx="80" cy="244" r="3" fill="#22d3ee" opacity="0.85" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
            </g>

            {/* Right arm — waves */}
            <motion.g
              animate={wave ? { rotate: [0, -30, -15, -30, -15, 0] } : { rotate: 0 }}
              transition={{ duration: 1.4, ease: "easeInOut" }}
              style={{ transformOrigin: "240px 195px" }}
            >
              {/* Shoulder ball */}
              <circle cx="240" cy="195" r="16" fill="url(#body)" />
              <ellipse cx="244" cy="190" rx="6" ry="4" fill="rgba(255,255,255,0.3)" />
              {/* Upper arm */}
              <path d="M 228 200 Q 224 215 228 235 L 252 235 Q 256 215 252 200 Z" fill="url(#body)" />
              {/* Hand */}
              <circle cx="240" cy="245" r="13" fill="url(#body)" />
              <circle cx="240" cy="244" r="3" fill="#22d3ee" opacity="0.85" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
            </motion.g>

            {/* ─── BODY ─── */}
            <path
              d="M 100 185
                 Q 100 178 108 178
                 L 212 178
                 Q 220 178 220 185
                 L 220 280
                 Q 220 295 205 298
                 L 115 298
                 Q 100 295 100 280
                 Z"
              fill="url(#body)"
            />
            {/* Top highlight */}
            <path d="M 112 192 Q 145 184 175 184" stroke="rgba(255,255,255,0.45)" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Right rim light */}
            <path d="M 215 195 L 215 270" stroke="rgba(34,211,238,0.35)" strokeWidth="2" strokeLinecap="round" fill="none" />
            {/* Bottom shadow */}
            <path d="M 105 280 Q 160 296 215 280" stroke="rgba(15,23,42,0.3)" strokeWidth="6" strokeLinecap="round" fill="none" />

            {/* Chest power core */}
            <motion.g
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "160px 240px" }}
            >
              {/* Outer ring */}
              <circle cx="160" cy="240" r="28" fill="rgba(15,23,42,0.4)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" />
              {/* Core glow */}
              <motion.circle
                cx="160"
                cy="240"
                r="16"
                fill="url(#core)"
                animate={{ r: [14, 18, 14] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                filter="url(#strongBloom)"
              />
              {/* Lightning bolt */}
              <path
                d="M 162 230 L 154 244 L 159 244 L 156 254 L 165 240 L 160 240 Z"
                fill="white"
                opacity="0.95"
              />
            </motion.g>

            {/* Shoulder light ports */}
            <circle cx="115" cy="190" r="2.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
            <circle cx="205" cy="190" r="2.5" fill="#22d3ee" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating sparkles */}
      <FloatingSparkle delay={0} top="8%" left="6%" emoji="✨" />
      <FloatingSparkle delay={1.5} top="18%" right="4%" emoji="⚡" />
      <FloatingSparkle delay={3} bottom="22%" left="2%" emoji="✦" />
      <FloatingSparkle delay={2} bottom="14%" right="6%" emoji="✨" />
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
