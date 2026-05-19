'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Flame, Zap, Shield } from 'lucide-react';

type Difficulty = 'E' | 'D' | 'C' | 'B' | 'A' | 'S' | 'SS' | 'SSS';

interface AnimeQuestCardProps {
  title: string;
  description: string;
  difficulty: Difficulty;
  xpReward: number;
  status?: 'active' | 'completed' | 'locked';
  progress?: number;
  element?: 'fire' | 'ice' | 'lightning' | 'earth';
  icon?: string;
}

const difficultyColors = {
  E: 'from-slate-700 to-slate-900 border-slate-600',
  D: 'from-emerald-700 to-emerald-900 border-emerald-600',
  C: 'from-blue-700 to-blue-900 border-blue-600',
  B: 'from-purple-700 to-purple-900 border-purple-600',
  A: 'from-orange-700 to-orange-900 border-orange-600',
  S: 'from-rose-700 to-rose-900 border-rose-600',
  SS: 'from-yellow-700 to-yellow-900 border-yellow-600',
  SSS: 'from-cyan-600 via-violet-600 to-rose-600 border-cyan-400',
};

const difficultyGlow = {
  E: 'shadow-slate-600/30',
  D: 'shadow-emerald-600/30',
  C: 'shadow-blue-600/30',
  B: 'shadow-purple-600/30',
  A: 'shadow-orange-600/30',
  S: 'shadow-rose-600/30',
  SS: 'shadow-yellow-600/30',
  SSS: 'shadow-cyan-500/30',
};

const elementIcons = {
  fire: <Flame size={20} className="text-rose-400" />,
  ice: <Shield size={20} className="text-cyan-400" />,
  lightning: <Zap size={20} className="text-yellow-400" />,
  earth: <Shield size={20} className="text-amber-400" />,
};

export function AnimeQuestCard({
  title,
  description,
  difficulty,
  xpReward,
  status = 'active',
  progress = 0,
  element,
  icon = '⚔️',
}: AnimeQuestCardProps) {
  return (
    <motion.div
      whileHover={{ scale: status !== 'locked' ? 1.02 : 1 }}
      whileTap={{ scale: status !== 'locked' ? 0.98 : 1 }}
    >
      <Card
        className={`relative overflow-hidden border-2 ${difficultyColors[difficulty]} ${
          status === 'locked' ? 'opacity-50' : ''
        }`}
      >
        {/* Animated border glow */}
        <motion.div
          animate={{
            boxShadow: [
              `0 0 20px rgba(139, 92, 246, 0.2)`,
              `0 0 40px rgba(139, 92, 246, 0.4)`,
              `0 0 20px rgba(139, 92, 246, 0.2)`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0"
        />

        {/* Background gradient */}
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute inset-0 bg-gradient-to-br ${difficultyColors[difficulty]}`}
        />

        <div className="relative p-4 space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-start gap-3 flex-1">
              <div className="text-2xl">{icon}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm leading-tight truncate">
                  {title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                  {description}
                </p>
              </div>
            </div>

            {/* Difficulty Badge */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`px-2 py-1 rounded font-bold text-xs text-white bg-gradient-to-r ${difficultyColors[difficulty]} ${difficultyGlow[difficulty]} border border-white/20`}
              style={{
                boxShadow: `0 0 10px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(255, 255, 255, 0.1)`,
              }}
            >
              {difficulty}
            </motion.div>
          </div>

          {/* Element and XP Info */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              {element && elementIcons[element]}
              {status === 'completed' && (
                <span className="text-emerald-400 font-semibold">✓ Completed</span>
              )}
            </div>
            <div className="text-cyan-400 font-bold">
              +{xpReward} XP
            </div>
          </div>

          {/* Progress Bar */}
          {status === 'active' && progress > 0 && (
            <div className="space-y-1">
              <div className="relative h-1.5 rounded-full overflow-hidden bg-black/60 border border-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  style={{
                    boxShadow: `0 0 8px rgba(139, 92, 246, 0.6)`,
                  }}
                />
              </div>
              <p className="text-xs text-slate-500">{progress}% Progress</p>
            </div>
          )}

          {/* Status */}
          {status === 'locked' && (
            <div className="text-center py-2">
              <p className="text-xs text-slate-400">🔒 Unlock at higher rank</p>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
