"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
  Compass,
  Check,
  Lock,
  Sparkles,
  ArrowRight,
  Trophy,
  Target,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { PageShimmer } from "@/components/ui/Shimmer";

interface RoadmapPhase {
  id: number;
  title: string;
  subtitle: string;
  emoji: string;
  skills: { name: string; estHours: number }[];
  outcomes: string[];
  xpReward: number;
  unlockLevel: number;
}

// Build a generic 4-phase roadmap from career skills
function buildRoadmap(skills: string[], pathTitle: string): RoadmapPhase[] {
  const chunkSize = Math.max(1, Math.ceil(skills.length / 4));
  const chunks = Array.from({ length: 4 }, (_, i) =>
    skills.slice(i * chunkSize, (i + 1) * chunkSize)
  );

  return [
    {
      id: 1,
      title: "Foundations",
      subtitle: "Master the fundamentals",
      emoji: "🌱",
      skills: chunks[0].map((s) => ({ name: s, estHours: 20 })),
      outcomes: [
        "Understand core concepts",
        "Build first practice project",
        "Set up your workspace",
      ],
      xpReward: 500,
      unlockLevel: 1,
    },
    {
      id: 2,
      title: "Core Skills",
      subtitle: "Build production-ready abilities",
      emoji: "⚡",
      skills: chunks[1].map((s) => ({ name: s, estHours: 30 })),
      outcomes: [
        "Ship 2-3 portfolio projects",
        "Contribute to real-world repos",
        "Get comfortable debugging",
      ],
      xpReward: 1500,
      unlockLevel: 5,
    },
    {
      id: 3,
      title: "Advanced Mastery",
      subtitle: "Stand out from the crowd",
      emoji: "🔥",
      skills: chunks[2].map((s) => ({ name: s, estHours: 40 })),
      outcomes: [
        "System design fundamentals",
        "Lead a meaningful project",
        "Mentor others learning",
      ],
      xpReward: 3000,
      unlockLevel: 15,
    },
    {
      id: 4,
      title: "Career Ready",
      subtitle: "Land the role you want",
      emoji: "🏆",
      skills: chunks[3]?.map((s) => ({ name: s, estHours: 25 })) ?? [
        { name: "Interview Prep", estHours: 20 },
        { name: "Resume", estHours: 8 },
        { name: "Negotiation", estHours: 6 },
      ],
      outcomes: [
        "Polished public portfolio",
        "Interview-ready confidence",
        "Land the offer",
      ],
      xpReward: 5000,
      unlockLevel: 30,
    },
  ];
}

interface QuestStats {
  total: number;
  completed: number;
  byDifficulty: {
    easy: { total: number; completed: number };
    medium: { total: number; completed: number };
    hard: { total: number; completed: number };
    insane: { total: number; completed: number };
  };
}

export default function Roadmap() {
  const [careerPathId, setCareerPathId] = useState<string | null>(null);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [questStats, setQuestStats] = useState<QuestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }

        const [profileResult, questsResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("selected_career_path_id, current_level")
            .eq("id", session.user.id)
            .single(),
          supabase
            .from("quests")
            .select("difficulty, status")
            .eq("user_id", session.user.id),
        ]);

        if (profileResult.data) {
          setCareerPathId(profileResult.data.selected_career_path_id);
          setCurrentLevel(profileResult.data.current_level || 1);
        }

        if (questsResult.data) {
          const stats: QuestStats = {
            total: 0,
            completed: 0,
            byDifficulty: {
              easy: { total: 0, completed: 0 },
              medium: { total: 0, completed: 0 },
              hard: { total: 0, completed: 0 },
              insane: { total: 0, completed: 0 },
            },
          };
          for (const q of questsResult.data as any[]) {
            if (q.status === "archived") continue;
            stats.total++;
            const diff = (q.difficulty || "medium") as keyof typeof stats.byDifficulty;
            if (stats.byDifficulty[diff]) {
              stats.byDifficulty[diff].total++;
              if (q.status === "completed") {
                stats.completed++;
                stats.byDifficulty[diff].completed++;
              }
            }
          }
          setQuestStats(stats);
        }
      } catch (e) {
        console.error("Roadmap load error:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  if (loading) {
    return <PageShimmer />;
  }

  const careerPath = CAREER_PATHS.find((p) => p.id === careerPathId);

  if (!careerPath) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">No path selected yet</h1>
          <p className="text-sm text-slate-400 mb-6">Complete onboarding to see your roadmap.</p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold text-sm"
          >
            Go to onboarding
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const roadmap = buildRoadmap(careerPath.skills, careerPath.title);

  // Map each phase to a difficulty bucket for progress calculation
  const PHASE_TO_DIFFICULTY = ["easy", "medium", "hard", "insane"] as const;
  const computePhaseProgress = (phaseIdx: number): { pct: number; completed: number; total: number } => {
    if (!questStats) return { pct: 0, completed: 0, total: 0 };
    const diff = PHASE_TO_DIFFICULTY[phaseIdx];
    const bucket = questStats.byDifficulty[diff];
    if (bucket.total === 0) return { pct: 0, completed: 0, total: 0 };
    return {
      pct: Math.round((bucket.completed / bucket.total) * 100),
      completed: bucket.completed,
      total: bucket.total,
    };
  };

  const overallProgress = questStats && questStats.total > 0
    ? Math.round((questStats.completed / questStats.total) * 100)
    : 0;

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
            <Compass size={11} className="text-indigo-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">Your roadmap</span>
          </div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                {careerPath.title}
              </h1>
              <p className="text-sm text-slate-400 max-w-2xl">{careerPath.tagline}</p>
            </div>
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${careerPath.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}
              style={{ boxShadow: `0 8px 24px ${careerPath.accentColor}40` }}
            >
              {careerPath.emoji}
            </div>
          </div>
        </motion.div>

        {/* Overall progress */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                Overall progress
              </div>
              <div className="text-3xl font-semibold tracking-tight tabular-nums">
                {overallProgress}%
              </div>
            </div>
            <div className="text-right text-xs text-slate-400">
              <div>{questStats?.completed ?? 0} of {questStats?.total ?? 0} quests done</div>
              <div className="mt-0.5">Level {currentLevel}</div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            />
          </div>
        </motion.div>

        {/* Phase stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Total phases", value: roadmap.length, icon: Target, color: "#6366f1" },
            { label: "Skills to master", value: careerPath.skills.length, icon: Sparkles, color: "#a855f7" },
            { label: "Total XP available", value: roadmap.reduce((sum, p) => sum + p.xpReward, 0).toLocaleString(), icon: Zap, color: "#ec4899" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="relative overflow-hidden p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
            >
              <div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${stat.color}, transparent 70%)` }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    {stat.label}
                  </span>
                  <stat.icon size={12} style={{ color: stat.color }} />
                </div>
                <div className="text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Roadmap Phases */}
        <div className="space-y-4">
          {roadmap.map((phase, index) => {
            const isUnlocked = currentLevel >= phase.unlockLevel;
            const phaseProgress = computePhaseProgress(index);
            const isCompleted = phaseProgress.total > 0 && phaseProgress.completed === phaseProgress.total;
            const isInProgress = phaseProgress.completed > 0 && !isCompleted;
            return (
              <motion.div
                key={phase.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                className={`relative overflow-hidden rounded-2xl border transition-all ${
                  isInProgress
                    ? "border-indigo-500/40 bg-white/[0.03] shadow-lg shadow-indigo-500/10"
                    : isUnlocked
                    ? "border-white/[0.08] bg-white/[0.02]"
                    : "border-white/[0.04] bg-white/[0.01] opacity-60"
                }`}
              >
                {/* Side accent line */}
                <div
                  className={`absolute left-0 top-0 bottom-0 w-1 ${
                    isCompleted
                      ? "bg-gradient-to-b from-emerald-400 to-green-600"
                      : isUnlocked
                      ? `bg-gradient-to-b ${careerPath.gradient}`
                      : "bg-white/[0.06]"
                  }`}
                />

                <div className="p-6 lg:p-7">
                  <div className="flex items-start gap-4 mb-5">
                    {/* Phase number/status */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                          isCompleted
                            ? "bg-emerald-500/15 border-2 border-emerald-400/40"
                            : isUnlocked
                            ? `bg-gradient-to-br ${careerPath.gradient}`
                            : "bg-white/[0.04] border border-white/[0.06]"
                        }`}
                      >
                        {isCompleted ? <Check size={20} className="text-emerald-300" /> : isUnlocked ? phase.emoji : <Lock size={16} className="text-slate-500" />}
                      </div>
                    </div>

                    {/* Phase title */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                          Phase {phase.id}
                        </span>
                        {!isUnlocked && (
                          <span className="text-[10px] text-amber-400 font-medium">
                            Unlocks at Level {phase.unlockLevel}
                          </span>
                        )}
                        {isCompleted && (
                          <span className="text-[10px] text-emerald-400 font-medium">Completed</span>
                        )}
                        {isUnlocked && isInProgress && (
                          <span className="inline-flex items-center gap-1.5 text-[10px] text-indigo-300 font-semibold">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400" />
                            </span>
                            You're here
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold tracking-tight mb-1">{phase.title}</h3>
                      <p className="text-sm text-slate-400">{phase.subtitle}</p>
                    </div>

                    {/* XP reward */}
                    <div className="flex-shrink-0 text-right">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                        Reward
                      </div>
                      <div className="text-sm font-semibold text-indigo-300 tabular-nums">
                        +{phase.xpReward.toLocaleString()} XP
                      </div>
                    </div>
                  </div>

                  {/* Phase progress bar */}
                  {isUnlocked && phaseProgress.total > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-400 font-medium">
                          {isCompleted ? "Phase complete" : isInProgress ? "In progress" : "Not started"}
                        </span>
                        <span className="text-slate-300 tabular-nums">
                          {phaseProgress.completed}/{phaseProgress.total} quests · {phaseProgress.pct}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${phaseProgress.pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                          className={`h-full ${
                            isCompleted
                              ? "bg-gradient-to-r from-emerald-500 to-green-500"
                              : `bg-gradient-to-r ${careerPath.gradient}`
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="mb-5">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                      Skills you'll master
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {phase.skills.map((skill, i) => (
                        <div
                          key={i}
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs"
                        >
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-slate-500">{skill.estHours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Outcomes */}
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                      What you'll achieve
                    </div>
                    <div className="space-y-1.5">
                      {phase.outcomes.map((outcome, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <div className="mt-0.5 w-4 h-4 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                            <Check size={9} className="text-indigo-300" strokeWidth={3} />
                          </div>
                          <span>{outcome}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Final ascendance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 text-center"
        >
          <div className="absolute inset-0 opacity-30"
            style={{ background: "radial-gradient(ellipse at center, rgba(168,85,247,0.4), transparent 70%)" }}
          />
          <div className="relative">
            <Trophy size={28} className="text-amber-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-1">Ascend to SSS-Rank</h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
              Reach Level 100 to unlock legendary status. Top earners. Top hires. Top of the leaderboard.
            </p>
            <Link
              href="/quests"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 transition-colors"
            >
              Start questing
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
