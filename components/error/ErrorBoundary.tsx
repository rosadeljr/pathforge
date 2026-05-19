'use client';

import { ReactNode, Component, ErrorInfo } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Send to error tracking service (Sentry, etc)
    if (typeof window !== 'undefined' && (window as any).__reportError) {
      (window as any).__reportError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: this.state.errorCount + 1,
    });
  };

  handleHome = () => {
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      const isRepeatingError = this.state.errorCount > 2;

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="max-w-md w-full"
          >
            {/* Error Card */}
            <div className="rounded-2xl border-2 border-rose-600/50 bg-gradient-to-br from-rose-900/20 to-black/40 backdrop-blur-lg p-8 space-y-6">
              {/* Error Icon */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="flex justify-center"
              >
                <div className="p-4 rounded-full bg-rose-500/20 border-2 border-rose-500/40">
                  <AlertTriangle
                    size={32}
                    className="text-rose-400"
                  />
                </div>
              </motion.div>

              {/* Error Message */}
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-white">
                  Something Went Wrong
                </h1>
                <p className="text-sm text-slate-400">
                  An unexpected error occurred. Our team has been notified.
                </p>
              </div>

              {/* Error Details (Dev Mode) */}
              {process.env.NODE_ENV === 'development' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="p-3 rounded-lg bg-slate-900/80 border border-slate-700 overflow-auto max-h-32"
                >
                  <p className="text-xs font-mono text-slate-300 whitespace-pre-wrap break-words">
                    {this.state.error?.message}
                  </p>
                </motion.div>
              )}

              {/* Error Status */}
              {isRepeatingError && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30"
                >
                  <p className="text-xs text-amber-300">
                    ⚠️ Multiple errors detected. We recommend returning to the home page.
                  </p>
                </motion.div>
              )}

              {/* Recovery Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  variant="primary"
                  onClick={this.handleRetry}
                  className="w-full"
                >
                  <RefreshCw size={18} />
                  Try Again
                </Button>

                <Button
                  variant="secondary"
                  onClick={this.handleHome}
                  className="w-full"
                >
                  <Home size={18} />
                  Back to Home
                </Button>
              </div>

              {/* Support Link */}
              <div className="text-center pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400">
                  Need help?{' '}
                  <a
                    href="/support"
                    className="text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Contact support
                  </a>
                </p>
              </div>
            </div>

            {/* Background Animation */}
            <motion.div
              animate={{
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -inset-20 bg-gradient-to-r from-rose-600/20 to-violet-600/20 rounded-3xl blur-3xl -z-10"
            />
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}
