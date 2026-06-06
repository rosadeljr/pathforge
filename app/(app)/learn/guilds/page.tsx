"use client";

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { CareerGuildPanel } from "@/components/learn/rpg/CareerGuildPanel";

export default function GuildsPage() {
  return <RpgScreen active="guilds">{({ ps }) => <CareerGuildPanel ps={ps} />}</RpgScreen>;
}
