# PathForge - Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies
```bash
cd pathforge
npm install
```

### 2. Setup Supabase

1. Create free account at https://supabase.com
2. Create new project
3. Get credentials from Settings > API

### 3. Create .env.local
```bash
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=openai
```

### 4. Setup Database

In Supabase SQL Editor, run:
```sql
-- Copy and run supabase/migrations/001_initial_schema.sql
-- Then run supabase/seed.sql
```

### 5. Run Dev Server
```bash
npm run dev
```

Visit http://localhost:3000

## Database Schema

Tables:
- profiles: User info and progress
- career_paths: Career definitions  
- quests: User tasks
- skills: Skill definitions
- projects: Portfolio projects
- achievements: Badge definitions
- ai_messages: Chat history
- subscriptions: Payment data

All secured with Row Level Security.

## Deployment to Vercel

1. Push to GitHub
2. Go to https://vercel.com/new
3. Connect GitHub repo
4. Add environment variables
5. Deploy

Environment vars for Vercel:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENAI_API_KEY
- AI_PROVIDER

## Testing

### Sign Up Flow
1. Click "Get Started"
2. Enter email/password
3. Should redirect to onboarding

### Onboarding
1. Select career path
2. Enter goals
3. Redirects to dashboard

### Dashboard
- See level, XP, streak
- Click Quests, Roadmap, Portfolio, Settings

### Complete Quest
- Click Quests
- Click Complete to earn XP
- XP updates in database

## File Structure

```
pathforge/
  app/
    (marketing)/page.tsx       # Landing page
    (auth)/signup/page.tsx     # Sign up
    (auth)/login/page.tsx      # Login
    (app)/
      dashboard/page.tsx       # Main dashboard
      quests/page.tsx          # Quest list
      roadmap/page.tsx         # Career roadmap
      portfolio/page.tsx       # Portfolio vault
      mentor/page.tsx          # AI mentor chat
      pricing/page.tsx         # Pricing page
      settings/page.tsx        # Settings
      layout.tsx              # App navigation
    api/
      user-progress/route.ts  # Get user stats
      ai-mentor/route.ts      # Mentor chat API
    layout.tsx               # Root layout
  
  lib/
    supabase/
      client.ts              # Browser client
      server.ts              # Server client
    gamification/
      xp.ts                  # XP calculations
      readiness.ts           # Readiness score
      streaks.ts             # Streak logic
    validations/
      index.ts               # Zod schemas
  
  types/
    index.ts                 # TypeScript types
  
  supabase/
    migrations/
      001_initial_schema.sql # Database schema
    seed.sql                 # Initial data
```

## Next Steps

To add more features:

1. **OpenAI Integration**
   - Add API call in /api/ai-mentor/route.ts
   - Use OPENAI_API_KEY env var

2. **Payments**
   - Configure PAYMONGO_SECRET_KEY and PAYMONGO_WEBHOOK_SECRET on Vercel
   - Register webhook in PayMongo dashboard pointing at
     /api/paymongo/webhook (events: source.chargeable, payment.paid,
     payment.failed)

3. **Image Uploads**
   - Use Supabase Storage
   - Create upload endpoint in /api/upload

4. **Notifications**
   - npm install resend
   - Create email templates
   - Send on quest completion

5. **Mobile App**
   - Use React Native / Expo
   - Reuse components
   - Share API with web

## Troubleshooting

**Can't sign up?**
- Check Supabase Auth settings
- Verify env vars in .env.local

**Quests not saving?**
- Check Supabase RLS policies
- Verify user is authenticated

**Database errors?**
- Check SUPABASE_SERVICE_ROLE_KEY
- Verify migrations were run

**Redirects to login?**
- Check auth.getUser() in API routes
- Verify Supabase session cookies

## Support

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Vercel Docs: https://vercel.com/docs

---

Build and deploy with confidence!
