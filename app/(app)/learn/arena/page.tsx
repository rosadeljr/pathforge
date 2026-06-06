"use client";

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { ArenaPanel } from "@/components/learn/rpg/ArenaPanel";

export default function ArenaPage() {
  return <RpgScreen active="arena">{({ ps }) => <ArenaPanel ps={ps} />}</RpgScreen>;
}
