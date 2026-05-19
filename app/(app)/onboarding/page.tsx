"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  Search,
  Sparkles,
  TrendingUp,
  Globe2,
  Loader2,
} from "lucide-react";
import {
  CAREER_PATHS,
  CATEGORIES,
  RANK_META,
  formatPhp,
  type CareerCategory,
} from "@/lib/data/career-paths";

const GOAL_OPTIONS = [
  { value: "land_first_job", label: "Land my first job", emoji: "🚀" },
  { value: "switch_careers", label: "Switch careers", emoji: "🔄" },
  { value: "level_up_skills", label: "Level up my skills", emoji: "📚" },
  { value: "go_remote", label: "Earn in USD remotely", emoji: "🌍" },
  { value: "freelance_income", label: "Build freelance income", emoji: "💸" },
  { value: "promotion", label: "Get promoted", emoji: "📈" },
];

const TIMELINE_OPTIONS = [
  { months: 3, label: "Sprint", description: "3 months" },
  { months: 6, label: "Focused", description: "6 months" },
  { months: 12, label: "Steady", description: "1 year" },
  { months: 24, label: "Marathon", description: "2 years" },
];

const AVAILABILITY_OPTIONS = [
  { hours: 5, label: "Casual", description: "5 hrs/week" },
  { hours: 10, label: "Balanced", description: "10 hrs/week" },
  { hours: 20, label: "Serious", description: "20 hrs/week" },
  { hours: 35, label: "All-in", description: "35+ hrs/week" },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedPath, setSelectedPath] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<CareerCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryGoal, setPrimaryGoal] = useState("");
  const [timeline, setTimeline] = useState(6);
  const [availability, setAvailability] = useState(10);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  const filteredPaths = useMemo(() => {
    let paths = CAREER_PATHS;
    if (activeCategory !== "All") {
      paths = paths.filter((p) => p.category === activeCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      paths = paths.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.tagline.toLowerCase().includes(q) ||
          p.skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    return paths;
  }, [activeCategory, searchQuery]);

  const selectedPathData = CAREER_PATHS.find((p) => p.id === selectedPath);
  const totalSteps = 3;

  const handleComplete = async () => {
    if (!selectedPath || !primaryGoal) {
      toast.error("Please complete all steps");
      return;
    }

    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const salaryData = selectedPathData
        ? { target_salary_min: selectedPathData.salaryMinPhp, target_salary_max: selectedPathData.salaryMaxPhp }
        : {};

      const { error } = await supabase
        .from("profiles")
        .update({
          selected_career_path_id: selectedPath,
          target_timeline_months: timeline,
          weekly_availability_hours: availability,
          primary_goal: primaryGoal,
          ...salaryData,
        })
        .eq("id", user.id);

      if (error) throw error;

      toast.success("Path forged. Let's go.");
      router.refresh();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Onboarding error:", error);
      toast.error(error?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    if (step === 1) return !!selectedPath;
    if (step === 2) return !!primaryGoal;
    if (step === 3) return timeline > 0 && availability > 0;
    return false;
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/4 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.3), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[700px] h-[700px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.3), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2.5"
            >
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-semibold tracking-tight">PathForge</span>
            </motion.div>

            <div className="text-xs text-slate-500">
              Step <span className="text-white font-semibold">{step}</span> of {totalSteps}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            />
          </div>
        </div>

        {/* Step content */}
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Step header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-4">
                  <Sparkles size={12} className="text-indigo-400" />
                  <span className="text-xs font-medium text-slate-300 tracking-wide">
                    Choose your path
                  </span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                  What career are you{" "}
                  <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                    forging?
                  </span>
                </h1>
                <p className="text-base text-slate-400 max-w-2xl">
                  Pick the one that lights you up. We'll build the entire roadmap, quests, and skill tree around it.
                </p>
              </div>

              {/* Search + filter bar */}
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 16+ career paths or skills..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500/50 transition-all"
                  />
                </div>
              </div>

              {/* Category pills */}
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveCategory("All")}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeCategory === "All"
                      ? "bg-white text-slate-900"
                      : "bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.06]"
                  }`}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 ${
                      activeCategory === cat.name
                        ? "bg-white text-slate-900"
                        : "bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.06]"
                    }`}
                  >
                    <span>{cat.emoji}</span>
                    {cat.name}
                  </button>
                ))}
              </div>

              {/* Career cards grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPaths.map((path, index) => {
                  const isSelected = selectedPath === path.id;
                  const rank = RANK_META[path.rank];
                  return (
                    <motion.button
                      key={path.id}
                      onClick={() => setSelectedPath(path.id)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
                      whileHover={{ y: -2 }}
                      className={`group relative text-left p-5 rounded-2xl border transition-all overflow-hidden ${
                        isSelected
                          ? "border-white/30 bg-white/[0.05]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                      }`}
                    >
                      {/* Selected glow */}
                      {isSelected && (
                        <motion.div
                          layoutId="selected-glow"
                          className="absolute inset-0 opacity-30 -z-10"
                          style={{
                            background: `radial-gradient(circle at 50% 0%, ${path.accentColor}40, transparent 70%)`,
                          }}
                        />
                      )}

                      {/* Top row: emoji + rank */}
                      <div className="flex items-start justify-between mb-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${path.gradient} flex items-center justify-center text-2xl shadow-lg`}
                          style={{ boxShadow: `0 8px 24px ${path.accentColor}30` }}
                        >
                          {path.emoji}
                        </div>
                        <div className="flex flex-col items-end gap-1.5">
                          <div
                            className={`text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-md border ${rank.bgColor}`}
                          >
                            {path.rank}-RANK
                          </div>
                          {path.trending && (
                            <div className="flex items-center gap-1 text-[10px] text-orange-300 font-medium">
                              <TrendingUp size={10} />
                              <span>Trending</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Title + tagline */}
                      <h3 className="text-base font-semibold tracking-tight mb-1">
                        {path.title}
                      </h3>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-2">
                        {path.tagline}
                      </p>

                      {/* Skills */}
                      <div className="flex flex-wrap gap-1 mb-4">
                        {path.skills.slice(0, 3).map((skill) => (
                          <span
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-slate-400"
                          >
                            {skill}
                          </span>
                        ))}
                        {path.skills.length > 3 && (
                          <span className="text-[10px] px-2 py-0.5 text-slate-500">
                            +{path.skills.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Bottom row: salary */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">
                            Salary range
                          </div>
                          <div className="text-sm font-semibold tracking-tight">
                            {formatPhp(path.salaryMinPhp)} – {formatPhp(path.salaryMaxPhp)}
                          </div>
                        </div>
                        {path.remote && (
                          <div
                            title="Remote-friendly"
                            className="w-7 h-7 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center"
                          >
                            <Globe2 size={12} className="text-slate-400" />
                          </div>
                        )}
                      </div>

                      {/* Selected indicator */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                        >
                          <Check size={12} className="text-slate-900" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {filteredPaths.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400 text-sm">No paths match your search.</p>
                </div>
              )}
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-4">
                  <Sparkles size={12} className="text-pink-400" />
                  <span className="text-xs font-medium text-slate-300 tracking-wide">Your why</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                  What's the{" "}
                  <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                    end goal?
                  </span>
                </h1>
                <p className="text-base text-slate-400 max-w-2xl">
                  Pick the outcome that matters most. Your quests will be tuned to get you there.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-4xl">
                {GOAL_OPTIONS.map((goal, index) => {
                  const isSelected = primaryGoal === goal.value;
                  return (
                    <motion.button
                      key={goal.value}
                      onClick={() => setPrimaryGoal(goal.value)}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className={`relative text-left p-5 rounded-2xl border transition-all ${
                        isSelected
                          ? "border-white/30 bg-white/[0.06]"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]"
                      }`}
                    >
                      <div className="text-3xl mb-3">{goal.emoji}</div>
                      <div className="text-base font-medium">{goal.label}</div>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-3 right-3 w-5 h-5 rounded-full bg-white flex items-center justify-center"
                        >
                          <Check size={12} className="text-slate-900" strokeWidth={3} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-4">
                  <Sparkles size={12} className="text-emerald-400" />
                  <span className="text-xs font-medium text-slate-300 tracking-wide">The pace</span>
                </div>
                <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-3">
                  How fast do you want to{" "}
                  <span className="bg-gradient-to-r from-emerald-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent">
                    level up?
                  </span>
                </h1>
                <p className="text-base text-slate-400 max-w-2xl">
                  We'll calibrate quest difficulty and weekly volume to match your reality.
                </p>
              </div>

              <div className="space-y-8 max-w-3xl">
                {/* Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Target timeline</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {TIMELINE_OPTIONS.map((opt) => {
                      const isSelected = timeline === opt.months;
                      return (
                        <button
                          key={opt.months}
                          onClick={() => setTimeline(opt.months)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-white/30 bg-white/[0.06]"
                              : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="text-base font-semibold">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly availability */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Weekly hours you can commit</h3>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {AVAILABILITY_OPTIONS.map((opt) => {
                      const isSelected = availability === opt.hours;
                      return (
                        <button
                          key={opt.hours}
                          onClick={() => setAvailability(opt.hours)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            isSelected
                              ? "border-white/30 bg-white/[0.06]"
                              : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                          }`}
                        >
                          <div className="text-base font-semibold">{opt.label}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{opt.description}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Summary card */}
                {selectedPathData && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-5 rounded-2xl border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent"
                  >
                    <div className="text-xs uppercase tracking-wider text-slate-500 mb-3">
                      Your forge plan
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedPathData.gradient} flex items-center justify-center text-lg`}
                      >
                        {selectedPathData.emoji}
                      </div>
                      <div>
                        <div className="font-semibold">{selectedPathData.title}</div>
                        <div className="text-xs text-slate-400">{selectedPathData.tagline}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-white/[0.06]">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Timeline</div>
                        <div className="text-sm font-medium">{timeline} months</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Hours/week</div>
                        <div className="text-sm font-medium">{availability} hrs</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-0.5">Total commit</div>
                        <div className="text-sm font-medium">{(timeline * availability * 4).toLocaleString()} hrs</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer navigation */}
        <div className="mt-12 pt-6 border-t border-white/[0.06] flex items-center justify-between">
          <button
            onClick={() => step > 1 && setStep(step - 1)}
            disabled={step === 1}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  s === step ? "w-6 bg-white" : s < step ? "bg-white/50" : "bg-white/20"
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (step < totalSteps) setStep(step + 1);
              else handleComplete();
            }}
            disabled={!canProceed() || loading}
            className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold bg-white text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-white/5"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Forging...
              </>
            ) : step === totalSteps ? (
              <>
                Enter Dashboard
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            ) : (
              <>
                Next
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
