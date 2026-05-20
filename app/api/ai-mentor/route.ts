import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateMentorReply } from "@/lib/ai/smart-mentor";

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
        .select("current_level, total_xp, streak_count, readiness_score, selected_career_path_id")
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

    // Try OpenAI first if configured
    let aiReply: string | null = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const systemPrompt = `You are PathForge's mentor — a no-fluff career coach for ambitious Filipinos and Gen Z. Be direct, specific, and warm.

User context:
- Level ${ctx.level}, ${ctx.totalXp} total XP
- ${ctx.streak}-day streak (longest goal-setting signal)
- Readiness: ${ctx.readinessScore}%
- Career path: ${ctx.selectedCareerPathId || "not yet chosen"}
- Active quests: ${ctx.activeQuests.map((q) => q.title).join(", ") || "none"}
- Completed quests: ${ctx.completedCount}

Rules:
- 2-4 sentences max. Plain language. No corporate-speak.
- Reference their actual context (level, quests, streak)
- Give ONE specific next action they can do today
- Tone: warm but direct. Like a friend who's been there.`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.7,
          max_tokens: 250,
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
