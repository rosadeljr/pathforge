'use client';

import { motion } from 'framer-motion';

type SkeletonShape = 'rect' | 'circle' | 'rounded';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  shape?: SkeletonShape;
  className?: string;
  count?: number;
  animated?: boolean;
}

const shapeClasses = {
  rect: 'rounded-lg',
  circle: 'rounded-full',
  rounded: 'rounded-2xl',
};

export function Skeleton({
  width = '100%',
  height = '1rem',
  shape = 'rect',
  className = '',
  count = 1,
  animated = true,
}: SkeletonProps) {
  const skeletons = Array.from({ length: count });

  return (
    <div className={`space-y-2 ${className}`}>
      {skeletons.map((_, index) => (
        <motion.div
          key={index}
          className={`bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 ${shapeClasses[shape]}`}
          style={{
            width: typeof width === 'number' ? `${width}px` : width,
            height: typeof height === 'number' ? `${height}px` : height,
            ...(animated ? { backgroundSize: '200% 100%' } : {}),
          }}
          animate={
            animated
              ? {
                  backgroundPosition: ['200% 0', '-200% 0'],
                }
              : undefined
          }
          transition={
            animated
              ? {
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }
              : undefined
          }
        />
      ))}
    </div>
  );
}

// Preset Skeletons

export function SkeletonCard() {
  return (
    <div className="space-y-4 p-6 glass-dark rounded-2xl border border-white/10">
      <Skeleton width="80%" height="1.5rem" />
      <div className="space-y-2">
        <Skeleton height="1rem" />
        <Skeleton height="1rem" width="90%" />
      </div>
      <div className="flex gap-2">
        <Skeleton shape="circle" width={40} height={40} />
        <Skeleton shape="circle" width={40} height={40} />
      </div>
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? '80%' : '100%'}
          height="1rem"
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar() {
  return <Skeleton shape="circle" width={40} height={40} />;
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton shape="circle" width={40} height={40} />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" height="0.875rem" />
            <Skeleton width="50%" height="0.75rem" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkeletonGrid({ columns = 3, count = 6 }: { columns?: number; count?: number }) {
  return (
    <div className={`grid grid-cols-${columns} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
