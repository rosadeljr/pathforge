"use client";

/**
 * ForgeBot Mascot — a 3D-style SVG character that brings PathForge to life.
 *
 * Built without any 3D library (no three.js, no r3f). We get the dimensional
 * feel via:
 *   - Layered radial gradients suggesting light direction (top-left)
 *   - Drop-shadow filters for depth
 *   - perspective + rotateY/rotateX on the parent for parallax to cursor
 *   - Framer Motion for floating, blinking, head tilts, antenna pulse
 *
 * Designed to delight kids AND look premium for adults — Pixar-y but clean.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface ForgeBotMascotProps {
  size?: number;
  /** Optional: react to a hovered area outside the mascot (used for hero CTA hover). */
  className?: string;
}

export function ForgeBotMascot({ size = 280, className = "" }: ForgeBotMascotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = { stiffness: 80, damping: 14, mass: 0.6 };
  const rotateY = useSpring(useTransform(mouseX, [-1, 1], [12, -12]), springConfig);
  const rotateX = useSpring(useTransform(mouseY, [-1, 1], [-8, 8]), springConfig);
  const eyeOffsetX = useSpring(useTransform(mouseX, [-1, 1], [-2.5, 2.5]), springConfig);
  const eyeOffsetY = useSpring(useTransform(mouseY, [-1, 1], [-1.5, 1.5]), springConfig);

  const [blink, setBlink] = useState(false);
  const [wave, setWave] = useState(false);

  // Blink occasionally — feels alive
  useEffect(() => {
    let timer: any;
    const schedule = () => {
      const delay = 2000 + Math.random() * 3500;
      timer = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 130);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // Wave hand every ~8 seconds
  useEffect(() => {
    let timer: any;
    const schedule = () => {
      timer = setTimeout(() => {
        setWave(true);
        setTimeout(() => setWave(false), 1400);
        schedule();
      }, 7000 + Math.random() * 4000);
    };
    schedule();
    return () => clearTimeout(timer);
  }, []);

  // Track mouse for parallax — looks like it's watching you
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

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size, perspective: "1000px" }}
    >
      {/* Ambient halo behind the mascot — radiates light */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 45%, rgba(168,85,247,0.35), rgba(99,102,241,0.15) 35%, transparent 65%)",
          filter: "blur(8px)",
        }}
      />

      {/* Floating wrapper — bobs up and down forever */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ width: "100%", height: "100%" }}
      >
        {/* Tilt wrapper — responds to mouse */}
        <motion.div
          style={{
            rotateY,
            rotateX,
            transformStyle: "preserve-3d",
            width: "100%",
            height: "100%",
          }}
        >
          <svg
            viewBox="0 0 240 280"
            width="100%"
            height="100%"
            xmlns="http://www.w3.org/2000/svg"
            style={{ filter: "drop-shadow(0 24px 40px rgba(99,102,241,0.35))" }}
          >
            <defs>
              {/* Head gradient — top-lit purple-to-indigo */}
              <radialGradient id="headGrad" cx="35%" cy="25%" r="80%">
                <stop offset="0%" stopColor="#c4b5fd" />
                <stop offset="40%" stopColor="#a78bfa" />
                <stop offset="80%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#5b21b6" />
              </radialGradient>
              {/* Face/screen — glassy dark with violet glow */}
              <radialGradient id="faceGrad" cx="30%" cy="30%" r="80%">
                <stop offset="0%" stopColor="#1e1b4b" />
                <stop offset="60%" stopColor="#0c0a1f" />
                <stop offset="100%" stopColor="#020014" />
              </radialGradient>
              {/* Body gradient */}
              <radialGradient id="bodyGrad" cx="35%" cy="20%" r="90%">
                <stop offset="0%" stopColor="#a5b4fc" />
                <stop offset="40%" stopColor="#818cf8" />
                <stop offset="100%" stopColor="#4338ca" />
              </radialGradient>
              {/* Antenna glow */}
              <radialGradient id="antennaGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="40%" stopColor="#facc15" />
                <stop offset="100%" stopColor="#ca8a04" />
              </radialGradient>
              {/* Eye — bright cyan with white shine */}
              <radialGradient id="eyeGrad" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#cffafe" />
                <stop offset="30%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#0e7490" />
              </radialGradient>
              {/* Chest screen — pulsing core */}
              <radialGradient id="chestGrad" cx="50%" cy="50%" r="60%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </radialGradient>
              {/* Shadow filter */}
              <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
                <feOffset dy="4" />
                <feComponentTransfer>
                  <feFuncA type="linear" slope="0.35" />
                </feComponentTransfer>
                <feMerge>
                  <feMergeNode />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Ground shadow */}
            <ellipse
              cx="120"
              cy="265"
              rx="55"
              ry="6"
              fill="rgba(0,0,0,0.4)"
              filter="blur(4px)"
            />

            {/* Antenna stem */}
            <line
              x1="120"
              y1="48"
              x2="120"
              y2="22"
              stroke="#7c3aed"
              strokeWidth="4"
              strokeLinecap="round"
            />
            {/* Antenna glowing tip with pulse */}
            <motion.circle
              cx="120"
              cy="18"
              r="7"
              fill="url(#antennaGrad)"
              animate={{ r: [7, 9, 7], opacity: [1, 0.85, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ filter: "drop-shadow(0 0 8px #facc15)" }}
            />

            {/* ============ HEAD (capsule shape, depth shaded) ============ */}
            <motion.g
              animate={{ rotate: [0, -2, 0, 2, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "120px 110px" }}
            >
              {/* Head main body */}
              <rect
                x="55"
                y="55"
                width="130"
                height="115"
                rx="40"
                fill="url(#headGrad)"
              />
              {/* Top-left highlight crescent — sells the 3D illusion */}
              <path
                d="M 70 75 Q 95 60 130 60"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Bottom-right shadow */}
              <path
                d="M 175 130 Q 175 155 155 165"
                stroke="rgba(0,0,0,0.18)"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />

              {/* Face screen — recessed glass */}
              <rect
                x="68"
                y="74"
                width="104"
                height="74"
                rx="22"
                fill="url(#faceGrad)"
              />
              {/* Screen reflection highlight (top edge) */}
              <path
                d="M 78 82 Q 100 78 160 80"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />

              {/* ============ EYES — track mouse + blink ============ */}
              <motion.g style={{ x: eyeOffsetX, y: eyeOffsetY }}>
                {/* Left eye */}
                <motion.ellipse
                  cx="98"
                  cy="108"
                  rx="13"
                  ry={blink ? 1.5 : 13}
                  fill="url(#eyeGrad)"
                  style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.6))" }}
                  transition={{ duration: 0.08 }}
                />
                {!blink && (
                  <>
                    {/* Pupil */}
                    <ellipse cx="100" cy="106" rx="5" ry="6" fill="#0c4a6e" />
                    {/* Highlight */}
                    <ellipse cx="102" cy="103" rx="2.5" ry="3" fill="white" />
                  </>
                )}

                {/* Right eye */}
                <motion.ellipse
                  cx="142"
                  cy="108"
                  rx="13"
                  ry={blink ? 1.5 : 13}
                  fill="url(#eyeGrad)"
                  style={{ filter: "drop-shadow(0 0 6px rgba(34,211,238,0.6))" }}
                  transition={{ duration: 0.08 }}
                />
                {!blink && (
                  <>
                    <ellipse cx="144" cy="106" rx="5" ry="6" fill="#0c4a6e" />
                    <ellipse cx="146" cy="103" rx="2.5" ry="3" fill="white" />
                  </>
                )}
              </motion.g>

              {/* Smile — friendly curve */}
              <path
                d="M 95 132 Q 120 145 145 132"
                stroke="#cffafe"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
              {/* Tiny cheek blushes for warmth */}
              <ellipse cx="78" cy="130" rx="6" ry="4" fill="rgba(244,114,182,0.35)" />
              <ellipse cx="162" cy="130" rx="6" ry="4" fill="rgba(244,114,182,0.35)" />
            </motion.g>

            {/* ============ BODY ============ */}
            {/* Neck shadow */}
            <ellipse cx="120" cy="172" rx="24" ry="5" fill="rgba(0,0,0,0.25)" />
            {/* Body main */}
            <rect
              x="68"
              y="170"
              width="104"
              height="80"
              rx="26"
              fill="url(#bodyGrad)"
            />
            {/* Body top-left highlight */}
            <path
              d="M 80 185 Q 105 175 135 175"
              stroke="rgba(255,255,255,0.35)"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Body bottom shadow */}
            <path
              d="M 80 240 Q 120 250 160 240"
              stroke="rgba(0,0,0,0.15)"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />

            {/* Chest screen — pulsing power core */}
            <motion.g
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ transformOrigin: "120px 210px" }}
            >
              <rect
                x="100"
                y="190"
                width="40"
                height="40"
                rx="10"
                fill="url(#chestGrad)"
                style={{ filter: "drop-shadow(0 0 12px rgba(251,191,36,0.6))" }}
              />
              {/* Lightning bolt */}
              <path
                d="M 122 198 L 113 215 L 119 215 L 116 226 L 128 209 L 122 209 Z"
                fill="white"
                opacity="0.95"
              />
            </motion.g>

            {/* ============ ARMS ============ */}
            {/* Left arm — static */}
            <rect
              x="42"
              y="180"
              width="22"
              height="50"
              rx="11"
              fill="url(#bodyGrad)"
            />
            <ellipse cx="53" cy="232" rx="13" ry="11" fill="url(#bodyGrad)" />

            {/* Right arm — waves periodically */}
            <motion.g
              animate={
                wave
                  ? { rotate: [0, -45, -25, -45, -25, 0] }
                  : { rotate: 0 }
              }
              transition={{ duration: 1.4, ease: "easeInOut" }}
              style={{ transformOrigin: "187px 187px" }}
            >
              <rect
                x="176"
                y="180"
                width="22"
                height="50"
                rx="11"
                fill="url(#bodyGrad)"
              />
              <ellipse cx="187" cy="232" rx="13" ry="11" fill="url(#bodyGrad)" />
            </motion.g>

            {/* Decorative bolts on body shoulders */}
            <circle cx="80" cy="185" r="2.5" fill="rgba(0,0,0,0.3)" />
            <circle cx="160" cy="185" r="2.5" fill="rgba(0,0,0,0.3)" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Floating sparkles around the mascot — magical feel */}
      <FloatingSparkle delay={0} top="10%" left="8%" />
      <FloatingSparkle delay={1.5} top="20%" right="6%" />
      <FloatingSparkle delay={3} bottom="22%" left="2%" />
      <FloatingSparkle delay={2} bottom="14%" right="4%" />
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
      className="absolute text-amber-300 pointer-events-none"
      style={{ top, bottom, left, right, fontSize: "16px" }}
      animate={{
        y: [0, -12, 0],
        opacity: [0, 1, 0],
        scale: [0.5, 1.1, 0.5],
        rotate: [0, 25, 0],
      }}
      transition={{
        duration: 3,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      ✨
    </motion.div>
  );
}
