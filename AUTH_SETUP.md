# PathForge Authentication Setup Guide

## Critical Issue: Login Not Working

If users cannot login to PathForge, the most common cause is **missing environment variables on Vercel**.

---

## Root Cause Analysis

### Why Login Fails

1. **Missing Environment Variables on Vercel** (Most Common)
   - The application requires `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - These are set in `.env.local` for local development
   - But they MUST also be set in Vercel's Environment Variables for production

2. **Supabase Client Initialization Failure**
   - If env vars are missing, the Supabase client cannot initialize
   - This causes all auth methods to fail silently or throw errors

3. **Session Management Issues**
   - Missing middleware for session refresh
   - No auth callback route for handling OAuth redirects
   - Session cookies not being properly set/refreshed

---

## Setup Instructions

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project at https://supabase.com/dashboard
2. Navigate to Project Settings → API Keys
3. Copy:
   - `Project URL` (this is `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public` key (this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

### Step 2: Set Environment Variables on Vercel

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select the PathForge project
3. Click Settings → Environment Variables
4. Add the following variables for all environments (Production, Preview, Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc....[your-anon-key]
```

⚠️ **IMPORTANT**: These variables start with `NEXT_PUBLIC_` which means they are exposed to the browser. This is intentional for Supabase public authentication keys.

### Step 3: Verify Supabase Configuration

1. In Supabase Dashboard, go to Authentication → Providers
2. Ensure "Email" provider is enabled
3. Go to Authentication → URL Configuration
4. Add your Vercel deployment URL to allowed redirect URLs:
   - `https://your-pathforge-domain.com/api/auth/callback`
   - `https://your-pathforge-domain.com`

### Step 4: Redeploy

After setting environment variables on Vercel:

1. Go to your Vercel project
2. Click the most recent deployment
3. Click the three-dot menu → Redeploy (or push a new commit to trigger redeploy)
4. Wait for deployment to complete
5. Test login at `https://your-pathforge-domain.com/login`

---

## Verification Checklist

- [ ] Environment variables set in Vercel (both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [ ] Application redeployed after setting environment variables
- [ ] Supabase project has Email provider enabled
- [ ] Redirect URL added to Supabase (optional, needed for OAuth)
- [ ] Can access login page without errors
- [ ] Can submit login form without errors
- [ ] Redirected to dashboard after successful login

---

## Troubleshooting

### Issue: "Configuration Error: Supabase credentials not found"

**Cause**: Environment variables not set on Vercel

**Solution**: Follow Step 2 above and redeploy

---

### Issue: "Authentication failed" when submitting login form

**Cause 1**: Invalid email/password  
**Solution**: Check your email and password. Make sure you've created an account first.

**Cause 2**: Supabase project is not configured  
**Solution**: Verify your Supabase project exists and Email provider is enabled

**Cause 3**: Environment variables are incorrect  
**Solution**: Double-check that the values match your Supabase Project Settings exactly

---

### Issue: Login succeeds but user is redirected back to login

**Cause**: Session not being properly refreshed  
**Solution**: This should be fixed by the new middleware. If it persists:
1. Clear browser cookies for the domain
2. Try in a private/incognito window
3. Check browser console for errors

---

## Architecture

### Files Involved in Authentication

1. **Client Components**
   - `app/(auth)/login/page.tsx` - Login form with error handling
   - `app/(auth)/signup/page.tsx` - Signup form with profile creation
   - `app/(app)/layout.tsx` - Route protection and auth check

2. **Server Components**
   - `app/api/auth/callback/route.ts` - OAuth callback handler
   - `middleware.ts` - Session refresh on every request
   - `lib/supabase/middleware.ts` - Supabase SSR session helper

3. **Supabase Clients**
   - `lib/supabase/client.ts` - Browser client using `NEXT_PUBLIC_` env vars
   - `lib/supabase/server.ts` - Server client for secure operations
   - Both use environment variables for initialization

---

## Security Notes

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is intended to be public (it's in the URL)
- Supabase RLS (Row Level Security) protects your data from unauthorized access
- Never expose `SUPABASE_SERVICE_ROLE_KEY` in the browser (only use on server)
- The middleware automatically refreshes sessions to prevent token expiration

---

## Next Steps After Setup

1. Create test accounts in Supabase (or allow user registration via signup)
2. Test complete user flow: Signup → Onboarding → Dashboard
3. Monitor Supabase usage in dashboard
4. Set up email verification if needed (Supabase Auth → Email Templates)

---

## Support

If issues persist:

1. Check Vercel deployment logs: Vercel Dashboard → Deployments → Recent deploy → View Logs
2. Check browser console: Open DevTools (F12) → Console tab for error messages
3. Check Supabase logs: Supabase Dashboard → Logs for authentication events
4. Review this guide's Troubleshooting section

---

**Last Updated**: May 19, 2026  
**Status**: Critical Auth Fix Applied
