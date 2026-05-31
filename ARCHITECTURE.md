# PathForge - Architecture Documentation

Complete technical architecture and component relationships.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                      │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Next.js React Components                 │   │
│  │  (Button, Card, Input, Pages, Layouts)          │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓
                     HTTP/HTTPS
                           ↓
┌─────────────────────────────────────────────────────────┐
│            Vercel Edge Network & Deployment             │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Next.js App Router & API Routes           │   │
│  │  ├─ Page rendering (SSG/SSR)                    │   │
│  │  ├─ API endpoints (/api/*)                      │   │
│  │  └─ Middleware (authentication)                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
        ↓                    ↓                    ↓
   Supabase          OpenAI API          PayMongo API
   (Database)      (AI Mentor)          (GCash + Maya)
```

---

## Data Flow

### Authentication Flow
```
User Input (Email/Password)
         ↓
Zod Validation (SignUpSchema)
         ↓
Supabase Auth Service
         ↓
JWT Token Generated
         ↓
localStorage.setItem('token')
         ↓
Protected Routes Check Token
         ↓
Access Granted/Denied
```

### Quest Completion Flow
```
User Clicks "Complete Quest"
         ↓
POST /api/user-progress (quest_id, proof_url)
         ↓
Update user_quests table
         ↓
Calculate XP reward
         ↓
Update profiles.xp
         ↓
Calculate new level
         ↓
Check for achievements
         ↓
Response with new stats
```

### AI Mentor Flow
```
User Types Message
         ↓
POST /api/ai-mentor (message, context)
         ↓
Format Context (level, xp, streak, etc.)
         ↓
Call OpenAI API (GPT-3.5-turbo)
         ↓
Stream Response
         ↓
Save to ai_messages table
         ↓
Update conversation history
         ↓
Display in Chat UI
```

---

## Component Hierarchy

```
RootLayout
  └─ dark mode provider
     └─ children

PublicLayout (Landing Page)
  ├─ Navigation
  ├─ HeroSection
  ├─ FeatureGrid
  ├─ StatsSection
  ├─ PricingCards
  ├─ CTASection
  └─ Footer

AppLayout (Protected)
  ├─ Sidebar Navigation
  ├─ Main Content
  │  ├─ Dashboard
  │  │  ├─ LevelCard
  │  │  ├─ StreakCard
  │  │  ├─ ReadinessScore
  │  │  └─ QuickActions
  │  ├─ Quests
  │  │  ├─ QuestList
  │  │  └─ QuestDetail
  │  ├─ Mentor
  │  │  ├─ ChatHistory
  │  │  ├─ ChatMessage
  │  │  └─ ChatInput
  │  ├─ Portfolio
  │  │  ├─ ProjectList
  │  │  └─ ProjectForm
  │  ├─ Settings
  │  └─ Other Pages
  └─ User Menu

AuthLayout (Login/Signup)
  ├─ Logo
  ├─ Form
  ├─ AuthButton
  └─ Links
```

---

## State Management

### Global State (Zustand)
```typescript
// stores/userStore.ts
{
  user: {
    id: string
    email: string
    username: string
    level: number
    xp: number
    streak: number
  }
  setUser(user)
  updateXP(amount)
  levelUp()
}
```

### Local State (React hooks)
- Form inputs
- Loading states
- UI toggles
- Modal visibility

### Server State (Supabase)
- Database queries (profiles, quests, projects)
- Real-time subscriptions
- Authentication

---

## API Routes

### GET /api/user-progress
Returns user current stats

**Response:**
```json
{
  "level": 15,
  "xp": 5000,
  "required_for_next": 2000,
  "progress_percent": 60,
  "streak": 7,
  "readiness_score": 65,
  "achievements": [...]
}
```

### POST /api/ai-mentor
Send message to AI mentor

**Request:**
```json
{
  "message": "string",
  "context": {
    "level": number,
    "xp": number,
    "streak": number,
    "readiness": number
  }
}
```

**Response:**
```json
{
  "response": "string",
  "conversation_id": "uuid",
  "timestamp": "ISO8601"
}
```

### POST /api/paymongo/create-source
Create a PayMongo Source (GCash or Maya hosted checkout)

**Request:**
```json
{
  "tier": "pro" | "family",
  "method": "gcash" | "paymaya"
}
```

**Response:**
```json
{
  "checkoutUrl": "string",
  "paymentRequestId": "string"
}
```

### POST /api/paymongo/webhook
Handle PayMongo signed events

**Handled Events:**
- `source.chargeable` — capture the source by creating a Payment
- `payment.paid` — mark approved, upgrade `profiles.subscription_tier`
- `payment.failed` — mark rejected

Signature verified via HMAC-SHA256 of `${ts}.${rawBody}` with 5-minute
replay window.

---

## Database Schema

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY (auth.users.id),
  email TEXT UNIQUE,
  username TEXT UNIQUE,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

### user_career_paths
```sql
CREATE TABLE user_career_paths (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  career_path_id UUID REFERENCES career_paths(id),
  current_skill_level TEXT,
  target_salary_min INTEGER,
  target_salary_max INTEGER,
  target_timeline_months INTEGER,
  weekly_availability_hours INTEGER,
  primary_goal TEXT,
  created_at TIMESTAMP DEFAULT now()
);
```

### user_quests
```sql
CREATE TABLE user_quests (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  quest_id UUID REFERENCES quests(id),
  status TEXT DEFAULT 'active',
  proof_url TEXT,
  proof_notes TEXT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
```

### ai_messages
```sql
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  conversation_id UUID,
  role TEXT, -- 'user' or 'assistant'
  message TEXT,
  context JSONB,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## Security Architecture

### Authentication
- Supabase Auth with JWT tokens
- Token stored in localStorage
- Automatic token refresh
- Session validation on protected routes

### Authorization
- Row Level Security (RLS) on all user tables
- Policies enforce user isolation
- Server-side validation on all API routes
- Zod schema validation

### Data Protection
- HTTPS everywhere
- CORS configured properly
- Sensitive env vars not exposed to client
- API keys stored on server only
- PayMongo handles all wallet/card PCI scope — we never see PINs or card details

---

## Error Handling

### Client-Side
```typescript
try {
  const data = SignUpSchema.parse(input)
  const result = await signUp(data)
} catch (error) {
  if (error instanceof z.ZodError) {
    // Validation error
    setError(error.message)
  } else if (error instanceof Error) {
    // API or auth error
    toast.error(error.message)
  }
}
```

### Server-Side
```typescript
export async function POST(request: Request) {
  try {
    const data = await request.json()
    const validated = schema.parse(data)
    const result = await doSomething(validated)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 400 }
    )
  }
}
```

---

## Performance Optimizations

### Frontend
- Code splitting per route
- Image optimization (Next.js Image)
- CSS-in-JS optimization (Tailwind)
- Font optimization (system fonts)
- Dynamic imports for heavy components

### Backend
- Database indexing on frequently queried columns
- Query pagination (limit/offset)
- Response compression (Vercel)
- Edge caching for static content

### Caching Strategy
- Static pages: CDN (365 days)
- User data: No cache (real-time)
- API responses: 60 seconds (Cache-Control)
- Browser cache: Automatic via headers

---

## Deployment Pipeline

```
Local Development
         ↓
git push origin main
         ↓
GitHub receives push
         ↓
Vercel webhook triggered
         ↓
Vercel clones repository
         ↓
Install dependencies (npm ci)
         ↓
Run build (next build)
         ↓
Run type check (TypeScript)
         ↓
Generate static pages
         ↓
Create deployment bundle
         ↓
Upload to Vercel Edge Network
         ↓
Run tests (optional)
         ↓
Deploy to production
         ↓
Update DNS alias
         ↓
Available at pathforge-zeta.vercel.app
```

---

## Scaling Architecture

### Current (MVP)
- Single Supabase instance
- Vercel serverless functions
- Global CDN
- Direct database queries

### Phase 2 (1k users)
- Supabase upgrade (higher tier)
- Redis caching layer
- API rate limiting
- Database query optimization

### Phase 3 (10k users)
- Microservices (separate AI, checkout, analytics)
- Message queue (Redis/Bull)
- Database replication
- Dedicated servers for heavy jobs

### Phase 4 (100k+ users)
- Distributed architecture
- Load balancing
- Database sharding
- CDN optimization
- Separate read/write databases

---

## Technology Choices

### Why Next.js?
- Unified frontend/backend
- Automatic code splitting
- Built-in optimization
- Edge functions support
- Great TypeScript support

### Why Supabase?
- PostgreSQL reliability
- Built-in auth & RLS
- Real-time subscriptions
- Easy to self-host if needed
- Vector support for future AI features

### Why Tailwind CSS?
- Utility-first approach
- Dark mode support
- Responsive design
- Performance
- Easy customization

### Why OpenAI API?
- State-of-the-art language model
- Easy integration
- Affordable pricing
- Good context handling
- Continuous improvements

---

## Integration Points

### External Services
1. **Supabase**: PostgreSQL database, auth, storage
2. **OpenAI**: gpt-4o + omni-moderation for AI mentor (kid-safe)
3. **PayMongo**: Automated GCash + Maya payments (hosted checkout + webhooks)
4. **Resend**: Transactional email (weekly parent reports, payment notifications)
5. **Vercel**: Hosting, serverless functions, cron jobs
6. **GitHub**: Version control

### Webhook Endpoints
- `/api/paymongo/webhook` — PayMongo `source.chargeable`, `payment.paid`,
  `payment.failed` (signed; auto-upgrades tier on payment.paid)
- `/api/cron/reengagement` — daily re-engagement emails (Vercel Cron)
- `/api/cron/weekly-progress` — Sunday parent progress digest (Vercel Cron)

### SDKs Used
- `@supabase/supabase-js` + `@supabase/ssr` — Database & auth
- `openai` — AI API
- `resend` — Transactional email
- `zod` — Validation
- `framer-motion` — Animations
- `recharts` — Charts

(Payments use the PayMongo REST API directly via fetch — no SDK.)

---

## Development Workflows

### Adding a Feature
1. Create feature branch
2. Add route/API endpoint
3. Create component
4. Connect to database
5. Add validation (Zod)
6. Test locally
7. Deploy to Vercel
8. Verify production

### Adding a Page
1. Create directory in `app/(app)/`
2. Add `page.tsx`
3. Add to navigation
4. Style with Tailwind
5. Add TypeScript types
6. Test responsive design

### Adding an API Route
1. Create route in `app/api/`
2. Export POST/GET/etc
3. Add validation (Zod)
4. Implement logic
5. Add error handling
6. Test with curl/Postman
7. Add to API documentation

---

## Monitoring & Observability

### Vercel Analytics
- Web Vitals (FCP, LCP, CLS)
- Request count & duration
- Error rates
- User sessions

### Supabase Metrics
- Query performance
- Real-time connections
- Auth events
- Storage usage

### Custom Logging
- Console logs (dev)
- Error tracking (production)
- User events (analytics)

---

*Last Updated: May 19, 2026*
