"use client";

/**
 * ForgeBot Mascot v3 — clean white Pixar-style robot.
 *
 * Inspired by the reference: a friendly white robot with a big dark
 * glassy visor, curved smile-shaped cyan eyes, stubby arms with grip
 * hands, and visible boots. Standing pose, slight charm tilt.
 *
 * Built with layered filled SVG paths + radial gradients for that
 * 3D-rendered look. No external 3D library — keeps the bundle tiny.
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
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [10, -10]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-6, 6]), springConfig);

  const [blink, setBlink] = useState(false);
  const [wave, setWave] = useState(false);

  // Random blink
  useEffect(() => {
    let timer: any;
    const schedule = () => {
      const delay = 2500 + Math.random() * 3500;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // Periodic wave
  useEffect(() => {
    let timer: any;
    const schedule = () => {
      timer = setTimeout(() => {
        setWave(true);
        setTimeout(() => setWave(false), 1400);
        schedule();
      }, 8000 + Math.random() * 4000);
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
        animate={{ opacity: [0.6, 0.85, 0.6], scale: [1, 1.08, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(99,102,241,0.35), rgba(34,211,238,0.15) 35%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />

      {/* Float */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
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
            viewBox="0 0 400 460"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.45))" }}
          >
            <defs>
              {/* White plastic body — soft top-light */}
              <radialGradient id="white1" cx="35%" cy="20%" r="90%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#f1f5f9" />
                <stop offset="80%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>
              {/* Helmet — slightly cooler */}
              <radialGradient id="helmet" cx="32%" cy="18%" r="85%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#f8fafc" />
                <stop offset="75%" stopColor="#dbeafe" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>
              {/* Dark visor */}
              <radialGradient id="visor" cx="30%" cy="25%" r="90%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="40%" stopColor="#0f172a" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              {/* Visor cyan rim glow */}
              <linearGradient id="visorRim" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
              </linearGradient>
              {/* Eye glow */}
              <radialGradient id="eyeGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#a5f3fc" />
                <stop offset="70%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
              </radialGradient>
              {/* Dark joint */}
              <radialGradient id="joint" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="60%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              {/* Chest screen */}
              <radialGradient id="screen" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#020617" />
              </radialGradient>
              {/* Soft shadow on bottom of round shapes */}
              <linearGradient id="bottomShade" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="60%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(15,23,42,0.18)" />
              </linearGradient>
              {/* Eye bloom filter */}
              <filter id="bloom" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ─── GROUND SHADOW ─── */}
            <ellipse cx="200" cy="430" rx="95" ry="9" fill="rgba(0,0,0,0.45)" style={{ filter: "blur(6px)" }} />
            <ellipse cx="200" cy="428" rx="70" ry="5" fill="rgba(99,102,241,0.4)" style={{ filter: "blur(10px)" }} />

            {/* ─── LEGS ─── (drawn first so they're behind the body) */}
            {/* Left thigh */}
            <path d="M 165 350 Q 162 365 165 380 L 178 380 Q 180 365 178 350 Z" fill="url(#joint)" />
            {/* Right thigh */}
            <path d="M 222 350 Q 220 365 222 380 L 235 380 Q 238 365 235 350 Z" fill="url(#joint)" />

            {/* Left boot */}
            <path
              d="M 152 380 Q 148 390 150 405 Q 152 420 168 422 L 192 422 Q 198 420 198 408 L 198 388 Q 196 378 188 376 L 162 376 Q 154 376 152 380 Z"
              fill="url(#white1)"
            />
            {/* Left boot top highlight */}
            <path d="M 158 386 Q 175 380 192 384" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" />
            {/* Left boot dark sole */}
            <path d="M 152 412 Q 175 419 198 412 L 198 422 L 152 422 Z" fill="#1e293b" />

            {/* Right boot */}
            <path
              d="M 208 376 Q 200 376 200 388 L 200 408 Q 200 420 206 422 L 232 422 Q 248 420 250 405 Q 252 390 248 380 Q 246 376 238 376 Z"
              fill="url(#white1)"
            />
            <path d="M 208 384 Q 225 380 242 386" stroke="rgba(255,255,255,0.7)" strokeWidth="2" fill="none" strokeLinecap="round" />
            <path d="M 202 412 Q 225 419 248 412 L 248 422 L 202 422 Z" fill="#1e293b" />

            {/* ─── BODY ─── */}
            {/* Main torso — rounded rectangle */}
            <path
              d="M 138 235
                 Q 138 220 152 218
                 L 248 218
                 Q 262 220 262 235
                 L 262 340
                 Q 262 358 244 360
                 L 156 360
                 Q 138 358 138 340
                 Z"
              fill="url(#white1)"
            />
            {/* Body top highlight */}
            <path d="M 152 232 Q 200 222 248 232" stroke="rgba(255,255,255,0.8)" strokeWidth="3" fill="none" strokeLinecap="round" />
            {/* Body bottom shadow */}
            <path
              d="M 138 235 Q 138 220 152 218 L 248 218 Q 262 220 262 235 L 262 340 Q 262 358 244 360 L 156 360 Q 138 358 138 340 Z"
              fill="url(#bottomShade)"
            />

            {/* Chest screen */}
            <rect x="170" y="265" width="60" height="40" rx="6" fill="url(#screen)" />
            {/* Screen glow line */}
            <line
              x1="178"
              y1="285"
              x2="222"
              y2="285"
              stroke="#22d3ee"
              strokeWidth="1.5"
              opacity="0.6"
              style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
            />
            {/* Power core under screen */}
            <motion.circle
              cx="200"
              cy="330"
              r="6"
              fill="#22d3ee"
              animate={{ opacity: [0.7, 1, 0.7], r: [5, 7, 5] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
            />

            {/* Side details on body */}
            <circle cx="148" cy="280" r="3" fill="#22d3ee" opacity="0.7" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />
            <circle cx="252" cy="280" r="3" fill="#22d3ee" opacity="0.7" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />

            {/* ─── ARMS ─── */}
            {/* Left arm (always still) */}
            {/* Shoulder */}
            <circle cx="132" cy="245" r="20" fill="url(#white1)" />
            <circle cx="128" cy="240" r="6" fill="rgba(255,255,255,0.6)" />
            {/* Upper arm */}
            <path
              d="M 116 250 Q 110 270 112 295 L 132 298 Q 136 270 138 252 Z"
              fill="url(#white1)"
            />
            {/* Elbow joint */}
            <ellipse cx="118" cy="298" rx="13" ry="10" fill="url(#joint)" />
            {/* Forearm */}
            <path
              d="M 108 305 Q 102 320 105 340 L 128 342 Q 132 320 128 302 Z"
              fill="url(#white1)"
            />
            {/* Hand (left) */}
            <g>
              <ellipse cx="115" cy="350" rx="14" ry="12" fill="url(#white1)" />
              {/* Finger details */}
              <rect x="104" y="346" width="4" height="10" rx="2" fill="url(#joint)" />
              <rect x="123" y="346" width="4" height="10" rx="2" fill="url(#joint)" />
              <rect x="113" y="354" width="4" height="9" rx="2" fill="url(#joint)" />
            </g>

            {/* Right arm (waves periodically) */}
            <motion.g
              animate={
                wave
                  ? { rotate: [0, -35, -20, -35, -20, 0] }
                  : { rotate: 0 }
              }
              transition={{ duration: 1.4, ease: "easeInOut" }}
              style={{ transformOrigin: "268px 245px" }}
            >
              {/* Shoulder */}
              <circle cx="268" cy="245" r="20" fill="url(#white1)" />
              <circle cx="272" cy="240" r="6" fill="rgba(255,255,255,0.6)" />
              {/* Upper arm */}
              <path
                d="M 262 252 Q 260 270 264 295 L 284 295 Q 290 270 284 250 Z"
                fill="url(#white1)"
              />
              {/* Elbow */}
              <ellipse cx="282" cy="298" rx="13" ry="10" fill="url(#joint)" />
              {/* Forearm */}
              <path
                d="M 272 302 Q 268 320 272 340 L 295 340 Q 298 320 292 305 Z"
                fill="url(#white1)"
              />
              {/* Hand (right) */}
              <g>
                <ellipse cx="285" cy="350" rx="14" ry="12" fill="url(#white1)" />
                <rect x="273" y="346" width="4" height="10" rx="2" fill="url(#joint)" />
                <rect x="292" y="346" width="4" height="10" rx="2" fill="url(#joint)" />
                <rect x="283" y="354" width="4" height="9" rx="2" fill="url(#joint)" />
                {/* Palm cyan glow */}
                <circle cx="285" cy="350" r="3" fill="#22d3ee" opacity="0.85" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
              </g>
            </motion.g>

            {/* ─── NECK PIECE ─── (small connector) */}
            <rect x="183" y="208" width="34" height="14" rx="3" fill="url(#joint)" />

            {/* ─── HEAD / HELMET ─── */}
            {/* Subtle head tilt for charm */}
            <motion.g
              animate={{ rotate: [-1.5, 1.5, -1.5] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "200px 130px" }}
            >
              {/* Main helmet — egg shape, wider at top */}
              <ellipse cx="200" cy="130" rx="88" ry="88" fill="url(#helmet)" />
              {/* Bottom shadow on helmet */}
              <ellipse cx="200" cy="130" rx="88" ry="88" fill="url(#bottomShade)" />
              {/* Helmet top-left specular highlight */}
              <ellipse
                cx="170"
                cy="80"
                rx="38"
                ry="22"
                fill="rgba(255,255,255,0.85)"
                style={{ filter: "blur(4px)" }}
              />
              {/* Smaller pinpoint highlight */}
              <ellipse cx="158" cy="72" rx="10" ry="6" fill="white" style={{ filter: "blur(2px)" }} />

              {/* Right earpiece — round dark sensor */}
              <circle cx="278" cy="135" r="22" fill="url(#joint)" />
              <circle cx="278" cy="135" r="14" fill="#020617" />
              <circle cx="272" cy="129" r="3" fill="rgba(255,255,255,0.3)" />
              {/* Inner LED */}
              <motion.circle
                cx="278"
                cy="135"
                r="3"
                fill="#22d3ee"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
              />

              {/* Left earpiece — partial visible */}
              <ellipse cx="122" cy="135" rx="12" ry="20" fill="url(#joint)" />

              {/* ─── VISOR ─── large dark glassy panel */}
              <path
                d="M 138 110
                   Q 138 95 155 92
                   L 245 92
                   Q 262 95 262 110
                   L 262 160
                   Q 262 180 245 182
                   L 155 182
                   Q 138 180 138 160
                   Z"
                fill="url(#visor)"
              />
              {/* Visor top reflection */}
              <path
                d="M 148 102 Q 200 96 252 102"
                stroke="url(#visorRim)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              {/* Visor subtle inner glow */}
              <path
                d="M 145 110 Q 145 100 158 98 L 242 98 Q 255 100 255 110 L 255 158 Q 255 174 242 176 L 158 176 Q 145 174 145 158 Z"
                fill="none"
                stroke="rgba(34,211,238,0.08)"
                strokeWidth="2"
              />

              {/* ─── EYES ─── curved happy-style cyan eyes */}
              <motion.g animate={blink ? { scaleY: 0.08 } : { scaleY: 1 }} transition={{ duration: 0.08 }} style={{ transformOrigin: "200px 140px" }}>
                {/* Left eye — upward curving crescent (like smiling eye ‿) */}
                <path
                  d="M 162 142 Q 170 128 188 132 Q 186 138 180 138 Q 172 138 165 144 Z"
                  fill="url(#eyeGlow)"
                  filter="url(#bloom)"
                />
                {/* Right eye */}
                <path
                  d="M 212 132 Q 230 128 238 142 Q 235 144 228 138 Q 220 138 214 138 Z"
                  fill="url(#eyeGlow)"
                  filter="url(#bloom)"
                />
                {/* Bright eye centers (the "pupil" shine) */}
                <ellipse cx="175" cy="136" rx="6" ry="3" fill="white" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
                <ellipse cx="225" cy="136" rx="6" ry="3" fill="white" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
                {/* Brighter highlights */}
                <circle cx="178" cy="135" r="1.5" fill="white" />
                <circle cx="228" cy="135" r="1.5" fill="white" />
              </motion.g>

              {/* Small antenna on top */}
              <line x1="200" y1="45" x2="200" y2="25" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
              <motion.circle
                cx="200"
                cy="22"
                r="5"
                fill="#22d3ee"
                animate={{ r: [4, 6, 4] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 8px #22d3ee)" }}
              />

              {/* Subtle HUD readouts on visor */}
              <text x="247" y="116" fontSize="6" fill="rgba(34,211,238,0.5)" fontFamily="monospace">
                ⚡
              </text>
              <text x="148" y="173" fontSize="5.5" fill="rgba(34,211,238,0.4)" fontFamily="monospace">
                v3.0
              </text>
            </motion.g>
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
