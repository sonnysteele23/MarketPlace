# Washington Artisan Marketplace - Deployment Guide

## Quick Deploy to Railway

### Step 1: Push Latest Code to GitHub
```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Deploy to Railway

1. **Go to Railway**: https://railway.app
2. **Sign in** with your GitHub account
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose **MarketPlace** repository
6. Railway will auto-detect it's a Node.js app

### Step 3: Add Environment Variables

In Railway dashboard, go to your project → **Variables** tab → Add these:

```
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://hgzshxoshmsvwrrdgriv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnenNoeG9zaG1zdndycmRncml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDc3ODksImV4cCI6MjA4NTEyMzc4OX0.qO7YFmfmmZSAV4KOZ8qp17HHjSwjlvv2j-vJ1m5iH_w
SUPABASE_SERVICE_KEY=sb_secret_cv3oYo949xwOH1RZcxTzOA_042_p9kg
JWT_SECRET=your_secure_random_string_here_make_it_long
FRONTEND_URL=https://sonnysteele23.github.io
```

**Important**: Generate a secure JWT_SECRET with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Get Your Railway URL

After deployment:
1. Go to **Settings** → **Networking** → **Generate Domain**
2. Copy the URL (e.g., `marketplace-production-xxxx.up.railway.app`)

### Step 5: Update Frontend

Edit `frontend/js/auth.js` and replace `YOUR-RAILWAY-URL`:

```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://YOUR-ACTUAL-RAILWAY-URL.up.railway.app/api';
```

Then push the change:
```bash
git add .
git commit -m "Update API URL for production"
git push origin main
```

### Step 6: Test It!

Go to: https://sonnysteele23.github.io/MarketPlace/frontend/register.html

Registration should now work! 🎉
