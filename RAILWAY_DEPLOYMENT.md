# 🚂 Railway Deployment Guide - Amy's Haven

Complete guide to deploy Amy's Haven backend to Railway.app

## Why Railway?

- ✅ **Auto-deploys from GitHub** - Push code → Instant deployment
- ✅ **Free $5/month** - Enough for development/early stage
- ✅ **PostgreSQL included** - We're already using Supabase, but Railway can host the backend
- ✅ **Zero config needed** - Railway auto-detects Node.js
- ✅ **Custom domains** - amyshaven.com/api
- ✅ **Environment variables** - Secure secrets management

---

## Step 1: Sign Up for Railway

1. Go to [railway.app](https://railway.app)
2. Click "Login" → "Login with GitHub"
3. Authorize Railway to access your GitHub account
4. You get **$5/month free credit** (enough for ~500 hours of service)

---

## Step 2: Create New Project

1. Click "+ New Project"
2. Select "Deploy from GitHub repo"
3. Choose your repository: `MarketPlace`
4. Railway will auto-detect: ✅ Node.js project

---

## Step 3: Configure Environment Variables

In Railway dashboard → Your Project → Variables tab:

### Copy these from your `.env` file:

```bash
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://hgzshxoshmsvwrrdgriv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=sb_secret_cv3oYo949xwOH1RZcxTzOA_042_p9kg

# Frontend URL
FRONTEND_URL=https://amyshaven.com

# Authentication
JWT_SECRET=<GENERATE_NEW_SECURE_KEY>
JWT_EXPIRES_IN=7d

# Stripe (get from dashboard.stripe.com)
STRIPE_SECRET_KEY=sk_live_your_live_key_here
STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key_here

# Email (SendGrid recommended)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@amyshaven.com
```

### 🔐 Generate Secure JWT_SECRET

Run this in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste as `JWT_SECRET` in Railway.

---

## Step 4: Deploy

Railway will automatically:
1. Install dependencies (`npm install`)
2. Run your start command (`node backend/server.js`)
3. Provide a public URL: `https://yourapp.up.railway.app`

**First deployment takes ~2-3 minutes**

---

## Step 5: Get Your Backend URL

After deployment:
1. Go to Settings tab
2. Under "Networking" → Click "Generate Domain"
3. You'll get: `https://amyshaven-backend.up.railway.app`

**This is your API URL!**

---

## Step 6: Update Frontend to Use Railway Backend

### Update all API calls in your frontend:

#### Before (Local):
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

#### After (Production):
```javascript
const API_BASE_URL = 'https://amyshaven-backend.up.railway.app/api';
```

### Files to update:
- `/frontend/js/api.js` (or wherever your API calls are)
- `/artist-cms/js/api.js`

---

## Step 7: Custom Domain (Optional)

### Add amyshaven.com/api

1. Railway Settings → Networking → Custom Domain
2. Add: `api.amyshaven.com`
3. Go to GoDaddy DNS settings:
   - Add CNAME record:
     - Name: `api`
     - Value: `amyshaven-backend.up.railway.app`
     - TTL: 600

Wait 5-10 minutes for DNS propagation.

Now your API is at: `https://api.amyshaven.com`

---

## Step 8: Test Your Deployment

### Test Health Check:
```bash
curl https://amyshaven-backend.up.railway.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-22T...",
  "uptime": 123.45
}
```

### Test Categories:
```bash
curl https://amyshaven-backend.up.railway.app/api/categories
```

Should return your 10 product categories.

---

## Step 9: Run Database Schema Fix

In Railway dashboard:
1. Click "Deploy" tab
2. Click "Deployments" → Latest deployment
3. Click "View Logs"
4. Verify server started successfully

Then run the database fix script:

### Option A: Run in Supabase SQL Editor
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv/sql)
2. Click "New Query"
3. Paste contents of `/backend/scripts/fix-database-schema.sql`
4. Click "Run"

### Option B: Run from your computer
```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace/backend
node -e "
const { supabaseAdmin } = require('./config/supabase');
const fs = require('fs');
const sql = fs.readFileSync('./scripts/fix-database-schema.sql', 'utf8');
console.log('Run this SQL in Supabase Dashboard');
console.log(sql);
"
```

---

## Step 10: Enable Auto-Deploys

Railway is already watching your GitHub repo!

**Every time you push to main:**
```bash
git add .
git commit -m "Update backend"
git push origin main
```

Railway will automatically:
1. Pull latest code
2. Install dependencies
3. Deploy new version
4. Zero downtime! 🎉

---

## Monitoring & Logs

### View Logs:
Railway Dashboard → Deployments → Click on latest deployment → View Logs

### Check Metrics:
Railway Dashboard → Metrics tab
- CPU usage
- Memory usage
- Network traffic
- Response times

---

## Troubleshooting

### "Port already in use" error
✅ Railway automatically provides `PORT` env var - your app already uses `process.env.PORT || 5000`

### "Cannot find module" error
✅ Check `package.json` has all dependencies
✅ Run `npm install` locally to verify

### "Database connection failed"
✅ Verify Supabase environment variables are set correctly
✅ Check Supabase project is active

### "CORS error" from frontend
✅ Add Railway URL to allowed origins in `server.js`:
```javascript
const allowedOrigins = [
    'https://amyshaven.com',
    'https://amyshaven-backend.up.railway.app',
    // ... other origins
];
```

---

## Cost Estimate

### Railway Pricing:
- **Free Tier**: $5/month credit
- **Hobby Plan**: $5/month for extra resources
- **Estimated Usage**: ~$2-3/month for backend

### With Traffic:
- 10,000 visitors/month = ~$3-5/month
- 50,000 visitors/month = ~$8-12/month

**Railway is very cost-effective for startups!**

---

## Security Checklist

Before going live:

- [ ] Changed `JWT_SECRET` to secure random string
- [ ] Using production Stripe keys (not test keys)
- [ ] SendGrid API key configured for emails
- [ ] `NODE_ENV=production` set
- [ ] HTTPS enabled (automatic with Railway)
- [ ] CORS configured for amyshaven.com only
- [ ] Rate limiting enabled (already in server.js)
- [ ] Database fix script executed

---

## What's Next?

After Railway deployment:

1. **Update Frontend API URLs** - Point to Railway backend
2. **Test Full Flow**:
   - Artist registration
   - Product creation
   - Image uploads
   - Order placement
   - Email notifications

3. **Set up Monitoring**:
   - [Sentry.io](https://sentry.io) for error tracking (free tier)
   - [UptimeRobot](https://uptimerobot.com) for uptime monitoring (free)

4. **Automated Emails**:
   - Sign up for SendGrid (free 100 emails/day)
   - Configure automated artist onboarding emails

---

## Quick Reference

### Railway Commands (from Dashboard)

**Redeploy**: Click "Deploy" → "Redeploy"
**Restart**: Settings → "Restart"
**View Logs**: Deployments → Click deployment → "View Logs"
**Environment Variables**: Variables tab

### Important URLs

- **Railway Dashboard**: https://railway.app/dashboard
- **Supabase Dashboard**: https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv
- **Your Backend**: https://amyshaven-backend.up.railway.app
- **Your Frontend**: https://amyshaven.com

---

## Success! 🎉

Your backend is now deployed on Railway with:
- ✅ Auto-deploys from GitHub
- ✅ Supabase PostgreSQL database
- ✅ Automated artist onboarding emails
- ✅ Stripe payment processing ready
- ✅ HTTPS enabled
- ✅ Professional backend infrastructure

**Next**: Update frontend to use new Railway backend URL and test the full flow!

---

**Questions?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- This project's tech stack: See `TECH_STACK.md`
