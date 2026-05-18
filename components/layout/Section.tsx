import { ReactNode } from "react";
import { Container } from "./Container";

interface SectionProps {
  children: ReactNode;
  className?: string;
  background?: "dark" | "gradient" | "glass";
  padding?: "sm" | "md" | "lg" | "xl";
  id?: string;
}

export function Section({
  children,
  className = "",
  background = "dark",
  padding = "lg",
  id,
}: SectionProps) {
  const backgrounds = {
    dark: "bg-black",
    gradient: "bg-gradient-to-b from-slate-900/50 to-black",
    glass: "bg-gradient-to-b from-cyan-500/5 to-violet-500/5 backdrop-blur-sm border-y border-cyan-500/10",
  };

  const paddings = {
    sm: "py-8",
    md: "py-12",
    lg: "py-16 sm:py-20",
    xl: "py-20 sm:py-28",
  };

  return (
    <section
      id={id}
      className={`
        ${backgrounds[background]}
        ${paddings[padding]}
        ${className}
      `}
    >
      <Container>{children}</Container>
    </section>
  );
}
