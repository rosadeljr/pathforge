'use client';

import { EmptyState } from '@/components/ui/EmptyState';
import { Search } from 'lucide-react';

interface EmptySearchProps {
  query?: string;
  onClear?: () => void;
}

export function EmptySearch({ query, onClear }: EmptySearchProps) {
  return (
    <EmptyState
      icon={<Search size={48} className="text-slate-500" />}
      title="No Results Found"
      description={
        query
          ? `We couldn't find any results for "${query}". Try different keywords or adjust your filters.`
          : 'No items to display. Try searching or adjusting your filters.'
      }
      action={
        onClear
          ? { label: 'Clear Search', onClick: onClear }
          : undefined
      }
    />
  );
}
