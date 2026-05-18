import { ReactNode } from "react";

interface ContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: boolean;
}

export function Container({
  children,
  className = "",
  maxWidth = "xl",
  padding = true,
}: ContainerProps) {
  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-4xl",
    "2xl": "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`
        mx-auto w-full
        ${maxWidths[maxWidth]}
        ${padding ? "px-4 sm:px-6 lg:px-8" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
