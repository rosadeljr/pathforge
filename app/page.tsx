"use client";

import Link from "next/link";
import { ArrowRight, Zap, TrendingUp, Brain, Trophy, Sparkles } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="border-b border-cyan-500/20 bg-black/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent">
            PathForge
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-gray-400 hover:text-white transition">
              Login
            </Link>
            <Link href="/signup" className="bg-cyan-500 hover:bg-cyan-600 text-black px-4 py-2 rounded-lg font-semibold transition">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-500 bg-clip-text text-transparent">
            Your Career Operating System
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Build your skills, track progress, and level up your career with PathForge. AI-powered mentorship, gamified learning, and proven results.
          </p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition">
            Start Free <ArrowRight size={20} />
          </Link>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="p-6 border border-cyan-500/20 rounded-lg hover:border-cyan-500/50 transition bg-cyan-500/5">
            <Brain className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">AI Mentor</h3>
            <p className="text-gray-400">Get personalized guidance from an AI mentor trained on career wisdom</p>
          </div>
          <div className="p-6 border border-violet-500/20 rounded-lg hover:border-violet-500/50 transition bg-violet-500/5">
            <Trophy className="text-violet-400 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Gamification</h3>
            <p className="text-gray-400">Earn XP, climb levels, maintain streaks, and unlock achievements</p>
          </div>
          <div className="p-6 border border-amber-500/20 rounded-lg hover:border-amber-500/50 transition bg-amber-500/5">
            <TrendingUp className="text-amber-400 mb-4" size={32} />
            <h3 className="text-xl font-bold mb-2">Readiness Score</h3>
            <p className="text-gray-400">Track your job readiness across skills, portfolio, and interview prep</p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-y border-cyan-500/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-cyan-400">100</div>
            <p className="text-gray-400 mt-2">Levels to Unlock</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-violet-400">24/7</div>
            <p className="text-gray-400 mt-2">AI Mentorship</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-amber-400">10+</div>
            <p className="text-gray-400 mt-2">Career Paths</p>
          </div>
          <div>
            <div className="text-4xl font-bold text-cyan-400">∞</div>
            <p className="text-gray-400 mt-2">Growth Potential</p>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-8 border border-cyan-500/20 rounded-lg">
            <h3 className="text-2xl font-bold mb-2">Free</h3>
            <p className="text-gray-400 mb-6">Perfect for getting started</p>
            <div className="text-3xl font-bold mb-6">$0</div>
            <Link href="/signup" className="block text-center py-2 border border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition font-semibold mb-6">
              Get Started
            </Link>
            <ul className="space-y-3 text-gray-400">
              <li>✓ Level progression</li>
              <li>✓ Basic quests</li>
              <li>✓ AI mentor (limited)</li>
            </ul>
          </div>
          <div className="p-8 border border-violet-500/50 rounded-lg bg-violet-500/10">
            <h3 className="text-2xl font-bold mb-2">Pro</h3>
            <p className="text-gray-400 mb-6">For serious career builders</p>
            <div className="text-3xl font-bold mb-6">$29<span className="text-lg text-gray-400">/mo</span></div>
            <Link href="/signup" className="block text-center py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-black rounded-lg hover:shadow-lg hover:shadow-violet-500/50 transition font-semibold mb-6">
              Start Free Trial
            </Link>
            <ul className="space-y-3 text-gray-400">
              <li>✓ Everything in Free</li>
              <li>✓ Unlimited AI mentoring</li>
              <li>✓ Portfolio showcase</li>
              <li>✓ Priority support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border-t border-cyan-500/20 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Level Up?</h2>
          <p className="text-gray-400 mb-8">Join thousands building their dream careers</p>
          <Link href="/signup" className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition">
            Start Your Journey <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
