"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Swords,
  Clock,
  Zap,
  CheckCircle2,
  Sparkles,
  Filter,
  ArrowRight,
  Trophy,
  Loader2,
} from "lucide-react";

interface Quest {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  xp_reward: number;
  time_estimate_minutes: number | null;
  skill_tag: string | null;
  career_impact: string | null;
  status: string;
  created_at: string;
}

const DIFFICULTY_META: Record<
  string,
  { rank: string; label: string; color: string; gradient: string }
> = {
  easy: { rank: "E", label: "Easy", color: "#10b981", gradient: "from-emerald-500 to-green-600" },
  medium: { rank: "C", label: "Medium", color: "#06b6d4", gradient: "from-cyan-500 to-blue-600" },
  hard: { rank: "B", label: "Hard", color: "#a855f7", gradient: "from-violet-500 to-purple-600" },
  insane: { rank: "S", label: "Boss", color: "#f43f5e", gradient: "from-rose-500 to-pink-600" },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "insane", label: "Boss" },
];

export default function Quests() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadQuests() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const [active, completed] = await Promise.all([
          supabase
            .from("quests")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("status", "active")
            .order("difficulty", { ascending: false }),
          supabase
            .from("quests")
            .select("*")
            .eq("user_id", session.user.id)
            .eq("status", "completed")
            .order("completed_at", { ascending: false })
            .limit(5),
        ]);

        if (active.data) setQuests(active.data);
        if (completed.data) setCompletedQuests(completed.data);
      } catch (error) {
        console.error("Quests load error:", error);
        toast.error("Failed to load quests");
      } finally {
        setLoading(false);
      }
    }
    loadQuests();
  }, [supabase]);

  const filteredQuests = useMemo(() => {
    if (activeFilter === "all") return quests;
    return quests.filter((q) => q.difficulty === activeFilter);
  }, [quests, activeFilter]);

  const completeQuest = async (questId: string) => {
    setCompletingId(questId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

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
        .select("total_xp, current_xp, current_level")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        const newTotalXp = (profile.total_xp || 0) + quest.xp_reward;
        const newCurrentXp = (profile.current_xp || 0) + quest.xp_reward;
        const xpForNextLevel = profile.current_level * 1000;

        const updates: any = { total_xp: newTotalXp, current_xp: newCurrentXp };

        // Level up check
        if (newCurrentXp >= xpForNextLevel) {
          updates.current_level = profile.current_level + 1;
          updates.current_xp = newCurrentXp - xpForNextLevel;
          toast.success(`Level up! You're now Level ${profile.current_level + 1}`, { duration: 5000 });
        }

        await supabase.from("profiles").update(updates).eq("id", session.user.id);
      }

      toast.success(`+${quest.xp_reward} XP earned`, { icon: "⚡" });

      // Optimistic update
      setQuests(quests.filter((q) => q.id !== questId));
      setCompletedQuests([{ ...quest, status: "completed" }, ...completedQuests].slice(0, 5));
    } catch (error) {
      console.error("Complete quest error:", error);
      toast.error("Failed to complete quest");
    } finally {
      setCompletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    );
  }

  const totalXpAvailable = filteredQuests.reduce((sum, q) => sum + q.xp_reward, 0);
  const totalTime = filteredQuests.reduce((sum, q) => sum + (q.time_estimate_minutes || 0), 0);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
            <Swords size={11} className="text-indigo-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">Quest log</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Today's missions
          </h1>
          <p className="text-sm text-slate-400">
            Complete quests to earn XP, build skills, and level up your career.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Active</div>
            <div className="text-2xl font-semibold tabular-nums">{filteredQuests.length}</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">XP available</div>
            <div className="text-2xl font-semibold tabular-nums text-indigo-300">+{totalXpAvailable.toLocaleString()}</div>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Total time</div>
            <div className="text-2xl font-semibold tabular-nums">
              {totalTime > 60 ? `${Math.round(totalTime / 60)}h` : `${totalTime}m`}
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-wrap items-center gap-2"
        >
          <Filter size={14} className="text-slate-500 mr-1" />
          {FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === f.value
                  ? "bg-white text-slate-900"
                  : "bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.06]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Quests List */}
        {filteredQuests.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-20"
              style={{ background: "radial-gradient(circle, rgba(99,102,241,0.4), transparent 70%)" }}
            />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 mb-4">
                <Sparkles size={20} className="text-indigo-300" />
              </div>
              <h3 className="text-lg font-semibold mb-1">
                {activeFilter === "all" ? "No active quests" : "No quests at this difficulty"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {activeFilter === "all"
                  ? "Your quest log is empty. Generate new quests from your AI mentor to get started."
                  : "Try a different filter or generate more quests."}
              </p>
              {activeFilter === "all" && (
                <button
                  onClick={() => router.push("/mentor")}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Talk to mentor
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence mode="popLayout">
              {filteredQuests.map((quest, index) => {
                const diff = DIFFICULTY_META[quest.difficulty] || DIFFICULTY_META.medium;
                const isCompleting = completingId === quest.id;
                return (
                  <motion.div
                    key={quest.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
                  >
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                      {/* Left: rank + content */}
                      <div className="flex gap-4 flex-1 min-w-0">
                        {/* Rank Badge */}
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${diff.gradient} flex items-center justify-center font-bold text-white shadow-lg`}
                            style={{ boxShadow: `0 8px 24px ${diff.color}40` }}
                          >
                            {diff.rank}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start gap-2 mb-1.5 flex-wrap">
                            <h3 className="font-semibold text-base leading-tight">{quest.title}</h3>
                            {quest.skill_tag && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.06] border border-white/[0.06] text-slate-400">
                                {quest.skill_tag}
                              </span>
                            )}
                          </div>
                          {quest.description && (
                            <p className="text-sm text-slate-400 mb-3 leading-relaxed line-clamp-2">
                              {quest.description}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-3 text-xs">
                            <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold">
                              <Zap size={12} />
                              +{quest.xp_reward} XP
                            </span>
                            {quest.time_estimate_minutes && (
                              <span className="inline-flex items-center gap-1 text-slate-500">
                                <Clock size={12} />
                                {quest.time_estimate_minutes} min
                              </span>
                            )}
                            <span className="inline-flex items-center gap-1 text-slate-500">
                              <Sparkles size={12} />
                              {diff.label}
                            </span>
                          </div>
                          {quest.career_impact && (
                            <p className="text-[11px] text-slate-500 mt-2 italic line-clamp-1">
                              → {quest.career_impact}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: complete button */}
                      <button
                        onClick={() => completeQuest(quest.id)}
                        disabled={isCompleting}
                        className="flex-shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/5"
                      >
                        {isCompleting ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Completing
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={14} />
                            Complete
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Recently completed */}
        {completedQuests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Trophy size={14} className="text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Recently completed
              </h3>
            </div>
            <div className="space-y-2">
              {completedQuests.map((q) => {
                const diff = DIFFICULTY_META[q.difficulty] || DIFFICULTY_META.medium;
                return (
                  <div
                    key={q.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${diff.gradient} flex items-center justify-center text-xs font-bold text-white`}
                    >
                      {diff.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{q.title}</div>
                    </div>
                    <div className="text-xs text-emerald-300 font-semibold flex-shrink-0">
                      +{q.xp_reward} XP
                    </div>
                    <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
