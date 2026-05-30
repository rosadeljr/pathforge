"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Flame,
  Star,
  Lock,
  ArrowRight,
  Zap,
  Target,
  PlayCircle,
  Compass,
  Heart,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  SUBJECTS,
  type Subject,
  ageTierForGrade,
  tierGreeting,
  TIER_COPY,
  type SubjectId,
} from "@/lib/data/learner";
import { LESSONS, type Lesson } from "@/lib/data/learner-lessons";
import { CAREERS, isCareerUnlocked, getCareer } from "@/lib/data/careers";
import {
  todaysQuests,
  progressForQuest,
  type Quest,
  type TodayStats,
} from "@/lib/data/daily-quests";
import { PageShimmer } from "@/components/ui/Shimmer";

interface LearnerProfile {
  username: string | null;
  learner_grade: number | null;
  learner_subjects: string[] | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  dream_career_id: string | null;
}

interface CompletionEvent {
  lesson_id: string;
  ts: string;
}

/**
 * Learner home — kid-mode dashboard. Bright, friendly, subject-first.
 * Surfaces a daily mission, a resume card, and a daily XP goal so kids
 * always know what to do next.
 */
export default function LearnPage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [completions, setCompletions] = useState<CompletionEvent[]>([]);
  const [todayXp, setTodayXp] = useState(0);
  const [todayLessonEvents, setTodayLessonEvents] = useState<any[]>([]);
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
        const uid = session.user.id;
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const [{ data: prof }, { data: events }, { data: todayEvents }] = await Promise.all([
          supabase
            .from("profiles")
            .select(
              "username, learner_grade, learner_subjects, current_level, total_xp, streak_count, longest_streak, dream_career_id"
            )
            .eq("id", uid)
            .maybeSingle(),
          supabase
            .from("analytics_events")
            .select("event_payload, created_at")
            .eq("user_id", uid)
            .eq("event_type", "lesson_completed")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("analytics_events")
            .select("xp_delta, event_type, event_payload")
            .eq("user_id", uid)
            .gte("created_at", startOfDay.toISOString()),
        ]);

        if (prof) setProfile(prof as LearnerProfile);
        setCompletions(
          (events || [])
            .map((e: any) => ({
              lesson_id: e?.event_payload?.lesson_id,
              ts: e?.created_at,
            }))
            .filter((c: any) => c.lesson_id)
        );
        setTodayXp(
          (todayEvents || []).reduce(
            (sum: number, e: any) => sum + (e?.xp_delta || 0),
            0
          )
        );
        setTodayLessonEvents(
          (todayEvents || []).filter((e: any) => e.event_type === "lesson_completed")
        );
      } catch (e) {
        console.error("Learn home load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  // ─── Derived state ─────────────────────────────────────────────
  const completedIds = useMemo(
    () => new Set(completions.map((c) => c.lesson_id)),
    [completions]
  );

  const grade = profile?.learner_grade ?? null;
  const tier = ageTierForGrade(grade);
  const picked = profile?.learner_subjects || [];

  // Today's mission: pick the first un-done lesson at the user's grade in a
  // picked subject. Falls back to grade-only, then to any unfinished lesson.
  const todaysMission = useMemo<Lesson | null>(() => {
    if (!grade) return null;
    const inGradeAndPicked = LESSONS.find(
      (l) =>
        l.grade === grade &&
        (picked.length === 0 || picked.includes(l.subject)) &&
        !completedIds.has(l.id)
    );
    if (inGradeAndPicked) return inGradeAndPicked;
    const inGrade = LESSONS.find(
      (l) => l.grade === grade && !completedIds.has(l.id)
    );
    if (inGrade) return inGrade;
    // Nothing left at their grade — suggest from adjacent grade
    const nearby = LESSONS.filter((l) => !completedIds.has(l.id)).sort(
      (a, b) => Math.abs(a.grade - grade) - Math.abs(b.grade - grade)
    );
    return nearby[0] || null;
  }, [grade, picked, completedIds]);

  // Resume: most recent lesson if it has more lessons in its subject left
  const resumeLesson = useMemo<Lesson | null>(() => {
    if (!completions.length) return null;
    const lastDoneId = completions[0]?.lesson_id;
    const last = LESSONS.find((l) => l.id === lastDoneId);
    if (!last) return null;
    // Find the next un-done lesson in same subject at same grade or close
    const next = LESSONS.find(
      (l) =>
        l.subject === last.subject &&
        !completedIds.has(l.id) &&
        l.id !== todaysMission?.id
    );
    return next || null;
  }, [completions, completedIds, todaysMission]);

  if (loading) return <PageShimmer />;

  const name = profile?.username || "friend";
  const streak = profile?.streak_count || 0;
  const totalXp = profile?.total_xp || 0;
  const level = profile?.current_level || 1;
  const tierCopy = TIER_COPY[tier];
  const heading = tierGreeting(tier, name);

  const dreamCareer = profile?.dream_career_id ? getCareer(profile.dream_career_id) : null;
  const unlockedCareers = CAREERS.filter((c) => isCareerUnlocked(c, totalXp)).length;

  // Daily XP goal scales by tier — kids get smaller wins, teens earn more per lesson
  const dailyGoal = tier === "little" ? 100 : tier === "junior" ? 200 : 300;
  const goalPct = Math.min((todayXp / dailyGoal) * 100, 100);
  const goalHit = todayXp >= dailyGoal;

  // Daily Quests — rotate by date, compute progress from today's events
  const quests = useMemo(() => todaysQuests(), []);
  const todayStats: TodayStats = useMemo(() => {
    const subjects = new Set<SubjectId>();
    let perfect = 0;
    for (const e of todayLessonEvents) {
      const p = e?.event_payload || {};
      if (p.subject) subjects.add(p.subject);
      if (p.score === p.total && p.flawless) perfect++;
    }
    return {
      xpToday: todayXp,
      lessonsToday: todayLessonEvents.length,
      subjectsToday: subjects,
      perfectLessonsToday: perfect,
      dailyGoalHit: goalHit,
      streakKept: todayLessonEvents.length > 0,
    };
  }, [todayXp, todayLessonEvents, goalHit]);

  // Highlight subjects the user picked; show the rest as discoverable.
  const pickedSet = new Set(picked);
  const orderedSubjects: Subject[] = [
    ...SUBJECTS.filter((s) => pickedSet.has(s.id)),
    ...SUBJECTS.filter((s) => !pickedSet.has(s.id)),
  ];

  // Subject progress map — how many lessons done per subject
  const subjectProgress: Record<SubjectId, { done: number; total: number }> = SUBJECTS.reduce(
    (acc, s) => {
      const subjectLessons = LESSONS.filter((l) => l.subject === s.id);
      acc[s.id] = {
        done: subjectLessons.filter((l) => completedIds.has(l.id)).length,
        total: subjectLessons.length,
      };
      return acc;
    },
    {} as Record<SubjectId, { done: number; total: number }>
  );

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-7">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-2 text-sm text-slate-400 mb-1 flex-wrap">
            <motion.span
              animate={tier === "little" ? { rotate: [0, -8, 8, 0] } : {}}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 4 }}
              className="inline-flex items-center gap-1.5"
            >
              <span className="text-base">{tierCopy.emoji}</span>
              <span className="text-white font-medium">{tierCopy.label}</span>
            </motion.span>
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
            {heading}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{tierCopy.tagline}</p>
        </motion.div>

        {/* Daily goal — the most important hook on this page */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/[0.08] via-purple-500/[0.04] to-transparent p-5"
        >
          <div
            className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-30 pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(99,102,241,0.6), transparent 70%)",
            }}
          />
          <div className="relative flex items-center gap-4">
            <motion.div
              animate={goalHit ? { rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.6, repeat: goalHit ? Infinity : 0, repeatDelay: 2 }}
              className={`flex-shrink-0 w-12 h-12 rounded-2xl ${
                goalHit
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                  : "bg-gradient-to-br from-indigo-500 to-purple-600"
              } flex items-center justify-center shadow-lg`}
            >
              <Target size={20} className="text-white" />
            </motion.div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between gap-2 mb-1 flex-wrap">
                <div className="text-sm font-semibold">
                  {goalHit
                    ? tier === "little"
                      ? "Daily goal SMASHED! 🎉"
                      : "Daily goal hit"
                    : "Today's XP goal"}
                </div>
                <div className="text-xs text-slate-400 tabular-nums">
                  <span className={goalHit ? "text-emerald-300 font-semibold" : "text-white"}>
                    {todayXp}
                  </span>
                  <span> / {dailyGoal} XP</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${goalPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className={`h-full ${
                    goalHit
                      ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                      : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                  }`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Daily Quests — rotate by date */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.06 }}
        >
          <div className="flex items-baseline justify-between mb-3">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              Daily quests
            </h2>
            <span className="text-xs text-slate-500">
              Refreshes every day · {quests.filter((q) => progressForQuest(q, todayStats).done).length}/3 done
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {quests.map((q, i) => {
              const prog = progressForQuest(q, todayStats);
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.08 + i * 0.04 }}
                  className={`relative overflow-hidden rounded-2xl border p-3.5 transition-all ${
                    prog.done
                      ? "border-emerald-400/40 bg-gradient-to-br from-emerald-500/[0.10] to-transparent"
                      : "border-white/[0.06] bg-white/[0.02]"
                  }`}
                >
                  <div
                    className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-25 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${q.accentColor}, transparent 70%)`,
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-1.5">
                      <div
                        className={`w-9 h-9 rounded-xl bg-gradient-to-br ${q.gradient} flex items-center justify-center text-lg shadow-lg`}
                        style={{ boxShadow: `0 6px 18px ${q.accentColor}30` }}
                      >
                        {q.emoji}
                      </div>
                      {prog.done ? (
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          ✓ Done
                        </span>
                      ) : (
                        <span className="text-[10px] text-indigo-300 font-semibold">
                          +{q.xpReward} XP
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-bold tracking-tight mb-0.5">{q.title}</div>
                    <div className="text-[10px] text-slate-400 leading-snug mb-2 line-clamp-2">
                      {q.description}
                    </div>
                    <div className="flex items-center justify-between text-[10px] tabular-nums mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className={prog.done ? "text-emerald-300 font-semibold" : "text-slate-300"}>
                        {prog.current} / {prog.target}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prog.pct}%` }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className={
                          prog.done
                            ? "h-full bg-gradient-to-r from-emerald-400 to-teal-500"
                            : `h-full bg-gradient-to-r ${q.gradient}`
                        }
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="grid grid-cols-3 gap-3"
        >
          <StatCard label="Level" value={level} icon={Star} accent="#a855f7" />
          <StatCard label="Total XP" value={totalXp.toLocaleString()} icon={Sparkles} accent="#6366f1" />
          <StatCard label="Streak" value={`${streak}d`} icon={Flame} accent="#f59e0b" />
        </motion.div>

        {/* Today's mission + Resume — the most actionable cards */}
        {(todaysMission || resumeLesson) && (
          <div className="grid sm:grid-cols-2 gap-3">
            {todaysMission && (
              <MissionCard
                lesson={todaysMission}
                title={tier === "little" ? "Today's quest" : "Today's mission"}
                accent="indigo"
                tier={tier}
                delay={0.1}
              />
            )}
            {resumeLesson && (
              <MissionCard
                lesson={resumeLesson}
                title="Pick up where you left off"
                accent="amber"
                tier={tier}
                delay={0.12}
                subtle
              />
            )}
          </div>
        )}

        {/* Career spotlight — show dream career progress OR encourage exploring */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.14 }}
        >
          <Link
            href={dreamCareer ? `/learn/careers/${dreamCareer.id}` : "/learn/careers"}
            className="group relative overflow-hidden block rounded-3xl border border-rose-400/20 bg-gradient-to-br from-rose-500/[0.08] via-pink-500/[0.04] to-transparent p-5 hover:border-rose-400/40 transition-all"
          >
            <div
              className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"
              style={{
                background: dreamCareer
                  ? `radial-gradient(circle, ${dreamCareer.accentColor}80, transparent 70%)`
                  : "radial-gradient(circle, rgba(244,63,94,0.5), transparent 70%)",
              }}
            />
            {/* Floating emoji decoration */}
            <motion.div
              animate={{ y: [0, -6, 0], rotate: [0, -8, 8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-6 right-8 text-xl opacity-50"
            >
              ✨
            </motion.div>
            <div className="relative flex items-center gap-4">
              {dreamCareer ? (
                <motion.div
                  animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br ${dreamCareer.gradient} flex items-center justify-center text-3xl shadow-xl`}
                  style={{
                    boxShadow: `0 10px 30px ${dreamCareer.accentColor}40`,
                  }}
                >
                  {dreamCareer.emoji}
                </motion.div>
              ) : (
                <motion.div
                  animate={{ rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-xl shadow-rose-500/30"
                >
                  <Compass size={22} className="text-white" />
                </motion.div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-rose-300 font-bold mb-0.5 inline-flex items-center gap-1">
                  {dreamCareer ? (
                    <>
                      <Heart size={9} fill="currentColor" />
                      Working toward
                    </>
                  ) : (
                    <>
                      <Compass size={10} />
                      Career explorer
                    </>
                  )}
                </div>
                <div className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
                  {dreamCareer
                    ? `Future ${dreamCareer.title} 🌟`
                    : tier === "little"
                    ? "What do you want to be?"
                    : tier === "junior"
                    ? "Discover dream careers"
                    : "Explore your future path"}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {dreamCareer
                    ? dreamCareer.oneLiner
                    : `${unlockedCareers}/${CAREERS.length} careers discovered · keep learning to unlock more`}
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-rose-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
              />
            </div>
          </Link>
        </motion.div>

        {/* Subjects */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              {tier === "little" ? "Pick a subject to play" : "Pick a subject"}
            </h2>
            <span className="text-xs text-slate-500">
              {grade ? `Grade ${grade} lessons highlighted` : "Set your grade in Settings"}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {orderedSubjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                isPicked={pickedSet.has(subject.id)}
                progress={subjectProgress[subject.id]}
              />
            ))}
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

function MissionCard({
  lesson,
  title,
  accent,
  tier,
  delay,
  subtle,
}: {
  lesson: Lesson;
  title: string;
  accent: "indigo" | "amber";
  tier: "little" | "junior" | "teen";
  delay: number;
  subtle?: boolean;
}) {
  const subject = SUBJECTS.find((s) => s.id === lesson.subject);
  const accentMap = {
    indigo: {
      bg: "from-indigo-500/[0.12] via-purple-500/[0.05]",
      border: "border-indigo-400/30",
      pill: "text-indigo-300 bg-indigo-500/15 border-indigo-500/30",
      icon: "from-indigo-500 to-purple-600",
      glow: "rgba(99,102,241,0.5)",
    },
    amber: {
      bg: "from-amber-500/[0.10] via-orange-500/[0.04]",
      border: "border-amber-400/30",
      pill: "text-amber-300 bg-amber-500/15 border-amber-500/30",
      icon: "from-amber-400 to-orange-500",
      glow: "rgba(245,158,11,0.5)",
    },
  }[accent];
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={`/learn/${lesson.subject}/${lesson.id}`}
        className={`group relative overflow-hidden block rounded-3xl border ${accentMap.border} bg-gradient-to-br ${accentMap.bg} to-transparent p-5 transition-all hover:shadow-xl`}
        style={{ boxShadow: `0 8px 28px ${accentMap.glow}10` }}
      >
        <div
          className="absolute -top-16 -right-16 w-44 h-44 rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"
          style={{ background: `radial-gradient(circle, ${accentMap.glow}, transparent 70%)` }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${accentMap.pill}`}>
              {title}
            </span>
            {subject && (
              <span className="text-[10px] text-slate-400">
                {subject.title} · Grade {lesson.grade}
              </span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <motion.div
              animate={!subtle && tier === "little" ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1 }}
              className="text-3xl flex-shrink-0"
            >
              {lesson.emoji}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold tracking-tight mb-0.5 leading-tight">
                {lesson.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {lesson.description}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs">
              <span className="inline-flex items-center gap-1 text-indigo-300 font-semibold">
                <Zap size={11} />+{lesson.xpReward} XP
              </span>
              <span className="text-slate-500">
                {lesson.questions.length} questions
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:translate-x-0.5 transition-transform">
              <PlayCircle size={14} />
              {tier === "little" ? "Play" : "Start"}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

function SubjectCard({
  subject,
  isPicked,
  progress,
}: {
  subject: Subject;
  isPicked: boolean;
  progress?: { done: number; total: number };
}) {
  const disabled = !subject.available;
  const Wrapper: any = disabled ? "div" : Link;
  const wrapperProps = disabled ? {} : { href: `/learn/${subject.id}` };
  const pct = progress?.total ? Math.round((progress.done / progress.total) * 100) : 0;
  return (
    <motion.div whileHover={!disabled ? { y: -2 } : {}}>
      <Wrapper
        {...wrapperProps}
        className={`group relative overflow-hidden block rounded-2xl border p-5 transition-all ${
          disabled
            ? "border-white/[0.04] bg-white/[0.01] opacity-70 cursor-default"
            : isPicked
            ? "border-white/[0.16] bg-white/[0.04] hover:bg-white/[0.06] hover:border-white/[0.24]"
            : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12]"
        }`}
      >
        <div
          className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-40 transition-opacity"
          style={{ background: `radial-gradient(circle, ${subject.accentColor}, transparent 70%)` }}
        />
        <div className="relative">
          <motion.div
            whileHover={!disabled ? { rotate: [0, -6, 6, 0] } : {}}
            transition={{ duration: 0.5 }}
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${subject.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}
            style={{ boxShadow: `0 8px 24px ${subject.accentColor}30` }}
          >
            {subject.emoji}
          </motion.div>
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
          <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
            {subject.description}
          </p>
          {!disabled && progress && progress.total > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="text-slate-500 font-medium">Progress</span>
                <span className="text-slate-400 tabular-nums">
                  {progress.done}/{progress.total}
                </span>
              </div>
              <div className="h-1 rounded-full bg-white/[0.05] overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${subject.gradient} transition-all`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}
          {!disabled && (
            <div className="inline-flex items-center gap-1 text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
              Open
              <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          )}
        </div>
      </Wrapper>
    </motion.div>
  );
}
