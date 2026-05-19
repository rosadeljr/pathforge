'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

export interface Activity {
  id: string;
  type: 'quest' | 'achievement' | 'level' | 'project' | 'streak';
  title: string;
  description?: string;
  icon: ReactNode;
  timestamp: Date;
}

interface RecentActivityProps {
  activities: Activity[];
}

const typeColors = {
  quest: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
  achievement: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
  level: 'bg-violet-500/10 border-violet-500/30 text-violet-400',
  project: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
  streak: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
};

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function RecentActivity({ activities }: RecentActivityProps) {
  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">
            Recent Activity
          </h3>
          <p className="text-sm text-slate-400">
            Your latest progress and accomplishments
          </p>
        </div>

        <div className="space-y-3">
          {activities.length > 0 ? (
            activities.map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  typeColors[activity.type]
                }`}
              >
                {/* Icon */}
                <div className="flex-shrink-0 text-lg mt-0.5">
                  {activity.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">
                    {activity.title}
                  </p>
                  {activity.description && (
                    <p className="text-xs text-slate-400 mt-0.5 truncate">
                      {activity.description}
                    </p>
                  )}
                </div>

                {/* Time */}
                <div className="flex-shrink-0 text-xs text-slate-400 whitespace-nowrap">
                  {formatRelativeTime(activity.timestamp)}
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-slate-400">
              <p>No recent activity. Start a quest to begin!</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
