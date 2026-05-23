"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Star,
  Trophy,
  Lock,
  ArrowRight,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { SUBJECTS, type Subject } from "@/lib/data/learner";
import { PageShimmer } from "@/components/ui/Shimmer";

interface LearnerProfile {
  username: string | null;
  learner_grade: number | null;
  learner_subjects: string[] | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
}

/**
 * Learner home — the kid-mode dashboard. Bright, friendly, subject-first.
 * Phase 0 scaffold; lesson playback ships in Phase 1.
 */
export default function LearnPage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
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
        const { data } = await supabase
          .from("profiles")
          .select(
            "username, learner_grade, learner_subjects, current_level, total_xp, streak_count, longest_streak"
          )
          .eq("id", session.user.id)
          .maybeSingle();
        if (data) setProfile(data as LearnerProfile);
      } catch (e) {
        console.error("Learn home load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  if (loading) return <PageShimmer />;

  const name = profile?.username || "friend";
  const grade = profile?.learner_grade;
  const streak = profile?.streak_count || 0;
  const totalXp = profile?.total_xp || 0;
  const level = profile?.current_level || 1;

  // Highlight subjects the user picked; show the rest as discoverable.
  const picked = new Set(profile?.learner_subjects || []);
  const orderedSubjects: Subject[] = [
    ...SUBJECTS.filter((s) => picked.has(s.id)),
    ...SUBJECTS.filter((s) => !picked.has(s.id)),
  ];

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1 flex-wrap">
            <span>
              Kumusta, <span className="text-white font-medium">{name}</span>!
            </span>
            {streak > 0 && (
              <>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-amber-300 font-medium">
                  <Flame size={12} />
                  Day {streak} streak
                </span>
              </>
            )}
            {grade && (
              <>
                <span className="text-slate-600">·</span>
                <span className="inline-flex items-center gap-1 text-indigo-300 font-medium">
                  Grade {grade}
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Let's learn something today!
          </h1>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard label="Level" value={level} icon={Star} accent="#a855f7" />
          <StatCard label="XP" value={totalXp.toLocaleString()} icon={Sparkles} accent="#6366f1" />
          <StatCard label="Streak" value={`${streak}d`} icon={Flame} accent="#f59e0b" />
        </motion.div>

        {/* Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Pick a subject
            </h2>
            <span className="text-xs text-slate-500">
              {grade ? `Grade ${grade} lessons` : "Set your grade in Settings"}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orderedSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isPicked={picked.has(subject.id)}
              />
            ))}
          </div>
        </motion.div>

        {/* Daily mission placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.08] via-amber-500/[0.03] to-transparent p-6"
        >
          <div
            className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)" }}
          />
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
              <Trophy size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-semibold mb-1">
                Coming soon
              </div>
              <h3 className="text-base font-semibold mb-1">Interactive lessons land next</h3>
              <p className="text-xs text-slate-400">
                Phase 1 ships Math, English, and Filipino lessons for Grades 3–5
                with quizzes, mini-games, and instant feedback.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({
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

function SubjectCard({
  subject,
  isPicked,
}: {
  subject: Subject;
  isPicked: boolean;
}) {
  const disabled = !subject.available;
  const Wrapper: any = disabled ? "div" : Link;
  const wrapperProps = disabled ? {} : { href: `/learn/${subject.id}` };
  return (
    <Wrapper
      {...wrapperProps}
      className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${
        disabled
          ? "border-white/[0.04] bg-white/[0.01] opacity-70 cursor-default"
          : isPicked
          ? "border-white/[0.16] bg-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.24]"
          : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
      }`}
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: `radial-gradient(circle, ${subject.accentColor}, transparent 70%)` }}
      />
      <div className="relative">
        <div
          className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}
          style={{ boxShadow: `0 8px 24px ${subject.accentColor}30` }}
        >
          {subject.emoji}
        </div>
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <h3 className="text-base font-semibold tracking-tight">{subject.title}</h3>
          {isPicked && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Picked
            </span>
          )}
          {disabled && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-slate-500">
              <Lock size={9} />
              Soon
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed mb-3">
          {subject.description}
        </p>
        {!disabled && (
          <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
            Open
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </div>
        )}
      </div>
    </Wrapper>
  );
}
