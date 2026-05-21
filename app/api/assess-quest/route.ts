import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import {
  assessQuestSubmission,
  type QuestAssessmentInput,
  type QuestAssessment,
} from "@/lib/ai/quest-assessment";

/**
 * ForgeBot reviews a completed quest submission and returns feedback.
 *
 * - Always works offline via pattern matching (quest-assessment.ts).
 * - Upgrades to OpenAI GPT-4o-mini when OPENAI_API_KEY is set.
 * - Never throws to the client — always returns a usable assessment.
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

    const input: QuestAssessmentInput = {
      title: (body?.title || "").toString(),
      difficulty: (body?.difficulty || "medium").toString(),
      skillTag: body?.skillTag ?? null,
      careerImpact: body?.careerImpact ?? null,
      proofType: body?.proofType ?? null,
      proofUrl: body?.proofUrl ?? null,
      proofNotes: body?.proofNotes ?? null,
    };

    // Offline-smart assessment is always our baseline
    const smart = assessQuestSubmission(input);

    // Upgrade with OpenAI when available
    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const systemPrompt = `You are ForgeBot — PathForge's career coach reviewing a user's completed quest.
Be direct, warm, specific. Refer to yourself as "ForgeBot" if needed. Never say "as an AI".

Return ONLY a JSON object with exactly these keys:
- "verdict": a short headline (max 5 words)
- "feedback": 2-3 sentences of specific feedback on their submission
- "nextStep": one concrete action they should take next
- "strength": one of "excellent", "good", "needs-work"

Be encouraging but honest. Reference the actual proof they submitted.`;

        const userPrompt = `Quest: "${input.title}"
Difficulty: ${input.difficulty}
Skill: ${input.skillTag || "general"}
Career impact: ${input.careerImpact || "n/a"}
Proof URL submitted: ${input.proofUrl || "(none)"}
User's notes: ${input.proofNotes || "(none)"}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.6,
          max_tokens: 300,
          response_format: { type: "json_object" },
        });

        const raw = completion.choices[0]?.message?.content;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<QuestAssessment>;
          if (parsed.verdict && parsed.feedback && parsed.nextStep) {
            return NextResponse.json({
              verdict: parsed.verdict,
              feedback: parsed.feedback,
              nextStep: parsed.nextStep,
              strength: parsed.strength || smart.strength,
            });
          }
        }
      } catch (openaiErr) {
        console.warn("[assess-quest] OpenAI failed, using smart fallback:", openaiErr);
      }
    }

    return NextResponse.json(smart);
  } catch (error: any) {
    console.error("[assess-quest] error:", error);
    // Last-resort generic but still positive assessment
    return NextResponse.json({
      verdict: "Quest cleared.",
      feedback:
        "Nice work finishing this. ForgeBot couldn't run a full review right now, but every quest completed is real progress.",
      nextStep: "Keep your momentum — pick your next quest.",
      strength: "good",
    });
  }
}
