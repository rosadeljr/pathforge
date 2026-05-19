'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui/Card';
import { Container } from '@/components/layout/Container';

export function MentorChatSkeleton() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="flex items-center gap-3 max-w-2xl mx-auto">
          <Skeleton shape="circle" width={48} height={48} />
          <div className="flex-1">
            <Skeleton width="40%" height="1rem" />
            <Skeleton width="30%" height="0.75rem" className="mt-2" />
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-6">
        <Container maxWidth="2xl" padding className="space-y-6">
          {/* AI Message */}
          <div className="flex gap-3">
            <Skeleton shape="circle" width={40} height={40} className="flex-shrink-0" />
            <Card className="flex-1 max-w-lg">
              <div className="space-y-2">
                <Skeleton height="1rem" />
                <Skeleton width="90%" height="1rem" />
                <Skeleton width="80%" height="1rem" />
              </div>
            </Card>
          </div>

          {/* User Message */}
          <div className="flex justify-end gap-3">
            <Card className="flex-1 max-w-lg bg-cyan-500/10">
              <Skeleton width="70%" height="1rem" />
            </Card>
          </div>

          {/* AI Message */}
          <div className="flex gap-3">
            <Skeleton shape="circle" width={40} height={40} className="flex-shrink-0" />
            <Card className="flex-1 max-w-lg">
              <div className="space-y-2">
                <Skeleton height="1rem" />
                <Skeleton height="1rem" />
                <Skeleton width="60%" height="1rem" />
              </div>
            </Card>
          </div>
        </Container>
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <Skeleton height="2.5rem" className="flex-1" shape="rounded" />
            <Skeleton width={40} height={40} shape="rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
