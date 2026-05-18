"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Pricing() {
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthenticated(!!user);
    }
    checkAuth();
  }, [supabase]);

  const plans = [
    {
      name: "Free",
      price: "₱0",
      period: "forever",
      description: "Get started with the essentials",
      features: [
        "1 Active Career Path",
        "Limited Daily Quests (3/day)",
        "Basic AI Mentor",
        "Basic Analytics",
        "Standard XP Progression",
      ],
      cta: "Start Free",
      highlight: false,
    },
    {
      name: "Pro",
      price: "₱499",
      period: "per month",
      description: "Level up your career journey",
      features: [
        "Unlimited Career Paths",
        "Unlimited Daily Quests",
        "Advanced AI Mentor with Strategy",
        "Custom Quest Generation",
        "Portfolio AI Review",
        "Mock Interview Prep",
        "Advanced Analytics",
        "Priority Support",
      ],
      cta: "Upgrade to Pro",
      highlight: true,
    },
    {
      name: "Elite",
      price: "₱1,999",
      period: "per month",
      description: "Complete career acceleration",
      features: [
        "Everything in Pro",
        "Personalized AI Career Strategy",
        "Weekly Strategy Sessions",
        "Resume Optimization AI",
        "Job Application Strategy",
        "Salary Negotiation Coaching",
        "Premium Themes",
        "VIP Support",
      ],
      cta: "Upgrade to Elite",
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Simple, Fair Pricing</h1>
          <p className="text-xl text-slate-400">Choose your path to career success</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl p-8 transition-all ${
                plan.highlight
                  ? "bg-gradient-to-br from-cyan-500/10 to-violet-500/10 border-2 border-cyan-400 shadow-lg shadow-cyan-500/20 relative md:scale-105"
                  : "bg-slate-900 border border-slate-800"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-400 to-violet-500 px-4 py-1 rounded-full text-xs font-bold text-slate-950">
                  MOST POPULAR
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-slate-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-slate-400 text-sm">/{plan.period}</span>}
              </div>

              <button
                onClick={() => authenticated ? router.push("/dashboard") : router.push("/signup")}
                className={`w-full py-3 rounded-lg font-semibold mb-8 transition-all ${
                  plan.highlight
                    ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-slate-950 hover:shadow-lg hover:shadow-cyan-500/50"
                    : "border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-cyan-400"
                }`}
              >
                {plan.cta}
              </button>

              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
