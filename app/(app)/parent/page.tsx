"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Heart,
  Flame,
  Sparkles,
  Trophy,
  Users,
  ArrowRight,
  Mail,
  Calendar,
  Target,
  BookOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SUBJECTS,
  ageTierForGrade,
  TIER_COPY,
  gradeLabel,
} from "@/lib/data/learner";
import { CAREERS, getCareer } from "@/lib/data/careers";
import { PageShimmer } from "@/components/ui/Shimmer";

interface KidProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  learner_grade: number | null;
  learner_subjects: string[] | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  dream_career_id: string | null;
  last_quest_completed_at: string | null;
}

interface KidWithActivity extends KidProfile {
  lessonsToday: number;
  xpToday: number;
  lessonsWeek: number;
}

/**
 * Parent dashboard — visible to accounts where is_parent_account = true.
 * Shows progress for all linked kids. Pro/Family plan feature.
 */
export default function ParentDashboardPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [kids, setKids] = useState<KidWithActivity[]>([]);
  const [parentEmail, setParentEmail] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        setParentEmail(session.user.email ?? null);

        // Find linked kids
        const { data: kidProfiles } = await supabase
          .from("profiles")
          .select(
            "id, username, full_name, learner_grade, learner_subjects, current_level, total_xp, streak_count, longest_streak, dream_career_id, last_quest_completed_at"
          )
          .eq("parent_profile_id", session.user.id);

        const kidsArr = (kidProfiles || []) as KidProfile[];
        if (kidsArr.length === 0) {
          setKids([]);
          return;
        }

        // Fetch activity windows
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);
        const startOfWeek = new Date();
        startOfWeek.setDate(startOfWeek.getDate() - 7);

        const enriched: KidWithActivity[] = await Promise.all(
          kidsArr.map(async (kid) => {
            const [{ data: today }, { data: week }] = await Promise.all([
              supabase
                .from("analytics_events")
                .select("xp_delta, event_type")
                .eq("user_id", kid.id)
                .gte("created_at", startOfToday.toISOString()),
              supabase
                .from("analytics_events")
                .select("event_type")
                .eq("user_id", kid.id)
                .eq("event_type", "lesson_completed")
                .gte("created_at", startOfWeek.toISOString()),
            ]);
            return {
              ...kid,
              lessonsToday: (today || []).filter(
                (e: any) => e.event_type === "lesson_completed"
              ).length,
              xpToday: (today || []).reduce(
                (s: number, e: any) => s + (e.xp_delta || 0),
                0
              ),
              lessonsWeek: (week || []).length,
            };
          })
        );

        setKids(enriched);
      } catch (e) {
        console.error("Parent dashboard load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <PageShimmer />;

  const totalKids = kids.length;
  const totalLessonsToday = kids.reduce((s, k) => s + k.lessonsToday, 0);
  const totalXpToday = kids.reduce((s, k) => s + k.xpToday, 0);
  const longestStreak = kids.reduce(
    (m, k) => Math.max(m, k.streak_count || 0),
    0
  );

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/30 mb-3">
            <Heart size={11} className="text-emerald-400" fill="currentColor" />
            <span className="text-xs font-medium text-emerald-200 tracking-wide">
              Parent dashboard
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
            Your kids, at a glance.
          </h1>
          <p className="text-sm text-slate-400">
            See progress, streaks, and dream careers across every linked learner.
          </p>
        </motion.div>

        {/* Family-wide stats */}
        {kids.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          >
            <FamilyStat label="Kids" value={totalKids} icon={Users} accent="#a855f7" />
            <FamilyStat
              label="Lessons today"
              value={totalLessonsToday}
              icon={BookOpen}
              accent="#6366f1"
            />
            <FamilyStat
              label="XP today"
              value={totalXpToday.toLocaleString()}
              icon={Sparkles}
              accent="#0ea5e9"
            />
            <FamilyStat
              label="Best streak"
              value={`${longestStreak}d`}
              icon={Flame}
              accent="#f59e0b"
            />
          </motion.div>
        )}

        {/* Kids list or empty state */}
        {kids.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-8 sm:p-12 text-center"
          >
            <div className="text-5xl mb-4">👨‍👩‍👧‍👦</div>
            <h2 className="text-xl font-semibold mb-2">No kids linked yet</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
              Have your child sign up at{" "}
              <span className="text-white font-medium">pathforger.app</span> and enter your
              email as their <strong>parent email</strong> during setup. They'll be linked
              automatically.
            </p>
            {parentEmail && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-sm mb-4">
                <Mail size={14} className="text-emerald-300" />
                <span className="text-slate-300">Your parent email:</span>
                <span className="font-mono text-emerald-200">{parentEmail}</span>
              </div>
            )}
            <div>
              <button
                onClick={async () => {
                  if (!parentEmail) return;
                  const { data: { session } } = await supabase.auth.getSession();
                  if (!session?.user) return;
                  const { data: linked } = await supabase
                    .from("profiles")
                    .update({ parent_profile_id: session.user.id })
                    .eq("parent_email", parentEmail.toLowerCase())
                    .neq("id", session.user.id)
                    .is("parent_profile_id", null)
                    .select("id");
                  if (linked && linked.length > 0) {
                    window.location.reload();
                  } else {
                    alert(
                      "No kids found with that parent email yet. Have your kid sign up first using exactly: " +
                        parentEmail
                    );
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Scan for my kids
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-5">
              Need help? Email{" "}
              <a
                href="mailto:support@pathforger.app"
                className="text-indigo-300 underline"
              >
                support@pathforger.app
              </a>
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-3"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Your kids
            </h2>
            {kids.map((kid, i) => (
              <KidCard key={kid.id} kid={kid} index={i} />
            ))}
          </motion.div>
        )}

        {/* Weekly snapshot tip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent p-5"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Calendar size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1">
                Weekly progress emails
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                We send you a weekly recap every Sunday at 6pm PHT with each
                kid's lessons completed, streak progress, and what they're working
                toward. Make sure{" "}
                <span className="text-emerald-300 font-semibold">{parentEmail || "your email"}</span>{" "}
                is not blocking PathForge messages.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function FamilyStat({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: any;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
            {label}
          </span>
          <Icon size={12} style={{ color: accent }} />
        </div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function KidCard({ kid, index }: { kid: KidWithActivity; index: number }) {
  const tier = ageTierForGrade(kid.learner_grade);
  const tierCopy = TIER_COPY[tier];
  const dreamCareer = kid.dream_career_id ? getCareer(kid.dream_career_id) : null;
  const lastActive = kid.last_quest_completed_at
    ? new Date(kid.last_quest_completed_at)
    : null;
  const daysAgo = lastActive
    ? Math.floor((Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const lastSeenLabel =
    daysAgo === null
      ? "No activity yet"
      : daysAgo === 0
      ? "Active today"
      : daysAgo === 1
      ? "Yesterday"
      : `${daysAgo} days ago`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5"
    >
      <div className="grid sm:grid-cols-[auto_1fr_auto] gap-4 items-center">
        {/* Avatar + tier */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-base font-bold shadow-lg shadow-indigo-500/30">
              {(kid.username || "?").slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-lg bg-amber-500 border-2 border-[#0a0a0f] flex items-center justify-center text-[10px] font-bold text-slate-900">
              {kid.current_level || 1}
            </div>
          </div>
          <div className="sm:hidden">
            <div className="text-base font-semibold">{kid.username || "kid"}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">
              {tierCopy.emoji} {tierCopy.label}
            </div>
          </div>
        </div>

        {/* Main info */}
        <div className="min-w-0">
          <div className="hidden sm:block">
            <div className="flex items-baseline gap-2 flex-wrap">
              <h3 className="text-base font-semibold tracking-tight">{kid.username || "kid"}</h3>
              <span className="text-[11px] text-slate-500">
                {tierCopy.emoji} {tierCopy.label} ·{" "}
                {kid.learner_grade ? gradeLabel(kid.learner_grade) : "no grade"}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">{lastSeenLabel}</div>
          </div>
          <div className="flex items-center gap-3 mt-2 flex-wrap text-xs">
            <span className="inline-flex items-center gap-1 text-indigo-300 font-medium">
              <Sparkles size={11} />
              {kid.total_xp.toLocaleString()} XP
            </span>
            {kid.streak_count > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                <Flame size={11} />
                {kid.streak_count}d
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-emerald-300 font-medium">
              <BookOpen size={11} />
              {kid.lessonsToday} today · {kid.lessonsWeek} this week
            </span>
          </div>
          {dreamCareer && (
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-200 border border-rose-500/30">
              <Heart size={9} fill="currentColor" />
              Future {dreamCareer.title} {dreamCareer.emoji}
            </div>
          )}
        </div>

        {/* CTA */}
        <Link
          href={`/parent/${kid.id}`}
          aria-label={`View detailed progress for ${kid.username || "this kid"}`}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-slate-200 hover:bg-white/[0.08] hover:text-white transition-colors flex-shrink-0"
        >
          Details
          <ArrowRight size={11} />
        </Link>
      </div>
    </motion.div>
  );
}
