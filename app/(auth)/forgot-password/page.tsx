"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { clientAppUrl } from "@/lib/site-url";
import { Logo } from "@/components/brand/Logo";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowRight, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

/**
 * Self-contained password reset. Two modes in one page:
 *   1. Request: enter email → Supabase emails a recovery link that routes
 *      through /api/auth/callback (which exchanges the code) back here.
 *   2. Reset: when this page loads inside that recovery session, show a
 *      "set a new password" form (auth.updateUser).
 */
export default function ForgotPassword() {
  const router = useRouter();
  const supabase = createClient();
  const [mode, setMode] = useState<"checking" | "request" | "reset">("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  // If we arrive with an active (recovery) session, switch to reset mode.
  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!active) return;
      setMode(data?.user ? "reset" : "request");
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  async function sendReset(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Enter a valid email");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
        redirectTo: `${clientAppUrl()}/api/auth/callback?next=/forgot-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't send the reset email");
    } finally {
      setLoading(false);
    }
  }

  async function setNewPassword(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Use at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Password updated");
      window.location.href = "/learn";
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Couldn't update password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070a11] px-6">
      <span aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-20 blur-3xl" style={{ background: "#7c5cff" }} />
      <div className="relative w-full max-w-sm">
        <div className="mb-7 flex justify-center">
          <Logo size={36} showWordmark />
        </div>

        {mode === "checking" && (
          <div className="flex justify-center py-10 text-slate-500">
            <Loader2 size={20} className="animate-spin" />
          </div>
        )}

        {mode === "request" && (
          sent ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-center">
              <CheckCircle2 className="mx-auto text-emerald-400" size={28} />
              <h1 className="mt-3 text-lg font-bold text-white">Check your email</h1>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-slate-400">
                If an account exists for <span className="text-slate-200">{email}</span>, we sent a link to reset your password.
              </p>
              <Link href="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-violet-300 hover:text-violet-200">
                <ArrowLeft size={14} /> Back to log in
              </Link>
            </div>
          ) : (
            <form onSubmit={sendReset} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h1 className="text-xl font-bold text-white">Reset your password</h1>
              <p className="mt-1 text-sm text-slate-400">We&apos;ll email you a secure link to set a new one.</p>
              <div className="relative mt-5">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-slate-900 transition active:scale-[0.98] disabled:opacity-60"
                style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <>Send reset link <ArrowRight size={15} /></>}
              </button>
              <Link href="/login" className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white">
                <ArrowLeft size={13} /> Back to log in
              </Link>
            </form>
          )
        )}

        {mode === "reset" && (
          <form onSubmit={setNewPassword} className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h1 className="text-xl font-bold text-white">Set a new password</h1>
            <p className="mt-1 text-sm text-slate-400">Pick something you&apos;ll remember — at least 8 characters.</p>
            <div className="relative mt-5">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="New password"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-400/50 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-slate-900 transition active:scale-[0.98] disabled:opacity-60"
              style={{ background: "linear-gradient(180deg,#fcd34d,#f59e0b)" }}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
