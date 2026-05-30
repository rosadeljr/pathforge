"use client";

/**
 * ForgeBot Mascot v9 — "EVE Captivating."
 *
 * v8 was rendering as a washed-out blue blob — the body gradient was
 * ending at slate-700 which becomes invisible on dark backgrounds.
 *
 * v9 fixes:
 *   - PURE WHITE solid body that pops crisply against dark
 *   - Strong dramatic lighting (top-left specular, right cyan rim,
 *     bottom shadow)
 *   - Dark crisp visor with cyan inner glow border
 *   - Bigger, brighter happy eye arcs ^_^ with multi-layer bloom
 *   - Animated scan lines across visor (futuristic HUD)
 *   - Concentric pulse rings emanating from hover disc
 *   - Holographic data points orbiting
 *   - Energy beam projection upward from antenna
 *   - Soft pink cheek glow for approachability
 *   - Detached floating arms with proper weight
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  className?: string;
}

export function ForgeBotMascot({ size = 380, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 70, damping: 14, mass: 0.7 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [12, -12]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-7, 7]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-3, 3]), springConfig);

  const [blink, setBlink] = useState(false);
  const [armWave, setArmWave] = useState(false);

  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 110);
        schedule();
      }, 2800 + Math.random() * 3800);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let t: any;
    const schedule = () => {
      t = setTimeout(() => {
        setArmWave(true);
        setTimeout(() => setArmWave(false), 1400);
        schedule();
      }, 7000 + Math.random() * 4000);
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
      Array.from({ length: 16 }).map((_, i) => ({
        angle: (i / 16) * Math.PI * 2,
        delay: (i / 16) * 2.5,
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
      style={{
        // Identical rendering on web + mobile. The SVG keeps its 400:440
        // intrinsic aspect ratio via preserveAspectRatio="xMidYMid meet".
        // On narrow screens we clamp to 90vw so it never overflows.
        width: `clamp(240px, 90vw, ${size}px)`,
        // height auto = SVG controls its own intrinsic height (matches the
        // 400:440 viewBox ratio). This is the key — forcing 1:1 here was
        // distorting the rendered bot vs. desktop.
        perspective: "1400px",
      }}
    >
      {/* OUTER ring halo only — does NOT wash over body */}
      <motion.div
        animate={{ opacity: [0.5, 0.75, 0.5], scale: [1, 1.06, 1] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 28%, rgba(34,211,238,0.35) 42%, rgba(124,58,237,0.22) 62%, transparent 78%)",
          filter: "blur(22px)",
        }}
      />

      <motion.div
        animate={{ y: [0, -12, 0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%" }}
      >
        <motion.div
          style={{
            rotateY,
            rotateX,
            transformStyle: "preserve-3d",
            width: "100%",
          }}
        >
          <svg
            viewBox="0 0 400 440"
            width="100%"
            height="auto"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: "block",
              filter: "drop-shadow(0 30px 60px rgba(34,211,238,0.45))",
            }}
          >
            <defs>
              {/* ═══ PURE WHITE BODY — bright + crisp, NOT washed out ═══ */}
              <radialGradient id="whiteBody" cx="32%" cy="14%" r="80%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#f8fafc" />
                <stop offset="75%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </radialGradient>
              {/* Right shadow overlay */}
              <linearGradient id="bodyShadow" x1="25%" y1="0%" x2="100%" y2="70%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="55%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(30,41,59,0.35)" />
              </linearGradient>
              {/* Strong cyan rim right side */}
              <linearGradient id="rimCyan" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.55" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* DEEP DARK VISOR */}
              <radialGradient id="visorGlass" cx="30%" cy="25%" r="90%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="45%" stopColor="#0c0a1f" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              {/* EYE LED — electric blue */}
              <linearGradient id="eyeLED" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#a5f3fc" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              {/* HOVER DISC */}
              <radialGradient id="discGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              {/* ORBIT RING */}
              <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="30%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="1" />
                <stop offset="70%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>

              {/* Filters */}
              <filter id="eyeBloom" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="b1" />
                <feGaussianBlur stdDeviation="8" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Clip path for scan lines (only visible inside visor) */}
              <clipPath id="visorClip">
                <ellipse cx="200" cy="158" rx="86" ry="60" />
              </clipPath>
            </defs>

            {/* ═══════════════════════════════════════════════════════════
                BACK ORBIT (behind body)
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 240px" }}
            >
              <ellipse
                cx="200"
                cy="240"
                rx="172"
                ry="46"
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="2"
                opacity="0.6"
                style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.8))" }}
              />
              <ellipse
                cx="200"
                cy="248"
                rx="155"
                ry="40"
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="1"
                opacity="0.4"
                strokeDasharray="3 8"
              />
            </motion.g>

            {/* Floating data particles */}
            {orbitParticles.map((p, i) => {
              const cx = 200 + Math.cos(p.angle) * 170;
              const cy = 242 + Math.sin(p.angle) * 44;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={p.size}
                  fill="#22d3ee"
                  animate={{ opacity: [0, 1, 0], scale: [0.4, 1.6, 0.4] }}
                  transition={{
                    duration: 2.8,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
                />
              );
            })}

            {/* ═══════════════════════════════════════════════════════════
                HOVER PLATFORM — animated holo disc
                ═══════════════════════════════════════════════════════════ */}
            <motion.ellipse
              cx="200"
              cy="402"
              rx="92"
              ry="13"
              fill="url(#discGlow)"
              animate={{ rx: [88, 100, 88], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "blur(8px)" }}
            />
            <ellipse
              cx="200"
              cy="404"
              rx="62"
              ry="6"
              fill="rgba(0,0,0,0.65)"
              style={{ filter: "blur(7px)" }}
            />
            {/* Two breathing rings + outer pulse */}
            <motion.ellipse
              cx="200"
              cy="400"
              rx="60"
              ry="4"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.3"
              animate={{ rx: [54, 68, 54], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
            />
            <motion.ellipse
              cx="200"
              cy="400"
              rx="42"
              ry="3"
              fill="none"
              stroke="#67e8f9"
              strokeWidth="0.9"
              animate={{ rx: [36, 50, 36], opacity: [0.4, 0.9, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
            <motion.ellipse
              cx="200"
              cy="400"
              rx="78"
              ry="6"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="0.7"
              animate={{ rx: [70, 90, 70], opacity: [0, 0.6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />

            {/* ═══════════════════════════════════════════════════════════
                EVE BODY — pure white solid egg, dramatic lighting
                ═══════════════════════════════════════════════════════════ */}
            <g style={{ filter: "drop-shadow(0 14px 32px rgba(0,0,0,0.5))" }}>
              <path
                d="M 200 70
                   C 258 70 295 110 295 168
                   C 295 210 285 250 277 282
                   C 273 308 258 345 235 360
                   C 224 367 213 372 200 372
                   C 187 372 176 367 165 360
                   C 142 345 127 308 123 282
                   C 115 250 105 210 105 168
                   C 105 110 142 70 200 70 Z"
                fill="url(#whiteBody)"
              />
              {/* Right shadow */}
              <path
                d="M 200 70
                   C 258 70 295 110 295 168
                   C 295 210 285 250 277 282
                   C 273 308 258 345 235 360
                   C 224 367 213 372 200 372
                   C 187 372 176 367 165 360
                   C 142 345 127 308 123 282
                   C 115 250 105 210 105 168
                   C 105 110 142 70 200 70 Z"
                fill="url(#bodyShadow)"
              />
            </g>

            {/* TOP-LEFT bright specular highlight (sells 3D form) */}
            <ellipse
              cx="160"
              cy="96"
              rx="42"
              ry="15"
              fill="rgba(255,255,255,0.95)"
              style={{ filter: "blur(7px)" }}
            />
            <ellipse
              cx="150"
              cy="90"
              rx="18"
              ry="6"
              fill="white"
              style={{ filter: "blur(2px)" }}
            />

            {/* Right side cyan rim light */}
            <path
              d="M 292 105 Q 297 168 290 240 Q 282 305 258 348"
              stroke="url(#rimCyan)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />

            {/* Bottom subtle shadow curve */}
            <path
              d="M 130 350 Q 200 365 270 350"
              stroke="rgba(15,23,42,0.22)"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
            />

            {/* ═══════════════════════════════════════════════════════════
                VISOR — large dark glassy plate with HOLOGRAPHIC scan lines
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: [-0.6, 0.6, -0.6] }}
              transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "200px 158px" }}
            >
              <ellipse
                cx="200"
                cy="158"
                rx="86"
                ry="60"
                fill="url(#visorGlass)"
              />

              {/* HOLO scan lines (clipped to visor shape) */}
              <g clipPath="url(#visorClip)" opacity="0.18">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <line
                    key={i}
                    x1="114"
                    x2="286"
                    y1={110 + i * 17}
                    y2={110 + i * 17}
                    stroke="#22d3ee"
                    strokeWidth="0.5"
                  />
                ))}
                {/* Animated scan line sweeping down */}
                <motion.line
                  x1="114"
                  x2="286"
                  stroke="#67e8f9"
                  strokeWidth="1.2"
                  animate={{ y1: [100, 215, 100], y2: [100, 215, 100], opacity: [0, 0.8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                />
              </g>

              {/* Top glossy reflection arc */}
              <path
                d="M 132 134 Q 200 110 268 134"
                stroke="rgba(255,255,255,0.32)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* Top-left highlight crescent */}
              <ellipse
                cx="160"
                cy="128"
                rx="24"
                ry="5"
                fill="rgba(255,255,255,0.3)"
                style={{ filter: "blur(2px)" }}
              />

              {/* Cyan inner glow border */}
              <ellipse
                cx="200"
                cy="158"
                rx="82"
                ry="56"
                fill="none"
                stroke="rgba(34,211,238,0.45)"
                strokeWidth="2"
              />
              {/* Outer cyan edge */}
              <ellipse
                cx="200"
                cy="158"
                rx="88"
                ry="62"
                fill="none"
                stroke="rgba(34,211,238,0.55)"
                strokeWidth="1"
              />

              {/* Soft pink cheek glow on visor — adds warmth */}
              <ellipse
                cx="135"
                cy="182"
                rx="18"
                ry="8"
                fill="rgba(244,114,182,0.4)"
                style={{ filter: "blur(5px)" }}
              />
              <ellipse
                cx="265"
                cy="182"
                rx="18"
                ry="8"
                fill="rgba(244,114,182,0.4)"
                style={{ filter: "blur(5px)" }}
              />

              {/* Micro HUD readout */}
              <text
                x="252"
                y="120"
                fontSize="5.5"
                fill="rgba(34,211,238,0.7)"
                fontFamily="monospace"
              >
                ⚡
              </text>
              <text
                x="138"
                y="208"
                fontSize="5"
                fill="rgba(34,211,238,0.55)"
                fontFamily="monospace"
              >
                ONLINE
              </text>

              {/* ═══ HAPPY EYES — bright arcs with multi-layer bloom ═══ */}
              <motion.g style={{ x: eyeOffsetX }}>
                {/* Left eye */}
                <motion.g
                  animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ transformOrigin: "170px 162px" }}
                >
                  {/* Outer glow */}
                  <path
                    d="M 142 168 Q 170 134 198 168"
                    stroke="#22d3ee"
                    strokeWidth="22"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#eyeBloom)"
                    opacity="0.7"
                  />
                  {/* Middle bright */}
                  <path
                    d="M 146 166 Q 170 140 194 166"
                    stroke="url(#eyeLED)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Inner white core */}
                  <path
                    d="M 150 164 Q 170 144 190 164"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Shine */}
                  <circle cx="162" cy="152" r="2.5" fill="white" />
                </motion.g>

                {/* Right eye */}
                <motion.g
                  animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ transformOrigin: "230px 162px" }}
                >
                  <path
                    d="M 202 168 Q 230 134 258 168"
                    stroke="#22d3ee"
                    strokeWidth="22"
                    strokeLinecap="round"
                    fill="none"
                    filter="url(#eyeBloom)"
                    opacity="0.7"
                  />
                  <path
                    d="M 206 166 Q 230 140 254 166"
                    stroke="url(#eyeLED)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <path
                    d="M 210 164 Q 230 144 250 164"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="222" cy="152" r="2.5" fill="white" />
                </motion.g>
              </motion.g>

              {/* Soft smile glow */}
              <ellipse
                cx="200"
                cy="196"
                rx="22"
                ry="3"
                fill="rgba(103,232,249,0.6)"
                style={{ filter: "blur(2px)" }}
              />
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                DETACHED FLOATING ARMS
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "75px 262px" }}
            >
              <g style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}>
                <ellipse cx="75" cy="262" rx="16" ry="30" fill="url(#whiteBody)" />
                <ellipse cx="75" cy="262" rx="16" ry="30" fill="url(#bodyShadow)" />
                <ellipse
                  cx="69"
                  cy="245"
                  rx="7"
                  ry="3.5"
                  fill="rgba(255,255,255,0.9)"
                  style={{ filter: "blur(1.5px)" }}
                />
              </g>
            </motion.g>

            <motion.g
              animate={
                armWave
                  ? { rotate: [0, -35, -15, -35, -15, 0], y: [0, -10, -6, -10, -6, 0] }
                  : { y: [0, -6, 0], rotate: [3, -3, 3] }
              }
              transition={
                armWave
                  ? { duration: 1.4, ease: "easeInOut" }
                  : { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }
              style={{ transformOrigin: "325px 262px" }}
            >
              <g style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}>
                <ellipse cx="325" cy="262" rx="16" ry="30" fill="url(#whiteBody)" />
                <ellipse cx="325" cy="262" rx="16" ry="30" fill="url(#bodyShadow)" />
                <ellipse
                  cx="319"
                  cy="245"
                  rx="7"
                  ry="3.5"
                  fill="rgba(255,255,255,0.9)"
                  style={{ filter: "blur(1.5px)" }}
                />
              </g>
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                FOREGROUND ORBIT — 3D depth illusion
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 240px" }}
            >
              <ellipse
                cx="200"
                cy="240"
                rx="172"
                ry="46"
                fill="none"
                stroke="url(#orbitGrad)"
                strokeWidth="2.5"
                opacity="0.65"
                strokeDasharray="110 700"
                style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,1))" }}
              />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating sparkles */}
      <FloatingSparkle delay={0} top="8%" left="6%" />
      <FloatingSparkle delay={1.4} top="22%" right="4%" />
      <FloatingSparkle delay={2.8} bottom="26%" left="2%" />
      <FloatingSparkle delay={2} bottom="18%" right="6%" />
      <FloatingSparkle delay={1} top="50%" left="0%" />
      <FloatingSparkle delay={2.6} top="55%" right="0%" />
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
        fontSize: "14px",
        color: "#67e8f9",
        textShadow: "0 0 12px rgba(34,211,238,1)",
      }}
      animate={{
        y: [0, -16, 0],
        opacity: [0, 1, 0],
        scale: [0.4, 1.3, 0.4],
      }}
      transition={{
        duration: 3.2,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      ·
    </motion.div>
  );
}
