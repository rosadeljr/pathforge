"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowRight, Check, Loader2, GraduationCap } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/Logo";
import {
  SUBJECTS,
  ALL_GRADES,
  ageTierForGrade,
  ageRangeForTier,
  TIER_COPY,
} from "@/lib/data/learner";

/**
 * Learner setup — pick your grade + which subjects you want to focus on.
 * Shown once after a new learner signs up. Saved to
 * profiles.learner_grade and profiles.learner_subjects.
 */
export default function LearnerSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"grade" | "subjects" | "parent">("grade");
  const [grade, setGrade] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [parentEmail, setParentEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [redirecting, setRedirecting] = useState(true);

  // Approximate age from grade: Grade 1 ≈ age 6, Grade 7 ≈ age 12.
  // Anything Grade 7 or below = under 13 = parent consent required.
  const requiresParentConsent = grade !== null && grade <= 7;

  // If they already have grade set, bounce out.
  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_mode, learner_grade")
        .eq("id", session.user.id)
        .maybeSingle();
      // Make sure user_mode is learner — single-track app.
      if (profile && (profile as any).user_mode !== "learner") {
        await supabase
          .from("profiles")
          .update({ user_mode: "learner" })
          .eq("id", session.user.id);
      }
      if (profile?.learner_grade != null) {
        router.replace("/learn");
        return;
      }
      setRedirecting(false);
    }
    check();
  }, [router, supabase]);

  function toggleSubject(id: string) {
    setSubjects((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }

  async function finish() {
    if (!grade) return;
    // Under-13s must provide a parent email
    if (requiresParentConsent && !parentEmail.includes("@")) {
      toast.error("Parent email is required for kids under 13.");
      setStep("parent");
      return;
    }
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not signed in");

      // If a parent email was provided, see if that parent already has an
      // account — if so, link this kid to them right now (retroactive link).
      let parentProfileId: string | null = null;
      const cleanedParentEmail = parentEmail.trim().toLowerCase();
      if (cleanedParentEmail) {
        const { data: parentProfile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", cleanedParentEmail)
          .eq("is_parent_account", true)
          .maybeSingle();
        if (parentProfile?.id) parentProfileId = parentProfile.id;
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          learner_grade: grade,
          learner_subjects: subjects.length ? subjects : null,
          parent_email: cleanedParentEmail || null,
          parent_profile_id: parentProfileId,
        })
        .eq("id", session.user.id);
      if (error) throw error;
      router.replace("/learn");
    } catch (e: any) {
      toast.error(e?.message || "Couldn't save. Try again.");
      setSaving(false);
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 size={20} className="animate-spin text-white/40" />
      </div>
    );
  }

  const tier = grade ? ageTierForGrade(grade) : null;
  const tierCopy = tier ? TIER_COPY[tier] : null;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="px-6 py-5 sm:px-8 sm:py-6 flex items-center justify-between">
          <div className="inline-flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-semibold tracking-tight">PathForge</span>
          </div>
          <div className="text-xs text-slate-500 inline-flex items-center gap-2">
            <span className={step === "grade" ? "text-white font-medium" : ""}>1. Grade</span>
            <span className="text-slate-700">·</span>
            <span className={step === "subjects" ? "text-white font-medium" : ""}>2. Subjects</span>
            {requiresParentConsent && (
              <>
                <span className="text-slate-700">·</span>
                <span className={step === "parent" ? "text-white font-medium" : ""}>3. Parent</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {step === "grade" ? (
                <motion.div
                  key="grade"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 mb-4">
                      <GraduationCap size={22} className="text-white" />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                      What grade are you in?
                    </h1>
                    <p className="text-sm text-slate-400">
                      Pick yours — we'll match you with the right lessons.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {ALL_GRADES.map((g) => {
                      const isPicked = grade === g;
                      const t = ageTierForGrade(g);
                      return (
                        <button
                          key={g}
                          onClick={() => setGrade(g)}
                          className={`relative p-4 rounded-xl border transition-all ${
                            isPicked
                              ? "border-amber-400/60 bg-amber-500/[0.08]"
                              : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.16]"
                          }`}
                        >
                          <div className="text-xs uppercase tracking-wider text-slate-500 mb-1 font-semibold">
                            Grade
                          </div>
                          <div className="text-2xl font-bold tabular-nums">{g}</div>
                          <div className="text-[10px] text-slate-500 mt-1 capitalize">
                            {t === "little" ? "Ages 6–9" : t === "junior" ? "Ages 10–13" : "Ages 14–15"}
                          </div>
                          {isPicked && (
                            <motion.div
                              layoutId="picked-grade"
                              className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center shadow-lg"
                            >
                              <Check size={10} strokeWidth={3} className="text-slate-900" />
                            </motion.div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {tierCopy && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center"
                    >
                      <div className="text-2xl mb-1">{tierCopy.emoji}</div>
                      <div className="text-sm font-semibold mb-0.5">{tierCopy.label}</div>
                      <div className="text-xs text-slate-400">{tierCopy.tagline}</div>
                    </motion.div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={() => grade && setStep("subjects")}
                      disabled={!grade}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-semibold text-sm hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="subjects"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-8">
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                      Pick your subjects
                    </h1>
                    <p className="text-sm text-slate-400">
                      Choose the ones you want to focus on — you can change later.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {SUBJECTS.map((s) => {
                      const isPicked = subjects.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          onClick={() => toggleSubject(s.id)}
                          className={`relative text-left p-4 rounded-xl border transition-all ${
                            isPicked
                              ? "border-amber-400/60 bg-amber-500/[0.08]"
                              : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.16]"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-xl shadow-lg`}
                              style={{ boxShadow: `0 6px 18px ${s.accentColor}30` }}
                            >
                              {s.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold">{s.title}</div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {s.filipinoTitle}
                              </div>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${
                                isPicked
                                  ? "bg-amber-400 border-amber-400"
                                  : "border-white/20"
                              }`}
                            >
                              {isPicked && <Check size={11} strokeWidth={3} className="text-slate-900" />}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-500 text-center mt-5">
                    Skip if you're not sure — you can always pick later.
                  </p>

                  <div className="mt-7 flex items-center justify-between">
                    <button
                      onClick={() => setStep("grade")}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={() => {
                        if (requiresParentConsent) {
                          setStep("parent");
                        } else {
                          finish();
                        }
                      }}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          {requiresParentConsent ? "Next" : "Start learning"}
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "parent" && (
                <motion.div
                  key="parent"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-8">
                    <div className="text-5xl mb-3">👨‍👩‍👧‍👦</div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                      Parent or guardian email
                    </h1>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Required for kids under 13 (Philippine Data Privacy Act). We'll only
                      use it for weekly progress emails and account recovery — never for ads,
                      never shared.
                    </p>
                  </div>

                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Parent / guardian email
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="parent@example.com"
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-sm focus:outline-none focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/20 transition-all"
                  />
                  <p className="text-[10px] text-slate-500 mt-1.5">
                    Have your parent or guardian enter their email — they'll be linked to
                    your account.
                  </p>

                  <div className="mt-7 flex items-center justify-between">
                    <button
                      onClick={() => setStep("subjects")}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={finish}
                      disabled={saving || !parentEmail.includes("@")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold text-sm hover:opacity-90 disabled:opacity-40 transition-opacity"
                    >
                      {saving ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Saving…
                        </>
                      ) : (
                        <>
                          Start learning
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
