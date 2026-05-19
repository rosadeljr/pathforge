'use client';

import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyMessagesProps {
  onStartChat?: () => void;
}

export function EmptyMessages({ onStartChat }: EmptyMessagesProps) {
  return (
    <EmptyState
      icon="💬"
      title="Begin Your Journey with the AI Mentor"
      description="Ask your AI mentor anything about your career, skills, or the next steps on your journey. They're here to guide you 24/7."
      action={
        onStartChat
          ? { label: 'Start Chatting', onClick: onStartChat }
          : undefined
      }
    />
  );
}
