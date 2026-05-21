/**
 * ForgeBot — Quest Submission Assessment
 *
 * When a user completes a quest and submits proof, ForgeBot reviews it and gives
 * specific, useful feedback. Works fully offline via pattern matching;
 * the API route upgrades to OpenAI when a key is configured.
 */

export interface QuestAssessmentInput {
  title: string;
  difficulty: string;
  skillTag: string | null;
  careerImpact: string | null;
  proofType: string | null;
  proofUrl?: string | null;
  proofNotes?: string | null;
}

export interface QuestAssessment {
  verdict: string; // short headline
  feedback: string; // 2-4 sentences, specific
  nextStep: string; // one actionable suggestion
  strength: "excellent" | "good" | "needs-work";
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

type ProofKind = "github" | "deployed" | "screenshot" | "writeup" | "none";

function classifyProof(input: QuestAssessmentInput): ProofKind {
  const url = (input.proofUrl || "").toLowerCase();
  if (url.includes("github.com") || url.includes("gitlab.com")) return "github";
  if (/^https?:\/\//.test(url)) {
    if (url.includes("imgur") || url.includes("drive.google") || url.includes("ibb.co")) {
      return "screenshot";
    }
    return "deployed";
  }
  if ((input.proofNotes || "").trim().length > 40) return "writeup";
  return "none";
}

/**
 * Generates a context-aware assessment of a quest submission.
 * Pure function — no side effects, SSR-safe.
 */
export function assessQuestSubmission(input: QuestAssessmentInput): QuestAssessment {
  const proofKind = classifyProof(input);
  const notes = (input.proofNotes || "").trim();
  const notesLength = notes.length;
  const isBoss = input.difficulty === "insane";
  const isHard = input.difficulty === "hard";
  const skill = input.skillTag || "this skill";

  // ---- Strength scoring ----
  let score = 0;
  if (proofKind === "github" || proofKind === "deployed") score += 2;
  if (proofKind === "screenshot" || proofKind === "writeup") score += 1;
  if (notesLength > 150) score += 2;
  else if (notesLength > 50) score += 1;
  if (isBoss) score += 1;
  if (isHard) score += 0.5;

  const strength: QuestAssessment["strength"] =
    score >= 3.5 ? "excellent" : score >= 1.5 ? "good" : "needs-work";

  // ---- Verdict ----
  const verdict =
    strength === "excellent"
      ? pick(["Outstanding work.", "This is the standard.", "Genuinely impressive."])
      : strength === "good"
      ? pick(["Solid work.", "Good progress.", "You did the thing."])
      : pick(["Quest cleared.", "Logged it — let's go deeper next time.", "First rep done."]);

  // ---- Feedback body (specific to proof kind) ----
  let feedback = "";
  switch (proofKind) {
    case "github":
      feedback = pick([
        `Shipping code to a public repo is exactly what recruiters check. Your ${skill} work now has a permanent, linkable home.`,
        `Code on GitHub > code on your laptop. This is real proof of ${skill} — it counts toward your portfolio.`,
      ]);
      break;
    case "deployed":
      feedback = pick([
        `A live, deployed link is the strongest kind of proof — anyone can click it and see your ${skill} work in action.`,
        `You didn't just build it, you shipped it. A working URL beats ten screenshots. This is portfolio-grade.`,
      ]);
      break;
    case "screenshot":
      feedback = pick([
        `Visual proof works. Next level: deploy it live or push to GitHub so it's clickable, not just a picture.`,
        `Screenshot logged. For ${skill}, a live link or repo would make this even stronger for recruiters.`,
      ]);
      break;
    case "writeup":
      feedback = pick([
        `Your reflection shows you actually processed this — that's how ${skill} sticks. Writing about what you learned doubles the retention.`,
        `Good — you didn't just do it, you thought about it. That reflection habit compounds across every quest.`,
      ]);
      break;
    case "none":
    default:
      feedback = pick([
        `Quest marked done — but next time, drop a link or a few notes. Proof is what turns "I did a tutorial" into "here's my work."`,
        `You cleared it. To get the most out of PathForge, add proof next time: a link, a repo, or a short reflection on what clicked.`,
      ]);
      break;
  }

  // Add a reflection nudge if notes were thin
  if (notesLength > 0 && notesLength <= 50 && proofKind !== "writeup") {
    feedback += " Your notes were brief — a sentence or two more on what was hard would help future-you.";
  }

  // Boss-quest acknowledgment
  if (isBoss) {
    feedback += pick([
      " And this was a Boss quest — clearing it is a genuine milestone. Not many get here.",
      " A Boss quest, no less. That's the kind of thing you mention in interviews.",
    ]);
  }

  // ---- Next step ----
  const nextStep =
    strength === "excellent"
      ? pick([
          input.careerImpact
            ? `Add this to your Portfolio so it's part of your shareable profile. ${input.careerImpact}`
            : "Add this to your Portfolio — it's exactly the kind of proof that gets you hired.",
          "Share this win on LinkedIn. Public proof of work attracts opportunities.",
        ])
      : strength === "good"
      ? pick([
          `Keep the momentum — pick your next ${skill} quest while it's fresh.`,
          "Solid rep. Stack another quest today to build your streak.",
        ])
      : pick([
          "Next quest: try adding real proof — a GitHub repo or a deployed link. That's what makes the work count.",
          "Tip: spend 2 minutes writing what you learned after each quest. It's the highest-ROI habit on PathForge.",
        ]);

  return { verdict, feedback, nextStep, strength };
}
