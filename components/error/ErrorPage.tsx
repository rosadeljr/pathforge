'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Home, AlertTriangle, Zap } from 'lucide-react';
import Link from 'next/link';

interface ErrorPageProps {
  statusCode: 404 | 500 | 503;
  title: string;
  description: string;
  showDetails?: boolean;
  error?: Error;
}

const errorConfig = {
  404: {
    icon: '🗺️',
    color: 'from-blue-600 to-blue-800 border-blue-500',
    glow: 'shadow-blue-600/30',
    message: 'Lost in the dark dungeons...',
  },
  500: {
    icon: '💥',
    color: 'from-rose-600 to-rose-800 border-rose-500',
    glow: 'shadow-rose-600/30',
    message: 'System overload detected!',
  },
  503: {
    icon: '🔧',
    color: 'from-amber-600 to-amber-800 border-amber-500',
    glow: 'shadow-amber-600/30',
    message: 'Maintenance mode active...',
  },
};

export function ErrorPage({
  statusCode,
  title,
  description,
  showDetails = false,
  error,
}: ErrorPageProps) {
  const config = errorConfig[statusCode];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        {/* Error Card */}
        <div
          className={`rounded-2xl border-2 bg-gradient-to-br ${config.color} backdrop-blur-lg p-8 space-y-6 ${config.glow}`}
        >
          {/* Status Code */}
          <motion.div
            animate={{
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0],
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="text-7xl font-black mb-2">
              {config.icon}
            </div>
            <h1 className="text-5xl font-black text-white mb-1">
              {statusCode}
            </h1>
            <p className="text-sm text-white/70 italic">{config.message}</p>
          </motion.div>

          {/* Error Details */}
          <div className="text-center space-y-2 pt-4 border-t border-white/10">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <p className="text-sm text-slate-300">{description}</p>
          </div>

          {/* Dev Details */}
          {showDetails && error && process.env.NODE_ENV === 'development' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 overflow-auto max-h-32"
            >
              <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words">
                {error.message}
              </p>
            </motion.div>
          )}

          {/* Actions */}
          <div className="space-y-2 pt-4 border-t border-white/10">
            <Link href="/" className="block">
              <Button variant="primary" className="w-full">
                <Home size={18} />
                Return Home
              </Button>
            </Link>

            <Link href="/dashboard" className="block">
              <Button variant="secondary" className="w-full">
                <Zap size={18} />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Support */}
          <div className="text-center pt-2 border-t border-white/10">
            <p className="text-xs text-slate-400">
              Still stuck?{' '}
              <a
                href="/support"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                Get help
              </a>
            </p>
          </div>
        </div>

        {/* Background Glow */}
        <motion.div
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute -inset-20 bg-gradient-to-r ${config.color} rounded-3xl blur-3xl -z-10`}
        />
      </motion.div>
    </div>
  );
}

// Preset error pages
export function Error404() {
  return (
    <ErrorPage
      statusCode={404}
      title="Page Not Found"
      description="The path you're seeking doesn't exist in this realm. Perhaps you took a wrong turn?"
    />
  );
}

export function Error500() {
  return (
    <ErrorPage
      statusCode={500}
      title="Server Error"
      description="Something catastrophic happened on our end. Our team is investigating the crisis."
    />
  );
}

export function Error503() {
  return (
    <ErrorPage
      statusCode={503}
      title="Service Unavailable"
      description="We're currently undergoing maintenance. We'll be back stronger than ever soon."
    />
  );
}
