"use client";

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { WorldMap } from "@/components/learn/rpg/WorldMap";

export default function WorldMapPage() {
  return <RpgScreen active="map">{({ ps }) => <WorldMap ps={ps} />}</RpgScreen>;
}
