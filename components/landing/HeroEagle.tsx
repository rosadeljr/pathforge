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

      {/* the eagle */}
      <motion.div
        style={{ rotateY, rotateX, transformStyle: "preserve-3d", width: "100%" }}
        animate={reduced ? {} : { y: [0, -12, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <img
          src="/eagle_mascot_vector_high_fidelity.svg"
          alt="PathForge eagle mascot"
          width={1494}
          height={734}
          className="w-full h-auto"
          style={{ filter: "drop-shadow(0 18px 36px rgba(0,0,0,0.55)) drop-shadow(0 0 22px rgba(34,211,238,0.25))" }}
        />
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
