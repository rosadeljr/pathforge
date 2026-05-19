'use client';

import { ReactNode } from 'react';

interface FormGroupProps {
  children: ReactNode;
  title?: string;
  description?: string;
  className?: string;
}

export function FormGroup({
  children,
  title,
  description,
  className = '',
}: FormGroupProps) {
  return (
    <div className={`space-y-4 p-6 rounded-lg border border-white/10 bg-black/20 ${className}`}>
      {title && (
        <div>
          <h4 className="text-sm font-semibold text-white">{title}</h4>
          {description && (
            <p className="text-xs text-slate-400 mt-1">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
