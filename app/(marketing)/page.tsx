"use client";

import Link from "next/link";
import { Zap, Target, TrendingUp, Code2, Brain, Award } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Nav */}
      <nav className="sticky top-0 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-violet-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-slate-950" />
            </div>
            <span className="font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">PathForge</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-slate-400 hover:text-slate-200 text-sm">Sign in</Link>
            <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 px-4 py-2 rounded-lg font-semibold text-sm hover:shadow-lg hover:shadow-cyan-500/30 transition-all">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-slate-100 to-violet-400 bg-clip-text text-transparent">
          Turn Your Dream Career Into Daily Quests
        </h1>
        <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          PathForge combines RPG progression, real-world projects, XP leveling, and AI coaching to transform your career growth into an epic journey.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="bg-gradient-to-r from-cyan-500 to-cyan-600 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-950 px-8 py-3 rounded-lg font-semibold transition-all">
            Start Forging My Path →
          </Link>
          <button className="border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400 px-8 py-3 rounded-lg font-semibold transition-all">
            View Career Paths
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Your Career Operating System</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Target, title: "Personalized Roadmap", desc: "AI-powered career path aligned with your goals" },
            { icon: Zap, title: "Daily Quests", desc: "Bite-sized missions that build real skills" },
            { icon: TrendingUp, title: "XP & Leveling", desc: "Track progress visually, level up in your career" },
            { icon: Code2, title: "Portfolio Proof", desc: "Ship real projects and build credible proof" },
            { icon: Brain, title: "AI Mentor", desc: "24/7 coaching for strategy and motivation" },
            { icon: Award, title: "Readiness Score", desc: "Know exactly how job-ready you are" },
          ].map((feat, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-cyan-500/50 transition-all">
              <feat.icon className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="font-semibold mb-2">{feat.title}</h3>
              <p className="text-slate-400 text-sm">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Simple, Fair Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: "Free", price: "₱0", features: ["1 Career Path", "Limited Daily Quests", "Basic AI Mentor", "Basic Analytics"] },
            { name: "Pro", price: "₱499", features: ["Unlimited Paths", "Advanced AI", "Custom Quests", "Portfolio Review", "Mock Interviews"] },
            { name: "Elite", price: "₱1,999", features: ["Everything in Pro", "AI Strategy Session", "Priority Support", "Job Application Strategy"] },
          ].map((plan, i) => (
            <div key={i} className={`border rounded-xl p-8 transition-all ${i === 1 ? 'bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border-cyan-400 shadow-lg shadow-cyan-500/20' : 'bg-slate-900 border-slate-800'}`}>
              <h3 className="font-bold text-lg mb-2">{plan.name}</h3>
              <p className="text-2xl font-bold mb-6">{plan.price}<span className="text-sm text-slate-400">/mo</span></p>
              <ul className="space-y-2 text-sm text-slate-400">
                {plan.features.map((f, j) => <li key={j}>✓ {f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 py-20 text-center border-t border-slate-800">
        <h2 className="text-3xl font-bold mb-6">Ready to Forge Your Path?</h2>
        <p className="text-slate-400 mb-8">Build real skills, ship real projects, and forge a career that lasts.</p>
        <Link href="/signup" className="inline-block bg-gradient-to-r from-cyan-500 to-violet-600 hover:shadow-lg hover:shadow-cyan-500/50 text-slate-950 px-8 py-3 rounded-lg font-semibold transition-all">
          Start Your Free Journey →
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>PathForge © 2026. Forge your future.</p>
      </footer>
    </div>
  );
}
