/**
 * PathForge brand mark.
 * Geometric crystalline diamond with an upward chevron — represents
 * forging upward through paths. Distinctive, scalable, premium.
 */
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: number;
  className?: string;
  /**
   * Variant controls fill style.
   * - "gradient" (default): indigo→purple→pink gradient
   * - "mono": single white/current color
   * - "outlined": transparent fill with stroke
   */
  variant?: "gradient" | "mono" | "outlined";
  showWordmark?: boolean;
  wordmarkClassName?: string;
}

export function Logo({
  size = 32,
  className,
  variant = "gradient",
  showWordmark = false,
  wordmarkClassName,
}: LogoProps) {
  const gradientId = "pf-logo-gradient";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {variant === "gradient" && (
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id={`${gradientId}-highlight`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.25)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
          </defs>
        )}

        {/* Outer diamond */}
        <path
          d="M16 2 L30 16 L16 30 L2 16 Z"
          fill={
            variant === "gradient"
              ? `url(#${gradientId})`
              : variant === "mono"
              ? "currentColor"
              : "none"
          }
          stroke={variant === "outlined" ? "currentColor" : "none"}
          strokeWidth={variant === "outlined" ? 2 : 0}
          strokeLinejoin="round"
        />

        {/* Subtle top highlight for premium feel */}
        {variant === "gradient" && (
          <path
            d="M16 2 L30 16 L16 16 Z"
            fill={`url(#${gradientId}-highlight)`}
          />
        )}

        {/* Inner chevron (upward path) */}
        <path
          d="M8.5 18.5 L16 11 L23.5 18.5"
          stroke={variant === "outlined" ? "currentColor" : "white"}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Vertical spine */}
        <path
          d="M16 11 L16 22.5"
          stroke={variant === "outlined" ? "currentColor" : "white"}
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <span
          className={cn(
            "font-semibold tracking-tight",
            wordmarkClassName ?? "text-base"
          )}
        >
          PathForge
        </span>
      )}
    </div>
  );
}
