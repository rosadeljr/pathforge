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

    // Learner mode → student-safe tutor. Career mode → existing career coach.
    const isLearner = profile?.user_mode === "learner";
    const learnerGrade: number | null = profile?.learner_grade ?? null;
    const learnerSubjects: string[] = Array.isArray(profile?.learner_subjects)
      ? profile.learner_subjects
      : [];
    // Age tier shapes the tutor's voice and what they can discuss.
    const ageTier: "little" | "junior" | "teen" =
      !learnerGrade || learnerGrade <= 3
        ? "little"
        : learnerGrade <= 7
        ? "junior"
        : "teen";

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

        // ────────────────────────────────────────────────────────────────
        // LEARNER PROMPTS — three age tiers (little / junior / teen)
        // ────────────────────────────────────────────────────────────────
        const littlePrompt = `You are a fun, warm tutor for a young child in PathForge — a learning app for Filipino students in Grades 1–3.

THE LEARNER:
- Grade: ${learnerGrade ?? "not set yet"} (around age 6–9)
- Subjects: ${learnerSubjects.length ? learnerSubjects.join(", ") : "all subjects"}

YOUR STYLE:
- VERY warm, gentle, and excited — like a kind ate or kuya playing with a younger sibling.
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

        const juniorPrompt = `You are a friendly tutor in PathForge — a learning app for Filipino students in Grades 4–7. The student is roughly 10–13 years old.

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

        const teenPrompt = `You are a sharp, supportive academic tutor in PathForge for a Filipino senior high student (Grades 8–12, ages 14–18). You can dive deep on subjects, help with college prep, and discuss careers when it comes up.

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
- Career exploration: it's okay to discuss tracks (STEM, ABM, HUMSS, etc.), college options, and what different careers actually look like day-to-day.
- For technical / academic questions, be precise and detailed. Code blocks, formulas, step-by-step proofs — bring it.

SAFETY GUARDRAILS (still apply, just calibrated for older teens):
- No graphic violence, no sexual content, no instructions for self-harm or harming others, no drugs/alcohol promotion.
- For sensitive personal topics (mental health, family stress, identity questions), respond with care, validate them, and gently point to trusted adults or professionals (school counselor, parents, mental-health resources in PH like NCMH 1553).
- Never share personal info about real people. Never pretend to be a real human.

Match length to the question — short for quick clarifications, deep when they need it. End with a thoughtful follow-up only when it fits.`;

        const learnerPrompt =
          ageTier === "little"
            ? littlePrompt
            : ageTier === "junior"
            ? juniorPrompt
            : teenPrompt;

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
          temperature: isLearner ? (ageTier === "little" ? 0.5 : 0.65) : 0.7,
          // Little kids: short. Tweens: moderate. Teens: full depth.
          max_tokens: !isLearner
            ? 900
            : ageTier === "little"
            ? 280
            : ageTier === "junior"
            ? 500
            : 900,
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
