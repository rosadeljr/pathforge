'use client';

import { ReactNode } from 'react';

interface FormHintProps {
  children?: ReactNode;
  className?: string;
}

export function FormHint({ children, className = '' }: FormHintProps) {
  if (!children) return null;

  return (
    <p className={`text-xs text-slate-400 mt-1.5 ${className}`}>
      {children}
    </p>
  );
}
