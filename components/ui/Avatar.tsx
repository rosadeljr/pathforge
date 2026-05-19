'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  initials?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  badge?: ReactNode;
  className?: string;
}

const sizeClasses: Record<AvatarSize, { container: string; image: string; initials: string }> = {
  xs: {
    container: 'w-6 h-6',
    image: 'w-6 h-6',
    initials: 'text-xs',
  },
  sm: {
    container: 'w-8 h-8',
    image: 'w-8 h-8',
    initials: 'text-sm',
  },
  md: {
    container: 'w-10 h-10',
    image: 'w-10 h-10',
    initials: 'text-base',
  },
  lg: {
    container: 'w-12 h-12',
    image: 'w-12 h-12',
    initials: 'text-lg',
  },
  xl: {
    container: 'w-16 h-16',
    image: 'w-16 h-16',
    initials: 'text-2xl',
  },
  '2xl': {
    container: 'w-20 h-20',
    image: 'w-20 h-20',
    initials: 'text-3xl',
  },
};

const statusColors: Record<AvatarStatus, string> = {
  online: 'bg-emerald-500',
  offline: 'bg-slate-500',
  away: 'bg-amber-500',
  busy: 'bg-rose-500',
};

const statusSizes: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 -bottom-0.5 -right-0.5 border',
  sm: 'w-2 h-2 -bottom-0.5 -right-0.5 border',
  md: 'w-2.5 h-2.5 -bottom-1 -right-1 border-2',
  lg: 'w-3 h-3 -bottom-1 -right-1 border-2',
  xl: 'w-4 h-4 -bottom-1.5 -right-1.5 border-2',
  '2xl': 'w-5 h-5 -bottom-2 -right-2 border-2',
};

export function Avatar({
  src,
  alt = 'Avatar',
  fallback = '?',
  initials,
  size = 'md',
  status,
  badge,
  className = '',
}: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const statusSize = statusSizes[size];
  const statusColor = status && status !== undefined ? statusColors[status] : '';

  // Generate initials from name if provided
  const displayInitials =
    initials ||
    (alt
      ? alt
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
      : fallback);

  // Generate avatar color based on initials
  const colors = [
    'from-cyan-500 to-blue-500',
    'from-violet-500 to-purple-500',
    'from-amber-500 to-orange-500',
    'from-emerald-500 to-green-500',
    'from-rose-500 to-pink-500',
  ];
  const colorIndex = displayInitials.charCodeAt(0) % colors.length;
  const bgGradient = colors[colorIndex];

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        className={`${sizeClass.container} rounded-full overflow-hidden flex items-center justify-center border border-white/10 flex-shrink-0`}
      >
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={200}
            height={200}
            className={`${sizeClass.image} object-cover`}
            onError={(e) => {
              // Fallback to initials on image error
              (e.currentTarget as any).style.display = 'none';
            }}
          />
        ) : (
          <div
            className={`w-full h-full rounded-full flex items-center justify-center bg-gradient-to-br ${bgGradient} font-semibold text-white ${sizeClass.initials}`}
          >
            {displayInitials}
          </div>
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <div
          className={`absolute rounded-full ${statusSize} ${statusColor} border-black`}
          role="img"
          aria-label={`Status: ${status}`}
        />
      )}

      {/* Badge */}
      {badge && (
        <div className="absolute -top-1 -right-1 z-10">
          {badge}
        </div>
      )}
    </div>
  );
}

// Avatar Group Component
interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarSize;
  className?: string;
}

export function AvatarGroup({
  avatars,
  max = 3,
  size = 'md',
  className = '',
}: AvatarGroupProps) {
  const displayAvatars = avatars.slice(0, max);
  const remaining = Math.max(0, avatars.length - max);

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div key={index} className="relative z-10" style={{ zIndex: displayAvatars.length - index }}>
          <Avatar {...avatar} size={size} />
        </div>
      ))}

      {remaining > 0 && (
        <div
          className={`${sizeClasses[size].container} rounded-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-800 border border-white/10 font-semibold text-white text-xs`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
}
