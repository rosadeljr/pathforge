# PathForge — Launch Checklist

Complete each section below in order before going public.

---

## 1. Database migrations (Supabase SQL editor)

Run these in order. Each is idempotent — safe to re-run.

```
1. LEARNER_MODE_MIGRATION.sql      — adds user_mode, learner_grade, learner_subjects, parent_email
2. FRIENDSHIPS_MIGRATION.sql       — friendships table + same-mode trigger + RLS
3. CAREERS_MIGRATION.sql           — adds dream_career_id to profiles
4. PARENT_FAMILY_MIGRATION.sql     — adds is_parent_account, parent_profile_id + parent RLS
5. CERTIFICATES_MIGRATION.sql      — career_certificates table + RLS for kids + parents
6. PRIVACY_CONTROLS_MIGRATION.sql  — show_on_leaderboard + display_mode (pseudonymous)
```

After running all four, verify the columns exist:

```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'user_mode', 'learner_grade', 'learner_subjects',
    'parent_email', 'dream_career_id',
    'is_parent_account', 'parent_profile_id'
  );
-- Should return 7 rows.
```

---

## 2. Environment variables (Vercel → Settings → Environment Variables)

**Required:**

```
NEXT_PUBLIC_SUPABASE_URL              — Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY         — Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY             — Supabase service role (server-only, used by API routes)
NEXT_PUBLIC_APP_URL                   — https://pathforger.app (or your domain)
```

**AI tutor (required for ForgeBot quality):**

```
OPENAI_API_KEY                        — OpenAI API key
```

**Email (required for transactional + parent progress emails):**

```
RESEND_API_KEY                        — Resend API key
EMAIL_FROM                            — e.g. "PathForge <noreply@pathforger.app>"
```

**Payments — RENAME these from the old career-mode setup:**

```
STRIPE_PRICE_PRO                      — Pro plan ₱149/mo Stripe price id
STRIPE_PRICE_FAMILY                   — Family plan ₱299/mo Stripe price id  (was STRIPE_PRICE_ELITE)
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
```

**Cron + admin:**

```
CRON_SECRET                           — random 32-byte hex string, used by /api/cron/*
```

**Domain (DNS):**

- `pathforger.app` A/CNAME records pointing to Vercel
- Resend domain verification records added (TXT, MX, etc. — Resend can auto-create via Vercel)

---

## 3. Stripe price setup

In the Stripe dashboard (Products):

| Product | Price | Recurrence | Env var |
|---|---|---|---|
| PathForge Pro | ₱149 PHP | monthly | `STRIPE_PRICE_PRO` |
| PathForge Family | ₱299 PHP | monthly | `STRIPE_PRICE_FAMILY` |

(GCash/Maya is the primary payment method — Stripe is for international card customers if you add that later.)

---

## 4. Manual smoke test (do these before announcing)

Use a fresh incognito browser. Test as a **kid** first, then as a **parent**.

### Kid signup flow
- [ ] `/` loads with mascot + dashboard preview animations
- [ ] Click "Start learning — free" → `/signup`
- [ ] Sign up with a new email
- [ ] Redirects to `/learn/setup`
- [ ] Step 1: pick grade (try Grade 3 to test under-13 flow)
- [ ] Step 2: pick subjects (or skip)
- [ ] Step 3: parent email required (since Grade 3 = under 13) — enter a parent email
- [ ] Lands on `/learn` — see daily goal, today's mission, career card
- [ ] Click "Today's mission" → lesson player loads
- [ ] See "In the real world" career hook on Q1
- [ ] Answer all questions, finish
- [ ] First-ever lesson celebration banner appears
- [ ] Confetti rains, XP awarded
- [ ] "Explore careers like this →" CTA works
- [ ] `/learn/careers` shows 32 cards
- [ ] Pick one as dream career
- [ ] Career detail page shows 5-stage adventure
- [ ] `/mentor` chat replies (test with a math question — verify age-tier voice)
- [ ] `/friends`, `/leaderboard`, `/achievements` all load

### Parent flow
- [ ] In Supabase: manually set `is_parent_account = true` AND set `parent_profile_id = <parent's id>` on the kid profile
- [ ] Sign in as the parent
- [ ] Lands on `/parent` dashboard (not `/learn`)
- [ ] Sees linked kid with stats
- [ ] Click "Details" → `/parent/[kidId]` shows full breakdown
- [ ] Subject progress bars render

### Edge cases
- [ ] Sign out and sign back in — lands correctly
- [ ] Refresh in middle of a lesson — state preserved or reset cleanly
- [ ] Visit `/pricing` while logged out + logged in — CTAs route correctly
- [ ] `/privacy` and `/terms` load and reference kids correctly
- [ ] Robots.txt and sitemap accessible

### Payment smoke test
- [ ] Sign in as a parent or kid
- [ ] Click Upgrade → see GCash/Maya modal
- [ ] Test the modal UX (don't have to actually pay — verify the QR + reference field works)

---

## 5. Branding + SEO sanity

- [ ] OG image at `/opengraph-image` looks current (reflects K-12 framing, not adult career framing)
- [ ] Twitter image at `/twitter-image` same
- [ ] Manifest start_url is `/learn`
- [ ] Manifest name/description mentions K-12, kids, ages 6–18
- [ ] Robots.txt disallows authenticated routes
- [ ] Sitemap only includes public pages

---

## 6. Pricing summary (so you know what's selling)

| Plan | Price | Daily lessons | Tutor | Parent dashboard | Kid profiles |
|---|---|---|---|---|---|
| Free | ₱0 | 5/day | 10 msgs/day | — | 1 |
| Pro | ₱149/mo | unlimited | unlimited | ✅ | 1 |
| Family | ₱299/mo | unlimited | unlimited | ✅ (all kids) | up to 4 |

---

## 7. Marketing copy ready to go

**Tagline:** Where kids forge their future.

**One-liner:** Fun, interactive K-12 lessons for Filipino kids ages 6–18. Quests, streaks, mascots, and a kid-safe AI tutor.

**Three key features:**
1. 5 core subjects (Math, English, Filipino, Science, Araling Panlipunan) aligned to PH K-12 curriculum
2. 32 careers to explore — each is a 5-stage adventure kids unlock as they learn
3. Kid-safe ForgeBot tutor that adapts to age tier (Little / Junior / Teen Forger)

**Why parents pay:**
- ₱149/mo Pro = less than one tutoring session
- ₱299/mo Family covers up to 4 kids (₱75/kid)
- No ads. No in-app purchases for kids. No external links. Strict AI guardrails.

---

## 8. Post-launch monitoring (week 1)

- [ ] Vercel function logs for errors
- [ ] Supabase logs for slow queries / RLS denials
- [ ] OpenAI usage dashboard for tutor costs
- [ ] Resend dashboard for email delivery
- [ ] Stripe / GCash for paid signups
- [ ] User feedback channel (Discord / email / form)

---

## 9. Known follow-ups (post-launch backlog)

- Weekly progress emails to parents (cron job, uses Resend) — copy ready, scheduling not wired
- More lesson content for grades 1–2 and 11–12 (current ~50, target 100+)
- Family plan kid-profile creation UI (parent invites kid to join their plan)
- Achievement badges system (UI exists, badges are sparse)
- Mobile app wrap (PWA already works — could ship as Capacitor for App Store/Play Store)

---

**Ship it. 🚀**
