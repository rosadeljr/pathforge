/**
 * VESTIGIAL — kept only so admin pages and leaderboard still build.
 * PathForge is now a kids' learning app; career paths live in
 * lib/data/careers.ts (different shape). This file returns an empty
 * array; consumers handle the empty case.
 */

export interface CareerPath {
  id: string;
  title: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  tagline: string;
}

export const CAREER_PATHS: CareerPath[] = [];

export function formatPhp(n: number): string {
  return `₱${n.toLocaleString()}`;
}
