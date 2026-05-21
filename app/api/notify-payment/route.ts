import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  sendAdminPaymentAlert,
  sendPaymentApprovedEmail,
  sendPaymentRejectedEmail,
} from "@/lib/email/resend";

/**
 * Sends payment-related emails via Resend.
 *
 * POST body:
 *   { type: "submitted", paymentRequestId }              — emails the admin
 *   { type: "approved",  paymentRequestId }              — emails the user
 *   { type: "rejected",  paymentRequestId, reason? }     — emails the user
 *
 * Never throws to the client — email is best-effort. Returns { sent: boolean }.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }

    const { type, paymentRequestId, reason } = body || {};
    if (!type || !paymentRequestId) {
      return NextResponse.json({ error: "Missing type or paymentRequestId" }, { status: 400 });
    }

    // Fetch the payment request (RLS: user sees own, admin sees all)
    const { data: pr, error: prError } = await supabase
      .from("payment_requests")
      .select("*")
      .eq("id", paymentRequestId)
      .maybeSingle();

    if (prError || !pr) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 });
    }

    // ---- SUBMITTED: notify admin ----
    if (type === "submitted") {
      // The submitting user must own this request
      if (pr.user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("username, full_name, email")
        .eq("id", user.id)
        .maybeSingle();

      const sent = await sendAdminPaymentAlert({
        userName: profile?.full_name || profile?.username || "A user",
        userEmail: profile?.email || user.email || "unknown",
        tier: pr.tier,
        amount: pr.amount_php,
        method: pr.payment_method,
        referenceNumber: pr.reference_number || "—",
        senderName: pr.sender_name || undefined,
        senderNumber: pr.sender_number || undefined,
        proofUrl: pr.proof_url || undefined,
        notes: pr.notes || undefined,
      });
      return NextResponse.json({ sent });
    }

    // ---- APPROVED / REJECTED: notify the user (admin-only) ----
    if (type === "approved" || type === "rejected") {
      // Caller must be an admin
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      if (!adminProfile?.is_admin) {
        return NextResponse.json({ error: "Forbidden — admin only" }, { status: 403 });
      }

      // Look up the target user's email + name
      const { data: targetProfile } = await supabase
        .from("profiles")
        .select("username, full_name, email")
        .eq("id", pr.user_id)
        .maybeSingle();

      const targetEmail = targetProfile?.email;
      if (!targetEmail) {
        return NextResponse.json({ sent: false, error: "User has no email on file" });
      }
      const targetName = targetProfile?.full_name || targetProfile?.username || "there";

      const sent =
        type === "approved"
          ? await sendPaymentApprovedEmail(targetEmail, targetName, pr.tier)
          : await sendPaymentRejectedEmail(targetEmail, targetName, reason || "");

      return NextResponse.json({ sent });
    }

    return NextResponse.json({ error: "Unknown notification type" }, { status: 400 });
  } catch (error: any) {
    console.error("[notify-payment] error:", error);
    // Email is best-effort — never block the user flow
    return NextResponse.json({ sent: false });
  }
}
