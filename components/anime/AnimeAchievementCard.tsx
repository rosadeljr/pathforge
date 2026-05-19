'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Lock, Star } from 'lucide-react';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface AnimeAchievementCardProps {
  title: string;
  description: string;
  icon: string;
  rarity: Rarity;
  unlocked: boolean;
  unlockedAt?: string;
  special?: string;
}

const rarityStyles = {
  common: {
    border: 'border-slate-600 from-slate-600 to-slate-800',
    text: 'text-slate-300',
    glow: 'shadow-slate-600/40',
  },
  rare: {
    border: 'border-cyan-600 from-cyan-600 to-cyan-800',
    text: 'text-cyan-300',
    glow: 'shadow-cyan-600/40',
  },
  epic: {
    border: 'border-purple-600 from-purple-600 to-purple-800',
    text: 'text-purple-300',
    glow: 'shadow-purple-600/40',
  },
  legendary: {
    border: 'border-rose-600 from-rose-600 to-rose-800',
    text: 'text-rose-300',
    glow: 'shadow-rose-600/40',
  },
  mythic: {
    border: 'border-yellow-500 from-yellow-500 to-rose-500',
    text: 'text-yellow-300',
    glow: 'shadow-yellow-500/40',
  },
};

export function AnimeAchievementCard({
  title,
  description,
  icon,
  rarity,
  unlocked,
  unlockedAt,
  special,
}: AnimeAchievementCardProps) {
  const style = rarityStyles[rarity];

  return (
    <motion.div
      whileHover={unlocked ? { scale: 1.05, rotateY: 5 } : {}}
      whileTap={unlocked ? { scale: 0.95 } : {}}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 100 }}
    >
      <Card
        className={`relative overflow-hidden border-2 ${style.border} ${
          !unlocked ? 'opacity-40' : ''
        }`}
      >
        {/* Animated glow background */}
        {unlocked && (
          <motion.div
            animate={{
              boxShadow: [
                `0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)`,
                `0 0 40px rgba(139, 92, 246, 0.5), inset 0 0 20px rgba(139, 92, 246, 0.2)`,
                `0 0 20px rgba(139, 92, 246, 0.3), inset 0 0 20px rgba(139, 92, 246, 0.1)`,
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0"
          />
        )}

        {/* Background gradient */}
        <motion.div
          animate={
            unlocked
              ? { opacity: [0.4, 0.6, 0.4] }
              : { opacity: [0.2, 0.3, 0.2] }
          }
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute inset-0 bg-gradient-to-br ${style.border}`}
        />

        <div className="relative p-6 text-center space-y-3 flex flex-col items-center">
          {/* Icon */}
          <motion.div
            animate={
              unlocked
                ? {
                    scale: [1, 1.1, 1],
                    y: [0, -5, 0],
                  }
                : {}
            }
            transition={{ duration: 2, repeat: Infinity }}
            className="text-5xl"
          >
            {icon}
          </motion.div>

          {/* Title */}
          <h3 className={`font-bold text-sm ${style.text} leading-tight`}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-xs text-slate-400 leading-relaxed">
            {description}
          </p>

          {/* Rarity Badge */}
          <motion.div
            animate={
              unlocked
                ? {
                    scale: [1, 1.05, 1],
                  }
                : {}
            }
            transition={{ duration: 1.5, repeat: Infinity }}
            className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${style.border} text-white border border-white/20`}
            style={{
              boxShadow: `0 0 12px rgba(0, 0, 0, 0.5)`,
            }}
          >
            {rarity.toUpperCase()}
          </motion.div>

          {/* Unlock Status or Special */}
          {!unlocked ? (
            <motion.div animate={{ y: [0, 2, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Lock size={20} className="text-slate-500 mx-auto" />
            </motion.div>
          ) : (
            <div className="space-y-1">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.3 }}
                className="flex justify-center gap-1"
              >
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={`${
                      i < (rarity === 'mythic' ? 3 : rarity === 'legendary' ? 3 : 2)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </motion.div>
              {unlockedAt && (
                <p className="text-xs text-slate-500">{unlockedAt}</p>
              )}
            </div>
          )}

          {/* Special Ability */}
          {special && unlocked && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-center w-full"
            >
              <p className="text-xs text-cyan-400 font-semibold">✨ {special}</p>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
