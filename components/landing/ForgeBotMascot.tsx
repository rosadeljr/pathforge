"use client";

/**
 * ForgeBot Mascot v7 — "EVE." Inspired by EVE from WALL·E.
 *
 * Design language (Apple-clean / Pixar):
 *   - Single pure-white egg-shaped body, smooth and continuous.
 *   - Large dark elliptical visor occupying ~80% of the head face.
 *   - Two simple blue LED eyes inside the visor (rectangular/dash shapes).
 *   - Detached floating arms — no visible joints, no connection to body.
 *   - No legs — the figure hovers.
 *   - Soft blue ambient glow underneath.
 *   - Minimal, futuristic, intelligent, capable.
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
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [10, -10]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-6, 6]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-2.5, 2.5]), springConfig);

  const [blink, setBlink] = useState(false);

  // Periodic blink — EVE's eyes briefly become thin lines
  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        schedule();
      }, 2500 + Math.random() * 4000);
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
      Array.from({ length: 10 }).map((_, i) => ({
        angle: (i / 10) * Math.PI * 2,
        delay: (i / 10) * 2.5,
        size: 1.5 + Math.random() * 1.2,
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
      {/* Soft blue ambient glow */}
      <motion.div
        animate={{ opacity: [0.55, 0.85, 0.55], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgba(59,130,246,0.45), rgba(34,211,238,0.18) 38%, transparent 65%)",
          filter: "blur(12px)",
        }}
      />

      {/* Idle hover bob */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Tilt to cursor */}
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
            style={{ filter: "drop-shadow(0 30px 50px rgba(59,130,246,0.45))" }}
          >
            <defs>
              {/* WHITE EGG BODY — soft top-light with cool shadow */}
              <radialGradient id="whiteBody" cx="35%" cy="18%" r="92%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#f1f5f9" />
                <stop offset="65%" stopColor="#cbd5e1" />
                <stop offset="100%" stopColor="#94a3b8" />
              </radialGradient>
              {/* Soft cool shadow on right side */}
              <linearGradient id="bodyShadow" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="60%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(15,23,42,0.22)" />
              </linearGradient>
              {/* Cyan rim on right edge */}
              <linearGradient id="rimCyan" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.7" />
                <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* VISOR — glossy black with subtle blue tint */}
              <radialGradient id="visorGlass" cx="30%" cy="30%" r="90%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="55%" stopColor="#0c0a1f" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              {/* EYE LED — bright electric blue */}
              <linearGradient id="eyeLED" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#bae6fd" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              {/* GROUND DISC GLOW */}
              <radialGradient id="discGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              {/* ORBIT RING */}
              <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="30%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#60a5fa" stopOpacity="1" />
                <stop offset="70%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <filter id="eyeBloom" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="b1" />
                <feGaussianBlur stdDeviation="7" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" />
              </filter>
            </defs>

            {/* ═══════════════════════════════════════════════════════════
                BACK ORBITING RING (sells the 3D depth)
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "180px 210px" }}
            >
              <ellipse
                cx="180"
                cy="210"
                rx="150"
                ry="38"
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="1.5"
                opacity="0.45"
                style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.5))" }}
              />
            </motion.g>

            {/* Orbit particles */}
            {orbitParticles.map((p, i) => {
              const cx = 180 + Math.cos(p.angle) * 148;
              const cy = 212 + Math.sin(p.angle) * 36;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={p.size}
                  fill="#22d3ee"
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 0.4] }}
                  transition={{
                    duration: 3,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                />
              );
            })}

            {/* ═══════════════════════════════════════════════════════════
                HOVER PLATFORM — soft glowing disc beneath (no legs!)
                ═══════════════════════════════════════════════════════════ */}
            <motion.ellipse
              cx="180"
              cy="370"
              rx="80"
              ry="11"
              fill="url(#discGlow)"
              animate={{ rx: [75, 85, 75], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "blur(8px)" }}
            />
            <ellipse
              cx="180"
              cy="372"
              rx="55"
              ry="5"
              fill="rgba(0,0,0,0.5)"
              style={{ filter: "blur(6px)" }}
            />
            <motion.ellipse
              cx="180"
              cy="370"
              rx="50"
              ry="3"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1"
              animate={{ opacity: [0.4, 0.9, 0.4], rx: [48, 56, 48] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 5px #3b82f6)" }}
            />

            {/* ═══════════════════════════════════════════════════════════
                EVE BODY — ONE continuous smooth egg shape
                Wider at top (head), narrows slightly mid-body,
                tapers to a rounded bottom that floats.
                ═══════════════════════════════════════════════════════════ */}
            {/* Subtle back-glow behind body */}
            <ellipse
              cx="180"
              cy="200"
              rx="98"
              ry="155"
              fill="rgba(59,130,246,0.18)"
              filter="url(#softGlow)"
            />

            {/* Main body — single smooth egg */}
            <path
              d="M 180 60
                 C 235 60 270 100 270 155
                 C 270 195 260 230 252 260
                 C 248 285 235 320 215 335
                 C 205 342 195 346 180 346
                 C 165 346 155 342 145 335
                 C 125 320 112 285 108 260
                 C 100 230 90 195 90 155
                 C 90 100 125 60 180 60 Z"
              fill="url(#whiteBody)"
            />
            {/* Right shadow overlay */}
            <path
              d="M 180 60
                 C 235 60 270 100 270 155
                 C 270 195 260 230 252 260
                 C 248 285 235 320 215 335
                 C 205 342 195 346 180 346
                 C 165 346 155 342 145 335
                 C 125 320 112 285 108 260
                 C 100 230 90 195 90 155
                 C 90 100 125 60 180 60 Z"
              fill="url(#bodyShadow)"
            />

            {/* Top-left specular highlight */}
            <ellipse
              cx="148"
              cy="95"
              rx="32"
              ry="12"
              fill="rgba(255,255,255,0.85)"
              style={{ filter: "blur(5px)" }}
            />
            <ellipse
              cx="140"
              cy="88"
              rx="14"
              ry="5"
              fill="white"
              style={{ filter: "blur(2px)" }}
            />

            {/* Right rim cyan light */}
            <path
              d="M 268 100 Q 273 155 264 220 Q 256 280 235 322"
              stroke="url(#rimCyan)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* Subtle body seam line (slim mid-divider — gives sense of construction) */}
            <path
              d="M 105 200 Q 180 215 255 200"
              stroke="rgba(15,23,42,0.07)"
              strokeWidth="1"
              fill="none"
            />

            {/* ═══════════════════════════════════════════════════════════
                VISOR — large dark elliptical face plate
                Takes up most of the upper body. THE iconic EVE feature.
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: [-0.5, 0.5, -0.5] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "180px 145px" }}
            >
              {/* Visor — slanted forward-leaning oval */}
              <ellipse
                cx="180"
                cy="145"
                rx="78"
                ry="55"
                fill="url(#visorGlass)"
              />
              {/* Top reflection arc — sells the glossy glass */}
              <path
                d="M 120 122 Q 180 100 240 122"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Highlight crescent top-left */}
              <ellipse
                cx="148"
                cy="118"
                rx="20"
                ry="4"
                fill="rgba(255,255,255,0.15)"
                style={{ filter: "blur(2px)" }}
              />
              {/* Subtle inner blue glow border */}
              <ellipse
                cx="180"
                cy="145"
                rx="74"
                ry="51"
                fill="none"
                stroke="rgba(59,130,246,0.18)"
                strokeWidth="1.5"
              />

              {/* ═══ EYES — simple blue LED dashes (EVE's signature) ═══ */}
              <motion.g style={{ x: eyeOffsetX }}>
                {/* Left eye — angled rounded rectangle */}
                <motion.g
                  animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ transformOrigin: "152px 145px" }}
                >
                  <rect
                    x="138"
                    y="138"
                    width="28"
                    height="14"
                    rx="7"
                    fill="url(#eyeLED)"
                    filter="url(#eyeBloom)"
                    transform="rotate(-8 152 145)"
                  />
                  <rect
                    x="142"
                    y="140"
                    width="20"
                    height="4"
                    rx="2"
                    fill="white"
                    opacity="0.85"
                    transform="rotate(-8 152 142)"
                  />
                </motion.g>

                {/* Right eye — mirrored */}
                <motion.g
                  animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ transformOrigin: "208px 145px" }}
                >
                  <rect
                    x="194"
                    y="138"
                    width="28"
                    height="14"
                    rx="7"
                    fill="url(#eyeLED)"
                    filter="url(#eyeBloom)"
                    transform="rotate(8 208 145)"
                  />
                  <rect
                    x="198"
                    y="140"
                    width="20"
                    height="4"
                    rx="2"
                    fill="white"
                    opacity="0.85"
                    transform="rotate(8 208 142)"
                  />
                </motion.g>
              </motion.g>
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                DETACHED FLOATING ARMS — Eve-signature
                No shoulders, no joints. They just hover beside the body.
                ═══════════════════════════════════════════════════════════ */}
            {/* Left arm — small floating pill */}
            <motion.g
              animate={{ y: [0, -4, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "70px 240px" }}
            >
              <ellipse
                cx="70"
                cy="240"
                rx="14"
                ry="26"
                fill="url(#whiteBody)"
              />
              {/* Right shadow */}
              <ellipse cx="70" cy="240" rx="14" ry="26" fill="url(#bodyShadow)" />
              {/* Top highlight */}
              <ellipse
                cx="65"
                cy="225"
                rx="6"
                ry="3"
                fill="rgba(255,255,255,0.7)"
                style={{ filter: "blur(2px)" }}
              />
            </motion.g>

            {/* Right arm — slightly offset timing for natural feel */}
            <motion.g
              animate={{ y: [0, -4, 0], rotate: [3, -3, 3] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              style={{ transformOrigin: "290px 240px" }}
            >
              <ellipse
                cx="290"
                cy="240"
                rx="14"
                ry="26"
                fill="url(#whiteBody)"
              />
              <ellipse cx="290" cy="240" rx="14" ry="26" fill="url(#bodyShadow)" />
              <ellipse
                cx="285"
                cy="225"
                rx="6"
                ry="3"
                fill="rgba(255,255,255,0.7)"
                style={{ filter: "blur(2px)" }}
              />
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                FOREGROUND ORBIT — passes IN FRONT for 3D depth
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "180px 210px" }}
            >
              <ellipse
                cx="180"
                cy="210"
                rx="150"
                ry="38"
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="2"
                opacity="0.55"
                strokeDasharray="80 600"
                style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.9))" }}
              />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Subtle ambient sparkles */}
      <FloatingSparkle delay={0} top="10%" left="8%" />
      <FloatingSparkle delay={1.6} top="20%" right="6%" />
      <FloatingSparkle delay={3} bottom="24%" left="4%" />
      <FloatingSparkle delay={2.2} bottom="16%" right="8%" />
    </div>
  );
}

function FloatingSparkle({
  delay,
  top,
  bottom,
  left,
  right,
}: {
  delay: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        top,
        bottom,
        left,
        right,
        fontSize: "11px",
        color: "#67e8f9",
        textShadow: "0 0 8px rgba(34,211,238,0.95)",
      }}
      animate={{
        y: [0, -14, 0],
        opacity: [0, 0.8, 0],
        scale: [0.4, 1.1, 0.4],
      }}
      transition={{
        duration: 3.5,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      ·
    </motion.div>
  );
}
