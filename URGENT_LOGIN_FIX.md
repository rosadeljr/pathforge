# 🚨 URGENT: How to Fix Login - Action Required

Your login is broken because **Vercel doesn't have Supabase environment variables set**. Follow these steps immediately:

---

## Quick Fix (5 minutes)

### Step 1: Open Vercel Dashboard
Go to: https://vercel.com/dashboard

### Step 2: Select PathForge Project
Click on your PathForge project

### Step 3: Go to Settings
Click **Settings** in the top menu

### Step 4: Click "Environment Variables"
In the left sidebar, click **Environment Variables**

### Step 5: Add These Variables

Add **BOTH** of these environment variables for **ALL environments** (Production, Preview, Development):

**Variable 1:**
- Name: `NEXT_PUBLIC_SUPABASE_URL`
- Value: Get from https://supabase.com/dashboard → Project Settings → API Keys → "Project URL"
- Example: `https://xxxxxxxxxxx.supabase.co`

**Variable 2:**
- Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: Get from https://supabase.com/dashboard → Project Settings → API Keys → "anon public"
- Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

⚠️ **IMPORTANT**: Copy these values EXACTLY - no extra spaces or quotes!

### Step 6: Redeploy
After adding variables:
1. Click **Deployments** at the top
2. Find the most recent deployment
3. Click the **⋮** (three dots) menu
4. Click **Redeploy**
5. Wait for deployment to complete (green checkmark)

### Step 7: Test Login
Go to: `https://your-pathforge-domain.com/login`

Try logging in. If it still doesn't work, follow the Troubleshooting section below.

---

## What Was Fixed

✅ **Auth callback route** - Created `/api/auth/callback` to handle OAuth redirects  
✅ **Session middleware** - Added automatic session refresh on every request  
✅ **Error detection** - Shows clear error if Supabase env vars are missing  
✅ **Better error messages** - Displays what went wrong so you can debug  

**BUT** - These fixes only work if Vercel has the environment variables set!

---

## Troubleshooting

### Still getting "Configuration Error: Supabase credentials not found"

**Step 1:** Double-check variable names
- Should be: `NEXT_PUBLIC_SUPABASE_URL` (NOT `NEXT_PUBLIC_SUPABASE_URL_TEST`)
- Should be: `NEXT_PUBLIC_SUPABASE_ANON_KEY` (NOT `SUPABASE_ANON_KEY`)

**Step 2:** Wait for redeploy to complete
- Variables won't take effect until deployment shows ✓
- Takes 2-5 minutes usually

**Step 3:** Clear browser cache
- Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- Or try in a private/incognito window

**Step 4:** Check the values are correct
- Go to Supabase → Project Settings → API Keys
- Copy again (no extra spaces!)
- Make sure you're copying from the right project

### "Authentication failed" error

This usually means wrong email/password. But check:
1. Did you create an account? Try `/signup` first
2. Is your Supabase email authentication enabled? Go to Supabase → Auth → Providers → Email (should be enabled)
3. Check browser console (F12 → Console) for detailed error

### Login succeeds but redirects back to /login

This means session isn't persisting. Try:
1. Clear cookies for the domain
2. Hard refresh the page
3. Check browser console for errors
4. Wait a few minutes (session sync can take time)

---

## If You're Stuck

1. **Check Vercel Logs**: Deployments → Recent deploy → View Logs
2. **Check Browser Console**: F12 → Console tab
3. **Check Supabase Status**: https://status.supabase.com/
4. **Re-read AUTH_SETUP.md** in the project for detailed architecture

---

## Next Steps After Login Works

1. Create a test account: `/signup`
2. Complete onboarding
3. Access dashboard: `/dashboard`
4. Test all features (quests, mentor, portfolio, etc.)

---

**Status**: Critical auth infrastructure deployed. Now just needs environment variables!  
**Time to fix**: ~5 minutes  
**Difficulty**: Very easy - just copy/paste values
