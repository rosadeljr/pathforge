"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Lock,
  Sparkles,
  Rocket,
  Flame,
  Briefcase,
  Star,
  Sword,
  Crown,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { PageShimmer } from "@/components/ui/Shimmer";

interface Achievement {
  id: string;
  title: string;
  description: string;
  achievement_type: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  xp_bonus: number;
  icon_name: string;
}

interface UnlockedAchievement {
  achievement_id: string;
  unlocked_at: string;
}

const ICON_MAP: Record<string, any> = {
  rocket: Rocket,
  flame: Flame,
  briefcase: Briefcase,
  star: Star,
  sword: Sword,
  crown: Crown,
};

const RARITY_META: Record<string, { label: string; gradient: string; color: string; glow: string }> = {
  common: {
    label: "Common",
    gradient: "from-slate-500 to-slate-700",
    color: "#94a3b8",
    glow: "rgba(148,163,184,0.3)",
  },
  rare: {
    label: "Rare",
    gradient: "from-cyan-500 to-blue-600",
    color: "#06b6d4",
    glow: "rgba(6,182,212,0.4)",
  },
  epic: {
    label: "Epic",
    gradient: "from-violet-500 to-purple-600",
    color: "#a855f7",
    glow: "rgba(168,85,247,0.4)",
  },
  legendary: {
    label: "Legendary",
    gradient: "from-amber-400 to-orange-600",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.5)",
  },
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [unlocked, setUnlocked] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const [allResult, userResult] = await Promise.all([
          supabase
            .from("achievements")
            .select("*")
            .order("rarity", { ascending: true }),
          supabase
            .from("user_achievements")
            .select("achievement_id, unlocked_at")
            .eq("user_id", session.user.id),
        ]);

        if (allResult.data) setAchievements(allResult.data as Achievement[]);
        if (userResult.data) {
          const map = new Map<string, string>();
          (userResult.data as UnlockedAchievement[]).forEach((u) => {
            map.set(u.achievement_id, u.unlocked_at);
          });
          setUnlocked(map);
        }
      } catch (e) {
        console.error("Achievements load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <PageShimmer />;

  const unlockedCount = unlocked.size;
  const totalCount = achievements.length;
  const totalXpEarned = achievements
    .filter((a) => unlocked.has(a.id))
    .reduce((sum, a) => sum + (a.xp_bonus || 0), 0);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
            <Trophy size={11} className="text-amber-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">Achievements</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Your trophies
          </h1>
          <p className="text-sm text-slate-400">
            Unlock badges as you progress. Each one comes with bonus XP.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Unlocked</div>
            <div className="text-2xl font-semibold tabular-nums">
              {unlockedCount}<span className="text-base text-slate-500">/{totalCount}</span>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Completion</div>
            <div className="text-2xl font-semibold tabular-nums">
              {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Bonus XP earned</div>
            <div className="text-2xl font-semibold tabular-nums text-amber-300">
              +{totalXpEarned.toLocaleString()}
            </div>
          </div>
        </motion.div>

        {/* Achievement Grid */}
        {achievements.length === 0 ? (
          <div className="p-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
            <p className="text-sm text-slate-400">
              No achievements found. Make sure you've run the launch SQL migration.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {achievements.map((achievement, i) => {
              const isUnlocked = unlocked.has(achievement.id);
              const rarity = RARITY_META[achievement.rarity] || RARITY_META.common;
              const Icon = ICON_MAP[achievement.icon_name] || Trophy;
              const unlockedAt = unlocked.get(achievement.id);

              return (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + i * 0.03 }}
                  className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${
                    isUnlocked
                      ? "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                      : "border-white/[0.04] bg-white/[0.01] opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Glow for unlocked */}
                  {isUnlocked && (
                    <div
                      className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ background: `radial-gradient(circle, ${rarity.glow}, transparent 70%)` }}
                    />
                  )}

                  <div className="relative">
                    {/* Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          isUnlocked
                            ? `bg-gradient-to-br ${rarity.gradient}`
                            : "bg-white/[0.04] border border-white/[0.06]"
                        }`}
                        style={isUnlocked ? { boxShadow: `0 8px 24px ${rarity.glow}` } : undefined}
                      >
                        {isUnlocked ? (
                          <Icon size={20} className="text-white" />
                        ) : (
                          <Lock size={16} className="text-slate-500" />
                        )}
                      </div>
                      <div
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border"
                        style={
                          isUnlocked
                            ? { color: rarity.color, borderColor: `${rarity.color}40`, backgroundColor: `${rarity.color}10` }
                            : { color: "#64748b", borderColor: "rgba(148,163,184,0.2)" }
                        }
                      >
                        {rarity.label}
                      </div>
                    </div>

                    {/* Title + desc */}
                    <h3 className="text-base font-semibold mb-1">{achievement.title}</h3>
                    <p className="text-xs text-slate-400 mb-3 leading-relaxed line-clamp-2">
                      {achievement.description}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                      <span className="text-[10px] text-slate-500">
                        {isUnlocked && unlockedAt
                          ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}`
                          : "Locked"}
                      </span>
                      <span
                        className={`text-xs font-semibold ${isUnlocked ? "text-amber-300" : "text-slate-500"}`}
                      >
                        +{achievement.xp_bonus} XP
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 text-center"
        >
          <div className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at center, rgba(245,158,11,0.3), transparent 70%)" }}
          />
          <div className="relative">
            <Sparkles size={20} className="text-amber-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold mb-1">More badges, more XP, more levels</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
              Every lesson completed gets you closer to the next achievement. Keep going.
            </p>
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Open lessons
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
