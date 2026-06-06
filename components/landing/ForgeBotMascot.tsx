"use client";

/**
 * ForgeBot Mascot v15 — "Haribon Mecha" (futuristic armored eagle emblem).
 *
 * Full scrap of the soft feathered-bird lineage (v9–v14), which kept reading
 * as a cute robot-owl. This is a bold, geometric, ROBUST mecha-eagle crest:
 *
 *   - ARMORED HELMET HEAD — faceted steel skull, center ridge, panel seams,
 *     top specular. Reads as machined metal, not a soft egg.
 *   - DARK HUD VISOR — angular goggle band with two glowing cyan blade-eyes
 *     and a center brow notch (the raptor scowl). Eyes blink + track cursor.
 *   - BOLD SWEPT WINGS — five large angular armor blades per side fanning up
 *     and out over a solid membrane, gold-tipped outer "primary." Sharp and
 *     geometric, not spiky feathers. Wings flex on a gentle soar.
 *   - GOLD CREST + HOOKED BEAK — three swept crest blades and a sharp gold
 *     beak: the eagle silhouette anchors.
 *   - CHEST SHIELD — a faceted V breastplate with a glowing cyan core seam
 *     and a small PH gold star.
 *   - FX — energy ring halo, hover disc, floating sparkles. Premium + clean.
 *
 * Palette: brushed steel/gunmetal, cyan glow (HUD/eyes/core), PH gold accents.
 *
 * Motion: float, mouse-track tilt, eye blink, gentle wing flex, ring/disc
 * pulse, prefers-reduced-motion. Public API unchanged (size, className).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  className?: string;
}

/* ─── Geometry helpers (pure, deterministic — SSR-safe) ─── */
const rad = (d: number) => (d * Math.PI) / 180;
const f1 = (n: number) => n.toFixed(1);

interface Blade {
  d: string;
  spine: string;
  tip: [number, number];
  baseL: [number, number];
  baseR: [number, number];
  gold: boolean;
}

/** A sharp pointed armor blade (triangle: baseL → tip → baseR). */
function blade(cx: number, cy: number, angleDeg: number, length: number, baseW: number, gold: boolean): Blade {
  const a = rad(angleDeg);
  const dx = Math.sin(a), dy = -Math.cos(a), px = Math.cos(a), py = Math.sin(a);
  const blx = cx - (px * baseW) / 2, bly = cy - (py * baseW) / 2;
  const brx = cx + (px * baseW) / 2, bry = cy + (py * baseW) / 2;
  const tx = cx + dx * length, ty = cy + dy * length;
  return {
    d: `M ${f1(blx)} ${f1(bly)} L ${f1(tx)} ${f1(ty)} L ${f1(brx)} ${f1(bry)} Z`,
    spine: `M ${f1(blx + (tx - blx) * 0.1)} ${f1(bly + (ty - bly) * 0.1)} L ${f1(tx)} ${f1(ty)}`,
    tip: [tx, ty],
    baseL: [blx, bly],
    baseR: [brx, bry],
    gold,
  };
}

/** One bold wing: stacked angular blades fanning up & out from a shoulder. */
function buildWing(sx: number, sy: number, dir: 1 | -1) {
  const N = 5;
  const blades: Blade[] = [];
  const tips: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const angle = dir * (24 + t * 50);
    const length = 158 - t * 30;
    const baseW = 34 - t * 12;
    const bx = sx + dir * t * 12;
    const by = sy - t * 10;
    const b = blade(bx, by, angle, length, baseW, i === N - 1);
    blades.push(b);
    tips.push(b.tip);
  }
  const membrane =
    `M ${f1(sx)} ${f1(sy + 14)} ` +
    `L ${f1(blades[0].baseL[0])} ${f1(blades[0].baseL[1])} ` +
    tips.map((p) => `L ${f1(p[0])} ${f1(p[1])}`).join(" ") +
    ` L ${f1(blades[N - 1].baseR[0])} ${f1(blades[N - 1].baseR[1])} Z`;
  return { blades, membrane };
}

export function ForgeBotMascot({ size = 380, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 70, damping: 14, mass: 0.7 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [13, -13]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-9, 9]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-2.4, 2.4]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-1.4, 1.4]), springConfig);

  const [blink, setBlink] = useState(false);
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
        setTimeout(() => setBlink(false), 120);
        schedule();
      }, 3000 + Math.random() * 3800);
    };
    schedule();
    return () => clearTimeout(t);
  }, []);

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    mouseY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }
  function handleLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const R = { x: 236, y: 214 };
  const L = { x: 164, y: 214 };
  const wingR = useMemo(() => buildWing(R.x, R.y, 1), [R.x, R.y]);
  const wingL = useMemo(() => buildWing(L.x, L.y, -1), [L.x, L.y]);

  const sparkles = useMemo(
    () => [
      { delay: 0, top: "12%", left: "8%", hue: "#67e8f9" },
      { delay: 1.4, top: "22%", right: "6%", hue: "#fbbf24" },
      { delay: 2.6, bottom: "28%", left: "5%", hue: "#a78bfa" },
      { delay: 2, bottom: "22%", right: "8%", hue: "#67e8f9" },
      { delay: 1, top: "50%", left: "2%", hue: "#fbbf24" },
      { delay: 2.4, top: "54%", right: "2%", hue: "#a78bfa" },
    ],
    []
  );

  const flexR = reducedMotion ? {} : { rotate: [0, -3, 0], y: [0, -3, 0] };
  const flexL = reducedMotion ? {} : { rotate: [0, 3, 0], y: [0, -3, 0] };
  const flexTransition = { duration: 4.6, repeat: Infinity, ease: "easeInOut" } as const;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative inline-block ${className}`}
      style={{ width: `clamp(240px, 90vw, ${size}px)`, perspective: "1400px" }}
    >
      {/* Hue-shifting halo */}
      <motion.div
        animate={
          reducedMotion
            ? { opacity: 0.5 }
            : {
                opacity: [0.42, 0.66, 0.42],
                scale: [1, 1.05, 1],
                filter: ["hue-rotate(0deg) blur(26px)", "hue-rotate(40deg) blur(26px)", "hue-rotate(0deg) blur(26px)"],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, transparent 28%, rgba(34,211,238,0.30) 46%, rgba(251,191,36,0.12) 60%, rgba(167,139,250,0.18) 72%, transparent 84%)",
        }}
      />

      <motion.div
        animate={reducedMotion ? {} : { y: [0, -12, 0, -6, 0] }}
        transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%" }}
      >
        <motion.div style={{ rotateY, rotateX, transformStyle: "preserve-3d", width: "100%" }}>
          <svg
            viewBox="0 0 400 440"
            width="100%"
            height="auto"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", filter: "drop-shadow(0 30px 60px rgba(34,211,238,0.4))" }}
          >
            <defs>
              <linearGradient id="steel" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#dbe3ee" />
                <stop offset="35%" stopColor="#9aa7b9" />
                <stop offset="70%" stopColor="#5c6979" />
                <stop offset="100%" stopColor="#3a4453" />
              </linearGradient>
              <linearGradient id="steelDark" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#3d4756" />
                <stop offset="100%" stopColor="#161d28" />
              </linearGradient>
              <linearGradient id="plate" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#aeb9c8" />
                <stop offset="50%" stopColor="#6c7889" />
                <stop offset="100%" stopColor="#2c3542" />
              </linearGradient>
              <linearGradient id="gold" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="45%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="eye" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="40%" stopColor="#a5f3fc" />
                <stop offset="100%" stopColor="#22d3ee" />
              </radialGradient>
              <radialGradient id="ring" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="78%" stopColor="#22d3ee" stopOpacity="0.10" />
                <stop offset="92%" stopColor="#22d3ee" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </radialGradient>
              <filter id="eyeBloom" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* energy ring backdrop */}
            <motion.circle
              cx="200"
              cy="210"
              r="180"
              fill="url(#ring)"
              animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.6, 1, 0.6], scale: [1, 1.03, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "200px 210px" }}
            />

            {/* ════ WINGS ════ */}
            <motion.g animate={flexL} transition={flexTransition} style={{ transformOrigin: `${L.x}px ${L.y}px` }}>
              <path d={wingL.membrane} fill="url(#steelDark)" stroke="rgba(34,211,238,0.25)" strokeWidth="1" style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))" }} />
              {wingL.blades.map((b, i) => (
                <path key={`lb${i}`} d={b.d} fill={b.gold ? "url(#gold)" : "url(#plate)"} stroke="rgba(10,15,25,0.5)" strokeWidth="1" />
              ))}
              {wingL.blades.map((b, i) => (
                <path key={`ls${i}`} d={b.spine} stroke="rgba(190,205,222,0.45)" strokeWidth="0.8" fill="none" />
              ))}
            </motion.g>
            <motion.g animate={flexR} transition={flexTransition} style={{ transformOrigin: `${R.x}px ${R.y}px` }}>
              <path d={wingR.membrane} fill="url(#steelDark)" stroke="rgba(34,211,238,0.25)" strokeWidth="1" style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))" }} />
              {wingR.blades.map((b, i) => (
                <path key={`rb${i}`} d={b.d} fill={b.gold ? "url(#gold)" : "url(#plate)"} stroke="rgba(10,15,25,0.5)" strokeWidth="1" />
              ))}
              {wingR.blades.map((b, i) => (
                <path key={`rs${i}`} d={b.spine} stroke="rgba(190,205,222,0.45)" strokeWidth="0.8" fill="none" />
              ))}
            </motion.g>

            {/* breathing wrapper for head+chest */}
            <motion.g
              animate={reducedMotion ? {} : { scale: [1, 1.012, 1] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "200px 200px" }}
            >
              {/* ════ CHEST SHIELD ════ */}
              <path d="M 176 196 L 224 196 L 232 232 L 200 304 L 168 232 Z" fill="url(#steel)" stroke="rgba(10,15,25,0.5)" strokeWidth="1.2" style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))" }} />
              <path d="M 200 210 L 200 296" stroke="rgba(34,211,238,0.5)" strokeWidth="1.2" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />
              <path d="M 178 220 L 200 210 L 222 220" stroke="rgba(10,15,25,0.4)" strokeWidth="1" fill="none" />
              <path d="M 200 232 L 188 250 M 200 232 L 212 250" stroke="rgba(10,15,25,0.35)" strokeWidth="1" fill="none" />
              <motion.g
                animate={reducedMotion ? { opacity: 0.9 } : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <circle cx="200" cy="236" r="6.5" fill="#0b1220" stroke="rgba(34,211,238,0.6)" strokeWidth="1" />
                <path d="M 200 231.5 L 201.4 235.2 L 205.2 235.2 L 202.1 237.6 L 203.3 241.4 L 200 239.1 L 196.7 241.4 L 197.9 237.6 L 194.8 235.2 L 198.6 235.2 Z" fill="#fde68a" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
              </motion.g>

              {/* ════ CREST BLADES ════ */}
              <path d="M 184 118 L 176 70 L 196 110 Z" fill="url(#gold)" style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))" }} />
              <path d="M 200 112 L 200 58 L 212 108 Z" fill="url(#gold)" style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))" }} />
              <path d="M 216 118 L 224 70 L 204 110 Z" fill="url(#gold)" style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))" }} />

              {/* ════ HELMET HEAD ════ */}
              <path
                d="M 200 108 C 232 108 254 130 254 160 C 254 180 244 196 226 206 L 220 214 L 200 220 L 180 214 L 174 206 C 156 196 146 180 146 160 C 146 130 168 108 200 108 Z"
                fill="url(#steel)"
                stroke="rgba(10,15,25,0.45)"
                strokeWidth="1.2"
                style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}
              />
              <path d="M 200 110 L 200 150" stroke="rgba(10,15,25,0.3)" strokeWidth="1" />
              <path d="M 162 150 Q 200 138 238 150" stroke="rgba(255,255,255,0.35)" strokeWidth="1.2" fill="none" />
              <ellipse cx="180" cy="138" rx="20" ry="8" fill="rgba(255,255,255,0.5)" style={{ filter: "blur(3px)" }} />

              {/* ════ VISOR ════ */}
              <path d="M 156 158 C 168 150 184 150 200 156 C 216 150 232 150 244 158 C 248 172 240 184 224 188 C 210 190 200 188 200 188 C 200 188 190 190 176 188 C 160 184 152 172 156 158 Z" fill="#0b1220" />
              <path d="M 160 162 Q 200 154 240 162" stroke="rgba(34,211,238,0.4)" strokeWidth="1" fill="none" />

              {/* ════ EYES ════ */}
              <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                <motion.g
                  animate={blink ? { scaleY: 0.1 } : { scaleY: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ transformOrigin: "200px 171px" }}
                >
                  <path d="M 168 168 L 190 164 L 186 176 L 170 178 Z" fill="url(#eye)" filter="url(#eyeBloom)" />
                  <path d="M 232 168 L 210 164 L 214 176 L 230 178 Z" fill="url(#eye)" filter="url(#eyeBloom)" />
                </motion.g>
              </motion.g>
              <path d="M 194 170 L 200 176 L 206 170" stroke="rgba(34,211,238,0.7)" strokeWidth="1.4" fill="none" strokeLinecap="round" />

              {/* ════ BEAK ════ */}
              <path d="M 188 196 L 212 196 L 206 214 Q 200 226 200 226 Q 200 226 194 214 Z" fill="url(#gold)" stroke="rgba(120,53,15,0.5)" strokeWidth="0.8" style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.4))" }} />
              <path d="M 200 226 Q 196 220 196 212 L 204 212 Q 204 220 200 226 Z" fill="#92400e" />
              <path d="M 194 200 L 206 200" stroke="rgba(120,53,15,0.5)" strokeWidth="1" />
            </motion.g>

            {/* ════ HOVER DISC ════ */}
            <motion.ellipse cx="200" cy="340" rx="60" ry="8" fill="none" stroke="#22d3ee" strokeWidth="1.4" animate={reducedMotion ? { opacity: 0.6 } : { rx: [54, 66, 54], opacity: [0.45, 0.8, 0.45] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
            <motion.ellipse cx="200" cy="340" rx="40" ry="5" fill="none" stroke="#67e8f9" strokeWidth="0.9" animate={reducedMotion ? { opacity: 0.4 } : { rx: [34, 48, 34], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
          </svg>
        </motion.div>
      </motion.div>

      {sparkles.map((s, i) => (
        <FloatingSparkle key={i} {...s} />
      ))}
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
      style={{ top, bottom, left, right, fontSize: "14px", color: hue, textShadow: `0 0 12px ${hue}` }}
      animate={{ y: [0, -16, 0], opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
      transition={{ duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      ·
    </motion.div>
  );
}
