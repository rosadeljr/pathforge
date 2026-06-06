"use client";

/**
 * /learn — the PathForge RPG hub: Forgeheart City. The main game shell with the
 * playable hub town as the center stage. (Replaces the former dashboard view.)
 */

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { HubTown } from "@/components/learn/rpg/HubTown";

export default function LearnHubPage() {
  return <RpgScreen active="town">{({ ps }) => <HubTown ps={ps} />}</RpgScreen>;
}
