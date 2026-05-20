/**
 * PathForge brand mark — refined.
 *
 * Concept: A forged angular shield containing an upward path.
 * The outer shape is sharper and more sophisticated than a plain diamond,
 * with a subtle inner shadow that suggests forged metal depth.
 *
 * Looks like a premium logo at any size from 16px to 256px.
 */
import { cn } from "@/lib/utils/cn";

interface LogoProps {
  size?: number;
  className?: string;
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
  const gid = "pf-grad";
  const giid = "pf-grad-inner";
  const shadowId = "pf-shadow";

  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {variant === "gradient" && (
          <defs>
            {/* Main gradient — indigo → purple → pink (brand) */}
            <linearGradient id={gid} x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            {/* Inner subtle gradient for the chevron — slight darker rose at bottom */}
            <linearGradient id={giid} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.7)" />
            </linearGradient>
            {/* Inner highlight (top edge) */}
            <linearGradient id={`${gid}-light`} x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
              <stop offset="40%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            {/* Soft shadow filter */}
            <filter id={shadowId} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceAlpha" stdDeviation="0.5" />
              <feOffset dx="0" dy="0.5" result="offsetblur" />
              <feComponentTransfer>
                <feFuncA type="linear" slope="0.3" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        )}

        {/* Outer angular shield — refined hexagonal-diamond hybrid */}
        <path
          d="M20 2.5
             L34.5 11
             L34.5 29
             L20 37.5
             L5.5 29
             L5.5 11
             Z"
          fill={
            variant === "gradient"
              ? `url(#${gid})`
              : variant === "mono"
              ? "currentColor"
              : "none"
          }
          stroke={variant === "outlined" ? "currentColor" : "none"}
          strokeWidth={variant === "outlined" ? 2.5 : 0}
          strokeLinejoin="round"
        />

        {/* Top highlight to give it depth */}
        {variant === "gradient" && (
          <path
            d="M20 2.5
               L34.5 11
               L20 19
               L5.5 11
               Z"
            fill={`url(#${gid}-light)`}
          />
        )}

        {/* Inner ascending chevron — the "path" */}
        <g
          fill="none"
          stroke={variant === "outlined" ? "currentColor" : "white"}
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Upper chevron (the peak) */}
          <path d="M12 23 L20 14 L28 23" />
          {/* Lower chevron (echoes upward motion) */}
          <path d="M14.5 28.5 L20 23 L25.5 28.5" opacity="0.55" />
        </g>
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
