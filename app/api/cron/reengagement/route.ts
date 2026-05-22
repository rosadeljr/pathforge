import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendReengagementEmail } from "@/lib/email/resend";

/**
 * Daily re-engagement cron — "ForgeBot misses you".
 *
 * Triggered by Vercel Cron (see vercel.json). Finds users who were active
 * but have gone quiet for 3-30 days and emails them a nudge. Each user is
 * nudged at most once per week.
 *
 * Security: if CRON_SECRET is set, the request must carry a matching
 * Authorization header (Vercel Cron sends it automatically).
 */

export const maxDuration = 60;

const DAY = 24 * 60 * 60 * 1000;
const INACTIVE_MIN_DAYS = 3; // gone at least this long
const INACTIVE_MAX_DAYS = 30; // past this they're treated as churned
const RENUDGE_COOLDOWN_DAYS = 7; // at most one nudge per week
const BATCH_LIMIT = 40; // emails per run — keeps within the function timeout

export async function GET(request: Request) {
  // Verify the Vercel Cron secret when configured.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }
  const supabase = createClient(url, serviceKey);

  const now = Date.now();
  const inactiveBefore = new Date(now - INACTIVE_MIN_DAYS * DAY).toISOString();
  const inactiveAfter = new Date(now - INACTIVE_MAX_DAYS * DAY).toISOString();
  const cooldownAfter = new Date(now - RENUDGE_COOLDOWN_DAYS * DAY).toISOString();

  // Lapsed users — were active, then went quiet within the nudge window.
  const { data: candidates, error: candErr } = await supabase
    .from("profiles")
    .select("id, email, username, full_name, last_quest_completed_at")
    .not("email", "is", null)
    .lt("last_quest_completed_at", inactiveBefore)
    .gt("last_quest_completed_at", inactiveAfter)
    .limit(200);

  if (candErr) {
    return NextResponse.json({ error: candErr.message }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ sent: 0, message: "No lapsed users today." });
  }

  // Exclude anyone already nudged inside the cooldown window.
  const { data: recent } = await supabase
    .from("analytics_events")
    .select("user_id")
    .eq("event_type", "reengagement_email_sent")
    .gt("created_at", cooldownAfter);
  const recentlyNudged = new Set((recent || []).map((r: any) => r.user_id));

  const toNudge = candidates
    .filter((c: any) => c.email && !recentlyNudged.has(c.id))
    .slice(0, BATCH_LIMIT);

  let sent = 0;
  for (const user of toNudge) {
    const daysAway = Math.max(
      INACTIVE_MIN_DAYS,
      Math.floor((now - new Date(user.last_quest_completed_at).getTime()) / DAY)
    );
    const name = user.full_name || user.username || "there";
    const ok = await sendReengagementEmail(user.email, name, daysAway);
    if (ok) {
      sent++;
      await supabase.from("analytics_events").insert({
        user_id: user.id,
        event_type: "reengagement_email_sent",
        event_payload: { days_away: daysAway },
      });
    }
  }

  return NextResponse.json({ sent, eligible: toNudge.length });
}
