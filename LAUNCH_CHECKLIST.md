# PathForge — Launch Checklist

Everything code-side for this milestone is shipped to `master`. The items below
are the **manual steps only you can do** (dashboards / DB / env), plus a
pre-launch smoke test. Work top to bottom.

---

## 1. Database (Supabase → SQL Editor)

All migrations are idempotent (`IF NOT EXISTS`) — safe to re-run.

- [ ] **Fresh project only:** run `COMPLETE_DATABASE_SETUP.sql` first.
- [ ] **Required for the RPG layer (new):** run `RPG_PROGRESSION_MIGRATION.sql`.
      Adds `profiles.learner_selected_class`, `rpg_class_xp`,
      `rpg_unlocked_skills`, `rpg_completed_quests`, `rpg_earned_rewards`,
      `rpg_avatar` (JSONB) and the `arena_results` table (+ RLS).
      Without it the app still runs, but avatars and class/skill/quest/reward
      progress stay per-device instead of being saved to the account.

> The app is built to **degrade gracefully** if a column is missing (it falls
> back to localStorage / derived state), so a missed migration won't crash
> anything — it just limits cross-device persistence.

## 2. Auth — Google sign-in (fixes the "log in twice / lands on *.vercel.app" bug)

The code now pins the OAuth round-trip to the canonical origin, but the
provider config must agree or it will still drift.

**Supabase → Authentication → URL Configuration**
- [ ] **Site URL:** `https://pathforger.app`
- [ ] **Redirect URLs** (allow list) include:
  - `https://pathforger.app/api/auth/callback`
  - `http://localhost:3000/api/auth/callback` (local dev)

> If the callback URL is not allow-listed, Supabase silently falls back to the
> Site URL — that was the original cause of landing on the zeta deployment URL.

**Google Cloud Console → OAuth client → Authorized redirect URIs**
- [ ] Includes your Supabase callback: `https://<project-ref>.supabase.co/auth/v1/callback`

## 3. Hosting (Vercel)

**Settings → Environment Variables (Production)**
- [ ] `NEXT_PUBLIC_APP_URL = https://pathforger.app` ← master switch for all
      canonical URLs (OAuth redirect, metadata, sitemap/robots, emails).
- [ ] `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` set.
- [ ] Server-only keys (service role, payment, Resend) set and **not** prefixed
      with `NEXT_PUBLIC_`.

**Settings → Domains**
- [ ] `pathforger.app` is the **Primary** domain.
- [ ] `pathforge-zeta.vercel.app` (and any alias) → **Redirect to primary**, so
      the bare deployment URL can't serve the app directly.

## 4. Pre-launch smoke test (production URL)

- [ ] `https://pathforger.app/robots.txt` shows `https://pathforger.app` (confirms env).
- [ ] Sign up with Google → land on `/learn/setup` **once**, no double login,
      stays on `pathforger.app` the whole time.
- [ ] Finish setup → first-run welcome appears → "Start my first quest" opens a
      real lesson → completing it advances the Daily Goal + XP.
- [ ] Visit a bad URL (e.g. `/nope`) → branded 404, not a raw Next.js page.
- [ ] Quests / Skills / Arena / Rewards / Guilds headers show live stats.
- [ ] Parent account → `/parent` lists linked kids; a kid detail page shows
      "This week" + "What they've learned".
- [ ] Mobile: HUD, section nav, and town render without horizontal scroll.
- [ ] PWA: visit on Android Chrome → install prompt appears (with Forgeheart
      screenshots in the dialog) → installed app opens to /learn standalone.
- [ ] PWA: turn on airplane mode in the installed app → navigating shows the
      branded "You're offline" page, not a browser error.
- [ ] PWA: after a redeploy, an open session shows the "New version ready —
      Refresh" toast.

## 5. Trust & safety (verify before promoting)

- [ ] No public child chat, real names, or location anywhere.
- [ ] Under-13 setup requires a parent email (consent gate).
- [ ] No loot boxes / gambling / pay-to-win; coins are earned, prices fixed.
- [ ] Service-role key never reaches the client bundle.

---

## Already done in code (this milestone)

- Mature, age-7–15 game UI (HUD-style headers, leaner anime avatar).
- Functional screen dashboards (live stats + progress bars).
- Daily Goals + streak engagement loop (honest, action-driven).
- New-learner first-run welcome → straight into a real first lesson.
- Parent value: weekly activity chart + "what they've learned" lesson record.
- Quests & career stages deep-link into real, grade-appropriate lessons.
- Canonical-URL fix for the Google login redirect bug.
- Branded 404, route error boundary, and root global-error fallback.
