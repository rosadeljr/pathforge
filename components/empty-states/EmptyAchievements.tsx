'use client';

import { EmptyState } from '@/components/ui/EmptyState';

export function EmptyAchievements() {
  return (
    <EmptyState
      icon="🏆"
      title="Unlock Achievements by Progressing"
      description="Achievements are earned by completing quests, building projects, maintaining streaks, and reaching milestones. Keep pushing!"
    />
  );
}
