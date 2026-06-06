"use client";

/**
 * ForgeBot Mascot v11 — "Haribon" (the Philippine Eagle).
 *
 * Bold pivot from v10's EVE-egg to a Filipino national identity:
 * the Philippine Eagle (Pithecophaga jefferyi), nicknamed Haring Ibon
 * — "King Bird." Critically endangered, fierce, and unmistakably PH.
 *
 * We keep the v10 motion framework intact (blink, wave, breathing,
 * micro-saccades, mouse-tracking, prismatic visor sheen, hover disc,
 * orbital ring, hue-shifting halo, prefers-reduced-motion handling)
 * so the rest of the app needs zero changes. Only the SVG body content
 * changes — same viewBox, same component API.
 *
 * Design language:
 *   - BACKSWEPT CREST — 5 plumes with gold/amber tips (Philippine
 *     flag yellow) radiating from the back of the head. The signature
 *     element. Animated gentle sway.
 *   - AVIATOR-GOGGLE VISOR — dark glass face mask reshaped to fit an
 *     avian skull. Prismatic rainbow sheen sweeps across it (v10 hold).
 *   - HAPPY EYE ARCS — preserved unchanged. The emotion engine.
 *     Multi-layer bloom, blink, micro-saccades.
 *   - SMALL FRIENDLY BEAK — slate-dark triangle, soft highlight.
 *   - WING-ARMS — crescent floating wings instead of egg-pods. Right
 *     wing flares on wave with energy meridians + cyan edge glow.
 *   - CHEST SIGIL — three small dots in the PH-flag triangle position
 *     (low-key nationalism, no literal flag). Pulses with breath.
 *   - PALETTE — cyan + violet from v10, PLUS amber/gold for the crest
 *     so the PH-flag colors are present without being garish.
 *
 * Public API unchanged: <ForgeBotMascot size={N} className />.
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
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-1.5, 1.5]), springConfig);

  const [blink, setBlink] = useState(false);
  const [armWave, setArmWave] = useState(false);
  const [saccade, setSaccade] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
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
    let t: ReturnType<typeof setTimeout>;
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

  useEffect(() => {
    if (reducedMotion) return;
    let t: ReturnType<typeof setTimeout>;
    const schedule = () => {
      t = setTimeout(() => {
        setSaccade({
          x: (Math.random() - 0.5) * 4,
          y: (Math.random() - 0.5) * 2.4,
        });
        setTimeout(() => setSaccade({ x: 0, y: 0 }), 280);
        schedule();
      }, 1800 + Math.random() * 2600);
    };
    schedule();
    return () => clearTimeout(t);
  }, [reducedMotion]);

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
        delay: (i / 14) * 2.6,
        size: 1.5 + Math.random() * 1.6,
        // Cyan / violet / amber alternation = PH-tinted prismatic.
        hue: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#22d3ee" : "#a78bfa",
      })),
    []
  );

  /**
   * Crest plumes — 5 swept-back feathers, each a path. We define them
   * here so the animation drives all of them in concert (gentle sway).
   * Indexed left → right; outer plumes sweep wider.
   * Each plume has a base (anchored under the cap) and a gold tip.
   */
  const plumes = useMemo(
    () => [
      // Far-left plume — biggest sweep
      {
        d: "M 174 88 Q 158 60 130 38 Q 142 58 152 92 Z",
        tipCx: 132,
        tipCy: 42,
        delay: 0,
      },
      // Left plume
      {
        d: "M 184 80 Q 174 50 162 28 Q 174 50 178 88 Z",
        tipCx: 164,
        tipCy: 32,
        delay: 0.2,
      },
      // Center plume — tallest
      {
        d: "M 198 76 Q 198 40 200 18 Q 202 40 204 76 Z",
        tipCx: 200,
        tipCy: 22,
        delay: 0.4,
      },
      // Right plume
      {
        d: "M 216 80 Q 226 50 238 28 Q 226 50 222 88 Z",
        tipCx: 236,
        tipCy: 32,
        delay: 0.6,
      },
      // Far-right plume — biggest sweep
      {
        d: "M 226 88 Q 242 60 270 38 Q 258 58 248 92 Z",
        tipCx: 268,
        tipCy: 42,
        delay: 0.8,
      },
    ],
    []
  );

  const breathAnim = reducedMotion
    ? {}
    : { scale: [1, 1.014, 1, 1.008, 1] };
  const breathTransition = { duration: 4.4, repeat: Infinity, ease: "easeInOut" } as const;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative inline-block ${className}`}
      style={{
        width: `clamp(240px, 90vw, ${size}px)`,
        perspective: "1400px",
      }}
    >
      {/* Hue-shifting outer halo — cyan → amber → violet → cyan over 14s.
          Slightly wider hue arc than v10 to make room for the gold. */}
      <motion.div
        animate={
          reducedMotion
            ? { opacity: 0.55 }
            : {
                opacity: [0.5, 0.78, 0.5],
                scale: [1, 1.06, 1],
                filter: [
                  "hue-rotate(0deg) blur(22px)",
                  "hue-rotate(45deg) blur(22px)",
                  "hue-rotate(0deg) blur(22px)",
                ],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 28%, rgba(34,211,238,0.36) 42%, rgba(251,191,36,0.18) 56%, rgba(167,139,250,0.26) 70%, transparent 82%)",
        }}
      />

      <motion.div
        animate={reducedMotion ? {} : { y: [0, -12, 0, -6, 0] }}
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
              {/* ═══ BODY — bright white with cool undertones ═══ */}
              <radialGradient id="bodyGrad" cx="32%" cy="14%" r="80%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="38%" stopColor="#f8fafc" />
                <stop offset="72%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#cbd5e1" />
              </radialGradient>
              <linearGradient id="bodyShadow" x1="25%" y1="0%" x2="100%" y2="70%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="55%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(30,41,59,0.35)" />
              </linearGradient>
              {/* Right cyan rim */}
              <linearGradient id="rimCyan" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="1" />
                <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.55" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Left violet rim */}
              <linearGradient id="rimViolet" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>

              {/* ═══ CREST — gold/amber flag yellow, fading to white at base ═══ */}
              <linearGradient id="crestPlume" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#fef3c7" />
                <stop offset="75%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
              {/* Soft amber glow used for the crest aura + tip highlight */}
              <radialGradient id="amberGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fcd34d" stopOpacity="0.75" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* HEART-CORE — soft warm glow visible through the chest */}
              <radialGradient id="heartCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fda4af" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#fb7185" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>

              {/* DARK VISOR */}
              <radialGradient id="visorGlass" cx="30%" cy="25%" r="90%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="45%" stopColor="#0c0a1f" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              {/* Prismatic sheen */}
              <linearGradient
                id="prismaticSheen"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="transparent" />
                <stop offset="42%" stopColor="rgba(167,139,250,0.55)" />
                <stop offset="50%" stopColor="rgba(251,191,36,0.65)" />
                <stop offset="58%" stopColor="rgba(34,211,238,0.55)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* EYE LED */}
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
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="70%" stopColor="#a78bfa" stopOpacity="1" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              {/* CHIN LED bar */}
              <linearGradient id="chinLed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="rgba(34,211,238,0.6)" />
                <stop offset="50%" stopColor="#67e8f9" />
                <stop offset="80%" stopColor="rgba(34,211,238,0.6)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* Wing leading-edge glow — used for the right wing on wave */}
              <linearGradient id="wingEdge" x1="0%" y1="50%" x2="100%" y2="50%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>

              <filter id="eyeBloom" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="b1" />
                <feGaussianBlur stdDeviation="8" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              {/* Crest tip bloom — gives the gold tips a glow */}
              <filter id="crestTipBloom" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="2.5" result="b1" />
                <feMerge>
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Visor clip — matches the aviator goggle shape below */}
              <clipPath id="visorClip">
                <ellipse cx="200" cy="172" rx="80" ry="42" />
              </clipPath>

              {/* Body clip — for any inset patterns later */}
              <clipPath id="bodyClip">
                <path
                  d="M 200 100
                     C 252 100 286 134 286 186
                     C 286 220 280 248 272 272
                     C 268 296 254 332 232 350
                     C 222 358 212 364 200 364
                     C 188 364 178 358 168 350
                     C 146 332 132 296 128 272
                     C 120 248 114 220 114 186
                     C 114 134 148 100 200 100 Z"
                />
              </clipPath>
            </defs>

            {/* ═══════════════════════════════════════════════════════════
                BACK ORBIT
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={reducedMotion ? {} : { rotate: 360 }}
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

            {/* Floating particles — cyan / violet / amber rotation */}
            {orbitParticles.map((p, i) => {
              const cx = 200 + Math.cos(p.angle) * 170;
              const cy = 242 + Math.sin(p.angle) * 44;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={p.size}
                  fill={p.hue}
                  animate={
                    reducedMotion
                      ? { opacity: 0.5 }
                      : { opacity: [0, 1, 0], scale: [0.4, 1.6, 0.4] }
                  }
                  transition={{
                    duration: 2.8,
                    delay: p.delay,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  style={{ filter: `drop-shadow(0 0 6px ${p.hue})` }}
                />
              );
            })}

            {/* ═══════════════════════════════════════════════════════════
                HOVER DISC
                ═══════════════════════════════════════════════════════════ */}
            <motion.ellipse
              cx="200"
              cy="402"
              rx="92"
              ry="13"
              fill="url(#discGlow)"
              animate={
                reducedMotion
                  ? { opacity: 0.7 }
                  : { rx: [88, 100, 88], opacity: [0.6, 1, 0.6] }
              }
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
            <motion.ellipse
              cx="200"
              cy="400"
              rx="60"
              ry="4"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.3"
              animate={
                reducedMotion
                  ? { opacity: 0.7 }
                  : { rx: [54, 68, 54], opacity: [0.5, 1, 0.5] }
              }
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
              animate={
                reducedMotion
                  ? { opacity: 0.6 }
                  : { rx: [36, 50, 36], opacity: [0.4, 0.9, 0.4] }
              }
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
              animate={
                reducedMotion
                  ? { opacity: 0.3 }
                  : { rx: [70, 90, 70], opacity: [0, 0.6, 0] }
              }
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            />

            {/* ═══════════════════════════════════════════════════════════
                BREATHING WRAPPER — Haribon scales 1↔1.014
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={breathAnim}
              transition={breathTransition}
              style={{ transformOrigin: "200px 220px" }}
            >
              {/* ═════ CREST aura — soft amber halo behind plumes ═════ */}
              <motion.ellipse
                cx="200"
                cy="55"
                rx="100"
                ry="38"
                fill="url(#amberGlow)"
                animate={
                  reducedMotion
                    ? { opacity: 0.55 }
                    : { opacity: [0.45, 0.75, 0.45], scale: [1, 1.06, 1] }
                }
                transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "blur(6px)", transformOrigin: "200px 55px" }}
              />

              {/* ═════ CREST PLUMES — 5 swept-back feathers, gentle sway ═════ */}
              <motion.g
                animate={reducedMotion ? {} : { rotate: [-1.2, 1.2, -1.2] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "200px 95px" }}
              >
                {plumes.map((p, i) => (
                  <g key={i}>
                    {/* Plume body */}
                    <path
                      d={p.d}
                      fill="url(#crestPlume)"
                      style={{
                        filter: "drop-shadow(0 4px 8px rgba(245,158,11,0.35))",
                      }}
                    />
                    {/* Plume centerline — subtle dark spine */}
                    <line
                      x1={(parseFloat(p.d.split(" ")[1]) + p.tipCx) / 2}
                      y1={(parseFloat(p.d.split(" ")[2]) + p.tipCy) / 2}
                      x2={p.tipCx}
                      y2={p.tipCy}
                      stroke="rgba(120,53,15,0.35)"
                      strokeWidth="0.6"
                    />
                    {/* Gold tip orb — small bloom */}
                    <motion.circle
                      cx={p.tipCx}
                      cy={p.tipCy}
                      r="3"
                      fill="#fde68a"
                      filter="url(#crestTipBloom)"
                      animate={
                        reducedMotion
                          ? { opacity: 0.9 }
                          : { opacity: [0.7, 1, 0.7], r: [3, 3.6, 3] }
                      }
                      transition={{
                        duration: 2.2,
                        delay: p.delay,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      style={{
                        filter: "drop-shadow(0 0 6px #fbbf24)",
                      }}
                    />
                  </g>
                ))}
              </motion.g>

              {/* ═════ HEAD + BODY silhouette ═════
                  Avian: rounded head, narrower neck, tapered chest. We
                  treat head + body as one continuous teardrop so the
                  proportions read "kid-friendly mascot" not "predator." */}
              <g style={{ filter: "drop-shadow(0 14px 32px rgba(0,0,0,0.5))" }}>
                <path
                  d="M 200 78
                     C 254 78 292 116 292 168
                     C 292 196 286 218 280 236
                     C 286 252 286 274 282 296
                     C 277 322 262 352 240 368
                     C 228 376 215 380 200 380
                     C 185 380 172 376 160 368
                     C 138 352 123 322 118 296
                     C 114 274 114 252 120 236
                     C 114 218 108 196 108 168
                     C 108 116 146 78 200 78 Z"
                  fill="url(#bodyGrad)"
                />
                {/* Right shadow */}
                <path
                  d="M 200 78
                     C 254 78 292 116 292 168
                     C 292 196 286 218 280 236
                     C 286 252 286 274 282 296
                     C 277 322 262 352 240 368
                     C 228 376 215 380 200 380
                     C 185 380 172 376 160 368
                     C 138 352 123 322 118 296
                     C 114 274 114 252 120 236
                     C 114 218 108 196 108 168
                     C 108 116 146 78 200 78 Z"
                  fill="url(#bodyShadow)"
                />
              </g>

              {/* Heart-core glow through chest */}
              <motion.ellipse
                cx="200"
                cy="290"
                rx="46"
                ry="40"
                fill="url(#heartCore)"
                animate={
                  reducedMotion
                    ? { opacity: 0.55 }
                    : { opacity: [0.45, 0.7, 0.45], scale: [1, 1.05, 1] }
                }
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "blur(8px)", transformOrigin: "200px 290px" }}
              />

              {/* Top-left specular highlight */}
              <ellipse
                cx="162"
                cy="104"
                rx="42"
                ry="15"
                fill="rgba(255,255,255,0.95)"
                style={{ filter: "blur(7px)" }}
              />
              <ellipse
                cx="152"
                cy="98"
                rx="18"
                ry="6"
                fill="white"
                style={{ filter: "blur(2px)" }}
              />

              {/* Right cyan rim + left violet rim */}
              <path
                d="M 290 110 Q 295 168 290 228 Q 282 290 264 348"
                stroke="url(#rimCyan)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 110 110 Q 105 168 110 228 Q 118 290 136 348"
                stroke="url(#rimViolet)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Bottom shadow curve */}
              <path
                d="M 135 358 Q 200 372 265 358"
                stroke="rgba(15,23,42,0.22)"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* ═════ VISOR — aviator goggle shape ═════
                  Wider horizontal sweep than v10's egg-visor, sized to
                  match an eagle's face mask. */}
              <motion.g
                animate={reducedMotion ? {} : { rotate: [-0.6, 0.6, -0.6] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "200px 172px" }}
              >
                {/* Bezel */}
                <ellipse
                  cx="200"
                  cy="172"
                  rx="84"
                  ry="46"
                  fill="rgba(15,23,42,0.45)"
                  style={{ filter: "blur(2px)" }}
                />
                {/* Visor glass */}
                <ellipse
                  cx="200"
                  cy="172"
                  rx="80"
                  ry="42"
                  fill="url(#visorGlass)"
                />

                {/* HOLO scan lines */}
                <g clipPath="url(#visorClip)" opacity="0.18">
                  {[0, 1, 2, 3].map((i) => (
                    <line
                      key={i}
                      x1="122"
                      x2="278"
                      y1={140 + i * 17}
                      y2={140 + i * 17}
                      stroke="#22d3ee"
                      strokeWidth="0.5"
                    />
                  ))}
                  <motion.line
                    x1="122"
                    x2="278"
                    stroke="#67e8f9"
                    strokeWidth="1.2"
                    animate={
                      reducedMotion
                        ? { opacity: 0 }
                        : {
                            y1: [134, 208, 134],
                            y2: [134, 208, 134],
                            opacity: [0, 0.8, 0],
                          }
                    }
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  />
                </g>

                {/* PRISMATIC SHEEN — diagonal sweep */}
                <g clipPath="url(#visorClip)">
                  <motion.rect
                    x="-40"
                    y="130"
                    width="80"
                    height="90"
                    fill="url(#prismaticSheen)"
                    animate={
                      reducedMotion
                        ? { opacity: 0 }
                        : { x: [-40, 360], opacity: [0, 0.9, 0] }
                    }
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                      repeatDelay: 1.2,
                    }}
                    style={{ filter: "blur(2px)" }}
                  />
                </g>

                {/* Top glossy arc */}
                <path
                  d="M 138 152 Q 200 134 262 152"
                  stroke="rgba(255,255,255,0.32)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
                <ellipse
                  cx="162"
                  cy="148"
                  rx="22"
                  ry="4"
                  fill="rgba(255,255,255,0.3)"
                  style={{ filter: "blur(2px)" }}
                />

                {/* Cyan inner border */}
                <ellipse
                  cx="200"
                  cy="172"
                  rx="76"
                  ry="38"
                  fill="none"
                  stroke="rgba(34,211,238,0.45)"
                  strokeWidth="2"
                />
                <ellipse
                  cx="200"
                  cy="172"
                  rx="82"
                  ry="44"
                  fill="none"
                  stroke="rgba(34,211,238,0.55)"
                  strokeWidth="1"
                />

                {/* Soft cheek glow (warmth) */}
                <ellipse
                  cx="135"
                  cy="190"
                  rx="16"
                  ry="6"
                  fill="rgba(244,114,182,0.4)"
                  style={{ filter: "blur(5px)" }}
                />
                <ellipse
                  cx="265"
                  cy="190"
                  rx="16"
                  ry="6"
                  fill="rgba(244,114,182,0.4)"
                  style={{ filter: "blur(5px)" }}
                />

                {/* HUD readouts */}
                <text
                  x="248"
                  y="146"
                  fontSize="5.5"
                  fill="rgba(251,191,36,0.75)"
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
                <text
                  x="232"
                  y="208"
                  fontSize="5"
                  fill="rgba(251,191,36,0.55)"
                  fontFamily="monospace"
                >
                  HARIBON
                </text>

                {/* ═══ HAPPY EYES — preserved, repositioned slightly ═══ */}
                <motion.g
                  style={{ x: eyeOffsetX, y: eyeOffsetY }}
                  animate={{ x: saccade.x, y: saccade.y }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {/* Left eye */}
                  <motion.g
                    animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }}
                    transition={{ duration: 0.1 }}
                    style={{ transformOrigin: "170px 174px" }}
                  >
                    <path
                      d="M 144 180 Q 170 148 198 180"
                      stroke="#22d3ee"
                      strokeWidth="22"
                      strokeLinecap="round"
                      fill="none"
                      filter="url(#eyeBloom)"
                      opacity="0.7"
                    />
                    <path
                      d="M 148 178 Q 170 154 194 178"
                      stroke="url(#eyeLED)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 152 176 Q 170 158 190 176"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="162" cy="166" r="2.5" fill="white" />
                  </motion.g>

                  {/* Right eye */}
                  <motion.g
                    animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }}
                    transition={{ duration: 0.1 }}
                    style={{ transformOrigin: "230px 174px" }}
                  >
                    <path
                      d="M 202 180 Q 230 148 256 180"
                      stroke="#22d3ee"
                      strokeWidth="22"
                      strokeLinecap="round"
                      fill="none"
                      filter="url(#eyeBloom)"
                      opacity="0.7"
                    />
                    <path
                      d="M 206 178 Q 230 154 252 178"
                      stroke="url(#eyeLED)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 210 176 Q 230 158 250 176"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <circle cx="222" cy="166" r="2.5" fill="white" />
                  </motion.g>
                </motion.g>

                {/* Soft smile glow under the eye line */}
                <ellipse
                  cx="200"
                  cy="206"
                  rx="22"
                  ry="3"
                  fill="rgba(103,232,249,0.6)"
                  style={{ filter: "blur(2px)" }}
                />
              </motion.g>

              {/* ═════ BEAK — small, friendly, dark slate ═════
                  Sits just below the visor on the body center, with a
                  soft top highlight so it reads as 3D. */}
              <g style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.4))" }}>
                <path
                  d="M 188 222 Q 200 232 212 222 Q 207 240 200 246 Q 193 240 188 222 Z"
                  fill="#1e293b"
                />
                {/* Top edge highlight */}
                <path
                  d="M 191 224 Q 200 228 209 224"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Tip glint */}
                <circle cx="200" cy="244" r="1" fill="rgba(255,255,255,0.6)" />
              </g>

              {/* ═════ CHIN LED bar ═════ */}
              <motion.g
                animate={
                  reducedMotion
                    ? { opacity: 0.7 }
                    : { opacity: [0.55, 0.95, 0.55] }
                }
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <rect
                  x="170"
                  y="258"
                  width="60"
                  height="3"
                  rx="1.5"
                  fill="url(#chinLed)"
                />
                <rect
                  x="178"
                  y="258"
                  width="44"
                  height="3"
                  rx="1.5"
                  fill="#67e8f9"
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                  opacity="0.85"
                />
              </motion.g>

              {/* ═════ CHEST SIGIL — three subtle dots in PH-flag
                  triangle position (Mindanao, Visayas, Luzon stars).
                  Pulses with the breath. Easy to miss; that's the
                  point — quiet nationalism, not a flag decal. ═════ */}
              <motion.g
                animate={
                  reducedMotion
                    ? { opacity: 0.7 }
                    : { opacity: [0.5, 0.85, 0.5] }
                }
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Triangle vertices around y 305 */}
                <circle cx="186" cy="312" r="1.8" fill="#fbbf24" />
                <circle cx="214" cy="312" r="1.8" fill="#fbbf24" />
                <circle cx="200" cy="298" r="1.8" fill="#fbbf24" />
                {/* Soft sun rays from the top star — barely visible */}
                <g opacity="0.4">
                  {[-1, 0, 1].map((d) => (
                    <line
                      key={d}
                      x1={200 + d * 4}
                      y1="293"
                      x2={200 + d * 6}
                      y2="288"
                      stroke="#fbbf24"
                      strokeWidth="0.6"
                      strokeLinecap="round"
                    />
                  ))}
                </g>
              </motion.g>
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                WINGS — detached, floating, crescent-shaped
                Left wing: idle gentle sway only.
                Right wing: morphs into a wave gesture on armWave with
                added energy meridians + edge glow.
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={
                reducedMotion ? {} : { y: [0, -6, 0], rotate: [-3, 3, -3] }
              }
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "62px 268px" }}
            >
              <g style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}>
                {/* Left wing — crescent path. Anchored at body side,
                    sweeping outward and down. */}
                <path
                  d="M 78 248
                     C 60 254 46 268 42 290
                     C 46 286 56 280 72 278
                     C 66 274 60 270 56 262
                     C 60 260 70 256 78 250 Z"
                  fill="url(#bodyGrad)"
                />
                <path
                  d="M 78 248
                     C 60 254 46 268 42 290
                     C 46 286 56 280 72 278
                     C 66 274 60 270 56 262
                     C 60 260 70 256 78 250 Z"
                  fill="url(#bodyShadow)"
                />
                {/* Tiny feather lines — wing detail */}
                <g opacity="0.32" stroke="#94a3b8" strokeWidth="0.7" fill="none">
                  <path d="M 60 268 Q 56 274 52 282" />
                  <path d="M 66 264 Q 63 272 60 280" />
                  <path d="M 72 262 Q 70 270 68 278" />
                </g>
                {/* Cyan inner glow line */}
                <path
                  d="M 78 252 Q 64 264 56 280"
                  stroke="rgba(34,211,238,0.35)"
                  strokeWidth="1"
                  fill="none"
                  strokeLinecap="round"
                />
              </g>
            </motion.g>

            <motion.g
              animate={
                armWave
                  ? { rotate: [0, -35, -15, -35, -15, 0], y: [0, -10, -6, -10, -6, 0] }
                  : reducedMotion
                  ? {}
                  : { y: [0, -6, 0], rotate: [3, -3, 3] }
              }
              transition={
                armWave
                  ? { duration: 1.4, ease: "easeInOut" }
                  : { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
              }
              style={{ transformOrigin: "338px 268px" }}
            >
              <g style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}>
                {/* Right wing — mirror of left */}
                <path
                  d="M 322 248
                     C 340 254 354 268 358 290
                     C 354 286 344 280 328 278
                     C 334 274 340 270 344 262
                     C 340 260 330 256 322 250 Z"
                  fill="url(#bodyGrad)"
                />
                <path
                  d="M 322 248
                     C 340 254 354 268 358 290
                     C 354 286 344 280 328 278
                     C 334 274 340 270 344 262
                     C 340 260 330 256 322 250 Z"
                  fill="url(#bodyShadow)"
                />
                {/* Feather lines */}
                <g opacity="0.32" stroke="#94a3b8" strokeWidth="0.7" fill="none">
                  <path d="M 340 268 Q 344 274 348 282" />
                  <path d="M 334 264 Q 337 272 340 280" />
                  <path d="M 328 262 Q 330 270 332 278" />
                </g>
                {/* Cyan inner glow line + edge meridian that flares on wave */}
                <path
                  d="M 322 252 Q 336 264 344 280"
                  stroke="url(#wingEdge)"
                  strokeWidth={armWave ? 2.2 : 1}
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Energy meridian — only bright on wave */}
                <motion.path
                  d="M 322 252 Q 336 264 344 280"
                  stroke="#67e8f9"
                  strokeWidth="1.4"
                  fill="none"
                  strokeLinecap="round"
                  animate={
                    armWave
                      ? { opacity: [0.2, 1, 0.2, 1, 0.2] }
                      : { opacity: 0.2 }
                  }
                  transition={
                    armWave
                      ? { duration: 1.4, ease: "easeInOut" }
                      : { duration: 0.6 }
                  }
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                />
              </g>
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                FOREGROUND ORBIT — 3D depth
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={reducedMotion ? {} : { rotate: 360 }}
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

      {/* Floating sparkles — cyan / violet / amber tinted */}
      <FloatingSparkle delay={0} top="8%" left="6%" hue="#67e8f9" />
      <FloatingSparkle delay={1.4} top="22%" right="4%" hue="#fbbf24" />
      <FloatingSparkle delay={2.8} bottom="26%" left="2%" hue="#a78bfa" />
      <FloatingSparkle delay={2} bottom="18%" right="6%" hue="#67e8f9" />
      <FloatingSparkle delay={1} top="50%" left="0%" hue="#fbbf24" />
      <FloatingSparkle delay={2.6} top="55%" right="0%" hue="#a78bfa" />
    </div>
  );
}

function FloatingSparkle({
  delay,
  top,
  bottom,
  left,
  right,
  hue = "#67e8f9",
}: {
  delay: number;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  hue?: string;
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
        color: hue,
        textShadow: `0 0 12px ${hue}`,
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
