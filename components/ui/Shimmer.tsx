import { cn } from "@/lib/utils/cn";

interface ShimmerProps {
  className?: string;
}

/**
 * Lightweight shimmer-styled skeleton block.
 * Use for loading placeholders instead of spinners.
 */
export function Shimmer({ className }: ShimmerProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white/[0.04] rounded-md",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-white/[0.06] before:to-transparent",
        "before:animate-[shimmer_1.5s_infinite]",
        className
      )}
    />
  );
}

export function ShimmerText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          className={cn("h-3", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Premium loading state for full-page or section loads. */
export function PageShimmer() {
  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        <div className="space-y-2">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-9 w-64" />
        </div>
        <Shimmer className="h-44 w-full rounded-3xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Shimmer key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Shimmer key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function QuestListShimmer() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="p-5 sm:p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] flex gap-4 items-center"
        >
          <Shimmer className="w-12 h-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Shimmer className="h-4 w-2/3" />
            <Shimmer className="h-3 w-full" />
            <div className="flex gap-2 mt-3">
              <Shimmer className="h-3 w-12" />
              <Shimmer className="h-3 w-16" />
            </div>
          </div>
          <Shimmer className="w-5 h-5 rounded" />
        </div>
      ))}
    </div>
  );
}
