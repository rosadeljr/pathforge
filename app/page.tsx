"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, Brain, Trophy, TrendingUp, Code2, Gauge } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Container } from "@/components/layout/Container";
import { Section } from "@/components/layout/Section";
import { GradientText } from "@/components/ui/GradientText";
import { Stat } from "@/components/ui/Stat";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-slate-900/30 to-black">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-cyan-500/10 bg-black/80 backdrop-blur-lg">
        <Container maxWidth="2xl" padding={true}>
          <div className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg" />
              <span className="text-lg font-bold gradient-text">PathForge</span>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost" size="md">
                  Login
                </Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="md">
                  Sign Up <ArrowRight size={16} />
                </Button>
              </Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <Section padding="xl" background="dark" className="pt-32">
        <Container maxWidth="xl">
          <div className="text-center space-y-6 mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-500/30 bg-cyan-500/5">
              <Sparkles size={16} className="text-cyan-400" />
              <span className="text-sm font-medium text-cyan-300">Welcome to the future of career growth</span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold leading-tight">
              Your <GradientText>Career Operating</GradientText> <br /> System
            </h1>

            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
              Build your skills, track progress, and level up your career with AI-powered mentorship, gamified learning, and real results.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <Link href="/signup">
                <Button variant="primary" size="lg" className="hover-lift">
                  Start Free <ArrowRight size={20} />
                </Button>
              </Link>
              <Button variant="secondary" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Floating stats */}
          <div className="grid grid-cols-3 gap-6 mt-20">
            <Stat label="Max Levels" value="100" icon={<Trophy />} color="violet" />
            <Stat label="AI Mentorship" value="24/7" icon={<Brain />} color="cyan" />
            <Stat label="Success Rate" value="95%" icon={<TrendingUp />} color="amber" />
          </div>
        </Container>
      </Section>

      {/* Features Section */}
      <Section padding="lg" background="gradient">
        <Container maxWidth="2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Powerful Features</h2>
            <p className="text-slate-400">Everything you need to accelerate your career growth</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Brain className="text-cyan-400" size={32} />,
                title: "AI Mentor",
                description: "Get personalized guidance from an AI mentor trained on career wisdom",
                badge: "Premium",
              },
              {
                icon: <Trophy className="text-violet-400" size={32} />,
                title: "Gamification",
                description: "Earn XP, climb levels, maintain streaks, and unlock achievements",
                badge: "Engaging",
              },
              {
                icon: <Gauge className="text-amber-400" size={32} />,
                title: "Readiness Score",
                description: "Track your job readiness across skills, portfolio, and interview prep",
                badge: "Analytics",
              },
            ].map((feature, i) => (
              <Card
                key={i}
                glass
                hover
                interactive
                className="group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-violet-500/0 group-hover:from-cyan-500/5 group-hover:to-violet-500/5 transition-colors" />
                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div>{feature.icon}</div>
                    <Badge variant="cyan" size="sm">
                      {feature.badge}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section padding="lg" background="dark">
        <Container maxWidth="2xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { label: "Levels to Unlock", value: "100" },
              { label: "Career Paths", value: "10+" },
              { label: "AI Mentors Ready", value: "∞" },
              { label: "Communities", value: "Growing" },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <p className="text-4xl font-bold gradient-text">{stat.value}</p>
                <p className="text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Pricing Section */}
      <Section padding="lg" background="gradient">
        <Container maxWidth="2xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
            <p className="text-slate-400">Choose the plan that works for you</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              {
                name: "Free",
                price: "$0",
                description: "Perfect for getting started",
                features: [
                  "✓ Level progression",
                  "✓ Basic quests",
                  "✓ AI mentor (limited)",
                  "✓ Community access",
                ],
                cta: "Get Started",
                recommended: false,
              },
              {
                name: "Pro",
                price: "$29",
                period: "/month",
                description: "For serious career builders",
                features: [
                  "✓ Everything in Free",
                  "✓ Unlimited AI mentoring",
                  "✓ Portfolio showcase",
                  "✓ Priority support",
                  "✓ Advanced analytics",
                ],
                cta: "Start Free Trial",
                recommended: true,
              },
            ].map((plan, i) => (
              <Card
                key={i}
                glass={!plan.recommended}
                className={plan.recommended ? "ring-2 ring-cyan-500/50 bg-gradient-to-br from-cyan-500/10 to-violet-500/10" : ""}
              >
                <div className="space-y-6">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-2xl font-bold">{plan.name}</h3>
                      {plan.recommended && (
                        <Badge variant="cyan">Recommended</Badge>
                      )}
                    </div>
                    <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                    <div className="text-4xl font-bold">
                      {plan.price}
                      {plan.period && <span className="text-lg text-slate-400">{plan.period}</span>}
                    </div>
                  </div>

                  <Link href="/signup" className="block">
                    <Button
                      variant={plan.recommended ? "primary" : "secondary"}
                      size="lg"
                      className="w-full"
                    >
                      {plan.cta}
                    </Button>
                  </Link>

                  <div className="space-y-2">
                    {plan.features.map((feature, j) => (
                      <p key={j} className="text-sm text-slate-300">
                        {feature}
                      </p>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA Section */}
      <Section padding="xl" background="glass">
        <Container maxWidth="xl">
          <div className="text-center space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to <GradientText>Level Up</GradientText>?
            </h2>
            <p className="text-xl text-slate-400">
              Join thousands building their dream careers with PathForge
            </p>
            <Link href="/signup">
              <Button variant="primary" size="lg" className="hover-lift">
                Start Your Journey <ArrowRight size={20} />
              </Button>
            </Link>
          </div>
        </Container>
      </Section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-12">
        <Container maxWidth="2xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-violet-500 rounded-lg" />
                <span className="font-bold gradient-text">PathForge</span>
              </div>
              <p className="text-sm text-slate-400">
                Your AI-powered career operating system
              </p>
            </div>
            {[
              { title: "Product", links: ["Features", "Pricing", "Security"] },
              { title: "Company", links: ["About", "Blog", "Contact"] },
              { title: "Legal", links: ["Privacy", "Terms", "Cookies"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-sm text-slate-400 hover:text-cyan-400">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>© 2026 PathForge. All rights reserved.</p>
          </div>
        </Container>
      </footer>
    </div>
  );
}
