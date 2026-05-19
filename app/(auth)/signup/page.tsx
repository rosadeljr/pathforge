"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignUpSchema } from "@/lib/validations";
import toast from "react-hot-toast";
import Link from "next/link";
import { Zap, AlertCircle } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    // Check if environment variables are configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setConfigError(true);
      toast.error(
        "Configuration error: Supabase credentials not found. Contact support."
      );
    }

    // Check for error from redirect
    const error = searchParams.get("error");
    if (error) {
      const errorMessages: Record<string, string> = {
        session_expired: "Your session has expired. Please try again.",
        auth_error: "Authentication error. Please try again.",
        auth_failed: "Authentication failed. Please check your input.",
      };
      toast.error(errorMessages[error] || "An error occurred. Please try again.");
    }
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (configError) {
      toast.error("System configuration error. Please contact support.");
      return;
    }

    setLoading(true);

    try {
      const validatedData = SignUpSchema.parse({ email, password, username });

      const { error: authError, data } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (authError) {
        console.error("Supabase signup error:", authError);
        throw authError;
      }

      if (data.user) {
        // Insert user profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: data.user.id,
          email: validatedData.email,
          username: validatedData.username,
        });

        if (profileError) {
          console.error("Profile insert error:", profileError);
          throw profileError;
        }

        toast.success("Account created! Redirecting...");
        router.refresh();
        router.push("/onboarding");
      }
    } catch (error: any) {
      console.error("Sign up error:", error);
      const message = error?.message || "Failed to sign up";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900/30 to-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float animation-delay-2000" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <Link href="/" className="inline-flex items-center justify-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center hover-lift">
              <Zap className="w-6 h-6 text-black" />
            </div>
            <span className="text-2xl font-bold gradient-text">PathForge</span>
          </Link>
          <h2 className="text-3xl font-bold mb-2">Start Your Journey</h2>
          <p className="text-slate-400">Forge your future, one quest at a time</p>
        </div>

        <div className="glass-dark rounded-2xl p-8 animate-slide-in-up">
          {configError && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-rose-300 font-medium">Configuration Error</p>
                <p className="text-xs text-rose-200 mt-1">
                  The application is not properly configured. Please ensure environment variables are set correctly.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose your forge name"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:bg-slate-800 text-white placeholder-slate-500 transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:bg-slate-800 text-white placeholder-slate-500 transition-all"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg focus:border-cyan-500 focus:bg-slate-800 text-white placeholder-slate-500 transition-all"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 btn-gradient font-semibold py-3 rounded-lg transition-all hover-lift disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating..." : "Forge My Path"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            Already forging? <Link href="/login" className="text-cyan-400 hover:text-cyan-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
