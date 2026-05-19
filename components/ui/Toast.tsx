'use client';

import { ReactNode } from 'react';
import toast, { Toast as HotToast } from 'react-hot-toast';
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastOptions {
  duration?: number;
  position?:
    | 'top-left'
    | 'top-center'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-center'
    | 'bottom-right';
}

const icons: Record<ToastType, ReactNode> = {
  success: <CheckCircle2 size={20} className="text-emerald-400" />,
  error: <AlertCircle size={20} className="text-rose-400" />,
  info: <Info size={20} className="text-cyan-400" />,
  warning: <AlertTriangle size={20} className="text-amber-400" />,
};

const colors: Record<ToastType, string> = {
  success: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/30',
  error: 'from-rose-500/10 to-rose-500/5 border-rose-500/30',
  info: 'from-cyan-500/10 to-cyan-500/5 border-cyan-500/30',
  warning: 'from-amber-500/10 to-amber-500/5 border-amber-500/30',
};

interface CustomToastProps {
  type: ToastType;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  t: HotToast;
}

function CustomToast({
  type,
  message,
  action,
  t,
}: CustomToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 px-4 py-3 glass-dark rounded-lg border backdrop-blur-md max-w-sm ${colors[type]}`}
    >
      {/* Icon */}
      <div className="flex-shrink-0">{icons[type]}</div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white break-words">{message}</p>
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={() => {
            action.onClick();
            toast.dismiss(t.id);
          }}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors flex-shrink-0 whitespace-nowrap"
        >
          {action.label}
        </button>
      )}

      {/* Close Button */}
      <button
        onClick={() => toast.dismiss(t.id)}
        className="p-1 text-slate-400 hover:text-white transition-colors flex-shrink-0"
        aria-label="Close"
      >
        <X size={16} />
      </button>

      {/* Progress Bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 4, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 origin-left"
        onAnimationComplete={() => toast.dismiss(t.id)}
      />
    </motion.div>
  );
}

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.custom(
      (t) => (
        <CustomToast type="success" message={message} t={t} />
      ),
      { duration: options?.duration || 3000, position: options?.position || 'top-right' }
    ),

  error: (message: string, options?: ToastOptions) =>
    toast.custom(
      (t) => (
        <CustomToast type="error" message={message} t={t} />
      ),
      { duration: options?.duration || 4000, position: options?.position || 'top-right' }
    ),

  info: (message: string, options?: ToastOptions) =>
    toast.custom(
      (t) => (
        <CustomToast type="info" message={message} t={t} />
      ),
      { duration: options?.duration || 3000, position: options?.position || 'top-right' }
    ),

  warning: (message: string, options?: ToastOptions) =>
    toast.custom(
      (t) => (
        <CustomToast type="warning" message={message} t={t} />
      ),
      { duration: options?.duration || 4000, position: options?.position || 'top-right' }
    ),

  loading: (message: string) =>
    toast.loading(message, { position: 'top-right' }),

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },
};

export function Toaster() {
  return null; // Handled by react-hot-toast provider
}
