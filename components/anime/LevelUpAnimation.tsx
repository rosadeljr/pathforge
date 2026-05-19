'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface LevelUpAnimationProps {
  isVisible: boolean;
  newLevel: number;
  onComplete?: () => void;
}

export function LevelUpAnimation({
  isVisible,
  newLevel,
  onComplete,
}: LevelUpAnimationProps) {
  useEffect(() => {
    if (isVisible) {
      // Auto complete after animation
      const timer = setTimeout(() => {
        onComplete?.();
      }, 3000);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
    >
      {/* Dramatic background flash */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 0.6, times: [0, 0.5, 1] }}
        className="absolute inset-0 bg-gradient-to-b from-violet-600/20 to-transparent"
      />

      {/* Central glow effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 1, 0.5],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-cyan-500 via-violet-500 to-rose-500 filter blur-3xl opacity-30"
      />

      {/* Level up text container */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="relative text-center"
      >
        {/* Animated rings */}
        {[1, 2, 3].map((ring) => (
          <motion.div
            key={ring}
            animate={{ scale: [1, 2], opacity: [1, 0] }}
            transition={{
              duration: 1.5,
              delay: ring * 0.1,
              repeat: Infinity,
            }}
            className={`absolute inset-0 border-2 rounded-full`}
            style={{
              borderColor: ring === 1
                ? 'rgba(6, 182, 212, 0.6)'
                : ring === 2
                ? 'rgba(168, 85, 247, 0.6)'
                : 'rgba(244, 63, 94, 0.6)',
            }}
          />
        ))}

        {/* Main text */}
        <motion.div
          animate={{
            y: [0, -20, 0],
          }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-6xl font-black mb-4 tracking-wider"
            style={{
              color: 'rgb(34, 211, 238)',
              textShadow: `
                0 0 20px rgba(6, 182, 212, 0.8),
                0 0 40px rgba(6, 182, 212, 0.6),
                0 0 60px rgba(139, 92, 246, 0.4),
                0 2px 10px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            LEVEL UP!
          </motion.h1>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring' }}
            className="text-7xl font-black mb-2"
            style={{
              color: 'rgb(251, 113, 133)',
              textShadow: `
                0 0 30px rgba(244, 63, 94, 0.8),
                0 0 60px rgba(244, 63, 94, 0.6)
              `,
            }}
          >
            {newLevel}
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-2xl font-bold"
            style={{
              color: 'rgb(196, 132, 252)',
              textShadow: `0 0 20px rgba(168, 85, 247, 0.6)`,
            }}
          >
            NEW RANK ACHIEVED
          </motion.p>
        </motion.div>

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: 0,
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            animate={{
              x: Math.cos((i / 8) * Math.PI * 2) * 150,
              y: Math.sin((i / 8) * Math.PI * 2) * 150,
              opacity: 0,
              scale: 0,
            }}
            transition={{
              duration: 1.5,
              delay: 0.2,
              ease: 'easeOut',
            }}
            className="absolute w-3 h-3 rounded-full"
            style={{
              background: [
                'rgb(34, 211, 238)',
                'rgb(168, 85, 247)',
                'rgb(251, 113, 133)',
              ][i % 3],
            }}
          />
        ))}
      </motion.div>

      {/* Bottom glow text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-20 text-center"
      >
        <p className="text-lg font-bold gradient-text">
          POWER OVERWHELMING
        </p>
      </motion.div>
    </motion.div>
  );
}
