"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RpgScreen } from "@/components/learn/rpg/RpgScreen";
import { QuestBoard } from "@/components/learn/rpg/QuestBoard";

function QuestsInner() {
  const sp = useSearchParams();
  const focus = sp.get("focus") ?? undefined;
  return <RpgScreen active="quests">{({ ps }) => <QuestBoard ps={ps} focusId={focus} />}</RpgScreen>;
}

export default function QuestsPage() {
  return (
    <Suspense fallback={null}>
      <QuestsInner />
    </Suspense>
  );
}
