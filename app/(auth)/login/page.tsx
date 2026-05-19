"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LoginSchema } from "@/lib/validations";
import toast from "react-hot-toast";
import Link from "next/link";
import { Zap, AlertCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        session_expired: "Your session has expired. Please log in again.",
        auth_error: "Authentication error. Please try again.",
        auth_failed: "Authentication failed. Please check your credentials.",
      };
      toast.error(errorMessages[error] || "An error occurred. Please try again.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (configError) {
      toast.error("System configuration error. Please contact support.");
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
        console.error("Supabase auth error:", error);
        throw error;
      }

      if (!data.user) {
        throw new Error("No user returned from authentication");
      }

      toast.success("Welcome back!");
      // Force a refresh to ensure session is established
      router.refresh();
      router.push("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      const message = error?.message || "Failed to sign in";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-slate-950" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">PathForge</h1>
          </div>
          <p className="text-slate-400 text-sm">Forge your future, one quest at a time</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 backdrop-blur-xl">
          <h2 className="text-xl font-semibold mb-6">Welcome Back</h2>

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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-slate-50 placeholder-slate-500" disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-slate-50 placeholder-slate-500" disabled={loading} />
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2 rounded-lg transition-all duration-200">
              {loading ? "Forging..." : "Enter Your Path"}
            </button>
          </form>

          <p className="text-center text-slate-400 text-sm mt-6">
            New forger? <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 font-semibold">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
