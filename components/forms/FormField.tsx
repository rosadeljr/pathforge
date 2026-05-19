'use client';

import { ReactNode, InputHTMLAttributes } from 'react';
import { FormLabel } from './FormLabel';
import { FormError } from './FormError';
import { FormHint } from './FormHint';

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  containerClassName?: string;
  inputClassName?: string;
}

export function FormField({
  label,
  error,
  hint,
  required = false,
  icon,
  iconPosition = 'left',
  containerClassName = '',
  inputClassName = '',
  id,
  type = 'text',
  placeholder,
  disabled = false,
  ...props
}: FormFieldProps) {
  const fieldId = id || `field-${Math.random()}`;

  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <FormLabel htmlFor={fieldId} required={required}>
          {label}
        </FormLabel>
      )}

      {/* Input Container */}
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}

        <input
          type={type}
          id={fieldId}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 rounded-lg transition-all
            glass-dark border border-white/10
            text-white placeholder-slate-500
            focus:outline-none focus:border-cyan-500/50 focus:shadow-lg focus:shadow-cyan-500/20
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon && iconPosition === 'left' ? 'pl-10' : ''}
            ${icon && iconPosition === 'right' ? 'pr-10' : ''}
            ${error ? 'border-rose-500/50 focus:border-rose-500/50 focus:shadow-rose-500/20' : ''}
            ${inputClassName}
          `}
          {...props}
        />

        {icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
      </div>

      {/* Error and Hint */}
      {error && <FormError>{error}</FormError>}
      {hint && !error && <FormHint>{hint}</FormHint>}
    </div>
  );
}
