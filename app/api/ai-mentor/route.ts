import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user context for better responses
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    const { data: quests } = await supabase
      .from("quests")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active");

    // Save user message
    await supabase.from("ai_messages").insert({
      user_id: user.id,
      role: "user",
      content: message,
    });

    // Build context-aware prompt
    const systemPrompt = `You are PathForge's AI Mentor - a supportive career coach helping users on their journey to becoming ${profile?.selected_career_path_id ? "a professional" : "career-ready"}. 

User Context:
- Level: ${profile?.current_level || 1}
- XP: ${profile?.total_xp || 0}
- Streak: ${profile?.streak_count || 0} days
- Readiness Score: ${profile?.readiness_score || 0}%
- Active Quests: ${quests?.length || 0}

Your role:
1. Provide personalized career advice based on their progress
2. Motivate and encourage consistency
3. Suggest next best actions for skill building
4. Help with career strategy and planning
5. Be supportive but direct - focus on real-world value

Keep responses concise (2-3 sentences) and actionable. Focus on what they should do next.`;

    // Call OpenAI API
    let aiResponse = "";
    
    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
        max_tokens: 200,
      });

      aiResponse =
        completion.choices[0]?.message?.content ||
        "I'm here to help! What would you like to work on?";
    } else {
      // Fallback if no API key
      const responses = [
        `Great question! Based on your current level (${profile?.current_level}), I'd focus on completing more quests to build momentum.`,
        `Your ${profile?.streak_count}-day streak shows great consistency! Keep it up and you'll reach your goal faster.`,
        `To improve your readiness score to ${Math.min(profile?.readiness_score + 10, 100)}%, focus on shipping portfolio projects.`,
        `You're making solid progress! The next milestone is reaching level ${(profile?.current_level || 1) + 5}.`,
        `Your commitment is impressive. Let's keep building real skills with tangible portfolio proof.`,
      ];
      aiResponse = responses[Math.floor(Math.random() * responses.length)];
    }

    // Save AI response
    const { error: saveError } = await supabase.from("ai_messages").insert({
      user_id: user.id,
      role: "assistant",
      content: aiResponse,
    });

    if (saveError) throw saveError;

    return NextResponse.json({
      reply: aiResponse,
      suggestedActions: [
        "Complete a quest",
        "Add portfolio project",
        "Check skill progress",
      ],
    });
  } catch (error: any) {
    console.error("AI Mentor error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: messages } = await supabase
      .from("ai_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
      .limit(50);

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
