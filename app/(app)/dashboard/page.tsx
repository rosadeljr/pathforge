"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Zap, Target, TrendingUp, Flame, Award, Settings, LogOut } from "lucide-react";
import { calculateLevelFromTotalXP, getLevelTitle } from "@/lib/gamification/xp";
import { calculateReadinessScore } from "@/lib/gamification/readiness";

interface Profile {
  id: string;
  current_level: number;
  total_xp: number;
  current_xp: number;
  streak_count: number;
  readiness_score: number;
  selected_career_path_id?: string;
  username?: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error loading profile:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center">Loading...</div>;
  if (!profile) return null;

  const levelInfo = calculateLevelFromTotalXP(profile.total_xp);
  const levelTitle = getLevelTitle(profile.current_level);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Welcome back</p>
              <h1 className="font-bold">{profile.username || "Forger"}</h1>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => router.push("/settings")}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-slate-800 rounded-lg transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Level & XP Card */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-900 to-cyan-900/20 border border-cyan-500/30 rounded-xl p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-slate-400 text-sm">Current Level</p>
                <h2 className="text-5xl font-bold">{profile.current_level}</h2>
                <p className="text-cyan-400 font-semibold mt-2">{levelTitle}</p>
              </div>
              <Award className="w-12 h-12 text-cyan-400" />
            </div>
            <div className="bg-slate-800 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-cyan-600 h-2 rounded-full transition-all"
                style={{ width: `${levelInfo.progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-slate-400">
              {levelInfo.currentXP} / {levelInfo.requiredForNext} XP to next level
            </p>
          </div>

          {/* Stats Card */}
          <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <Flame className="w-8 h-8 text-amber-400" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Current Streak</p>
                  <p className="text-2xl font-bold">{profile.streak_count} days</p>
                </div>
              </div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
                <div className="flex-1">
                  <p className="text-slate-400 text-sm">Readiness Score</p>
                  <p className="text-2xl font-bold">{profile.readiness_score}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            { icon: Target, label: "Daily Quests", href: "/quests" },
            { icon: TrendingUp, label: "Roadmap", href: "/roadmap" },
            { icon: Award, label: "Portfolio", href: "/portfolio" },
          ].map((action, i) => (
            <button
              key={i}
              onClick={() => router.push(action.href)}
              className="group bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-xl p-6 transition-all"
            >
              <action.icon className="w-8 h-8 text-cyan-400 mb-3 group-hover:scale-110 transition-transform" />
              <p className="font-semibold group-hover:text-cyan-400 transition-colors">{action.label}</p>
            </button>
          ))}
        </div>

        {/* Message */}
        <div className="bg-gradient-to-r from-violet-900/30 to-slate-900 border border-violet-500/30 rounded-xl p-8 text-center">
          <p className="text-lg font-semibold mb-2">Your Daily Focus</p>
          <p className="text-slate-400">Complete 1 quest today and protect your {profile.streak_count}-day streak! 🔥</p>
        </div>
      </div>
    </div>
  );
}
