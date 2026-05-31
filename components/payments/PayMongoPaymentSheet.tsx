"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";

/**
 * Automated GCash / Maya checkout via PayMongo.
 *
 * Flow:
 *   1. User picks GCash or Maya.
 *   2. We POST /api/paymongo/create-source — returns a checkout URL.
 *   3. We window.location.assign() to that URL → user pays in their wallet.
 *   4. PayMongo redirects them back to /api/paymongo/return → /pricing.
 *   5. Webhook upgrades the user (truth source).
 *
 * The "manual flow" fallback is exposed below for users who prefer to
 * pay by sending money to a hard-coded number and uploading proof.
 */

interface Props {
  tier: "pro" | "family";
  amount: number; // PHP
  onClose: () => void;
  /** Called when the user explicitly opts out of PayMongo to use manual. */
  onManualFallback: () => void;
}

export function PayMongoPaymentSheet({
  tier,
  amount,
  onClose,
  onManualFallback,
}: Props) {
  const [loading, setLoading] = useState<"gcash" | "paymaya" | null>(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const startCheckout = async (method: "gcash" | "paymaya") => {
    setLoading(method);
    try {
      const res = await fetch("/api/paymongo/create-source", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier, method }),
      });
      const json = await res.json();
      if (!res.ok || !json?.checkoutUrl) {
        const msg = json?.error || "Couldn't start checkout. Try the manual method.";
        toast.error(msg);
        setLoading(null);
        return;
      }
      // Hard navigate to PayMongo's hosted checkout. They redirect back
      // to /api/paymongo/return after the user finishes (or cancels).
      window.location.assign(json.checkoutUrl);
    } catch (e: any) {
      toast.error(e?.message || "Network error. Try the manual method.");
      setLoading(null);
    }
  };

  if (!mounted) return null;

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60, scale: 0.97 }}
        animate={{ y: 0, scale: 1 }}
        exit={{ y: 60, scale: 0.97 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-md bg-[#0c0c14] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          <X size={16} />
        </button>

        <div className="mb-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 rounded-md px-2 py-0.5 mb-3">
            <Zap size={10} />
            Instant
          </div>
          <h2 className="text-xl font-bold tracking-tight">
            Upgrade to {tier === "pro" ? "Pro" : "Family"}
          </h2>
          <p className="text-sm text-slate-400 mt-0.5">
            ₱{amount.toLocaleString()} /month · automated · no manual proof
          </p>
        </div>

        <div className="mt-5 space-y-2.5">
          <PayMethodButton
            label="Pay with GCash"
            sublabel="Open GCash, confirm, done"
            emoji="💙"
            loading={loading === "gcash"}
            disabled={loading !== null}
            onClick={() => startCheckout("gcash")}
            accent="#0ea5e9"
          />
          <PayMethodButton
            label="Pay with Maya"
            sublabel="Open Maya, confirm, done"
            emoji="💚"
            loading={loading === "paymaya"}
            disabled={loading !== null}
            onClick={() => startCheckout("paymaya")}
            accent="#10b981"
          />
        </div>

        <div className="mt-5 p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
          <div className="flex items-start gap-2.5">
            <ShieldCheck size={14} className="text-emerald-300 mt-0.5 flex-shrink-0" />
            <div className="text-[11px] text-slate-300 leading-relaxed">
              Payment is processed by PayMongo (BSP-regulated). We never see
              your wallet PIN or card details. Your upgrade activates the
              moment payment is confirmed — usually under a minute.
            </div>
          </div>
        </div>

        <button
          onClick={onManualFallback}
          className="mt-4 w-full text-center text-xs text-slate-400 hover:text-white transition-colors inline-flex items-center justify-center gap-1.5"
        >
          Prefer to send manually and upload proof?
          <ArrowRight size={11} />
        </button>
      </motion.div>
    </motion.div>,
    document.body
  );
}

function PayMethodButton({
  label,
  sublabel,
  emoji,
  loading,
  disabled,
  onClick,
  accent,
}: {
  label: string;
  sublabel: string;
  emoji: string;
  loading: boolean;
  disabled: boolean;
  onClick: () => void;
  accent: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group w-full flex items-center gap-3.5 p-3.5 rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.16] disabled:opacity-50 disabled:cursor-not-allowed transition-all text-left"
    >
      <div
        className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-xl"
        style={{
          background: `linear-gradient(135deg, ${accent}33, ${accent}11)`,
          border: `1px solid ${accent}55`,
        }}
      >
        {emoji}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold">{label}</div>
        <div className="text-[11px] text-slate-400">{sublabel}</div>
      </div>
      {loading ? (
        <Loader2 size={16} className="text-slate-300 animate-spin flex-shrink-0" />
      ) : (
        <ArrowRight
          size={16}
          className="text-slate-500 group-hover:text-white group-hover:translate-x-0.5 transition-all flex-shrink-0"
        />
      )}
    </button>
  );
}
