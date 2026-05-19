'use client';

import { EmptyState } from '@/components/ui/EmptyState';

interface EmptyProjectsProps {
  onAddProject?: () => void;
}

export function EmptyProjects({ onAddProject }: EmptyProjectsProps) {
  return (
    <EmptyState
      icon="💼"
      title="Showcase Your First Project"
      description="Your portfolio is the proof of your skills. Add your first project and show the world what you can build."
      action={
        onAddProject
          ? { label: 'Add Project', onClick: onAddProject }
          : undefined
      }
    />
  );
}
