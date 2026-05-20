import { createClient } from "@/lib/supabase/server";
import { CAREER_PATHS, formatPhp } from "@/lib/data/career-paths";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import {
  Trophy,
  Sparkles,
  Flame,
  Zap,
  Calendar,
  ExternalLink,
  Code2,
  Star,
  ArrowRight,
} from "lucide-react";

interface PublicProfile {
  id: string;
  username: string;
  full_name: string | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  readiness_score: number;
  selected_career_path_id: string | null;
  created_at: string;
}

interface PublicProject {
  id: string;
  title: string;
  description: string | null;
  skills_used: string[] | null;
  project_url: string | null;
  github_url: string | null;
  ai_review_score: number | null;
  created_at: string;
}

const RANK_COLORS: Record<string, { gradient: string; color: string }> = {
  E: { gradient: "from-slate-500 to-slate-700", color: "#94a3b8" },
  D: { gradient: "from-emerald-500 to-green-600", color: "#10b981" },
  C: { gradient: "from-cyan-500 to-blue-600", color: "#06b6d4" },
  B: { gradient: "from-violet-500 to-purple-600", color: "#a855f7" },
  A: { gradient: "from-orange-500 to-red-600", color: "#f97316" },
  S: { gradient: "from-rose-500 to-pink-600", color: "#f43f5e" },
  SS: { gradient: "from-amber-400 to-orange-500", color: "#f59e0b" },
  SSS: { gradient: "from-cyan-400 to-violet-500", color: "#06b6d4" },
};

function getRank(level: number): string {
  if (level < 5) return "E";
  if (level < 10) return "D";
  if (level < 20) return "C";
  if (level < 35) return "B";
  if (level < 55) return "A";
  if (level < 75) return "S";
  if (level < 95) return "SS";
  return "SSS";
}

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profileData } = await supabase
    .from("profiles")
    .select(
      "id, username, full_name, current_level, total_xp, streak_count, longest_streak, readiness_score, selected_career_path_id, created_at"
    )
    .eq("username", username)
    .maybeSingle();

  if (!profileData) {
    notFound();
  }

  const profile = profileData as PublicProfile;

  // Load projects + achievements in parallel
  const [projectsResult, achievementsResult] = await Promise.all([
    supabase
      .from("projects")
      .select("id, title, description, skills_used, project_url, github_url, ai_review_score, created_at")
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("user_achievements")
      .select("achievement_id, unlocked_at, achievements (title, description, rarity, icon_name, xp_bonus)")
      .eq("user_id", profile.id)
      .order("unlocked_at", { ascending: false })
      .limit(8),
  ]);

  const projects = (projectsResult.data || []) as PublicProject[];
  const achievements = (achievementsResult.data || []) as any[];

  const careerPath = CAREER_PATHS.find((p) => p.id === profile.selected_career_path_id);
  const rank = getRank(profile.current_level);
  const rankStyle = RANK_COLORS[rank];
  const displayName = profile.full_name || profile.username;
  const initials = displayName.slice(0, 2).toUpperCase();
  const memberSince = new Date(profile.created_at).toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-20"
          style={{ background: `radial-gradient(ellipse, ${rankStyle.color}40, transparent 70%)` }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Top nav */}
      <nav className="relative z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-semibold tracking-tight">PathForge</span>
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center gap-1.5 text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg transition-colors"
          >
            Forge yours
            <ArrowRight size={12} />
          </Link>
        </div>
      </nav>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        {/* Profile Hero */}
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-8 lg:p-12">
          <div
            className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-30 pointer-events-none"
            style={{ background: `radial-gradient(circle, ${rankStyle.color}40, transparent 70%)` }}
          />

          <div className="relative grid lg:grid-cols-[auto_1fr_auto] gap-8 items-center">
            {/* Avatar */}
            <div className="relative">
              <div
                className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${rankStyle.gradient} flex items-center justify-center text-3xl font-bold shadow-2xl`}
                style={{ boxShadow: `0 20px 60px ${rankStyle.color}40` }}
              >
                {initials}
              </div>
              <div
                className={`absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-gradient-to-br ${rankStyle.gradient} border-4 border-[#0a0a0f] flex items-center justify-center font-bold text-sm`}
              >
                {rank}
              </div>
            </div>

            {/* Identity */}
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold tracking-tight mb-1">
                {displayName}
              </h1>
              <div className="text-sm text-slate-400 mb-4">@{profile.username}</div>

              <div className="flex flex-wrap gap-2">
                {careerPath && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                    <span>{careerPath.emoji}</span>
                    <span className="text-xs font-medium">{careerPath.title}</span>
                  </div>
                )}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border"
                  style={{
                    color: rankStyle.color,
                    borderColor: `${rankStyle.color}40`,
                    backgroundColor: `${rankStyle.color}15`,
                  }}
                >
                  <Sparkles size={11} />
                  <span className="text-xs font-bold tracking-wider">{rank}-RANK</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <Calendar size={11} className="text-slate-400" />
                  <span className="text-xs text-slate-300">Forging since {memberSince}</span>
                </div>
              </div>
            </div>

            {/* Big level */}
            <div className="text-center lg:text-right">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Level</div>
              <div className="text-5xl lg:text-6xl font-semibold tracking-tighter tabular-nums">
                {profile.current_level}
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="relative mt-8 pt-6 border-t border-white/[0.06] grid grid-cols-4 gap-4">
            {[
              { label: "Total XP", value: profile.total_xp.toLocaleString(), icon: Zap, color: "#6366f1" },
              { label: "Streak", value: `${profile.streak_count}d`, icon: Flame, color: "#f59e0b" },
              { label: "Best streak", value: `${profile.longest_streak}d`, icon: Sparkles, color: "#ec4899" },
              { label: "Readiness", value: `${profile.readiness_score}%`, icon: Trophy, color: "#10b981" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="flex items-center gap-1.5 mb-1">
                  <stat.icon size={11} style={{ color: stat.color }} />
                  <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    {stat.label}
                  </span>
                </div>
                <div className="text-lg font-semibold tracking-tight tabular-nums">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        {projects.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Projects · {projects.length}
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div className="flex items-start justify-between mb-2 gap-2">
                    <h3 className="text-base font-semibold leading-tight">{project.title}</h3>
                    {project.ai_review_score && (
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-400/30 flex-shrink-0">
                        <Star size={9} className="text-amber-300" fill="currentColor" />
                        <span className="text-[10px] font-semibold text-amber-300 tabular-nums">
                          {project.ai_review_score.toFixed(1)}
                        </span>
                      </div>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-sm text-slate-400 mb-3 leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  {project.skills_used && project.skills_used.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {project.skills_used.slice(0, 4).map((s) => (
                        <span
                          key={s}
                          className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-3 border-t border-white/[0.06]">
                    {project.project_url && (
                      <a
                        href={project.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <ExternalLink size={11} />
                        Live
                      </a>
                    )}
                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        <Code2 size={11} />
                        Code
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        {achievements.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                Achievements · {achievements.length}
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {achievements.map((a) => {
                const ach = a.achievements;
                if (!ach) return null;
                const rarityColor =
                  ach.rarity === "legendary" ? "#f59e0b" :
                  ach.rarity === "epic" ? "#a855f7" :
                  ach.rarity === "rare" ? "#06b6d4" :
                  "#94a3b8";
                return (
                  <div
                    key={a.achievement_id}
                    className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] text-center"
                    style={{ boxShadow: `0 4px 16px ${rarityColor}20` }}
                  >
                    <div
                      className="w-8 h-8 mx-auto mb-2 rounded-lg flex items-center justify-center"
                      style={{ background: `${rarityColor}20`, color: rarityColor }}
                    >
                      <Trophy size={14} />
                    </div>
                    <div className="text-xs font-semibold mb-0.5">{ach.title}</div>
                    <div className="text-[10px] capitalize" style={{ color: rarityColor }}>
                      {ach.rarity}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* CTA for visitors */}
        <section>
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-8 lg:p-10 text-center">
            <div className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.4), transparent 70%)" }}
            />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-2">
                Want a profile like this?
              </h2>
              <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
                Forge your own career on PathForge. Free to start.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-lg"
              >
                Start your path
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
