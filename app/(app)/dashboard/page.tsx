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
  Crown,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { CAREER_PATHS, RANK_META, formatPhp } from "@/lib/data/career-paths";
import { WelcomeModal } from "@/components/onboarding/WelcomeModal";
import { PageShimmer } from "@/components/ui/Shimmer";
import { StreakHeatmap } from "@/components/dashboard/StreakHeatmap";
import { isPaid } from "@/lib/entitlements";

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
  primary_goal?: string;
  subscription_tier?: string;
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

interface FirstQuest {
  id: string;
  title: string;
  difficulty: string;
  xp_reward: number;
  time_estimate_minutes: number | null;
  skill_tag: string | null;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeQuestCount, setActiveQuestCount] = useState(0);
  const [firstQuest, setFirstQuest] = useState<FirstQuest | null>(null);
  const [completions, setCompletions] = useState<{ date: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.error("[dashboard] Session error:", sessionError);
          setLoading(false);
          return;
        }
        if (!session?.user) {
          console.warn("[dashboard] No active session");
          setLoading(false);
          return;
        }
        const userId = session.user.id;

        // Use maybeSingle so 0 rows don't throw
        const { data: existing, error: fetchError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (fetchError) {
          console.error("[dashboard] Profile fetch error:", fetchError);
        }

        let actualProfile: Profile | null = existing as Profile | null;

        // Self-heal: if profile missing (orphaned signup, failed trigger, etc.), create one
        if (!actualProfile) {
          console.warn("[dashboard] Profile missing, auto-creating");
          const meta = session.user.user_metadata as any;
          const fallbackUsername =
            meta?.username ||
            session.user.email?.split("@")[0] ||
            `user_${userId.slice(0, 8)}`;

          const { data: created, error: createError } = await supabase
            .from("profiles")
            .insert({
              id: userId,
              email: session.user.email,
              username: fallbackUsername,
              full_name: meta?.full_name || null,
            })
            .select()
            .single();

          if (createError) {
            console.error("[dashboard] Profile auto-create failed:", createError);
            setLoading(false);
            return;
          }
          actualProfile = created as Profile;
        }

        setProfile(actualProfile);

        // Quests (non-blocking errors)
        const cutoff = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString();
        const [countResult, nextQuestResult, completionsResult] = await Promise.all([
          supabase
            .from("quests")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("status", "active"),
          supabase
            .from("quests")
            .select("id, title, difficulty, xp_reward, time_estimate_minutes, skill_tag")
            .eq("user_id", userId)
            .eq("status", "active")
            .order("difficulty", { ascending: true })
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("quests")
            .select("completed_at")
            .eq("user_id", userId)
            .eq("status", "completed")
            .not("completed_at", "is", null)
            .gte("completed_at", cutoff),
        ]);

        if (countResult.count !== null) setActiveQuestCount(countResult.count);
        if (nextQuestResult.data) setFirstQuest(nextQuestResult.data);

        // Aggregate completions by day
        if (completionsResult.data) {
          const dayMap = new Map<string, number>();
          (completionsResult.data as any[]).forEach((q) => {
            if (!q.completed_at) return;
            const day = q.completed_at.slice(0, 10);
            dayMap.set(day, (dayMap.get(day) || 0) + 1);
          });
          setCompletions(
            Array.from(dayMap.entries()).map(([date, count]) => ({ date, count }))
          );
        }
      } catch (error) {
        console.error("[dashboard] Unexpected error:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  // Redirect to onboarding if user hasn't set up their path yet
  useEffect(() => {
    if (!loading && profile && !profile.selected_career_path_id) {
      router.replace("/onboarding");
    }
  }, [loading, profile, router]);

  if (loading) {
    return <PageShimmer />;
  }

  // Profile failed to load — show error with retry instead of blank screen
  if (!profile) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-rose-500/[0.08] border border-rose-500/30 mb-5">
          <Sparkles size={22} className="text-rose-400" />
        </div>
        <h2 className="text-xl font-semibold tracking-tight mb-2">Couldn't load your profile</h2>
        <p className="text-sm text-slate-400 mb-6">
          This usually means your session expired or the database is unreachable.
        </p>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Reload
          </button>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.03] transition-colors"
          >
            Sign in again
          </Link>
        </div>
      </div>
    );
  }

  // Redirecting to onboarding — show a friendly loading state instead of blank
  if (!profile.selected_career_path_id) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/[0.08] border border-indigo-500/30 mb-5">
            <Sparkles size={22} className="text-indigo-300" />
          </div>
          <h2 className="text-xl font-semibold tracking-tight mb-2">
            Let's set up your path
          </h2>
          <p className="text-sm text-slate-400 mb-5">
            One quick setup — career goals, then you're forging.
          </p>
          <Link
            href="/onboarding"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Start onboarding
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  const username = profile.username || "Hunter";
  const level = profile.current_level;
  const rank = getRankForLevel(level);
  const rankStyle = RANK_COLORS[rank];
  const xpForNextLevel = level * 1000;
  const xpProgress = Math.min((profile.current_xp / xpForNextLevel) * 100, 100);
  const careerPath = CAREER_PATHS.find((p) => p.id === profile.selected_career_path_id);

  // Levels remaining until the next rank up — fuels the "almost there" tease.
  const RANK_THRESHOLDS: Array<[string, number]> = [
    ["D", 5], ["C", 10], ["B", 20], ["A", 35], ["S", 55], ["SS", 75], ["SSS", 95],
  ];
  const nextRank = RANK_THRESHOLDS.find(([, threshold]) => level < threshold);
  const levelsToNextRank = nextRank ? nextRank[1] - level : 0;

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
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1 flex-wrap">
            <span>
              {greeting}, <span className="text-white font-medium">{username}</span>
            </span>
            {profile.streak_count > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                  <Flame size={12} />
                  Day {profile.streak_count} streak
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {profile.total_xp === 0
              ? "Time to forge your first quest."
              : profile.streak_count >= 7
              ? "Keep the streak alive."
              : "Let's forge today."}
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
              {nextRank && (
                <p className="text-xs text-slate-400 mt-3 inline-flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] font-bold tracking-wider ${RANK_COLORS[nextRank[0]].bg} ${RANK_COLORS[nextRank[0]].text}`}
                  >
                    {nextRank[0]}-RANK
                  </span>
                  <span>
                    <span className="text-white font-semibold tabular-nums">{levelsToNextRank}</span>{" "}
                    {levelsToNextRank === 1 ? "level" : "levels"} to unlock
                  </span>
                </p>
              )}
            </div>

            {/* Right: Career path detail card */}
            {careerPath && (
              <div className="lg:w-[260px] p-5 rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur">
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
                      <span className="text-slate-500 font-normal"> /yr</span>
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
                title: "ForgeBot",
                description: "Get personalized advice",
                href: "/mentor",
                icon: Bot,
                accent: "#a855f7",
                cta: "Talk to ForgeBot",
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

        {/* Today's Focus / Next Quest Spotlight */}
        {firstQuest ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                {profile.total_xp === 0 ? "Start here — your first quest" : "Today's focus"}
              </h3>
              <Link
                href="/quests"
                className="text-xs text-slate-400 hover:text-white inline-flex items-center gap-1 transition-colors"
              >
                See all
                <ArrowRight size={11} />
              </Link>
            </div>
            {profile.total_xp === 0 && (
              <p className="text-xs text-slate-400 -mt-2 mb-4">
                Complete one quest to earn your first XP, level up, and start your streak. 🔥
              </p>
            )}
            <Link
              href="/quests"
              className="group relative overflow-hidden block rounded-2xl border border-white/[0.06] p-6 hover:border-white/[0.16] transition-all"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent" />
              <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)" }}
              />
              <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="flex-shrink-0">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                      firstQuest.difficulty === "easy" ? "from-emerald-500 to-green-600" :
                      firstQuest.difficulty === "medium" ? "from-cyan-500 to-blue-600" :
                      firstQuest.difficulty === "hard" ? "from-violet-500 to-purple-600" :
                      "from-rose-500 to-pink-600"
                    } flex items-center justify-center text-white font-bold text-lg shadow-xl`}
                  >
                    {firstQuest.difficulty === "easy" ? "E" : firstQuest.difficulty === "medium" ? "C" : firstQuest.difficulty === "hard" ? "B" : "S"}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    {firstQuest.skill_tag || "Quest"}
                  </div>
                  <h4 className="text-lg font-semibold mb-1.5 group-hover:text-white transition-colors">
                    {firstQuest.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold">
                      <Zap size={11} />+{firstQuest.xp_reward} XP
                    </span>
                    {firstQuest.time_estimate_minutes && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock size={11} />
                        {firstQuest.time_estimate_minutes < 60
                          ? `${firstQuest.time_estimate_minutes} min`
                          : `${Math.round(firstQuest.time_estimate_minutes / 60)}h`}
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight size={18} className="hidden sm:block text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
              </div>
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-6"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
                <Calendar size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-1">Today's focus</div>
                <h4 className="text-base font-semibold mb-1">All quests cleared — well done</h4>
                <p className="text-xs text-slate-400">
                  Ask ForgeBot to generate more, or take a well-earned break.
                </p>
              </div>
              <Link
                href="/mentor"
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
              >
                Talk to ForgeBot
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Pro upsell — free users only */}
        {profile && !isPaid(profile.subscription_tier) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.33 }}
            className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-500/[0.1] via-violet-500/[0.04] to-transparent p-6"
          >
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)" }}
            />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
                <Crown size={20} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-violet-300 font-semibold mb-1">
                  PathForge Pro
                </div>
                <h4 className="text-base font-semibold mb-2">Unlock the full forge</h4>
                <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <GraduationCap size={12} className="text-violet-300" />
                    Download &amp; share your certificates
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Bot size={12} className="text-violet-300" />
                    Unlimited ForgeBot coaching
                  </span>
                </div>
              </div>
              <Link
                href="/pricing"
                className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-white/5"
              >
                See Pro · ₱249/mo
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        )}

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 lg:p-6"
        >
          <StreakHeatmap completions={completions} />
        </motion.div>
      </div>

      {/* First-visit welcome modal */}
      <WelcomeModal />
    </div>
  );
}
