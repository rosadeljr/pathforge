import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * ForgeBot Mock Interview — generates 5 tailored interview questions for a
 * role / pasted JD, then grades the user's answers with specific feedback.
 * Uses OpenAI when available, falls back to deterministic templates.
 */

interface QuestionGrade {
  question: string;
  feedback: string;
  strength: "excellent" | "good" | "needs-work";
}

interface GradeResult {
  overall: number;
  feedback: QuestionGrade[];
}

const ALLOWED_STRENGTHS = ["excellent", "good", "needs-work"] as const;

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

    const action = body?.action;
    const role = (body?.role || "").toString().slice(0, 200);
    const jd = (body?.jd || "").toString().slice(0, 4000);
    const questions: string[] = Array.isArray(body?.questions)
      ? body.questions.slice(0, 10).map((q: any) => String(q).slice(0, 400))
      : [];
    const answers: string[] = Array.isArray(body?.answers)
      ? body.answers.slice(0, 10).map((a: any) => String(a).slice(0, 2000))
      : [];

    if (action === "start") {
      const qs = await generateQuestions({ role, jd });
      return NextResponse.json({ questions: qs });
    }

    if (action === "grade") {
      if (questions.length === 0) {
        return NextResponse.json({ error: "No questions to grade" }, { status: 400 });
      }
      const result = await gradeAnswers({ role, jd, questions, answers });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[mock-interview] error:", e);
    return NextResponse.json(
      { error: "Couldn't run that right now. Try again." },
      { status: 500 }
    );
  }
}

async function generateQuestions(opts: { role: string; jd: string }): Promise<string[]> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const target = opts.jd
        ? `Job description:\n${opts.jd}`
        : `Target role: ${opts.role || "a generalist professional role"}`;
      const system = `You are a senior hiring manager. Generate exactly 5 realistic interview questions for the target below. Mix: 2 behavioral, 2 role-specific (tailored to the role/JD), 1 forward-looking/closing. Each question must be one sentence, no numbering, no preamble. Return ONLY a JSON object: { "questions": [string, string, string, string, string] }.`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: target },
        ],
        temperature: 0.7,
        max_tokens: 400,
        response_format: { type: "json_object" },
      });
      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        const arr = Array.isArray(parsed)
          ? parsed
          : Array.isArray(parsed?.questions)
          ? parsed.questions
          : null;
        if (arr && arr.length >= 3) {
          return arr.slice(0, 5).map((q: any) => String(q));
        }
      }
    } catch (e) {
      console.warn("[mock-interview] OpenAI start failed:", e);
    }
  }
  return fallbackQuestions(opts.role || "this role");
}

function fallbackQuestions(role: string): string[] {
  return [
    `Tell me about yourself and why you're interested in ${role}.`,
    `Walk me through a recent project you're proud of — what was your role, and what made it work?`,
    `Describe a time you faced a hard problem at work or while learning. How did you approach it?`,
    `What's a skill you've been deliberately leveling up recently, and how have you applied it?`,
    `Where do you see yourself in 1–2 years, and what kind of team helps you do your best work?`,
  ];
}

async function gradeAnswers(opts: {
  role: string;
  jd: string;
  questions: string[];
  answers: string[];
}): Promise<GradeResult> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const { OpenAI } = await import("openai");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const target = opts.jd
        ? `Job description:\n${opts.jd}`
        : `Target role: ${opts.role || "a generalist professional role"}`;
      const qa = opts.questions
        .map((q, i) => `Q${i + 1}: ${q}\nA${i + 1}: ${opts.answers[i] || "(no answer given)"}`)
        .join("\n\n");
      const system = `You are a senior hiring manager grading a mock interview. For each answer, write 1–2 sentences of direct, useful feedback (specific, no generic fluff, point to the STAR pattern where useful) and pick a strength label: "excellent", "good", or "needs-work". Produce one overall 0–100 score reflecting how the candidate did as a whole.

Return ONLY a JSON object:
{ "overall": <0-100 integer>, "feedback": [{ "question": "<question>", "feedback": "<your feedback>", "strength": "excellent"|"good"|"needs-work" }, ...] }
One entry per question, in order.`;
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: system },
          { role: "user", content: `${target}\n\n${qa}` },
        ],
        temperature: 0.5,
        max_tokens: 900,
        response_format: { type: "json_object" },
      });
      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.overall === "number" && Array.isArray(parsed.feedback)) {
          const feedback = parsed.feedback
            .slice(0, opts.questions.length)
            .map((f: any, i: number): QuestionGrade => ({
              question: opts.questions[i],
              feedback: String(f?.feedback || "Solid answer."),
              strength: (ALLOWED_STRENGTHS as readonly string[]).includes(f?.strength)
                ? (f.strength as QuestionGrade["strength"])
                : "good",
            }));
          return {
            overall: Math.max(0, Math.min(100, Math.round(parsed.overall))),
            feedback,
          };
        }
      }
    } catch (e) {
      console.warn("[mock-interview] OpenAI grade failed:", e);
    }
  }
  return fallbackGrade(opts.questions, opts.answers);
}

function fallbackGrade(questions: string[], answers: string[]): GradeResult {
  const feedback: QuestionGrade[] = questions.map((q, i) => {
    const a = (answers[i] || "").trim();
    const len = a.length;
    const strength: QuestionGrade["strength"] =
      len >= 250 ? "excellent" : len >= 100 ? "good" : "needs-work";
    const fb =
      len < 50
        ? "Add more concrete detail — specifics are what recruiters remember. Use the STAR pattern (Situation, Task, Action, Result)."
        : len < 150
        ? "Decent, but tighten the structure: lead with the situation, then your specific action, then the result. Quantify where you can."
        : "Strong, specific answer. Try to end with a measurable result — recruiters remember numbers.";
    return { question: q, feedback: fb, strength };
  });
  const strong = feedback.filter((f) => f.strength !== "needs-work").length;
  const overall = Math.min(100, Math.round((strong / Math.max(1, questions.length)) * 100));
  return { overall, feedback };
}
