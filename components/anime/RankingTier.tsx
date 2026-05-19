'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Crown, Flame } from 'lucide-react';

export interface RankingData {
  currentRank: number;
  nextRank: number;
  title: string;
  nextTitle: string;
  progress: number;
  special?: string;
}

interface RankingTierProps {
  data: RankingData;
}

const ranks = [
  { rank: 1, title: 'Novice Slayer', color: 'from-slate-400 to-slate-600', icon: '⚔️' },
  { rank: 2, title: 'Apprentice', color: 'from-blue-400 to-blue-600', icon: '🔱' },
  { rank: 3, title: 'Warrior', color: 'from-cyan-400 to-cyan-600', icon: '⚡' },
  { rank: 4, title: 'Swordmaster', color: 'from-purple-400 to-purple-600', icon: '⭐' },
  { rank: 5, title: 'Legendary', color: 'from-rose-400 to-rose-600', icon: '✨' },
  { rank: 6, title: 'Transcendent', color: 'from-yellow-300 to-rose-500', icon: '👑' },
];

export function RankingTier({ data }: RankingTierProps) {
  const currentData = ranks[data.currentRank - 1];
  const nextData = ranks[Math.min(data.nextRank - 1, ranks.length - 1)];

  return (
    <Card className="relative overflow-hidden">
      {/* Animated background */}
      <motion.div
        animate={{ opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`absolute inset-0 bg-gradient-to-br ${currentData.color}`}
      />

      <div className="relative space-y-6 p-6">
        {/* Current Rank Display */}
        <div className="text-center">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            {currentData.icon}
          </motion.div>

          <h3 className="text-sm font-medium text-slate-300">Current Rank</h3>
          <motion.h2
            animate={{ textShadow: ['0 0 20px rgba(139, 92, 246, 0.5)', '0 0 30px rgba(139, 92, 246, 0.8)', '0 0 20px rgba(139, 92, 246, 0.5)'] }}
            transition={{ duration: 2, repeat: Infinity }}
            className={`text-3xl font-bold bg-gradient-to-r ${currentData.color} bg-clip-text text-transparent mt-1`}
          >
            {currentData.title}
          </motion.h2>
          <p className="text-xs text-slate-400 mt-2">Rank {data.currentRank}</p>
        </div>

        {/* Progress to Next Rank */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Progress to {nextData.title}</span>
            <span className="text-xs text-cyan-400 font-bold">{Math.round(data.progress)}%</span>
          </div>

          {/* Dramatic progress bar */}
          <div className="relative h-3 rounded-full overflow-hidden bg-black/60 border-2 border-white/10">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${data.progress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className={`h-full bg-gradient-to-r ${currentData.color}`}
              style={{
                boxShadow: `0 0 15px rgba(139, 92, 246, 0.8), inset 0 0 10px rgba(255, 255, 255, 0.2)`,
              }}
            />
          </div>
        </div>

        {/* Next Rank Preview */}
        <motion.div
          className={`p-4 rounded-lg border-2 border-dashed border-white/20 bg-gradient-to-br ${nextData.color} opacity-40 text-center`}
          whileHover={{ opacity: 0.6, scale: 1.02 }}
        >
          <p className="text-xs text-slate-300">{nextData.icon} {nextData.title}</p>
          <p className="text-xs text-slate-400 mt-1">Next Rank</p>
        </motion.div>

        {/* Special Ability */}
        {data.special && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30"
          >
            <p className="text-xs font-semibold text-rose-300 flex items-center gap-2">
              <Flame size={14} />
              Special Ability Unlocked
            </p>
            <p className="text-xs text-rose-200/70 mt-1">{data.special}</p>
          </motion.div>
        )}

        {/* Rank Distribution */}
        <div className="pt-4 border-t border-white/10">
          <p className="text-xs font-medium text-slate-300 mb-3">Ranking Path</p>
          <div className="flex justify-between gap-1">
            {ranks.slice(0, 6).map((r) => (
              <motion.div
                key={r.rank}
                whileHover={{ scale: 1.1 }}
                className={`flex-1 h-1.5 rounded-full transition-all ${
                  r.rank <= data.currentRank
                    ? `bg-gradient-to-r ${r.color} shadow-lg shadow-purple-500/50`
                    : 'bg-slate-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
