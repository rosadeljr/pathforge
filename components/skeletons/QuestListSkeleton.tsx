'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';

export function QuestListSkeleton() {
  return (
    <Container maxWidth="2xl" padding>
      {/* Header */}
      <div className="mb-8">
        <Skeleton width="40%" height="2.5rem" className="mb-4" />

        {/* Filter Bar */}
        <div className="flex gap-2 flex-wrap">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} width="100px" height="2.5rem" shape="rounded" />
          ))}
        </div>
      </div>

      {/* Quest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <div className="space-y-4">
              {/* Quest Type Badge */}
              <Skeleton width="80px" height="1.5rem" shape="rounded" />

              {/* Title */}
              <Skeleton width="100%" height="1.25rem" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton height="0.875rem" />
                <Skeleton width="90%" height="0.875rem" />
              </div>

              {/* XP Reward */}
              <Skeleton width="60%" height="1rem" />

              {/* Progress Bar */}
              <Skeleton height="0.5rem" shape="rounded" />

              {/* Button */}
              <Skeleton height="2.5rem" shape="rounded" />
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
