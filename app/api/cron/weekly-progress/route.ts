import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  sendWeeklyProgressEmail,
  type WeeklyKidSummary,
} from "@/lib/email/resend";
import { SUBJECTS, TIER_COPY, ageTierForGrade, gradeLabel } from "@/lib/data/learner";
import { CAREERS } from "@/lib/data/careers";

/**
 * Weekly parent progress email — fires every Sunday at 10:00 UTC
 * (≈ 6pm PHT). For each parent account (is_parent_account = true)
 * we find linked kids, compute last-7-days stats, and send a single
 * digest email per parent.
 *
 * Security: Vercel Cron requests carry `Authorization: Bearer
 * ${CRON_SECRET}` automatically when CRON_SECRET is configured. We
 * enforce that check; otherwise we accept (so devs can curl locally).
 */

export const maxDuration = 60;

const DAY = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY;
const BATCH_LIMIT = 50;

interface ParentRow {
  id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
}

interface KidRow {
  id: string;
  username: string | null;
  full_name: string | null;
  learner_grade: number | null;
  learner_subjects: string[] | null;
  dream_career_id: string | null;
}

interface EventRow {
  user_id: string;
  event_type: string | null;
  xp_delta: number | null;
  event_payload: { subject?: string | null } | null;
  created_at: string;
}

export async function GET(request: Request) {
  // Vercel Cron auth
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
    return NextResponse.json(
      { error: "Supabase service key not configured" },
      { status: 500 }
    );
  }

  const supabase = createClient(url, serviceKey, {
    auth: { persistSession: false },
  });

  // 1. Find parent accounts (cap per run so a slow Resend doesn't time us out).
  const { data: parents, error: parentErr } = await supabase
    .from("profiles")
    .select("id, email, username, full_name")
    .eq("is_parent_account", true)
    .not("email", "is", null)
    .limit(BATCH_LIMIT);
  if (parentErr) {
    return NextResponse.json({ error: parentErr.message }, { status: 500 });
  }
  if (!parents || parents.length === 0) {
    return NextResponse.json({ sent: 0, note: "no parent accounts" });
  }

  const since = new Date(Date.now() - WEEK_MS).toISOString();
  let sent = 0;
  let skipped = 0;

  for (const parent of parents as ParentRow[]) {
    if (!parent.email) {
      skipped++;
      continue;
    }

    // 2. Find this parent's linked kids.
    const { data: kids } = await supabase
      .from("profiles")
      .select(
        "id, username, full_name, learner_grade, learner_subjects, dream_career_id"
      )
      .eq("parent_profile_id", parent.id);
    const kidRows = (kids || []) as KidRow[];
    if (kidRows.length === 0) {
      skipped++;
      continue;
    }

    // 3. Pull this week's analytics events for all linked kids in one query.
    const kidIds = kidRows.map((k) => k.id);
    const { data: events } = await supabase
      .from("analytics_events")
      .select("user_id, event_type, xp_delta, event_payload, created_at")
      .in("user_id", kidIds)
      .gte("created_at", since);
    const eventsList = (events || []) as EventRow[];

    // 4. Build a summary card per kid.
    const summaries: WeeklyKidSummary[] = kidRows.map((k) => {
      const myEvents = eventsList.filter((e) => e.user_id === k.id);
      const lessonEvents = myEvents.filter(
        (e) => e.event_type === "lesson_completed"
      );
      const xpWeek = myEvents.reduce(
        (sum, e) => sum + (e.xp_delta || 0),
        0
      );

      // Strongest subject = subject with most XP this week.
      const xpBySubject = new Map<string, number>();
      for (const e of lessonEvents) {
        const s = e.event_payload?.subject as string | undefined;
        if (s) xpBySubject.set(s, (xpBySubject.get(s) || 0) + (e.xp_delta || 0));
      }
      let strongest: string | undefined;
      let strongestXp = 0;
      for (const [s, xp] of xpBySubject) {
        if (xp > strongestXp) {
          strongest = s;
          strongestXp = xp;
        }
      }
      const strongestLabel = strongest
        ? SUBJECTS.find((s) => s.id === strongest)?.title
        : undefined;

      // Growth subject = picked subject with FEWEST lessons this week.
      const picked = k.learner_subjects || [];
      let growthSubject: string | undefined;
      let growthLessonCount = Infinity;
      for (const subId of picked) {
        const count = lessonEvents.filter(
          (e) => e.event_payload?.subject === subId
        ).length;
        if (count < growthLessonCount && subId !== strongest) {
          growthLessonCount = count;
          growthSubject = subId;
        }
      }
      const growthLabel = growthSubject
        ? SUBJECTS.find((s) => s.id === growthSubject)?.title
        : undefined;

      // Streak days this week = number of distinct YYYY-MM-DD on which a
      // lesson_completed event landed. Simple + honest.
      const distinctDays = new Set(
        lessonEvents.map((e) => e.created_at.slice(0, 10))
      );

      // Dream career label
      const dream = k.dream_career_id
        ? CAREERS.find((c) => c.id === k.dream_career_id)?.title
        : undefined;

      const tier = ageTierForGrade(k.learner_grade);
      const tierMeta = TIER_COPY[tier];

      return {
        name: k.username || "Your kid",
        gradeLabel: k.learner_grade ? gradeLabel(k.learner_grade) : "no grade",
        tierLabel: `${tierMeta.emoji} ${tierMeta.label}`,
        lessonsWeek: lessonEvents.length,
        xpWeek,
        streakDays: distinctDays.size,
        strongestSubject: strongestLabel,
        growthSubject:
          growthLabel && growthLabel !== strongestLabel
            ? growthLabel
            : undefined,
        dreamCareer: dream,
      };
    });

    const parentName = parent.username || parent.full_name || "Parent";
    const ok = await sendWeeklyProgressEmail(
      parent.email,
      parentName,
      summaries
    );
    if (ok) sent++;
    else skipped++;
  }

  return NextResponse.json({ sent, skipped, total: parents.length });
}
