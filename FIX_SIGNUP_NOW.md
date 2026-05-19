# Fix Signup — Critical SQL Migration Required

## The Real Problem

Your signup was failing because of a **missing database policy** in Supabase. The `profiles` table has Row Level Security (RLS) enabled, but there's no INSERT policy allowing new users to create their profile row.

**Result:** Auth user gets created → profile insert blocked → entire signup appears broken.

---

## The Fix (2 minutes)

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your PathForge project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL

Copy and paste the entire SQL block below into the editor, then click **Run**:

```sql
-- Allow users to insert their own profile after signup
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile via trigger on signup (more reliable than client-side insert)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Test Signup

1. Go to `https://your-pathforge-domain.com/signup`
2. Create a test account
3. Should now redirect to `/onboarding` successfully

---

## What This Does

**Before:** Signup tries to insert into `profiles` → RLS blocks it → fails  
**After:** 
1. RLS policy allows users to insert their own profile (safety net)
2. Database trigger automatically creates profile when auth user is created (primary path)
3. Even if client-side insert fails, the trigger ensures profile exists

This is the **production-recommended pattern** from Supabase docs.

---

## Why It Was Broken

Looking at the original schema (`supabase/migrations/001_initial_schema.sql`):

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- These policies exist:
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- BUT NO INSERT POLICY! This is the bug.
```

When the signup code ran:
```typescript
await supabase.from("profiles").insert({ id, email, username });
```
Supabase silently blocked it with "new row violates row-level security policy" — but the auth user was already created, leaving accounts in a broken state.

---

## Code Improvements Also Deployed

The signup page is now more robust:

1. **DB trigger handles profile creation** — Primary path, runs server-side
2. **Client-side upsert as backup** — Won't fail signup if it errors
3. **Email confirmation handling** — Properly handles both auto-signin and email verification flows
4. **Better error messages** — "Email already registered" instead of cryptic errors
5. **Form validation** — Real-time field validation with helpful hints
6. **Password strength meter** — Visual feedback on password quality

---

## Verification Checklist

After running the SQL:

- [ ] No errors in SQL Editor output
- [ ] Sign up with new test email works
- [ ] Redirects to `/onboarding` (or shows email verification)
- [ ] Profile row exists in `profiles` table (check Table Editor)
- [ ] Username matches what was entered

---

## Still Having Issues?

If signup still fails after running the SQL:

1. **Check Supabase email settings**:
   - Supabase Dashboard → Authentication → Providers → Email
   - Enable "Email" provider
   - Decide: do you want "Confirm email" enabled or not? (For testing, turn it off)

2. **Check the browser console**:
   - Press F12 → Console tab
   - Look for any error messages
   - Share the error if you need help

3. **Check Supabase logs**:
   - Supabase Dashboard → Logs → Auth Logs
   - Look for the failed signup attempt
   - The error message will tell you exactly what went wrong

4. **Verify env vars on Vercel** (from previous fix):
   - `NEXT_PUBLIC_SUPABASE_URL` must be set
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` must be set

---

**Estimated fix time:** 2 minutes  
**Difficulty:** Easy (just paste SQL and click Run)
