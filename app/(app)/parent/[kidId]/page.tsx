"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Sparkles,
  BookOpen,
  Heart,
  Star,
  Trophy,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SUBJECTS,
  ageTierForGrade,
  TIER_COPY,
  gradeLabel,
} from "@/lib/data/learner";
import { LESSONS } from "@/lib/data/learner-lessons";
import { getCareer, getStages, currentStageIndex } from "@/lib/data/careers";
import { PageShimmer } from "@/components/ui/Shimmer";

interface Kid {
  id: string;
  username: string | null;
  learner_grade: number | null;
  learner_subjects: string[] | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  dream_career_id: string | null;
  last_quest_completed_at: string | null;
}

export default function KidDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const kidId = (params?.kidId as string) || "";
  const [kid, setKid] = useState<Kid | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [{ data: kidData }, { data: events }] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "id, username, learner_grade, learner_subjects, current_level, total_xp, streak_count, longest_streak, dream_career_id, last_quest_completed_at"
            )
            .eq("id", kidId)
            .maybeSingle(),
          supabase
            .from("analytics_events")
            .select("event_payload")
            .eq("user_id", kidId)
            .eq("event_type", "lesson_completed"),
        ]);
        setKid((kidData as Kid) || null);
        setCompletedLessonIds(
          new Set((events || []).map((e: any) => e?.event_payload?.lesson_id).filter(Boolean))
        );
      } catch (e) {
        console.error("Kid detail load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [kidId, supabase]);

  const subjectProgress = useMemo(() => {
    return SUBJECTS.map((s) => {
      const total = LESSONS.filter((l) => l.subject === s.id).length;
      const done = LESSONS.filter(
        (l) => l.subject === s.id && completedLessonIds.has(l.id)
      ).length;
      return { subject: s, total, done };
    });
  }, [completedLessonIds]);

  if (loading) return <PageShimmer />;
  if (!kid) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Kid not found</h1>
        <Link
          href="/parent"
          className="text-sm text-indigo-300 hover:text-indigo-200"
        >
          ← Back to dashboard
        </Link>
      </div>
    );
  }

  const tier = ageTierForGrade(kid.learner_grade);
  const tierCopy = TIER_COPY[tier];
  const dreamCareer = kid.dream_career_id ? getCareer(kid.dream_career_id) : null;
  const stages = dreamCareer ? getStages(dreamCareer) : [];
  const currentIdx = dreamCareer ? currentStageIndex(dreamCareer, kid.total_xp) : 0;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6">
        <Link
          href="/parent"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={12} />
          Back to dashboard
        </Link>

        {/* Kid hero */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8"
        >
          <div className="flex items-center gap-5 flex-wrap">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold shadow-xl shadow-indigo-500/30">
                {(kid.username || "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-xl bg-amber-500 border-2 border-[#0a0a0f] flex items-center justify-center text-xs font-bold text-slate-900">
                {kid.current_level || 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs uppercase tracking-wider text-slate-500 mb-1">
                {tierCopy.emoji} {tierCopy.label} ·{" "}
                {kid.learner_grade ? gradeLabel(kid.learner_grade) : "no grade set"}
              </div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
                {kid.username || "Your kid"}
              </h1>
              <p className="text-sm text-slate-400">{tierCopy.tagline}</p>
            </div>
          </div>
        </motion.div>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          <Stat label="Level" value={kid.current_level || 1} icon={Star} accent="#a855f7" />
          <Stat
            label="Total XP"
            value={(kid.total_xp || 0).toLocaleString()}
            icon={Sparkles}
            accent="#6366f1"
          />
          <Stat
            label="Streak"
            value={`${kid.streak_count || 0}d`}
            icon={Flame}
            accent="#f59e0b"
          />
          <Stat
            label="Lessons"
            value={completedLessonIds.size}
            icon={BookOpen}
            accent="#10b981"
          />
        </motion.div>

        {/* Subject progress */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Subjects
          </h2>
          <div className="space-y-2">
            {subjectProgress.map(({ subject, total, done }) => {
              const pct = total ? Math.round((done / total) * 100) : 0;
              return (
                <div
                  key={subject.id}
                  className="flex items-center gap-3 p-3 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                >
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-lg`}
                    style={{ boxShadow: `0 6px 18px ${subject.accentColor}30` }}
                  >
                    {subject.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1 gap-2 flex-wrap">
                      <div className="text-sm font-semibold">{subject.title}</div>
                      <div className="text-[10px] text-slate-500 tabular-nums">
                        {done} / {total} lessons · {pct}%
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${subject.gradient} transition-all`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Dream career adventure */}
        {dreamCareer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative overflow-hidden rounded-3xl border border-rose-400/20 bg-gradient-to-br from-rose-500/[0.08] via-pink-500/[0.04] to-transparent p-5"
          >
            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${dreamCareer.gradient} flex items-center justify-center text-2xl`}
                style={{ boxShadow: `0 8px 24px ${dreamCareer.accentColor}40` }}
              >
                {dreamCareer.emoji}
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-rose-300 font-bold inline-flex items-center gap-1">
                  <Heart size={9} fill="currentColor" />
                  Dream career
                </div>
                <div className="text-base font-semibold">{dreamCareer.title}</div>
              </div>
            </div>
            <div className="text-xs text-slate-400 mb-3">
              {stages[currentIdx]?.emoji} Currently: <span className="text-white font-semibold">{stages[currentIdx]?.title}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {stages.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full ${
                    i <= currentIdx
                      ? `bg-gradient-to-r ${dreamCareer.gradient}`
                      : "bg-white/[0.06]"
                  }`}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Stat({
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
