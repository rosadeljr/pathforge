"use client";

/**
 * HeroEagle — the cartoon eagle artwork given a premium, "robust" hero
 * treatment: spotlight glow, slow orbit rings, floating embers, a glowing
 * pedestal, and a gentle float + cursor parallax. Respects reduced motion.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface Props {
  size?: number;
  className?: string;
}

export function HeroEagle({ size = 620, className = "" }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const spring = { stiffness: 60, damping: 18, mass: 0.8 };
  const rotateY = useSpring(useTransform(mx, [-1, 1], [8, -8]), spring);
  const rotateX = useSpring(useTransform(my, [-1, 1], [-5, 5]), spring);

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
    if (!ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }
  function leave() { mx.set(0); my.set(0); }

  const embers = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        left: `${(i * 67) % 100}%`,
        delay: (i % 7) * 0.6,
        dur: 4 + (i % 5),
        size: 2 + ((i * 13) % 4),
        hue: i % 3 === 0 ? "#fbbf24" : i % 3 === 1 ? "#67e8f9" : "#a78bfa",
        drift: (i % 2 ? 1 : -1) * (8 + (i % 4) * 6),
      })),
    []
  );

  return (
    <div
      ref={ref}
      onMouseMove={move}
      onMouseLeave={leave}
      className={`relative flex items-end justify-center ${className}`}
      style={{ width: `clamp(300px, 94vw, ${size}px)`, perspective: "1300px" }}
    >
      {/* spotlight glow */}
      <div
        aria-hidden
        className="absolute inset-0 -z-20 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 42%, rgba(251,191,36,0.22), rgba(34,211,238,0.16) 42%, rgba(167,139,250,0.12) 60%, transparent 74%)",
        }}
      />

      {/* orbit rings */}
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[46%] -z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "118%", height: "84%" }}
        animate={reduced ? {} : { rotate: 360 }}
        transition={{ duration: 38, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 400 280" width="100%" height="100%" style={{ overflow: "visible" }}>
          <ellipse cx="200" cy="140" rx="196" ry="86" fill="none" stroke="rgba(34,211,238,0.32)" strokeWidth="1.1" style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.6))" }} />
          <ellipse cx="200" cy="140" rx="168" ry="70" fill="none" stroke="rgba(167,139,250,0.28)" strokeWidth="1" strokeDasharray="2 10" />
          <circle cx="396" cy="140" r="3" fill="#67e8f9" style={{ filter: "drop-shadow(0 0 6px #22d3ee)" }} />
          <circle cx="4" cy="140" r="2.4" fill="#fbbf24" style={{ filter: "drop-shadow(0 0 6px #fbbf24)" }} />
        </svg>
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute left-1/2 top-[46%] -z-10 -translate-x-1/2 -translate-y-1/2"
        style={{ width: "96%", height: "108%" }}
        animate={reduced ? {} : { rotate: -360 }}
        transition={{ duration: 52, repeat: Infinity, ease: "linear" }}
      >
        <svg viewBox="0 0 400 280" width="100%" height="100%" style={{ overflow: "visible" }}>
          <ellipse cx="200" cy="140" rx="120" ry="132" fill="none" stroke="rgba(34,211,238,0.16)" strokeWidth="1" strokeDasharray="3 12" />
        </svg>
      </motion.div>

      {/* HUD frame — corner brackets + ticks */}
      <svg
        aria-hidden
        viewBox="0 0 400 240"
        preserveAspectRatio="none"
        className="absolute inset-0 -z-10 h-full w-full"
        style={{ overflow: "visible" }}
      >
        <g stroke="rgba(103,232,249,0.45)" strokeWidth="1.4" fill="none" strokeLinecap="round">
          <path d="M 10 30 L 10 10 L 34 10" />
          <path d="M 390 30 L 390 10 L 366 10" />
          <path d="M 10 210 L 10 230 L 34 230" />
          <path d="M 390 210 L 390 230 L 366 230" />
        </g>
        <g stroke="rgba(34,211,238,0.3)" strokeWidth="1">
          <line x1="200" y1="8" x2="200" y2="16" />
          <line x1="200" y1="224" x2="200" y2="232" />
          <line x1="6" y1="120" x2="14" y2="120" />
          <line x1="386" y1="120" x2="394" y2="120" />
        </g>
        <text x="14" y="224" fill="rgba(103,232,249,0.5)" fontSize="7" fontFamily="monospace">PATHFORGE</text>
        <text x="356" y="22" fill="rgba(251,191,36,0.6)" fontSize="7" fontFamily="monospace">v1.0</text>
      </svg>

      {/* floating embers */}
      {embers.map((e, i) => (
        <motion.span
          key={i}
          aria-hidden
          className="absolute bottom-[22%] -z-10 rounded-full"
          style={{ left: e.left, width: e.size, height: e.size, background: e.hue, boxShadow: `0 0 8px ${e.hue}` }}
          animate={reduced ? { opacity: 0.4 } : { y: [0, -120], x: [0, e.drift], opacity: [0, 0.9, 0] }}
          transition={{ duration: e.dur, delay: e.delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}

      {/* the eagle + holographic overlays (masked to its silhouette) */}
      <motion.div
        style={{ rotateY, rotateX, transformStyle: "preserve-3d", width: "100%" }}
        animate={reduced ? {} : { y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="relative w-full">
          <img
            src="/eagle_mascot_themed.svg"
            alt="PathForge eagle mascot"
            width={1494}
            height={734}
            className="w-full h-auto"
            style={{ filter: "drop-shadow(0 18px 40px rgba(0,0,0,0.6)) drop-shadow(0 0 28px rgba(34,211,238,0.35))" }}
          />

          {/* holographic top-light sheen */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none mix-blend-screen"
            style={{
              WebkitMaskImage: "url(/eagle_mascot_themed.svg)",
              maskImage: "url(/eagle_mascot_themed.svg)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
              background:
                "linear-gradient(155deg, rgba(103,232,249,0.5) 0%, rgba(103,232,249,0.16) 28%, transparent 52%)",
            }}
          />

          {/* scan-sweep band */}
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none overflow-hidden mix-blend-screen"
            style={{
              WebkitMaskImage: "url(/eagle_mascot_themed.svg)",
              maskImage: "url(/eagle_mascot_themed.svg)",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "center",
              maskPosition: "center",
            }}
          >
            <motion.div
              className="absolute left-0 right-0 h-[14%]"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(165,243,252,0.55), transparent)",
                filter: "blur(2px)",
              }}
              animate={reduced ? { opacity: 0 } : { top: ["-16%", "112%"] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.6 }}
            />
          </div>
        </div>
      </motion.div>

      {/* glowing pedestal */}
      <motion.div
        aria-hidden
        className="absolute bottom-[6%] left-1/2 -z-10 -translate-x-1/2 rounded-[50%]"
        style={{
          width: "56%",
          height: "8%",
          background: "radial-gradient(ellipse at center, rgba(34,211,238,0.55), rgba(34,211,238,0) 70%)",
          filter: "blur(6px)",
        }}
        animate={reduced ? { opacity: 0.6 } : { opacity: [0.45, 0.85, 0.45], scaleX: [0.92, 1.04, 0.92] }}
        transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
