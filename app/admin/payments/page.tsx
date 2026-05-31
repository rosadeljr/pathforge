"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { track } from "@/lib/analytics/track";
import {
  CreditCard,
  Check,
  X,
  ExternalLink,
  Smartphone,
  User,
  Sparkles,
  Loader2,
  Clock,
} from "lucide-react";

interface PaymentRequest {
  id: string;
  user_id: string;
  tier: "pro" | "family";
  amount_php: number;
  payment_method: "gcash" | "maya";
  sender_name: string | null;
  sender_number: string | null;
  reference_number: string | null;
  proof_url: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  profile?: { username: string | null; email: string | null; full_name: string | null };
}

type Filter = "pending" | "approved" | "rejected" | "all";

export default function AdminPaymentsPage() {
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("pending");
  const [actionId, setActionId] = useState<string | null>(null);
  const supabase = createClient();

  async function load() {
    try {
      const { data, error } = await supabase
        .from("payment_requests")
        .select("*, profile:profiles!payment_requests_user_id_fkey(username, email, full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setRequests((data || []) as PaymentRequest[]);
    } catch (e: any) {
      console.error(e);
      toast.error("Failed to load payment requests");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = requests.filter((r) => (filter === "all" ? true : r.status === filter));

  const approve = async (req: PaymentRequest) => {
    setActionId(req.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // 1) mark approved
      const { error: e1 } = await supabase
        .from("payment_requests")
        .update({
          status: "approved",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", req.id);
      if (e1) throw e1;

      // 2) upgrade user's tier
      const { error: e2 } = await supabase
        .from("profiles")
        .update({ subscription_tier: req.tier })
        .eq("id", req.user_id);
      if (e2) throw e2;

      // 3) create subscription record (non-fatal — best-effort log)
      try {
        await supabase.from("subscriptions").insert({
          user_id: req.user_id,
          tier: req.tier,
          status: "active",
        });
      } catch {
        /* subscription record is a nice-to-have; tier upgrade above is the source of truth */
      }

      // 4) email the user (best-effort, non-blocking)
      fetch("/api/notify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "approved", paymentRequestId: req.id }),
      }).catch(() => {});

      // Ad-funnel: payment_approved (server-side conversion event).
      // Logged against the kid/parent user_id, not the admin, so it
      // appears in their funnel correctly.
      track(supabase, req.user_id, "payment_approved", {
        payload: {
          tier: req.tier,
          payment_request_id: req.id,
        },
      });

      toast.success(`Approved · user upgraded to ${req.tier.toUpperCase()}`);
      load();
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Approval failed");
    } finally {
      setActionId(null);
    }
  };

  const reject = async (req: PaymentRequest) => {
    const reason = window.prompt("Reject reason (optional):");
    if (reason === null) return; // user cancelled
    setActionId(req.id);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("payment_requests")
        .update({
          status: "rejected",
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq("id", req.id);
      if (error) throw error;

      // Email the user (best-effort, non-blocking)
      fetch("/api/notify-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "rejected", paymentRequestId: req.id, reason }),
      }).catch(() => {});

      toast.success("Rejected");
      load();
    } catch (e: any) {
      toast.error(e?.message || "Rejection failed");
    } finally {
      setActionId(null);
    }
  };

  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight mb-1">Payment Requests</h1>
        <p className="text-sm text-slate-400">
          Review GCash / Maya manual payments. Approve to upgrade users.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {(["pending", "approved", "rejected", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
              filter === f
                ? "bg-white text-slate-900"
                : "bg-white/[0.03] text-slate-300 border border-white/[0.06] hover:bg-white/[0.06]"
            }`}
          >
            {f === "all"
              ? "All"
              : `${f.charAt(0).toUpperCase() + f.slice(1)} (${counts[f as keyof typeof counts] || 0})`}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl border border-white/[0.06] bg-white/[0.02] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-center">
          <Sparkles size={20} className="text-slate-500 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            {filter === "pending" ? "No pending requests right now." : "No requests in this status."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((req, i) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.3) }}
              className="rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden"
            >
              <div className="p-5 grid sm:grid-cols-[1fr_auto] gap-4 items-start">
                {/* Left: details */}
                <div className="space-y-3 min-w-0">
                  {/* Header */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        req.tier === "family"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : "bg-violet-500/15 text-violet-300 border-violet-500/30"
                      }`}
                    >
                      {req.tier}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        req.payment_method === "gcash"
                          ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                          : "bg-green-500/15 text-green-300 border-green-500/30"
                      }`}
                    >
                      {req.payment_method}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        req.status === "pending"
                          ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                          : req.status === "approved"
                          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                          : "bg-rose-500/15 text-rose-300 border-rose-500/30"
                      }`}
                    >
                      {req.status}
                    </span>
                    <span className="text-xs text-slate-500 ml-auto inline-flex items-center gap-1">
                      <Clock size={11} />
                      {new Date(req.created_at).toLocaleString()}
                    </span>
                  </div>

                  {/* Amount + user */}
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-xl font-semibold tabular-nums">
                      ₱{req.amount_php.toLocaleString()}
                    </span>
                    <span className="text-sm text-slate-400">
                      from <strong className="text-slate-200">{req.profile?.full_name || req.profile?.username || "Unknown"}</strong>
                    </span>
                    {req.profile?.email && (
                      <span className="text-xs text-slate-500">({req.profile.email})</span>
                    )}
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                    {req.reference_number && (
                      <Detail label="Reference #" value={req.reference_number} mono />
                    )}
                    {req.sender_name && <Detail label="Sender" value={req.sender_name} />}
                    {req.sender_number && (
                      <Detail label="Sender #" value={req.sender_number} mono />
                    )}
                  </div>

                  {req.notes && (
                    <div className="text-xs text-slate-400 italic">"{req.notes}"</div>
                  )}

                  {req.proof_url && (
                    <a
                      href={req.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-300 hover:text-indigo-200"
                    >
                      <ExternalLink size={11} />
                      View screenshot
                    </a>
                  )}

                  {req.status === "rejected" && req.rejection_reason && (
                    <div className="p-2.5 rounded-lg bg-rose-500/[0.06] border border-rose-500/20 text-xs text-rose-200">
                      <strong>Rejected:</strong> {req.rejection_reason}
                    </div>
                  )}
                </div>

                {/* Right: actions */}
                {req.status === "pending" && (
                  <div className="flex sm:flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => approve(req)}
                      disabled={actionId === req.id}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/25 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      {actionId === req.id ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      Approve
                    </button>
                    <button
                      onClick={() => reject(req)}
                      disabled={actionId === req.id}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-rose-500/30 text-rose-300 text-xs font-semibold hover:bg-rose-500/10 disabled:opacity-50 transition-colors whitespace-nowrap"
                    >
                      <X size={12} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-slate-500">{label}:</span>{" "}
      <span className={`text-slate-200 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
