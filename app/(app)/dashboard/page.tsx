"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Swords,
  Flame,
  Gauge,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Trophy,
  Bot,
  Target,
  Clock,
  Calendar,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { CAREER_PATHS, RANK_META, formatPhp } from "@/lib/data/career-paths";

interface Profile {
  id: string;
  current_level: number;
  total_xp: number;
  current_xp: number;
  streak_count: number;
  longest_streak: number;
  readiness_score: number;
  selected_career_path_id?: string;
  username?: string;
  target_timeline_months?: number;
  weekly_availability_hours?: number;
}

// Compute level rank using Solo Leveling-style ranks
function getRankForLevel(level: number): "E" | "D" | "C" | "B" | "A" | "S" | "SS" | "SSS" {
  if (level < 5) return "E";
  if (level < 10) return "D";
  if (level < 20) return "C";
  if (level < 35) return "B";
  if (level < 55) return "A";
  if (level < 75) return "S";
  if (level < 95) return "SS";
  return "SSS";
}

const RANK_COLORS: Record<string, { bg: string; text: string; glow: string }> = {
  E: { bg: "bg-slate-500/15 border-slate-400/30", text: "text-slate-300", glow: "rgba(148,163,184,0.4)" },
  D: { bg: "bg-emerald-500/15 border-emerald-400/30", text: "text-emerald-300", glow: "rgba(16,185,129,0.4)" },
  C: { bg: "bg-cyan-500/15 border-cyan-400/30", text: "text-cyan-300", glow: "rgba(6,182,212,0.4)" },
  B: { bg: "bg-violet-500/15 border-violet-400/30", text: "text-violet-300", glow: "rgba(139,92,246,0.4)" },
  A: { bg: "bg-orange-500/15 border-orange-400/30", text: "text-orange-300", glow: "rgba(249,115,22,0.4)" },
  S: { bg: "bg-rose-500/15 border-rose-400/30", text: "text-rose-300", glow: "rgba(244,63,94,0.4)" },
  SS: { bg: "bg-amber-500/15 border-amber-400/30", text: "text-amber-300", glow: "rgba(245,158,11,0.4)" },
  SSS: { bg: "bg-gradient-to-r from-cyan-500/15 to-violet-500/15 border-cyan-400/40", text: "text-cyan-200", glow: "rgba(6,182,212,0.5)" },
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeQuestCount, setActiveQuestCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
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
          supabase.from("profiles").select("*").eq("id", session.user.id).single(),
          supabase
            .from("quests")
            .select("id", { count: "exact" })
            .eq("user_id", session.user.id)
            .eq("status", "active"),
        ]);

        if (profileResult.data) setProfile(profileResult.data);
        if (questsResult.count !== null) setActiveQuestCount(questsResult.count);
      } catch (error) {
        console.error("Error loading dashboard:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-white/60 animate-spin" />
      </div>
    );
  }

  if (!profile) return null;

  const username = profile.username || "Hunter";
  const level = profile.current_level;
  const rank = getRankForLevel(level);
  const rankStyle = RANK_COLORS[rank];
  const xpForNextLevel = level * 1000;
  const xpProgress = Math.min((profile.current_xp / xpForNextLevel) * 100, 100);
  const careerPath = CAREER_PATHS.find((p) => p.id === profile.selected_career_path_id);

  const stats = [
    {
      label: "XP Total",
      value: profile.total_xp.toLocaleString(),
      icon: Zap,
      color: "indigo",
      accent: "#6366f1",
    },
    {
      label: "Streak",
      value: `${profile.streak_count}d`,
      sub: profile.longest_streak ? `Best: ${profile.longest_streak}d` : undefined,
      icon: Flame,
      color: "amber",
      accent: "#f59e0b",
    },
    {
      label: "Readiness",
      value: `${profile.readiness_score}%`,
      icon: Gauge,
      color: "emerald",
      accent: "#10b981",
    },
    {
      label: "Active Quests",
      value: activeQuestCount.toString(),
      icon: Swords,
      color: "rose",
      accent: "#f43f5e",
    },
  ];

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Hero Welcome */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-1"
        >
          <p className="text-sm text-slate-400">
            {greeting}, <span className="text-white font-medium">{username}</span>
          </p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Let's forge today.
          </h1>
        </motion.div>

        {/* Main Hero Card: Level + Rank + XP */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent p-6 lg:p-8"
        >
          {/* Background glow */}
          <div
            className="absolute -top-1/2 right-0 w-[500px] h-[500px] rounded-full opacity-30 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${rankStyle.glow}, transparent 70%)` }}
          />

          <div className="relative grid lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-center">
            {/* Left: Level info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${rankStyle.bg}`}
                >
                  <Sparkles size={11} className={rankStyle.text} />
                  <span className={`text-xs font-bold tracking-wider ${rankStyle.text}`}>
                    {rank}-RANK
                  </span>
                </div>
                {careerPath && (
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06]">
                    <span>{careerPath.emoji}</span>
                    <span className="text-xs font-medium text-slate-300">{careerPath.title}</span>
                  </div>
                )}
              </div>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xs uppercase tracking-wider text-slate-500">Level</span>
              </div>
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-6xl lg:text-7xl font-semibold tracking-tighter tabular-nums leading-none">
                  {level}
                </h2>
                <span className="text-base text-slate-400 hidden sm:inline">
                  · {profile.total_xp.toLocaleString()} total XP
                </span>
              </div>

              {/* XP Progress Bar */}
              <div>
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="text-slate-400">Progress to Level {level + 1}</span>
                  <span className="text-slate-300 font-medium tabular-nums">
                    {profile.current_xp.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
                  </span>
                </div>
                <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${xpProgress}%` }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right: Career path detail card */}
            {careerPath && (
              <div className="lg:w-[260px] p-5 rounded-2xl bg-black/40 border border-white/[0.06] backdrop-blur">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-11 h-11 rounded-xl bg-gradient-to-br ${careerPath.gradient} flex items-center justify-center text-xl`}
                    style={{ boxShadow: `0 8px 24px ${careerPath.accentColor}30` }}
                  >
                    {careerPath.emoji}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">
                      Your Path
                    </div>
                    <div className="text-sm font-semibold">{careerPath.title}</div>
                  </div>
                </div>
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Target salary</span>
                    <span className="font-medium tabular-nums">
                      {formatPhp(careerPath.salaryMinPhp)}–{formatPhp(careerPath.salaryMaxPhp)}
                    </span>
                  </div>
                  {profile.target_timeline_months && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Timeline</span>
                      <span className="font-medium">{profile.target_timeline_months} months</span>
                    </div>
                  )}
                  {profile.weekly_availability_hours && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Weekly hours</span>
                      <span className="font-medium">{profile.weekly_availability_hours}h</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              className="relative overflow-hidden p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
            >
              <div
                className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${stat.accent}, transparent 70%)` }}
              />
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    {stat.label}
                  </span>
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${stat.accent}15`, color: stat.accent }}
                  >
                    <stat.icon size={14} />
                  </div>
                </div>
                <div className="text-2xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </div>
                {stat.sub && (
                  <div className="text-[10px] text-slate-500 mt-0.5">{stat.sub}</div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Continue forging
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              {
                title: "Daily Quests",
                description: `${activeQuestCount} active missions`,
                href: "/quests",
                icon: Swords,
                accent: "#6366f1",
                cta: "Start questing",
              },
              {
                title: "AI Mentor",
                description: "Get personalized advice",
                href: "/mentor",
                icon: Bot,
                accent: "#a855f7",
                cta: "Talk to mentor",
              },
              {
                title: "Roadmap",
                description: "View your skill path",
                href: "/roadmap",
                icon: Target,
                accent: "#ec4899",
                cta: "View roadmap",
              },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="group relative overflow-hidden p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
              >
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ background: `radial-gradient(circle, ${action.accent}, transparent 70%)` }}
                />
                <div className="relative">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                    style={{ background: `${action.accent}15`, color: action.accent }}
                  >
                    <action.icon size={16} />
                  </div>
                  <h4 className="text-base font-semibold mb-1">{action.title}</h4>
                  <p className="text-xs text-slate-400 mb-3">{action.description}</p>
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                    {action.cta}
                    <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Today's Focus */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)" }}
          />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Calendar size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-xs text-slate-400 mb-1">Today's focus</div>
              <h4 className="text-base font-semibold mb-1">
                {activeQuestCount > 0
                  ? `Complete at least 1 of your ${activeQuestCount} quests`
                  : "Generate today's quests to get started"}
              </h4>
              <p className="text-xs text-slate-400">
                {profile.streak_count > 0
                  ? `Protect your ${profile.streak_count}-day streak — momentum compounds.`
                  : "Build your first streak. One quest at a time."}
              </p>
            </div>
            <Link
              href="/quests"
              className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
            >
              View quests
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
