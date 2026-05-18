PATHFORGE - Setup Instructions

1. LOCAL SETUP
  npm install
  cp .env.example .env.local
  
  Get Supabase credentials from https://supabase.com
  Fill in:
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    SUPABASE_SERVICE_ROLE_KEY

2. DATABASE
  In Supabase SQL Editor:
  - Run: supabase/migrations/001_initial_schema.sql
  - Run: supabase/seed.sql

3. RUN LOCALLY
  npm run dev
  Visit http://localhost:3000

4. TEST
  - Signup with email/password
  - Onboarding: select career path
  - Dashboard: see level, XP, streak
  - Quests: complete quest, earn XP

5. DEPLOY TO VERCEL
  - Push to GitHub
  - Connect to https://vercel.com/new
  - Add env variables
  - Deploy

QUICK TROUBLESHOOTING:
  Can't signup? Check Supabase Auth enabled
  DB error? Verify SUPABASE_SERVICE_ROLE_KEY
  Quests don't save? Check RLS policies
  Login loop? Clear cookies, check auth.getUser()

MORE DETAILS: See DEPLOYMENT.md
