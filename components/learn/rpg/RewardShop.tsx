"use client";

/**
 * RewardShop — the cosmetic reward economy view: earned collection (badges,
 * titles, stamps, emblems, certificates) plus a transparent coin shop. No
 * lootboxes, no gambling, no paid stat boosts — prices are fixed and visible.
 */

import { useMemo, useState } from "react";
import { Coins } from "lucide-react";
import type { PlayerState } from "@/lib/rpg/state";
import { REWARDS, shopRewards, type RewardType } from "@/lib/data/rpg-rewards";
import { Panel, PanelHeader } from "./primitives";
import { RewardBadge } from "./RewardBadge";

const COLLECTION_TYPES: RewardType[] = ["badge", "title", "stamp", "emblem", "certificate", "outfit"];

export function RewardShop({ ps }: { ps: PlayerState }) {
  const earned = new Set(ps.earnedRewardIds);
  const [tab, setTab] = useState<"collection" | "shop">("collection");

  const collection = useMemo(
    () => REWARDS.filter((r) => COLLECTION_TYPES.includes(r.type)),
    []
  );

  return (
    <div className="space-y-4">
      <Panel accent="#fbbf24" glow>
        <PanelHeader
          emoji="🛍️"
          title="Reward Shop"
          subtitle="Earn it by learning — never by chance"
          accent="#fbbf24"
          right={
            <span className="mr-4 inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-xs font-bold text-amber-300">
              <Coins size={13} /> {ps.coins.toLocaleString()}
            </span>
          }
        />
        <div className="flex gap-2 px-4 pb-4 pt-2">
          <Tab label="My Collection" active={tab === "collection"} onClick={() => setTab("collection")} />
          <Tab label="Coin Shop" active={tab === "shop"} onClick={() => setTab("shop")} />
        </div>
      </Panel>

      {tab === "collection" && (
        <Panel accent="#a78bfa">
          <PanelHeader emoji="🏅" title="My Collection" subtitle={`${earned.size} of ${collection.length} earned`} accent="#a78bfa" />
          <div className="grid grid-cols-3 gap-3 p-4 sm:grid-cols-5 md:grid-cols-6">
            {collection.map((r) => (
              <RewardBadge key={r.id} reward={r} earned={earned.has(r.id)} />
            ))}
          </div>
          <p className="px-4 pb-4 text-[11px] text-slate-500">
            Earn badges, titles, and certificates by clearing mastery challenges and class quests.
          </p>
        </Panel>
      )}

      {tab === "shop" && (
        <Panel accent="#34d399">
          <PanelHeader emoji="🪙" title="Coin Shop" subtitle="Spend coins on room & avatar decorations" accent="#34d399" />
          <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 md:grid-cols-4">
            {shopRewards().map((r) => {
              const owned = earned.has(r.id);
              const affordable = ps.coins >= r.coinPrice;
              return (
                <div
                  key={r.id}
                  className="flex flex-col items-center gap-2 rounded-2xl p-3 text-center"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <RewardBadge reward={r} earned size="sm" />
                  <span className="text-[11px] text-slate-300">{r.name}</span>
                  <button
                    disabled={owned || !affordable}
                    className="w-full rounded-lg px-2 py-1.5 text-[11px] font-bold transition disabled:opacity-50"
                    style={{
                      background: owned ? "rgba(52,211,153,0.18)" : affordable ? "linear-gradient(180deg,#fcd34d,#f59e0b)" : "rgba(255,255,255,0.05)",
                      color: owned ? "#34d399" : affordable ? "#0f172a" : "#94a3b8",
                    }}
                  >
                    {owned ? "Owned" : (
                      <span className="inline-flex items-center gap-1">
                        <Coins size={11} /> {r.coinPrice}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="px-4 pb-4 text-[11px] text-slate-500">
            Coins are earned only from learning. Buying decorations is cosmetic and never affects progress.
          </p>
        </Panel>
      )}
    </div>
  );
}

function Tab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${active ? "bg-amber-400 text-slate-900" : "text-slate-300 hover:bg-white/[0.06]"}`}
      style={active ? undefined : { border: "1px solid rgba(255,255,255,0.10)" }}
    >
      {label}
    </button>
  );
}
