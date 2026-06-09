"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Flame,
  Sparkles,
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

interface LessonEventPayload {
  lesson_id?: string;
  subject?: string;
  grade?: number;
  first_try_pct?: number;
  mastery_passed?: boolean;
  is_boss?: boolean;
  boss_cleared?: boolean;
  hints_used?: number;
  flawless?: boolean;
}

export default function KidDetailPage() {
  const params = useParams();
  const supabase = createClient();
  const kidId = (params?.kidId as string) || "";
  const [kid, setKid] = useState<Kid | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [eventPayloads, setEventPayloads] = useState<LessonEventPayload[]>([]);
  const [eventTimes, setEventTimes] = useState<{ subject?: string; at: number }[]>([]);
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
            .select("event_payload, created_at")
            .eq("user_id", kidId)
            .eq("event_type", "lesson_completed"),
        ]);
        setKid((kidData as Kid) || null);
        const rows = (events || []) as { event_payload?: LessonEventPayload; created_at?: string }[];
        const payloads = rows.map((e) => e?.event_payload).filter(Boolean) as LessonEventPayload[];
        setEventPayloads(payloads);
        setEventTimes(
          rows
            .filter((e) => e?.created_at)
            .map((e) => ({ subject: e.event_payload?.subject, at: Date.parse(e.created_at as string) }))
        );
        setCompletedLessonIds(
          new Set(payloads.map((p) => p.lesson_id).filter(Boolean) as string[])
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
      // Mastery score for this subject = mean first_try_pct across all
      // completed lessons of that subject. Null when no completions yet.
      const subjectEvents = eventPayloads.filter((p) => p.subject === s.id);
      const masteryAvg = subjectEvents.length
        ? Math.round(
            subjectEvents.reduce((sum, p) => sum + (p.first_try_pct ?? 0), 0) /
              subjectEvents.length
          )
        : null;
      const masteryWins = subjectEvents.filter((p) => p.mastery_passed).length;
      return { subject: s, total, done, masteryAvg, masteryWins };
    });
  }, [completedLessonIds, eventPayloads]);

  /** Strongest = highest masteryAvg with at least 2 completions. */
  const strongestSubject = useMemo(() => {
    const eligible = subjectProgress.filter(
      (sp) => sp.masteryAvg !== null && sp.done >= 2
    );
    if (!eligible.length) return null;
    return eligible.reduce((a, b) =>
      (a.masteryAvg ?? 0) >= (b.masteryAvg ?? 0) ? a : b
    );
  }, [subjectProgress]);

  /** Growth = picked subject with lowest masteryAvg (or 0 completions). */
  const growthSubject = useMemo(() => {
    const picked = kid?.learner_subjects || [];
    const inPicked = subjectProgress.filter(
      (sp) => picked.length === 0 || picked.includes(sp.subject.id)
    );
    if (!inPicked.length) return null;
    // Prefer a picked subject with the LOWEST mastery (real gap) over one
    // they've never tried (no signal yet). Tie-break by fewest completions.
    const withSignal = inPicked.filter((sp) => sp.masteryAvg !== null);
    if (withSignal.length) {
      return withSignal.reduce((a, b) =>
        (a.masteryAvg ?? 100) <= (b.masteryAvg ?? 100) ? a : b
      );
    }
    return inPicked.reduce((a, b) => (a.done <= b.done ? a : b));
  }, [subjectProgress, kid?.learner_subjects]);

  /** Recommended next action — single human-voice sentence for parents. */
  const recommendedNext = useMemo(() => {
    if (!kid) return null;
    const totalDone = completedLessonIds.size;
    if (totalDone === 0) {
      return {
        emoji: "🌱",
        title: "Help them start their first quest",
        detail:
          "Sit with them for 3 minutes. Cheer when they finish — first-lesson confidence sets the habit.",
      };
    }
    const recentEvents = eventPayloads.slice(-5);
    const recentMastery =
      recentEvents.length > 0
        ? recentEvents.reduce((sum, p) => sum + (p.first_try_pct ?? 0), 0) /
          recentEvents.length
        : 0;
    if (recentMastery < 60 && growthSubject) {
      return {
        emoji: "📖",
        title: `Review ${growthSubject.subject.title} together`,
        detail: `Recent first-try scores are around ${Math.round(recentMastery)}%. Replaying lessons builds mastery — not failure, just repetition.`,
      };
    }
    if ((kid.streak_count || 0) === 0 && totalDone > 0) {
      return {
        emoji: "🔥",
        title: "Bring back the streak",
        detail:
          "It's been a quiet day. One short lesson tonight keeps the daily habit alive.",
      };
    }
    if (!kid.dream_career_id) {
      return {
        emoji: "🧭",
        title: "Pick a Dream Guild",
        detail:
          "Choosing a dream career gives every lesson a 'why'. Ask: 'What do you want to be?'",
      };
    }
    if (strongestSubject) {
      return {
        emoji: "🏆",
        title: `Celebrate progress in ${strongestSubject.subject.title}`,
        detail: `Mastery average is ${strongestSubject.masteryAvg}% — tell them specifically what they're getting good at.`,
      };
    }
    return {
      emoji: "✨",
      title: "Keep the rhythm",
      detail: "Daily play + weekly celebration. That's the loop.",
    };
  }, [
    kid,
    completedLessonIds.size,
    eventPayloads,
    growthSubject,
    strongestSubject,
  ]);

  /** Boss crowns earned — surfaced as a parent-facing mastery signal. */
  const bossCrowns = useMemo(
    () => eventPayloads.filter((p) => p.boss_cleared).length,
    [eventPayloads]
  );

  /** Last-7-days activity: per-day lesson counts, active days, and the
   *  subjects practiced — the "is my kid actually doing this?" proof. */
  const weekly = useMemo(() => {
    const DAY = 86400000;
    const now = new Date();
    const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const labels = ["S", "M", "T", "W", "T", "F", "S"];
    const days = Array.from({ length: 7 }, (_, i) => {
      const dayStart = startToday - (6 - i) * DAY;
      return { dayStart, label: labels[new Date(dayStart).getDay()], count: 0 };
    });
    const windowStart = startToday - 6 * DAY;
    const subjectCounts: Record<string, number> = {};
    for (const e of eventTimes) {
      if (e.at < windowStart) continue;
      const idx = Math.floor((e.at - windowStart) / DAY);
      if (idx >= 0 && idx < 7) days[idx].count++;
      if (e.subject) subjectCounts[e.subject] = (subjectCounts[e.subject] ?? 0) + 1;
    }
    const total = days.reduce((s, d) => s + d.count, 0);
    const activeDays = days.filter((d) => d.count > 0).length;
    const max = Math.max(1, ...days.map((d) => d.count));
    const topSubjects = Object.entries(subjectCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => SUBJECTS.find((s) => s.id === id))
      .filter(Boolean) as typeof SUBJECTS;
    return { days, total, activeDays, max, topSubjects };
  }, [eventTimes]);

  /** Per-lesson mastery (first-try %) keyed by lesson id, for the learned list. */
  const masteryByLesson = useMemo(() => {
    const m = new Map<string, { pct: number | null; passed: boolean }>();
    for (const p of eventPayloads) {
      if (p.lesson_id) m.set(p.lesson_id, { pct: p.first_try_pct ?? null, passed: !!p.mastery_passed });
    }
    return m;
  }, [eventPayloads]);

  /** The actual lessons the kid has completed, grouped by subject — concrete
   *  proof of what they've learned, using real lesson titles (no fabrication). */
  const learnedBySubject = useMemo(() => {
    return SUBJECTS.map((s) => {
      const lessons = LESSONS.filter((l) => l.subject === s.id && completedLessonIds.has(l.id)).sort(
        (a, b) => a.grade - b.grade
      );
      return { subject: s, lessons };
    }).filter((g) => g.lessons.length > 0);
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
            label="Crowns"
            value={bossCrowns}
            icon={Trophy}
            accent="#fbbf24"
          />
        </motion.div>

        {/* This week — consistency at a glance */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.07 }}
          className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">This week</h2>
            <span className="text-[11px] text-slate-500">
              {weekly.activeDays}/7 active days · {weekly.total} lesson{weekly.total === 1 ? "" : "s"}
            </span>
          </div>

          {/* 7-day bars */}
          <div className="flex items-end justify-between gap-2 h-24">
            {weekly.days.map((d, i) => {
              const h = d.count > 0 ? Math.max(12, (d.count / weekly.max) * 100) : 4;
              const isToday = i === 6;
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-md transition-all"
                      style={{
                        height: `${h}%`,
                        background: d.count > 0
                          ? "linear-gradient(180deg,#6366f1,#4338ca)"
                          : "rgba(255,255,255,0.05)",
                        boxShadow: d.count > 0 ? "0 0 12px rgba(99,102,241,0.4)" : "none",
                      }}
                      title={`${d.count} lesson${d.count === 1 ? "" : "s"}`}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${isToday ? "text-indigo-300" : "text-slate-500"}`}>{d.label}</span>
                </div>
              );
            })}
          </div>

          {/* plain-language summary */}
          <p className="mt-4 text-sm text-slate-300 leading-relaxed">
            {weekly.total === 0 ? (
              <>No lessons in the last 7 days. A short session tonight restarts the habit.</>
            ) : (
              <>
                {kid.username || "Your kid"} practiced{" "}
                <span className="font-semibold text-white">{weekly.activeDays} day{weekly.activeDays === 1 ? "" : "s"}</span>{" "}
                this week
                {weekly.topSubjects.length > 0 && (
                  <> — mostly{" "}
                    {weekly.topSubjects.map((s, i) => (
                      <span key={s.id} className="font-semibold text-white">
                        {i > 0 ? ", " : ""}{s.emoji} {s.title}
                      </span>
                    ))}
                  </>
                )}
                {(kid.streak_count || 0) > 0 && (
                  <> — and is on a <span className="font-semibold text-amber-300">{kid.streak_count}-day streak</span></>
                )}
                .
              </>
            )}
          </p>
        </motion.div>

        {/* Recommended next action — the most actionable card for a parent. */}
        {recommendedNext && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.07 }}
            className="relative overflow-hidden rounded-3xl border border-indigo-400/25 bg-gradient-to-br from-indigo-500/[0.10] via-purple-500/[0.05] to-transparent p-5"
          >
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-25 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)",
              }}
            />
            <div className="relative flex items-start gap-3.5">
              <div className="text-3xl flex-shrink-0">{recommendedNext.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-bold mb-1">
                  Recommended next
                </div>
                <div className="text-base sm:text-lg font-semibold tracking-tight mb-1 leading-tight">
                  {recommendedNext.title}
                </div>
                <div className="text-xs text-slate-300 leading-relaxed">
                  {recommendedNext.detail}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Strongest + Growth — narrative parent-friendly summary */}
        {(strongestSubject || growthSubject) && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.09 }}
            className="grid sm:grid-cols-2 gap-3"
          >
            {strongestSubject && (
              <div className="rounded-2xl border border-emerald-400/25 bg-gradient-to-br from-emerald-500/[0.08] to-transparent p-4">
                <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-1 inline-flex items-center gap-1.5">
                  <span>💪</span> Strongest subject
                </div>
                <div className="flex items-center gap-2.5 mt-2">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${strongestSubject.subject.gradient} flex items-center justify-center text-lg`}
                  >
                    {strongestSubject.subject.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {strongestSubject.subject.title}
                    </div>
                    <div className="text-[11px] text-emerald-300 font-semibold tabular-nums">
                      {strongestSubject.masteryAvg}% first-try mastery
                    </div>
                  </div>
                </div>
              </div>
            )}
            {growthSubject && growthSubject !== strongestSubject && (
              <div className="rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-4">
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1 inline-flex items-center gap-1.5">
                  <span>🌱</span> Growth opportunity
                </div>
                <div className="flex items-center gap-2.5 mt-2">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-br ${growthSubject.subject.gradient} flex items-center justify-center text-lg`}
                  >
                    {growthSubject.subject.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold truncate">
                      {growthSubject.subject.title}
                    </div>
                    <div className="text-[11px] text-amber-300 font-semibold tabular-nums">
                      {growthSubject.masteryAvg !== null
                        ? `${growthSubject.masteryAvg}% — replay helps`
                        : "Not started yet"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

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
            {subjectProgress.map(({ subject, total, done, masteryAvg, masteryWins }) => {
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
                        {done} / {total} · {pct}%
                        {masteryAvg !== null && (
                          <span className="ml-1.5 text-emerald-300/80">
                            · {masteryAvg}% mastery
                          </span>
                        )}
                        {masteryWins > 0 && (
                          <span className="ml-1.5 text-amber-300/80">
                            · {masteryWins} 🏆
                          </span>
                        )}
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

        {/* What they've learned — concrete lesson record by subject */}
        {learnedBySubject.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
            className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-5 sm:p-6"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                What {kid.username || "they"} has learned
              </h2>
              <span className="text-[11px] text-slate-500">{completedLessonIds.size} lessons</span>
            </div>
            <p className="mb-4 text-[11px] text-slate-500">
              Real lessons completed, by subject. Each is aligned to the K–10 curriculum.
            </p>
            <div className="space-y-5">
              {learnedBySubject.map(({ subject, lessons }) => (
                <div key={subject.id}>
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br ${subject.gradient} text-sm`}
                    >
                      {subject.emoji}
                    </span>
                    <span className="text-sm font-semibold text-white">{subject.title}</span>
                    <span className="text-[11px] text-slate-500">· {lessons.length} done</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {lessons.map((l) => {
                      const m = masteryByLesson.get(l.id);
                      const strong = m?.pct != null && m.pct >= 80;
                      return (
                        <span
                          key={l.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[11px]"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            borderColor: strong ? "rgba(52,211,153,0.35)" : "rgba(255,255,255,0.08)",
                          }}
                          title={l.melcCode ? `DepEd competency ${l.melcCode}` : l.description}
                        >
                          <span className="text-slate-200">{l.title}</span>
                          <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                            G{l.grade}
                          </span>
                          {m?.pct != null && (
                            <span
                              className="font-bold tabular-nums"
                              style={{ color: strong ? "#6ee7b7" : "#94a3b8" }}
                            >
                              {m.pct}%
                            </span>
                          )}
                          {l.melcCode && (
                            <span className="rounded bg-indigo-500/15 px-1 text-[8px] font-bold text-indigo-300">
                              MELC
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

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
