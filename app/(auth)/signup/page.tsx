"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { SignUpSchema } from "@/lib/validations";
import toast from "react-hot-toast";
import Link from "next/link";
import { Zap } from "lucide-react";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = SignUpSchema.parse({ email, password, username });

      const { error: authError, data } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (authError) throw authError;

      if (data.user) {
        await supabase.from("profiles").insert({
          id: data.user.id,
          email: validatedData.email,
          username: validatedData.username,
        });

        toast.success("Account created! Redirecting...");
        router.push("/onboarding");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
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
