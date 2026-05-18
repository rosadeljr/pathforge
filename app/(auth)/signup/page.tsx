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
          <h2 className="text-xl font-semibold mb-6">Start Your Journey</h2>

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Username</label>
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose your forge name" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-slate-50 placeholder-slate-500" disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-slate-50 placeholder-slate-500" disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-cyan-400 text-slate-50 placeholder-slate-500" disabled={loading} />
            </div>

            <button type="submit" disabled={loading} className="w-full mt-6 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-2 rounded-lg transition-all duration-200">
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
