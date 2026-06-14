"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  Sparkles,
  ArrowRight,
  CreditCard,
  Heart,
  Zap,
  ArrowLeft,
  Loader2,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";
import { Logo } from "@/components/brand/Logo";
import { PrimaryLinkButton } from "@/components/ui/PrimaryButton";
import { GCashPaymentModal } from "@/components/payments/GCashPaymentModal";
import { PayMongoPaymentSheet } from "@/components/payments/PayMongoPaymentSheet";
import { track } from "@/lib/analytics/track";

const PLANS = [
  {
    name: "Free",
    icon: Zap,
    accent: "#94a3b8",
    price: "₱0",
    period: "forever",
    description: "Everything kids need to get started — free forever.",
    features: [
      "5 lessons per day across all subjects",
      "ForgeBot tutor — 10 messages/day",
      "Pick a dream career & track progress",
      "All 5 subjects unlocked (Math, English, Filipino, Science, AP)",
      "XP, levels, streaks & achievements",
      "Leaderboards with friends",
    ],
    cta: "Start free",
    highlight: false,
  },
  {
    name: "Pro",
    icon: Sparkles,
    accent: "#a855f7",
    price: "₱149",
    period: "per month",
    description: "For kids learning every day — unlimited everything.",
    features: [
      "Everything in Free",
      "Unlimited lessons — no daily cap",
      "Unlimited ForgeBot tutor — no message cap",
      "Parent dashboard with weekly progress reports",
      "Priority support",
      "Cancel anytime",
    ],
    cta: "Go Pro",
    highlight: true,
    badge: "Most popular",
  },
  {
    name: "Family",
    icon: Users,
    accent: "#f59e0b",
    price: "₱299",
    period: "per month",
    description: "One subscription. Up to 4 kids. Everyone learns.",
    features: [
      "Everything in Pro for each kid",
      "Up to 4 separate kid profiles",
      "Parent dashboard for all kids in one view",
      "Weekly progress emails per child",
      "Sibling leaderboard (fun motivation)",
      "Save vs. 4× Pro plans",
    ],
    cta: "Go Family",
    highlight: false,
  },
];

const FAQS = [
  {
    q: "Is there really a free tier?",
    a: "Yes. Free forever, no credit card needed. Your kid gets 5 lessons/day, 10 tutor messages/day, dream career picking, and all 5 subjects unlocked. Upgrade only when they outgrow it.",
  },
  {
    q: "How does the kid-safe AI tutor work?",
    a: "ForgeBot adapts to your child's age tier — gentle and short replies for ages 6–9, friendly for 10–13, peer-mentor for 14–18. Strict safety guardrails block any inappropriate topic. No external links. No data sharing.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Anytime. We don't lock you in. If you cancel, your kid keeps their account and progress — they just lose Pro features at the end of the billing period.",
  },
  {
    q: "Why so affordable?",
    a: "₱149/mo Pro is less than a single tutoring session. ₱299/mo Family covers 4 kids — that's ₱75/kid. PathForge should be a no-brainer for any Filipino family that values education.",
  },
  {
    q: "Is it safe for my kid?",
    a: "Yes. No ads. No in-app purchases for kids. No external links. AI tutor has strict age-based content guardrails. Friends can only connect within the same mode. Built by parents, for parents.",
  },
  {
    q: "What payment methods do you accept?",
    a: "GCash and Maya — automated via PayMongo (the BSP-regulated payments network). After signup, tap Upgrade, pick your wallet, confirm in the app — your subscription activates within a minute. A manual proof-upload fallback is also available if you prefer.",
  },
  {
    q: "Is there a refund policy?",
    a: "Yes — 30-day refund window from your first paid subscription. Just email support@pathforger.app. After 30 days, you can cancel anytime to stop future charges.",
  },
];

const PRICE_BY_TIER: Record<"pro" | "family", number> = {
  pro: 149,
  family: 299,
};

export default function PricingPage() {
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  // Two payment surfaces:
  //   paymongoSheet → automated GCash/Maya via PayMongo (instant)
  //   paymentModal  → manual proof-upload (legacy fallback)
  // We default to the PayMongo sheet for every authenticated upgrade,
  // and let the user opt into manual from inside the sheet.
  const [paymongoSheet, setPaymongoSheet] = useState<{ tier: "pro" | "family"; amount: number } | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ tier: "pro" | "family"; amount: number } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setAuthenticated(!!session?.user);
        // Ad-funnel: pricing_viewed. Only logs authenticated viewers (we
        // can't write analytics rows for anon viewers). Anon viewers are
        // captured by the marketing pixel in the layout.
        if (session?.user?.id) {
          track(supabase, session.user.id, "pricing_viewed", {
            payload: { source: "pricing_page" },
          });
        }
      }
    });

    // Surface errors returned by checkout (?error=...) and PayMongo
    // return-flow status (?upgrade=processing|failed|cancelled).
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const err = params.get("error");
      const upgrade = params.get("upgrade");
      if (err) setErrorBanner(decodeURIComponent(err));
      if (upgrade === "cancelled") {
        toast("Checkout cancelled. No charge was made.", { icon: "ℹ️" });
      } else if (upgrade === "failed") {
        toast.error(
          "Payment failed at the provider. Try again or use the manual method."
        );
      } else if (upgrade === "processing") {
        toast.success(
          "Payment received — we're confirming with the provider. Your tier will update in a moment.",
          { duration: 7000 }
        );
      }
    }

    return () => {
      mounted = false;
    };
  }, [supabase]);

  const handleSelect = async (planName: string) => {
    // Auth state still loading — ignore the click rather than mis-routing a
    // signed-in user to signup.
    if (authenticated === null) return;

    // Free always goes to signup (if not auth'd) or dashboard (if auth'd)
    if (planName === "Free") {
      router.push(authenticated ? "/learn" : "/signup");
      return;
    }

    // Paid plans: route to signup with a returnTo flag if not authenticated
    if (!authenticated) {
      router.push(`/signup?returnTo=${encodeURIComponent(`/pricing?upgrade=${planName.toLowerCase()}`)}`);
      return;
    }

    // Authenticated: open the PayMongo sheet (automated GCash/Maya).
    // Manual is reachable from inside the sheet as a fallback.
    const tier = planName.toLowerCase() as "pro" | "family";
    setPaymongoSheet({ tier, amount: PRICE_BY_TIER[tier] });
  };

  // CTA label changes based on auth state
  const ctaLabel = (plan: { name: string; cta: string }): string => {
    if (plan.name === "Free") return authenticated ? "Open lessons" : plan.cta;
    if (authenticated === null) return plan.cta;
    return authenticated ? plan.cta : "Sign up to upgrade";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white relative overflow-hidden">
      {/* Ambient bg */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, rgba(168,85,247,0.3), transparent 70%)" }}
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

      {/* Top nav */}
      <nav className="relative z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <Logo size={26} className="flex-shrink-0" />
            <span className="text-sm sm:text-base font-semibold tracking-tight truncate">
              PathForge
            </span>
          </Link>
          <div className="flex items-center gap-2 flex-shrink-0">
            {authenticated ? (
              <Link
                href="/learn"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-slate-300 hover:text-white px-2 sm:px-3 py-1.5 transition-colors"
              >
                <ArrowLeft size={12} />
                My lessons
              </Link>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
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
            Start free. Upgrade only when PathForge becomes your edge. Cancel anytime.
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
                  <div
                    className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-30 pointer-events-none"
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
                    <span className="text-4xl font-semibold tracking-tight tabular-nums">
                      {plan.price}
                    </span>
                    <span className="text-sm text-slate-400">/{plan.period}</span>
                  </div>
                </div>

                {/* CTA — disabled with a spinner until we know the auth state,
                    so the button can't be clicked into a no-op. */}
                <button
                  onClick={() => handleSelect(plan.name)}
                  disabled={authenticated === null}
                  aria-busy={authenticated === null}
                  className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all mb-6 inline-flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-wait ${
                    plan.highlight
                      ? "bg-white text-slate-900 hover:bg-slate-100 shadow-lg shadow-white/5"
                      : "border border-white/[0.08] text-slate-300 hover:bg-white/[0.04] hover:border-white/[0.16]"
                  }`}
                >
                  {authenticated === null && <Loader2 size={14} className="animate-spin" />}
                  {ctaLabel(plan)}
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
            <h2 className="text-3xl font-semibold tracking-tight mb-2">Questions, answered.</h2>
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
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background:
                  "radial-gradient(ellipse at top, rgba(168,85,247,0.4), transparent 70%)",
              }}
            />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight mb-3">
                Ready to forge?
              </h2>
              <p className="text-base text-slate-400 mb-8 max-w-md mx-auto">
                Start free. Upgrade only when PathForge becomes your secret weapon.
              </p>
              <PrimaryLinkButton href={authenticated ? "/learn" : "/signup"} size="lg">
                {authenticated ? "Open dashboard" : "Create your account"}
                <ArrowRight size={14} />
              </PrimaryLinkButton>
            </div>
          </div>
        </motion.div>
      </div>

      {/* PayMongo automated checkout — primary path */}
      {paymongoSheet && (
        <PayMongoPaymentSheet
          tier={paymongoSheet.tier}
          amount={paymongoSheet.amount}
          onClose={() => setPaymongoSheet(null)}
          onManualFallback={() => {
            const next = paymongoSheet;
            setPaymongoSheet(null);
            if (next) setPaymentModal(next);
          }}
        />
      )}

      {/* GCash / Maya manual proof-upload modal — fallback path */}
      {paymentModal && (
        <GCashPaymentModal
          tier={paymentModal.tier}
          amount={paymentModal.amount}
          onClose={() => setPaymentModal(null)}
        />
      )}
    </div>
  );
}
