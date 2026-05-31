"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Trophy,
  RotateCcw,
  Lightbulb,
  Flame,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  getSubject,
  ageTierForGrade,
  pickRealWorldHook,
  type AgeTier,
} from "@/lib/data/learner";
import { getLesson, lessonIsBoss } from "@/lib/data/learner-lessons";
import {
  newlyMasteredCareers,
  generateCredentialCode,
} from "@/lib/certificates";
import { PageShimmer } from "@/components/ui/Shimmer";
import { LevelUpOverlay } from "@/components/learn/LevelUpOverlay";

type Phase = "loading" | "playing" | "done";

// ───────────────────────────────────────────────────────────────────
// Encouragement variety — picked randomly so it doesn't feel canned.
// Tone scales by age tier.
// ───────────────────────────────────────────────────────────────────
const CHEERS: Record<AgeTier, string[]> = {
  little: ["Yes! 🌟", "Woohoo!", "Nice one!", "You got it!", "Awesome!", "Way to go!", "Sulit!"],
  junior: ["Nailed it.", "Nice work.", "Correct!", "Sharp thinking.", "You got it.", "Yes — solid."],
  teen: ["Correct.", "Right.", "Good.", "Nice.", "Solid.", "On point."],
};

const ENCOURAGE: Record<AgeTier, string[]> = {
  little: ["Almost! Try the next one. 💪", "It's okay! Let's keep going.", "Good try! You're learning."],
  junior: ["Close — let's keep going.", "No worries, next one.", "Not quite — onward."],
  teen: ["Not this time.", "Moving on.", "Got it — next."],
};

const STREAK_HYPE: Record<AgeTier, Record<number, string>> = {
  little: { 3: "🔥 3 in a row!", 5: "🌟 5 streak! WOW!", 7: "💯 7 streak!" },
  junior: { 3: "🔥 3 in a row", 5: "🔥 5 streak", 7: "🔥 7 streak — unreal" },
  teen: { 3: "3 streak", 5: "5 streak", 7: "7 streak" },
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function LessonPlayerPage() {
  const params = useParams();
  const supabase = createClient();
  const subjectId = (params?.subject as string) || "";
  const lessonId = (params?.lessonId as string) || "";

  const subject = getSubject(subjectId);
  const lesson = getLesson(lessonId);

  const [phase, setPhase] = useState<Phase>("loading");
  const [tier, setTier] = useState<AgeTier>("junior");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [firstTryCorrect, setFirstTryCorrect] = useState<boolean[]>([]);
  const [persisting, setPersisting] = useState(false);
  const [streak, setStreak] = useState(0); // in-lesson consecutive correct
  const [bestStreak, setBestStreak] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const [usedHintOn, setUsedHintOn] = useState<Set<number>>(new Set());
  const [burst, setBurst] = useState<{ x: number; y: number; key: number } | null>(null);
  const [xpFloat, setXpFloat] = useState<{ key: number; amount: number } | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Load tier on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;
        const { data } = await supabase
          .from("profiles")
          .select("learner_grade")
          .eq("id", session.user.id)
          .maybeSingle();
        if (mounted) setTier(ageTierForGrade(data?.learner_grade ?? null));
      } catch {
        /* keep junior default */
      }
    })();
    return () => {
      mounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    if (!lesson || !subject || subject.id !== lesson.subject) {
      setPhase("loading");
    } else {
      setFirstTryCorrect(new Array(lesson.questions.length).fill(false));
      setPhase("playing");
    }
  }, [lesson, subject]);

  if (!lesson || !subject || subject.id !== lesson.subject) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2">Lesson not found</h1>
        <p className="text-sm text-slate-400 mb-5">
          Either the link is wrong or this lesson hasn't been built yet.
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

  if (phase === "loading") return <PageShimmer />;

  const total = lesson.questions.length;
  const correctCount = firstTryCorrect.filter(Boolean).length;
  const isLast = currentIdx === total - 1;
  const q = lesson.questions[currentIdx];
  // Stable real-world hook for this lesson (same on retry)
  const realWorld = pickRealWorldHook(lesson.subject, lesson.id);

  // Mascot mood reflects the moment
  const mascotMood = (() => {
    if (!revealed) return pickedIdx == null ? "neutral" : wrongCount > 0 ? "thinking" : "neutral";
    if (pickedIdx === correctIndexFor(q)) return streak >= 3 ? "fire" : "happy";
    return "encouraging";
  })();

  function triggerBurst(target: HTMLElement) {
    const rect = target.getBoundingClientRect();
    setBurst({
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
      key: Date.now(),
    });
    // Clear after animation
    setTimeout(() => setBurst(null), 1200);
  }

  /**
   * Resolve the correct answer index for the current question.
   * - MC: q.correctIndex.
   * - TF: 0 = "True", 1 = "False" (display order in the player).
   */
  function correctIndexFor(question: typeof q): number {
    if (question.kind === "tf") {
      return question.correctAnswer ? 0 : 1;
    }
    return question.correctIndex ?? 0;
  }

  function pick(i: number, e?: React.MouseEvent<HTMLButtonElement>) {
    if (revealed) return;
    setPickedIdx(i);
    if (i === correctIndexFor(q)) {
      const fresh = [...firstTryCorrect];
      fresh[currentIdx] = wrongCount === 0;
      setFirstTryCorrect(fresh);
      setRevealed(true);
      // Streak only counts first-try perfection
      if (wrongCount === 0) {
        const next = streak + 1;
        setStreak(next);
        setBestStreak(Math.max(bestStreak, next));
        if (e?.currentTarget) triggerBurst(e.currentTarget);
        setXpFloat({ key: Date.now(), amount: Math.round(lesson!.xpReward / total) });
        setTimeout(() => setXpFloat(null), 1100);
      } else {
        setStreak(0);
      }
      setFeedbackMsg(pickRandom(CHEERS[tier]));
    } else {
      if (wrongCount === 0) {
        setWrongCount(1);
        setStreak(0);
        setTimeout(() => setPickedIdx(null), 700);
      } else {
        setRevealed(true);
        setFeedbackMsg(pickRandom(ENCOURAGE[tier]));
      }
    }
  }

  function nextQuestion() {
    if (isLast) {
      finishLesson();
    } else {
      setCurrentIdx(currentIdx + 1);
      setPickedIdx(null);
      setWrongCount(0);
      setRevealed(false);
      setHintOpen(false);
    }
  }

  async function finishLesson() {
    setPhase("done");
    persistCompletion();
  }

  const [isFirstEver, setIsFirstEver] = useState(false);
  const [newCerts, setNewCerts] = useState<
    { career_id: string; career_title: string; credential_code: string }[]
  >([]);
  const [leveledUpTo, setLeveledUpTo] = useState<number | null>(null);

  async function persistCompletion() {
    setPersisting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const uid = session.user.id;

      // Detect if this is the user's FIRST lesson ever (for celebration)
      const { count: completedCount } = await supabase
        .from("analytics_events")
        .select("id", { count: "exact", head: true })
        .eq("user_id", uid)
        .eq("event_type", "lesson_completed");
      if ((completedCount ?? 0) === 0) {
        setIsFirstEver(true);
      }

      const { data: existing } = await supabase
        .from("analytics_events")
        .select("id")
        .eq("user_id", uid)
        .eq("event_type", "lesson_completed")
        .filter("event_payload->>lesson_id", "eq", lesson!.id)
        .limit(1);

      const alreadyDone = (existing?.length || 0) > 0;
      // First-time + perfect (no hints, no wrongs) earns a 25% bonus
      const isFlawless = correctCount === total && usedHintOn.size === 0;
      const baseXp = alreadyDone ? 0 : lesson!.xpReward;
      const bonusXp = !alreadyDone && isFlawless ? Math.round(lesson!.xpReward * 0.25) : 0;
      const awardXp = baseXp + bonusXp;

      // ── Mastery scoring ──
      // First-try-correct percent is the truest signal of mastery — beats
      // raw "score" because score counts retries. masteryThreshold defaults
      // to 0.8 if the lesson hasn't set one yet.
      const firstTryCount = firstTryCorrect.filter(Boolean).length;
      const firstTryPct = total > 0 ? firstTryCount / total : 0;
      const masteryThreshold = lesson!.masteryThreshold ?? 0.8;
      const masteryPassed = firstTryPct >= masteryThreshold;
      const isBossLesson = lessonIsBoss(lesson!);
      // A Boss is only "cleared" if mastery passes — not just completion.
      const bossCleared = isBossLesson && masteryPassed;

      await supabase.from("analytics_events").insert({
        user_id: uid,
        event_type: "lesson_completed",
        event_payload: {
          lesson_id: lesson!.id,
          subject: lesson!.subject,
          grade: lesson!.grade,
          competency: lesson!.competency ?? null,
          melc_code: lesson!.melcCode ?? null,
          score: correctCount,
          total,
          first_try_correct: firstTryCount,
          first_try_pct: Math.round(firstTryPct * 100),
          mastery_threshold_pct: Math.round(masteryThreshold * 100),
          mastery_passed: masteryPassed,
          hints_used: usedHintOn.size,
          best_streak: bestStreak,
          flawless: isFlawless,
          replay: alreadyDone,
          is_boss: isBossLesson,
          boss_cleared: bossCleared,
        },
        xp_delta: awardXp,
      });

      // ── Ad-funnel + mastery signals ──
      // first_lesson_complete fires once-ever (when there are no prior
      // completions); used as the activation event for ad attribution.
      if ((completedCount ?? 0) === 0) {
        await supabase.from("analytics_events").insert({
          user_id: uid,
          event_type: "first_lesson_complete",
          event_payload: {
            lesson_id: lesson!.id,
            subject: lesson!.subject,
            grade: lesson!.grade,
          },
          xp_delta: 0,
        });
      }
      if (bossCleared) {
        await supabase.from("analytics_events").insert({
          user_id: uid,
          event_type: "boss_cleared",
          event_payload: {
            lesson_id: lesson!.id,
            subject: lesson!.subject,
            first_try_pct: Math.round(firstTryPct * 100),
          },
          xp_delta: 0,
        });
      } else if (!masteryPassed && !alreadyDone) {
        // Signal to spaced-review / parent recs that this lesson needs
        // another pass. Not a "fail" — just a flag for follow-up.
        await supabase.from("analytics_events").insert({
          user_id: uid,
          event_type: "mastery_review_needed",
          event_payload: {
            lesson_id: lesson!.id,
            subject: lesson!.subject,
            competency: lesson!.competency ?? null,
            first_try_pct: Math.round(firstTryPct * 100),
          },
          xp_delta: 0,
        });
      }

      if (awardXp > 0) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("total_xp, current_xp, current_level, username, full_name")
          .eq("id", uid)
          .single();
        if (prof) {
          const oldLevel = prof.current_level || 1;
          const newTotalXp = (prof.total_xp || 0) + awardXp;
          // Compute level-up: each level requires (level * 1000) XP from current_xp.
          let currentXp = (prof.current_xp || 0) + awardXp;
          let newLevel = oldLevel;
          while (currentXp >= newLevel * 1000) {
            currentXp -= newLevel * 1000;
            newLevel++;
          }
          await supabase
            .from("profiles")
            .update({
              total_xp: newTotalXp,
              current_xp: currentXp,
              current_level: newLevel,
              last_quest_completed_at: new Date().toISOString(),
            })
            .eq("id", uid);
          if (newLevel > oldLevel) {
            setLeveledUpTo(newLevel);
          }

          // 🏆 Career mastery — auto-award certificates for any newly
          // mastered career (reached final stage at new total XP).
          try {
            const { data: existingCerts } = await supabase
              .from("career_certificates")
              .select("career_id")
              .eq("user_id", uid);
            const existingIds = (existingCerts || []).map(
              (c: any) => c.career_id
            );
            const newlyMastered = newlyMasteredCareers(newTotalXp, existingIds);
            if (newlyMastered.length > 0) {
              const recipientName =
                prof.full_name || prof.username || "Forger";
              const certRows = newlyMastered.map((c) => ({
                user_id: uid,
                career_id: c.id,
                credential_code: generateCredentialCode(c.id),
                recipient_name: recipientName,
                career_title: c.title,
                total_xp_at_award: newTotalXp,
              }));
              const { data: inserted } = await supabase
                .from("career_certificates")
                .insert(certRows)
                .select("career_id, credential_code, career_title");
              if (inserted && inserted.length > 0) {
                setNewCerts(
                  inserted.map((c: any) => ({
                    career_id: c.career_id,
                    career_title: c.career_title,
                    credential_code: c.credential_code,
                  }))
                );
              }
            }
          } catch (certErr) {
            console.warn("[lesson] cert award (non-fatal):", certErr);
          }
        }
      }
    } catch (e) {
      console.error("Lesson completion error:", e);
    } finally {
      setPersisting(false);
    }
  }

  function restart() {
    setCurrentIdx(0);
    setPickedIdx(null);
    setWrongCount(0);
    setRevealed(false);
    setFirstTryCorrect(new Array(total).fill(false));
    setStreak(0);
    setBestStreak(0);
    setUsedHintOn(new Set());
    setHintOpen(false);
    setPhase("playing");
  }

  function openHint() {
    setHintOpen(true);
    const next = new Set(usedHintOn);
    next.add(currentIdx);
    setUsedHintOn(next);
  }

  // ============ Done screen ============
  if (phase === "done") {
    const score = correctCount;
    const pct = Math.round((score / total) * 100);
    const isFlawless = score === total && usedHintOn.size === 0;
    // Mastery gate — see also persistCompletion(). Bosses ONLY count as
    // cleared when first-try-correct >= masteryThreshold (default 0.8).
    const masteryThresholdPct = Math.round((lesson.masteryThreshold ?? 0.8) * 100);
    const masteryPassed = pct >= masteryThresholdPct;
    const isBossLesson = lessonIsBoss(lesson);
    const tone = pct >= 80 ? "emerald" : pct >= 50 ? "amber" : "rose";
    const toneText: Record<string, string> = {
      emerald: "text-emerald-300",
      amber: "text-amber-300",
      rose: "text-rose-300",
    };
    const toneBg: Record<string, string> = {
      emerald: "from-emerald-500 to-green-600",
      amber: "from-amber-500 to-orange-600",
      rose: "from-rose-500 to-pink-600",
    };
    const headline =
      pct === 100 && tier === "little"
        ? "PERFECT! 🌟🎉"
        : pct === 100
        ? "Perfect run!"
        : pct >= 80
        ? "Great work!"
        : pct >= 50
        ? "Good job!"
        : "Lesson done!";
    const bonusXp = isFlawless ? Math.round(lesson.xpReward * 0.25) : 0;
    return (
      <div className="min-h-screen pb-12 relative overflow-hidden">
        {/* Confetti burst — bigger for first-ever lesson, otherwise 80%+ */}
        {(isFirstEver || pct >= 80) && <ConfettiCelebration tier={tier} />}

        {/* Level-up celebration — fires on top of everything when crossing a level */}
        {leveledUpTo !== null && (
          <LevelUpOverlay
            level={leveledUpTo}
            onClose={() => setLeveledUpTo(null)}
          />
        )}

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
          {/* First-lesson celebration banner */}
          {isFirstEver && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.1 }}
              className="relative overflow-hidden rounded-3xl border border-amber-400/40 bg-gradient-to-br from-amber-500/[0.20] via-orange-500/[0.10] to-transparent p-5 mb-7 text-center"
            >
              <div
                className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 rounded-full opacity-50 pointer-events-none"
                style={{
                  background: "radial-gradient(ellipse, rgba(245,158,11,0.6), transparent 70%)",
                }}
              />
              <div className="relative">
                <motion.div
                  animate={{ rotate: [0, -8, 8, -8, 0], scale: [1, 1.15, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
                  className="text-5xl mb-2 inline-block"
                >
                  🎉
                </motion.div>
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">
                  Your first lesson — ever!
                </div>
                <div className="text-base sm:text-lg font-bold text-amber-50">
                  Welcome to PathForge, Forger. Your journey starts here.
                </div>
              </div>
            </motion.div>
          )}

          {/* 🏆 Career Mastery Certificate awarded */}
          {newCerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 18,
                delay: 0.2,
              }}
              className="relative overflow-hidden rounded-3xl border-2 border-amber-400/60 bg-gradient-to-br from-amber-500/[0.18] via-orange-500/[0.10] to-transparent p-5 mb-7"
            >
              <motion.div
                animate={{
                  background: [
                    "radial-gradient(ellipse, rgba(245,158,11,0.5), transparent 70%)",
                    "radial-gradient(ellipse, rgba(245,158,11,0.7), transparent 70%)",
                    "radial-gradient(ellipse, rgba(245,158,11,0.5), transparent 70%)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-16 left-1/2 -translate-x-1/2 w-96 h-40 pointer-events-none"
              />
              <div className="relative text-center">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                  className="text-6xl mb-2 inline-block"
                >
                  🏆
                </motion.div>
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1">
                  Career Mastery unlocked!
                </div>
                <div className="text-lg sm:text-xl font-bold text-amber-50 mb-2">
                  {newCerts.length === 1
                    ? `You've mastered the ${newCerts[0].career_title} career!`
                    : `You've mastered ${newCerts.length} careers!`}
                </div>
                <div className="text-xs text-amber-200/80 mb-4">
                  PathForge Certificate awarded · credential{" "}
                  <span className="font-mono text-amber-100">
                    {newCerts[0].credential_code}
                  </span>
                </div>
                <Link
                  href="/learn/certificates"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <Trophy size={14} />
                  View certificate
                </Link>
              </div>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="text-center mb-8"
          >
            <motion.div
              animate={{ rotate: [0, -8, 8, -8, 0] }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br ${toneBg[tone]} shadow-2xl mb-5`}
              style={{
                boxShadow: `0 16px 48px rgba(16,185,129,0.4)`,
              }}
            >
              <Trophy size={32} className="text-white" />
            </motion.div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
              {headline}
            </h1>
            <p className="text-sm text-slate-400">
              You finished <span className="text-white font-semibold">{lesson.title}</span>.
            </p>
          </motion.div>

          {/* Boss mastery banner — only on boss lessons. Pass shows
              CROWN earned; fail says "review needed, try again". This is
              what gates Boss "cleared" state in analytics. */}
          {isBossLesson && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
              className={`relative overflow-hidden rounded-3xl border-2 p-5 mb-6 text-center ${
                masteryPassed
                  ? "border-amber-400/60 bg-gradient-to-br from-amber-500/[0.18] via-orange-500/[0.10] to-transparent"
                  : "border-rose-400/40 bg-gradient-to-br from-rose-500/[0.10] to-transparent"
              }`}
            >
              <div className="relative">
                <motion.div
                  animate={masteryPassed ? { rotate: [0, -10, 10, 0], scale: [1, 1.15, 1] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
                  className="text-5xl mb-2 inline-block"
                >
                  {masteryPassed ? "👑" : "⚔️"}
                </motion.div>
                <div
                  className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${
                    masteryPassed ? "text-amber-300" : "text-rose-300"
                  }`}
                >
                  {masteryPassed ? "Boss cleared!" : "Boss not cleared yet"}
                </div>
                <div
                  className={`text-base sm:text-lg font-bold mb-2 ${
                    masteryPassed ? "text-amber-50" : "text-rose-50"
                  }`}
                >
                  {masteryPassed
                    ? tier === "little"
                      ? "You proved your mastery! 🌟"
                      : "Mastery proven — you earned the crown."
                    : tier === "little"
                    ? "Don't worry — try again to beat this boss!"
                    : `Need ${masteryThresholdPct}% on first try to clear. Try again.`}
                </div>
                <div className={`text-xs ${masteryPassed ? "text-amber-200/80" : "text-rose-200/80"}`}>
                  First-try mastery: <span className="font-semibold tabular-nums">{pct}%</span>
                  <span className="opacity-70"> · need {masteryThresholdPct}%+</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Mastery-needed nudge for non-boss lessons — gentle, only shown
              when first-try-pct missed the threshold. Frames it as "review"
              rather than "fail" to keep it kid-safe. */}
          {!isBossLesson && !masteryPassed && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18 }}
              className="rounded-2xl border border-amber-400/25 bg-amber-500/[0.06] p-4 mb-6"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">📖</div>
                <div className="flex-1">
                  <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-1">
                    Review suggested
                  </div>
                  <div className="text-sm text-amber-100 leading-relaxed">
                    {tier === "little"
                      ? "Try this lesson again — you'll get even better!"
                      : `Your first-try was ${pct}%. Replay to lock it in (target ${masteryThresholdPct}%+).`}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6"
          >
            <div className="grid grid-cols-3 gap-3 mb-5">
              <StatBox label="Score" value={`${score}/${total}`} tone={toneText[tone]} />
              <StatBox label="First try" value={`${pct}%`} tone={masteryPassed ? "text-emerald-300" : "text-white"} />
              <StatBox label="XP earned" value={`+${lesson.xpReward + bonusXp}`} tone="text-indigo-300" />
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden mb-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                className={`h-full bg-gradient-to-r ${toneBg[tone]}`}
              />
            </div>
            {bestStreak >= 3 && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-300 font-semibold pt-1">
                <Flame size={12} />
                Best in-lesson streak: {bestStreak}
              </div>
            )}
            {isFlawless && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/[0.12] to-orange-500/[0.12] border border-amber-500/30 text-center"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-0.5">
                  ✨ Flawless bonus
                </div>
                <div className="text-sm text-amber-100">
                  +{bonusXp} XP for a perfect, no-hint run
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Real-world bridge — connects what they just learned to a career */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.10] to-transparent p-4 mb-6"
          >
            <div
              className="absolute -top-12 -right-12 w-36 h-36 rounded-full opacity-30 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)",
              }}
            />
            <div className="relative">
              <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-1.5">
                Real-world unlock
              </div>
              <p className="text-sm text-amber-50 leading-snug mb-3">
                <span className="text-xl mr-1.5">{realWorld.emoji}</span>
                <span className="font-semibold text-white">{realWorld.career}</span>{" "}
                {realWorld.blurb}
              </p>
              <Link
                href="/learn/careers"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-200 hover:text-amber-100 transition-colors"
              >
                Explore careers like this
                <ArrowRight size={11} />
              </Link>
            </div>
          </motion.div>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={restart}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-200 hover:bg-white/[0.04] transition-colors"
            >
              <RotateCcw size={14} />
              Try again
            </button>
            <Link
              href={`/learn/${subjectId}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
            >
              More {subject.title} lessons
              <ArrowRight size={14} />
            </Link>
          </div>
          {persisting && (
            <p className="text-center text-xs text-slate-500 mt-4">Saving your XP…</p>
          )}
        </div>
      </div>
    );
  }

  // ============ Playing ============
  return (
    <div className="min-h-screen pb-12 relative">
      {/* Floating confetti burst on correct */}
      {burst && <EmojiBurst x={burst.x} y={burst.y} key={burst.key} tier={tier} />}
      {/* Floating XP popup */}
      {xpFloat && <XpFloat amount={xpFloat.amount} key={xpFloat.key} />}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-5">
        {/* Top bar */}
        <div>
          <Link
            href={`/learn/${subjectId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft size={12} />
            Back to {subject.title}
          </Link>

          {/* Question dots — shows lesson shape at a glance */}
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              {lesson.questions.map((_, i) => {
                const done = i < currentIdx;
                const isNow = i === currentIdx;
                const wasFirstTry = firstTryCorrect[i];
                return (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      isNow
                        ? "w-6 bg-gradient-to-r " + subject.gradient
                        : done
                        ? wasFirstTry
                          ? "w-2 bg-emerald-400"
                          : "w-2 bg-amber-400"
                        : "w-2 bg-white/15"
                    }`}
                  />
                );
              })}
            </div>
            <AnimatePresence>
              {streak >= 3 && STREAK_HYPE[tier][Math.min(streak, 7)] && (
                <motion.div
                  initial={{ scale: 0.6, opacity: 0, y: -6 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 16 }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold"
                >
                  <Flame size={11} />
                  {STREAK_HYPE[tier][
                    streak >= 7 ? 7 : streak >= 5 ? 5 : 3
                  ]}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Title + counter — boss lessons get a gold "Boss Battle" pill */}
          <div className="flex items-center justify-between text-xs mb-2 gap-2">
            <span className="text-slate-400 font-medium inline-flex items-center gap-1.5 min-w-0">
              {lessonIsBoss(lesson) && (
                <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-200 border border-amber-400/40 flex-shrink-0">
                  ⚔️ Boss Battle
                </span>
              )}
              <span className="truncate">
                {lesson.emoji} {lesson.title}
              </span>
              {lesson.melcCode && !lessonIsBoss(lesson) && (
                <span
                  className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex-shrink-0"
                  title={`DepEd MELC code: ${lesson.melcCode}`}
                >
                  ✓ MELC {lesson.melcCode}
                </span>
              )}
            </span>
            <span className="text-slate-300 tabular-nums font-semibold flex-shrink-0">
              {currentIdx + 1} / {total}
            </span>
          </div>

          {/* Smooth gradient progress bar */}
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${subject.gradient}`}
              initial={false}
              animate={{ width: `${((currentIdx + 1) / total) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Real-world job hook — only on first question, dismisses afterward */}
        {currentIdx === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.08] via-orange-500/[0.04] to-transparent p-3.5"
          >
            <div
              className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-25 pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)",
              }}
            />
            <div className="relative flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, -6, 6, 0], y: [0, -2, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="flex-shrink-0 text-2xl"
              >
                {realWorld.emoji}
              </motion.div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-0.5">
                  In the real world
                </div>
                <p className="text-xs sm:text-sm leading-snug text-amber-50">
                  <span className="font-semibold text-white">{realWorld.career}</span>{" "}
                  {realWorld.blurb}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mascot + question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8 relative overflow-hidden"
          >
            {/* Mascot — sits in the corner, reacts to events */}
            <Mascot mood={mascotMood} tier={tier} />

            <p className="text-xl sm:text-2xl lg:text-3xl font-semibold tracking-tight text-center mb-6 leading-tight pr-10">
              {q.prompt}
            </p>

            {(() => {
              // Build the list of options to render. For "tf" questions we
              // synthesize ["True", "False"] so the existing button code
              // continues to render identically — the data layer decides
              // which is correct via correctIndexFor().
              const isTF = q.kind === "tf";
              const renderOptions = isTF
                ? ["True ✓", "False ✗"]
                : q.options ?? [];
              return (
            <div className={`grid ${isTF ? "grid-cols-2" : "sm:grid-cols-2"} gap-3`}>
              {renderOptions.map((opt, i) => {
                const isPicked = pickedIdx === i;
                const isCorrect = i === correctIndexFor(q);
                let cls =
                  "p-4 rounded-2xl border text-sm sm:text-base font-semibold transition-all text-left min-h-[56px]";
                if (revealed) {
                  if (isCorrect) {
                    cls +=
                      " border-emerald-500/60 bg-emerald-500/15 text-emerald-200 shadow-lg shadow-emerald-500/10";
                  } else if (isPicked) {
                    cls += " border-rose-500/60 bg-rose-500/15 text-rose-200";
                  } else {
                    cls += " border-white/[0.06] bg-white/[0.02] text-slate-400";
                  }
                } else if (isPicked && pickedIdx !== correctIndexFor(q)) {
                  cls +=
                    " border-rose-500/60 bg-rose-500/15 text-rose-200 animate-pulse";
                } else {
                  cls +=
                    " border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.20] hover:scale-[1.015] cursor-pointer";
                }
                return (
                  <motion.button
                    key={i}
                    onClick={(e) => pick(i, e)}
                    disabled={revealed}
                    className={cls}
                    whileTap={!revealed ? { scale: 0.97 } : {}}
                  >
                    <span className="inline-flex items-center gap-2.5">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-white/[0.08] border border-white/[0.12] text-xs font-bold text-slate-200">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {revealed && isCorrect && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 18 }}
                        >
                          <Check size={16} strokeWidth={3} className="text-emerald-300" />
                        </motion.span>
                      )}
                    </span>
                  </motion.button>
                );
              })}
            </div>
              );
            })()}

            {/* Hint inline */}
            {!revealed && q.explanation && (
              <div className="mt-4 flex items-center justify-end">
                {hintOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex items-start gap-2 px-3 py-2 rounded-xl bg-amber-500/[0.08] border border-amber-500/30 text-xs text-amber-100"
                  >
                    <Lightbulb size={12} className="text-amber-300 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{q.explanation}</span>
                  </motion.div>
                ) : (
                  <button
                    onClick={openHint}
                    className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-medium hover:text-amber-200 transition-colors"
                  >
                    <Lightbulb size={12} />
                    Show hint
                  </button>
                )}
              </div>
            )}

            {/* Feedback strip */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ type: "spring", stiffness: 220, damping: 20 }}
                  className={`mt-5 p-4 rounded-2xl border ${
                    pickedIdx === correctIndexFor(q)
                      ? "bg-emerald-500/[0.10] border-emerald-500/40"
                      : "bg-amber-500/[0.10] border-amber-500/40"
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {pickedIdx === correctIndexFor(q) ? (
                      <div className="w-7 h-7 rounded-full bg-emerald-500/25 flex items-center justify-center flex-shrink-0">
                        <Check size={14} className="text-emerald-300" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-amber-500/25 flex items-center justify-center flex-shrink-0">
                        <X size={14} className="text-amber-300" strokeWidth={3} />
                      </div>
                    )}
                    <div className="flex-1 text-sm">
                      <div className="font-semibold mb-0.5">
                        {pickedIdx === correctIndexFor(q)
                          ? wrongCount === 0
                            ? feedbackMsg
                            : "Got it — onwards."
                          : (() => {
                              if (q.kind === "tf") {
                                return `The answer is ${q.correctAnswer ? "True" : "False"}.`;
                              }
                              const opts = q.options ?? [];
                              const idx = q.correctIndex ?? 0;
                              return `The answer is ${opts[idx] ?? ""}.`;
                            })()}
                      </div>
                      {q.explanation && !hintOpen && (
                        <div className="text-xs text-slate-300 leading-relaxed">
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Footer / Next */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <Sparkles size={11} className="text-indigo-300" />
            +{lesson.xpReward} XP on completion
          </div>
          <button
            onClick={nextQuestion}
            disabled={!revealed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-lg"
          >
            {isLast ? (
              <>
                Finish
                <Trophy size={14} />
              </>
            ) : (
              <>
                Next question
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Mascot — a friendly reactive emoji in the corner of the question card.
// Tier-aware: bigger and more expressive for little kids, subtler for teens.
// ───────────────────────────────────────────────────────────────────
function Mascot({
  mood,
  tier,
}: {
  mood: "neutral" | "happy" | "fire" | "thinking" | "encouraging";
  tier: AgeTier;
}) {
  const face: Record<typeof mood, string> = {
    neutral: tier === "little" ? "🤖" : tier === "junior" ? "🦊" : "✨",
    happy: tier === "little" ? "🎉" : tier === "junior" ? "🌟" : "✓",
    fire: "🔥",
    thinking: "🤔",
    encouraging: "💪",
  } as any;

  // Teens get a quieter mascot (no bouncing, smaller)
  const sizeCls =
    tier === "teen" ? "w-7 h-7 text-base" : tier === "junior" ? "w-9 h-9 text-xl" : "w-11 h-11 text-2xl";

  const animate: any =
    tier === "teen"
      ? { scale: mood === "happy" || mood === "fire" ? [1, 1.1, 1] : 1 }
      : mood === "happy" || mood === "fire"
      ? { rotate: [0, -12, 12, -8, 0], scale: [1, 1.25, 1] }
      : mood === "thinking"
      ? { y: [0, -2, 0] }
      : { scale: 1 };

  return (
    <motion.div
      key={mood}
      animate={animate}
      transition={{ duration: 0.5 }}
      className={`absolute top-3 right-3 ${sizeCls} flex items-center justify-center rounded-2xl bg-white/[0.06] border border-white/[0.08] backdrop-blur-sm`}
    >
      {face[mood]}
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Emoji burst — fixed-position particle effect on correct answer
// ───────────────────────────────────────────────────────────────────
function EmojiBurst({ x, y, tier }: { x: number; y: number; tier: AgeTier }) {
  const emojis = tier === "teen" ? ["✨"] : tier === "junior" ? ["⭐", "✨", "🎉"] : ["🌟", "🎉", "⭐", "💫", "🎊"];
  const particles = useMemo(
    () =>
      Array.from({ length: tier === "teen" ? 4 : tier === "junior" ? 8 : 12 }).map(() => ({
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        dx: (Math.random() - 0.5) * 200,
        dy: -Math.random() * 180 - 40,
        rot: (Math.random() - 0.5) * 360,
        delay: Math.random() * 0.1,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <div
      className="fixed pointer-events-none z-50"
      style={{ left: x, top: y }}
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.5, rotate: 0 }}
          animate={{
            x: p.dx,
            y: p.dy,
            opacity: 0,
            scale: 1,
            rotate: p.rot,
          }}
          transition={{ duration: 1, delay: p.delay, ease: "easeOut" }}
          className="absolute text-xl"
          style={{ left: -10, top: -10 }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Floating "+X XP" popup — bottom-right, drifts up and fades
// ───────────────────────────────────────────────────────────────────
function XpFloat({ amount }: { amount: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 0, scale: 0.8 }}
      animate={{ opacity: 1, y: -80, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1, ease: "easeOut" }}
      className="fixed bottom-24 right-6 sm:bottom-12 z-40 pointer-events-none"
    >
      <div className="px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-bold shadow-xl shadow-indigo-500/30">
        +{amount} XP
      </div>
    </motion.div>
  );
}

// ───────────────────────────────────────────────────────────────────
// Big confetti for the done screen
// ───────────────────────────────────────────────────────────────────
function ConfettiCelebration({ tier }: { tier: AgeTier }) {
  const emojis = tier === "teen" ? ["✨", "⭐"] : tier === "junior" ? ["🎉", "✨", "⭐", "🌟"] : ["🎉", "🎊", "🌟", "⭐", "💫", "🎈"];
  const count = tier === "teen" ? 16 : tier === "junior" ? 28 : 40;
  const particles = useMemo(
    () =>
      Array.from({ length: count }).map(() => ({
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        duration: 2 + Math.random() * 1.5,
        rot: (Math.random() - 0.5) * 720,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <motion.span
          key={i}
          initial={{ y: -40, opacity: 0, rotate: 0 }}
          animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: p.rot }}
          transition={{ duration: p.duration, delay: p.delay, ease: "linear" }}
          className="absolute text-2xl"
          style={{ left: `${p.left}%` }}
        >
          {p.emoji}
        </motion.span>
      ))}
    </div>
  );
}

function StatBox({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="text-center">
      <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
        {label}
      </div>
      <div className={`text-2xl sm:text-3xl font-bold tabular-nums ${tone}`}>{value}</div>
    </div>
  );
}
