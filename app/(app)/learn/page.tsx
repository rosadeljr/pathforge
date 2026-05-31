"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { getAvatarClass } from "@/lib/data/avatar-classes";
import { REALMS } from "@/lib/data/realms";
import { guildForCareer, currentRank } from "@/lib/data/guilds";
import { todaysSalita } from "@/lib/data/salita-ng-araw";
import {
  todaysQuests,
  progressForQuest,
  type Quest,
  type TodayStats,
} from "@/lib/data/daily-quests";
import { PageShimmer } from "@/components/ui/Shimmer";
import { ForgeBotCompanion } from "@/components/learn/ForgeBotCompanion";

interface LearnerProfile {
  username: string | null;
  learner_grade: number | null;
  learner_subjects: string[] | null;
  learner_avatar_class?: string | null;
  current_level: number;
  total_xp: number;
  streak_count: number;
  longest_streak: number;
  dream_career_id: string | null;
}

interface CompletionEvent {
  lesson_id: string;
  ts: string;
  /** Latest mastery_passed flag for that lesson (newest occurrence wins). */
  mastery_passed?: boolean;
  /** First-try-correct %, used for review queue copy. */
  first_try_pct?: number;
}

interface ReviewNeededEvent {
  lesson_id: string;
  ts: string;
  first_try_pct?: number;
}

/**
 * Learner home — kid-mode dashboard. Bright, friendly, subject-first.
 * Surfaces a daily mission, a resume card, and a daily XP goal so kids
 * always know what to do next.
 */
export default function LearnPage() {
  const [profile, setProfile] = useState<LearnerProfile | null>(null);
  const [completions, setCompletions] = useState<CompletionEvent[]>([]);
  const [reviewNeeded, setReviewNeeded] = useState<ReviewNeededEvent[]>([]);
  const [todayXp, setTodayXp] = useState(0);
  const [todayLessonEvents, setTodayLessonEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

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

        // Profile fields include learner_avatar_class which may not exist
        // until AVATAR_CLASS_MIGRATION has been applied. Try with it first;
        // if the column is missing, fall back to the legacy select so the
        // page still works pre-migration.
        const profileFields =
          "username, learner_grade, learner_subjects, current_level, total_xp, streak_count, longest_streak, dream_career_id";
        const [
          profPrimary,
          { data: events },
          { data: todayEvents },
          { data: reviewEvents },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select(`${profileFields}, learner_avatar_class`)
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
          supabase
            .from("analytics_events")
            .select("event_payload, created_at")
            .eq("user_id", uid)
            .eq("event_type", "mastery_review_needed")
            .order("created_at", { ascending: false })
            .limit(25),
        ]);

        let prof: Record<string, unknown> | null = profPrimary.data as
          | Record<string, unknown>
          | null;
        if (profPrimary.error) {
          const fallback = await supabase
            .from("profiles")
            .select(profileFields)
            .eq("id", uid)
            .maybeSingle();
          prof = fallback.data as Record<string, unknown> | null;
        }

        // ── Broken-state guard ──
        // If the user has a session but no profile row OR no learner_grade
        // set, they never finished onboarding (typical for Google sign-ins
        // where the OAuth provider created the auth user but the kid
        // closed the tab before setup, or migrated accounts pre-fix).
        // Send them to setup so the rest of the app has the data it needs.
        const learnerGrade = (prof as { learner_grade?: number | null } | null)
          ?.learner_grade;
        if (!prof || learnerGrade == null) {
          router.replace("/learn/setup");
          return;
        }

        if (prof) setProfile(prof as unknown as LearnerProfile);
        setCompletions(
          (events || [])
            .map((e: any) => ({
              lesson_id: e?.event_payload?.lesson_id,
              ts: e?.created_at,
              mastery_passed: e?.event_payload?.mastery_passed,
              first_try_pct: e?.event_payload?.first_try_pct,
            }))
            .filter((c: any) => c.lesson_id)
        );
        setReviewNeeded(
          (reviewEvents || [])
            .map((e: any) => ({
              lesson_id: e?.event_payload?.lesson_id,
              ts: e?.created_at,
              first_try_pct: e?.event_payload?.first_try_pct,
            }))
            .filter((r: any) => r.lesson_id)
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

  // Spaced review queue — surfaces up to 3 lessons that need another pass.
  // A lesson stays in the queue ONLY if there's a mastery_review_needed
  // event AND no subsequent mastery_passed lesson_completed for the same
  // lesson. Newest mastery_review_needed wins (dedupe by lesson_id).
  const reviewQueue = useMemo(() => {
    if (!reviewNeeded.length) return [] as { lesson: Lesson; firstTryPct: number }[];
    // Build map of latest mastery_passed timestamp per lesson_id.
    const lastPassedAt = new Map<string, number>();
    for (const c of completions) {
      if (c.mastery_passed) {
        const t = new Date(c.ts).getTime();
        if (t > (lastPassedAt.get(c.lesson_id) || 0)) {
          lastPassedAt.set(c.lesson_id, t);
        }
      }
    }
    // Dedupe review events by lesson_id (keep newest).
    const seen = new Set<string>();
    const out: { lesson: Lesson; firstTryPct: number }[] = [];
    for (const r of reviewNeeded) {
      if (seen.has(r.lesson_id)) continue;
      seen.add(r.lesson_id);
      const reviewedAt = new Date(r.ts).getTime();
      // If kid already re-passed it after this review event, skip.
      if ((lastPassedAt.get(r.lesson_id) || 0) >= reviewedAt) continue;
      const lesson = LESSONS.find((l) => l.id === r.lesson_id);
      if (!lesson) continue;
      out.push({ lesson, firstTryPct: r.first_try_pct ?? 0 });
      if (out.length >= 3) break;
    }
    return out;
  }, [reviewNeeded, completions]);

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

  // ── All hooks must come BEFORE any early returns (Rules of Hooks) ──
  // Daily Quests — rotate by date, compute progress from today's events.
  // These useMemo calls must run on every render even when still loading,
  // otherwise React throws "Rendered more hooks than during the previous
  // render" the instant `loading` flips to false.
  const dailyGoalForHooks =
    (tier === "little" ? 100 : tier === "junior" ? 200 : 300);
  const goalHitForHooks = todayXp >= dailyGoalForHooks;
  const quests = useMemo(() => todaysQuests(), []);
  const salita = useMemo(() => todaysSalita(), []);
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
      dailyGoalHit: goalHitForHooks,
      streakKept: todayLessonEvents.length > 0,
    };
  }, [todayXp, todayLessonEvents, goalHitForHooks]);

  if (loading) return <PageShimmer />;

  const name = profile?.username || "friend";
  const streak = profile?.streak_count || 0;
  const totalXp = profile?.total_xp || 0;
  const level = profile?.current_level || 1;
  const tierCopy = TIER_COPY[tier];
  const heading = tierGreeting(tier, name);

  const dreamCareer = profile?.dream_career_id ? getCareer(profile.dream_career_id) : null;
  const unlockedCareers = CAREERS.filter((c) => isCareerUnlocked(c, totalXp)).length;
  const avatarClass = getAvatarClass(profile?.learner_avatar_class);

  // Daily XP goal scales by tier — kids get smaller wins, teens earn more per lesson
  const dailyGoal = dailyGoalForHooks;
  const goalPct = Math.min((todayXp / dailyGoal) * 100, 100);
  const goalHit = goalHitForHooks;

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
            {avatarClass && (
              <>
                <span className="text-slate-600">·</span>
                <span
                  className="inline-flex items-center gap-1 font-medium"
                  style={{ color: avatarClass.accent }}
                  title={avatarClass.vibe}
                >
                  <span>{avatarClass.emoji}</span>
                  {avatarClass.name}
                </span>
              </>
            )}
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {heading}
          </h1>
          <p className="text-sm text-slate-400 mt-1">{tierCopy.tagline}</p>
        </motion.div>

        {/* ─── FIRST-QUEST HERO ───
            Only when the kid has 0 completions. It's the single most
            important card on the page during the first session — the
            "first 3 minutes" CTA. Bigger than the daily goal, anchored
            at the top so the eye lands here immediately after the
            greeting. Hidden as soon as they complete their first lesson. */}
        {completions.length === 0 && todaysMission && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.05 }}
          >
            <Link
              href={`/learn/${todaysMission.subject}/${todaysMission.id}`}
              className="group relative overflow-hidden block rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/[0.18] via-orange-500/[0.10] to-transparent p-5 sm:p-6 hover:border-amber-400/80 transition-all"
            >
              <motion.div
                animate={{
                  background: [
                    "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.5), transparent 70%)",
                    "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.75), transparent 70%)",
                    "radial-gradient(circle at 80% 20%, rgba(245,158,11,0.5), transparent 70%)",
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute inset-0 opacity-40 pointer-events-none"
              />
              <div className="relative flex items-center gap-4 sm:gap-5">
                <motion.div
                  animate={{ rotate: [0, -6, 6, 0], scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex-shrink-0 text-5xl sm:text-6xl"
                >
                  {todaysMission.emoji}
                </motion.div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1 inline-flex items-center gap-1.5">
                    <motion.span
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full bg-amber-400"
                    />
                    Your first quest
                  </div>
                  <div className="text-lg sm:text-2xl font-bold tracking-tight leading-tight mb-1">
                    {todaysMission.title}
                  </div>
                  <div className="text-xs sm:text-sm text-amber-100/90 leading-relaxed mb-2 line-clamp-2">
                    {todaysMission.description}
                  </div>
                  <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40 font-semibold">
                      <Sparkles size={11} />
                      +{todaysMission.xpReward} XP
                    </span>
                    <span className="text-amber-100/70">
                      ~{todaysMission.questions.length * 0.5 | 0}–{todaysMission.questions.length} min
                    </span>
                  </div>
                </div>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="hidden sm:flex flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 items-center justify-center shadow-xl shadow-amber-500/40 group-hover:scale-110 transition-transform"
                >
                  <ArrowRight size={20} className="text-white" />
                </motion.div>
              </div>
            </Link>
            <p className="text-[11px] text-slate-500 text-center mt-2 italic">
              Tap to start your first quest — earn your first XP in under 3 minutes.
            </p>
          </motion.div>
        )}

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

        {/* ── REVIEW QUEUE ── lessons where first-try-mastery missed
            the threshold AND haven't been re-passed since. Soft, kid-safe
            framing ("Polish these skills") to avoid feeling like failure. */}
        {reviewQueue.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.11 }}
          >
            <div className="flex items-baseline justify-between mb-3 flex-wrap gap-2">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider inline-flex items-center gap-1.5">
                <span>📖</span>
                {tier === "little" ? "Practice again" : "Polish these skills"}
              </h2>
              <span className="text-xs text-slate-500">
                {reviewQueue.length} lesson{reviewQueue.length > 1 ? "s" : ""} to lock in
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {reviewQueue.map(({ lesson, firstTryPct }, i) => (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.12 + i * 0.05 }}
                >
                  <Link
                    href={`/learn/${lesson.subject}/${lesson.id}`}
                    className="group relative overflow-hidden block rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.08] to-transparent p-3.5 hover:border-amber-400/50 transition-all h-full"
                  >
                    <div
                      className="absolute -top-10 -right-10 w-28 h-28 rounded-full opacity-25 pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(circle, rgba(245,158,11,0.55), transparent 70%)",
                      }}
                    />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="text-2xl">{lesson.emoji}</div>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-500/40">
                          {firstTryPct}% first try
                        </span>
                      </div>
                      <div className="text-xs font-bold tracking-tight mb-0.5 line-clamp-2">
                        {lesson.title}
                      </div>
                      <div className="text-[10px] text-amber-200/80 mt-1.5 inline-flex items-center gap-1 group-hover:text-amber-100 transition-colors">
                        Replay to lock it in
                        <ArrowRight
                          size={10}
                          className="group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Salita ng Araw — a daily Filipino culture nugget. Stays the same
            for the whole UTC day so every kid sees the same word. */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.13 }}
          className="relative overflow-hidden rounded-2xl border border-amber-400/20 bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent p-4"
        >
          <div
            className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(245,158,11,0.55), transparent 70%)",
            }}
          />
          <div className="relative flex items-start gap-3">
            <div className="flex-shrink-0 text-3xl">{salita.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1 inline-flex items-center gap-2">
                <span>🇵🇭</span>
                <span>
                  {salita.category === "salita"
                    ? "Salita ng Araw"
                    : salita.category === "bayani"
                    ? "Bayani ng Araw"
                    : "Kultura ng Araw"}
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold tracking-tight">
                {salita.word}
              </div>
              <div className="text-xs text-slate-300 leading-relaxed mt-0.5">
                {salita.meaning}
              </div>
              {salita.example && (
                <div className="text-[11px] text-amber-100/80 italic mt-1.5 leading-relaxed">
                  {salita.example}
                </div>
              )}
            </div>
          </div>
        </motion.div>

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
                      Your Guild
                    </>
                  ) : (
                    <>
                      <Compass size={10} />
                      Guild Hall
                    </>
                  )}
                </div>
                <div className="text-base sm:text-lg font-semibold tracking-tight leading-tight">
                  {(() => {
                    if (!dreamCareer) {
                      return tier === "little"
                        ? "What do you want to be?"
                        : tier === "junior"
                        ? "Pledge to a Guild"
                        : "Choose a Guild path";
                    }
                    const guild = guildForCareer(dreamCareer.id);
                    if (guild) {
                      const { rank } = currentRank(guild, totalXp);
                      return `${rank.emoji} ${rank.title}`;
                    }
                    return `Future ${dreamCareer.title} 🌟`;
                  })()}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  {(() => {
                    if (!dreamCareer) {
                      return `${unlockedCareers}/${CAREERS.length} guilds discovered · learn to unlock more`;
                    }
                    const guild = guildForCareer(dreamCareer.id);
                    return guild
                      ? `${guild.name} — ${dreamCareer.oneLiner}`
                      : dreamCareer.oneLiner;
                  })()}
                </div>
              </div>
              <ArrowRight
                size={16}
                className="text-rose-300 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
              />
            </div>
          </Link>
        </motion.div>

        {/* Subjects — framed as Knowledge Realms */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
              {tier === "little" ? "Pick a realm to explore" : "Knowledge Realms"}
            </h2>
            <span className="text-xs text-slate-500">
              {grade ? `Grade ${grade} content highlighted` : "Set your grade in Settings"}
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

      {/* Floating ForgeBot — companion-style entry to the AI tutor */}
      <ForgeBotCompanion />
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
          {(() => {
            const realm = REALMS.find((r) => r.subjectId === subject.id);
            return (
              <>
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <h3 className="text-base font-semibold tracking-tight">
                    {realm ? realm.name : subject.title}
                  </h3>
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
                {realm && (
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-2">
                    {subject.title} · Guardian {realm.guardian}
                  </div>
                )}
                <p className="text-xs text-slate-400 leading-relaxed mb-3 line-clamp-2">
                  {realm ? realm.tagline : subject.description}
                </p>
              </>
            );
          })()}
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
