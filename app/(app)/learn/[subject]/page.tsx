"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSubject, SUBJECTS, type SubjectId } from "@/lib/data/learner";
import {
  getLessonsBySubject,
  type Lesson,
} from "@/lib/data/learner-lessons";
import { PageShimmer } from "@/components/ui/Shimmer";

export default function SubjectLessonsPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const subjectId = (params?.subject as string) || "";
  const subject = getSubject(subjectId);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subject) {
      setLoading(false);
      return;
    }
    if (!subject.available) {
      setLoading(false);
      return;
    }
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const { data } = await supabase
          .from("analytics_events")
          .select("event_payload")
          .eq("user_id", session.user.id)
          .eq("event_type", "lesson_completed");
        const done = new Set<string>(
          (data || [])
            .map((e: any) => e?.event_payload?.lesson_id)
            .filter(Boolean)
        );
        setCompletedIds(done);
      } catch (e) {
        console.error("Subject lessons load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [subject, supabase]);

  if (loading) return <PageShimmer />;

  // Unknown subject id
  if (!subject) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Subject not found</h1>
        <Link href="/learn" className="text-sm text-indigo-300 hover:text-indigo-200">
          ← Back to subjects
        </Link>
      </div>
    );
  }

  // Subject exists but not available yet
  if (!subject.available) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] mb-5">
          <Lock size={20} className="text-slate-400" />
        </div>
        <h1 className="text-xl font-semibold mb-1">{subject.title} is on the way</h1>
        <p className="text-sm text-slate-400 mb-6">
          Lessons for this subject ship next. For now, try Math, English, or Filipino.
        </p>
        <Link
          href="/learn"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
        >
          ← Back to subjects
        </Link>
      </div>
    );
  }

  const lessons = getLessonsBySubject(subject.id as SubjectId);
  const doneCount = lessons.filter((l) => completedIds.has(l.id)).length;
  const totalXp = lessons.reduce((sum, l) => sum + l.xpReward, 0);
  const earnedXp = lessons
    .filter((l) => completedIds.has(l.id))
    .reduce((sum, l) => sum + l.xpReward, 0);

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-8">
        {/* Back + header */}
        <div>
          <Link
            href="/learn"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft size={12} />
            All subjects
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start gap-4 flex-wrap"
          >
            <div
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-2xl shadow-lg flex-shrink-0`}
              style={{ boxShadow: `0 8px 24px ${subject.accentColor}40` }}
            >
              {subject.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
                {subject.title}
              </h1>
              <p className="text-sm text-slate-400">{subject.description}</p>
            </div>
          </motion.div>
        </div>

        {/* Progress */}
        {lessons.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="grid grid-cols-3 gap-3"
          >
            <Stat label="Lessons" value={`${doneCount}/${lessons.length}`} accent={subject.accentColor} />
            <Stat
              label="XP earned"
              value={earnedXp.toLocaleString()}
              accent="#6366f1"
            />
            <Stat
              label="XP available"
              value={`+${(totalXp - earnedXp).toLocaleString()}`}
              accent="#f59e0b"
            />
          </motion.div>
        )}

        {/* Lessons */}
        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-sm text-slate-400">
              First lessons for this subject are coming soon.
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {lessons.map((lesson, i) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                subjectId={subject.id as SubjectId}
                isDone={completedIds.has(lesson.id)}
                index={i}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="relative overflow-hidden p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02]">
      <div
        className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full opacity-20"
        style={{ background: `radial-gradient(circle, ${accent}, transparent 70%)` }}
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
          {label}
        </div>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
      </div>
    </div>
  );
}

function LessonCard({
  lesson,
  subjectId,
  isDone,
  index,
}: {
  lesson: Lesson;
  subjectId: SubjectId;
  isDone: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.04 }}
    >
      <Link
        href={`/learn/${subjectId}/${lesson.id}`}
        className="group relative overflow-hidden block rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
      >
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="text-3xl">{lesson.emoji}</div>
          {isDone && (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              <Check size={10} strokeWidth={3} />
              Done
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold tracking-tight mb-1">
          {lesson.title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
          {lesson.description}
        </p>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1 text-slate-400">
            <Sparkles size={11} />
            {lesson.questions.length} questions
          </span>
          <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold">
            <Zap size={11} />+{lesson.xpReward} XP
          </span>
          <ArrowRight
            size={12}
            className="ml-auto text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
          />
        </div>
      </Link>
    </motion.div>
  );
}
