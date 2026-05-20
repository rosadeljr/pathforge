"use client";

import Link from "next/link";
import { cn } from "@/lib/utils/cn";
import { forwardRef } from "react";

/**
 * Primary CTA button — premium gradient with subtle inner glow.
 * Use for the main action on each page (Sign up, Get started, etc).
 *
 * Use as either:
 *   <PrimaryButton onClick={...}>Click me</PrimaryButton>
 *   <PrimaryButton.Link href="...">Click me</PrimaryButton.Link>
 */

interface BaseProps {
  size?: "sm" | "md" | "lg";
  variant?: "gradient" | "solid";
  className?: string;
  children: React.ReactNode;
}

const baseClasses = cn(
  "group relative inline-flex items-center justify-center gap-2 font-semibold tracking-tight",
  "transition-all duration-300 overflow-hidden",
  "disabled:opacity-50 disabled:cursor-not-allowed",
  // Crisp inner highlight + soft shadow for premium feel
  "shadow-[0_8px_24px_-4px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.15)]",
  "hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.55),inset_0_1px_0_rgba(255,255,255,0.2)]",
  "active:scale-[0.98]"
);

const sizeClasses = {
  sm: "px-3.5 py-1.5 text-xs rounded-lg",
  md: "px-5 py-2.5 text-sm rounded-lg",
  lg: "px-6 py-3 text-sm rounded-xl",
};

const variantClasses = {
  gradient: cn(
    "text-white",
    // Animated gradient background
    "bg-[linear-gradient(110deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)]",
    "bg-[length:200%_100%]",
    "hover:bg-[position:100%_0]",
    // Border glow on hover
    "before:absolute before:inset-0 before:rounded-[inherit]",
    "before:bg-gradient-to-r before:from-indigo-400/0 before:via-purple-400/30 before:to-pink-400/0",
    "before:opacity-0 hover:before:opacity-100 before:transition-opacity"
  ),
  solid: cn(
    "text-white bg-indigo-500 hover:bg-indigo-400",
    "border border-indigo-400/50 hover:border-indigo-300/60"
  ),
};

export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ size = "md", variant = "gradient", className, children, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
});
PrimaryButton.displayName = "PrimaryButton";

export const PrimaryLinkButton = forwardRef<
  HTMLAnchorElement,
  BaseProps & { href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>
>(({ size = "md", variant = "gradient", className, children, href, ...props }, ref) => {
  return (
    <Link
      ref={ref}
      href={href}
      className={cn(baseClasses, sizeClasses[size], variantClasses[variant], className)}
      {...props}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </Link>
  );
});
PrimaryLinkButton.displayName = "PrimaryLinkButton";
