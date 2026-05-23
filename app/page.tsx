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
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PrimaryLinkButton } from "@/components/ui/PrimaryButton";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { FloatingParticles } from "@/components/landing/FloatingParticles";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient background — refined for premium feel */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Top center spotlight */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-40"
          style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.4), rgba(168,85,247,0.15), transparent 70%)" }}
        />
        {/* Left edge violet */}
        <div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(168,85,247,0.5), transparent 70%)" }}
        />
        {/* Right edge pink */}
        <div
          className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.5), transparent 70%)" }}
        />
        {/* Conic gradient accent (subtle prism effect) */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.04]"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, #6366f1, #a855f7, #ec4899, #f59e0b, #6366f1)",
            filter: "blur(60px)",
          }}
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />
        {/* Vignette to focus attention center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)",
          }}
        />

        {/* Floating light particles */}
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Logo size={26} className="flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold tracking-tight truncate">
              PathForge
            </span>
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

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <Link
              href="/login"
              className="text-xs sm:text-sm text-slate-300 hover:text-white px-2 sm:px-3 py-1.5 transition-colors"
            >
              Sign in
            </Link>
            <PrimaryLinkButton href="/signup" size="sm">
              <span className="hidden sm:inline">Get started</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight size={12} />
            </PrimaryLinkButton>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-20 lg:pt-28 pb-16 lg:pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] mb-7 shadow-lg shadow-black/40"
          >
            <div className="relative">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
            <span className="text-xs font-medium text-slate-300 tracking-wide">
              Career growth, gamified
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-balance text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-semibold tracking-tighter leading-[1.02] max-w-5xl mx-auto mb-7"
          >
            <span className="text-white">Forge the career</span>
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                you actually want.
              </span>
              {/* Subtle glow under the gradient text */}
              <span
                aria-hidden
                className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent"
              >
                you actually want.
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-balance text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Personalized roadmaps, daily quests, and ForgeBot — your AI career coach.
            Finish your program and earn a verifiable certificate that lands the job.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <PrimaryLinkButton href="/signup" size="lg">
              Start your path — free
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </PrimaryLinkButton>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.03] transition-all"
            >
              See how it works
            </Link>
          </motion.div>

        </div>

        {/* Live Product Preview Card (Hero visual) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-20"
        >
          {/* Reserve space for the preview so layout doesn't shift if it loads slow */}
          <div className="min-h-[420px]">
            <HeroPreview />
          </div>
        </motion.div>
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
                  <span className="text-xs font-medium text-slate-300 tracking-wide">8-tier rank system</span>
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
                title: "ForgeBot · your mentor",
                description: "ForgeBot is your AI career coach. Knows your goals, gaps, and progress. Direct answers in minutes.",
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
                description: "16 paths including VA, Copywriter, Customer Success — built for global remote work and freelance income.",
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
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, scale: 1.01 }}
                className="group relative overflow-hidden p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.16] transition-all cursor-default"
                style={{
                  transition: "border-color 0.3s, background-color 0.3s",
                }}
              >
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-30 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle, ${feature.accent}, transparent 70%)` }}
                />
                {/* Animated border glow on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: `radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%), ${feature.accent}10, transparent 40%)`,
                  }}
                />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -6, scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                    style={{ background: `${feature.accent}15`, color: feature.accent, boxShadow: `0 0 24px ${feature.accent}10` }}
                  >
                    <feature.icon size={18} />
                  </motion.div>
                  <h3 className="text-base font-semibold mb-2 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>
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
                description: "Choose from 16 careers — Software, AI, VA, Content Creator, and more.",
              },
              {
                step: "02",
                title: "Get your quests",
                description: "Your AI mentor builds a custom plan. Daily quests appear in your dashboard.",
              },
              {
                step: "03",
                title: "Level up & get certified",
                description: "Complete quests, climb ranks, and earn a verifiable PathForge certificate that proves it.",
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

      {/* Certification */}
      <section className="relative z-10 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 lg:p-12"
          >
            <div
              className="absolute -top-20 right-1/4 w-[500px] h-[300px] opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.4), transparent 70%)" }}
            />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              {/* Copy */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
                  <GraduationCap size={11} className="text-indigo-400" />
                  <span className="text-xs font-medium text-slate-300 tracking-wide">
                    PathForge AI Academy
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                  Finish a program.
                  <br />
                  Earn a real credential.
                </h2>
                <p className="text-base text-slate-400 leading-relaxed mb-6">
                  Complete your career program and PathForge issues a verifiable
                  Certificate of Completion — the kind of proof recruiters can actually
                  check, not just another badge.
                </p>
                <div className="space-y-2.5 mb-7">
                  {[
                    "Unique credential ID + public verification page",
                    "One-click Add to LinkedIn",
                    "Skills, rank, and quests cleared — all on the certificate",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-indigo-300" strokeWidth={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <PrimaryLinkButton href="/signup" size="lg">
                  Start earning yours
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </PrimaryLinkButton>
              </div>

              {/* Sample certificate */}
              <div className="relative">
                <div className="rounded-2xl border border-white/[0.12] bg-gradient-to-br from-white/[0.06] to-transparent p-6 sm:p-8 text-center">
                  <div className="inline-flex items-center gap-2 mb-5">
                    <Logo size={22} />
                    <span className="text-xs font-semibold tracking-tight">
                      PathForge AI Academy
                    </span>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-semibold mb-2">
                    Certificate of Completion
                  </div>
                  <div className="text-xs text-slate-500 mb-1">This certifies that</div>
                  <div className="text-xl font-semibold tracking-tight mb-1">Maria Santos</div>
                  <div className="text-xs text-slate-400 mb-4">
                    completed the{" "}
                    <span className="text-white">Software Engineer</span> program
                  </div>
                  <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                    {["React", "TypeScript", "Node.js", "APIs"].map((s) => (
                      <span
                        key={s}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.08] text-slate-300"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-2 pt-4 border-t border-white/[0.06]">
                    <ShieldCheck size={12} className="text-emerald-300" />
                    <span className="text-[10px] text-emerald-200 font-medium">
                      Verified · PF-7K2MX9QA
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
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
              <PrimaryLinkButton href="/signup" size="lg">
                Create your account
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </PrimaryLinkButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.06] bg-[#070710]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-12 mb-12">
            {/* Brand — full width on mobile, 1/3 on larger */}
            <div className="col-span-2 sm:col-span-1">
              <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
                <Logo size={28} />
                <span className="text-base font-semibold tracking-tight">PathForge</span>
              </Link>
              <p className="text-xs text-slate-500 leading-relaxed mb-4 max-w-xs">
                The career operating system for the ambitious — built in the Philippines,
                made for the world.
              </p>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.08]">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                  A ZenForge Technologies product
                </span>
              </div>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Product
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="#features" className="text-slate-400 hover:text-white transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-slate-400 hover:text-white transition-colors">
                    How it works
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/signup" className="text-slate-400 hover:text-white transition-colors">
                    Get started
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Legal
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/cookies" className="text-slate-400 hover:text-white transition-colors">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:privacy@pathforger.app"
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    Data requests
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              © 2026 ZenForge Technologies. All rights reserved.
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                <svg className="w-3 h-3 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L1 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-11-5z" opacity="0.3"/>
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                DTI Registered · Philippines
              </span>
              <span>·</span>
              <span>NPC-compliant</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky CTA appears after scroll */}
      <StickyCTA />
    </div>
  );
}
