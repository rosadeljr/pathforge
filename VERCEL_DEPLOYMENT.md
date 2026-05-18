# Deploy PathForge to Vercel - Step-by-Step Guide

## Prerequisites
- GitHub account (https://github.com)
- Vercel account (sign up with GitHub at https://vercel.com)
- OpenAI API key (optional but recommended)
- Stripe account (optional but for payments)

## Step 1: Push Code to GitHub

### Option A: Using GitHub Desktop (Easiest)

1. Download GitHub Desktop: https://desktop.github.com
2. Open GitHub Desktop
3. Click "File" > "Clone Repository"
4. Go to your GitHub profile > New Repository
5. Create new repo named `pathforge`
6. Clone it to your computer
7. Copy all files from C:\Users\RJ Reyes\pathforge to the cloned folder
8. Open the folder in GitHub Desktop
9. Add a summary: "Initial commit - PathForge MVP"
10. Click "Commit to main"
11. Click "Publish branch"

### Option B: Using Git Command Line

```powershell
# Create GitHub repo at https://github.com/new
# Name it: pathforge
# Then run:

cd C:\Users\RJ Reyes\pathforge
git remote add origin https://github.com/YOUR_USERNAME/pathforge.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" (or "Log In" if you have account)
3. Click "Continue with GitHub"
4. Authorize Vercel to access your GitHub
5. Click "New Project"
6. Find and select `pathforge` repository
7. Click "Import"

### Configure Environment Variables

In the Vercel dashboard, add these environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://qxwvenzrwpldxsuiorzf.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3Zlbnpyd3BsZHhzdWlvcnpmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDkzMDUsImV4cCI6MjA5NDY4NTMwNX0.7x61KsL5s7CSF5zSELpvlSNE_kUeyM-AWeYT6Rf_fNA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3Zlbnpyd3BsZHhzdWlvcnpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTEwOTMwNSwiZXhwIjoyMDk0Njg1MzA1fQ.DLelwnkn2S_tsTTfSGaUGOZOSjAGjhm6rRyEXzXmnS4
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
AI_PROVIDER=openai
OPENAI_API_KEY=sk_your_openai_key_here
STRIPE_SECRET_KEY=sk_test_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

8. Click "Deploy"

## Step 3: Update Your App URL

After deployment:

1. Vercel shows your project URL (e.g., pathforge-xyz.vercel.app)
2. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
3. Go to Vercel Settings > Environment Variables
4. Update the value and redeploy

## Step 4: Add OpenAI API Key (Optional)

1. Get key at https://platform.openai.com/api-keys
2. Create new API key
3. Copy the key
4. In Vercel dashboard: Settings > Environment Variables
5. Add: `OPENAI_API_KEY=sk_...`
6. Redeploy

Now your AI Mentor will have real OpenAI responses!

## Step 5: Setup Stripe (Optional for Payments)

1. Create Stripe account at https://stripe.com
2. Get your API keys: https://dashboard.stripe.com/apikeys
3. Copy:
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Setup webhook: https://dashboard.stripe.com/webhooks
   - Endpoint: `https://your-domain.vercel.app/api/webhooks/stripe`
   - Events: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copy webhook secret → `STRIPE_WEBHOOK_SECRET`
5. Add all to Vercel environment variables
6. Redeploy

## Step 6: Test on Production

1. Visit: https://your-project.vercel.app
2. Create account
3. Go through onboarding
4. Complete a quest
5. Check AI Mentor (if OpenAI key added)
6. Check Pricing page (if Stripe added)

## Troubleshooting

### "Build failed"
- Check build logs in Vercel dashboard
- Usually means missing dependency or TypeScript error
- Go to Settings > Build & Development > Redeploy

### "Cannot connect to Supabase"
- Verify NEXT_PUBLIC_SUPABASE_URL is correct
- Check SUPABASE_SERVICE_ROLE_KEY is pasted exactly
- Test connection in Supabase dashboard

### "AI Mentor not working"
- Check OPENAI_API_KEY is set
- Verify API key has correct permissions
- Check Vercel logs for errors

### "Payment button not working"
- Verify STRIPE_SECRET_KEY is set
- Check webhook is configured correctly
- Test in Stripe test mode first

## Automatic Deployments

After pushing to GitHub:
- Every push to `main` branch = automatic deployment
- Vercel shows deployment status
- You can roll back to previous version anytime

## Monitor Production

In Vercel Dashboard:
- **Analytics** - See traffic and performance
- **Deployments** - View each deployment
- **Logs** - See real-time logs
- **Settings** - Manage environment and build config

## Custom Domain

To use custom domain:
1. In Vercel: Settings > Domains
2. Add your domain
3. Update DNS records (Vercel shows exact steps)
4. Update `NEXT_PUBLIC_APP_URL` to your domain

## You're Live! 🚀

Your PathForge is now:
- Live on the internet
- Automatically deployed on every GitHub push
- Monitored and scaled by Vercel
- Connected to your Supabase database
- Ready for users!
