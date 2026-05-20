/**
 * PathForge Smart Mentor (offline-first AI)
 *
 * Generates context-aware, genuinely useful responses without requiring
 * an external LLM. Uses pattern matching + user context (career path,
 * level, streak, active quests) to produce specific, actionable advice.
 *
 * If OPENAI_API_KEY is set, OpenAI is used. If not, this is the fallback.
 * Either way, the user gets a helpful response.
 */

import { CAREER_PATHS } from "@/lib/data/career-paths";
import { getStarterQuests } from "@/lib/data/quest-templates";

interface MentorContext {
  level: number;
  totalXp: number;
  streak: number;
  readinessScore: number;
  selectedCareerPathId: string | null;
  activeQuests: { title: string; difficulty: string; skill_tag: string | null }[];
  completedCount: number;
}

interface MentorReply {
  reply: string;
  suggestedActions: string[];
}

// ============================================================
// Intent classification
// ============================================================

type Intent =
  | "greeting"
  | "what_should_i_learn"
  | "feeling_stuck"
  | "career_advice"
  | "portfolio"
  | "interview_prep"
  | "salary_negotiation"
  | "motivation"
  | "freelance_remote"
  | "resume"
  | "next_quest"
  | "time_management"
  | "self_doubt"
  | "general";

function classifyIntent(message: string): Intent {
  const m = message.toLowerCase().trim();

  if (/\b(hi|hello|hey|kumusta|hi there|sup|yo)\b/.test(m)) return "greeting";
  if (/(what.{0,15}learn|learn first|start with|where.{0,15}start|how.{0,15}begin)/.test(m))
    return "what_should_i_learn";
  if (/(stuck|don.?t know|lost|confused|overwhelm|paralys)/.test(m)) return "feeling_stuck";
  if (/(career advice|career path|switch career|change career)/.test(m)) return "career_advice";
  if (/(portfolio|project|build something|what.{0,10}build|showcase)/.test(m)) return "portfolio";
  if (/(interview|tech screen|coding test|behavioral)/.test(m)) return "interview_prep";
  if (/(salary|negotiat|raise|how much|earn|paid)/.test(m)) return "salary_negotiation";
  if (/(motivat|inspir|consistent|discipline|habit)/.test(m)) return "motivation";
  if (/(freelance|remote|usd|client|gig|virtual assistant|va\b)/.test(m)) return "freelance_remote";
  if (/(resume|cv|linkedin profile|stand out)/.test(m)) return "resume";
  if (/(next quest|what to do next|next step|recommend)/.test(m)) return "next_quest";
  if (/(time|schedule|busy|hours|consistency|balance)/.test(m)) return "time_management";
  if (/(doubt|impostor|not good enough|qualif|talented enough)/.test(m)) return "self_doubt";

  return "general";
}

// ============================================================
// Response templates (multiple variants per intent for variety)
// ============================================================

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatPath(ctx: MentorContext): string {
  const path = ctx.selectedCareerPathId
    ? CAREER_PATHS.find((p) => p.id === ctx.selectedCareerPathId)
    : null;
  return path ? path.title : "your chosen path";
}

function nextRecommendedSkill(ctx: MentorContext): string | null {
  const path = ctx.selectedCareerPathId
    ? CAREER_PATHS.find((p) => p.id === ctx.selectedCareerPathId)
    : null;
  if (!path) return null;
  return path.skills[Math.min(ctx.level - 1, path.skills.length - 1)] || path.skills[0];
}

function nextEasyQuest(ctx: MentorContext): string | null {
  const easyActive = ctx.activeQuests.find((q) => q.difficulty === "easy");
  if (easyActive) return easyActive.title;
  const mediumActive = ctx.activeQuests.find((q) => q.difficulty === "medium");
  if (mediumActive) return mediumActive.title;
  if (ctx.activeQuests.length > 0) return ctx.activeQuests[0].title;
  return null;
}

// ============================================================
// Response generators
// ============================================================

function respond(intent: Intent, ctx: MentorContext, message: string): MentorReply {
  const pathName = formatPath(ctx);
  const skill = nextRecommendedSkill(ctx);
  const quest = nextEasyQuest(ctx);
  const isNewUser = ctx.level <= 2 && ctx.completedCount === 0;
  const hasStreak = ctx.streak >= 3;

  switch (intent) {
    case "greeting":
      return {
        reply: pick([
          `Hey! Glad you're here. You're at Level ${ctx.level} on your ${pathName} path. What's on your mind?`,
          `Hi there. I see you've been forging — Level ${ctx.level}${hasStreak ? `, ${ctx.streak}-day streak` : ""}. How can I help today?`,
          `Welcome back. Quick check-in — what are you working on right now?`,
        ]),
        suggestedActions: ["Suggest my next quest", "I'm feeling stuck", "What should I learn?"],
      };

    case "what_should_i_learn":
      if (skill) {
        return {
          reply: pick([
            `At Level ${ctx.level} on the ${pathName} path, focus on **${skill}** next. It's the natural next skill to deepen. ${quest ? `Your active quest "${quest}" will get you started.` : "Open your Quests tab to see related missions."}`,
            `For someone on your level (${ctx.level}) targeting ${pathName}, the highest-ROI thing right now is **${skill}**. Don't try to learn everything — depth over breadth.`,
            `Honest take: pick **${skill}**. Spend 7 days on it. Ship something with it. That's worth more than 30 days of dabbling across topics.`,
          ]),
          suggestedActions: ["Show me quests for this skill", "How long should I spend?", "Build a project with it"],
        };
      }
      return {
        reply: "First — pick a career path in /onboarding. I can't recommend specific skills without knowing your direction. Once you've picked one, I'll point you at the exact next skill to master.",
        suggestedActions: ["Go to onboarding"],
      };

    case "feeling_stuck":
      return {
        reply: pick([
          `Stuck is normal. Here's what works: pick the SMALLEST possible next step. ${quest ? `Right now: open "${quest}" and do it for just 15 minutes. Not the whole thing — just start.` : "Open one quest from your list. Do 15 minutes. That's it."} Momentum is built one rep at a time.`,
          `Real talk — being stuck usually means you're trying to plan too far ahead. Shrink the next step. ${quest ? `Try "${quest}" for 20 minutes today. Don't think about week 3.` : "Open one quest. Just 20 minutes. Don't think about week 3."}`,
          `When I get stuck, I remind myself: imperfect action beats perfect plans. Pick ANY quest. Spend 30 minutes. The path clears once you're moving.`,
        ]),
        suggestedActions: ["Pick a quest for me", "Reset my goals", "Take a break"],
      };

    case "career_advice":
      return {
        reply: pick([
          `For ${pathName}, the playbook is: ship 3 portfolio projects, get one piece of real-world experience (even unpaid), build a 50-100 person network on LinkedIn. That's 80% of what gets you hired.`,
          `Honest career advice for ${pathName}: the people who get hired aren't the smartest — they're the ones with public proof of work. Every quest you complete should produce something you can SHOW.`,
          `Your level right now: ${ctx.level}. The career arc you want: ship work that gets attention. Skills matter but proof matters more. Focus on visible outcomes.`,
        ]),
        suggestedActions: ["Build a portfolio project", "Update my LinkedIn", "Find first client"],
      };

    case "portfolio":
      if (ctx.selectedCareerPathId) {
        const path = CAREER_PATHS.find((p) => p.id === ctx.selectedCareerPathId);
        const projectIdea = path
          ? `For ${path.title}: build something that solves a real problem you have. ${path.realRoles[0] ? `A typical ${path.realRoles[0]} project: ` : ""}use ${path.skills.slice(0, 3).join(", ")}. Ship it in 1 week, not 3 months.`
          : "Build something specific. Set a 1-week deadline. Ship and share — even if imperfect.";
        return {
          reply: projectIdea,
          suggestedActions: ["Add this to my portfolio", "Show me portfolio quests", "What if it's bad?"],
        };
      }
      return {
        reply: "Pick a career path first so I can suggest project ideas that match your goals. Otherwise you risk building something that doesn't help you.",
        suggestedActions: ["Go to onboarding"],
      };

    case "interview_prep":
      return {
        reply: pick([
          `Interview prep matters but DON'T do it until you have a portfolio. Recruiters interview you because of what you've shipped. Order: portfolio → interview prep → applications.`,
          `Mock interviews are gold. Do 3 in the week before any real interview. For tech roles, Pramp is free. For non-tech, find someone in your network.`,
          `Standard answer: behavioral questions follow STAR (Situation, Task, Action, Result). Write 5 STAR stories from your past — these cover 90% of interview questions.`,
        ]),
        suggestedActions: ["Find practice interview partners", "Write my STAR stories", "Mock interview platforms"],
      };

    case "salary_negotiation":
      return {
        reply: pick([
          `Three rules: (1) never give the first number, (2) ALWAYS negotiate even on first offers — recruiters expect it, (3) research the market. For PH-based remote work, check Glassdoor + Reddit r/Philippines threads. Add 15-25% to whatever they offer first.`,
          `Negotiation math: if you negotiate +₱5k/month on your first job, that's +₱600k over 10 years compounded. The 15-min awkward conversation is the highest-ROI thing you'll do.`,
          `Honest one: most candidates accept whatever's offered. Don't be that. Say "I appreciate the offer. Based on my research, comparable roles are at X. Is there flexibility?" Silence after. Wait them out.`,
        ]),
        suggestedActions: ["Research salary ranges", "Practice negotiation lines", "When to walk away"],
      };

    case "motivation":
      return {
        reply: pick([
          `Motivation is overrated. Systems > willpower. Block 1 hour every day at the same time — that's it. After 30 days it's automatic. ${hasStreak ? `Your ${ctx.streak}-day streak proves you can do this.` : ""}`,
          `The trick isn't "feeling motivated." It's deciding once and showing up regardless of mood. Set the bar SO low you'd be embarrassed to skip — like 15 minutes a day. Then grow it.`,
          `Real talk: motivation comes AFTER action, not before. Don't wait to "feel ready." Open a quest right now, work 20 minutes, you'll feel different by the end.`,
        ]),
        suggestedActions: ["Set a daily reminder", "Pick my smallest quest", "Build the habit"],
      };

    case "freelance_remote":
      return {
        reply: pick([
          `For PH freelance/remote: OnlineJobs.ph + Upwork. Apply to 10 jobs per week with personalized cover letters. Most VAs land their first $5/hr gig within 30 days. Raise rates every 3 months.`,
          `USD income from PH is real and growing. The path: VA → specialized VA → consultant. Each step doubles your rate. Start with VA work even if "below" you — it's the door in.`,
          `Hot take: freelance > traditional job for PH workers. You get USD income, no commute, work from home. Trade-offs: no benefits, less stability. Worth it for most people.`,
        ]),
        suggestedActions: ["Set up OLJ profile", "Write my first pitch", "Find first client"],
      };

    case "resume":
      return {
        reply: pick([
          `Resume rules: 1 page, results not duties, quantify everything ("increased X by Y%"), tailor to each role. Put your portfolio link at the top. Most resumes get 6 seconds — make those 6 seconds count.`,
          `LinkedIn > resume in 2026. Optimize your LinkedIn first: headline says what you DO (not "aspiring..."), skills section filled, 3 detailed past roles, ask for 2-3 recommendations. Resume is just a backup.`,
          `Honest: 80% of resumes are ignored. The way around it is referrals. Build a network FIRST, then you skip the resume pile entirely. Every PathForger should be making 5 LinkedIn connections per week.`,
        ]),
        suggestedActions: ["Optimize my LinkedIn", "Resume template", "Build network"],
      };

    case "next_quest":
      if (quest) {
        return {
          reply: `Do this next: **${quest}**. ${ctx.activeQuests[0].skill_tag ? `Builds your ${ctx.activeQuests[0].skill_tag} skill.` : ""} Click it from your Quests page and start. Don't over-plan.`,
          suggestedActions: ["Open my quests", "Why this one?", "Show me an easier one"],
        };
      }
      return {
        reply: "No active quests right now. Hit /quests and click 'Generate more' to get 5 new ones tuned to your path.",
        suggestedActions: ["Go to quests", "Generate more quests"],
      };

    case "time_management":
      return {
        reply: pick([
          `Block 1 hour daily. Same time. Phone in another room. That's the entire system. Most "time management" advice is people avoiding the boring truth: just sit down and work.`,
          `If you have 30 min/day, that's 182 hours/year. Enough to switch careers. Skills compound — 30 min daily > 4 hours once a week. Consistency wins.`,
          `Try the 1-1-1 rule: 1 quest per weekday, 1 reflection per week, 1 portfolio project per month. Small, steady, undeniable progress.`,
        ]),
        suggestedActions: ["Set up a study schedule", "Block calendar", "Pick today's quest"],
      };

    case "self_doubt":
      return {
        reply: pick([
          `Impostor syndrome is the most common feeling among ambitious people. The fact you're worried means you care. The fix isn't to "feel" more confident — it's to ship more work. Confidence follows competence.`,
          `Everyone you admire felt exactly the same when they started. Difference: they kept going anyway. ${ctx.completedCount > 0 ? `You've already completed ${ctx.completedCount} quest${ctx.completedCount === 1 ? "" : "s"} — that's proof you can.` : "Complete your first quest — proof beats doubt."}`,
          `Real truth: nobody knows what they're doing fully. The "qualified" people just pretend better. You don't need to be 100% ready — 60% ready and shipping > 100% ready and waiting.`,
        ]),
        suggestedActions: ["Complete one quest now", "Talk it through", "Read success stories"],
      };

    case "general":
    default:
      // Smart fallback based on user state
      if (isNewUser) {
        return {
          reply: `Good question. As a new ${pathName} forger, the most useful thing for you right now is just to START. ${quest ? `Open "${quest}" and spend 15 minutes on it. ` : "Generate your first quests at /quests. "}I'll be more helpful as I learn your patterns.`,
          suggestedActions: ["Show me my next quest", "What should I learn?", "I'm feeling stuck"],
        };
      }
      if (hasStreak) {
        return {
          reply: `You're on a ${ctx.streak}-day streak — that's real momentum. ${quest ? `Your next quest is "${quest}". ` : ""}For your specific question, can you give me more detail? I want to give you something specific, not generic.`,
          suggestedActions: ["My biggest blocker right now", "Help me plan this week", "Suggest a project"],
        };
      }
      return {
        reply: `I want to give you something specific. Can you rephrase with more detail? For example: "I want to switch from VA to graphic designer but don't know where to start" — that I can help with.`,
        suggestedActions: ["What should I learn first?", "I'm feeling stuck", "Suggest my next quest"],
      };
  }
}

// ============================================================
// Public API
// ============================================================

export function generateMentorReply(message: string, ctx: MentorContext): MentorReply {
  const intent = classifyIntent(message);
  return respond(intent, ctx, message);
}
