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
import { Panel, PanelHeader, ScreenIntro } from "./primitives";
import { RewardBadge } from "./RewardBadge";
import { Celebration } from "./Celebration";
import { logRpgEvent } from "@/lib/rpg/track";

const COLLECTION_TYPES: RewardType[] = ["badge", "title", "stamp", "emblem", "certificate", "outfit"];

export function RewardShop({ ps }: { ps: PlayerState }) {
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const earned = new Set([...ps.earnedRewardIds, ...claimed]);
  const [tab, setTab] = useState<"collection" | "shop">("collection");
  const [won, setWon] = useState<string | null>(null);

  function claim(id: string, name: string) {
    setClaimed((s) => new Set(s).add(id));
    setWon(name);
    void logRpgEvent("rpg_reward_claimed", { reward_id: id, name });
  }

  const collection = useMemo(
    () => REWARDS.filter((r) => COLLECTION_TYPES.includes(r.type)),
    []
  );
  const collectedCount = collection.reduce((n, r) => n + (earned.has(r.id) ? 1 : 0), 0);

  return (
    <div className="space-y-4">
      <ScreenIntro
        emoji="🛍️"
        eyebrow="Inventory"
        title="Reward Shop"
        blurb="Spend the coins you've earned on badges, titles, and gear for your hero. Everything is unlocked by skill — never by luck or real money."
        accent="#fbbf24"
        right={
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-3 py-1.5 text-sm font-bold text-amber-300" style={{ border: "1px solid rgba(251,191,36,0.4)" }}>
            <Coins size={15} /> {ps.coins.toLocaleString()}
          </span>
        }
        stats={[
          { value: `${collectedCount}/${collection.length}`, label: "Collected" },
          { value: ps.coins.toLocaleString(), label: "Coins" },
        ]}
        progress={{ pct: (collectedCount / Math.max(1, collection.length)) * 100, label: "Collection complete" }}
      />
      <Panel accent="#fbbf24">
        <div className="flex gap-2 p-3">
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
                    onClick={() => affordable && !owned && claim(r.id, r.name)}
                    className="w-full rounded-lg px-2 py-1.5 text-[11px] font-bold transition disabled:opacity-50"
                    style={{
                      background: owned ? "rgba(52,211,153,0.18)" : affordable ? "linear-gradient(180deg,#fcd34d,#f59e0b)" : "rgba(255,255,255,0.05)",
                      color: owned ? "#34d399" : affordable ? "#0f172a" : "#94a3b8",
                    }}
                  >
                    {owned ? "✓ Claimed" : (
                      <span className="inline-flex items-center gap-1">
                        <Coins size={11} /> Claim · {r.coinPrice}
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

      <Celebration
        show={won != null}
        title="Unlocked!"
        subtitle={won ? `${won} added to your collection` : undefined}
        onDone={() => setWon(null)}
      />
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
