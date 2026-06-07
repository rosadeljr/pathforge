"use client";

/**
 * /learn — Forgeheart City hub. A clean, premium learn hub rendered inside the
 * GameShell (HUD + section nav + character/quest rails) with reliable, fully
 * responsive layout.
 */

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { ForgeheartHub } from "@/components/learn/rpg/ForgeheartHub";

export default function LearnHubPage() {
  return <RpgScreen active="town">{({ ps }) => <ForgeheartHub ps={ps} />}</RpgScreen>;
}
