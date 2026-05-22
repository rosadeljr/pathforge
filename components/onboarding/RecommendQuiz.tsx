"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, ArrowLeft, Sparkles, Check } from "lucide-react";
import { CAREER_PATHS, type CareerPath } from "@/lib/data/career-paths";

interface Props {
  onClose: () => void;
  onRecommend: (careerPathId: string) => void;
}

interface QuizAnswer {
  background: "tech" | "creative" | "business" | "none" | null;
  income: "salary" | "freelance" | "both" | null;
  vibe: "build" | "create" | "strategize" | "service" | null;
}

const QUESTIONS = [
  {
    id: "background" as const,
    title: "What's your background?",
    subtitle: "Doesn't have to be formal — what feels natural to you.",
    options: [
      { value: "tech" as const, label: "Tech / Engineering", emoji: "⚡", description: "I like solving logic problems or have coded before" },
      { value: "creative" as const, label: "Creative / Design", emoji: "🎨", description: "I'm visual, design-minded, or artistic" },
      { value: "business" as const, label: "Business / People", emoji: "📈", description: "I'm strategic, persuasive, or great with people" },
      { value: "none" as const, label: "No clear background", emoji: "🌱", description: "I'm a complete beginner — that's totally fine" },
    ],
  },
  {
    id: "income" as const,
    title: "What kind of income do you want?",
    subtitle: "There's no wrong answer here.",
    options: [
      { value: "salary" as const, label: "Stable salary", emoji: "🏢", description: "Full-time job, benefits, predictable paycheck" },
      { value: "freelance" as const, label: "Freelance / Remote", emoji: "🌍", description: "Work from anywhere, USD income from PH" },
      { value: "both" as const, label: "Both / Not sure", emoji: "✨", description: "Open to either depending on opportunity" },
    ],
  },
  {
    id: "vibe" as const,
    title: "What energizes you?",
    subtitle: "Pick what genuinely excites you most.",
    options: [
      { value: "build" as const, label: "Building things", emoji: "🔧", description: "Apps, websites, tools, products" },
      { value: "create" as const, label: "Creating content", emoji: "🎬", description: "Videos, designs, writing, social posts" },
      { value: "strategize" as const, label: "Solving problems", emoji: "🎯", description: "Analytics, strategy, decision-making" },
      { value: "service" as const, label: "Helping people", emoji: "🤝", description: "Support, communication, organization" },
    ],
  },
];

/**
 * Score each career path against the user's answers and return the best match.
 */
function recommend(answers: QuizAnswer): CareerPath {
  const scores = new Map<string, number>();

  CAREER_PATHS.forEach((path) => {
    let score = 0;

    // Background match
    if (answers.background === "tech" && ["Engineering", "Data & AI"].includes(path.category)) score += 3;
    if (answers.background === "creative" && path.category === "Design & Creative") score += 3;
    if (answers.background === "business" && ["Product & Strategy", "Marketing & Growth"].includes(path.category)) score += 3;
    if (answers.background === "none" && path.timelineMonths <= 6) score += 2;

    // Income preference
    if (answers.income === "freelance" && path.remote) score += 2;
    if (answers.income === "freelance" && path.category === "Remote & Freelance") score += 3;
    if (answers.income === "salary" && ["Engineering", "Data & AI", "Product & Strategy"].includes(path.category)) score += 2;

    // Vibe match
    if (answers.vibe === "build" && ["Engineering", "Data & AI"].includes(path.category)) score += 2;
    if (answers.vibe === "create" && ["Design & Creative", "Marketing & Growth"].includes(path.category)) score += 2;
    if (answers.vibe === "strategize" && ["Product & Strategy", "Data & AI"].includes(path.category)) score += 2;
    if (answers.vibe === "service" && path.category === "Remote & Freelance") score += 2;

    // Boost trending/lower-barrier paths
    if (path.trending) score += 0.5;
    if (answers.background === "none" && path.rank === "C") score += 1;

    scores.set(path.id, score);
  });

  const best = Array.from(scores.entries()).sort((a, b) => b[1] - a[1])[0];
  return CAREER_PATHS.find((p) => p.id === best[0]) || CAREER_PATHS[0];
}

export function RecommendQuiz({ onClose, onRecommend }: Props) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer>({
    background: null,
    income: null,
    vibe: null,
  });
  const [showResult, setShowResult] = useState(false);

  const currentQ = QUESTIONS[step];
  const isLast = step === QUESTIONS.length - 1;
  const currentAnswer = answers[currentQ.id];

  const handleSelect = (value: string) => {
    const newAnswers = { ...answers, [currentQ.id]: value };
    setAnswers(newAnswers as QuizAnswer);
    if (isLast) {
      // Slight delay so the user sees their final selection
      setTimeout(() => setShowResult(true), 250);
    } else {
      setTimeout(() => setStep(step + 1), 200);
    }
  };

  const recommended = showResult ? recommend(answers) : null;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg bg-[#0a0a0f] border-t border-x sm:border border-white/[0.08] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden"
      >
        {/* Mobile drag handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        {!showResult ? (
          <>
            {/* Header */}
            <div className="px-6 pt-6 pb-3">
              <div className="flex items-center gap-2 mb-3">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30">
                  <Sparkles size={10} className="text-indigo-300" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                    Quick recommend
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {step + 1} / {QUESTIONS.length}
                </span>
              </div>
              {/* Progress */}
              <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden mb-5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                />
              </div>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="px-6 pb-6"
              >
                <h2 className="text-2xl font-semibold tracking-tight mb-1">{currentQ.title}</h2>
                <p className="text-sm text-slate-400 mb-5">{currentQ.subtitle}</p>

                <div className="space-y-2">
                  {currentQ.options.map((opt: any) => {
                    const isSelected = currentAnswer === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={`group w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 ${
                          isSelected
                            ? "border-white/30 bg-white/[0.06]"
                            : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"
                        }`}
                      >
                        <div className="text-2xl flex-shrink-0">{opt.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold mb-0.5">{opt.label}</div>
                          <div className="text-xs text-slate-400">{opt.description}</div>
                        </div>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex-shrink-0 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                          >
                            <Check size={12} className="text-slate-900" strokeWidth={3} />
                          </motion.div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Back nav */}
                {step > 0 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="mt-5 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    <ArrowLeft size={12} />
                    Back
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </>
        ) : (
          // Result
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-6 pt-6 pb-6"
          >
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 mb-4">
                <Sparkles size={11} className="text-emerald-300" />
                <span className="text-xs font-bold tracking-wider text-emerald-300 uppercase">
                  Your best fit
                </span>
              </div>
              <div
                className={`w-16 h-16 rounded-2xl mx-auto mb-3 bg-gradient-to-br ${recommended!.gradient} flex items-center justify-center text-3xl shadow-xl`}
                style={{ boxShadow: `0 12px 32px ${recommended!.accentColor}40` }}
              >
                {recommended!.emoji}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight mb-1">
                {recommended!.title}
              </h2>
              <p className="text-sm text-slate-400 mb-4">{recommended!.tagline}</p>
            </div>

            {/* Why this fits */}
            <div className="p-3.5 rounded-xl bg-indigo-500/[0.06] border border-indigo-500/20 mb-4">
              <div className="text-[10px] uppercase tracking-wider text-indigo-300 font-semibold mb-1">
                Why this fits
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{recommended!.vibe}</p>
            </div>

            {/* Skills preview */}
            <div className="mb-5">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                Skills you'll build
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recommended!.skills.slice(0, 5).map((s) => (
                  <span
                    key={s}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowResult(false);
                  setStep(0);
                  setAnswers({ background: null, income: null, vibe: null });
                }}
                className="flex-1 px-4 py-2.5 rounded-lg border border-white/[0.08] text-sm font-medium text-slate-300 hover:bg-white/[0.04] transition-colors"
              >
                Retake
              </button>
              <button
                onClick={() => onRecommend(recommended!.id)}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-[linear-gradient(110deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)] bg-[length:200%_100%] hover:bg-[position:100%_0] transition-all shadow-lg shadow-indigo-500/30"
              >
                Pick this path
                <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>,
    document.body
  );
}
