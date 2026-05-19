'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';

export function PortfolioSkeleton() {
  return (
    <Container maxWidth="2xl" padding>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Skeleton width="50%" height="2.5rem" className="mb-2" />
          <Skeleton width="40%" height="1rem" />
        </div>
        <Skeleton width="120px" height="2.5rem" shape="rounded" />
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-8 flex gap-4 flex-col md:flex-row">
        <Skeleton height="2.5rem" className="flex-1" shape="rounded" />
        <Skeleton width="150px" height="2.5rem" shape="rounded" />
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="space-y-4">
              {/* Project Image */}
              <Skeleton height="200px" shape="rounded" />

              {/* Content */}
              <div className="space-y-3">
                {/* Title */}
                <Skeleton width="100%" height="1.25rem" />

                {/* Description */}
                <div className="space-y-2">
                  <Skeleton height="0.875rem" />
                  <Skeleton width="85%" height="0.875rem" />
                </div>

                {/* Skills Tags */}
                <div className="flex gap-2 flex-wrap">
                  {[...Array(3)].map((_, j) => (
                    <Skeleton key={j} width="70px" height="1.5rem" shape="rounded" />
                  ))}
                </div>

                {/* Date and Links */}
                <div className="flex justify-between items-center pt-2 border-t border-white/10">
                  <Skeleton width="80px" height="0.75rem" />
                  <div className="flex gap-2">
                    <Skeleton width="30px" height="30px" shape="rounded" />
                    <Skeleton width="30px" height="30px" shape="rounded" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  );
}
