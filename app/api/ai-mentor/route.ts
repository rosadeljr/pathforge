import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { generateMentorReply } from "@/lib/ai/smart-mentor";
import { getEntitlements } from "@/lib/entitlements";
import { CAREER_PATHS } from "@/lib/data/career-paths";

/**
 * AI Mentor endpoint.
 *
 * Strategy:
 * - Always works, even without OPENAI_API_KEY.
 * - If OPENAI_API_KEY is set, uses GPT for free-form responses.
 * - If not (or OpenAI errors), falls back to smart pattern-matching
 *   that uses the user's actual context (career path, quests, level, streak).
 *
 * Never throws to the client. Always returns a usable reply.
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
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const message: string = (body?.message || "").toString().trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Load context — use maybeSingle so missing profile doesn't crash
    const [{ data: profile }, { data: activeQuests }, { count: completedCount }] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "current_level, total_xp, streak_count, readiness_score, selected_career_path_id, subscription_tier, user_mode, learner_grade, learner_subjects"
        )
        .eq("id", user.id)
        .maybeSingle(),
      supabase
        .from("quests")
        .select("title, difficulty, skill_tag")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("difficulty", { ascending: true })
        .limit(5),
      supabase
        .from("quests")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

    const ctx = {
      level: profile?.current_level || 1,
      totalXp: profile?.total_xp || 0,
      streak: profile?.streak_count || 0,
      readinessScore: profile?.readiness_score || 0,
      selectedCareerPathId: profile?.selected_career_path_id || null,
      activeQuests: (activeQuests || []).map((q: any) => ({
        title: q.title,
        difficulty: q.difficulty,
        skill_tag: q.skill_tag,
      })),
      completedCount: completedCount || 0,
    };

    // Learner mode → kid-safe tutor. Career mode → existing career coach.
    const isLearner = profile?.user_mode === "learner";
    const learnerGrade: number | null = profile?.learner_grade ?? null;
    const learnerSubjects: string[] = Array.isArray(profile?.learner_subjects)
      ? profile.learner_subjects
      : [];

    // Free-tier daily message cap — Pro/Elite are unlimited.
    const entitlements = getEntitlements(profile?.subscription_tier);
    if (entitlements.forgeBotDailyMessages !== -1) {
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const { count: todayCount } = await supabase
        .from("ai_messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("role", "user")
        .gte("created_at", startOfDay.toISOString());
      if ((todayCount ?? 0) >= entitlements.forgeBotDailyMessages) {
        return NextResponse.json(
          {
            error: "daily_limit",
            message: `You've used today's ${entitlements.forgeBotDailyMessages} free ForgeBot messages. Upgrade to Pro for unlimited coaching.`,
          },
          { status: 429 }
        );
      }
    }

    // Try OpenAI first if configured
    let aiReply: string | null = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        // Conversation memory — pull the last ~14 turns so ForgeBot can follow
        // up, reference what was said before, and feel like a real conversation.
        const { data: history } = await supabase
          .from("ai_messages")
          .select("role, content")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(14);
        const priorTurns = (history || [])
          .reverse()
          .map((m: any) => ({
            role:
              m.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: String(m.content).slice(0, 4000),
          }));

        // Resolve UUID → human title so the model knows what path the user is on.
        const careerPathTitle = ctx.selectedCareerPathId
          ? CAREER_PATHS.find((p) => p.id === ctx.selectedCareerPathId)?.title ||
            "not yet chosen"
          : "not yet chosen";

        const activeQuestList =
          ctx.activeQuests
            .map((q) =>
              q.difficulty ? `${q.title} (${q.difficulty})` : q.title
            )
            .join(", ") || "none";

        const learnerPrompt = `You are a friendly tutor in PathForge — a fun learning app for Filipino students in Grades 1–10. Your job is to help with school subjects: Math, English, Filipino, Science, and Araling Panlipunan.

THE STUDENT:
- Grade: ${learnerGrade ?? "not set yet"}
- Subjects they picked: ${learnerSubjects.length ? learnerSubjects.join(", ") : "none yet"}

YOUR STYLE:
- Warm, patient, encouraging — like a kind kuya or ate. Celebrate small wins. Never make a student feel bad for a wrong answer.
- Use simple words and short sentences. Match their grade level — younger kids get simpler language.
- It's OK to mix in a little Filipino if the student writes in Filipino or if it helps them feel comfortable.

HOW TO HELP:
- Homework / schoolwork: walk through it step-by-step with examples. Don't just give the answer — explain the thinking.
- "I don't understand X": break it down to smaller pieces. Use everyday examples (peso, pandesal, jeepney, sari-sari store) where they fit.
- Stuck or frustrated: be encouraging. Remind them every expert was once a beginner.

WHAT YOU WILL NOT DO:
- You will NOT discuss anything unsafe for kids — no violence, weapons, adult relationships, drugs, alcohol, scary topics, or anything else inappropriate for a child.
- If a student asks about something off-topic or unsafe, gently say: "Let's ask a trusted grown-up about that one. For now, want to try a quiz on [subject]?" Then suggest a school topic.
- You will NOT give personal information about real people, including teachers or classmates.
- You will NOT pretend to be a person, monster, or anything that isn't a friendly tutor.

Keep replies short and clear. End with a small question or a "you got this!" when it fits.`;

        const careerPrompt = `You are ForgeBot — PathForge's AI career coach AND a knowledgeable mentor on anything that helps the user grow. You can help across career strategy, learning, technical concepts, life advice, and motivation. You know this user's journey from PathForge.

THE USER:
- Level ${ctx.level} · ${ctx.totalXp.toLocaleString()} XP · ${ctx.streak}-day streak · Readiness ${ctx.readinessScore}%
- Career path: ${careerPathTitle}
- Active quests: ${activeQuestList}
- Completed quests: ${ctx.completedCount}

YOUR STYLE:
- Warm, direct, specific — like the friend who's actually been there.
- Refer to yourself as "ForgeBot" if needed. Never say "as an AI" or "I'm just an AI."
- No corporate-speak, no generic motivational fluff, no excessive hedging.

HOW TO ANSWER:
- Match length to the question. Quick questions → short replies (1–3 sentences). Deep questions (technical, learning, career decisions, life advice) → as detailed as needed. Include examples, step-by-step instructions, or code in markdown code blocks when useful.
- For technical/learning questions, explain accurately and substantively — don't dumb it down. Use the user's level and path to calibrate how much foundation they need.
- For career questions, be specific and actionable. When it fits, suggest one concrete next action.
- For "stuck" or motivation moments, be real and warm. No empty cheerleading.
- For off-topic questions, still help if you reasonably can. Gentle redirects only if it's completely unrelated.
- Reference the conversation history naturally — follow up, build on prior turns, don't repeat yourself.

You're a coach, a mentor, AND a tutor. Don't hide knowledge behind brevity.`;

        const systemPrompt = isLearner ? learnerPrompt : careerPrompt;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...priorTurns,
            { role: "user", content: message },
          ],
          temperature: isLearner ? 0.6 : 0.7,
          max_tokens: isLearner ? 500 : 900,
        });

        aiReply = completion.choices[0]?.message?.content?.trim() || null;
      } catch (openaiErr) {
        console.warn("[ai-mentor] OpenAI failed, falling back:", openaiErr);
      }
    }

    // Fallback to smart mentor if OpenAI not available or failed
    const smart = generateMentorReply(message, ctx);
    const reply = aiReply || smart.reply;
    const suggestedActions = smart.suggestedActions;

    // Save messages (non-fatal — never block the response)
    try {
      await supabase.from("ai_messages").insert([
        { user_id: user.id, role: "user", content: message },
        { user_id: user.id, role: "assistant", content: reply },
      ]);
    } catch (saveErr) {
      console.warn("[ai-mentor] Save failed (non-fatal):", saveErr);
    }

    return NextResponse.json({ reply, suggestedActions });
  } catch (error: any) {
    console.error("[ai-mentor] Unexpected error:", error);
    // Last-resort fallback — even an unexpected error returns something useful
    return NextResponse.json({
      reply:
        "I'm having trouble right now. Try refreshing, or check your Quests page for what to work on next — that's usually the right move.",
      suggestedActions: ["Refresh and try again", "Go to quests"],
    });
  }
}

export async function GET(_request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: messages, error } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    if (error) {
      console.warn("[ai-mentor] History load failed:", error);
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: messages || [] });
  } catch (error: any) {
    console.warn("[ai-mentor] History error:", error);
    return NextResponse.json({ messages: [] });
  }
}

/** Clear the signed-in user's entire ForgeBot conversation history. */
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !serviceKey) {
      return NextResponse.json(
        { error: "Clearing is unavailable right now." },
        { status: 500 }
      );
    }

    // Service-role client — ai_messages has no DELETE RLS policy by design;
    // the delete is scoped to the verified user's own rows.
    const admin = createServiceClient(url, serviceKey);
    const { error } = await admin
      .from("ai_messages")
      .delete()
      .eq("user_id", user.id);
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("[ai-mentor] Clear error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to clear conversation" },
      { status: 500 }
    );
  }
}
