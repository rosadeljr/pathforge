"use client";

/**
 * ForgeBot Mascot v16 — "Haribon Mecha" (sleek futuristic armored eagle).
 *
 * A bold, geometric mecha-eagle crest — premium, robust, stylish:
 *
 *   - ARMORED HELMET HEAD — cool brushed blue-steel skull with a center
 *     ridge, jaw/cheek panel plates, top specular, and neon rim-light
 *     (cyan right, violet left).
 *   - ANGULAR HUD VISOR — dark faceted goggle with two FIERCE cyan blade-
 *     eyes (raptor scowl), a center brow notch, and a glowing HUD under-rim.
 *     Eyes blink + track the cursor.
 *   - BOLD SWEPT WINGS — five sharp armor blades per side over a solid
 *     membrane, panel-lined, with a glowing cyan leading edge and a gold-
 *     tipped outer primary. Wings flex on a gentle soar.
 *   - CROWN CREST + HOOKED BEAK — a steel crown band with three swept gold
 *     crest blades, and a sharp gold beak.
 *   - CHEST SHIELD — a faceted V breastplate with a glowing cyan hex core
 *     and a PH gold star, plus cyan shoulder light-nodes.
 *   - FX — hex energy backdrop, dashed scan ring, HUD corner brackets,
 *     pulsing hover disc, floating sparkles.
 *
 * Palette: cool blue-steel armor, cyan glow (HUD/eyes/core/edges), PH gold.
 *
 * Motion: float, cursor tilt, eye blink, wing flex, ring/disc pulse,
 * prefers-reduced-motion. Public API unchanged (size, className).
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
    spine: `M ${f1(blx + (tx - blx) * 0.12)} ${f1(bly + (ty - bly) * 0.12)} L ${f1(tx)} ${f1(ty)}`,
    tip: [tx, ty],
    baseL: [blx, bly],
    baseR: [brx, bry],
    gold,
  };
}

/** One bold wing: angular blades fanning up & out over a solid membrane. */
function buildWing(sx: number, sy: number, dir: 1 | -1) {
  const N = 5;
  const blades: Blade[] = [];
  const tips: [number, number][] = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const angle = dir * (22 + t * 52);
    const length = 168 - t * 34;
    const baseW = 30 - t * 11;
    const bx = sx + dir * t * 13;
    const by = sy - t * 11;
    const b = blade(bx, by, angle, length, baseW, i === N - 1);
    blades.push(b);
    tips.push(b.tip);
  }
  const membrane =
    `M ${f1(sx)} ${f1(sy + 14)} L ${f1(blades[0].baseL[0])} ${f1(blades[0].baseL[1])} ` +
    tips.map((p) => `L ${f1(p[0])} ${f1(p[1])}`).join(" ") +
    ` L ${f1(blades[N - 1].baseR[0])} ${f1(blades[N - 1].baseR[1])} Z`;
  const leading =
    `M ${f1(tips[0][0])} ${f1(tips[0][1])} ` + tips.slice(1).map((p) => `L ${f1(p[0])} ${f1(p[1])}`).join(" ");
  return { blades, membrane, leading };
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

  const R = { x: 238, y: 214 };
  const L = { x: 162, y: 214 };
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
              <linearGradient id="steel" x1="25%" y1="0%" x2="75%" y2="100%">
                <stop offset="0%" stopColor="#e6edf6" />
                <stop offset="30%" stopColor="#aab8cb" />
                <stop offset="62%" stopColor="#5b6a80" />
                <stop offset="100%" stopColor="#2f3a4b" />
              </linearGradient>
              <linearGradient id="steelDark" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#364254" />
                <stop offset="100%" stopColor="#10161f" />
              </linearGradient>
              <linearGradient id="plate" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#c2cedd" />
                <stop offset="45%" stopColor="#73829a" />
                <stop offset="100%" stopColor="#28313f" />
              </linearGradient>
              <linearGradient id="gold" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#fff0c2" />
                <stop offset="45%" stopColor="#f5a814" />
                <stop offset="100%" stopColor="#a4560a" />
              </linearGradient>
              <radialGradient id="eye" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#bdf6fd" />
                <stop offset="100%" stopColor="#22d3ee" />
              </radialGradient>
              <radialGradient id="core" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#a5f3fc" />
                <stop offset="75%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="ring" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="74%" stopColor="#22d3ee" stopOpacity="0.08" />
                <stop offset="90%" stopColor="#22d3ee" stopOpacity="0.28" />
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

            {/* ════ TECH BACKDROP ════ */}
            <motion.circle
              cx="200"
              cy="208"
              r="184"
              fill="url(#ring)"
              animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.6, 1, 0.6], scale: [1, 1.03, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "200px 208px" }}
            />
            <polygon points="200,44 360,140 360,300 200,396 40,300 40,140" fill="none" stroke="rgba(34,211,238,0.12)" strokeWidth="1" />
            <motion.circle
              cx="200"
              cy="208"
              r="150"
              fill="none"
              stroke="rgba(34,211,238,0.10)"
              strokeWidth="1"
              strokeDasharray="2 9"
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 208px" }}
            />
            <g stroke="rgba(34,211,238,0.35)" strokeWidth="1.4" fill="none">
              <path d="M 76 90 L 54 90 L 54 112" />
              <path d="M 324 90 L 346 90 L 346 112" />
              <path d="M 76 330 L 54 330 L 54 308" />
              <path d="M 324 330 L 346 330 L 346 308" />
            </g>

            {/* ════ WINGS ════ */}
            <motion.g animate={flexL} transition={flexTransition} style={{ transformOrigin: `${L.x}px ${L.y}px` }}>
              <path d={wingL.membrane} fill="url(#steelDark)" stroke="rgba(34,211,238,0.22)" strokeWidth="1" style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))" }} />
              {wingL.blades.map((b, i) => (
                <path key={`lb${i}`} d={b.d} fill={b.gold ? "url(#gold)" : "url(#plate)"} stroke="rgba(8,12,22,0.55)" strokeWidth="1" />
              ))}
              {wingL.blades.map((b, i) => (
                <path key={`ls${i}`} d={b.spine} stroke="rgba(200,215,232,0.5)" strokeWidth="0.8" fill="none" />
              ))}
              <path d={wingL.leading} stroke="rgba(103,232,249,0.7)" strokeWidth="1.4" fill="none" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 3px rgba(34,211,238,0.6))" }} />
            </motion.g>
            <motion.g animate={flexR} transition={flexTransition} style={{ transformOrigin: `${R.x}px ${R.y}px` }}>
              <path d={wingR.membrane} fill="url(#steelDark)" stroke="rgba(34,211,238,0.22)" strokeWidth="1" style={{ filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.45))" }} />
              {wingR.blades.map((b, i) => (
                <path key={`rb${i}`} d={b.d} fill={b.gold ? "url(#gold)" : "url(#plate)"} stroke="rgba(8,12,22,0.55)" strokeWidth="1" />
              ))}
              {wingR.blades.map((b, i) => (
                <path key={`rs${i}`} d={b.spine} stroke="rgba(200,215,232,0.5)" strokeWidth="0.8" fill="none" />
              ))}
              <path d={wingR.leading} stroke="rgba(103,232,249,0.7)" strokeWidth="1.4" fill="none" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 3px rgba(34,211,238,0.6))" }} />
            </motion.g>

            {/* shoulder light nodes */}
            <motion.g animate={reducedMotion ? { opacity: 0.9 } : { opacity: [0.6, 1, 0.6] }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
              <circle cx={L.x} cy={L.y} r="3" fill="#a5f3fc" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
              <circle cx={R.x} cy={R.y} r="3" fill="#a5f3fc" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
            </motion.g>

            {/* breathing wrapper for head + chest */}
            <motion.g
              animate={reducedMotion ? {} : { scale: [1, 1.012, 1] }}
              transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "200px 200px" }}
            >
              {/* ════ CHEST SHIELD ════ */}
              <path d="M 174 196 L 226 196 L 234 234 L 200 306 L 166 234 Z" fill="url(#steel)" stroke="rgba(8,12,22,0.55)" strokeWidth="1.2" style={{ filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.45))" }} />
              <path d="M 178 220 L 200 210 L 222 220" stroke="rgba(8,12,22,0.4)" strokeWidth="1" fill="none" />
              <path d="M 184 250 L 200 244 L 216 250 L 200 300 Z" fill="url(#steelDark)" opacity="0.5" />
              <path d="M 200 210 L 200 300" stroke="rgba(34,211,238,0.45)" strokeWidth="1" />
              {/* hex core */}
              <motion.g
                animate={reducedMotion ? { opacity: 0.9 } : { opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <circle cx="200" cy="234" r="14" fill="url(#core)" opacity="0.5" />
                <polygon points="200,224 209,229 209,239 200,244 191,239 191,229" fill="#0a1019" stroke="rgba(34,211,238,0.7)" strokeWidth="1.2" />
                <path d="M 200 229.5 L 201.5 233.4 L 205.6 233.4 L 202.3 235.9 L 203.6 239.8 L 200 237.4 L 196.4 239.8 L 197.7 235.9 L 194.4 233.4 L 198.5 233.4 Z" fill="#ffe9a8" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
              </motion.g>

              {/* ════ CROWN BAND + SWEPT CREST ════ */}
              <path d="M 176 116 Q 200 104 224 116 L 221 124 Q 200 114 179 124 Z" fill="url(#steel)" stroke="rgba(8,12,22,0.5)" strokeWidth="0.8" />
              <path d="M 184 116 L 172 64 L 192 112 Z" fill="url(#gold)" style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))" }} />
              <path d="M 197 112 L 201 54 L 209 110 Z" fill="url(#gold)" style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))" }} />
              <path d="M 216 116 L 228 64 L 208 112 Z" fill="url(#gold)" style={{ filter: "drop-shadow(0 0 4px rgba(251,191,36,0.4))" }} />

              {/* ════ HELMET HEAD ════ */}
              <path
                d="M 200 108 C 233 108 256 131 256 161 C 256 181 246 197 227 207 L 220 216 L 200 222 L 180 216 L 173 207 C 154 197 144 181 144 161 C 144 131 167 108 200 108 Z"
                fill="url(#steel)"
                stroke="rgba(8,12,22,0.5)"
                strokeWidth="1.2"
                style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}
              />
              <path d="M 200 110 L 200 150" stroke="rgba(8,12,22,0.28)" strokeWidth="1" />
              <path d="M 158 168 Q 162 192 180 208" stroke="rgba(8,12,22,0.3)" strokeWidth="1" fill="none" />
              <path d="M 242 168 Q 238 192 220 208" stroke="rgba(8,12,22,0.3)" strokeWidth="1" fill="none" />
              <path d="M 182 214 Q 200 222 218 214" stroke="rgba(8,12,22,0.3)" strokeWidth="1" fill="none" />
              <ellipse cx="180" cy="136" rx="20" ry="8" fill="rgba(255,255,255,0.5)" style={{ filter: "blur(3px)" }} />
              <path d="M 253 140 Q 258 165 246 192" stroke="rgba(103,232,249,0.55)" strokeWidth="2" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px rgba(34,211,238,0.5))" }} />
              <path d="M 147 140 Q 142 165 154 192" stroke="rgba(167,139,250,0.45)" strokeWidth="1.8" fill="none" strokeLinecap="round" />

              {/* ════ ANGULAR VISOR ════ */}
              <path d="M 152 158 L 176 149 L 198 158 L 200 163 L 202 158 L 224 149 L 248 158 L 244 181 L 224 191 L 202 187 L 200 185 L 198 187 L 176 191 L 156 181 Z" fill="#0a1019" stroke="rgba(34,211,238,0.25)" strokeWidth="0.8" />

              {/* ════ FIERCE EYES ════ */}
              <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                <motion.g
                  animate={blink ? { scaleY: 0.1 } : { scaleY: 1 }}
                  transition={{ duration: 0.1 }}
                  style={{ transformOrigin: "200px 172px" }}
                >
                  <path d="M 166 164 L 193 171 L 188 180 L 168 177 Z" fill="url(#eye)" filter="url(#eyeBloom)" />
                  <path d="M 234 164 L 207 171 L 212 180 L 232 177 Z" fill="url(#eye)" filter="url(#eyeBloom)" />
                  <path d="M 175 173 L 187 175" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                  <path d="M 225 173 L 213 175" stroke="#ffffff" strokeWidth="1.2" opacity="0.8" />
                </motion.g>
              </motion.g>
              <path d="M 194 175 L 200 182 L 206 175" stroke="rgba(34,211,238,0.7)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 160 186 Q 200 178 240 186" stroke="rgba(34,211,238,0.55)" strokeWidth="1.2" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />

              {/* ════ BEAK ════ */}
              <path d="M 188 197 L 212 197 L 205 215 Q 200 227 200 227 Q 200 227 195 215 Z" fill="url(#gold)" stroke="rgba(120,53,15,0.5)" strokeWidth="0.8" style={{ filter: "drop-shadow(0 3px 5px rgba(0,0,0,0.4))" }} />
              <path d="M 200 227 Q 196 221 196 213 L 204 213 Q 204 221 200 227 Z" fill="#8a3d0c" />
              <path d="M 194 201 L 206 201" stroke="rgba(120,53,15,0.5)" strokeWidth="1" />
            </motion.g>

            {/* ════ HOVER DISC ════ */}
            <motion.ellipse cx="200" cy="344" rx="62" ry="8" fill="none" stroke="#22d3ee" strokeWidth="1.4" animate={reducedMotion ? { opacity: 0.6 } : { rx: [56, 68, 56], opacity: [0.45, 0.8, 0.45] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
            <motion.ellipse cx="200" cy="344" rx="42" ry="5" fill="none" stroke="#67e8f9" strokeWidth="0.9" animate={reducedMotion ? { opacity: 0.4 } : { rx: [36, 50, 36], opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }} />
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
