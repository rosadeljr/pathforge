"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  Settings as SettingsIcon,
  User,
  Target,
  CreditCard,
  LogOut,
  Loader2,
  Check,
  Mail,
  Sparkles,
  ArrowRight,
  Share2,
  Copy,
  Volume2,
  VolumeX,
} from "lucide-react";
import Link from "next/link";
import { CAREER_PATHS, formatPhp } from "@/lib/data/career-paths";
import { PageShimmer } from "@/components/ui/Shimmer";
import { isSoundEnabled, setSoundEnabled } from "@/lib/effects/celebration";

interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  full_name: string | null;
  selected_career_path_id: string | null;
  target_salary_min: number | null;
  target_salary_max: number | null;
  target_timeline_months: number | null;
  weekly_availability_hours: number | null;
  primary_goal: string | null;
  subscription_tier: string | null;
  career_path_changes_count: number | null;
}

const MAX_CAREER_CHANGES = 3;

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(isSoundEnabled());
  }, []);

  const toggleSound = () => {
    const next = !soundOn;
    setSoundEnabled(next);
    setSoundOn(next);
    toast.success(next ? "Sound effects enabled" : "Sound effects muted");
  };
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();
        if (data) {
          setProfile(data);
          setUsername(data.username || "");
          setFullName(data.full_name || "");
        }
      } catch (e) {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [supabase]);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: username.trim() || null,
          full_name: fullName.trim() || null,
        })
        .eq("id", profile.id);
      if (error) throw error;
      toast.success("Profile saved");
      setProfile({ ...profile, username, full_name: fullName });
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return <PageShimmer />;
  }

  if (!profile) return null;

  const careerPath = CAREER_PATHS.find((p) => p.id === profile.selected_career_path_id);
  const tier = profile.subscription_tier || "free";
  const isPro = tier === "pro";

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-3">
            <SettingsIcon size={11} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">Settings</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
            Your account
          </h1>
          <p className="text-sm text-slate-400">Manage your profile, goals, and subscription.</p>
        </motion.div>

        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <User size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold tracking-tight uppercase tracking-wider text-slate-300">Profile</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-handle"
                className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Full name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                <input
                  value={profile.email || ""}
                  disabled
                  className="w-full pl-10 pr-3.5 py-2 bg-white/[0.02] border border-white/[0.04] rounded-lg text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Email cannot be changed</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={saveProfile}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Check size={14} />
                    Save changes
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.section>

        {/* Career Goals */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Target size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Career Goals</h2>
          </div>
          <div className="p-6 space-y-4">
            {careerPath ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${careerPath.gradient} flex items-center justify-center text-xl`}
                  style={{ boxShadow: `0 8px 24px ${careerPath.accentColor}30` }}
                >
                  {careerPath.emoji}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{careerPath.title}</div>
                  <div className="text-xs text-slate-400">{careerPath.tagline}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">No career path selected.</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Target salary
                </div>
                <div className="text-sm font-semibold tabular-nums">
                  {profile.target_salary_min && profile.target_salary_max
                    ? `${formatPhp(profile.target_salary_min)} – ${formatPhp(profile.target_salary_max)}`
                    : "Not set"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Timeline
                </div>
                <div className="text-sm font-semibold">
                  {profile.target_timeline_months ? `${profile.target_timeline_months} months` : "Not set"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Weekly hours
                </div>
                <div className="text-sm font-semibold">
                  {profile.weekly_availability_hours ? `${profile.weekly_availability_hours}h` : "Not set"}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                  Primary goal
                </div>
                <div className="text-sm font-semibold capitalize">
                  {profile.primary_goal?.replace(/_/g, " ") || "Not set"}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/[0.06] flex-wrap">
              <div className="text-xs text-slate-500">
                {(() => {
                  const used = profile.career_path_changes_count || 0;
                  const remaining = MAX_CAREER_CHANGES - used;
                  if (remaining > 0) {
                    return `${remaining} of ${MAX_CAREER_CHANGES} path changes remaining`;
                  }
                  return "You've used all your path changes";
                })()}
              </div>
              <Link
                href="/onboarding"
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  (profile.career_path_changes_count || 0) < MAX_CAREER_CHANGES
                    ? "bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white"
                    : "border border-white/[0.04] text-slate-600 cursor-not-allowed pointer-events-none"
                }`}
              >
                Change career path
                <ArrowRight size={11} />
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Public Profile / Share */}
        {profile.username && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.125 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
              <Share2 size={14} className="text-slate-400" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Public Profile
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-slate-400">
                Your public profile shows your level, rank, projects, and achievements. Share the
                link with recruiters or post on LinkedIn.
              </p>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
                <code className="flex-1 text-xs text-slate-300 truncate font-mono">
                  {typeof window !== "undefined" ? window.location.origin : ""}/u/{profile.username}
                </code>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard.writeText(`${window.location.origin}/u/${profile.username}`);
                      toast.success("Link copied");
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-slate-300 hover:bg-white/[0.06] transition-colors flex-shrink-0"
                >
                  <Copy size={11} />
                  Copy
                </button>
                <Link
                  href={`/u/${profile.username}`}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-xs font-medium text-slate-300 hover:bg-white/[0.06] transition-colors flex-shrink-0"
                >
                  <ArrowRight size={11} />
                  Open
                </Link>
              </div>
            </div>
          </motion.section>
        )}

        {/* Subscription */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <CreditCard size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Subscription</h2>
          </div>
          <div className="p-6">
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] p-5">
              {isPro && (
                <div className="absolute inset-0 opacity-20"
                  style={{ background: "radial-gradient(ellipse at top right, rgba(245,158,11,0.4), transparent 70%)" }}
                />
              )}
              <div className="relative flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {isPro && <Sparkles size={14} className="text-amber-300" />}
                    <span className="text-xs uppercase tracking-wider text-slate-500 font-semibold">
                      Current plan
                    </span>
                  </div>
                  <div className="text-xl font-semibold tracking-tight capitalize">
                    {isPro ? "PathForge Pro" : "Free"}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {isPro
                      ? "Unlimited AI mentor, advanced quests, priority support"
                      : "Daily quests, basic AI mentor, portfolio basics"}
                  </p>
                </div>
                <Link
                  href="/pricing"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isPro
                      ? "border border-white/[0.08] text-slate-300 hover:bg-white/[0.03]"
                      : "bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/20"
                  }`}
                >
                  {isPro ? "Manage plan" : "Upgrade to Pro"}
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Preferences */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.175 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <SettingsIcon size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
              Preferences
            </h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    soundOn ? "bg-indigo-500/15 text-indigo-300" : "bg-white/[0.04] text-slate-500"
                  }`}
                >
                  {soundOn ? <Volume2 size={18} /> : <VolumeX size={18} />}
                </div>
                <div>
                  <div className="text-sm font-semibold">Sound effects</div>
                  <div className="text-xs text-slate-400">
                    Plays celebratory chimes on quest complete, level up, and achievements.
                  </div>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  soundOn ? "bg-indigo-500" : "bg-white/[0.1]"
                }`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    soundOn ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>
        </motion.section>

        {/* Danger zone */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] overflow-hidden"
        >
          <div className="p-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold mb-1">Sign out</h2>
              <p className="text-xs text-slate-400">
                You'll need to sign in again to access your account.
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-rose-500/30 text-sm font-medium text-rose-300 hover:bg-rose-500/10 transition-colors flex-shrink-0"
            >
              <LogOut size={14} />
              Sign out
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
