import { NextRequest, NextResponse } from "next/server";

/**
 * Return handler — where PayMongo's GCash/Maya checkout sends the user
 * after they complete (or cancel) the payment in their wallet app.
 *
 * The webhook is what *actually* upgrades the user (source.chargeable →
 * payment.paid). This return URL just bounces them back to /pricing with
 * a friendly status flag so the UI can show a "processing" / "we'll
 * confirm shortly" message. Webhook delivery is usually a few seconds.
 */

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const target = new URL("/pricing", request.url);
  if (status === "success") {
    // We can't trust this status — only the webhook is authoritative.
    // Show a "processing" UI state and let the user refresh.
    target.searchParams.set("upgrade", "processing");
  } else if (status === "failed") {
    target.searchParams.set("upgrade", "failed");
  } else {
    target.searchParams.set("upgrade", "cancelled");
  }
  return NextResponse.redirect(target);
}
