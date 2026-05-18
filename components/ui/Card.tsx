import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  glass?: boolean;
  hover?: boolean;
  interactive?: boolean;
}

export function Card({
  children,
  className = "",
  glass = true,
  hover = true,
  interactive = false,
}: CardProps) {
  const baseStyles = "rounded-2xl p-6 border transition-all";
  const glasStyle = glass
    ? "glass-dark"
    : "bg-slate-900/50 border-slate-800";
  const hoverStyle = hover
    ? "hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/20"
    : "";
  const interactiveStyle = interactive
    ? "cursor-pointer hover:-translate-y-1"
    : "";

  return (
    <div className={`${baseStyles} ${glasStyle} ${hoverStyle} ${interactiveStyle} ${className}`}>
      {children}
    </div>
  );
}
