import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * ForgeBot resume assist — polishes the summary or turns rough notes into
 * strong bullet points. Uses OpenAI when configured, falls back to a
 * template otherwise. Never throws to the client.
 */

type AssistType = "summary" | "bullets";

interface AssistContext {
  headline: string;
  skills: string;
  draft: string;
  role: string;
}

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

    const type: AssistType = body?.type === "bullets" ? "bullets" : "summary";
    const ctx: AssistContext = {
      headline: (body?.headline || "").toString().slice(0, 160),
      skills: (body?.skills || "").toString().slice(0, 400),
      draft: (body?.draft || "").toString().slice(0, 1500),
      role: (body?.role || "").toString().slice(0, 200),
    };

    if (process.env.OPENAI_API_KEY) {
      try {
        const { OpenAI } = await import("openai");
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

        const system =
          type === "summary"
            ? `You are a professional resume writer. Write a sharp 2-3 sentence professional summary. No first-person pronouns. Confident, specific, results-oriented, recruiter-friendly. Return ONLY the summary text — no preamble, no quotes.`
            : `You are a professional resume writer. Rewrite the user's notes into 3-5 strong resume bullet points. Each bullet: starts with a strong past-tense action verb, one line, quantified where plausible. Return ONLY the bullets, one per line, each starting with "• ". No preamble.`;

        const userMsg =
          type === "summary"
            ? `Target role / headline: ${ctx.headline || "(not given)"}\nKey skills: ${ctx.skills || "(not given)"}\nCurrent draft or notes: ${ctx.draft || "(none)"}`
            : `Role: ${ctx.role || "(not given)"}\nNotes to turn into bullet points:\n${ctx.draft || "(none)"}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: system },
            { role: "user", content: userMsg },
          ],
          temperature: 0.6,
          max_tokens: 320,
        });
        const text = completion.choices[0]?.message?.content?.trim();
        if (text) return NextResponse.json({ result: text });
      } catch (e) {
        console.warn("[resume-assist] OpenAI failed, using fallback:", e);
      }
    }

    return NextResponse.json({ result: fallback(type, ctx) });
  } catch (error: any) {
    console.error("[resume-assist] error:", error);
    return NextResponse.json(
      { error: "Couldn't generate that right now. Try again." },
      { status: 500 }
    );
  }
}

function fallback(type: AssistType, ctx: AssistContext): string {
  if (type === "summary") {
    const skillList = ctx.skills
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 4);
    const skillPhrase = skillList.length
      ? ` with hands-on experience in ${skillList.join(", ")}`
      : "";
    return `${ctx.headline || "Motivated professional"}${skillPhrase}. Built real, project-based proof of skill through a structured PathForge career program. Focused on shipping results and growing fast in a remote-first team.`;
  }
  const lines = ctx.draft
    .split(/[\n.]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 5);
  if (lines.length === 0) {
    return "• Add a few notes about what you did in this role, then polish again.";
  }
  return lines
    .map((l) => `• ${l.charAt(0).toUpperCase()}${l.slice(1)}`)
    .join("\n");
}
