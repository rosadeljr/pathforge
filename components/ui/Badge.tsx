import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "cyan" | "violet" | "amber" | "emerald" | "rose" | "slate";
  size?: "sm" | "md";
}

export function Badge({
  children,
  variant = "cyan",
  size = "sm",
}: BadgeProps) {
  const variants = {
    cyan: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30",
    violet: "bg-violet-500/20 text-violet-300 border border-violet-500/30",
    amber: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    emerald: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    rose: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
    slate: "bg-slate-700/50 text-slate-300 border border-slate-600/50",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs font-medium rounded",
    md: "px-3 py-1.5 text-sm font-semibold rounded-md",
  };

  return (
    <span className={`inline-flex items-center ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
