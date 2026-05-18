"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

interface Quest {
  id: string;
  title: string;
  difficulty: string;
  xp_reward: number;
  time_estimate_minutes: number;
  description: string;
  status: string;
}

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadQuests() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("quests")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("difficulty", { ascending: false });

        if (error) throw error;
        setQuests(data || []);
      } catch (error) {
        toast.error("Failed to load quests");
      } finally {
        setLoading(false);
      }
    }

    loadQuests();
  }, [router, supabase]);

  const completeQuest = async (questId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const quest = quests.find((q) => q.id === questId);
      if (!quest) return;

      await supabase
        .from("quests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", questId);

      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp")
        .eq("id", user.id)
        .single();

      const newXP = (profile?.total_xp || 0) + quest.xp_reward;
      await supabase
        .from("profiles")
        .update({ total_xp: newXP })
        .eq("id", user.id);

      toast.success(`+${quest.xp_reward} XP earned!`);
      setQuests(quests.filter((q) => q.id !== questId));
    } catch (error) {
      toast.error("Failed to complete quest");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Today's Quests</h1>
        <p className="text-slate-400 mb-8">Complete quests to earn XP and level up</p>

        {quests.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center">
            <p className="text-slate-400">No active quests. Come back tomorrow!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {quests.map((quest) => (
              <div
                key={quest.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex items-start justify-between"
              >
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{quest.title}</h3>
                  <p className="text-slate-400 text-sm mb-3">{quest.description}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>
                      {quest.difficulty.charAt(0).toUpperCase() +
                        quest.difficulty.slice(1)}
                    </span>
                    <span>{quest.time_estimate_minutes} mins</span>
                    <span className="text-cyan-400 font-semibold">
                      +{quest.xp_reward} XP
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => completeQuest(quest.id)}
                  className="ml-4 px-6 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition-all whitespace-nowrap"
                >
                  Complete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
