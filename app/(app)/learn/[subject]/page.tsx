"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { getSubject, type SubjectId } from "@/lib/data/learner";
import {
  getLessonsBySubject,
  lessonIsBoss,
  type Lesson,
} from "@/lib/data/learner-lessons";
import { realmForSubject, regionForGrade } from "@/lib/data/realms";
import { PageShimmer } from "@/components/ui/Shimmer";

export default function SubjectLessonsPage() {
  const params = useParams();
  const supabase = createClient();
  const subjectId = (params?.subject as string) || "";
  const subject = getSubject(subjectId);

  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [userGrade, setUserGrade] = useState<number | null>(null);
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
        const [{ data: events }, { data: profile }] = await Promise.all([
          supabase
            .from("analytics_events")
            .select("event_payload")
            .eq("user_id", session.user.id)
            .eq("event_type", "lesson_completed"),
          supabase
            .from("profiles")
            .select("learner_grade")
            .eq("id", session.user.id)
            .maybeSingle(),
        ]);
        const done = new Set<string>(
          (events || [])
            .map((e: any) => e?.event_payload?.lesson_id)
            .filter(Boolean)
        );
        setCompletedIds(done);
        setUserGrade(profile?.learner_grade ?? null);
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

  const allLessons = getLessonsBySubject(subject.id as SubjectId);
  // Group by grade. If we know the learner's grade, surface their grade
  // first, then nearby grades (above + below) as "explore further".
  const lessonsByGrade = allLessons.reduce<Record<number, Lesson[]>>((acc, l) => {
    (acc[l.grade] ||= []).push(l);
    return acc;
  }, {});
  const gradesPresent = Object.keys(lessonsByGrade)
    .map((g) => parseInt(g))
    .sort((a, b) => a - b);
  // Order: user's grade first, then adjacent grades expanding outward.
  const orderedGrades = userGrade
    ? gradesPresent.slice().sort((a, b) => Math.abs(a - userGrade) - Math.abs(b - userGrade))
    : gradesPresent;

  const lessons = allLessons; // all of them, just grouped below
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

          {/* RPG Realm banner — frames the subject as a knowledge realm */}
          {(() => {
            const realm = realmForSubject(subject.id as SubjectId);
            if (!realm) return null;
            const region = regionForGrade(realm, userGrade);
            return (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.08 }}
                className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] via-white/[0.02] to-transparent p-4 mt-4"
              >
                <div
                  className="absolute -top-12 -right-12 w-40 h-40 rounded-full opacity-25 pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${realm.accentColor}, transparent 70%)`,
                  }}
                />
                <div className="relative flex items-center gap-3">
                  <div className="text-3xl flex-shrink-0">{realm.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
                      Realm · Guardian {realm.guardian}
                    </div>
                    <div className="text-sm font-semibold">
                      {realm.name}
                      {region && (
                        <span className="text-slate-400 font-normal">
                          {" "}
                          → {region.emoji} {region.name}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 italic">
                      {realm.tagline}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })()}
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

        {/* Lessons — grouped by grade so a 1st grader doesn't see calculus */}
        {lessons.length === 0 ? (
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-12 text-center">
            <p className="text-sm text-slate-400">
              First lessons for this subject are coming soon.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {orderedGrades.map((g, gi) => {
              const gradeLessons = lessonsByGrade[g] || [];
              const isUserGrade = userGrade === g;
              return (
                <motion.div
                  key={g}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.05 + gi * 0.04 }}
                >
                  <div className="flex items-baseline justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
                        Grade {g}
                      </h2>
                      {isUserGrade && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          Your grade
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">
                      {gradeLessons.filter((l) => completedIds.has(l.id)).length}/{gradeLessons.length} done
                    </span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {gradeLessons.map((lesson, i) => (
                      <LessonCard
                        key={lesson.id}
                        lesson={lesson}
                        subjectId={subject.id as SubjectId}
                        isDone={completedIds.has(lesson.id)}
                        index={i}
                      />
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
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
  const isBoss = lessonIsBoss(lesson);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.04 }}
    >
      <Link
        href={`/learn/${subjectId}/${lesson.id}`}
        className={`group relative overflow-hidden block rounded-2xl border p-5 transition-all ${
          isBoss
            ? "border-amber-400/40 bg-gradient-to-br from-amber-500/[0.10] via-orange-500/[0.04] to-transparent hover:border-amber-400/60"
            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
        }`}
      >
        {isBoss && (
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(245,158,11,0.55), transparent 70%)",
            }}
          />
        )}
        <div className="relative">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="text-3xl">{isBoss ? "⚔️" : lesson.emoji}</div>
            <div className="flex items-center gap-1.5">
              {isBoss && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/40">
                  ⚡ Boss
                </span>
              )}
              {isDone && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Check size={10} strokeWidth={3} />
                  Done
                </span>
              )}
            </div>
          </div>
          <h3 className="text-base font-semibold tracking-tight mb-1">
            {isBoss ? `Boss · ${lesson.title}` : lesson.title}
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {isBoss
              ? `Realm checkpoint. Prove mastery to clear ${lesson.title.toLowerCase()}.`
              : lesson.description}
          </p>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-slate-400">
              <Sparkles size={11} />
              {lesson.questions.length} questions
            </span>
            <span
              className={`inline-flex items-center gap-1 font-semibold ${
                isBoss ? "text-amber-300" : "text-indigo-300"
              }`}
            >
              <Zap size={11} />+{isBoss ? Math.round(lesson.xpReward * 1.5) : lesson.xpReward}{" "}
              XP
            </span>
            <ArrowRight
              size={12}
              className="ml-auto text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
