interface ProgressProps {
  value: number;
  max?: number;
  color?: "cyan" | "violet" | "amber" | "emerald";
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

export function Progress({
  value,
  max = 100,
  color = "cyan",
  showLabel = true,
  size = "md",
}: ProgressProps) {
  const percentage = (value / max) * 100;

  const colors = {
    cyan: "from-cyan-500 to-cyan-400",
    violet: "from-violet-500 to-violet-400",
    amber: "from-amber-500 to-amber-400",
    emerald: "from-emerald-500 to-emerald-400",
  };

  const sizes = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-800 rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`h-full bg-gradient-to-r ${colors[color]} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-slate-400 mt-1">{Math.round(percentage)}%</p>
      )}
    </div>
  );
}
