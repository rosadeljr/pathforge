"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Bot,
  Check,
  GraduationCap,
  ShieldCheck,
  Heart,
  Star,
  Trophy,
  Flame,
  PlayCircle,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { PrimaryLinkButton } from "@/components/ui/PrimaryButton";
import { StickyCTA } from "@/components/landing/StickyCTA";
import { FloatingParticles } from "@/components/landing/FloatingParticles";
import { ForgeBotMascot } from "@/components/landing/ForgeBotMascot";
import { HeroPreview } from "@/components/landing/HeroPreview";
import { UtmCapture } from "@/components/marketing/UtmCapture";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      <UtmCapture />
      {/* Ambient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] rounded-full opacity-40"
          style={{ background: "radial-gradient(ellipse at top, rgba(99,102,241,0.4), rgba(168,85,247,0.15), transparent 70%)" }}
        />
        <div
          className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(245,158,11,0.5), transparent 70%)" }}
        />
        <div
          className="absolute top-1/4 -right-32 w-[500px] h-[500px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(236,72,153,0.5), transparent 70%)" }}
        />
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.04]"
          style={{
            background:
              "conic-gradient(from 90deg at 50% 50%, #6366f1, #a855f7, #ec4899, #f59e0b, #6366f1)",
            filter: "blur(60px)",
          }}
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
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)",
          }}
        />
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
            <Link href="#subjects" className="text-sm text-slate-400 hover:text-white transition-colors">
              Subjects
            </Link>
            <Link href="#how-it-works" className="text-sm text-slate-400 hover:text-white transition-colors">
              How it works
            </Link>
            <Link href="#parents" className="text-sm text-slate-400 hover:text-white transition-colors">
              For parents
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
              <span className="hidden sm:inline">Get started — free</span>
              <span className="sm:hidden">Start</span>
              <ArrowRight size={12} />
            </PrimaryLinkButton>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 pt-12 lg:pt-16 pb-20 lg:pb-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Mascot — first thing kids and parents see */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="flex justify-center mb-2"
          >
            <ForgeBotMascot size={260} className="sm:hidden" />
            <ForgeBotMascot size={320} className="hidden sm:block" />
          </motion.div>

          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.12] mb-7 shadow-lg shadow-black/40 backdrop-blur-md"
          >
            <div className="relative flex-shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <div className="absolute inset-0 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping opacity-50" />
            </div>
            <span className="text-[13px] font-semibold text-white tracking-[0.04em]">
              K-10 learning,{" "}
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 bg-clip-text text-transparent">
                gamified
              </span>{" "}
              · ages 6–15
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-balance text-5xl sm:text-6xl lg:text-7xl xl:text-[5.5rem] font-semibold tracking-tighter leading-[1.02] max-w-5xl mx-auto mb-7"
          >
            <span className="text-white">Where kids</span>
            <br />
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                forge their future.
              </span>
              <span
                aria-hidden
                className="absolute inset-0 blur-2xl opacity-40 bg-gradient-to-r from-amber-400 via-orange-400 to-pink-400 bg-clip-text text-transparent"
              >
                forge their future.
              </span>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-balance text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Fun, interactive K-10 lessons across Math, English, Filipino,
            Science, and Araling Panlipunan. Quests, streaks, mascots, and a
            kid-safe AI tutor that adapts to your child's age and grade.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6"
          >
            <PrimaryLinkButton href="/signup" size="lg">
              Start learning — free
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </PrimaryLinkButton>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.03] transition-all"
            >
              <PlayCircle size={16} />
              See how it works
            </Link>
          </motion.div>

          {/* Trust micro-strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="flex items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-500 flex-wrap"
          >
            <span className="inline-flex items-center gap-1.5">
              <Check size={11} className="text-emerald-400" />
              No credit card
            </span>
            <span className="text-slate-700" aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck size={11} className="text-emerald-400" />
              Kid-safe AI
            </span>
            <span className="text-slate-700" aria-hidden>·</span>
            <span className="inline-flex items-center gap-1.5">
              🇵🇭 Built for Filipino students
            </span>
          </motion.div>
        </div>

        {/* Live dashboard preview — shows the real /learn experience */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 lg:mt-20"
        >
          <div className="min-h-[420px]">
            <HeroPreview />
          </div>
        </motion.div>
      </section>

      {/* ============ AGE TIERS ============ */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
              <Sparkles size={11} className="text-amber-400" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                Built for every age
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-3 text-balance">
              From{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                counting
              </span>{" "}
              to{" "}
              <span className="bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                algebra.
              </span>
            </h2>
            <p className="text-base text-slate-400 max-w-2xl mx-auto">
              ForgeBot adapts to your kid's age and grade. The lessons, the
              tutor voice, even the UI — everything calibrates to where they
              are right now.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                tier: "Little Forgers",
                age: "Ages 6–9",
                grades: "Grades 1–3",
                emoji: "🌟",
                color: "from-amber-400 to-orange-500",
                glow: "rgba(245,158,11,0.5)",
                desc: "Bright, playful lessons. Counting, ABCs, sight words, basic Filipino, and our country. Big buttons, big celebrations.",
              },
              {
                tier: "Junior Forgers",
                age: "Ages 10–13",
                grades: "Grades 4–7",
                emoji: "🚀",
                color: "from-indigo-400 to-purple-600",
                glow: "rgba(99,102,241,0.5)",
                desc: "Balanced, focused learning. Ratios, essay structure, photosynthesis, panitikan, ASEAN — all the core skills.",
              },
              {
                tier: "Teen Forgers",
                age: "Ages 14–15",
                grades: "Grades 8–10",
                emoji: "🎯",
                color: "from-rose-400 to-pink-600",
                glow: "rgba(244,63,94,0.5)",
                desc: "Mature, study-focused UI. Algebra, geometry, literature, science fundamentals, and career exploration.",
              },
            ].map((t, i) => (
              <motion.div
                key={t.tier}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent p-6 hover:border-white/[0.18] transition-all"
              >
                <div
                  className="absolute -top-20 -right-20 w-56 h-56 rounded-full opacity-25 pointer-events-none group-hover:opacity-50 transition-opacity"
                  style={{
                    background: `radial-gradient(circle, ${t.glow}, transparent 70%)`,
                  }}
                />
                <div className="relative">
                  <motion.div
                    animate={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
                    className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} shadow-xl mb-4 text-2xl`}
                    style={{ boxShadow: `0 10px 30px ${t.glow}` }}
                  >
                    {t.emoji}
                  </motion.div>
                  <h3 className="text-xl font-semibold tracking-tight mb-0.5">
                    {t.tier}
                  </h3>
                  <div className="text-xs text-slate-400 mb-3">
                    {t.age} · {t.grades}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SUBJECTS ============ */}
      <section id="subjects" className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] mb-4">
              <GraduationCap size={11} className="text-emerald-400" />
              <span className="text-xs font-medium text-slate-300 tracking-wide">
                Five core subjects
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              The five PH core subjects, all in one app.
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              Aligned with the Philippine K-10 curriculum. Lessons in English
              and Filipino where it matters.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { id: "math", title: "Math", filipino: "Matematika", emoji: "🔢", gradient: "from-sky-400 to-blue-600", accent: "#0ea5e9", desc: "Counting through algebra and geometry — every grade." },
              { id: "english", title: "English", filipino: "Ingles", emoji: "📖", gradient: "from-violet-400 to-purple-600", accent: "#a855f7", desc: "Reading, writing, grammar, vocabulary, and essay basics." },
              { id: "filipino", title: "Filipino", filipino: "Filipino", emoji: "🇵🇭", gradient: "from-amber-400 to-orange-600", accent: "#f59e0b", desc: "Bokabularyo, gramatika, panitikan — mahalin ang sariling wika." },
              { id: "science", title: "Science", filipino: "Agham", emoji: "🔬", gradient: "from-emerald-400 to-teal-600", accent: "#10b981", desc: "From plants to photosynthesis to Newton's laws." },
              { id: "ap", title: "Araling Panlipunan", filipino: "AP", emoji: "🌏", gradient: "from-rose-400 to-pink-600", accent: "#f43f5e", desc: "PH history, geography, ASEAN, economy basics." },
              { id: "more", title: "More coming", filipino: "Soon", emoji: "✨", gradient: "from-slate-500 to-slate-700", accent: "#94a3b8", desc: "Coding, financial literacy, study skills — on the roadmap.", soon: true },
            ].map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                whileHover={{ y: -3 }}
                className={`group relative overflow-hidden rounded-2xl border p-5 transition-all ${
                  s.soon
                    ? "border-white/[0.04] bg-white/[0.01] opacity-70"
                    : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.16]"
                }`}
              >
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{ background: `radial-gradient(circle, ${s.accent}, transparent 70%)` }}
                />
                <div className="relative">
                  <motion.div
                    whileHover={!s.soon ? { rotate: [0, -8, 8, 0] } : {}}
                    transition={{ duration: 0.5 }}
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center text-2xl mb-4 shadow-lg`}
                    style={{ boxShadow: `0 8px 24px ${s.accent}30` }}
                  >
                    {s.emoji}
                  </motion.div>
                  <h3 className="text-base font-semibold tracking-tight">{s.title}</h3>
                  <div className="text-[11px] text-slate-500 mb-2">{s.filipino}</div>
                  <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section id="how-it-works" className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Three steps to your first lesson.
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              Set up takes under a minute. Kids can start playing right after.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                emoji: "🎒",
                title: "Pick your grade",
                description: "Choose Grade 1 through 12. We'll match lessons to the right level — no overwhelming a 6-year-old with algebra.",
              },
              {
                step: "02",
                emoji: "🔬",
                title: "Pick your subjects",
                description: "Math, English, Filipino, Science, AP — pick what you want to focus on. You can always change later.",
              },
              {
                step: "03",
                emoji: "🎮",
                title: "Start playing",
                description: "Interactive lessons with quests, streaks, confetti, and a friendly mascot. ForgeBot is one tap away if you get stuck.",
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -3 }}
                className="relative p-6 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.14] transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl font-semibold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-indigo-300 to-purple-400">
                    {step.step}
                  </div>
                  <motion.div
                    animate={{ y: [0, -6, 0], rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.3 }}
                    className="text-3xl"
                  >
                    {step.emoji}
                  </motion.div>
                </div>
                <h3 className="text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ WHAT MAKES IT FUN ============ */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
              Why kids actually finish lessons here.
            </h2>
            <p className="text-base text-slate-400 max-w-xl mx-auto">
              Built like the games kids already love — but the reward is real
              learning.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: Trophy, title: "Confetti & celebrations", desc: "Right answer? Cue the confetti, mascot cheers, and a streak count.", accent: "#f59e0b" },
              { icon: Flame, title: "Streaks that compound", desc: "Day-streaks and in-lesson streaks. The longer the chain, the bigger the dopamine.", accent: "#ef4444" },
              { icon: Heart, title: "Dream careers to unlock", desc: "Doctor, astronaut, engineer, game designer — kids unlock careers as they learn and pick their dream.", accent: "#f43f5e" },
              { icon: Bot, title: "ForgeBot — your tutor", desc: "Stuck? Tap the tutor. Voice adapts to your age — gentle for kids, peer-like for teens.", accent: "#6366f1" },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                className="group relative overflow-hidden p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04] transition-all"
              >
                <div
                  className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-10 group-hover:opacity-30 transition-opacity"
                  style={{ background: `radial-gradient(circle, ${f.accent}, transparent 70%)` }}
                />
                <div className="relative">
                  <motion.div
                    whileHover={{ rotate: -8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-3"
                    style={{ background: `${f.accent}15`, color: f.accent }}
                  >
                    <f.icon size={20} />
                  </motion.div>
                  <h3 className="text-sm font-semibold mb-1.5">{f.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CAREER MASTERY CERTIFICATES ============ */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7 }}
            className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center"
          >
            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/[0.08] border border-amber-500/30 mb-4">
                <Trophy size={11} className="text-amber-400" />
                <span className="text-xs font-medium text-amber-200 tracking-wide">
                  Career Mastery Certificates
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 text-balance">
                Real{" "}
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300 bg-clip-text text-transparent">
                  certificates
                </span>{" "}
                kids can show off.
              </h2>
              <p className="text-base text-slate-400 leading-relaxed mb-6">
                Each of the 32 careers in PathForge is a 5-stage adventure.
                When a kid masters the full journey — Cadet → Apprentice →
                Trainee → Junior → Full {`{Career}`} — they earn a
                personalized Certificate of Career Mastery with a unique
                credential code.
              </p>
              <div className="space-y-2.5 mb-7">
                {[
                  "Personalized with the kid's name + career + date",
                  "Unique credential ID for verification",
                  "Shareable — proud parents love this one",
                  "Earn one for every career a kid masters (up to 32)",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className="mt-0.5 w-5 h-5 rounded-full bg-amber-500/[0.15] border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                      <Check size={12} className="text-amber-300" strokeWidth={3} />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — certificate mockup */}
            <div className="relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, rotate: 0.5 }}
                className="relative overflow-hidden rounded-3xl border-2 border-amber-400/40 bg-gradient-to-br from-amber-500/[0.12] via-orange-500/[0.06] to-transparent p-7 sm:p-10"
                style={{
                  boxShadow: "0 24px 60px rgba(245,158,11,0.25)",
                }}
              >
                {/* Glow */}
                <div
                  className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-48 opacity-50 pointer-events-none"
                  style={{
                    background:
                      "radial-gradient(ellipse, rgba(245,158,11,0.5), transparent 70%)",
                    filter: "blur(20px)",
                  }}
                />
                {/* Decorative corners */}
                <div className="absolute top-3 left-3 w-10 h-10 border-t-2 border-l-2 border-amber-400/40 rounded-tl-2xl pointer-events-none" />
                <div className="absolute top-3 right-3 w-10 h-10 border-t-2 border-r-2 border-amber-400/40 rounded-tr-2xl pointer-events-none" />
                <div className="absolute bottom-3 left-3 w-10 h-10 border-b-2 border-l-2 border-amber-400/40 rounded-bl-2xl pointer-events-none" />
                <div className="absolute bottom-3 right-3 w-10 h-10 border-b-2 border-r-2 border-amber-400/40 rounded-br-2xl pointer-events-none" />

                <div className="relative text-center">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <Logo size={22} />
                    <span className="text-xs font-semibold tracking-tight">PathForge</span>
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.3em] text-amber-300 font-bold mb-3">
                    ✦ Certificate of Career Mastery ✦
                  </div>
                  <p className="text-[10px] text-slate-400 mb-1">This certifies that</p>
                  <div className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-amber-200 via-orange-200 to-amber-300 bg-clip-text text-transparent">
                    Lara Santos
                  </div>
                  <p className="text-xs text-slate-300 mb-3">
                    has mastered the
                  </p>
                  <motion.div
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="inline-flex flex-col items-center gap-2 mb-4"
                  >
                    <div
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-3xl shadow-xl"
                      style={{ boxShadow: "0 8px 24px rgba(16,185,129,0.5)" }}
                    >
                      🔬
                    </div>
                    <div className="text-xl font-bold">Scientist</div>
                  </motion.div>
                  <p className="text-[11px] text-slate-400 mb-3 max-w-xs mx-auto leading-relaxed">
                    adventure on PathForge —{" "}
                    <span className="text-amber-200">2,500 XP earned</span>
                  </p>
                  <div className="inline-flex items-center gap-4 text-[10px] text-slate-400 pt-3 border-t border-white/[0.06]">
                    <span>May 2026</span>
                    <span className="w-px h-3 bg-white/10" />
                    <span className="font-mono text-amber-200/80">
                      PF-SCIE-K3M2P9
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOR PARENTS ============ */}
      <section id="parents" className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-br from-emerald-500/[0.06] via-teal-500/[0.03] to-transparent p-6 sm:p-10 lg:p-14"
          >
            <div
              className="absolute -top-20 right-1/4 w-[500px] h-[300px] opacity-30 pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(16,185,129,0.4), transparent 70%)" }}
            />
            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/[0.08] border border-emerald-500/30 mb-4">
                  <Heart size={11} className="text-emerald-400" />
                  <span className="text-xs font-medium text-emerald-200 tracking-wide">
                    For parents
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-4">
                  Safe. Filipino-built.
                  <br />
                  Worth your kid's screen time.
                </h2>
                <p className="text-base text-slate-400 leading-relaxed mb-6">
                  We built PathForge for our own kids first. Every lesson is
                  curated. The AI tutor has strict age-appropriate guardrails.
                  No ads, no scary content, no random links into the internet.
                </p>
                <div className="space-y-2.5 mb-7">
                  {[
                    "Kid-safe AI tutor with strict content guardrails by age",
                    "Filipino-built — PH curriculum, peso, jeepney, Rizal examples",
                    "No ads, no in-app purchases, no random external links",
                    "Free tier with daily lesson limits — Pro unlocks unlimited",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm text-slate-300">
                      <div className="mt-0.5 w-5 h-5 rounded-full bg-emerald-500/[0.15] border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                        <Check size={12} className="text-emerald-300" strokeWidth={3} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <PrimaryLinkButton href="/signup" size="lg">
                  Sign up your kid — free
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </PrimaryLinkButton>
              </div>

              {/* Safety badge visual */}
              <div className="relative">
                <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.06] to-transparent p-6 sm:p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <motion.div
                      animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.05, 1] }}
                      transition={{ duration: 4, repeat: Infinity }}
                      className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-xl shadow-emerald-500/30"
                    >
                      <ShieldCheck size={26} className="text-white" />
                    </motion.div>
                    <div>
                      <div className="text-base font-semibold">Kid-safe by design</div>
                      <div className="text-xs text-slate-400">
                        Reviewed by parents like you
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "AI tutor guardrails", value: "Age-tiered" },
                      { label: "External links", value: "None" },
                      { label: "Ads", value: "Zero" },
                      { label: "In-app purchases", value: "None for kids" },
                      { label: "PH curriculum", value: "K-10 aligned" },
                    ].map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between text-sm border-b border-white/[0.04] pb-2 last:border-0 last:pb-0"
                      >
                        <span className="text-slate-400">{row.label}</span>
                        <span className="font-semibold text-emerald-300">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative z-10 py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="text-5xl mb-6"
            >
              🌟
            </motion.div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight mb-4 text-balance">
              Your kid's next lesson is one tap away.
            </h2>
            <p className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto mb-8">
              Free to start. Cancel anytime. No credit card.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <PrimaryLinkButton href="/signup" size="lg">
                Start learning — free
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </PrimaryLinkButton>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium text-slate-300 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.03] transition-all"
              >
                See pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="relative z-10 border-t border-white/[0.06] py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Logo size={24} />
              <span className="text-sm font-semibold tracking-tight">PathForge</span>
              <span className="text-xs text-slate-500">· built in 🇵🇭</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-500">
              <Link href="/privacy" className="hover:text-slate-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-slate-300 transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="hover:text-slate-300 transition-colors">
                Cookies
              </Link>
              <Link href="/pricing" className="hover:text-slate-300 transition-colors">
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <StickyCTA />
    </div>
  );
}
