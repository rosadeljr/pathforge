"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, useRef, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Magnetic button — pulls toward the cursor.
 * Game-dev "juice": small visceral movement that makes interactions feel alive.
 * Perfect for primary CTAs where we want extra attention.
 */

interface BaseProps {
  children: ReactNode;
  className?: string;
  /** Strength of magnetic pull. Default 0.3 (subtle). */
  strength?: number;
}

function useMagnetic(strength = 0.3) {
  const ref = useRef<HTMLElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 150, damping: 20, mass: 0.5 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return { ref, springX, springY, handleMouseMove, handleMouseLeave };
}

export function MagneticLink({
  href,
  children,
  className,
  strength = 0.3,
}: BaseProps & { href: string }) {
  const { ref, springX, springY, handleMouseMove, handleMouseLeave } = useMagnetic(strength);

  return (
    <motion.span
      ref={ref as any}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      <Link href={href} className={cn("inline-block", className)}>
        {children}
      </Link>
    </motion.span>
  );
}
