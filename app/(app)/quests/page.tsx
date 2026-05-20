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
  ChevronRight,
} from "lucide-react";
import { QuestDetailModal } from "@/components/quests/QuestDetailModal";
import {
  calculateLevelFromTotalXP,
  computeNextStreak,
  checkAchievements,
  awardAchievements,
} from "@/lib/gamification/progression";
import { getAllQuests } from "@/lib/data/quest-templates";
import { QuestListShimmer } from "@/components/ui/Shimmer";
import { track } from "@/lib/analytics/track";
import {
  celebrateQuestComplete,
  celebrateLevelUp,
  celebrateAchievement,
  celebrateStreak,
} from "@/lib/effects/celebration";

interface Quest {
  id: string;
  title: string;
  description: string | null;
  difficulty: string;
  xp_reward: number;
  time_estimate_minutes: number | null;
  skill_tag: string | null;
  career_impact: string | null;
  proof_required: boolean;
  proof_type: string | null;
  status: string;
  created_at: string;
  career_path_id?: string;
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
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
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
            .order("difficulty", { ascending: true })
            .order("created_at", { ascending: true }),
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

  const completeQuest = async (questId: string, proofUrl?: string, proofNotes?: string) => {
    setCompletingId(questId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      const quest = quests.find((q) => q.id === questId);
      if (!quest) return;

      // 1. Mark quest completed
      await supabase
        .from("quests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          proof_url: proofUrl || null,
          proof_notes: proofNotes || null,
        })
        .eq("id", questId);

      // 2. Load current profile + counts + achievements in parallel
      const [profileResult, completedCountResult, achievementsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("total_xp, current_xp, current_level, streak_count, longest_streak, last_quest_completed_at")
          .eq("id", userId)
          .single(),
        supabase
          .from("quests")
          .select("id", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("status", "completed"),
        supabase
          .from("user_achievements")
          .select("achievement_id")
          .eq("user_id", userId),
      ]);

      const profile = profileResult.data;
      const questCompletedCount = (completedCountResult.count || 0);
      const alreadyUnlocked = new Set(
        (achievementsResult.data || []).map((a: any) => a.achievement_id)
      );

      if (!profile) return;

      // 3. Calculate XP/level
      const baseXp = quest.xp_reward;
      const newTotalXpBase = (profile.total_xp || 0) + baseXp;
      const levelInfo = calculateLevelFromTotalXP(newTotalXpBase);

      // 4. Calculate streak
      const streakResult = computeNextStreak(
        profile.streak_count || 0,
        profile.last_quest_completed_at
      );
      const newStreak = streakResult?.newStreak ?? (profile.streak_count || 0);
      const newLongestStreak = Math.max(profile.longest_streak || 0, newStreak);

      // 5. Check achievements
      const newlyUnlocked = checkAchievements({
        questCompletedCount,
        newLevel: levelInfo.level,
        newStreak,
        justCompletedInsane: quest.difficulty === "insane",
        alreadyUnlocked,
      });

      // 6. Award achievements (DB insert + sum bonus XP)
      const bonusXp = await awardAchievements(supabase, userId, newlyUnlocked);
      const finalTotalXp = newTotalXpBase + bonusXp;
      const finalLevelInfo = calculateLevelFromTotalXP(finalTotalXp);

      // 7. Update profile with all new stats
      const profileUpdates: any = {
        total_xp: finalTotalXp,
        current_xp: finalLevelInfo.currentXp,
        current_level: finalLevelInfo.level,
        streak_count: newStreak,
        longest_streak: newLongestStreak,
        last_quest_completed_at: new Date().toISOString(),
      };
      await supabase.from("profiles").update(profileUpdates).eq("id", userId);

      // 8. Show toasts + celebrations
      toast.success(`+${baseXp} XP earned`, { icon: "⚡" });
      celebrateQuestComplete();

      // Level up
      if (finalLevelInfo.level > profile.current_level) {
        setTimeout(() => {
          toast.success(`Level up! You're now Level ${finalLevelInfo.level}`, {
            duration: 5000,
            icon: "🎉",
          });
          celebrateLevelUp();
        }, 500);
      }

      // Streak milestone
      if (streakResult?.isNewMilestone) {
        setTimeout(() => {
          toast.success(`${newStreak}-day streak! Unstoppable.`, {
            duration: 5000,
            icon: "🔥",
          });
          celebrateStreak(newStreak);
        }, 1000);
      }

      // Achievement toasts
      newlyUnlocked.forEach((a, i) => {
        setTimeout(() => {
          toast.success(`Achievement: ${a.title} (+${a.xpBonus} XP)`, {
            duration: 5000,
            icon: "🏆",
          });
          celebrateAchievement();
        }, 1500 + i * 500);
      });

      // 9. Track events
      track(supabase, userId, "quest_completed", {
        payload: {
          quest_id: questId,
          title: quest.title,
          difficulty: quest.difficulty,
          skill_tag: quest.skill_tag,
        },
        xpDelta: baseXp + bonusXp,
      });
      if (finalLevelInfo.level > profile.current_level) {
        track(supabase, userId, "level_up", {
          payload: { from: profile.current_level, to: finalLevelInfo.level },
        });
      }
      if (streakResult?.isNewMilestone) {
        track(supabase, userId, "streak_milestone", { payload: { streak: newStreak } });
      }
      newlyUnlocked.forEach((a) =>
        track(supabase, userId, "achievement_unlocked", {
          payload: { id: a.id, title: a.title },
          xpDelta: a.xpBonus,
        })
      );

      // 10. Optimistic UI update
      setQuests(quests.filter((q) => q.id !== questId));
      setCompletedQuests([{ ...quest, status: "completed" }, ...completedQuests].slice(0, 5));
    } catch (error: any) {
      console.error("Complete quest error:", error);
      toast.error(error?.message || "Failed to complete quest");
    } finally {
      setCompletingId(null);
    }
  };

  // Generate more quests from the template library
  const generateMoreQuests = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const userId = session.user.id;

      // Get user's career path + existing quest titles to avoid duplicates
      const [profileResult, allQuestsResult] = await Promise.all([
        supabase
          .from("profiles")
          .select("selected_career_path_id")
          .eq("id", userId)
          .single(),
        supabase
          .from("quests")
          .select("title")
          .eq("user_id", userId),
      ]);

      const careerPathId = profileResult.data?.selected_career_path_id;
      if (!careerPathId) {
        toast.error("Pick a career path first");
        return;
      }

      const existingTitles = new Set(
        (allQuestsResult.data || []).map((q: any) => q.title)
      );
      const allTemplates = getAllQuests(careerPathId);
      const newTemplates = allTemplates
        .filter((t) => !existingTitles.has(t.title))
        .slice(0, 5);

      if (newTemplates.length === 0) {
        toast("You've unlocked all curated quests for your path. New ones coming soon.", {
          icon: "🎉",
          duration: 5000,
        });
        return;
      }

      const questRows = newTemplates.map((q) => ({
        user_id: userId,
        career_path_id: careerPathId,
        title: q.title,
        description: q.description,
        difficulty: q.difficulty,
        xp_reward: q.xp_reward,
        time_estimate_minutes: q.time_estimate_minutes,
        skill_tag: q.skill_tag,
        career_impact: q.career_impact,
        proof_required: q.proof_required,
        proof_type: q.proof_type,
        status: "active",
        generated_by: "system",
        quest_type: "learning",
      }));

      const { data: inserted, error } = await supabase
        .from("quests")
        .insert(questRows)
        .select();

      if (error) throw error;

      toast.success(`Added ${newTemplates.length} new quest${newTemplates.length > 1 ? "s" : ""}`);
      if (inserted) setQuests([...quests, ...(inserted as Quest[])]);
    } catch (error: any) {
      console.error("Generate quests error:", error);
      toast.error(error?.message || "Failed to generate quests");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        <div className="space-y-3">
          <div className="w-24 h-5 bg-white/[0.04] rounded-md animate-pulse" />
          <div className="w-64 h-9 bg-white/[0.04] rounded-md animate-pulse" />
        </div>
        <QuestListShimmer />
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

        {/* Filters + Generate */}
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
          <button
            onClick={generateMoreQuests}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/[0.03] border border-white/[0.06] text-slate-300 hover:bg-white/[0.06] hover:text-white transition-all"
          >
            <Sparkles size={12} />
            Generate more
          </button>
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
                {activeFilter === "all" ? "All caught up!" : "No quests at this difficulty"}
              </h3>
              <p className="text-sm text-slate-400 max-w-sm mx-auto">
                {activeFilter === "all"
                  ? "You've cleared your active quests. Generate more to keep the momentum."
                  : "Try a different filter or complete some easier quests first."}
              </p>
              {activeFilter === "all" && (
                <div className="flex items-center justify-center gap-2 mt-5 flex-wrap">
                  <button
                    onClick={generateMoreQuests}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
                  >
                    <Sparkles size={14} />
                    Generate more quests
                  </button>
                  <button
                    onClick={() => router.push("/mentor")}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.03] transition-colors"
                  >
                    Ask AI mentor
                  </button>
                </div>
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
                  <motion.button
                    key={quest.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
                    onClick={() => setSelectedQuest(quest)}
                    className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all text-left w-full"
                  >
                    <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center">
                      <div className="flex gap-4 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <div
                            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${diff.gradient} flex items-center justify-center font-bold text-white shadow-lg`}
                            style={{ boxShadow: `0 8px 24px ${diff.color}40` }}
                          >
                            {diff.rank}
                          </div>
                        </div>

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

                      <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors flex-shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Quest Detail Modal */}
        {selectedQuest && (
          <QuestDetailModal
            quest={selectedQuest}
            onClose={() => setSelectedQuest(null)}
            onComplete={completeQuest}
          />
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
