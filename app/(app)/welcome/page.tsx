"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Briefcase,
  GraduationCap,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/brand/Logo";

/**
 * Mode picker — shown once when a user signs up. Routes them into the
 * career-track or learner-track experience and never appears again
 * (they can switch later in settings if we add that affordance).
 */
export default function WelcomePage() {
  const [picking, setPicking] = useState<"career" | "learner" | null>(null);
  const [redirecting, setRedirecting] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      // If user has already picked, send them home.
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_mode")
        .eq("id", session.user.id)
        .maybeSingle();
      if (profile?.user_mode === "career") {
        router.replace("/dashboard");
        return;
      }
      if (profile?.user_mode === "learner") {
        router.replace("/learn");
        return;
      }
      setRedirecting(false);
    }
    check();
  }, [router, supabase]);

  async function pick(mode: "career" | "learner") {
    setPicking(mode);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) throw new Error("Not signed in");
      const { error } = await supabase
        .from("profiles")
        .update({ user_mode: mode })
        .eq("id", session.user.id);
      if (error) throw error;
      router.replace(mode === "career" ? "/onboarding" : "/learn");
    } catch (e: any) {
      toast.error(e?.message || "Couldn't save that. Try again.");
      setPicking(null);
    }
  }

  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
        <Loader2 size={20} className="animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)" }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)" }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="px-6 py-5 sm:px-8 sm:py-6">
          <div className="inline-flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-semibold tracking-tight">PathForge</span>
          </div>
        </div>

        {/* Picker */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight mb-3">
                Who's this for?
              </h1>
              <p className="text-base text-slate-400">
                Pick the path that fits — you can change later in settings.
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Career card */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                onClick={() => pick("career")}
                disabled={picking !== null}
                className="group relative overflow-hidden text-left rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8 hover:border-indigo-400/40 hover:bg-white/[0.06] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"
                  style={{ background: "radial-gradient(circle, rgba(99,102,241,0.5), transparent 70%)" }}
                />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30 mb-5">
                    <Briefcase size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-2">
                    I'm building my career
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Career roadmaps, daily quests, ForgeBot AI coach, resume
                    builder, mock interview, and a verifiable certificate when
                    you finish.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-300">
                    {picking === "career" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Loading…
                      </>
                    ) : (
                      <>
                        Continue as Forger
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </div>
              </motion.button>

              {/* Learner card */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                onClick={() => pick("learner")}
                disabled={picking !== null}
                className="group relative overflow-hidden text-left rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 sm:p-8 hover:border-amber-400/40 hover:bg-white/[0.06] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <div
                  className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-30 pointer-events-none group-hover:opacity-50 transition-opacity"
                  style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)" }}
                />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 mb-5">
                    <GraduationCap size={20} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold tracking-tight mb-2">
                    I'm a student (ages 6–18)
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed mb-6">
                    Fun, interactive lessons across Math, English, Filipino,
                    Science, and Araling Panlipunan — built for Grades 1–12
                    in the Philippines. Quests, streaks, levels, and friends.
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-300">
                    {picking === "learner" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" />
                        Loading…
                      </>
                    ) : (
                      <>
                        Start learning
                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </div>
              </motion.button>
            </div>

            <p className="text-xs text-slate-500 text-center mt-8">
              Under 13? Have a parent or guardian help you sign up — we'll ask
              for their email next.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
