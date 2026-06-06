"use client";

/**
 * ConstellationEagle — a futuristic "star map" eagle in flight: glowing star
 * nodes joined by constellation lines. Twinkles, drifts, and tilts toward the
 * cursor. Cyan lines, white star cores, gold accents at head + wingtips.
 *
 * Pure geometry (deterministic, SSR-safe). Respects prefers-reduced-motion.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  size?: number;
  className?: string;
}

type Node = [number, number, 0 | 1 | 2]; // x, y, size (0 small, 1 med, 2 hub)

const NODES: Record<string, Node> = {
  H: [200, 44, 2], HL: [186, 50, 0], HR: [214, 50, 0], BK: [200, 70, 1],
  NK: [200, 92, 1], CH: [200, 134, 2], LB: [200, 176, 1], TB: [200, 196, 1],
  TT: [200, 244, 1], TL: [182, 224, 0], TR: [218, 224, 0],
  RS: [234, 104, 2], R1: [278, 80, 1], R2: [324, 72, 1], R3: [366, 86, 1],
  RT: [392, 118, 2], R4: [350, 128, 1], R5: [300, 132, 1], R6: [256, 126, 1],
  LS: [166, 104, 2], L1: [122, 80, 1], L2: [76, 72, 1], L3: [34, 86, 1],
  LT: [8, 118, 2], L4: [50, 128, 1], L5: [100, 132, 1], L6: [144, 126, 1],
};

const EDGES: [string, string][] = [
  ["H", "HL"], ["H", "HR"], ["HL", "HR"], ["HL", "NK"], ["HR", "NK"], ["H", "BK"], ["BK", "NK"],
  ["NK", "CH"], ["CH", "LB"], ["LB", "TB"], ["TB", "TT"],
  ["TB", "TL"], ["TB", "TR"], ["TL", "TT"], ["TR", "TT"], ["TL", "TR"],
  ["RS", "R1"], ["R1", "R2"], ["R2", "R3"], ["R3", "RT"], ["RT", "R4"], ["R4", "R5"], ["R5", "R6"], ["R6", "RS"],
  ["RS", "NK"], ["R6", "CH"], ["R5", "CH"], ["R1", "R6"], ["R2", "R5"], ["R3", "R4"],
  ["LS", "L1"], ["L1", "L2"], ["L2", "L3"], ["L3", "LT"], ["LT", "L4"], ["L4", "L5"], ["L5", "L6"], ["L6", "LS"],
  ["LS", "NK"], ["L6", "CH"], ["L5", "CH"], ["L1", "L6"], ["L2", "L5"], ["L3", "L4"],
];

const GOLD = new Set(["H", "RT", "LT", "BK"]);

export function ConstellationEagle({ size = 520, className = "" }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const spring = { stiffness: 60, damping: 16, mass: 0.8 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [10, -10]), spring);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-7, 7]), spring);

  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener?.("change", h);
    return () => mq.removeEventListener?.("change", h);
  }, []);

  function move(e: React.MouseEvent<HTMLDivElement>) {
    if (!containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    mouseX.set(((e.clientX - r.left) / r.width) * 2 - 1);
    mouseY.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }
  function leave() { mouseX.set(0); mouseY.set(0); }

  const bgStars = useMemo(
    () =>
      Array.from({ length: 44 }).map((_, i) => ({
        x: (i * 97) % 400,
        y: ((i * 53) % 268) + 6,
        r: 0.5 + ((i * 29) % 10) / 12,
        o: 0.12 + ((i * 13) % 30) / 100,
        delay: (i % 10) * 0.4,
      })),
    []
  );

  const nodes = useMemo(() => Object.entries(NODES), []);

  return (
    <div
      ref={containerRef}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`relative inline-block ${className}`}
      style={{ width: `clamp(280px, 92vw, ${size}px)`, perspective: "1200px" }}
    >
      {/* nebula glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(34,211,238,0.20), rgba(167,139,250,0.12) 45%, rgba(251,191,36,0.08) 62%, transparent 75%)",
        }}
      />
      <motion.div
        animate={reduced ? {} : { y: [0, -10, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%" }}
      >
        <motion.div style={{ rotateY, rotateX, transformStyle: "preserve-3d", width: "100%" }}>
          <svg
            viewBox="0 0 400 280"
            width="100%"
            height="auto"
            preserveAspectRatio="xMidYMid meet"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: "block", overflow: "visible" }}
          >
            <defs>
              <filter id="ce-glow" x="-300%" y="-300%" width="700%" height="700%">
                <feGaussianBlur stdDeviation="2.2" result="b" />
                <feMerge>
                  <feMergeNode in="b" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* background stars */}
            {bgStars.map((s, i) => (
              <motion.circle
                key={`bg${i}`}
                cx={s.x}
                cy={s.y}
                r={s.r}
                fill="#9fb4d8"
                animate={reduced ? { opacity: s.o } : { opacity: [s.o * 0.4, s.o, s.o * 0.4] }}
                transition={{ duration: 3 + (i % 5), delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            {/* constellation lines */}
            <g style={{ filter: "drop-shadow(0 0 5px rgba(34,211,238,0.55))" }}>
              {EDGES.map(([a, b], i) => {
                const [x1, y1] = NODES[a];
                const [x2, y2] = NODES[b];
                return (
                  <motion.line
                    key={`e${i}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="rgba(103,232,249,0.55)"
                    strokeWidth={1}
                    strokeLinecap="round"
                    animate={reduced ? { opacity: 0.55 } : { opacity: [0.35, 0.7, 0.35] }}
                    transition={{ duration: 4, delay: (i % 7) * 0.35, repeat: Infinity, ease: "easeInOut" }}
                  />
                );
              })}
            </g>

            {/* star nodes */}
            {nodes.map(([k, [x, y, s]]) => {
              const gold = GOLD.has(k);
              const r = s === 2 ? 3.6 : s === 1 ? 2.4 : 1.5;
              const fill = gold ? "#ffe9a8" : "#e6fbff";
              const glow = gold ? "#fbbf24" : "#22d3ee";
              const delay = (x + y) % 5;
              return (
                <motion.circle
                  key={k}
                  cx={x}
                  cy={y}
                  r={r}
                  fill={fill}
                  filter="url(#ce-glow)"
                  style={{ filter: `drop-shadow(0 0 ${gold ? 6 : 4}px ${glow})` }}
                  animate={reduced ? { opacity: 0.95 } : { opacity: [0.65, 1, 0.65], scale: [0.92, 1.12, 0.92] }}
                  transition={{ duration: 2.6 + (s === 2 ? 0.6 : 0), delay, repeat: Infinity, ease: "easeInOut" }}
                />
              );
            })}
          </svg>
        </motion.div>
      </motion.div>
    </div>
  );
}
