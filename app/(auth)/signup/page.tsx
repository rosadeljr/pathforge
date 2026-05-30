"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { track } from "@/lib/analytics/track";
import { trackConversion, readUtm } from "@/lib/marketing/track";
import {
  AlertCircle,
  Mail,
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
  Check,
  CheckCircle2,
} from "lucide-react";
import { isProfaneUsername } from "@/lib/validations/username";

interface FieldErrors {
  email?: string;
  password?: string;
  username?: string;
}

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState<"learner" | "parent">("learner");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setConfigError(true);
    }

    const error = searchParams.get("error");
    if (error) {
      const errorMessages: Record<string, string> = {
        session_expired: "Your session has expired. Please try again.",
        auth_error: "Authentication error. Please try again.",
        auth_failed: "Sign up failed. Please check your input.",
      };
      toast.error(errorMessages[error] || "An error occurred.");
    }
  }, [searchParams]);

  // Password strength calculation
  const passwordStrength = (() => {
    if (!password) return { score: 0, label: "", color: "" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
    if (score <= 2) return { score, label: "Fair", color: "bg-amber-500" };
    if (score <= 3) return { score, label: "Good", color: "bg-blue-500" };
    return { score, label: "Strong", color: "bg-emerald-500" };
  })();

  const validateField = (field: keyof FieldErrors, value: string) => {
    const errors = { ...fieldErrors };
    if (field === "email") {
      if (!value) errors.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) errors.email = "Please enter a valid email";
      else delete errors.email;
    }
    if (field === "password") {
      if (!value) errors.password = "Password is required";
      else if (value.length < 8) errors.password = "Must be at least 8 characters";
      else delete errors.password;
    }
    if (field === "username") {
      if (!value) errors.username = "Name is required";
      else if (value.length < 3) errors.username = "Must be at least 3 characters";
      else if (!/^[a-zA-Z0-9_-]+$/.test(value)) errors.username = "Only letters, numbers, _ and -";
      else if (isProfaneUsername(value)) errors.username = "Please choose a different username";
      else delete errors.username;
    }
    setFieldErrors(errors);
  };

  const isFormValid = () => {
    return (
      email &&
      password &&
      username &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
      password.length >= 8 &&
      username.length >= 3 &&
      /^[a-zA-Z0-9_-]+$/.test(username) &&
      !isProfaneUsername(username)
    );
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (configError) {
      toast.error("Service unavailable. Please contact support.");
      return;
    }

    // Validate everything
    validateField("email", email);
    validateField("password", password);
    validateField("username", username);
    setTouched({ email: true, password: true, username: true });

    if (!isFormValid()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      // Sign up - pass username as metadata so DB trigger can use it
      const { error: authError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: username,
          },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (authError) {
        console.error("[signup] auth error:", authError);

        const msg = authError.message?.toLowerCase() || "";
        if (msg.includes("email rate limit")) {
          toast.error(
            "Email rate limit hit. Either disable email confirmation in Supabase, or wait ~1 hour and try a different email.",
            { duration: 8000 }
          );
        } else if (msg.includes("already registered") || msg.includes("already been registered") || msg.includes("user already")) {
          toast.error("This email is already registered. Try signing in instead.");
        } else if (msg.includes("invalid email")) {
          toast.error("Please enter a valid email address.");
        } else if (msg.includes("password")) {
          toast.error(authError.message);
        } else if (msg.includes("rate") || msg.includes("too many")) {
          toast.error("Too many attempts. Please wait a moment and try again.");
        } else {
          toast.error(authError.message || "Sign up failed. Please try again.");
        }
        return;
      }

      if (!data.user) {
        console.error("[signup] no user returned from supabase");
        toast.error(
          "This email may already be registered. Try signing in, or use a different email.",
          { duration: 6000 }
        );
        return;
      }

      // Try to create/update profile - don't fail signup if this errors
      const isParent = role === "parent";
      try {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            email: data.user.email || email,
            username,
            user_mode: "learner",
            is_parent_account: isParent,
          },
          { onConflict: "id" }
        );
        if (profileError) {
          console.warn("[signup] profile upsert (non-fatal):", profileError);
        }
      } catch (profileError) {
        console.warn("[signup] profile upsert threw (non-fatal):", profileError);
      }

      // If signing up as a parent, auto-link any existing kid profiles
      // whose parent_email matches the parent's email.
      if (isParent && data.user) {
        try {
          const { data: linked, error: linkErr } = await supabase
            .from("profiles")
            .update({ parent_profile_id: data.user.id })
            .eq("parent_email", email.toLowerCase().trim())
            .neq("id", data.user.id)
            .select("id");
          if (linkErr) {
            console.warn("[signup] kid link (non-fatal):", linkErr);
          } else if (linked && linked.length > 0) {
            toast.success(`Linked ${linked.length} kid${linked.length > 1 ? "s" : ""} to your account 👨‍👩‍👧‍👦`, {
              duration: 5000,
            });
          }
        } catch (e) {
          console.warn("[signup] kid link threw (non-fatal):", e);
        }
      }

      // Check if email confirmation is required
      if (data.session) {
        // Track signup — internal analytics + paid-ad pixels
        const utm = readUtm();
        track(supabase, data.user.id, "signup", {
          payload: { username, email, role, ...utm },
        });
        trackConversion("Lead", { contentName: role });
        toast.success("Welcome to PathForge");
        // Parents go straight to /parent. Kids go to setup.
        window.location.href = isParent ? "/parent" : "/learn/setup";
      } else {
        toast.success("Check your email to verify your account", { duration: 6000 });
        router.push("/login?error=email_verification_sent");
      }
    } catch (error: any) {
      console.error("[signup] unexpected error:", error);
      toast.error(error?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent 70%)" }}
        />
        <div
          className="absolute bottom-0 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)" }}
        />

        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Form Panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12 order-2 lg:order-1">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-sm"
          >
            {/* Mobile logo */}
            <Link href="/" className="lg:hidden inline-flex items-center gap-2.5 mb-10">
              <Logo size={36} />
              <span className="text-lg font-semibold tracking-tight">PathForge</span>
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-semibold tracking-tight mb-2">
                Create your account
              </h2>
              <p className="text-sm text-slate-400">
                Start learning in under a minute.
              </p>
            </div>

            {/* Role toggle */}
            <div className="mb-6">
              <div className="text-xs font-medium text-slate-300 mb-2">
                I'm signing up as:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("learner")}
                  className={`relative p-3 rounded-xl border text-left transition-all ${
                    role === "learner"
                      ? "border-indigo-400/50 bg-indigo-500/[0.10]"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="text-lg mb-1">🎒</div>
                  <div className="text-xs font-semibold">A learner</div>
                  <div className="text-[10px] text-slate-500">Ages 6–15</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole("parent")}
                  className={`relative p-3 rounded-xl border text-left transition-all ${
                    role === "parent"
                      ? "border-rose-400/50 bg-rose-500/[0.10]"
                      : "border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="text-lg mb-1">👨‍👩‍👧‍👦</div>
                  <div className="text-xs font-semibold">A parent</div>
                  <div className="text-[10px] text-slate-500">Track your kids</div>
                </button>
              </div>
              {role === "parent" && (
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  💡 Use the <span className="text-white">same email</span> your kid entered as their parent email — we'll link them to your account automatically.
                </p>
              )}
            </div>

            {/* Config Error */}
            <AnimatePresence>
              {configError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-6 p-3.5 rounded-lg bg-red-500/[0.08] border border-red-500/20 flex gap-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="text-red-300 font-medium">Service unavailable</p>
                    <p className="text-red-300/70 mt-0.5">
                      Authentication is misconfigured. Please contact support.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Username */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Username
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      if (touched.username) validateField("username", e.target.value);
                    }}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, username: true }));
                      validateField("username", username);
                    }}
                    placeholder="janedoe"
                    autoComplete="username"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                      fieldErrors.username
                        ? "border-red-500/50 focus:border-red-500/50"
                        : "border-white/[0.06] focus:border-indigo-500/50"
                    }`}
                    disabled={loading}
                  />
                  {!fieldErrors.username && username.length >= 3 && /^[a-zA-Z0-9_-]+$/.test(username) && (
                    <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  )}
                </div>
                {fieldErrors.username && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1.5"
                  >
                    {fieldErrors.username}
                  </motion.p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) validateField("email", e.target.value);
                    }}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, email: true }));
                      validateField("email", email);
                    }}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white/[0.03] border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                      fieldErrors.email
                        ? "border-red-500/50 focus:border-red-500/50"
                        : "border-white/[0.06] focus:border-indigo-500/50"
                    }`}
                    disabled={loading}
                  />
                  {!fieldErrors.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
                    <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  )}
                </div>
                {fieldErrors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1.5"
                  >
                    {fieldErrors.email}
                  </motion.p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) validateField("password", e.target.value);
                    }}
                    onBlur={() => {
                      setTouched((t) => ({ ...t, password: true }));
                      validateField("password", password);
                    }}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white/[0.03] border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                      fieldErrors.password
                        ? "border-red-500/50 focus:border-red-500/50"
                        : "border-white/[0.06] focus:border-indigo-500/50"
                    }`}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password strength */}
                {password.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2"
                  >
                    <div className="flex gap-1 mb-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= passwordStrength.score ? passwordStrength.color : "bg-white/[0.06]"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <span className="text-slate-500">Strength:</span>
                      <span
                        className={`font-medium ${
                          passwordStrength.score <= 1
                            ? "text-red-400"
                            : passwordStrength.score <= 2
                            ? "text-amber-400"
                            : passwordStrength.score <= 3
                            ? "text-blue-400"
                            : "text-emerald-400"
                        }`}
                      >
                        {passwordStrength.label}
                      </span>
                    </p>
                  </motion.div>
                )}

                {fieldErrors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs text-red-400 mt-1.5"
                  >
                    {fieldErrors.password}
                  </motion.p>
                )}
              </div>

              {/* Terms */}
              <p className="text-xs text-slate-500 leading-relaxed pt-1">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-slate-300 hover:text-white underline underline-offset-2">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-slate-300 hover:text-white underline underline-offset-2">
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || configError}
                className="group relative w-full py-2.5 mt-2 rounded-lg font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden bg-[linear-gradient(110deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)] bg-[length:200%_100%] hover:bg-[position:100%_0] shadow-[0_8px_24px_-4px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Creating account</span>
                  </>
                ) : (
                  <>
                    <span>Create account</span>
                    <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
            </div>

            {/* Google sign-up */}
            <div className="mb-6">
              <GoogleButton label="Sign up with Google" />
            </div>

            {/* Login link */}
            <p className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-white hover:text-indigo-300 transition-colors"
              >
                Sign in
              </Link>
            </p>

            {/* Mobile footer */}
            <div className="lg:hidden mt-12 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={12} />
              <span>End-to-end encrypted</span>
            </div>
          </motion.div>
        </div>

        {/* Right Brand Panel (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 xl:p-16 relative order-1 lg:order-2">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit ml-auto">
            <Logo size={36} />
            <span className="text-lg font-semibold tracking-tight">PathForge</span>
          </Link>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl ml-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                For Filipino students, ages 6–15
              </span>
            </div>

            <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Learning,
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                leveled up.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-md mb-10">
              Quests, streaks, mascots, confetti — and 32 careers to unlock as
              your kid learns. School, but actually fun.
            </p>

            {/* Feature list */}
            <ul className="space-y-3.5">
              {[
                "5 core PH subjects, grades 1–10",
                "Kid-safe AI tutor that adapts to age",
                "Career adventures with 5-stage progression",
                "Parent dashboard with weekly progress",
              ].map((feature, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
                  className="flex items-start gap-3 text-sm text-slate-300"
                >
                  <div className="mt-0.5 w-5 h-5 rounded-full bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <Check size={12} className="text-amber-300" strokeWidth={3} />
                  </div>
                  <span>{feature}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} />
            <span>Kid-safe AI · Filipino-built · No ads</span>
          </div>
        </div>
      </div>
    </div>
  );
}
