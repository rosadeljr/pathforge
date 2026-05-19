import { clsx, type ClassValue } from "clsx";

/**
 * Tailwind class merge utility.
 * Combines clsx for conditional classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
