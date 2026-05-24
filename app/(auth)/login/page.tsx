"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LoginSchema } from "@/lib/validations";
import toast from "react-hot-toast";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { GoogleButton } from "@/components/auth/GoogleButton";
import {
  AlertCircle,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
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
    if (error === "email_verification_sent") {
      toast.success("Check your email to verify your account before signing in.", { duration: 6000 });
    } else if (error) {
      const errorMessages: Record<string, string> = {
        session_expired: "Your session has expired. Please sign in again.",
        auth_error: "Authentication error. Please try again.",
        auth_failed: "Sign in failed. Please check your credentials.",
      };
      toast.error(errorMessages[error] || "An error occurred. Please try again.");
    }
  }, [searchParams]);

  const validateField = (field: "email" | "password", value: string) => {
    const errors = { ...fieldErrors };
    if (field === "email") {
      if (!value) {
        errors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.email = "Please enter a valid email";
      } else {
        delete errors.email;
      }
    }
    if (field === "password") {
      if (!value) {
        errors.password = "Password is required";
      } else {
        delete errors.password;
      }
    }
    setFieldErrors(errors);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (configError) {
      toast.error("System unavailable. Please contact support.");
      return;
    }

    // Validate before submitting
    validateField("email", email);
    validateField("password", password);
    if (!email || !password || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return;
    }

    setLoading(true);

    try {
      const validatedData = LoginSchema.parse({ email, password });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        console.error("Auth error:", error);
        if (error.message.includes("Invalid login")) {
          toast.error("Incorrect email or password");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Please verify your email before signing in");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (!data.user) {
        toast.error("Authentication failed");
        return;
      }

      toast.success("Welcome back");
      // Hard navigation ensures cookies are fully established before
      // the next page's auth check runs. router.push can race.
      window.location.href = "/learn";
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error?.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Subtle ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft gradient orbs */}
        <div className="absolute top-0 -left-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(99, 102, 241, 0.3), transparent 70%)" }} />
        <div className="absolute bottom-0 -right-40 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent 70%)" }} />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Noise texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        {/* Left Brand Panel (desktop only) */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 xl:p-16 relative">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2.5 group w-fit">
            <Logo size={36} />
            <span className="text-lg font-semibold tracking-tight">PathForge</span>
          </Link>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] mb-6">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                K-12 learning, gamified · ages 6–18
              </span>
            </div>

            <h1 className="text-5xl xl:text-6xl font-semibold tracking-tight leading-[1.05] mb-6">
              Where kids
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                forge their future.
              </span>
            </h1>

            <p className="text-lg text-slate-400 leading-relaxed max-w-md">
              Fun, interactive K-12 lessons across Math, English, Filipino, Science,
              and Araling Panlipunan — with a kid-safe AI tutor.
            </p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 max-w-md">
              {[
                { value: "5", label: "Core subjects" },
                { value: "32", label: "Careers to unlock" },
                { value: "1–12", label: "Grades (K-12)" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                >
                  <div className="text-2xl font-semibold tracking-tight">{stat.value}</div>
                  <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Footer */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck size={14} />
            <span>Kid-safe AI · Filipino-built · No ads</span>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-12">
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
            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-tight mb-2">
                Welcome back
              </h2>
              <p className="text-sm text-slate-400">
                Sign in to continue your journey.
              </p>
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

            <form onSubmit={handleLogin} className="space-y-5">
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
                      if (fieldErrors.email) validateField("email", e.target.value);
                    }}
                    onBlur={() => validateField("email", email)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={`w-full pl-10 pr-4 py-2.5 bg-white/[0.03] border rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
                      fieldErrors.email
                        ? "border-red-500/50 focus:border-red-500/50"
                        : "border-white/[0.06] focus:border-indigo-500/50"
                    }`}
                    disabled={loading}
                  />
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
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs text-slate-400 hover:text-white transition-colors"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) validateField("password", e.target.value);
                    }}
                    onBlur={() => validateField("password", password)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
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

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || configError}
                className="group relative w-full py-2.5 rounded-lg font-semibold text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden bg-[linear-gradient(110deg,#6366f1,#a855f7,#ec4899,#a855f7,#6366f1)] bg-[length:200%_100%] hover:bg-[position:100%_0] shadow-[0_8px_24px_-4px_rgba(99,102,241,0.4),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_12px_32px_-4px_rgba(99,102,241,0.55),inset_0_1px_0_rgba(255,255,255,0.2)] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Signing in</span>
                  </>
                ) : (
                  <>
                    <span>Sign in</span>
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

            {/* Google sign-in */}
            <div className="mb-6">
              <GoogleButton label="Sign in with Google" />
            </div>

            {/* Signup link */}
            <p className="text-center text-sm text-slate-400">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="font-medium text-white hover:text-indigo-300 transition-colors"
              >
                Create one
              </Link>
            </p>

            {/* Mobile footer */}
            <div className="lg:hidden mt-12 flex items-center justify-center gap-2 text-xs text-slate-500">
              <ShieldCheck size={12} />
              <span>Kid-safe · Filipino-built</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
