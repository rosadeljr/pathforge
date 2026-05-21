"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Copy,
  Check,
  Smartphone,
  Loader2,
  ArrowRight,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

interface Props {
  tier: "pro" | "elite";
  amount: number; // PHP
  onClose: () => void;
}

const PAYMENT_NUMBER = "0921 215 7479";
const PAYMENT_NUMBER_DIGITS = "09212157479";
const PAYMENT_NAME = "ZenForge Technologies";

export function GCashPaymentModal({ tier, amount, onClose }: Props) {
  const [step, setStep] = useState<"instructions" | "submit" | "success">("instructions");
  const [method, setMethod] = useState<"gcash" | "maya">("gcash");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderNumber, setSenderNumber] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const supabase = createClient();

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      toast.success("Copied");
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!referenceNumber.trim()) {
      toast.error("Please enter your reference number");
      return;
    }

    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("Please sign in first");
        setSubmitting(false);
        return;
      }

      const { data: inserted, error } = await supabase
        .from("payment_requests")
        .insert({
          user_id: session.user.id,
          tier,
          amount_php: amount,
          payment_method: method,
          sender_name: senderName.trim() || null,
          sender_number: senderNumber.trim() || null,
          reference_number: referenceNumber.trim(),
          proof_url: proofUrl.trim() || null,
          notes: notes.trim() || null,
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      // Fire-and-forget admin email alert (non-blocking, best-effort)
      if (inserted?.id) {
        fetch("/api/notify-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "submitted", paymentRequestId: inserted.id }),
        }).catch(() => {
          /* email is best-effort — never block the user */
        });
      }

      setStep("success");
    } catch (e: any) {
      console.error("Payment submission error:", e);
      toast.error(e?.message || "Couldn't submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 30, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 30, opacity: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full sm:max-w-lg bg-[#0a0a0f] border-t border-x sm:border border-white/[0.08] sm:rounded-2xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: "min(92svh, 92vh)" }}
      >
        {/* Mobile handle */}
        <div className="sm:hidden flex justify-center pt-2 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-lg border border-white/[0.06] hover:bg-white/[0.04] flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <X size={14} />
        </button>

        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: Payment Instructions */}
            {step === "instructions" && (
              <motion.div
                key="instructions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-5 sm:px-6 py-5 sm:py-6 space-y-5"
              >
                {/* Header */}
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 mb-3">
                    <Sparkles size={10} className="text-indigo-300" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                      Pay via GCash / Maya
                    </span>
                  </div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-1">
                    Upgrade to {tier === "pro" ? "Pro" : "Elite"}
                  </h2>
                  <p className="text-sm text-slate-400">
                    Send ₱{amount.toLocaleString()} via GCash or Maya, then submit your proof.
                  </p>
                </div>

                {/* Method picker */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMethod("gcash")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      method === "gcash"
                        ? "border-blue-400/50 bg-blue-500/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-sm font-bold text-blue-300">GCash</div>
                    <div className="text-[10px] text-slate-400">Most common</div>
                  </button>
                  <button
                    onClick={() => setMethod("maya")}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      method === "maya"
                        ? "border-green-400/50 bg-green-500/10"
                        : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04]"
                    }`}
                  >
                    <div className="text-sm font-bold text-green-300">Maya</div>
                    <div className="text-[10px] text-slate-400">Also accepted</div>
                  </button>
                </div>

                {/* Payment details */}
                <div className="space-y-2.5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                    Send to
                  </div>

                  <PaymentField
                    label="Mobile number"
                    value={PAYMENT_NUMBER}
                    copyValue={PAYMENT_NUMBER_DIGITS}
                    field="number"
                    copied={copiedField === "number"}
                    onCopy={() => handleCopy(PAYMENT_NUMBER_DIGITS, "number")}
                    icon={Smartphone}
                  />

                  <PaymentField
                    label="Account name"
                    value={PAYMENT_NAME}
                    field="name"
                    copied={copiedField === "name"}
                    onCopy={() => handleCopy(PAYMENT_NAME, "name")}
                  />

                  <PaymentField
                    label="Amount"
                    value={`₱${amount.toLocaleString()}.00`}
                    copyValue={amount.toString()}
                    field="amount"
                    copied={copiedField === "amount"}
                    onCopy={() => handleCopy(amount.toString(), "amount")}
                    highlight
                  />
                </div>

                {/* Steps */}
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-2">
                    How to pay
                  </div>
                  <ol className="space-y-1.5">
                    {[
                      `Open ${method === "gcash" ? "GCash" : "Maya"} app`,
                      "Tap 'Send Money' to a mobile number",
                      "Paste the number above",
                      `Enter ₱${amount.toLocaleString()}`,
                      "Send and screenshot the confirmation",
                      "Tap 'I've paid' below to submit proof",
                    ].map((step, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <div className="flex-shrink-0 w-4 h-4 rounded-full bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-[9px] font-bold">
                          {i + 1}
                        </div>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {/* Info note */}
                <div className="p-3 rounded-xl bg-amber-500/[0.06] border border-amber-500/20 flex gap-2.5">
                  <AlertCircle size={14} className="text-amber-300 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-amber-100/90 leading-relaxed">
                    Manual review takes <strong>up to 4 hours</strong> during PH business hours.
                    You'll be emailed once approved. Need help? <strong>support@pathforge.app</strong>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Submit Proof */}
            {step === "submit" && (
              <motion.div
                key="submit"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="px-5 sm:px-6 py-5 sm:py-6 space-y-4"
              >
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight mb-1">
                    Submit proof of payment
                  </h2>
                  <p className="text-sm text-slate-400">
                    Help us verify your ₱{amount.toLocaleString()} {method.toUpperCase()} payment.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Reference number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="e.g. 1234567890123"
                    className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Find this on your {method.toUpperCase()} confirmation receipt.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your name
                    </label>
                    <input
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      placeholder="Juan Dela Cruz"
                      className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Your number
                    </label>
                    <input
                      value={senderNumber}
                      onChange={(e) => setSenderNumber(e.target.value)}
                      placeholder="09xx xxx xxxx"
                      className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Screenshot link · optional
                  </label>
                  <input
                    value={proofUrl}
                    onChange={(e) => setProofUrl(e.target.value)}
                    placeholder="Imgur, Drive, or any public link"
                    className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Notes · optional
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything we should know..."
                    rows={2}
                    className="w-full px-3.5 py-2 bg-white/[0.03] border border-white/[0.06] rounded-lg text-sm resize-none focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/30"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: Success */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 sm:px-6 py-8 sm:py-10 text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 mb-5 shadow-2xl shadow-emerald-500/30">
                  <Check size={28} className="text-white" strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight mb-2">
                  Payment submitted!
                </h2>
                <p className="text-sm text-slate-400 mb-6 max-w-sm mx-auto">
                  We'll verify your payment within <strong>4 hours</strong> during PH business
                  hours. You'll get an email at the address linked to your account once
                  approved.
                </p>
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] text-left mb-5">
                  <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">
                    What's next
                  </div>
                  <ul className="space-y-1 text-xs text-slate-300">
                    <li>• Keep questing — your XP & streaks continue</li>
                    <li>• Pro features unlock automatically on approval</li>
                    <li>• You'll be notified via email + in-app</li>
                  </ul>
                </div>
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-slate-900 text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Got it
                  <ArrowRight size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer (sticky) — hidden on success */}
        {step !== "success" && (
          <div
            className="px-5 sm:px-6 py-3 sm:py-4 border-t border-white/[0.06] bg-[#0a0a0f]/95 backdrop-blur-xl flex items-center justify-between gap-2 flex-shrink-0"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 12px)" }}
          >
            {step === "instructions" ? (
              <>
                <button
                  onClick={onClose}
                  className="px-3 sm:px-4 py-2 rounded-lg border border-white/[0.08] text-xs sm:text-sm font-medium text-slate-300 hover:bg-white/[0.04] transition-colors flex-shrink-0"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep("submit")}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-white text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  I've paid · submit proof
                  <ArrowRight size={14} />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setStep("instructions")}
                  className="px-3 sm:px-4 py-2 rounded-lg border border-white/[0.08] text-xs sm:text-sm font-medium text-slate-300 hover:bg-white/[0.04] transition-colors flex-shrink-0"
                  disabled={submitting}
                >
                  Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !referenceNumber.trim()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 rounded-lg bg-white text-slate-900 text-xs sm:text-sm font-semibold hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Submit for review
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

function PaymentField({
  label,
  value,
  copyValue,
  field,
  copied,
  onCopy,
  icon: Icon,
  highlight,
}: {
  label: string;
  value: string;
  copyValue?: string;
  field: string;
  copied: boolean;
  onCopy: () => void;
  icon?: any;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-xl border ${
        highlight
          ? "bg-gradient-to-br from-indigo-500/[0.08] to-transparent border-indigo-500/30"
          : "bg-white/[0.02] border-white/[0.06]"
      }`}
    >
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-300 flex-shrink-0">
          <Icon size={14} />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-0.5">
          {label}
        </div>
        <div className={`text-sm font-mono font-semibold truncate ${highlight ? "text-white" : "text-slate-200"}`}>
          {value}
        </div>
      </div>
      <button
        onClick={onCopy}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] font-medium text-slate-300 hover:bg-white/[0.08] hover:text-white transition-colors flex-shrink-0"
      >
        {copied ? (
          <>
            <Check size={10} className="text-emerald-400" />
            Copied
          </>
        ) : (
          <>
            <Copy size={10} />
            Copy
          </>
        )}
      </button>
    </div>
  );
}
