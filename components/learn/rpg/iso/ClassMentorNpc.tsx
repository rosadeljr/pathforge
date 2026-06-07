"use client";

/** ClassMentorNpc — a chibi mentor standing in the plaza with a speech bubble. */

import { TownAvatar, type AvatarItem, type AvatarHat } from "./TownAvatar";
import { SpeechBubble } from "./SpeechBubble";

export function ClassMentorNpc({
  name,
  line,
  accent,
  trim = "#fcd34d",
  hair = "#3b2a1a",
  skin = "#f6d3b0",
  item = "none",
  hat = "none",
  flip = false,
  width = 60,
}: {
  name?: string;
  line?: string;
  accent: string;
  trim?: string;
  hair?: string;
  skin?: string;
  item?: AvatarItem;
  hat?: AvatarHat;
  flip?: boolean;
  width?: number;
}) {
  return (
    <div className="relative flex flex-col items-center">
      {line && (
        <div className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2">
          <SpeechBubble text={line} accent={accent} />
        </div>
      )}
      <TownAvatar accent={accent} trim={trim} hair={hair} skin={skin} item={item} hat={hat} flip={flip} width={width} />
      {name && (
        <div
          className="mt-0.5 max-w-[88px] truncate rounded px-1.5 py-0.5 text-center text-[9px] font-bold text-white"
          style={{ background: "rgba(8,15,25,0.7)", border: `1px solid ${accent}88` }}
        >
          {name}
        </div>
      )}
    </div>
  );
}
