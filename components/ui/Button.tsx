import { ReactNode, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "tertiary" | "ghost";
  size?: "sm" | "md" | "lg";
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  loading = false,
  icon,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "font-semibold rounded-lg transition-all inline-flex items-center gap-2 justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary: "btn-gradient hover:shadow-glow-cyan hover:-translate-y-0.5",
    secondary: "border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400",
    tertiary: "text-cyan-400 hover:text-cyan-300",
    ghost: "text-slate-400 hover:text-white hover:bg-slate-800/50",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading}
      {...props}
    >
      {loading ? <span className="animate-spin">⏳</span> : icon}
      {children}
    </button>
  );
}
