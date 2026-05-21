# Resend Email Setup — Payment Notifications

Get email alerts when users submit payments, and auto-notify users when
you approve/reject. Total time: **~10 minutes**.

---

## What you get

| Event | Email sent to | Works with default sender? |
|---|---|---|
| User submits a GCash/Maya payment | **You** (rosadelreyes10@gmail.com) | ✅ Yes |
| You approve a payment | The **user** | ⚠️ Needs verified domain |
| You reject a payment | The **user** | ⚠️ Needs verified domain |

The **admin alert works immediately** with no domain setup. User-facing
emails need a verified domain (Step 4 — optional, do it later).

---

## Step 1 — Create a Resend account

1. Go to **https://resend.com/signup**
2. Sign up with **rosadelreyes10@gmail.com** ← important: this must be the
   email you want admin alerts delivered to
3. Verify your email

---

## Step 2 — Get your API key

1. Resend Dashboard → **API Keys** → **Create API Key**
2. Name it `PathForge`, permission **Full access**
3. Copy the key (starts with `re_...`) — you only see it once

---

## Step 3 — Add env vars to Vercel

Vercel Dashboard → PathForge project → **Settings → Environment Variables**.
Add for **all environments**:

| Name | Value |
|---|---|
| `RESEND_API_KEY` | `re_...` (from Step 2) |
| `ADMIN_EMAIL` | `rosadelreyes10@gmail.com` |
| `NEXT_PUBLIC_APP_URL` | `https://your-pathforge-domain.vercel.app` |

`EMAIL_FROM` is optional — leave it unset and it defaults to
`PathForge <onboarding@resend.dev>`, which works for admin alerts.

Click **Save**, then **Redeploy** (Deployments → latest → Redeploy).

---

## Step 4 — (Optional) Verify a domain for user emails

The default sender `onboarding@resend.dev` can ONLY deliver to your own
Resend account email. To email *users* on approval/rejection, verify a
domain:

1. Resend Dashboard → **Domains** → **Add Domain**
2. Enter your domain (e.g. `pathforge.app`)
3. Add the DNS records Resend shows you (at your domain registrar)
4. Wait for verification (~15 min – few hours)
5. In Vercel, set `EMAIL_FROM` = `PathForge <noreply@pathforge.app>`
6. Redeploy

Until you do this, approval/rejection emails simply won't send — the
in-app status still updates fine, so nothing breaks.

---

## Step 5 — Test it

1. Sign in to PathForge with a test account
2. Go to **Pricing** → click **Go Pro**
3. In the payment modal, click "I've paid", enter any reference number,
   submit
4. Within ~30 seconds you should get an email at **rosadelreyes10@gmail.com**
   titled "💸 ₱249 PRO payment from …"
5. Open `/admin/payments`, approve it
6. If you did Step 4, the test user gets an "⚡ You're now PRO!" email

---

## How it works

```
User submits payment
  → row inserted into payment_requests
  → POST /api/notify-payment { type: "submitted" }
  → Resend emails YOU the details + admin-panel link

You approve in /admin/payments
  → user's subscription_tier upgraded
  → POST /api/notify-payment { type: "approved" }
  → Resend emails the USER their plan is active
```

Emails are **best-effort** — if Resend is down or the key is missing,
the payment still records and the tier still updates. Nothing breaks;
you just won't get the email.

---

## Troubleshooting

**No admin email after a test payment**
- Check `RESEND_API_KEY` is set in Vercel + you redeployed
- Resend Dashboard → **Logs** shows every send attempt + errors
- Check spam folder

**Admin email works, user emails don't**
- Expected until you verify a domain (Step 4)
- `onboarding@resend.dev` can't deliver to arbitrary addresses

**"You can only send testing emails to your own email address"**
- This Resend error means you're on the default sender. Either test with
  your own account email, or complete Step 4.

---

## Free tier

Resend free plan: **3,000 emails/month, 100/day** — plenty for early
launch. Upgrade only when you scale.

Last updated: May 2026
