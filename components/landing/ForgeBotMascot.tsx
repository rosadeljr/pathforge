"use client";

/**
 * ForgeBot Mascot v14 — "Haribon in Flight" (futuristic Philippine Eagle).
 *
 * A full silhouette rebuild. The v9–v13 lineage was a front-facing chibi
 * bust (round head + petal bib) that always read "cute robot-owl." This is
 * the eagle BANKING IN FLIGHT, matching the reference photo:
 *
 *   - SPREAD WINGS — two fans of layered flight-feather blades sweeping up
 *     and out from the shoulders (long primaries reaching skyward, shorter
 *     coverts massing near the body). Gunmetal feathers with cyan edge-light
 *     and gold-tipped primaries. They FLAP (gentle soar + occasional power
 *     stroke).
 *   - TAPERED BODY — a streamlined gunmetal torso, lighter belly, feather
 *     seams, quiet 3-star PH chest sigil.
 *   - FIERCE RAPTOR HEAD — 3/4 turn, brushed-white skull (the bald/PH-eagle
 *     pale head), heavy gunmetal brow ridge, glowing amber eye with a dark
 *     pupil + cyan catch-light, and the signature swept crest shards.
 *   - HOOKED GOLD BEAK — machined gold, curved to a raptor hook: the
 *     silhouette anchor.
 *   - GOLD TALONS — tucked landing gear with curled claws.
 *   - FUTURISTIC FX — energy trails streaming off the wingtips, hue-shift
 *     halo, orbit ring + particles, hover disc, prismatic sheen, sparkles.
 *
 * Palette: silver-white titanium head, gunmetal body/wings, PH-gold beak +
 * crest + talons, cyan energy glow, violet rim accent.
 *
 * Motion scaffolding preserved (float, wing flap, blink, micro-saccades,
 * mouse-track tilt, hover disc, orbit, hue-shift halo, prismatic sheen,
 * prefers-reduced-motion). Public API unchanged.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  className?: string;
}

/* ─── Geometry helpers (pure, deterministic — SSR-safe) ─────────────── */

/** A tapered feather blade: curves base-left → tip → base-right. */
function shard(
  cx: number,
  cy: number,
  angleDeg: number,
  length: number,
  baseW: number
): string {
  const a = (angleDeg * Math.PI) / 180; // 0 = straight up, + = toward right
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
  const mLx = cx + dx * length * 0.5 - px * baseW * 0.28;
  const mLy = cy + dy * length * 0.5 - py * baseW * 0.28;
  const mRx = cx + dx * length * 0.5 + px * baseW * 0.28;
  const mRy = cy + dy * length * 0.5 + py * baseW * 0.28;
  const f = (n: number) => n.toFixed(1);
  return `M ${f(blx)} ${f(bly)} Q ${f(mLx)} ${f(mLy)} ${f(tipx)} ${f(
    tipy
  )} Q ${f(mRx)} ${f(mRy)} ${f(brx)} ${f(bry)} Z`;
}

/** Spine of a feather (base → tip) for neon edge-lighting. */
function shardSpine(
  cx: number,
  cy: number,
  angleDeg: number,
  length: number
): string {
  const a = (angleDeg * Math.PI) / 180;
  const tipx = cx + Math.sin(a) * length;
  const tipy = cy - Math.cos(a) * length;
  const f = (n: number) => n.toFixed(1);
  return `M ${f(cx)} ${f(cy)} L ${f(tipx)} ${f(tipy)}`;
}

/** Tip coordinate of a feather (for glowing tips / energy trails). */
function shardTip(
  cx: number,
  cy: number,
  angleDeg: number,
  length: number
): [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + Math.sin(a) * length, cy - Math.cos(a) * length];
}

interface Feather {
  d: string;
  spine: string;
  tip: [number, number];
  gold: boolean;
}

/**
 * Build one spread wing as a swept fan. Feather bases travel along a short
 * leading edge (shoulder → wrist, up-and-out) so the feathers layer like a
 * real raised wing rather than radiating from a single point (sunburst).
 */
function buildWing(ax: number, ay: number, dir: 1 | -1) {
  const primaries: Feather[] = [];
  const bases: [number, number][] = [];
  const tips: [number, number][] = [];
  const N = 11;
  for (let i = 0; i < N; i++) {
    const f = i / (N - 1);
    const bx = ax + dir * f * 34; // leading edge sweeps up & out
    const by = ay - f * 28;
    const angle = dir * (8 + f * 64); // inner reaches skyward → outer swept out
    const length = 150 - f * 48; // tall raised primaries inside
    const baseW = 26 - f * 11;
    const tip = shardTip(bx, by, angle, length);
    bases.push([bx, by]);
    tips.push(tip);
    primaries.push({
      d: shard(bx, by, angle, length, baseW),
      spine: shardSpine(bx, by, angle, length * 0.9),
      tip,
      gold: i >= N - 4, // outer "finger" primaries gold-tipped
    });
  }
  // Solid wing membrane: down the bases, out to the tips, back — so the gaps
  // between feathers read as wing surface, not background.
  const fmt = (p: [number, number]) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`;
  const membrane =
    `M ${fmt(bases[0])} ` +
    bases.slice(1).map((p) => `L ${fmt(p)}`).join(" ") +
    " " +
    [...tips].reverse().map((p) => `L ${fmt(p)}`).join(" ") +
    " Z";

  const coverts: string[] = [];
  const M = 7;
  for (let i = 0; i < M; i++) {
    const f = i / (M - 1);
    const bx = ax + dir * (4 + f * 22);
    const by = ay + 8 - f * 14;
    const angle = dir * (18 + f * 44);
    const length = 60 - f * 26;
    const baseW = 17 - f * 6;
    coverts.push(shard(bx, by, angle, length, baseW));
  }
  return { primaries, coverts, membrane };
}

export function ForgeBotMascot({ size = 380, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 70, damping: 14, mass: 0.7 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [14, -14]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-9, 9]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-2.6, 2.6]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-1.6, 1.6]), springConfig);

  const [blink, setBlink] = useState(false);
  const [powerFlap, setPowerFlap] = useState(false);
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
        setPowerFlap(true);
        setTimeout(() => setPowerFlap(false), 1500);
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
        setSaccade({ x: (Math.random() - 0.5) * 3, y: (Math.random() - 0.5) * 2 });
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

  // Shoulder pivots
  const R = { x: 232, y: 240 };
  const L = { x: 168, y: 240 };
  const wingR = useMemo(() => buildWing(R.x, R.y, 1), [R.x, R.y]);
  const wingL = useMemo(() => buildWing(L.x, L.y, -1), [L.x, L.y]);

  // Tail: a downward fan of feathers
  const tail = useMemo(() => {
    const out: { d: string; tip: [number, number] }[] = [];
    const N = 7;
    for (let i = 0; i < N; i++) {
      const t = (i / (N - 1)) * 2 - 1; // -1..1
      const angle = 180 + t * 26; // pointing down, fanned
      const length = 70 - Math.abs(t) * 16;
      out.push({
        d: shard(200, 312, angle, length, 16 - Math.abs(t) * 3),
        tip: shardTip(200, 312, angle, length),
      });
    }
    return out;
  }, []);

  // Crest shards swept back over the head
  const crest = useMemo(() => {
    const ANCHOR_X = 196;
    const ANCHOR_Y = 150;
    const N = 7;
    return Array.from({ length: N }).map((_, i) => {
      const t = i / (N - 1); // 0..1
      const angle = -64 + t * 58; // swept up-left → up
      const length = 60 - t * 18;
      const baseW = 9 - t * 3;
      const [tx, ty] = shardTip(ANCHOR_X, ANCHOR_Y, angle, length);
      return {
        outer: shard(ANCHOR_X, ANCHOR_Y, angle, length, baseW),
        spine: shardSpine(ANCHOR_X, ANCHOR_Y, angle, length * 0.9),
        tipX: tx,
        tipY: ty,
        delay: t * 0.4,
      };
    });
  }, []);

  const orbitParticles = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        angle: (i / 14) * Math.PI * 2,
        delay: (i / 14) * 2.6,
        size: 1.6 + ((i * 37) % 18) / 10,
        hue: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#22d3ee" : "#a78bfa",
      })),
    []
  );

  // Wing flap keyframes
  const flapR = powerFlap
    ? { rotate: [0, -22, 6, -22, 6, 0], y: [0, -8, 2, -8, 2, 0] }
    : reducedMotion
    ? {}
    : { rotate: [-5, 6, -5], y: [0, -3, 0] };
  const flapL = powerFlap
    ? { rotate: [0, 22, -6, 22, -6, 0], y: [0, -8, 2, -8, 2, 0] }
    : reducedMotion
    ? {}
    : { rotate: [5, -6, 5], y: [0, -3, 0] };
  const flapTransition = powerFlap
    ? ({ duration: 1.5, ease: "easeInOut" } as const)
    : ({ duration: 4.2, repeat: Infinity, ease: "easeInOut" } as const);

  const breathAnim = reducedMotion ? {} : { scale: [1, 1.012, 1] };
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
            ? { opacity: 0.5 }
            : {
                opacity: [0.45, 0.72, 0.45],
                scale: [1, 1.06, 1],
                filter: [
                  "hue-rotate(0deg) blur(24px)",
                  "hue-rotate(45deg) blur(24px)",
                  "hue-rotate(0deg) blur(24px)",
                ],
              }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, transparent 24%, rgba(34,211,238,0.32) 40%, rgba(251,191,36,0.16) 56%, rgba(167,139,250,0.22) 70%, transparent 82%)",
        }}
      />

      <motion.div
        animate={reducedMotion ? {} : { y: [0, -12, 0, -6, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}
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
              <radialGradient id="headGrad" cx="40%" cy="22%" r="84%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="46%" stopColor="#eef2f7" />
                <stop offset="80%" stopColor="#cdd6e2" />
                <stop offset="100%" stopColor="#a3aebd" />
              </radialGradient>
              <linearGradient id="bodyGrad" x1="30%" y1="0%" x2="70%" y2="100%">
                <stop offset="0%" stopColor="#6c7c93" />
                <stop offset="50%" stopColor="#3a4862" />
                <stop offset="100%" stopColor="#1b2536" />
              </linearGradient>
              <linearGradient id="bellyGrad" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#9fb0c6" />
                <stop offset="100%" stopColor="#dbe4f0" />
              </linearGradient>
              {/* Feathers: cool gunmetal blade */}
              <linearGradient id="featherGrad" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#1b2330" />
                <stop offset="55%" stopColor="#46566b" />
                <stop offset="100%" stopColor="#8d9cb1" />
              </linearGradient>
              {/* Gold confined to the very tip (clean, no orange smear) */}
              <linearGradient id="featherGold" x1="50%" y1="100%" x2="50%" y2="0%">
                <stop offset="0%" stopColor="#1b2330" />
                <stop offset="68%" stopColor="#46566b" />
                <stop offset="86%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#fde68a" />
              </linearGradient>
              {/* Holographic sheen across the wing membranes */}
              <linearGradient id="holoSheen" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0" />
                <stop offset="42%" stopColor="#22d3ee" stopOpacity="0.18" />
                <stop offset="60%" stopColor="#a78bfa" stopOpacity="0.22" />
                <stop offset="80%" stopColor="#fbbf24" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
              </linearGradient>
              {/* Arc-reactor chest core */}
              <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="30%" stopColor="#a5f3fc" />
                <stop offset="70%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7490" stopOpacity="0" />
              </radialGradient>
              <linearGradient id="crestGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="60%" stopColor="#d97706" />
                <stop offset="100%" stopColor="#fcd34d" />
              </linearGradient>
              <linearGradient id="beakGrad" x1="20%" y1="0%" x2="80%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="40%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <radialGradient id="eyeGrad" cx="40%" cy="35%" r="70%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="60%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
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
              <linearGradient id="trailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" stopOpacity="0" />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.9" />
              </linearGradient>

              <filter id="eyeBloom" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="2.4" result="b1" />
                <feGaussianBlur stdDeviation="6" result="b2" />
                <feMerge>
                  <feMergeNode in="b2" />
                  <feMergeNode in="b1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="tipBloom" x="-150%" y="-150%" width="400%" height="400%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ── BACK ORBIT ── */}
            <motion.g
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 250px" }}
            >
              <ellipse cx="200" cy="250" rx="178" ry="50" fill="none" stroke="url(#orbitGrad)" strokeWidth="2" opacity="0.55" style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.8))" }} />
              <ellipse cx="200" cy="258" rx="158" ry="44" fill="none" stroke="url(#orbitGrad)" strokeWidth="1" opacity="0.35" strokeDasharray="3 8" />
            </motion.g>

            {orbitParticles.map((p, i) => {
              const cx = 200 + Math.cos(p.angle) * 176;
              const cy = 252 + Math.sin(p.angle) * 48;
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
            <motion.ellipse cx="200" cy="416" rx="86" ry="12" fill="url(#discGlow)" animate={reducedMotion ? { opacity: 0.7 } : { rx: [82, 94, 82], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "blur(8px)" }} />
            <ellipse cx="200" cy="418" rx="56" ry="5" fill="rgba(0,0,0,0.55)" style={{ filter: "blur(7px)" }} />
            <motion.ellipse cx="200" cy="415" rx="54" ry="4" fill="none" stroke="#22d3ee" strokeWidth="1.2" animate={reducedMotion ? { opacity: 0.7 } : { rx: [48, 64, 48], opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />

            {/* ════ WINGTIP ENERGY TRAILS (behind everything) ════ */}
            {!reducedMotion && (
              <>
                <motion.path
                  d={`M ${wingL.primaries[10].tip[0].toFixed(0)} ${wingL.primaries[10].tip[1].toFixed(0)} Q 70 150 40 110`}
                  fill="none"
                  stroke="url(#trailGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ opacity: [0.1, 0.6, 0.1] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
                  style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
                />
                <motion.path
                  d={`M ${wingR.primaries[10].tip[0].toFixed(0)} ${wingR.primaries[10].tip[1].toFixed(0)} Q 330 150 360 110`}
                  fill="none"
                  stroke="url(#trailGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  animate={{ opacity: [0.1, 0.6, 0.1] }}
                  transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                  style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }}
                />
              </>
            )}

            {/* ── BREATHING WRAPPER ── */}
            <motion.g animate={breathAnim} transition={breathTransition} style={{ transformOrigin: "200px 250px" }}>

              {/* ════ LEFT WING ════ */}
              <motion.g animate={flapL} transition={flapTransition} style={{ transformOrigin: `${L.x}px ${L.y}px` }}>
                {/* solid wing membrane + neon edge */}
                <path d={wingL.membrane} fill="url(#featherGrad)" stroke="rgba(34,211,238,0.4)" strokeWidth="1" style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.45))" }} />
                {/* holographic sheen */}
                <path d={wingL.membrane} fill="url(#holoSheen)" />
                {/* covert underlayer */}
                {wingL.coverts.map((d, i) => (
                  <path key={`lc${i}`} d={d} fill="url(#bodyGrad)" stroke="rgba(8,12,24,0.4)" strokeWidth="0.6" opacity="0.92" />
                ))}
                {/* primaries */}
                {wingL.primaries.map((ft, i) => (
                  <g key={`lp${i}`} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
                    <path d={ft.d} fill={ft.gold ? "url(#featherGold)" : "url(#featherGrad)"} stroke="rgba(8,12,24,0.45)" strokeWidth="0.6" />
                    <path d={ft.spine} stroke="rgba(103,232,249,0.55)" strokeWidth="0.9" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 2px rgba(34,211,238,0.6))" }} />
                  </g>
                ))}
                {/* neon tip nodes */}
                {wingL.primaries.map((ft, i) => (
                  <motion.circle
                    key={`lt${i}`}
                    cx={ft.tip[0]}
                    cy={ft.tip[1]}
                    r="1.7"
                    fill={ft.gold ? "#fde68a" : "#a5f3fc"}
                    animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.4, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 4px ${ft.gold ? "#fbbf24" : "#22d3ee"})` }}
                  />
                ))}
              </motion.g>

              {/* ════ RIGHT WING ════ */}
              <motion.g animate={flapR} transition={flapTransition} style={{ transformOrigin: `${R.x}px ${R.y}px` }}>
                {/* solid wing membrane + neon edge */}
                <path d={wingR.membrane} fill="url(#featherGrad)" stroke="rgba(34,211,238,0.4)" strokeWidth="1" style={{ filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.45))" }} />
                {/* holographic sheen */}
                <path d={wingR.membrane} fill="url(#holoSheen)" />
                {wingR.coverts.map((d, i) => (
                  <path key={`rc${i}`} d={d} fill="url(#bodyGrad)" stroke="rgba(8,12,24,0.4)" strokeWidth="0.6" opacity="0.92" />
                ))}
                {wingR.primaries.map((ft, i) => (
                  <g key={`rp${i}`} style={{ filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.4))" }}>
                    <path d={ft.d} fill={ft.gold ? "url(#featherGold)" : "url(#featherGrad)"} stroke="rgba(8,12,24,0.45)" strokeWidth="0.6" />
                    <path d={ft.spine} stroke="rgba(103,232,249,0.55)" strokeWidth="0.9" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 2px rgba(34,211,238,0.6))" }} />
                  </g>
                ))}
                {/* neon tip nodes */}
                {wingR.primaries.map((ft, i) => (
                  <motion.circle
                    key={`rt${i}`}
                    cx={ft.tip[0]}
                    cy={ft.tip[1]}
                    r="1.7"
                    fill={ft.gold ? "#fde68a" : "#a5f3fc"}
                    animate={reducedMotion ? { opacity: 0.8 } : { opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 2.4, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
                    style={{ filter: `drop-shadow(0 0 4px ${ft.gold ? "#fbbf24" : "#22d3ee"})` }}
                  />
                ))}
              </motion.g>

              {/* ════ TAIL ════ */}
              <g style={{ filter: "drop-shadow(0 8px 12px rgba(0,0,0,0.4))" }}>
                {tail.map((tf, i) => (
                  <g key={`t${i}`}>
                    <path d={tf.d} fill="url(#featherGrad)" stroke="rgba(8,12,24,0.4)" strokeWidth="0.6" />
                    {/* white tail tip (PH/bald eagle) */}
                    <circle cx={tf.tip[0]} cy={tf.tip[1]} r="3.4" fill="#eef2f7" opacity="0.9" />
                  </g>
                ))}
              </g>

              {/* ════ BODY / TORSO ════ */}
              <g style={{ filter: "drop-shadow(0 12px 24px rgba(0,0,0,0.5))" }}>
                <path
                  d="M 200 196
                     C 224 198 240 214 244 244
                     C 247 268 242 296 228 318
                     C 220 330 210 336 200 336
                     C 190 336 180 330 172 318
                     C 158 296 153 268 156 244
                     C 160 214 176 198 200 196 Z"
                  fill="url(#bodyGrad)"
                />
                {/* lighter belly */}
                <path
                  d="M 200 232
                     C 214 234 222 250 222 272
                     C 222 296 213 318 200 326
                     C 187 318 178 296 178 272
                     C 178 250 186 234 200 232 Z"
                  fill="url(#bellyGrad)"
                  opacity="0.92"
                />
                {/* mecha panel seams */}
                <g stroke="rgba(8,12,24,0.45)" strokeWidth="0.9" fill="none" strokeLinecap="round">
                  <path d="M 200 214 L 200 236" />
                  <path d="M 178 246 Q 200 240 222 246" />
                  <path d="M 172 300 Q 200 312 228 300" />
                  <path d="M 184 318 L 190 328 M 216 318 L 210 328" />
                </g>
                {/* thin cyan circuit seams */}
                <g stroke="rgba(34,211,238,0.4)" strokeWidth="0.6" fill="none" strokeLinecap="round">
                  <path d="M 200 216 L 200 250" style={{ filter: "drop-shadow(0 0 2px #22d3ee)" }} />
                  <path d="M 182 300 Q 200 310 218 300" />
                </g>

                {/* ── ARC-REACTOR CHEST CORE ── */}
                <motion.g
                  animate={reducedMotion ? { opacity: 0.9 } : { opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  style={{ transformOrigin: "200px 280px" }}
                >
                  <circle cx="200" cy="280" r="15" fill="url(#coreGlow)" opacity="0.55" />
                  <circle cx="200" cy="280" r="9" fill="none" stroke="rgba(34,211,238,0.7)" strokeWidth="1.2" style={{ filter: "drop-shadow(0 0 4px #22d3ee)" }} />
                  <motion.circle
                    cx="200"
                    cy="280"
                    r="6"
                    fill="none"
                    stroke="rgba(167,139,250,0.6)"
                    strokeWidth="0.8"
                    strokeDasharray="2 3"
                    animate={reducedMotion ? {} : { rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "200px 280px" }}
                  />
                  {/* gold star at the core */}
                  <path
                    d="M 200 273 L 201.8 278 L 207 278 L 202.8 281.2 L 204.4 286 L 200 283 L 195.6 286 L 197.2 281.2 L 193 278 L 198.2 278 Z"
                    fill="#fde68a"
                    style={{ filter: "drop-shadow(0 0 4px #fbbf24)" }}
                  />
                  {/* 3 PH stars orbiting */}
                  <circle cx="200" cy="262" r="1.5" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
                  <circle cx="184" cy="294" r="1.5" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
                  <circle cx="216" cy="294" r="1.5" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 3px #fbbf24)" }} />
                </motion.g>
              </g>

              {/* ════ TALONS (tucked landing gear) ════ */}
              <g style={{ filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.45))" }} stroke="#92400e" strokeWidth="0.6">
                <path d="M 186 326 q -4 8 -2 16 q 1 4 5 4 q -3 -6 -1 -12 q -2 5 -5 7 q 4 -8 1 -15 Z" fill="url(#beakGrad)" />
                <path d="M 210 328 q 4 8 2 16 q -1 4 -5 4 q 3 -6 1 -12 q 2 5 5 7 q -4 -8 -1 -15 Z" fill="url(#beakGrad)" />
              </g>

              {/* ════ NECK CONNECT ════ */}
              <path d="M 180 200 Q 200 188 220 200 Q 214 214 200 216 Q 186 214 180 200 Z" fill="url(#bodyGrad)" />

              {/* ════ CREST (swept back behind head) ════ */}
              <motion.g
                animate={reducedMotion ? {} : { rotate: [-1.4, 1.4, -1.4] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{ transformOrigin: "196px 150px" }}
              >
                {crest.map((c, i) => (
                  <g key={`cr${i}`} style={{ filter: "drop-shadow(0 2px 4px rgba(15,23,42,0.5))" }}>
                    <path d={c.outer} fill="url(#crestGrad)" stroke="rgba(8,12,24,0.4)" strokeWidth="0.5" />
                    <path d={c.spine} stroke="rgba(103,232,249,0.5)" strokeWidth="0.8" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 2px rgba(34,211,238,0.7))" }} />
                    <motion.circle
                      cx={c.tipX}
                      cy={c.tipY}
                      r="2"
                      fill="#fef3c7"
                      filter="url(#tipBloom)"
                      animate={reducedMotion ? { opacity: 0.9 } : { opacity: [0.6, 1, 0.6], r: [2, 2.8, 2] }}
                      transition={{ duration: 2.2, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
                      style={{ filter: "drop-shadow(0 0 5px #fbbf24)" }}
                    />
                  </g>
                ))}
              </motion.g>

              {/* ════ HEAD (3/4 fierce raptor, facing right) ════ */}
              <g style={{ filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.5))" }}>
                {/* skull */}
                <path
                  d="M 168 158
                     C 168 134 186 120 208 122
                     C 228 124 242 140 242 160
                     C 242 174 236 186 224 194
                     C 232 196 240 200 246 206
                     C 236 210 224 210 214 206
                     C 206 210 196 212 186 210
                     C 174 206 166 196 164 184
                     C 162 174 163 166 168 158 Z"
                  fill="url(#headGrad)"
                />
                {/* nape shade */}
                <path d="M 168 158 C 166 172 168 188 180 198 C 172 196 165 186 163 174 C 162 168 164 162 168 158 Z" fill="rgba(15,23,42,0.18)" />
              </g>

              {/* head specular */}
              <ellipse cx="190" cy="142" rx="22" ry="9" fill="rgba(255,255,255,0.9)" style={{ filter: "blur(5px)" }} />
              {/* cyan rim light on the back of the head */}
              <path d="M 170 134 Q 162 158 174 192" stroke="#67e8f9" strokeWidth="2.6" fill="none" strokeLinecap="round" opacity="0.55" style={{ filter: "drop-shadow(0 0 4px rgba(34,211,238,0.6))" }} />
              {/* skull panel seam */}
              <path d="M 184 126 Q 206 132 222 150" stroke="rgba(148,163,184,0.5)" strokeWidth="0.8" fill="none" strokeLinecap="round" />

              {/* heavy gunmetal brow ridge (the fierce scowl) */}
              <path d="M 196 150 Q 220 142 240 154 Q 234 162 224 164 Q 210 158 198 162 Q 196 156 196 150 Z" fill="url(#bodyGrad)" />
              {/* HUD brow visor arc */}
              <path d="M 197 153 Q 218 145 238 156" stroke="rgba(34,211,238,0.7)" strokeWidth="1.3" fill="none" strokeLinecap="round" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />
              {/* targeting reticle ticks above the eye */}
              <g stroke="rgba(103,232,249,0.6)" strokeWidth="0.8" strokeLinecap="round">
                <line x1="218" y1="154" x2="218" y2="158" />
                <line x1="230" y1="159" x2="233" y2="161" />
                <line x1="206" y1="159" x2="203" y2="161" />
              </g>

              {/* ════ EYE (fierce amber lens) ════ */}
              <motion.g
                style={{ x: eyeOffsetX, y: eyeOffsetY }}
                animate={{ x: saccade.x, y: saccade.y }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <motion.g animate={blink ? { scaleY: 0.1 } : { scaleY: 1 }} transition={{ duration: 0.1 }} style={{ transformOrigin: "218px 168px" }}>
                  {/* outer glow */}
                  <ellipse cx="218" cy="168" rx="12" ry="10" fill="#f59e0b" filter="url(#eyeBloom)" opacity="0.5" />
                  {/* sclera */}
                  <ellipse cx="218" cy="168" rx="10.5" ry="8.5" fill="url(#eyeGrad)" stroke="#78350f" strokeWidth="0.8" />
                  {/* pupil */}
                  <circle cx="221" cy="168" r="4.2" fill="#1a0f02" />
                  {/* cyan catch-light */}
                  <circle cx="219.4" cy="166" r="1.6" fill="#a5f3fc" style={{ filter: "drop-shadow(0 0 3px #22d3ee)" }} />
                  <circle cx="223" cy="170" r="0.9" fill="#ffffff" opacity="0.8" />
                </motion.g>
              </motion.g>

              {/* ════ HOOKED GOLD BEAK (facing right) ════ */}
              <g style={{ filter: "drop-shadow(0 4px 7px rgba(0,0,0,0.45))" }}>
                {/* cere */}
                <path d="M 232 168 Q 244 166 250 172 Q 248 178 242 180 Q 236 178 232 174 Z" fill="#d97706" />
                <circle cx="240" cy="172" r="1.2" fill="#451a03" />
                {/* upper mandible — curves right and hooks down */}
                <path
                  d="M 240 174
                     Q 258 172 268 178
                     Q 274 184 270 192
                     Q 264 200 254 200
                     Q 258 194 256 190
                     Q 250 196 244 194
                     Q 238 190 238 184
                     Q 238 178 240 174 Z"
                  fill="url(#beakGrad)"
                />
                {/* hook curl */}
                <path d="M 254 200 Q 264 200 270 192 Q 268 202 258 205 Q 253 205 254 200 Z" fill="#92400e" />
                {/* ridge highlight */}
                <path d="M 244 178 Q 258 176 266 182" stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" fill="none" strokeLinecap="round" />
                {/* gape line */}
                <path d="M 238 188 Q 250 192 258 190" stroke="rgba(69,26,3,0.5)" strokeWidth="1" fill="none" strokeLinecap="round" />
              </g>
            </motion.g>

            {/* ── FOREGROUND ORBIT ── */}
            <motion.g
              animate={reducedMotion ? {} : { rotate: 360 }}
              transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "200px 250px" }}
            >
              <ellipse cx="200" cy="250" rx="178" ry="50" fill="none" stroke="url(#orbitGrad)" strokeWidth="2.5" opacity="0.6" strokeDasharray="116 740" style={{ filter: "drop-shadow(0 0 12px rgba(34,211,238,1))" }} />
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
