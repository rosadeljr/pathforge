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
  Sun,
  Moon,
} from "lucide-react";
import Link from "next/link";
import { SUBJECTS, gradeLabel } from "@/lib/data/learner";
import { PageShimmer } from "@/components/ui/Shimmer";
import { isSoundEnabled, setSoundEnabled } from "@/lib/effects/celebration";
import { useTheme } from "@/components/theme/ThemeProvider";
import { ShareButtons } from "@/components/share/ShareButtons";
import { GCashPaymentModal } from "@/components/payments/GCashPaymentModal";

interface Profile {
  id: string;
  username: string | null;
  email: string | null;
  full_name: string | null;
  learner_grade: number | null;
  learner_subjects: string[] | null;
  subscription_tier: string | null;
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [soundOn, setSoundOn] = useState(true);
  const [payModal, setPayModal] = useState<{ tier: "pro" | "family"; amount: number } | null>(null);
  const { theme, toggle: toggleTheme } = useTheme();

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

  const tier = profile.subscription_tier || "free";
  const isPro = tier === "pro";
  const pickedSubjects = (profile.learner_subjects || [])
    .map((id) => SUBJECTS.find((s) => s.id === id))
    .filter(Boolean) as typeof SUBJECTS;

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

        {/* Learning Setup */}
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/[0.06] flex items-center gap-2">
            <Target size={14} className="text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Learning</h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Grade */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base font-bold text-white">
                {profile.learner_grade ?? "—"}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold">
                  {profile.learner_grade ? gradeLabel(profile.learner_grade) : "Grade not set"}
                </div>
                <div className="text-xs text-slate-400">
                  Lessons are matched to this grade
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div>
              <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2 font-semibold">
                Picked subjects
              </div>
              {pickedSubjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {pickedSubjects.map((s) => (
                    <div
                      key={s.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.08] text-sm"
                    >
                      <span>{s.emoji}</span>
                      <span className="font-medium">{s.title}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-400">
                  You'll see all subjects until you pick favorites.
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-2 border-t border-white/[0.06]">
              <Link
                href="/learn/setup"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:bg-white/[0.06] hover:text-white"
              >
                Change grade or subjects
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

              <ShareButtons
                url={
                  typeof window !== "undefined"
                    ? `${window.location.origin}/u/${profile.username}`
                    : `/u/${profile.username}`
                }
                title={`${profile.full_name || profile.username} on PathForge`}
                text={`Check out my learning journey on PathForge — Grade ${profile.learner_grade ?? "—"} forger`}
              />
              <Link
                href={`/u/${profile.username}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200 transition-colors"
              >
                Open my public profile
                <ArrowRight size={11} />
              </Link>
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
                      ? "Unlimited lessons + tutor, parent dashboard, priority support"
                      : "5 lessons/day, 10 tutor messages/day, all subjects unlocked"}
                  </p>
                </div>
                {tier === "free" ? (
                  <button
                    onClick={() => setPayModal({ tier: "pro", amount: 249 })}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 hover:from-amber-300 hover:to-orange-400 shadow-lg shadow-amber-500/20"
                  >
                    Upgrade to Pro
                    <ArrowRight size={12} />
                  </button>
                ) : (
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors border border-white/[0.08] text-slate-300 hover:bg-white/[0.03]"
                  >
                    Change plan
                    <ArrowRight size={12} />
                  </Link>
                )}
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
          <div className="p-6 space-y-5">
            {/* Theme toggle */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    theme === "dark"
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "bg-amber-500/15 text-amber-300"
                  }`}
                >
                  {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    Theme · {theme === "dark" ? "Dark" : "Light"}
                  </div>
                  <div className="text-xs text-slate-400">
                    Dark mode is the recommended experience for that premium feel.
                  </div>
                </div>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  theme === "light" ? "bg-amber-500" : "bg-white/[0.1]"
                }`}
                aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <span
                  className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    theme === "light" ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Sound toggle */}
            <div className="flex items-center justify-between gap-4 pt-5 border-t border-white/[0.06]">
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
                    Plays celebratory chimes on lesson complete, level up, and achievements.
                  </div>
                </div>
              </div>
              <button
                onClick={toggleSound}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
                  soundOn ? "bg-indigo-500" : "bg-white/[0.1]"
                }`}
                aria-label={soundOn ? "Mute sounds" : "Enable sounds"}
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

      {/* GCash / Maya payment modal */}
      {payModal && (
        <GCashPaymentModal
          tier={payModal.tier}
          amount={payModal.amount}
          onClose={() => setPayModal(null)}
        />
      )}
    </div>
  );
}
