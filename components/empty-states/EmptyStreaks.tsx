'use client';

import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyStreaksProps {
  onStartQuest?: () => void;
}

export function EmptyStreaks({ onStartQuest }: EmptyStreaksProps) {
  return (
    <EmptyState
      icon="🔥"
      title="Start Your Consistency Journey"
      description="Build a streak by completing at least one quest every day. Consistency is the key to mastering your craft."
      action={
        onStartQuest
          ? { label: 'Complete a Quest Today', onClick: onStartQuest }
          : undefined
      }
    />
  );
}
