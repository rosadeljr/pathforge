"use client";

import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { RewardShop } from "@/components/learn/rpg/RewardShop";

export default function RewardsPage() {
  return <RpgScreen active="rewards">{({ ps }) => <RewardShop ps={ps} />}</RpgScreen>;
}
