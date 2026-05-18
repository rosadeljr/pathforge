# PathForge - Setup & Deployment Guide

Complete guide to set up, develop, and deploy PathForge locally or to production.

---

## Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- **GitHub** account (for deployment)
- **Supabase** account (for database)
- **OpenAI** API key (for AI mentor)
- **Stripe** account (optional, for payments)

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/rosadeljr/pathforge.git
cd pathforge
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Environment Configuration

Create `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# API Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
AI_PROVIDER=openai

# OpenAI (for AI Mentor)
OPENAI_API_KEY=sk-your-key-here

# Stripe (optional for payments)
STRIPE_SECRET_KEY=sk_test_your-stripe-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Node Environment
NODE_ENV=development
```

### Step 4: Set Up Supabase

#### 4.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Wait for project initialization
4. Get API keys from Settings → API

#### 4.2 Run Database Migrations
```bash
# Option A: Using Supabase CLI
supabase db push

# Option B: Manual SQL
# 1. Go to Supabase Dashboard
# 2. SQL Editor
# 3. Copy content from supabase/migrations/001_initial_schema.sql
# 4. Paste and execute
```

#### 4.3 Seed Initial Data
```bash
# Method 1: Supabase Dashboard SQL Editor
# Copy supabase/seed.sql content and execute

# Method 2: Via API
# Use Supabase client to insert seed data
```

#### 4.4 Enable RLS (Row Level Security)
All user-owned tables have RLS policies configured:
- Profiles
- User Career Paths
- Quests
- Skills
- Projects
- Achievements
- AI Messages

Check in Supabase Dashboard → Authentication → Policies

### Step 5: Get OpenAI API Key

1. Go to https://platform.openai.com/account/api-keys
2. Create new secret key
3. Copy and paste in `.env.local` as `OPENAI_API_KEY`

### Step 6: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

---

## Database Schema

### Tables

1. **profiles** - User account information
2. **career_paths** - Available career paths
3. **user_career_paths** - User's selected career path
4. **quests** - Available quests
5. **user_quests** - User quest completion status
6. **skills** - Available skills
7. **user_skills** - User skill progress
8. **projects** - User portfolio projects
9. **achievements** - Achievement definitions
10. **user_achievements** - User achievement progress
11. **analytics_events** - Usage analytics
12. **subscriptions** - Premium tier tracking
13. **ai_messages** - Chat conversation history

### Key Fields

**profiles**
- `id` (UUID, primary key)
- `email` (text)
- `username` (text, unique)
- `level` (int, default 1)
- `xp` (int, default 0)
- `current_streak` (int, default 0)
- `subscription_tier` (text, default 'free')

**quests**
- `id` (UUID, primary key)
- `title` (text)
- `description` (text)
- `xp_reward` (int)
- `type` (text: learning, project, interview)

---

## Authentication

### Email/Password Flow

1. User signs up with email & password
2. Supabase Auth creates user account
3. Profile entry created in `profiles` table
4. User redirected to onboarding
5. Authenticated requests use `Authorization: Bearer {token}`

### Protected Routes

Routes under `app/(app)/` are protected by middleware:
- Dashboard
- Quests
- Mentor
- Portfolio
- Settings
- Roadmap
- Pricing
- Onboarding

Unauthenticated users redirected to `/login`

---

## Gamification Calculations

### XP Formula
```typescript
const requiredXP = Math.floor(100 * Math.pow(level, 1.45))
```

Example progression:
- Level 1: 100 XP
- Level 2: 172 XP
- Level 5: 497 XP
- Level 10: 1,545 XP
- Level 100: 2,566,847 XP

### Readiness Score
```typescript
score = 
  quest_completion_rate * 0.25 +
  skill_mastery_pct * 0.25 +
  portfolio_proof_pct * 0.25 +
  streak_consistency * 0.15 +
  interview_prep_pct * 0.10
```

Result: 0-100%

---

## API Endpoints

### POST /api/ai-mentor
Get AI mentor response

**Request:**
```json
{
  "message": "How do I improve my coding skills?",
  "context": {
    "level": 15,
    "xp": 5000,
    "streak": 7
  }
}
```

**Response:**
```json
{
  "response": "Based on your current level...",
  "conversation_id": "uuid"
}
```

### POST /api/checkout
Create Stripe checkout session

**Request:**
```json
{
  "tier": "pro"
}
```

**Response:**
```json
{
  "url": "https://checkout.stripe.com/..."
}
```

### POST /api/user-progress
Get user stats

**Response:**
```json
{
  "level": 15,
  "xp": 5000,
  "required_for_next": 2000,
  "streak": 7,
  "readiness": 65
}
```

### POST /api/webhooks/stripe
Stripe webhook handler (internal)

---

## Building for Production

### Build Command
```bash
npm run build
```

### Build Output
```
.next/
├── static/        # Static files
├── server/        # Server code
└── cache/         # Build cache
```

### Build Checks
- TypeScript compilation
- ESLint validation
- Next.js optimization
- Image optimization

---

## Deployment to Vercel

### Automatic Deployment (Recommended)

1. Push code to GitHub
2. Vercel automatically detects changes
3. Builds and deploys
4. Available at: pathforge-zeta.vercel.app

### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod

# Or link project first
vercel link
vercel deploy --prod
```

### Environment Variables on Vercel

1. Go to Vercel Dashboard
2. Select pathforge project
3. Settings → Environment Variables
4. Add all variables from `.env.local`:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_ROLE_KEY
   - OPENAI_API_KEY
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET

---

## Database Backups

### Supabase Cloud Backups
- Automatic daily backups (free tier)
- 7-day retention
- Manual backups available (paid)

### Manual Backup
```bash
# Export via Supabase Dashboard
# Settings → Backups → Download backup

# Or via SQL export
# SQL Editor → Download as CSV per table
```

---

## Monitoring & Logging

### Vercel Logs
```bash
vercel logs pathforge-zeta.vercel.app
```

### Supabase Logs
- Dashboard → Logs
- Real-time subscriptions
- Function execution
- Auth events

### Error Tracking
- Vercel error reports
- Browser console (development)
- Server logs

---

## Performance Optimization

### Image Optimization
- Use Next.js Image component
- Automatic format conversion
- Responsive sizing

### Code Splitting
- Automatic via Next.js
- Route-based code splitting
- Dynamic imports for heavy components

### Database Queries
- Use indexes on frequently queried columns
- Pagination for large result sets
- Caching at application level

---

## Scaling Considerations

### When to Scale

1. **Database**: Upgrade Supabase tier when:
   - > 5GB data
   - > 500k queries/month
   - Real-time subscribers > 100

2. **Backend**: Scale Node.js when:
   - > 10k concurrent users
   - API response time > 500ms

3. **Frontend**: Split bundles when:
   - Initial JS > 300KB
   - TTI > 3 seconds

### Scaling Strategy

1. **Database**: Upgrade Supabase to higher tier
2. **API**: Deploy to dedicated Node.js infrastructure
3. **CDN**: Use Vercel Edge Network (default)
4. **Caching**: Implement Redis layer

---

## Troubleshooting

### Build Errors

**Error: Cannot find module '@/components'**
- Check tsconfig.json paths
- Run `npm install`
- Clear `.next` cache: `rm -rf .next`

**Error: Tailwind CSS not working**
- Run `npm install`
- Check `tailwind.config.ts` syntax
- Clear `.next`: `npm run clean`

### Runtime Errors

**Error: 'Supabase credentials missing'**
- Check `.env.local` has Supabase keys
- Verify API URL format
- Check Supabase project is active

**Error: 'OpenAI API key invalid'**
- Verify key format starts with `sk-`
- Check key is not expired
- Ensure key has correct permissions

### Database Errors

**Error: 'RLS policy violation'**
- Check RLS policies in Supabase
- Verify user authentication token
- Check policy column matches user ID

**Error: 'Table does not exist'**
- Run migrations: `supabase db push`
- Verify seed data: `supabase seed`

---

## Development Workflow

### Feature Branch
```bash
git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature
# Create Pull Request on GitHub
```

### Testing Locally
```bash
npm run build  # Test production build
npm run dev    # Run dev server
```

### Code Quality
```bash
npm run lint   # Check TypeScript & ESLint
npm run format # Format with Prettier
```

---

## Security Best Practices

1. **Environment Variables**: Never commit `.env.local`
2. **API Keys**: Rotate OpenAI/Stripe keys regularly
3. **RLS Policies**: Always enable RLS on user tables
4. **HTTPS**: Use HTTPS in production
5. **CORS**: Configure CORS headers properly
6. **Validation**: Validate all user inputs (Zod)

---

## Support & Resources

- **Next.js Docs**: https://nextjs.org/docs
- **Supabase Docs**: https://supabase.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **OpenAI API**: https://platform.openai.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

*Last Updated: May 19, 2026*
