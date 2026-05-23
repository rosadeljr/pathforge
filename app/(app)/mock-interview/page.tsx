"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Crown,
  Briefcase,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Loader2,
  Lock,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { CAREER_PATHS } from "@/lib/data/career-paths";
import { getEntitlements } from "@/lib/entitlements";
import { PageShimmer } from "@/components/ui/Shimmer";

type Step = "setup" | "questions" | "results";
type Mode = "role" | "jd";

interface QuestionGrade {
  question: string;
  feedback: string;
  strength: "excellent" | "good" | "needs-work";
}

interface GradeResult {
  overall: number;
  feedback: QuestionGrade[];
}

export default function MockInterviewPage() {
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState<string>("free");
  const [defaultRole, setDefaultRole] = useState<string>("");
  const [mode, setMode] = useState<Mode>("role");
  const [role, setRole] = useState<string>("");
  const [jd, setJd] = useState<string>("");
  const [step, setStep] = useState<Step>("setup");
  const [questions, setQuestions] = useState<string[]>([]);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          setLoading(false);
          return;
        }
        const { data: profile } = await supabase
          .from("profiles")
          .select("subscription_tier, selected_career_path_id")
          .eq("id", session.user.id)
          .maybeSingle();
        if (profile?.subscription_tier) setTier(profile.subscription_tier);
        const path = CAREER_PATHS.find((p) => p.id === profile?.selected_career_path_id);
        if (path) {
          setDefaultRole(path.title);
          setRole(path.title);
        }
      } catch (e) {
        console.error("Mock interview load error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  const canMock = getEntitlements(tier).canMockInterview;

  async function startInterview() {
    setBusy(true);
    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          role: mode === "role" ? role : "",
          jd: mode === "jd" ? jd : "",
        }),
      });
      if (!res.ok) throw new Error("Couldn't start");
      const data = await res.json();
      if (!Array.isArray(data.questions) || data.questions.length < 3) {
        throw new Error("Bad questions");
      }
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(""));
      setCurrentIdx(0);
      setStep("questions");
    } catch {
      toast.error("ForgeBot couldn't start the interview. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function setAnswer(idx: number, value: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  }

  async function finishInterview() {
    setBusy(true);
    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grade",
          role: mode === "role" ? role : "",
          jd: mode === "jd" ? jd : "",
          questions,
          answers,
        }),
      });
      if (!res.ok) throw new Error("Couldn't grade");
      const data = (await res.json()) as GradeResult;
      if (typeof data.overall !== "number" || !Array.isArray(data.feedback)) {
        throw new Error("Bad grade response");
      }
      setResult(data);
      setStep("results");
    } catch {
      toast.error("ForgeBot couldn't grade that. Try again.");
    } finally {
      setBusy(false);
    }
  }

  function retake() {
    setQuestions([]);
    setAnswers([]);
    setCurrentIdx(0);
    setResult(null);
    setStep("setup");
  }

  if (loading) return <PageShimmer />;

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 mb-3">
            <Crown size={11} className="text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Elite
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-1">
            Mock Interview
          </h1>
          <p className="text-sm text-slate-400">
            ForgeBot role-plays a real interview — 5 questions, direct feedback, an honest score.
          </p>
        </div>

        {!canMock ? (
          <ElitePaywall router={router} />
        ) : (
          <AnimatePresence mode="wait">
            {step === "setup" && (
              <Setup
                key="setup"
                mode={mode}
                setMode={setMode}
                role={role}
                setRole={setRole}
                jd={jd}
                setJd={setJd}
                defaultRole={defaultRole}
                busy={busy}
                onStart={startInterview}
              />
            )}
            {step === "questions" && (
              <Questions
                key="questions"
                questions={questions}
                answers={answers}
                currentIdx={currentIdx}
                setCurrentIdx={setCurrentIdx}
                setAnswer={setAnswer}
                busy={busy}
                onFinish={finishInterview}
              />
            )}
            {step === "results" && result && (
              <Results key="results" result={result} onRetake={retake} />
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function ElitePaywall({ router }: { router: ReturnType<typeof useRouter> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.06] via-amber-500/[0.02] to-transparent p-8 text-center"
    >
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-30 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(245,158,11,0.4), transparent 70%)" }}
      />
      <div className="relative">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-5 shadow-xl shadow-amber-500/25">
          <Lock size={22} className="text-white" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Elite unlocks Mock Interview</h2>
        <p className="text-sm text-slate-400 mb-6 max-w-md mx-auto">
          ForgeBot generates real interview questions for your target role, then grades your
          answers with specific, actionable feedback. The fastest way to get interview-ready.
        </p>
        <button
          onClick={() => router.push("/pricing")}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white text-sm font-semibold hover:from-amber-400 hover:to-orange-500 transition-colors shadow-lg shadow-amber-500/25"
        >
          <Crown size={14} />
          See Elite — ₱999/mo
        </button>
      </div>
    </motion.div>
  );
}

function Setup({
  mode,
  setMode,
  role,
  setRole,
  jd,
  setJd,
  defaultRole,
  busy,
  onStart,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  role: string;
  setRole: (r: string) => void;
  jd: string;
  setJd: (j: string) => void;
  defaultRole: string;
  busy: boolean;
  onStart: () => void;
}) {
  const canStart = mode === "role" ? role.trim().length > 0 : jd.trim().length > 30;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Mode toggle */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-1.5 grid grid-cols-2 gap-1.5">
        <button
          onClick={() => setMode("role")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            mode === "role"
              ? "bg-white/[0.08] text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Briefcase size={14} />
          Target a role
        </button>
        <button
          onClick={() => setMode("jd")}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            mode === "jd"
              ? "bg-white/[0.08] text-white"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Sparkles size={14} />
          Paste a JD
        </button>
      </div>

      {/* Input */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
        {mode === "role" ? (
          <>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Role you're interviewing for
            </label>
            <input
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer"
              className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50"
            />
            {defaultRole && (
              <p className="text-[11px] text-slate-500 mt-1.5">
                We pre-filled this from your PathForge path. Change it to interview for anything.
              </p>
            )}
          </>
        ) : (
          <>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Job description
            </label>
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              rows={8}
              placeholder="Paste the full job description here. ForgeBot will tailor questions to it."
              className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-500/50"
            />
            <p className="text-[11px] text-slate-500 mt-1.5">
              Paste at least a paragraph — the more detail, the sharper the questions.
            </p>
          </>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          You'll get 5 questions and feedback on each.
        </p>
        <button
          onClick={onStart}
          disabled={!canStart || busy}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {busy ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Generating questions…
            </>
          ) : (
            <>
              Start interview <ArrowRight size={14} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}

function Questions({
  questions,
  answers,
  currentIdx,
  setCurrentIdx,
  setAnswer,
  busy,
  onFinish,
}: {
  questions: string[];
  answers: string[];
  currentIdx: number;
  setCurrentIdx: (n: number) => void;
  setAnswer: (idx: number, v: string) => void;
  busy: boolean;
  onFinish: () => void;
}) {
  const isLast = currentIdx === questions.length - 1;
  const q = questions[currentIdx];
  const a = answers[currentIdx] || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="text-slate-400 font-medium">
            Question {currentIdx + 1} of {questions.length}
          </span>
          <span className="text-slate-500">{a.length} chars</span>
        </div>
        <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
            initial={false}
            animate={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      {/* Question card */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25 flex-shrink-0">
            <Sparkles size={15} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-wider text-violet-300 font-semibold mb-1">
              ForgeBot asks
            </div>
            <p className="text-base font-medium text-white leading-relaxed">{q}</p>
          </div>
        </div>

        <textarea
          value={a}
          onChange={(e) => setAnswer(currentIdx, e.target.value)}
          rows={7}
          placeholder="Take your time. Lead with the situation, walk through your action, end with the result."
          className="w-full px-3.5 py-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-500/50"
        />
        <p className="text-[11px] text-slate-500 mt-1.5">
          Aim for ~150–300 characters. Specific beats long.
        </p>
      </div>

      {/* Nav */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
          disabled={currentIdx === 0 || busy}
          className="px-4 py-2 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.04] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Back
        </button>
        {isLast ? (
          <button
            onClick={onFinish}
            disabled={busy}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 transition-colors"
          >
            {busy ? (
              <>
                <Loader2 size={14} className="animate-spin" /> ForgeBot is grading…
              </>
            ) : (
              <>
                Finish &amp; grade <CheckCircle2 size={14} />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={() => setCurrentIdx(currentIdx + 1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function Results({
  result,
  onRetake,
}: {
  result: GradeResult;
  onRetake: () => void;
}) {
  const tone =
    result.overall >= 80 ? "emerald" : result.overall >= 50 ? "amber" : "rose";
  const toneClasses: Record<string, string> = {
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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-5"
    >
      {/* Overall */}
      <div className="rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 text-center">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-3">
          Overall interview score
        </div>
        <div className="flex items-baseline justify-center gap-1 mb-3">
          <span className={`text-6xl font-bold tabular-nums ${toneClasses[tone]}`}>
            {result.overall}
          </span>
          <span className="text-slate-500 text-lg">/100</span>
        </div>
        <div className="h-2 max-w-xs mx-auto bg-white/[0.06] rounded-full overflow-hidden">
          <motion.div
            className={`h-full bg-gradient-to-r ${toneBg[tone]}`}
            initial={{ width: 0 }}
            animate={{ width: `${result.overall}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
        <p className="text-sm text-slate-400 mt-4 max-w-md mx-auto">
          {result.overall >= 80
            ? "Sharp interview — you're ready to put yourself out there."
            : result.overall >= 50
            ? "Solid base. Tighten the weak spots below and you're interview-ready."
            : "Lots of upside here. Work through the feedback and run the interview again."}
        </p>
      </div>

      {/* Per-question feedback */}
      <div className="space-y-3">
        {result.feedback.map((f, i) => {
          const strengthStyle =
            f.strength === "excellent"
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
              : f.strength === "good"
              ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
              : "bg-amber-500/15 border-amber-500/30 text-amber-300";
          const Icon = f.strength === "needs-work" ? AlertCircle : CheckCircle2;
          return (
            <div
              key={i}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                  Question {i + 1}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-wider ${strengthStyle}`}
                >
                  <Icon size={10} />
                  {f.strength}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200 mb-2">{f.question}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{f.feedback}</p>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link
          href="/resume"
          className="text-sm text-indigo-300 hover:text-indigo-200 inline-flex items-center gap-1.5"
        >
          Polish your resume with these takeaways
          <ArrowRight size={12} />
        </Link>
        <button
          onClick={onRetake}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-200 hover:bg-white/[0.04] transition-colors"
        >
          <RotateCcw size={14} />
          New interview
        </button>
      </div>
    </motion.div>
  );
}
