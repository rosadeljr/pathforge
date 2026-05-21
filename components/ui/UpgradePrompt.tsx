import Link from "next/link";
import { Lock, ArrowRight } from "lucide-react";

interface UpgradePromptProps {
  title: string;
  description: string;
  /** Compact inline variant for tight spaces. */
  compact?: boolean;
}

/**
 * Shown the moment a free user hits a Pro-gated feature.
 * Keep the copy specific to what they're unlocking, not generic.
 */
export function UpgradePrompt({ title, description, compact }: UpgradePromptProps) {
  return (
    <div
      className={`rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] to-transparent ${
        compact ? "p-4" : "p-5"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
          <Lock size={15} className="text-violet-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold mb-0.5">{title}</h3>
          <p className="text-xs text-slate-400 mb-3 leading-relaxed">{description}</p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-slate-900 text-xs font-semibold hover:bg-slate-100 transition-colors"
          >
            Upgrade to Pro
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}
