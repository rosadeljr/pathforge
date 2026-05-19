'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type PopoverPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

interface PopoverProps {
  content: ReactNode;
  children: ReactNode;
  trigger?: 'click' | 'hover';
  position?: PopoverPosition;
  className?: string;
}

const positionClasses: Record<PopoverPosition, string> = {
  top: 'bottom-full mb-4 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-4 left-1/2 -translate-x-1/2',
  left: 'right-full mr-4 top-1/2 -translate-y-1/2',
  right: 'left-full ml-4 top-1/2 -translate-y-1/2',
};

const initialVariants: Record<PopoverPosition, any> = {
  top: { opacity: 0, y: 8 },
  bottom: { opacity: 0, y: -8 },
  left: { opacity: 0, x: 8 },
  right: { opacity: 0, x: -8 },
};

export function Popover({
  content,
  children,
  trigger = 'click',
  position = 'bottom',
  className = '',
}: PopoverProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        contentRef.current &&
        !contentRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen && trigger === 'click') {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, trigger]);

  const handleTriggerClick = () => {
    if (trigger === 'click') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      setIsOpen(false);
    }
  };

  return (
    <div
      className={`relative inline-block w-fit ${className}`}
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger */}
      <div onClick={handleTriggerClick}>{children}</div>

      {/* Popover Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={contentRef}
            initial={initialVariants[position]}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={initialVariants[position]}
            transition={{ duration: 0.15 }}
            className={`absolute z-50 min-w-max ${positionClasses[position]}`}
          >
            <div className="glass-dark rounded-lg border border-white/10 shadow-lg overflow-hidden">
              {content}
            </div>

            {/* Arrow */}
            <div
              className={`absolute w-3 h-3 glass-dark border border-white/10 rotate-45 ${
                position === 'bottom'
                  ? '-top-1.5 left-1/2 -translate-x-1/2'
                  : position === 'top'
                  ? '-bottom-1.5 left-1/2 -translate-x-1/2'
                  : position === 'left'
                  ? '-right-1.5 top-1/2 -translate-y-1/2'
                  : '-left-1.5 top-1/2 -translate-y-1/2'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
