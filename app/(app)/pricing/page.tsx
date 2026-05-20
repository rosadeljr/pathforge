"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, CreditCard, Crown, Zap, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

const PLANS = [
  {
    name: "Free",
    icon: Zap,
    accent: "#94a3b8",
    price: "₱0",
    period: "forever",
    description: "Test the waters. Forge your first level.",
    features: [
      "1 active career path",
      "3 daily quests",
      "Basic AI mentor",
      "Standard XP progression",
      "Public portfolio",
    ],
    notIncluded: [
      "Advanced AI strategies",
      "Mock interview prep",
      "Priority support",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    icon: Sparkles,
    accent: "#a855f7",
    price: "₱499",
    period: "per month",
    description: "For ambitious forgers who want to ship.",
    features: [
      "Unlimited career paths",
      "Unlimited daily quests",
      "Advanced AI mentor with strategy",
      "Custom quest generation",
      "Portfolio AI review",
      "Mock interview prep",
      "Advanced analytics & insights",
      "Priority support",
    ],
    notIncluded: [],
    cta: "Go Pro",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Elite",
    icon: Crown,
    accent: "#f59e0b",
    price: "₱1,999",
    period: "per month",
    description: "Total career acceleration. White-glove.",
    features: [
      "Everything in Pro",
      "Personalized AI career strategy",
      "Weekly 1:1 strategy sessions",
      "Resume optimization AI",
      "Job application strategy",
      "Salary negotiation coaching",
      "Premium themes & badges",
      "VIP support",
    ],
    notIncluded: [],
    cta: "Go Elite",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Is there really a free tier?",
    a: "Yes. Free forever, no credit card. You can complete quests, talk to the AI mentor (basic), build your portfolio, and level up. Upgrade only when you outgrow it.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime. We don't lock you in. If you cancel, you keep your account and progress — you just lose Pro/Elite features.",
  },
  {
    q: "Who is PathForge for?",
    a: "Designed with the global remote economy in mind. Salary ranges shown in PHP for the PH market, plus remote-friendly career paths (VA, Copywriter, Customer Success) that work from anywhere.",
  },
  {
    q: "Do I need to know how to code?",
    a: "Nope. Half our career paths are non-technical — Design, Marketing, Content, Virtual Assistant, Customer Success, Copywriting. Anyone ambitious can use PathForge.",
  },
];

export default function Pricing() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthenticated(!!session?.user);
    }
    checkAuth();

    // Surface errors returned by Stripe checkout (?error=...)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      const cancelled = params.get("upgrade") === "cancelled";
      if (err) setErrorBanner(decodeURIComponent(err));
      if (cancelled) {
        toast("Checkout cancelled. No charge was made.", { icon: "ℹ️" });
      }
    }
  }, [supabase]);

  const handleSelect = async (planName: string) => {
    if (!authenticated) {
      router.push("/signup");
      return;
    }
    if (planName === "Free") {
      router.push("/dashboard");
      return;
    }

    const tier = planName.toLowerCase();
    setLoadingPlan(tier);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (e: any) {
      console.error("Checkout error:", e);
      toast.error(e?.message || "Couldn't start checkout. Try again.");
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] mb-5">
            <CreditCard size={11} className="text-indigo-400" />
            <span className="text-xs font-medium text-slate-300 tracking-wide">Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight mb-4">
            Forge for free.
            <br />
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              Pay only when it pays off.
            </span>
          </h1>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Start free. Upgrade only if PathForge becomes your edge. Cancel anytime.
          </p>
        </motion.div>

        {/* Error banner */}
        {errorBanner && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/[0.06] text-sm text-rose-200 flex items-start gap-3"
          >
            <CreditCard size={14} className="text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-semibold">Checkout failed</div>
              <div className="text-xs text-rose-200/80 mt-0.5">
                {errorBanner === "checkout_failed"
                  ? "Something went wrong starting checkout. Please try again."
                  : errorBanner}
              </div>
            </div>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-rose-300 hover:text-rose-100 text-xs underline"
            >
              Dismiss
            </button>
          </motion.div>
        )}

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.05 }}
              className={`relative overflow-hidden rounded-3xl border p-6 lg:p-8 flex flex-col ${
                plan.highlight
                  ? "border-white/20 bg-gradient-to-br from-white/[0.06] to-transparent"
                  : "border-white/[0.06] bg-white/[0.02]"
              }`}
            >
              {plan.highlight && (
                <>
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-30 pointer-events-none"
                    style={{ background: `radial-gradient(circle, ${plan.accent}50, transparent 70%)` }}
                  />
                  {plan.badge && (
                    <div className="absolute top-6 right-6">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                        {plan.badge}
                      </span>
                    </div>
                  )}
                </>
              )}

              <div className="relative">
                {/* Icon + Name */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${plan.accent}15`, color: plan.accent }}
                >
                  <plan.icon size={18} />
                </div>
                <h3 className="text-xl font-semibold tracking-tight mb-1">{plan.name}</h3>
                <p className="text-sm text-slate-400 mb-6 leading-relaxed">{plan.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold tracking-tight tabular-nums">{plan.price}</span>
                    <span className="text-sm text-slate-400">/{plan.period}</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => handleSelect(plan.name)}
                  disabled={loadingPlan !== null}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all mb-6 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                    plan.highlight
                      ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/5"
                      : "border border-white/[0.08] text-slate-300 hover:bg-white/[0.04] hover:border-white/[0.16]"
                  }`}
                >
                  {loadingPlan === plan.name.toLowerCase() ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Opening Stripe…
                    </>
                  ) : (
                    plan.cta
                  )}
                </button>

                {/* Features */}
                <ul className="space-y-2.5">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm text-slate-200">
                      <div
                        className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: `${plan.accent}20`, color: plan.accent }}
                      >
                        <Check size={10} strokeWidth={3} />
                      </div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust strip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto text-center"
        >
          {[
            { label: "Cancel anytime", value: "🛡️" },
            { label: "30-day refund", value: "💰" },
            { label: "Encrypted data", value: "🔒" },
            { label: "PH-based support", value: "🇵🇭" },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="text-2xl mb-1">{item.value}</div>
              <div className="text-xs text-slate-400">{item.label}</div>
            </div>
          ))}
        </motion.div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold tracking-tight mb-2">
              Questions, answered.
            </h2>
            <p className="text-sm text-slate-400">Real questions from real users.</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
            {FAQS.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="p-5 rounded-2xl border border-white/[0.06] bg-white/[0.02]"
              >
                <h4 className="text-sm font-semibold mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-400 leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-20 max-w-3xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-white/[0.06] to-transparent p-10 lg:p-12 text-center">
            <div className="absolute inset-0 opacity-30"
              style={{ background: "radial-gradient(ellipse at top, rgba(168,85,247,0.4), transparent 70%)" }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                Ready to forge?
              </h2>
              <p className="text-base text-slate-400 mb-8 max-w-md mx-auto">
                Start free. Upgrade only when PathForge becomes your secret weapon.
              </p>
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 px-6 py-3 rounded-lg text-sm font-semibold transition-all shadow-2xl shadow-white/10"
              >
                Create your account
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
