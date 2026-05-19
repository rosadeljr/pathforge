'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface FormErrorProps {
  children?: ReactNode;
  className?: string;
}

export function FormError({ children, className = '' }: FormErrorProps) {
  if (!children) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.15 }}
      className={`flex items-center gap-2 mt-2 text-sm text-rose-400 ${className}`}
    >
      <AlertCircle size={16} className="flex-shrink-0" />
      <span>{children}</span>
    </motion.div>
  );
}
