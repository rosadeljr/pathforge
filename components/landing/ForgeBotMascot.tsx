"use client";

/**
 * ForgeBot Mascot v10 — "EVE Premium."
 *
 * v9 was clean and crisp but read as "static plastic shell." v10 keeps
 * the EVE silhouette (the brand) and elevates it with the modern-tech
 * flourishes that make a mascot feel alive:
 *
 *   - PRISMATIC visor sheen — animated rainbow refraction band sweeping
 *     across the visor (the iconic Apple Vision Pro / Y2K-cyber move).
 *   - HEAD SENSOR LED — small antenna node on top that strobes between
 *     cyan ↔ violet on a 4-beat cadence. Gives identity from a glance.
 *   - HEART-CORE — soft warm peach glow visible through the body's
 *     chest area that pulses with breathing. Reads as "alive."
 *   - CHIN LED BAR — horizontal status bar beneath the visor that
 *     breathes in sync with the body scale.
 *   - HEX PANEL SKIN — subtle 5% hex pattern overlay on body so it
 *     reads as "manufactured premium device" not "blob of plastic."
 *   - MICRO-SACCADES — eyes occasionally dart even without mouse input,
 *     giving the bot a sense of curiosity.
 *   - HUE-SHIFTING HALO — the outer aura subtly cycles cyan → violet
 *     → cyan over ~14s instead of staying static.
 *   - ENERGY MERIDIANS — when the wave triggers, glowing lines pulse
 *     down the waving arm. Sells the personality moment.
 *   - VISOR DEPTH — true bezel + inner shadow + edge highlight, so
 *     the visor looks INSET into the head, not painted on.
 *   - IDLE BREATHING — body scales 1 → 1.014 → 1 on a 4.4s loop. The
 *     single most important upgrade for "this thing is alive."
 *   - prefers-reduced-motion respected — heavy loops are damped to
 *     gentle ambient motion when the user opts out.
 *
 * Public surface identical to v9: <ForgeBotMascot size={N} className />
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
  // Micro-saccades — tiny eye darts that fire on a slow random cadence
  // so the bot looks curious even when the cursor isn't moving.
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

  // Blink cadence — short on/off pulses
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

  // Arm wave cadence — bigger gesture every ~7-11s
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

  // Micro-saccades — tiny random eye darts that reset to center.
  // Skipped entirely under reduced-motion.
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
        // Alternate hues for the prismatic feel
        hue: i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#22d3ee" : "#67e8f9",
      })),
    []
  );

  // Hex panel positions on the body — sparse low-opacity overlay.
  // Generated once. Each hex sits on a staggered grid inside the body
  // silhouette. We trim to ~12 nodes so it reads as "premium hint" not
  // "soccer ball."
  const hexNodes = useMemo(
    () => [
      { cx: 175, cy: 230, r: 8 },
      { cx: 205, cy: 215, r: 9 },
      { cx: 232, cy: 235, r: 7 },
      { cx: 158, cy: 262, r: 8 },
      { cx: 188, cy: 282, r: 9 },
      { cx: 218, cy: 270, r: 8 },
      { cx: 246, cy: 288, r: 7 },
      { cx: 172, cy: 312, r: 8 },
      { cx: 202, cy: 326, r: 9 },
      { cx: 232, cy: 318, r: 7 },
      { cx: 187, cy: 348, r: 6 },
      { cx: 215, cy: 350, r: 6 },
    ],
    []
  );

  // Breathing scale — body subtly inflates/deflates. The single most
  // important "alive" cue. Damped under reduced-motion.
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
        // Identical rendering on web + mobile. The SVG keeps its 400:440
        // intrinsic aspect ratio via preserveAspectRatio="xMidYMid meet".
        // On narrow screens we clamp to 90vw so it never overflows.
        width: `clamp(240px, 90vw, ${size}px)`,
        perspective: "1400px",
      }}
    >
      {/* Hue-shifting outer halo — cycles cyan → violet → cyan over 14s.
          Adds the holographic / iridescent vibe modern AI brands lean
          on without being garish. */}
      <motion.div
        animate={
          reducedMotion
            ? { opacity: 0.55 }
            : {
                opacity: [0.5, 0.78, 0.5],
                scale: [1, 1.06, 1],
                filter: [
                  "hue-rotate(0deg) blur(22px)",
                  "hue-rotate(35deg) blur(22px)",
                  "hue-rotate(0deg) blur(22px)",
                ],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 28%, rgba(34,211,238,0.38) 42%, rgba(167,139,250,0.26) 62%, transparent 78%)",
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
              <radialGradient id="whiteBody" cx="32%" cy="14%" r="80%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="38%" stopColor="#f8fafc" />
                <stop offset="72%" stopColor="#e2e8f0" />
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
              {/* Left violet rim — adds the prismatic two-tone */}
              <linearGradient id="rimViolet" x1="0%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="#c4b5fd" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {/* HEART-CORE — warm peach glow through chest */}
              <radialGradient id="heartCore" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fda4af" stopOpacity="0.55" />
                <stop offset="50%" stopColor="#fb7185" stopOpacity="0.2" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
              {/* DEEP DARK VISOR with prismatic depth */}
              <radialGradient id="visorGlass" cx="30%" cy="25%" r="90%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="45%" stopColor="#0c0a1f" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              {/* PRISMATIC visor sheen — animated rainbow refraction */}
              <linearGradient
                id="prismaticSheen"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="transparent" />
                <stop offset="42%" stopColor="rgba(167,139,250,0.55)" />
                <stop offset="50%" stopColor="rgba(244,114,182,0.7)" />
                <stop offset="58%" stopColor="rgba(34,211,238,0.55)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
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
              {/* CHIN LED bar */}
              <linearGradient id="chinLed" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="20%" stopColor="rgba(34,211,238,0.6)" />
                <stop offset="50%" stopColor="#67e8f9" />
                <stop offset="80%" stopColor="rgba(34,211,238,0.6)" />
                <stop offset="100%" stopColor="transparent" />
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

              {/* Clip path for body — used to clip the hex panel
                  overlay so panels don't bleed past the silhouette. */}
              <clipPath id="bodyClip">
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
                />
              </clipPath>
            </defs>

            {/* ═══════════════════════════════════════════════════════════
                BACK ORBIT (behind body)
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

            {/* Floating data particles — prismatic-tinted */}
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
                HOVER PLATFORM — animated holo disc
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
                BREATHING WRAPPER — everything from here scales 1↔1.014
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={breathAnim}
              transition={breathTransition}
              style={{ transformOrigin: "200px 220px" }}
            >
              {/* ═════════ EVE BODY — pure white solid egg ═════════ */}
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

              {/* Hex panel skin — premium "manufactured" overlay,
                  clipped to the body silhouette. ~5% opacity. */}
              <g clipPath="url(#bodyClip)" opacity="0.06">
                {hexNodes.map((h, i) => (
                  <polygon
                    key={i}
                    points={hexPoints(h.cx, h.cy, h.r)}
                    fill="none"
                    stroke="#0f172a"
                    strokeWidth="0.6"
                  />
                ))}
              </g>

              {/* HEART-CORE — soft warm peach glow visible through the
                  chest area, breathing in sync. The single most "alive"
                  cue under the dramatic visor. */}
              <motion.ellipse
                cx="200"
                cy="262"
                rx="44"
                ry="38"
                fill="url(#heartCore)"
                animate={
                  reducedMotion
                    ? { opacity: 0.55 }
                    : { opacity: [0.45, 0.7, 0.45], scale: [1, 1.05, 1] }
                }
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "blur(8px)", transformOrigin: "200px 262px" }}
              />

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

              {/* Right cyan rim light + left violet rim — two-tone
                  prismatic edge that pushes the modern feel. */}
              <path
                d="M 292 105 Q 297 168 290 240 Q 282 305 258 348"
                stroke="url(#rimCyan)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 108 105 Q 103 168 110 240 Q 118 305 142 348"
                stroke="url(#rimViolet)"
                strokeWidth="3"
                fill="none"
                strokeLinecap="round"
                opacity="0.7"
              />

              {/* Bottom subtle shadow curve */}
              <path
                d="M 130 350 Q 200 365 270 350"
                stroke="rgba(15,23,42,0.22)"
                strokeWidth="3.5"
                fill="none"
                strokeLinecap="round"
              />

              {/* ═══════════════════════════════════════════════════════
                  HEAD ANTENNA — small sensor node on top with a
                  strobing LED. Adds vertical identity from a glance.
                  ═══════════════════════════════════════════════════════ */}
              <line
                x1="200"
                y1="72"
                x2="200"
                y2="56"
                stroke="rgba(203,213,225,0.7)"
                strokeWidth="1.3"
                strokeLinecap="round"
              />
              <circle cx="200" cy="56" r="3.5" fill="#0c0a1f" />
              <motion.circle
                cx="200"
                cy="56"
                r="2.4"
                animate={
                  reducedMotion
                    ? { fill: "#22d3ee" }
                    : {
                        fill: ["#22d3ee", "#a78bfa", "#22d3ee"],
                        opacity: [1, 0.5, 1],
                      }
                }
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
              />
              {/* Antenna pulse ring */}
              <motion.circle
                cx="200"
                cy="56"
                r="3"
                fill="none"
                stroke="#67e8f9"
                strokeWidth="0.8"
                animate={
                  reducedMotion
                    ? { opacity: 0 }
                    : { r: [3, 10, 3], opacity: [0.8, 0, 0.8] }
                }
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* ═══════════════════════════════════════════════════════
                  VISOR — large dark glassy plate with prismatic sheen
                  ═══════════════════════════════════════════════════════ */}
              <motion.g
                animate={
                  reducedMotion ? {} : { rotate: [-0.6, 0.6, -0.6] }
                }
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "200px 158px" }}
              >
                {/* Bezel — subtle dark outer ring that gives inset depth */}
                <ellipse
                  cx="200"
                  cy="158"
                  rx="91"
                  ry="65"
                  fill="rgba(15,23,42,0.45)"
                  style={{ filter: "blur(2px)" }}
                />
                {/* Visor glass */}
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
                    animate={
                      reducedMotion
                        ? { opacity: 0 }
                        : {
                            y1: [100, 215, 100],
                            y2: [100, 215, 100],
                            opacity: [0, 0.8, 0],
                          }
                    }
                    transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                  />
                </g>

                {/* PRISMATIC SHEEN — animated rainbow refraction band
                    that sweeps diagonally across the visor on a 6s
                    loop. The signature modern flourish. */}
                <g clipPath="url(#visorClip)">
                  <motion.rect
                    x="-40"
                    y="100"
                    width="80"
                    height="120"
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

                {/* Top glossy reflection arc */}
                <path
                  d="M 132 134 Q 200 110 268 134"
                  stroke="rgba(255,255,255,0.32)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  fill="none"
                />
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

                {/* ═══ HAPPY EYES — bright arcs + micro-saccades ═══ */}
                <motion.g
                  style={{ x: eyeOffsetX, y: eyeOffsetY }}
                  animate={{ x: saccade.x, y: saccade.y }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {/* Left eye */}
                  <motion.g
                    animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }}
                    transition={{ duration: 0.1 }}
                    style={{ transformOrigin: "170px 162px" }}
                  >
                    <path
                      d="M 142 168 Q 170 134 198 168"
                      stroke="#22d3ee"
                      strokeWidth="22"
                      strokeLinecap="round"
                      fill="none"
                      filter="url(#eyeBloom)"
                      opacity="0.7"
                    />
                    <path
                      d="M 146 166 Q 170 140 194 166"
                      stroke="url(#eyeLED)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      fill="none"
                    />
                    <path
                      d="M 150 164 Q 170 144 190 164"
                      stroke="white"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="none"
                    />
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

              {/* CHIN LED bar — small horizontal status strip beneath
                  the visor that breathes with the body. */}
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
                  y="232"
                  width="60"
                  height="3"
                  rx="1.5"
                  fill="url(#chinLed)"
                />
                <rect
                  x="178"
                  y="232"
                  width="44"
                  height="3"
                  rx="1.5"
                  fill="#67e8f9"
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                  opacity="0.85"
                />
              </motion.g>
            </motion.g>

            {/* ═══════════════════════════════════════════════════════════
                DETACHED FLOATING ARMS
                ═══════════════════════════════════════════════════════════ */}
            <motion.g
              animate={
                reducedMotion ? {} : { y: [0, -6, 0], rotate: [-3, 3, -3] }
              }
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
                {/* Idle meridian — faint vertical glow line */}
                <line
                  x1="75"
                  y1="240"
                  x2="75"
                  y2="285"
                  stroke="rgba(34,211,238,0.18)"
                  strokeWidth="1"
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
                {/* Energy meridian — pulses bright when armWave fires */}
                <motion.line
                  x1="325"
                  y1="240"
                  x2="325"
                  y2="285"
                  stroke="#67e8f9"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  animate={
                    armWave
                      ? { opacity: [0.2, 1, 0.2, 1, 0.2] }
                      : { opacity: 0.18 }
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
                FOREGROUND ORBIT — 3D depth illusion
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

      {/* Floating sparkles — prismatic-tinted, varied cadence */}
      <FloatingSparkle delay={0} top="8%" left="6%" hue="#67e8f9" />
      <FloatingSparkle delay={1.4} top="22%" right="4%" hue="#a78bfa" />
      <FloatingSparkle delay={2.8} bottom="26%" left="2%" hue="#67e8f9" />
      <FloatingSparkle delay={2} bottom="18%" right="6%" hue="#f472b6" />
      <FloatingSparkle delay={1} top="50%" left="0%" hue="#a78bfa" />
      <FloatingSparkle delay={2.6} top="55%" right="0%" hue="#67e8f9" />
    </div>
  );
}

/** Build a flat-top hexagon polygon string for the panel skin. */
function hexPoints(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i + Math.PI / 6;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`);
  }
  return pts.join(" ");
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
