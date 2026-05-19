'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Lock } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: string;
}

interface AchievementGridProps {
  achievements: Achievement[];
}

const rarityColors = {
  common: 'border-slate-600 bg-slate-500/10',
  rare: 'border-cyan-600 bg-cyan-500/10',
  epic: 'border-violet-600 bg-violet-500/10',
  legendary: 'border-amber-600 bg-amber-500/10',
};

const rarityTextColors = {
  common: 'text-slate-400',
  rare: 'text-cyan-400',
  epic: 'text-violet-400',
  legendary: 'text-amber-400',
};

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Achievements
          </h3>
          <p className="text-sm text-slate-400">
            {achievements.filter((a) => a.unlocked).length} of{' '}
            {achievements.length} unlocked
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {achievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className={`relative aspect-square rounded-lg border-2 flex items-center justify-center p-2 transition-all ${
                achievement.unlocked
                  ? `${rarityColors[achievement.rarity]} hover:shadow-lg`
                  : 'border-slate-700 bg-black/40'
              }`}
              title={achievement.title}
            >
              {/* Icon */}
              <div className="text-3xl">{achievement.icon}</div>

              {/* Lock Icon */}
              {!achievement.unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-lg">
                  <Lock size={20} className="text-slate-500" />
                </div>
              )}

              {/* Rarity Badge */}
              {achievement.unlocked && (
                <div
                  className={`absolute -top-2 -right-2 w-5 h-5 rounded-full border-2 border-black/50 ${
                    rarityTextColors[achievement.rarity]
                  }`}
                  style={{
                    backgroundColor: `var(--achievement-${achievement.rarity})`,
                  }}
                />
              )}

              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black/90 border border-white/20 rounded-lg p-2 text-xs whitespace-nowrap z-10">
                <p className="font-semibold text-white">{achievement.title}</p>
                <p className="text-slate-400">{achievement.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
}
