'use client';

import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyMessagesProps {
  onStartChat?: () => void;
}

export function EmptyMessages({ onStartChat }: EmptyMessagesProps) {
  return (
    <EmptyState
      icon="💬"
      title="Say hi to ForgeBot"
      description="Ask ForgeBot anything about your career, skills, or the next steps on your journey. ForgeBot knows your goals and is here 24/7."
      action={
        onStartChat
          ? { label: 'Start Chatting', onClick: onStartChat }
          : undefined
      }
    />
  );
}
