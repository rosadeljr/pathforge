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
import { AVATAR_CLASSES, type AvatarClassId } from "@/lib/data/avatar-classes";
import { track } from "@/lib/analytics/track";

/**
 * Learner setup — pick your grade + which subjects you want to focus on.
 * Shown once after a new learner signs up. Saved to
 * profiles.learner_grade and profiles.learner_subjects.
 */
export default function LearnerSetupPage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<"grade" | "subjects" | "class" | "parent">(
    "grade"
  );
  const [grade, setGrade] = useState<number | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [avatarClass, setAvatarClass] = useState<AvatarClassId | null>(null);
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
        // HARD navigation, not router.replace: the (app) layout caches the
        // profile from its own fetch, and a client-side nav would leave it
        // stale (learner_grade: null) — it would bounce straight back here,
        // ping-ponging forever. A full load refetches the profile.
        window.location.replace("/learn");
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

      const cleanedParentEmail = parentEmail.trim().toLowerCase();

      // learner_avatar_class is sent only when picked — column was added in
      // AVATAR_CLASS_MIGRATION. If the migration hasn't run yet, the update
      // will fail with "column does not exist"; we fall back to retrying
      // without that field so existing deploys don't break.
      // NOTE: parent_profile_id is resolved server-side via the
      // learner_link_parent RPC below — RLS blocks the kid from reading the
      // parent's row directly, so we can't look the id up from the client.
      const baseUpdate = {
        learner_grade: grade,
        learner_subjects: subjects.length ? subjects : null,
        parent_email: cleanedParentEmail || null,
      };
      const updatePayload: Record<string, unknown> = avatarClass
        ? { ...baseUpdate, learner_avatar_class: avatarClass }
        : baseUpdate;

      let { error } = await supabase
        .from("profiles")
        .update(updatePayload)
        .eq("id", session.user.id);

      // Graceful fallback: schema not yet migrated → drop avatar field & retry.
      // Match on the column name alone — PostgREST phrases this as
      // "Could not find the 'learner_avatar_class' column ... in the schema
      // cache", i.e. the column name comes BEFORE the word "column", so an
      // order-sensitive pattern misses it and the error reaches the user.
      if (
        error &&
        avatarClass &&
        /learner_avatar_class/i.test(error.message || "")
      ) {
        const retry = await supabase
          .from("profiles")
          .update(baseUpdate)
          .eq("id", session.user.id);
        error = retry.error;
      }
      if (error) throw error;

      // Link to the parent account server-side (RLS-safe). Records the
      // parent_email regardless, so a parent who signs up later can still claim
      // this kid via parent_claim_kids(). Non-fatal — never block onboarding.
      let parentLinked = false;
      if (cleanedParentEmail) {
        const { data: linked, error: linkErr } = await supabase.rpc(
          "learner_link_parent",
          { p_email: cleanedParentEmail }
        );
        if (linkErr) {
          console.warn("[setup] parent link non-fatal:", linkErr.message);
        } else {
          parentLinked = linked === true;
        }
      }

      // Ad-funnel: setup_complete (and parent_linked when we matched one).
      track(supabase, session.user.id, "setup_complete", {
        payload: {
          grade,
          subjects: subjects.length,
          avatar_class: avatarClass,
          had_parent_email: cleanedParentEmail.length > 0,
        },
      });
      if (parentLinked) {
        track(supabase, session.user.id, "parent_linked", {
          payload: { had_parent_email: true },
        });
      }

      // HARD navigation (see the mount check above): the (app) layout's cached
      // profile still has learner_grade null and would redirect any client-side
      // nav right back to /learn/setup — an infinite onboarding loop.
      window.location.assign("/learn");
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
            <span className="text-slate-700">·</span>
            <span className={step === "class" ? "text-white font-medium" : ""}>3. Class</span>
            {requiresParentConsent && (
              <>
                <span className="text-slate-700">·</span>
                <span className={step === "parent" ? "text-white font-medium" : ""}>4. Parent</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              {step === "grade" && (
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
                          aria-pressed={isPicked}
                          aria-label={`Grade ${g}, ${t === "little" ? "ages 6 to 9" : t === "junior" ? "ages 10 to 13" : "ages 14 to 15"}`}
                          className={`relative p-4 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${
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
              )}

              {step === "subjects" && (
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
                      onClick={() => setStep("class")}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-900 font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                      Next
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === "class" && (
                <motion.div
                  key="class"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🎒</div>
                    <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
                      Pick your class
                    </h1>
                    <p className="text-sm text-slate-400 max-w-md mx-auto">
                      Choose the one that feels most like you. It's just for fun
                      — no advantage, just style. You can change later.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    {AVATAR_CLASSES.map((c) => {
                      const isPicked = avatarClass === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setAvatarClass(c.id)}
                          aria-pressed={isPicked}
                          aria-label={`Choose the ${c.name} class`}
                          className={`relative text-left p-4 rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/70 ${
                            isPicked
                              ? "border-amber-400/60 bg-amber-500/[0.08]"
                              : "border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/[0.16]"
                          }`}
                          style={
                            isPicked
                              ? { boxShadow: `0 6px 24px ${c.accent}30` }
                              : undefined
                          }
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                              style={{
                                background: `linear-gradient(135deg, ${c.accent}33, ${c.accent}11)`,
                                border: `1px solid ${c.accent}55`,
                              }}
                            >
                              {c.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold">
                                {c.name}
                              </div>
                              <div
                                className="text-[11px] mt-0.5"
                                style={{ color: c.accent }}
                              >
                                {c.tagline}
                              </div>
                              <div className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                                {c.vibe}
                              </div>
                            </div>
                            {isPicked && (
                              <div className="w-5 h-5 rounded-full bg-amber-400 flex items-center justify-center flex-shrink-0">
                                <Check
                                  size={11}
                                  strokeWidth={3}
                                  className="text-slate-900"
                                />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-xs text-slate-500 text-center mt-5">
                    Skip if you can't decide — you can pick one anytime from your
                    profile.
                  </p>

                  <div className="mt-7 flex items-center justify-between">
                    <button
                      onClick={() => setStep("subjects")}
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
                      onClick={() => setStep("class")}
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
