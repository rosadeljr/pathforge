"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { LoginSchema } from "@/lib/validations";
import toast from "react-hot-toast";
import Link from "next/link";
import { Zap, AlertCircle, Sparkles, Sword, Mail, Lock, ArrowRight } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setConfigError(true);
      toast.error(
        "Configuration error: Supabase credentials not found. Contact support."
      );
    }

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

      toast.success("⚡ Welcome back, Hunter!");
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

  // Floating rune positions (deterministic for SSR)
  const runes = [
    { x: "10%", y: "15%", delay: 0, size: 20 },
    { x: "85%", y: "20%", delay: 0.5, size: 24 },
    { x: "15%", y: "75%", delay: 1, size: 18 },
    { x: "80%", y: "70%", delay: 1.5, size: 22 },
    { x: "50%", y: "10%", delay: 0.3, size: 16 },
    { x: "5%", y: "45%", delay: 0.8, size: 20 },
    { x: "92%", y: "50%", delay: 1.2, size: 18 },
    { x: "45%", y: "90%", delay: 1.7, size: 22 },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Epic Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient mesh */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/40 via-black to-cyan-950/40" />

        {/* Massive glowing orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-violet-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-cyan-600/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-600/20 rounded-full blur-[150px]"
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(6, 182, 212, 0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(6, 182, 212, 0.5) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        />

        {/* Floating runes */}
        {runes.map((rune, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              delay: rune.delay,
              ease: "easeInOut",
            }}
            className="absolute"
            style={{ left: rune.x, top: rune.y }}
          >
            <Sparkles
              size={rune.size}
              className="text-cyan-400"
              style={{ filter: "drop-shadow(0 0 8px rgba(6, 182, 212, 0.8))" }}
            />
          </motion.div>
        ))}

        {/* Scanline effect */}
        <motion.div
          animate={{ y: ["0%", "100vh"] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute inset-x-0 h-32 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent"
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo & Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-center mb-10"
        >
          {/* Logo with glow */}
          <Link href="/" className="inline-flex items-center justify-center gap-3 mb-6 group">
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 30px rgba(6, 182, 212, 0.5)",
                  "0 0 60px rgba(168, 85, 247, 0.6)",
                  "0 0 30px rgba(6, 182, 212, 0.5)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="relative w-14 h-14 bg-gradient-to-br from-cyan-400 via-violet-500 to-rose-500 rounded-xl flex items-center justify-center"
            >
              <Zap className="w-8 h-8 text-black" strokeWidth={3} />
              {/* Rotating border */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-xl border-2 border-cyan-400/50"
                style={{ filter: "blur(2px)" }}
              />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">
                PathForge
              </span>
            </h1>
          </Link>

          {/* Tagline with awakening theme */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-[0.3em] text-cyan-400 uppercase">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-cyan-400" />
              <span style={{ textShadow: "0 0 10px rgba(6, 182, 212, 0.8)" }}>
                Hunter System
              </span>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400" />
            </div>
            <p className="text-slate-400 text-sm italic">
              "The weak have no choice. The strong forge their path."
            </p>
          </motion.div>
        </motion.div>

        {/* Login Card with epic border */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative"
        >
          {/* Animated border glow */}
          <motion.div
            animate={{
              background: [
                "linear-gradient(0deg, rgba(6, 182, 212, 0.5), rgba(168, 85, 247, 0.5))",
                "linear-gradient(180deg, rgba(168, 85, 247, 0.5), rgba(244, 63, 94, 0.5))",
                "linear-gradient(360deg, rgba(6, 182, 212, 0.5), rgba(168, 85, 247, 0.5))",
              ],
            }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute -inset-[2px] rounded-2xl blur-sm"
          />

          {/* Card content */}
          <div className="relative bg-black/80 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl">
            {/* Header */}
            <div className="mb-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border-2 border-cyan-400/40"
                style={{ boxShadow: "0 0 30px rgba(6, 182, 212, 0.4)" }}
              >
                <Sword className="w-8 h-8 text-cyan-400" />
              </motion.div>
              <h2 className="text-3xl font-black text-white mb-1">
                Welcome Back, <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">Hunter</span>
              </h2>
              <p className="text-sm text-slate-400">
                Resume your epic journey
              </p>
            </div>

            {/* Config Error */}
            <AnimatePresence>
              {configError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-6 p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl flex gap-3"
                  style={{ boxShadow: "0 0 20px rgba(244, 63, 94, 0.2)" }}
                >
                  <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-rose-300 font-bold">⚠ System Configuration Error</p>
                    <p className="text-xs text-rose-200 mt-1">
                      The dungeon gateway requires proper credentials. Contact your guildmaster.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleLogin} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-cyan-400 uppercase mb-2">
                  <Mail size={12} />
                  Hunter ID
                </label>
                <div className="relative group">
                  <motion.div
                    animate={{
                      opacity: focusedField === "email" ? 1 : 0,
                    }}
                    className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-violet-500 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="hunter@example.com"
                    className="relative w-full px-4 py-3 bg-slate-950/80 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-slate-600 transition-all duration-300"
                    style={{
                      boxShadow:
                        focusedField === "email"
                          ? "0 0 20px rgba(6, 182, 212, 0.4), inset 0 0 20px rgba(6, 182, 212, 0.05)"
                          : "none",
                    }}
                    disabled={loading}
                  />
                </div>
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <label className="flex items-center gap-2 text-xs font-bold tracking-wider text-violet-400 uppercase mb-2">
                  <Lock size={12} />
                  Secret Rune
                </label>
                <div className="relative group">
                  <motion.div
                    animate={{
                      opacity: focusedField === "password" ? 1 : 0,
                    }}
                    className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-rose-500 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField("password")}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    className="relative w-full px-4 py-3 bg-slate-950/80 border-2 border-slate-700 rounded-xl focus:outline-none focus:border-violet-400 text-white placeholder-slate-600 transition-all duration-300"
                    style={{
                      boxShadow:
                        focusedField === "password"
                          ? "0 0 20px rgba(168, 85, 247, 0.4), inset 0 0 20px rgba(168, 85, 247, 0.05)"
                          : "none",
                    }}
                    disabled={loading}
                  />
                </div>
              </motion.div>

              {/* Submit Button - EPIC */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="pt-2"
              >
                <motion.button
                  type="submit"
                  disabled={loading || configError}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="group relative w-full py-4 rounded-xl font-black text-base tracking-wider uppercase overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {/* Animated gradient background */}
                  <motion.div
                    animate={{
                      backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-violet-500 to-rose-500"
                    style={{ backgroundSize: "200% 100%" }}
                  />

                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 opacity-50 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow:
                        "0 0 40px rgba(6, 182, 212, 0.6), 0 0 60px rgba(168, 85, 247, 0.4)",
                    }}
                  />

                  {/* Shimmer effect */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                      repeatDelay: 1,
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
                  />

                  {/* Button content */}
                  <span className="relative flex items-center justify-center gap-2 text-white">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        >
                          <Sparkles size={18} />
                        </motion.div>
                        Awakening...
                      </>
                    ) : (
                      <>
                        ⚔ Enter The Realm
                        <motion.div
                          animate={{ x: [0, 4, 0] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          <ArrowRight size={20} />
                        </motion.div>
                      </>
                    )}
                  </span>
                </motion.button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="my-6 flex items-center gap-3"
            >
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-xs font-bold tracking-widest text-slate-500 uppercase">
                New Hunter?
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </motion.div>

            {/* Signup Link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="text-center"
            >
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
              >
                <Sparkles size={14} className="text-amber-400 group-hover:rotate-12 transition-transform" />
                <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
                  Forge Your Legend
                </span>
                <ArrowRight size={14} className="text-amber-400 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom info - power level reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 text-xs text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Hunter System v2.0 — Online</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
