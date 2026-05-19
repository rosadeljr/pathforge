"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Bot,
  Swords,
  Trophy,
  TrendingUp,
  Zap,
  Globe2,
  Check,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.3), transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -left-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4), transparent 70%)" }}
        />
        <div
          className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.4), transparent 70%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={28} />
            <span className="text-base font-semibold tracking-tight">PathForge</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="#features" className="text-sm text-slate-400 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="/pricing" className="text-sm text-slate-400 hover:text-white transition-colors">
              Pricing
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm text-slate-300 hover:text-white px-3 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center gap-1.5 text-sm font-medium bg-white text-slate-900 hover:bg-slate-100 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              Get started
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 lg:pt-32 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              Built for ambitious Filipinos
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.05] max-w-4xl mx-auto mb-6"
          >
            Forge the career
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              you actually want.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Personalized roadmaps, daily quests, and an AI mentor — all in one place.
            Built for Gen Z and the PH freelance economy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-lg text-sm font-semibold transition-all shadow-2xl shadow-white/10"
            >
              Start your path — free
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.03] transition-all"
            >
              See how it works
            </Link>
          </motion.div>

          {/* Trust strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto"
          >
            {[
              { value: "16+", label: "Career paths" },
              { value: "AI-powered", label: "Mentor & quests" },
              { value: "100%", label: "Free to start" },
            ].map((stat, i) => (
              <div key={i}>
                <div className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product Preview - Rank Ladder */}
      <section className="relative z-10 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 lg:p-12"
          >
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.4), transparent 70%)" }}
            />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
                  <Sparkles size={11} className="text-indigo-400" />
                  <span className="text-xs font-medium text-slate-300 tracking-wide">Solo Leveling-inspired</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                  Your career, ranked.
                </h2>
                <p className="text-base text-slate-400 leading-relaxed mb-6">
                  Every level you gain bumps your rank. Start at E and climb to SSS.
                  Show off your forge journey with a profile recruiters actually want to read.
                </p>
                <div className="space-y-2.5">
                  {[
                    "E → D → C → B → A → S → SS → SSS rank progression",
                    "Daily XP quests tuned to your goals",
                    "Streak system that compounds your momentum",
                    "Public portfolio with verified projects",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-indigo-300" strokeWidth={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rank ladder visual */}
              <div className="space-y-2">
                {[
                  { rank: "SSS", color: "from-cyan-400 to-violet-500", glow: "rgba(6,182,212,0.5)", current: false },
                  { rank: "SS", color: "from-amber-400 to-orange-500", glow: "rgba(245,158,11,0.5)", current: false },
                  { rank: "S", color: "from-rose-500 to-pink-600", glow: "rgba(244,63,94,0.5)", current: false },
                  { rank: "A", color: "from-orange-500 to-red-600", glow: "rgba(249,115,22,0.5)", current: false },
                  { rank: "B", color: "from-violet-500 to-purple-600", glow: "rgba(139,92,246,0.5)", current: true },
                  { rank: "C", color: "from-cyan-500 to-blue-600", glow: "rgba(6,182,212,0.5)", current: false },
                  { rank: "D", color: "from-emerald-500 to-green-600", glow: "rgba(16,185,129,0.5)", current: false },
                  { rank: "E", color: "from-slate-500 to-slate-700", glow: "rgba(148,163,184,0.5)", current: false },
                ].map((r, i) => (
                  <motion.div
                    key={r.rank}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.04 }}
                    className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                      r.current
                        ? "bg-white/[0.06] border-white/20"
                        : "bg-white/[0.02] border-white/[0.06]"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${r.color} flex items-center justify-center text-xs font-bold text-white`}
                      style={r.current ? { boxShadow: `0 8px 24px ${r.glow}` } : undefined}
                    >
                      {r.rank}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{r.rank}-Rank</div>
                    </div>
                    {r.current && (
                      <span className="text-xs font-medium text-emerald-300">You</span>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
              <Sparkles size={11} className="text-pink-400" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">Everything you need</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              An operating system for your career.
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              Stop guessing what to learn next. PathForge gives you the structure, motivation,
              and proof — all in one workspace.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              {
                icon: Bot,
                title: "AI Mentor",
                description: "Talk to a mentor that knows your goals, gaps, and progress. Get unstuck in minutes, not weeks.",
                accent: "#a855f7",
              },
              {
                icon: Swords,
                title: "Daily Quests",
                description: "Bite-sized missions tuned to your career. Build skills through doing, not just watching.",
                accent: "#6366f1",
              },
              {
                icon: TrendingUp,
                title: "Rank Up System",
                description: "From E-rank to SSS. Watch your XP, level, and readiness compound with every quest.",
                accent: "#ec4899",
              },
              {
                icon: Trophy,
                title: "Portfolio Builder",
                description: "Every completed project becomes part of a shareable profile recruiters love.",
                accent: "#10b981",
              },
              {
                icon: Globe2,
                title: "Remote-First Roles",
                description: "16+ paths including VA, Copywriter, Customer Success — built for USD income from PH.",
                accent: "#06b6d4",
              },
              {
                icon: Zap,
                title: "Streak Engine",
                description: "Daily streaks keep you consistent. Miss a day and lose momentum — keep it and compound.",
                accent: "#f59e0b",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className="group relative overflow-hidden p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.12] transition-all"
              >
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-20 transition-opacity"
                  style={{ background: `radial-gradient(circle, ${feature.accent}, transparent 70%)` }}
                />
                <div className="relative">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.accent}15`, color: feature.accent }}
                  >
                    <feature.icon size={18} />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Three steps to start forging.
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              You can be questing in under five minutes.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Pick your path",
                description: "Choose from 16+ careers — Software, AI, VA, Content Creator, and more.",
              },
              {
                step: "02",
                title: "Get your quests",
                description: "Your AI mentor builds a custom plan. Daily quests appear in your dashboard.",
              },
              {
                step: "03",
                title: "Level up",
                description: "Complete quests, build streaks, climb ranks, ship a portfolio that lands the job.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <div className="text-4xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-purple-400 mb-4">
                  {step.step}
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-10 lg:p-14"
          >
            <div className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.4), transparent 70%)" }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                Start forging today.
              </h2>
              <p className="text-base text-slate-400 mb-8 max-w-md mx-auto">
                Free to start. No credit card. Your first quest is waiting.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-2xl shadow-white/10"
              >
                Create your account
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size={24} />
            <span className="text-sm font-semibold tracking-tight">PathForge</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-slate-500">
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/login" className="hover:text-white transition-colors">Sign in</Link>
            <span>© 2026 PathForge</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
