'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type TooltipPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-start'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-end';

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: TooltipPosition;
  delay?: number;
  className?: string;
}

const positionClasses: Record<TooltipPosition, string> = {
  top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  'top-start': 'bottom-full mb-2 left-0',
  'top-end': 'bottom-full mb-2 right-0',
  'bottom-start': 'top-full mt-2 left-0',
  'bottom-end': 'top-full mt-2 right-0',
};

const arrowPositions: Record<TooltipPosition, string> = {
  top: 'top-full border-t-slate-700',
  bottom: 'bottom-full border-b-slate-700',
  left: 'left-full border-l-slate-700',
  right: 'right-full border-r-slate-700',
  'top-start': 'top-full left-2 border-t-slate-700',
  'top-end': 'top-full right-2 border-t-slate-700',
  'bottom-start': 'bottom-full left-2 border-b-slate-700',
  'bottom-end': 'bottom-full right-2 border-b-slate-700',
};

const initialVariants: Record<TooltipPosition, any> = {
  top: { opacity: 0, y: 8 },
  bottom: { opacity: 0, y: -8 },
  left: { opacity: 0, x: 8 },
  right: { opacity: 0, x: -8 },
  'top-start': { opacity: 0, y: 8 },
  'top-end': { opacity: 0, y: 8 },
  'bottom-start': { opacity: 0, y: -8 },
  'bottom-end': { opacity: 0, y: -8 },
};

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  className = '',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      setShowTooltip(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
    setTimeout(() => setShowTooltip(false), 150);
  };

  // Keyboard accessibility: show immediately on focus, hide on blur or Escape
  // (was mouse-only before, so keyboard users never saw tooltips).
  const handleFocus = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(true);
    setShowTooltip(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && showTooltip) handleMouseLeave();
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-fit ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
    >
      {/* Trigger */}
      {children}

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={initialVariants[position]}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={initialVariants[position]}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 pointer-events-none ${positionClasses[position]}`}
          >
            <div role="tooltip" className="px-3 py-2 glass-dark rounded-lg border border-white/10 whitespace-nowrap text-xs font-medium text-white shadow-lg">
              {content}

              {/* Arrow */}
              <div
                className={`absolute w-2 h-2 bg-slate-700 border border-white/10 ${arrowPositions[position]} -m-1 rotate-45`}
                style={{
                  borderTopColor:
                    position === 'top' || position === 'top-start' || position === 'top-end'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  borderRightColor:
                    position === 'right'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  borderBottomColor:
                    position === 'bottom' || position === 'bottom-start' || position === 'bottom-end'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                  borderLeftColor:
                    position === 'left'
                      ? 'rgba(255, 255, 255, 0.1)'
                      : 'transparent',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
