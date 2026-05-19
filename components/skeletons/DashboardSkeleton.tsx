'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';

export function DashboardSkeleton() {
  return (
    <Container maxWidth="2xl" padding>
      {/* Header */}
      <div className="mb-8">
        <Skeleton width="40%" height="2.5rem" className="mb-2" />
        <Skeleton width="30%" height="1rem" />
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <div className="space-y-3">
              <Skeleton width="60%" height="0.875rem" />
              <Skeleton height="1.5rem" />
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* XP Chart */}
        <Card>
          <div className="space-y-4">
            <Skeleton width="50%" height="1rem" />
            <Skeleton height="200px" />
          </div>
        </Card>

        {/* Readiness Radar */}
        <Card>
          <div className="space-y-4">
            <Skeleton width="50%" height="1rem" />
            <Skeleton height="200px" />
          </div>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Achievements */}
        <Card>
          <div className="space-y-4">
            <Skeleton width="50%" height="1rem" />
            <div className="grid grid-cols-2 gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} shape="circle" width={48} height={48} />
              ))}
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <div className="space-y-4">
            <Skeleton width="50%" height="1rem" />
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton shape="circle" width={40} height={40} />
                <div className="flex-1">
                  <Skeleton width="70%" height="0.875rem" />
                  <Skeleton width="50%" height="0.75rem" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </Container>
  );
}
