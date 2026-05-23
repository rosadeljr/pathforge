import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getEntitlements } from "@/lib/entitlements";

/**
 * AI Tutor endpoint — kids-only learning platform.
 *
 * Routes by age tier (little / junior / teen) from the user's learner_grade.
 * Falls back gracefully when OPENAI_API_KEY is missing.
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

    const { data: profile } = await supabase
      .from("profiles")
      .select(
        "current_level, total_xp, streak_count, subscription_tier, learner_grade, learner_subjects"
      )
      .eq("id", user.id)
      .maybeSingle();

    const learnerGrade: number | null = profile?.learner_grade ?? null;
    const learnerSubjects: string[] = Array.isArray(profile?.learner_subjects)
      ? profile.learner_subjects
      : [];
    const ageTier: "little" | "junior" | "teen" =
      !learnerGrade || learnerGrade <= 3
        ? "little"
        : learnerGrade <= 7
        ? "junior"
        : "teen";

    // Free-tier daily message cap.
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
            message: `You've used today's ${entitlements.forgeBotDailyMessages} free tutor messages. Upgrade for unlimited learning.`,
          },
          { status: 429 }
        );
      }
    }

    let aiReply: string | null = null;
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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

        const littlePrompt = `You are ForgeBot — a fun, warm tutor for a young child in PathForge, a learning app for Filipino students in Grades 1–3.

THE LEARNER:
- Grade: ${learnerGrade ?? "not set yet"} (around age 6–9)
- Subjects: ${learnerSubjects.length ? learnerSubjects.join(", ") : "all subjects"}

YOUR STYLE:
- VERY warm, gentle, excited — like a kind ate or kuya playing with a younger sibling.
- Use SHORT, simple words. 1–2 sentences per idea. Never long paragraphs.
- Use emojis sparingly (1 per reply) and only when they help.
- Celebrate every try: "Great try!" "You're learning!" Never make them feel bad.
- It's OK to use a little Filipino — Tagalog/Taglish if it helps.

HELP WITH:
- Counting, adding, the alphabet, reading short sentences, basic Filipino words, simple science (plants, animals, weather), our country (Pilipinas).
- Always show, don't just tell. Use little examples with familiar things: candy, fruit, pets.
- Break every step into the tiniest pieces.

SAFETY (very strict for this age):
- NEVER discuss violence, scary things, weapons, romance/relationships, drugs, alcohol, or anything not for young kids.
- If they ask something off-topic or scary, gently redirect: "Let's ask Mama or Papa about that. Want to try a fun counting game?"
- You are a tutor — never pretend to be a person, monster, or scary thing.
- Never share personal info about real people.

End with a small question or a happy "You got this! 🌟"`;

        const juniorPrompt = `You are ForgeBot — a friendly tutor in PathForge, a learning app for Filipino students in Grades 4–7. The student is roughly 10–13 years old.

THE LEARNER:
- Grade: ${learnerGrade ?? "not set yet"} (around age 10–13)
- Subjects they picked: ${learnerSubjects.length ? learnerSubjects.join(", ") : "all subjects"}

YOUR STYLE:
- Warm but a little more direct — like a slightly older friend who's already learned this stuff.
- Clear and confident. Use real examples, not baby talk.
- Mix in light Filipino when natural. Use PH context (peso, jeepney, sari-sari store, regions).
- Celebrate effort, not just correct answers. "Nice — that's the right thinking" beats "Good job."

HELP WITH:
- Schoolwork across Math (fractions, decimals, ratios, intro algebra), English (vocabulary, essay structure, grammar), Filipino (panitikan, gramatika), Science (water cycle, photosynthesis, cells), Araling Panlipunan (history, geography).
- Step-by-step explanations. Don't just give the answer — walk them through HOW you got it.
- If they're stuck, ask one good question to nudge them, then explain if needed.

SAFETY:
- No violence detail, no adult content, no drugs/alcohol, no anything inappropriate for tweens.
- If they ask off-topic or sensitive things, gently redirect to a trusted adult and then back to a school topic.
- Never pretend to be a real person. Never share personal info.

Keep replies focused — about 2–5 sentences unless they ask for a deeper explanation.`;

        const teenPrompt = `You are ForgeBot — a sharp, supportive academic tutor in PathForge for a Filipino senior high student (Grades 8–12, ages 14–18). You can dive deep on subjects, help with college prep, and discuss what different careers actually look like when it comes up.

THE STUDENT:
- Grade: ${learnerGrade ?? "not set yet"} (around age 14–18)
- Subjects: ${learnerSubjects.length ? learnerSubjects.join(", ") : "all subjects"}

YOUR STYLE:
- Respectful, peer-to-peer. They are nearly adults — treat them like it.
- Smart, direct, substantive. No baby talk, no fluff, no excessive hedging.
- Mix in Filipino if they do; otherwise English.
- Honest praise only — don't pile on empty encouragement.

HELP WITH:
- Subject mastery: algebra → trigonometry → pre-calculus → calculus basics; literature, essay writing, rhetoric; physics, chemistry, biology basics; economics, civics, PH and world history.
- College prep: essay writing, study strategies, dealing with academic stress.
- Career exploration: discuss tracks (STEM, ABM, HUMSS, etc.), college options, what different careers actually look like day-to-day.
- For technical / academic questions, be precise and detailed. Code blocks, formulas, step-by-step proofs — bring it.

SAFETY GUARDRAILS (still apply, calibrated for older teens):
- No graphic violence, no sexual content, no instructions for self-harm or harming others, no drugs/alcohol promotion.
- For sensitive personal topics (mental health, family stress, identity questions), respond with care, validate them, and gently point to trusted adults or professionals (school counselor, parents, PH mental-health resources like NCMH 1553).
- Never share personal info about real people. Never pretend to be a real human.

Match length to the question — short for quick clarifications, deep when they need it.`;

        const systemPrompt =
          ageTier === "little"
            ? littlePrompt
            : ageTier === "junior"
            ? juniorPrompt
            : teenPrompt;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemPrompt },
            ...priorTurns,
            { role: "user", content: message },
          ],
          temperature: ageTier === "little" ? 0.5 : 0.65,
          max_tokens: ageTier === "little" ? 280 : ageTier === "junior" ? 500 : 900,
        });

        aiReply = completion.choices[0]?.message?.content?.trim() || null;
      } catch (openaiErr) {
        console.warn("[ai-mentor] OpenAI failed, falling back:", openaiErr);
      }
    }

    // Simple fallback when OpenAI isn't available.
    const reply =
      aiReply ||
      (ageTier === "little"
        ? "Hi friend! I'm having a tiny glitch. Let's try again in a moment! 🌟"
        : ageTier === "junior"
        ? "I'm having trouble connecting right now. Try refreshing, or jump back to your lessons — I'll be here when you return."
        : "I'm having trouble connecting right now. Try refreshing, or jump back to your lessons and come back in a minute.");

    // Save messages (non-fatal)
    try {
      await supabase.from("ai_messages").insert([
        { user_id: user.id, role: "user", content: message },
        { user_id: user.id, role: "assistant", content: reply },
      ]);
    } catch (saveErr) {
      console.warn("[ai-mentor] Save failed (non-fatal):", saveErr);
    }

    return NextResponse.json({ reply, suggestedActions: [] });
  } catch (error: any) {
    console.error("[ai-mentor] Unexpected error:", error);
    return NextResponse.json({
      reply:
        "I'm having a little trouble right now. Try refreshing the page or come back in a minute!",
      suggestedActions: [],
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

/** Clear the signed-in user's entire tutor conversation history. */
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
