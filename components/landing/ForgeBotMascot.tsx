"use client";

/**
 * ForgeBot Mascot v12 — "Haribon Mk II" (robust futuristic Philippine Eagle).
 *
 * Full scrap of the EVE-egg lineage. v9–v11 kept the egg body and glued
 * feathers on, so it read as "white blob with a mohawk." This is built
 * from the eagle OUT:
 *
 *   - HOOKED BEAK as the silhouette anchor (the single thing that makes a
 *     shape read "eagle"). Large, metallic gold, curved hook + gape line +
 *     nostril. Center of the face.
 *   - HEAVY SWEPT BROW MASK — the fierce eagle scowl rendered as a dark
 *     futuristic visor that sweeps up at the outer corners. Glowing cyan
 *     under-edge. Eyes glow through it.
 *   - FLARED ARMORED CREST — a full crown of 13 swept feather shards
 *     (bronze base → amber → glowing gold tips), widest and tallest in the
 *     middle, fanning wide at the edges. This is the Philippine Eagle's
 *     signature shaggy crest, stylized as a mecha crown.
 *   - FIERCE GLOWING EYES — angular cyan lenses, intense but with a clean
 *     friendly glow (cool, not scary — it's a kids' companion). Blink +
 *     micro-saccade + mouse-track preserved.
 *   - FEATHERED BREASTPLATE — three tapering rows of armored feather
 *     petals forming robust shoulders + chest, with a quiet PH-flag chest
 *     sigil (3 amber stars).
 *   - ANGULAR WINGS — layered flight-feather shards at the shoulders
 *     (replacing the egg-pods). Right wing flares on the wave gesture with
 *     an energy-meridian glow.
 *
 * Palette: cream-metal head, bronze→gold crest + beak (PH flag yellow),
 * cyan glowing eyes/HUD, violet halo accent. All three PH flag colors
 * present without being a flag decal.
 *
 * Motion scaffolding preserved from v11 (breathing, blink, wave,
 * micro-saccades, mouse-track, hover disc, orbit, hue-shift halo,
 * prismatic sheen, prefers-reduced-motion). Public API unchanged.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  className?: string;
}

/* ─── Geometry helpers (pure, deterministic — SSR-safe) ─────────────── */

/** A tapered feather shard: curves base-left → tip → base-right. */
function shard(
  cx: number,
  cy: number,
  angleDeg: number,
  length: number,
  baseW: number
): string {
  const a = (angleDeg * Math.PI) / 180; // 0 = straight up
  const dx = Math.sin(a);
  const dy = -Math.cos(a);
  const px = Math.cos(a);
  const py = Math.sin(a);
  const blx = cx - (px * baseW) / 2;
  const bly = cy - (py * baseW) / 2;
  const brx = cx + (px * baseW) / 2;
  const bry = cy + (py * baseW) / 2;
  const tipx = cx + dx * length;
  const tipy = cy + dy * length;
  const mLx = cx + dx * length * 0.5 - px * baseW * 0.22;
  const mLy = cy + dy * length * 0.5 - py * baseW * 0.22;
  const mRx = cx + dx * length * 0.5 + px * baseW * 0.22;
  const mRy = cy + dy * length * 0.5 + py * baseW * 0.22;
  const f = (n: number) => n.toFixed(1);
  return `M ${f(blx)} ${f(bly)} Q ${f(mLx)} ${f(mLy)} ${f(tipx)} ${f(
    tipy
  )} Q ${f(mRx)} ${f(mRy)} ${f(brx)} ${f(bry)} Z`;
}

/** Tip coordinate of a shard (for glowing tip orbs). */
function shardTip(
  cx: number,
  cy: number,
  angleDeg: number,
  length: number
): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + Math.sin(a) * length, cy - Math.cos(a) * length];
}

/** A downward rounded feather petal (breastplate). */
function petal(cx: number, topY: number, w: number, h: number): string {
  const f = (n: number) => n.toFixed(1);
  return `M ${f(cx - w / 2)} ${f(topY)} C ${f(cx - w / 2)} ${f(
    topY + h * 0.7
  )} ${f(cx)} ${f(topY + h)} ${f(cx)} ${f(topY + h)} C ${f(cx)} ${f(
    topY + h
  )} ${f(cx + w / 2)} ${f(topY + h * 0.7)} ${f(cx + w / 2)} ${f(topY)} Z`;
}

export function ForgeBotMascot({ size = 380, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 70, damping: 14, mass: 0.7 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [13, -13]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-8, 8]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-3.5, 3.5]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-2, 2]), springConfig);

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
        setSaccade({ x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 2.4 });
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

  // ─── Crest: 13 swept feather shards anchored behind the skull ───
  const crest = useMemo(() => {
    const ANCHOR_X = 200;
    const ANCHOR_Y = 168;
    return Array.from({ length: 13 }).map((_, i) => {
      const t = (i / 12) * 2 - 1; // -1..1
      const angle = t * 86; // degrees from vertical → wide fan
      const length = 132 - Math.abs(t) * 50; // tallest in the middle
      const baseW = 17 - Math.abs(t) * 5;
      const [tx, ty] = shardTip(ANCHOR_X, ANCHOR_Y, angle, length);
      return {
        outer: shard(ANCHOR_X, ANCHOR_Y, angle, length, baseW),
        inner: shard(ANCHOR_X, ANCHOR_Y, angle, length * 0.78, baseW * 0.5),
        tipX: tx,
        tipY: ty,
        delay: Math.abs(t) * 0.5,
      };
    });
  }, []);

  // ─── Breastplate feather rows (robust shoulders + chest) ───
  const breast = useMemo(() => {
    const rows = [
      { y: 296, w: 42, h: 50, centers: [146, 173, 200, 227, 254] },
      { y: 332, w: 38, h: 46, centers: [160, 187, 213, 240] },
      { y: 364, w: 34, h: 40, centers: [174, 200, 226] },
    ];
    return rows.flatMap((r) =>
      r.centers.map((cx) => ({ d: petal(cx, r.y, r.w, r.h), cx, topY: r.y }))
    );
  }, []);

  // ─── Wing flight-feather shards ───
  const leftWing = useMemo(
    () => [
      shard(132, 256, 226, 84, 18),
      shard(124, 262, 236, 92, 17),
      shard(118, 270, 246, 86, 15),
    ],
    []
  );
  const rightWing = useMemo(
    () => [
      shard(268, 256, 134, 84, 18),
      shard(276, 262, 124, 92, 17),
      shard(282, 270, 114, 86, 15),
    ],
    []
  );

  const orbitParticles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        angle: (i / 14) * Math.PI * 2,
        delay: (i / 14) * 2.6,
        size: 1.6 + ((i * 37) % 18) / 10, // deterministic
        hue: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#22d3ee" : "#a78bfa",
      })),
    []
  );

  const breathAnim = reducedMotion ? {} : { scale: [1, 1.013, 1, 1.007, 1] };
  const breathTransition = { duration: 4.4, repeat: Infinity, ease: "easeInOut" } as const;

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
            "radial-gradient(circle at 50% 46%, transparent 26%, rgba(34,211,238,0.34) 42%, rgba(251,191,36,0.18) 56%, rgba(167,139,250,0.24) 70%, transparent 82%)",
        }}
      />

      <motion.div
        animate={reducedMotion ? {} : { y: [0, -12, 0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%" }}
      >
        <motion.div
          style={{ rotateY, rotateX, transformStyle: "preserve-3d", width: "100%" }}
        >
          <svg
            viewBox="0 0 400 440"
            width="100%"
            height="auto"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              display: "block",
              filter: "drop-shadow(0 30px 60px rgba(34,211,238,0.4))",
            }}
          >
            <defs>
              <radialGradient id="headGrad" cx="34%" cy="16%" r="84%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="42%" stopColor="#eef1f5" />
                <stop offset="76%" stopColor="#d6dce4" />
                <stop offset="100%" stopColor="#b8c0cc" />
              </radialGradient>
              <linearGradient id="headShade" x1="20%" y1="0%" x2="100%" y2="80%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="58%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(30,41,59,0.4)" />
              </linearGradient>
              {/* Crest: bronze base → amber → gold tip */}
              <linearGradient id="crestGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#78350f" />
                <stop offset="38%" stopColor="#b45309" />
                <stop offset="72%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fcd34d" />
              </linearGradient>
              <linearGradient id="crestInner" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#b45309" stopOpacity="0" />
                <stop offset="60%" stopColor="#fbbf24" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#fef3c7" />
              </linearGradient>
              {/* Beak: gold metal */}
              <linearGradient id="beakGrad" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="35%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              {/* Brow visor */}
              <radialGradient id="visorGrad" cx="38%" cy="22%" r="90%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="48%" stopColor="#0c0a1f" />
                <stop offset="100%" stopColor="#000000" />
              </radialGradient>
              <linearGradient id="prismaticSheen" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="42%" stopColor="rgba(167,139,250,0.5)" />
                <stop offset="50%" stopColor="rgba(251,191,36,0.6)" />
                <stop offset="58%" stopColor="rgba(34,211,238,0.5)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              <linearGradient id="eyeLED" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#a5f3fc" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <radialGradient id="discGlow" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="30%" stopColor="#22d3ee" stopOpacity="1" />
                <stop offset="50%" stopColor="#fbbf24" stopOpacity="1" />
                <stop offset="70%" stopColor="#a78bfa" stopOpacity="1" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="wingGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#eef1f5" />
                <stop offset="100%" stopColor="#aab2bf" />
              </linearGradient>

              <filter id="eyeBloom" x="-120%" y="-120%" width="340%" height="340%">
                <feGaussianBlur stdDeviation="3" result="b1" />
                <feGaussianBlur stdDeviation="8" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="tipBloom" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="2.4" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <clipPath id="visorClip">
                <path d="M 118 188 C 124 168 150 160 176 168 C 188 172 196 180 200 192 C 204 180 212 172 224 168 C 250 160 276 168 282 188 C 288 208 281 230 262 240 C 238 252 210 254 200 254 C 190 254 162 252 138 240 C 119 230 112 208 118 188 Z" />
              </clipPath>
            </defs>

            {/* ── BACK ORBIT ── */}
            <motion.g
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 244px" }}
            >
              <ellipse cx="200" cy="244" rx="174" ry="48" fill="none" stroke="url(#orbitGrad)" strokeWidth="2" opacity="0.6" style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.8))" }} />
              <ellipse cx="200" cy="252" rx="156" ry="42" fill="none" stroke="url(#orbitGrad)" strokeWidth="1" opacity="0.4" strokeDasharray="3 8" />
            </motion.g>

            {orbitParticles.map((p, i) => {
              const cx = 200 + Math.cos(p.angle) * 172;
              const cy = 246 + Math.sin(p.angle) * 46;
              return (
                <motion.circle
                  key={i}
                  cx={cx}
                  cy={cy}
                  r={p.size}
                  fill={p.hue}
                  animate={reducedMotion ? { opacity: 0.5 } : { opacity: [0, 1, 0], scale: [0.4, 1.6, 0.4] }}
                  transition={{ duration: 2.8, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: `drop-shadow(0 0 6px ${p.hue})` }}
                />
              );
            })}

            {/* ── HOVER DISC ── */}
            <motion.ellipse cx="200" cy="406" rx="94" ry="13" fill="url(#discGlow)" animate={reducedMotion ? { opacity: 0.7 } : { rx: [90, 102, 90], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "blur(8px)" }} />
            <ellipse cx="200" cy="408" rx="62" ry="6" fill="rgba(0,0,0,0.6)" style={{ filter: "blur(7px)" }} />
            <motion.ellipse cx="200" cy="404" rx="60" ry="4" fill="none" stroke="#22d3ee" strokeWidth="1.3" animate={reducedMotion ? { opacity: 0.7 } : { rx: [54, 70, 54], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
            <motion.ellipse cx="200" cy="404" rx="42" ry="3" fill="none" stroke="#67e8f9" strokeWidth="0.9" animate={reducedMotion ? { opacity: 0.6 } : { rx: [36, 52, 36], opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.6 }} />

            {/* ── BREATHING WRAPPER ── */}
            <motion.g animate={breathAnim} transition={breathTransition} style={{ transformOrigin: "200px 230px" }}>

              {/* ════ CREST CROWN (behind head) ════ */}
              <motion.ellipse cx="200" cy="80" rx="118" ry="46" fill="#fcd34d" opacity="0.0" />
              <motion.g
                animate={reducedMotion ? {} : { rotate: [-1.3, 1.3, -1.3] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "200px 168px" }}
              >
                {/* soft amber aura */}
                <ellipse cx="200" cy="78" rx="112" ry="50" fill="#f59e0b" opacity="0.16" style={{ filter: "blur(14px)" }} />
                {crest.map((c, i) => (
                  <g key={i} style={{ filter: "drop-shadow(0 3px 6px rgba(120,53,15,0.45))" }}>
                    <path d={c.outer} fill="url(#crestGrad)" stroke="rgba(120,53,15,0.4)" strokeWidth="0.5" />
                    <path d={c.inner} fill="url(#crestInner)" opacity="0.8" />
                    <motion.circle
                      cx={c.tipX}
                      cy={c.tipY}
                      r="2.6"
                      fill="#fef3c7"
                      filter="url(#tipBloom)"
                      animate={reducedMotion ? { opacity: 0.9 } : { opacity: [0.6, 1, 0.6], r: [2.6, 3.4, 2.6] }}
                      transition={{ duration: 2.2, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
                      style={{ filter: "drop-shadow(0 0 6px #fbbf24)" }}
                    />
                  </g>
                ))}
              </motion.g>

              {/* ════ WINGS (behind head, at shoulders) ════ */}
              <motion.g
                animate={reducedMotion ? {} : { rotate: [-2.5, 2.5, -2.5], y: [0, -4, 0] }}
                transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "128px 262px" }}
              >
                {leftWing.map((d, i) => (
                  <path key={i} d={d} fill="url(#wingGrad)" stroke="rgba(34,211,238,0.25)" strokeWidth="0.7" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.4))" }} />
                ))}
              </motion.g>
              <motion.g
                animate={
                  armWave
                    ? { rotate: [0, -28, -12, -28, -12, 0], y: [0, -10, -6, -10, -6, 0] }
                    : reducedMotion
                    ? {}
                    : { rotate: [2.5, -2.5, 2.5], y: [0, -4, 0] }
                }
                transition={
                  armWave
                    ? { duration: 1.4, ease: "easeInOut" }
                    : { duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 0.8 }
                }
                style={{ transformOrigin: "272px 262px" }}
              >
                {rightWing.map((d, i) => (
                  <path key={i} d={d} fill="url(#wingGrad)" stroke="rgba(34,211,238,0.25)" strokeWidth="0.7" style={{ filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.4))" }} />
                ))}
                {/* energy meridian flares on wave */}
                <motion.path
                  d={rightWing[1]}
                  fill="none"
                  stroke="#67e8f9"
                  strokeWidth="1.4"
                  animate={armWave ? { opacity: [0.1, 0.9, 0.1, 0.9, 0.1] } : { opacity: 0.12 }}
                  transition={armWave ? { duration: 1.4, ease: "easeInOut" } : { duration: 0.6 }}
                  style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }}
                />
              </motion.g>

              {/* ════ BREASTPLATE (behind head bottom) ════ */}
              <g style={{ filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.45))" }}>
                {breast.map((b, i) => (
                  <g key={i}>
                    <path d={b.d} fill="url(#headGrad)" stroke="rgba(120,53,15,0.18)" strokeWidth="0.8" />
                    {/* cyan tip accent */}
                    <circle cx={b.cx} cy={b.topY + 2} r="1.1" fill="rgba(34,211,238,0.5)" />
                  </g>
                ))}
                {/* PH-flag chest sigil — 3 amber stars + faint rays */}
                <motion.g
                  animate={reducedMotion ? { opacity: 0.75 } : { opacity: [0.5, 0.9, 0.5] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <circle cx="186" cy="320" r="1.9" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
                  <circle cx="214" cy="320" r="1.9" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
                  <circle cx="200" cy="306" r="1.9" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
                </motion.g>
              </g>

              {/* ════ HEAD / SKULL (cream metal) ════ */}
              <g style={{ filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.5))" }}>
                <path
                  d="M 200 120
                     C 244 120 278 144 290 184
                     C 297 208 294 232 282 254
                     C 272 274 254 290 230 302
                     C 220 307 210 310 200 310
                     C 190 310 180 307 170 302
                     C 146 290 128 274 118 254
                     C 106 232 103 208 110 184
                     C 122 144 156 120 200 120 Z"
                  fill="url(#headGrad)"
                />
                <path
                  d="M 200 120
                     C 244 120 278 144 290 184
                     C 297 208 294 232 282 254
                     C 272 274 254 290 230 302
                     C 220 307 210 310 200 310
                     C 190 310 180 307 170 302
                     C 146 290 128 274 118 254
                     C 106 232 103 208 110 184
                     C 122 144 156 120 200 120 Z"
                  fill="url(#headShade)"
                />
              </g>

              {/* top-left specular */}
              <ellipse cx="164" cy="150" rx="40" ry="14" fill="rgba(255,255,255,0.92)" style={{ filter: "blur(7px)" }} />
              <ellipse cx="154" cy="144" rx="16" ry="5" fill="white" style={{ filter: "blur(2px)" }} />

              {/* right cyan rim + left violet rim */}
              <path d="M 289 152 Q 296 200 286 250 Q 276 286 252 304" stroke="#67e8f9" strokeWidth="3.5" fill="none" strokeLinecap="round" opacity="0.55" />
              <path d="M 111 152 Q 104 200 114 250 Q 124 286 148 304" stroke="#c4b5fd" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.45" />

              {/* cheek circuit hints */}
              <g opacity="0.3" stroke="#22d3ee" strokeWidth="0.7" fill="none">
                <path d="M 132 244 Q 150 256 168 258" />
                <path d="M 268 244 Q 250 256 232 258" />
              </g>

              {/* ════ BROW VISOR MASK ════ */}
              <motion.g
                animate={reducedMotion ? {} : { rotate: [-0.5, 0.5, -0.5] }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "200px 206px" }}
              >
                {/* bezel */}
                <path
                  d="M 114 186 C 120 164 148 156 176 164 C 188 168 196 178 200 190 C 204 178 212 168 224 164 C 252 156 280 164 286 186 C 292 208 285 232 264 243 C 239 256 210 258 200 258 C 190 258 161 256 136 243 C 115 232 108 208 114 186 Z"
                  fill="rgba(15,23,42,0.5)"
                  style={{ filter: "blur(2px)" }}
                />
                {/* glass */}
                <path
                  d="M 118 188 C 124 168 150 160 176 168 C 188 172 196 180 200 192 C 204 180 212 172 224 168 C 250 160 276 168 282 188 C 288 208 281 230 262 240 C 238 252 210 254 200 254 C 190 254 162 252 138 240 C 119 230 112 208 118 188 Z"
                  fill="url(#visorGrad)"
                />

                {/* scan lines + prismatic sheen, clipped to visor */}
                <g clipPath="url(#visorClip)">
                  <g opacity="0.16">
                    {[0, 1, 2, 3].map((i) => (
                      <line key={i} x1="118" x2="282" y1={180 + i * 16} y2={180 + i * 16} stroke="#22d3ee" strokeWidth="0.5" />
                    ))}
                  </g>
                  <motion.rect
                    x="-40"
                    y="150"
                    width="80"
                    height="120"
                    fill="url(#prismaticSheen)"
                    animate={reducedMotion ? { opacity: 0 } : { x: [-40, 360], opacity: [0, 0.85, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.4 }}
                    style={{ filter: "blur(2px)" }}
                  />
                </g>

                {/* glossy top arc */}
                <path d="M 140 178 Q 200 162 260 178" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* cyan glowing under-rim (the HUD edge) */}
                <path d="M 140 246 Q 200 258 260 246" stroke="rgba(34,211,238,0.6)" strokeWidth="1.6" strokeLinecap="round" fill="none" style={{ filter: "drop-shadow(0 0 5px #22d3ee)" }} />
                {/* center brow notch — the scowl peak */}
                <path d="M 192 192 L 200 200 L 208 192" stroke="rgba(34,211,238,0.5)" strokeWidth="1.4" fill="none" strokeLinecap="round" />

                {/* HUD micro text */}
                <text x="246" y="180" fontSize="5" fill="rgba(251,191,36,0.7)" fontFamily="monospace">⚡</text>
                <text x="132" y="238" fontSize="4.6" fill="rgba(34,211,238,0.5)" fontFamily="monospace">HARIBON</text>

                {/* ══ FIERCE GLOWING EYES ══ */}
                <motion.g
                  style={{ x: eyeOffsetX, y: eyeOffsetY }}
                  animate={{ x: saccade.x, y: saccade.y }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {/* Left eye — angular almond, fierce upward outer corner */}
                  <motion.g animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }} transition={{ duration: 0.1 }} style={{ transformOrigin: "162px 210px" }}>
                    <path d="M 138 214 Q 150 198 186 204 Q 176 218 154 220 Q 142 220 138 214 Z" fill="#22d3ee" filter="url(#eyeBloom)" opacity="0.65" />
                    <path d="M 142 213 Q 152 201 182 206 Q 173 216 156 218 Q 146 218 142 213 Z" fill="url(#eyeLED)" />
                    <ellipse cx="160" cy="210" rx="9" ry="5" fill="#ffffff" opacity="0.95" />
                    <circle cx="156" cy="208" r="2" fill="white" />
                  </motion.g>
                  {/* Right eye — mirror */}
                  <motion.g animate={blink ? { scaleY: 0.12 } : { scaleY: 1 }} transition={{ duration: 0.1 }} style={{ transformOrigin: "238px 210px" }}>
                    <path d="M 262 214 Q 250 198 214 204 Q 224 218 246 220 Q 258 220 262 214 Z" fill="#22d3ee" filter="url(#eyeBloom)" opacity="0.65" />
                    <path d="M 258 213 Q 248 201 218 206 Q 227 216 244 218 Q 254 218 258 213 Z" fill="url(#eyeLED)" />
                    <ellipse cx="240" cy="210" rx="9" ry="5" fill="#ffffff" opacity="0.95" />
                    <circle cx="236" cy="208" r="2" fill="white" />
                  </motion.g>
                </motion.g>
              </motion.g>

              {/* ════ HOOKED BEAK (the silhouette anchor) ════ */}
              <g style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.45))" }}>
                {/* cere (fleshy base) */}
                <path d="M 182 250 Q 200 244 218 250 Q 220 258 216 264 L 184 264 Q 180 258 182 250 Z" fill="#d97706" />
                {/* nostrils */}
                <circle cx="191" cy="256" r="1.5" fill="#451a03" />
                <circle cx="209" cy="256" r="1.5" fill="#451a03" />
                {/* upper mandible — curves down to a hook */}
                <path
                  d="M 184 262
                     Q 200 258 216 262
                     Q 222 286 214 306
                     Q 209 320 200 326
                     Q 198 322 198 314
                     Q 190 318 184 312
                     Q 178 300 178 284
                     Q 178 272 184 262 Z"
                  fill="url(#beakGrad)"
                />
                {/* hook tip — the curl that screams 'raptor' */}
                <path d="M 200 326 Q 209 320 214 306 Q 214 320 206 330 Q 202 332 200 326 Z" fill="#92400e" />
                {/* top ridge highlight */}
                <path d="M 192 266 Q 200 262 208 266 Q 206 290 201 308" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
                {/* gape line */}
                <path d="M 184 284 Q 200 290 216 284" stroke="rgba(69,26,3,0.55)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              </g>
            </motion.g>

            {/* ── FOREGROUND ORBIT ── */}
            <motion.g
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 244px" }}
            >
              <ellipse cx="200" cy="244" rx="174" ry="48" fill="none" stroke="url(#orbitGrad)" strokeWidth="2.5" opacity="0.65" strokeDasharray="112 720" style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,1))" }} />
            </motion.g>
          </svg>
        </motion.div>
      </motion.div>

      <FloatingSparkle delay={0} top="8%" left="6%" hue="#67e8f9" />
      <FloatingSparkle delay={1.4} top="20%" right="4%" hue="#fbbf24" />
      <FloatingSparkle delay={2.8} bottom="26%" left="2%" hue="#a78bfa" />
      <FloatingSparkle delay={2} bottom="18%" right="6%" hue="#67e8f9" />
      <FloatingSparkle delay={1} top="48%" left="0%" hue="#fbbf24" />
      <FloatingSparkle delay={2.6} top="54%" right="0%" hue="#a78bfa" />
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
      animate={{ y: [0, -16, 0], opacity: [0, 1, 0], scale: [0.4, 1.3, 0.4] }}
      transition={{ duration: 3.2, delay, repeat: Infinity, ease: "easeInOut" }}
    >
      ·
    </motion.div>
  );
}
