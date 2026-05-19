'use client';

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { ChevronRight } from 'lucide-react';

export interface Milestone {
  id: string;
  type: 'level' | 'achievement';
  title: string;
  description?: string;
  progress: number;
  total: number;
  reward?: string;
  icon?: string;
}

interface NextMilestonesProps {
  milestones: Milestone[];
}

export function NextMilestones({ milestones }: NextMilestonesProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Next Milestones
          </h3>
          <p className="text-sm text-slate-400">
            Your upcoming goals and rewards
          </p>
        </div>

        <div className="space-y-4">
          {milestones.length > 0 ? (
            milestones.map((milestone, index) => (
              <motion.div
                key={milestone.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-500/30 transition-colors cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {milestone.icon && (
                      <span className="text-lg flex-shrink-0">
                        {milestone.icon}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">
                        {milestone.title}
                      </p>
                      {milestone.description && (
                        <p className="text-xs text-slate-400 truncate">
                          {milestone.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight
                    size={20}
                    className="flex-shrink-0 text-slate-600 group-hover:text-cyan-400 transition-colors"
                  />
                </div>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Progress</span>
                    <span className="text-cyan-400 font-semibold">
                      {milestone.progress} / {milestone.total}
                    </span>
                  </div>
                  <Progress
                    value={milestone.progress}
                    max={milestone.total}
                    color={
                      milestone.type === 'level'
                        ? 'violet'
                        : 'amber'
                    }
                  />
                </div>

                {/* Reward */}
                {milestone.reward && (
                  <div className="mt-3 p-2 rounded bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20">
                    <p className="text-xs text-cyan-300">
                      <span className="font-semibold">Reward:</span>{' '}
                      {milestone.reward}
                    </p>
                  </div>
                )}
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No upcoming milestones. Keep progressing!</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
