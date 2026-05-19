'use client';

import { CheckSquare } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyQuestsProps {
  onCreateQuest?: () => void;
}

export function EmptyQuests({ onCreateQuest }: EmptyQuestsProps) {
  return (
    <EmptyState
      icon="🎯"
      title="Get Started with Your First Quest"
      description="Complete quests to earn XP, level up, and progress through your career path. Each quest brings you closer to your goals."
      action={
        onCreateQuest
          ? { label: 'View Available Quests', onClick: onCreateQuest }
          : undefined
      }
    />
  );
}
