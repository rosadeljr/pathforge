"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  Sparkles,
  Trophy,
  Zap,
  RotateCcw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSubject } from "@/lib/data/learner";
import { getLesson } from "@/lib/data/learner-lessons";
import { PageShimmer } from "@/components/ui/Shimmer";

type Phase = "loading" | "playing" | "done";

export default function LessonPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  const subjectId = (params?.subject as string) || "";
  const lessonId = (params?.lessonId as string) || "";

  const subject = getSubject(subjectId);
  const lesson = getLesson(lessonId);

  const [phase, setPhase] = useState<Phase>("loading");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [revealed, setRevealed] = useState(false); // true once the correct answer is shown
  // Per-question: did the user get it right on first try?
  const [firstTryCorrect, setFirstTryCorrect] = useState<boolean[]>([]);
  const [persisting, setPersisting] = useState(false);

  useEffect(() => {
    if (!lesson || !subject || subject.id !== lesson.subject) {
      setPhase("loading"); // Stay loading to show error fallback below.
    } else {
      setFirstTryCorrect(new Array(lesson.questions.length).fill(false));
      setPhase("playing");
    }
  }, [lesson, subject]);

  // Bad URL or missing lesson — render an error after a brief loading window.
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

  function pick(i: number) {
    if (revealed) return; // already answered
    setPickedIdx(i);
    if (i === q.correctIndex) {
      // First-try correctness tracked only if wrongCount is still 0.
      const fresh = [...firstTryCorrect];
      fresh[currentIdx] = wrongCount === 0;
      setFirstTryCorrect(fresh);
      setRevealed(true);
    } else {
      // First wrong → allow one retry. Second wrong → reveal the answer.
      if (wrongCount === 0) {
        setWrongCount(1);
        // Pulse and clear after a beat so they can try again.
        setTimeout(() => {
          setPickedIdx(null);
        }, 700);
      } else {
        setRevealed(true);
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
    }
  }

  async function finishLesson() {
    setPhase("done");
    persistCompletion();
  }

  async function persistCompletion() {
    setPersisting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;
      const uid = session.user.id;

      // Idempotency check — don't double-award XP for a re-attempt.
      const { data: existing } = await supabase
        .from("analytics_events")
        .select("id")
        .eq("user_id", uid)
        .eq("event_type", "lesson_completed")
        .filter("event_payload->>lesson_id", "eq", lesson!.id)
        .limit(1);

      const alreadyDone = (existing?.length || 0) > 0;
      const awardXp = alreadyDone ? 0 : lesson!.xpReward;

      // Log the completion event (always, so we have replay history).
      await supabase.from("analytics_events").insert({
        user_id: uid,
        event_type: "lesson_completed",
        event_payload: {
          lesson_id: lesson!.id,
          subject: lesson!.subject,
          score: correctCount,
          total,
          replay: alreadyDone,
        },
        xp_delta: awardXp,
      });

      if (awardXp > 0) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("total_xp, current_xp")
          .eq("id", uid)
          .single();
        if (prof) {
          await supabase
            .from("profiles")
            .update({
              total_xp: (prof.total_xp || 0) + awardXp,
              current_xp: (prof.current_xp || 0) + awardXp,
              last_quest_completed_at: new Date().toISOString(),
            })
            .eq("id", uid);
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
    setPhase("playing");
  }

  // ============ Done screen ============
  if (phase === "done") {
    const score = correctCount;
    const pct = Math.round((score / total) * 100);
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
    return (
      <div className="min-h-screen pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${toneBg[tone]} shadow-2xl mb-5`}
              style={{
                boxShadow: `0 12px 40px rgba(16,185,129,0.4)`,
              }}
            >
              <Trophy size={26} className="text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
              {pct === 100 ? "Perfect!" : pct >= 80 ? "Great work!" : pct >= 50 ? "Good job!" : "Lesson done!"}
            </h1>
            <p className="text-sm text-slate-400">
              You finished <span className="text-white font-semibold">{lesson.title}</span>.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 mb-6"
          >
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Score</div>
                <div className={`text-3xl font-bold tabular-nums ${toneText[tone]}`}>
                  {score}/{total}
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">First try</div>
                <div className="text-3xl font-bold tabular-nums text-white">{pct}%</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">XP earned</div>
                <div className="text-3xl font-bold tabular-nums text-indigo-300">
                  +{lesson.xpReward}
                </div>
              </div>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className={`h-full bg-gradient-to-r ${toneBg[tone]}`}
              />
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
    <div className="min-h-screen pb-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 space-y-6">
        {/* Header */}
        <div>
          <Link
            href={`/learn/${subjectId}`}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft size={12} />
            Back to {subject.title}
          </Link>
          <div className="flex items-center justify-between mb-2 text-xs">
            <span className="text-slate-400 font-medium">
              {lesson.emoji} {lesson.title}
            </span>
            <span className="text-slate-300 tabular-nums font-semibold">
              {currentIdx + 1} / {total}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${subject.gradient}`}
              initial={false}
              animate={{ width: `${((currentIdx + 1) / total) * 100}%` }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8"
          >
            <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-center mb-6 leading-tight">
              {q.prompt}
            </p>

            <div className="grid sm:grid-cols-2 gap-3">
              {q.options.map((opt, i) => {
                const isPicked = pickedIdx === i;
                const isCorrect = i === q.correctIndex;
                let cls =
                  "p-4 rounded-xl border text-base font-semibold transition-all text-left";
                if (revealed) {
                  if (isCorrect) {
                    cls +=
                      " border-emerald-500/50 bg-emerald-500/15 text-emerald-200";
                  } else if (isPicked) {
                    cls += " border-rose-500/50 bg-rose-500/15 text-rose-200";
                  } else {
                    cls += " border-white/[0.06] bg-white/[0.02] text-slate-400";
                  }
                } else if (isPicked && pickedIdx !== q.correctIndex) {
                  cls +=
                    " border-rose-500/50 bg-rose-500/15 text-rose-200 animate-pulse";
                } else {
                  cls +=
                    " border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.16] cursor-pointer";
                }
                return (
                  <button
                    key={i}
                    onClick={() => pick(i)}
                    disabled={revealed}
                    className={cls}
                  >
                    <span className="inline-flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-white/[0.06] border border-white/[0.1] text-xs font-bold text-slate-300">
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Feedback strip */}
            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-5 p-4 rounded-xl border ${
                  pickedIdx === q.correctIndex
                    ? "bg-emerald-500/[0.08] border-emerald-500/30"
                    : "bg-amber-500/[0.08] border-amber-500/30"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {pickedIdx === q.correctIndex ? (
                    <Check size={16} className="text-emerald-300 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  ) : (
                    <X size={16} className="text-amber-300 flex-shrink-0 mt-0.5" strokeWidth={3} />
                  )}
                  <div className="flex-1 text-sm">
                    <div className="font-semibold mb-0.5">
                      {pickedIdx === q.correctIndex
                        ? wrongCount === 0
                          ? "Correct! Nice work."
                          : "Got it — onwards."
                        : `The answer is ${q.options[q.correctIndex]}.`}
                    </div>
                    {q.explanation && (
                      <div className="text-xs text-slate-300 leading-relaxed">
                        {q.explanation}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
