'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

export interface TabItem {
  id: string;
  label: ReactNode;
  icon?: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  onChange?: (tabId: string) => void;
  variant?: 'default' | 'outline' | 'soft';
  className?: string;
}

export function Tabs({
  tabs,
  defaultTabId,
  onChange,
  variant = 'default',
  className = '',
}: TabsProps) {
  const [activeTabId, setActiveTabId] = useState(
    defaultTabId || tabs[0]?.id
  );

  const activeTab = tabs.find((t) => t.id === activeTabId);

  const handleTabChange = (tabId: string) => {
    setActiveTabId(tabId);
    onChange?.(tabId);
  };

  const variantStyles = {
    default: {
      trigger:
        'px-4 py-2 text-sm font-medium text-slate-400 hover:text-white transition-colors relative',
      indicator:
        'absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500',
      activeText: 'text-white',
      container: 'border-b border-white/10',
    },
    outline: {
      trigger:
        'px-4 py-2 text-sm font-medium rounded-lg border border-white/10 text-slate-400 hover:border-cyan-500/50 hover:text-white transition-all',
      indicator: '',
      activeText: 'text-white bg-cyan-500/20 border-cyan-500/50',
      container: 'flex gap-2 mb-4',
    },
    soft: {
      trigger:
        'px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:bg-white/5 hover:text-white transition-all',
      indicator: '',
      activeText: 'text-white bg-cyan-500/30',
      container: 'flex gap-2 mb-4',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={className}>
      {/* Tab Triggers */}
      <div
        className={`flex items-center gap-1 ${
          variant === 'default' ? styles.container : ''
        }`}
        role="tablist"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={`${styles.trigger} ${
              activeTabId === tab.id ? styles.activeText : ''
            } ${tab.disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
              variant !== 'default' && activeTabId === tab.id
                ? styles.activeText
                : ''
            }`}
            role="tab"
            aria-selected={activeTabId === tab.id}
            aria-controls={`panel-${tab.id}`}
          >
            <span className="flex items-center gap-2">
              {tab.icon && <span className="text-base">{tab.icon}</span>}
              {tab.label}
            </span>

            {variant === 'default' && activeTabId === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className={styles.indicator}
                transition={{ duration: 0.3 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab && (
        <motion.div
          key={activeTab.id}
          id={`panel-${activeTab.id}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          role="tabpanel"
          className="mt-4"
        >
          {activeTab.content}
        </motion.div>
      )}
    </div>
  );
}
