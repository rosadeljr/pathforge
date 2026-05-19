'use client';

import { ReactNode } from 'react';
import { Stat } from '@/components/ui/Stat';

interface QuickStatsItem {
  label: string;
  value: number | string;
  icon: ReactNode;
  color?: 'cyan' | 'violet' | 'amber';
  trend?: 'up' | 'down';
  format?: (value: any) => string;
}

interface QuickStatsProps {
  stats: QuickStatsItem[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Stat
          key={index}
          label={stat.label}
          value={stat.format ? stat.format(stat.value) : stat.value}
          icon={stat.icon}
          color={stat.color || 'cyan'}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}
