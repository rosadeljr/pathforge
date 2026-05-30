# PathForge 🇵🇭

**An affordable, curriculum-aligned, Filipino-contextualised learning app that turns daily school mastery into career discovery — with parent-visible progress.**

PathForge is a Filipino K-10 learning platform for kids ages 6–15. It combines gamified daily lessons across Math, English, Filipino, Science, and Araling Panlipunan with a kid-safe AI tutor and a career-exploration system grounded in real Philippine paths (BPO, maritime, agriculture, public service, TVL trades, STEM, healthcare, the arts).

Built by **ZenForge Technologies**.

---

## Why we exist

Filipino families spend on tutoring, modules, and review centres because schools alone can't always keep up. PathForge gives every kid an AI-guided supplement that:

- Builds genuine subject mastery through bite-sized lessons aligned to PH K-10 competencies.
- Connects what they're learning to **real careers** — from doctor to seafarer, from teacher to game designer — so motivation feels earned, not abstract.
- Gives parents a clear weekly view of strengths, gaps, and next steps without invading the child's autonomy.
- Stays affordable: **₱149/mo Pro** for one kid, **₱299/mo Family** for up to four.

---

## What's inside

### Learners (kids 6–15)
- 5 PH core subjects with grade-banded content (currently Grades 1–10).
- Daily Quests that rotate by date (XP Hunter, Subject Sampler, Perfectionist, Goal Crusher, Streak Keeper, Dream Chaser).
- A 5-stage **Career Adventure** for every career in the explorer. Reaching the final stage earns a **Career Mastery Certificate** with a verifiable credential code.
- **ForgeBot** — an age-tiered AI tutor with strict child-safety guardrails (inbound + outbound moderation).
- Streaks, levels, achievements, and a same-tier leaderboard.

### Parents (Pro / Family)
- Linked-kid dashboard with weekly stats (XP, lessons today/week, streak, dream career stage).
- Profile-level privacy controls: hide-from-leaderboard toggle, pseudonymous display.
- (Coming next) Weekly progress email digest.

### Admins
- Manual GCash/Maya payment approval queue.
- User management with tier overrides.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 |
| Styling | Tailwind v4 |
| Database / Auth | Supabase (Postgres + RLS) |
| AI tutor | OpenAI (gpt-4o + omni-moderation) |
| Email | Resend |
| Payments | Manual GCash/Maya now; Stripe wired for later |
| PWA | Manifest + iOS install prompt + safe-area handling |
| Hosting | Vercel |

---

## Repository structure

```
app/
  (app)/            authenticated learner + parent app
    learn/          subjects, lessons, careers, certificates
    parent/         parent dashboard
    mentor/         ForgeBot chat
    friends/        same-mode friend connections
    leaderboard/    age-tier leaderboard
  (auth)/           login + signup
  (marketing)/      pricing, privacy, terms, cookies
  api/              ai-mentor, webhooks/stripe, cron, etc.
  admin/            staff-only admin pages
components/         UI primitives, landing widgets, mascot, PWA install prompt
lib/
  data/             learner.ts, learner-lessons.ts, careers.ts, curriculum.ts, daily-quests.ts
  validations/      username filter, schemas
  email/            transactional templates
  certificates.ts   career-mastery awarding logic
  entitlements.ts   tier → feature matrix
*.sql               idempotent Supabase migrations (run in order)
LAUNCH.md           pre-launch checklist
AGENTS.md           rules for AI agents editing this repo
```

---

## Local development

```bash
# 1. Install
npm install

# 2. Configure env (.env.local) — see LAUNCH.md for the full list
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
OPENAI_API_KEY=...
RESEND_API_KEY=...
EMAIL_FROM="PathForge <noreply@pathforger.app>"
CRON_SECRET=...

# 3. Apply migrations in Supabase (in order, all idempotent):
#    LEARNER_MODE_MIGRATION.sql
#    FRIENDSHIPS_MIGRATION.sql
#    CAREERS_MIGRATION.sql
#    PARENT_FAMILY_MIGRATION.sql
#    CERTIFICATES_MIGRATION.sql
#    PRIVACY_CONTROLS_MIGRATION.sql

# 4. Run
npm run dev

# 5. Visit http://localhost:3000
```

---

## Editing rules (read AGENTS.md before touching code)

This project uses **Next.js 16** which has breaking changes from older versions. Before editing any Next.js code, check `node_modules/next/dist/docs/` for the current API. Don't assume older conventions.

Other conventions:

- Lessons live in `lib/data/learner-lessons.ts`. Add new content there — don't fetch from a CMS.
- The curriculum metadata schema (competency, prerequisites, mastery threshold, language, review status) is additive and optional. Backfill incrementally.
- Career unlock should use `requiredSubjectXp` (mastery-based) when defined. Falls back to `xpToUnlock` for legacy entries.
- Tutor prompts and moderation live in `app/api/ai-mentor/route.ts`. Three age tiers (little / junior / teen) with strict child-safety rules.
- Don't expose a child's full username on any public surface. Leaderboard honours `show_on_leaderboard` and `display_mode`.

---

## Status

PathForge is **launch-ready as a paid app for Filipino families**. The lesson library is intentionally small at launch (~50 lessons), so the first month is about validating the loop with real families before expanding content.

See `LAUNCH.md` for the pre-flight checklist.

---

## Licence

Proprietary. © ZenForge Technologies. All rights reserved.
