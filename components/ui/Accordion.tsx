'use client';

import { ReactNode, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: ReactNode;
  content: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
}

interface AccordionProps {
  items: AccordionItem[];
  type?: 'single' | 'multiple';
  className?: string;
}

export function Accordion({
  items,
  type = 'single',
  className = '',
}: AccordionProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (itemId: string) => {
    if (type === 'single') {
      setOpenItems((prev) =>
        prev.has(itemId) ? new Set() : new Set([itemId])
      );
    } else {
      setOpenItems((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    }
  };

  const isItemOpen = (itemId: string) => openItems.has(itemId);

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={false}
          className="overflow-hidden border border-white/10 rounded-lg hover:border-cyan-500/30 transition-colors"
        >
          {/* Header */}
          <button
            onClick={() => !item.disabled && toggleItem(item.id)}
            disabled={item.disabled}
            className={`w-full flex items-center justify-between gap-3 px-4 py-4 text-left transition-colors ${
              item.disabled
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-white/5'
            } ${
              isItemOpen(item.id)
                ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10'
                : ''
            }`}
            aria-expanded={isItemOpen(item.id)}
            aria-controls={`accordion-content-${item.id}`}
          >
            <span className="flex items-center gap-3 flex-1 min-w-0">
              {item.icon && (
                <span className="text-lg flex-shrink-0">{item.icon}</span>
              )}
              <span className="font-medium text-white">{item.title}</span>
            </span>

            <motion.div
              animate={{ rotate: isItemOpen(item.id) ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0"
            >
              <ChevronDown
                size={20}
                className="text-slate-400"
                aria-hidden="true"
              />
            </motion.div>
          </button>

          {/* Content */}
          <AnimatePresence initial={false}>
            {isItemOpen(item.id) && (
              <motion.div
                id={`accordion-content-${item.id}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-4 border-t border-white/10 bg-black/20 text-slate-300 text-sm leading-relaxed">
                  {item.content}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}
