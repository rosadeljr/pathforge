'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Zap } from 'lucide-react';

interface PowerLevelProps {
  level: number;
  maxLevel: number;
  rank: 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';
  xp: number;
  maxXp: number;
  title?: string;
}

const rankColors = {
  E: 'from-slate-600 to-slate-700 border-slate-500',
  D: 'from-emerald-600 to-emerald-700 border-emerald-500',
  C: 'from-blue-600 to-blue-700 border-blue-500',
  B: 'from-purple-600 to-purple-700 border-purple-500',
  A: 'from-orange-600 to-orange-700 border-orange-500',
  S: 'from-rose-600 to-rose-700 border-rose-500',
  SS: 'from-yellow-600 to-yellow-700 border-yellow-500',
  SSS: 'from-cyan-500 via-violet-500 to-rose-500 border-cyan-400',
};

const rankGlows = {
  E: 'shadow-slate-600/50',
  D: 'shadow-emerald-600/50',
  C: 'shadow-blue-600/50',
  B: 'shadow-purple-600/50',
  A: 'shadow-orange-600/50',
  S: 'shadow-rose-600/50',
  SS: 'shadow-yellow-600/50',
  SSS: 'shadow-cyan-500/50',
};

export function PowerLevel({
  level,
  maxLevel,
  rank,
  xp,
  maxXp,
  title = 'Your Power Level',
}: PowerLevelProps) {
  const levelProgress = (level / maxLevel) * 100;
  const xpProgress = (xp / maxXp) * 100;

  return (
    <Card className="relative overflow-hidden">
      {/* Animated background gradient */}
      <motion.div
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        className={`absolute inset-0 opacity-20 bg-gradient-to-br ${rankColors[rank]}`}
        style={{ backgroundSize: '200% 200%' }}
      />

      <div className="relative space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-slate-300">{title}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Level {level} / {maxLevel}
            </p>
          </div>

          {/* Rank Badge */}
          <motion.div
            animate={{
              y: [0, -5, 0],
              scale: [1, 1.05, 1],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 bg-gradient-to-br ${rankColors[rank]} ${rankGlows[rank]}`}
            style={{
              boxShadow: `0 0 20px var(--rank-glow-${rank}, rgba(0,0,0,0.3))`,
            }}
          >
            <Zap size={16} className="animate-pulse" />
            <span className="font-bold text-white text-lg">{rank}</span>
          </motion.div>
        </div>

        {/* Level Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Level Progress</span>
            <span className="text-cyan-400 font-semibold">
              {Math.round(levelProgress)}%
            </span>
          </div>
          <div className="relative h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${rankColors[rank]} ${rankGlows[rank]}`}
              style={{
                boxShadow: `0 0 10px currentColor`,
              }}
            />
          </div>
        </div>

        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Experience</span>
            <span className="text-violet-400 font-semibold">
              {xp} / {maxXp}
            </span>
          </div>
          <div className="relative h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${xpProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
              style={{
                boxShadow: `0 0 8px rgba(139, 92, 246, 0.6)`,
              }}
            />
          </div>
        </div>

        {/* Power Stats */}
        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-white/10">
          {[
            { label: 'Combat', value: Math.floor(level * 10) },
            { label: 'Growth', value: Math.floor((xp / maxXp) * 100) },
            { label: 'Potential', value: 100 },
          ].map((stat) => (
            <div
              key={stat.label}
              className="text-center p-2 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="text-xs text-slate-400">{stat.label}</p>
              <p className="text-lg font-bold text-cyan-400 mt-1">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
