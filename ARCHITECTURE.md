# 🏗️ Amy's Haven - Complete Architecture Guide

**Last Updated**: February 22, 2026  
**Status**: ✅ Production-Ready

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Infrastructure Map](#infrastructure-map)
3. [Database (Supabase)](#database-supabase)
4. [Backend (Railway)](#backend-railway)
5. [Frontend (GitHub Pages)](#frontend-github-pages)
6. [Environment Variables](#environment-variables)
7. [How Everything Connects](#how-everything-connects)
8. [Local Development](#local-development)
9. [Deployment Process](#deployment-process)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 System Overview

Amy's Haven is a full-stack e-commerce marketplace with three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                      Amy's Haven Stack                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (GitHub Pages)                                     │
│  ├─ amyshaven.com                  - Customer site          │
│  └─ amyshaven.com/artist-cms       - Artist dashboard       │
│                                                              │
│  Backend (Railway)                                           │
│  └─ marketplace-production-336b.up.railway.app              │
│                                                              │
│  Database (Supabase)                                         │
│  └─ PostgreSQL + Storage + Auth                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗺️ Infrastructure Map

### Complete Data Flow

```
User Browser
    ↓
amyshaven.com (GitHub Pages - Static HTML/CSS/JS)
    ↓
marketplace-production-336b.up.railway.app (Node.js/Express API)
    ↓
hgzshxoshmsvwrrdgriv.supabase.co (PostgreSQL Database)
```

### Technology Stack

| Layer | Technology | Purpose | URL/Location |
|-------|-----------|---------|--------------|
| **Frontend** | HTML, CSS, JavaScript | Customer & Artist UI | https://amyshaven.com |
| **Backend** | Node.js, Express.js | REST API | https://marketplace-production-336b.up.railway.app |
| **Database** | PostgreSQL (Supabase) | Data storage | https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv |
| **Storage** | Supabase Storage | Image uploads | Same as database |
| **Auth** | JWT (custom) | Artist authentication | Backend handles |
| **Payments** | Stripe | Payment processing | Integrated in backend |
| **Email** | SendGrid (optional) | Automated onboarding | Backend sends |
| **Hosting - Frontend** | GitHub Pages | Static site hosting | Automatic from GitHub |
| **Hosting - Backend** | Railway | Node.js server hosting | Auto-deploy from GitHub |

---

## 🗄️ Database (Supabase)

### Connection Details

**Dashboard**: https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv  
**Project ID**: `hgzshxoshmsvwrrdgriv`  
**Region**: US West  
**Database Type**: PostgreSQL 15

### Environment Variables

```bash
SUPABASE_URL=https://hgzshxoshmsvwrrdgriv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=sb_secret_cv3oYo949xwOH1RZcxTzOA_042_p9kg
```

### Database Schema

```
📊 Tables (8):
├─ artists          - Artist accounts & profiles
├─ products         - Product listings
├─ categories       - Product categories (10 seeded)
├─ orders           - Customer orders
├─ order_items      - Individual order line items
├─ customers        - Customer accounts
├─ email_logs       - Email tracking (NEW)
└─ artist_analytics - Daily analytics (NEW)

📈 Views (2):
├─ product_stats          - Product sales statistics
└─ artist_dashboard_stats - Artist dashboard metrics
```

### Key Tables Structure

**artists**:
```sql
- id (UUID, PK)
- email (TEXT, UNIQUE)
- password_hash (TEXT)
- business_name (TEXT)
- bio (TEXT)
- location (TEXT)
- phone (TEXT)
- website_url (TEXT)
- profile_image_url (TEXT)
- is_verified (BOOLEAN)
- email_notifications (BOOLEAN) -- NEW
- onboarding_completed (BOOLEAN) -- NEW
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**products**:
```sql
- id (UUID, PK)
- artist_id (UUID, FK → artists)
- category_id (UUID, FK → categories)
- name (TEXT)
- description (TEXT)
- price (DECIMAL)
- stock_quantity (INTEGER)
- materials (TEXT)
- dimensions (TEXT)
- weight (DECIMAL)
- image_url (TEXT)
- thumbnail_url (TEXT)
- care_instructions (TEXT) -- NEW
- images (JSONB) -- NEW (array of image URLs)
- processing_time (TEXT) -- NEW
- shipping_cost (DECIMAL) -- NEW
- tags (TEXT[]) -- NEW
- sku (VARCHAR) -- NEW
- variants (JSONB) -- NEW
- approval_status (VARCHAR) -- NEW (pending/approved/rejected)
- is_active (BOOLEAN)
- is_featured (BOOLEAN)
- created_at (TIMESTAMPTZ)
- updated_at (TIMESTAMPTZ)
```

**email_logs** (NEW):
```sql
- id (UUID, PK)
- artist_id (UUID, FK → artists)
- email_type (VARCHAR) - welcome/first_product/first_sale/tips_day3
- recipient_email (TEXT)
- subject (TEXT)
- status (VARCHAR) - pending/sent/failed
- error_message (TEXT)
- sent_at (TIMESTAMPTZ)
- created_at (TIMESTAMPTZ)
```

### How to Access

**Via Supabase Dashboard**:
1. Go to https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv
2. Click "Table Editor" to view/edit data
3. Click "SQL Editor" to run custom queries

**Via Backend Code**:
```javascript
const { supabaseAdmin } = require('./config/supabase');

// Query example
const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('is_active', true);
```

### Important SQL Files

- `/backend/scripts/fix-database-schema.sql` - Latest schema updates (RUN THIS FIRST!)
- `/backend/scripts/supabase-clean-setup.sql` - Initial database setup
- `/backend/scripts/FIX-DATABASE-COPY-THIS.sql` - Corrected schema fix (USE THIS ONE!)

---

## 🚂 Backend (Railway)

### Deployment Details

**Dashboard**: https://railway.app/dashboard  
**Project**: hopeful-stillness  
**Service**: production  
**Public URL**: https://marketplace-production-336b.up.railway.app  
**Region**: US West  
**Auto-Deploy**: ✅ Enabled (deploys on `git push`)

### Environment Variables (Set in Railway)

```bash
NODE_ENV=production
PORT=3000  # Railway auto-provides this

# Database
SUPABASE_URL=https://hgzshxoshmsvwrrdgriv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=sb_secret_cv3oYo949xwOH1RZcxTzOA_042_p9kg

# Frontend
FRONTEND_URL=https://amyshaven.com

# Auth
JWT_SECRET=<generate_with_crypto.randomBytes(32).toString('hex')>
JWT_EXPIRES_IN=7d

# Stripe (optional, for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...

# Email (optional, for production emails)
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@amyshaven.com
```

### Backend File Structure

```
backend/
├─ config/
│  └─ supabase.js          - Supabase client configuration
├─ middleware/
│  ├─ auth.js              - JWT authentication middleware
│  └─ upload.js            - File upload handling
├─ routes/
│  ├─ artists.js           - Artist API endpoints
│  ├─ products.js          - Product API endpoints
│  ├─ categories.js        - Category API endpoints
│  ├─ orders.js            - Order API endpoints
│  ├─ upload.js            - File upload endpoints
│  └─ customers.js         - Customer API endpoints
├─ services/
│  ├─ emailService.js      - Automated email system (NEW!)
│  └─ supabaseStorage.js   - File storage utilities
├─ scripts/
│  ├─ fix-database-schema.sql       - Schema updates
│  └─ FIX-DATABASE-COPY-THIS.sql    - Corrected schema (USE THIS)
└─ server.js               - Main Express server

Key Features:
✅ Automated artist onboarding emails
✅ Product image uploads
✅ Order processing
✅ Stripe integration ready
✅ CORS configured for amyshaven.com
```

### API Endpoints

**Base URL**: `https://marketplace-production-336b.up.railway.app/api`

```
Public Endpoints:
GET  /api/health                    - Health check
GET  /api/categories                - List categories
GET  /api/products                  - List products (with filters)
GET  /api/products/featured         - Featured products
GET  /api/products/:id              - Single product
GET  /api/artists                   - List artists
GET  /api/artists/:id               - Single artist

Authentication:
POST /api/artists/register          - Register new artist
POST /api/artists/login             - Artist login

Protected (Artist Only - Requires JWT):
GET  /api/artists/me/profile        - Get own profile
PUT  /api/artists/me                - Update profile
GET  /api/artists/me/products       - Get own products
GET  /api/artists/me/stats          - Get statistics
POST /api/products                  - Create product
PUT  /api/products/:id              - Update product
DELETE /api/products/:id            - Delete product
```

### How to View Logs

1. Go to Railway dashboard
2. Click "production" service
3. Click "Deployments" tab
4. Click latest deployment
5. Click "View Logs"

Look for:
- `✅ Supabase connection initialized` - Database connected
- `📧 EMAIL (Development Mode - Not Sent)` - Email logs (dev mode)
- `✅ Email sent:` - Email logs (production mode)

### How to Redeploy

**Option 1: Git Push (Automatic)**
```bash
git add .
git commit -m "Update backend"
git push origin main
# Railway auto-deploys in ~2 minutes
```

**Option 2: Manual Redeploy**
1. Railway dashboard → production service
2. Click "Deploy" → "Redeploy"

---

## 🌐 Frontend (GitHub Pages)

### Deployment Details

**Repository**: https://github.com/sonnysteele23/MarketPlace  
**Branch**: `main`  
**Domain**: amyshaven.com  
**Hosting**: GitHub Pages (automatic)

### Frontend File Structure

```
frontend/
├─ css/                    - Stylesheets
├─ js/
│  ├─ main.js             - Main app logic (API_URL here!)
│  ├─ auth.js             - Authentication
│  ├─ cart.js             - Shopping cart
│  ├─ products.js         - Product display
│  └─ product-detail.js   - Product detail page
├─ images/                - Static images
├─ about.html             - About page
├─ products.html          - Product listing
├─ product-detail.html    - Product detail
├─ cart.html              - Shopping cart
└─ checkout.html          - Checkout flow

artist-cms/
├─ css/                   - Artist dashboard styles
├─ js/
│  ├─ dashboard.js        - Dashboard (API_URL here!)
│  ├─ add-product.js      - Product creation (API_URL here!)
│  ├─ my-products.js      - Product management (API_URL here!)
│  ├─ orders.js           - Order management (API_URL here!)
│  └─ profile.js          - Profile settings (API_URL here!)
├─ dashboard.html         - Main dashboard
├─ add-product.html       - Add product page
├─ my-products.html       - Products list
├─ orders.html            - Orders list
└─ profile.html           - Profile settings
```

### API Configuration in Frontend

**Location of API URLs**:

1. **Customer Frontend**: `/frontend/js/main.js`
```javascript
const AppState = {
    apiUrl: 'https://marketplace-production-336b.up.railway.app/api'
};
```

2. **Artist CMS**: All files have:
```javascript
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://marketplace-production-336b.up.railway.app/api';
```

Files with API_BASE_URL:
- `/artist-cms/js/dashboard.js`
- `/artist-cms/js/add-product.js`
- `/artist-cms/js/my-products.js`
- `/artist-cms/js/orders.js`
- `/artist-cms/js/profile.js`

### How to Deploy Frontend

```bash
git add .
git commit -m "Update frontend"
git push origin main
# GitHub Pages auto-deploys in ~1 minute
```

---

## 🔐 Environment Variables

### Complete Reference

**Location**: 
- Railway Dashboard → production service → Variables tab
- Local: `/MarketPlace/.env`

```bash
# ===================================
# Server Configuration
# ===================================
NODE_ENV=production
PORT=3000

# ===================================
# Database - Supabase
# ===================================
SUPABASE_URL=https://hgzshxoshmsvwrrdgriv.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnenNoeG9zaG1zdndycmRncml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDc3ODksImV4cCI6MjA4NTEyMzc4OX0.qO7YFmfmmZSAV4KOZ8qp17HHjSwjlvv2j-vJ1m5iH_w
SUPABASE_SERVICE_KEY=sb_secret_cv3oYo949xwOH1RZcxTzOA_042_p9kg

# ===================================
# Application URLs
# ===================================
FRONTEND_URL=https://amyshaven.com

# ===================================
# Authentication
# ===================================
JWT_SECRET=<generate_secure_random_string>
JWT_EXPIRES_IN=7d

# Generate secure JWT_SECRET:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ===================================
# Payment Processing (Stripe)
# ===================================
STRIPE_SECRET_KEY=sk_test_... (or sk_live_...)
STRIPE_PUBLISHABLE_KEY=pk_test_... (or pk_live_...)
STRIPE_WEBHOOK_SECRET=whsec_...

# ===================================
# Email Service (SendGrid)
# ===================================
SENDGRID_API_KEY=SG.xxx
FROM_EMAIL=noreply@amyshaven.com

# Sign up: https://signup.sendgrid.com
# Free tier: 100 emails/day
```

---

## 🔌 How Everything Connects

### Data Flow Examples

**Example 1: Customer Browses Products**
```
1. User visits amyshaven.com
2. Browser loads /frontend/products.html
3. JavaScript calls: GET https://marketplace-production-336b.up.railway.app/api/products
4. Railway backend queries Supabase: SELECT * FROM products WHERE is_active = true
5. Supabase returns data
6. Backend sends JSON to frontend
7. Frontend displays products
```

**Example 2: Artist Registers**
```
1. Artist visits amyshaven.com/artist-cms/dashboard.html
2. Clicks "Sign Up"
3. Submits form → POST https://marketplace-production-336b.up.railway.app/api/artists/register
4. Railway backend:
   a. Hashes password
   b. INSERT INTO artists (email, password_hash, business_name, ...)
   c. Generates JWT token
   d. Calls emailService.sendWelcomeEmail() ← NEW!
   e. Returns {artist, token}
5. Frontend stores token in localStorage
6. Redirects to dashboard
7. Email is sent (or logged in dev mode)
```

**Example 3: Artist Creates Product**
```
1. Artist in CMS clicks "Add Product"
2. Fills form, uploads image
3. POST https://marketplace-production-336b.up.railway.app/api/products
4. Railway backend:
   a. Verifies JWT token
   b. Uploads image to Supabase Storage (optional)
   c. INSERT INTO products (artist_id, name, price, ...)
   d. Checks if first product → sends email if so ← NEW!
   e. Returns new product
5. Frontend shows success, redirects to My Products
```

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. POST /api/artists/login {email, password}
       ↓
┌─────────────┐
│   Railway   │
│   Backend   │
└──────┬──────┘
       │ 2. SELECT * FROM artists WHERE email = ?
       ↓
┌─────────────┐
│  Supabase   │
│  Database   │
└──────┬──────┘
       │ 3. Returns artist data
       ↓
┌─────────────┐
│   Railway   │ 4. Compares password hash
│   Backend   │ 5. Generates JWT token
└──────┬──────┘
       │ 6. Returns {artist, token}
       ↓
┌─────────────┐
│   Browser   │ 7. Stores token in localStorage
└─────────────┘ 8. Includes in future requests:
                   Authorization: Bearer <token>
```

---

## 💻 Local Development

### Prerequisites

```bash
# Install Node.js (v18+)
node --version

# Install dependencies
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
npm install
```

### Running Locally

**Backend**:
```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
npm run dev

# Server starts at http://localhost:3000
# API available at http://localhost:3000/api
```

**Frontend**:
```bash
# Option 1: Open directly in browser
open frontend/products.html

# Option 2: Use a local server
npx http-server . -p 8080
# Then visit http://localhost:8080/frontend/products.html
```

### Testing API Locally

```bash
# Health check
curl http://localhost:3000/api/health

# Get categories
curl http://localhost:3000/api/categories

# Get products
curl http://localhost:3000/api/products

# Register artist
curl -X POST http://localhost:3000/api/artists/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "business_name": "Test Artisan",
    "bio": "Creating beautiful things",
    "location": "Seattle, WA"
  }'
```

### Local vs Production

| Aspect | Local | Production |
|--------|-------|------------|
| Backend URL | http://localhost:3000 | https://marketplace-production-336b.up.railway.app |
| Frontend URL | http://localhost:8080 | https://amyshaven.com |
| Database | Same Supabase (shared) | Same Supabase (shared) |
| Emails | Logged to console | Sent via SendGrid (if configured) |
| Files | Saved to /public/uploads | Uploaded to Supabase Storage |

---

## 🚀 Deployment Process

### Step-by-Step Deployment

**1. Make Code Changes**
```bash
# Edit files locally
code backend/routes/products.js
```

**2. Test Locally**
```bash
npm run dev
# Test at http://localhost:3000
```

**3. Commit & Push**
```bash
git add .
git commit -m "Add new feature"
git push origin main
```

**4. Automatic Deployments**
- **Railway**: Auto-deploys backend (~2 minutes)
- **GitHub Pages**: Auto-deploys frontend (~1 minute)

**5. Verify Deployment**
```bash
# Test backend
curl https://marketplace-production-336b.up.railway.app/api/health

# Test frontend
open https://amyshaven.com
```

### Deployment Checklist

Before deploying major changes:

- [ ] Test locally first
- [ ] Run database migrations if needed
- [ ] Update environment variables if changed
- [ ] Check Railway logs for errors
- [ ] Test on production site
- [ ] Verify emails are working (check Railway logs)

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**Issue: "Failed to fetch" or CORS errors**
```
Problem: Frontend can't connect to backend
Solution: 
1. Check Railway URL is correct in frontend files
2. Verify Railway backend is running (check logs)
3. Confirm CORS is configured for amyshaven.com in server.js
```

**Issue: "Column does not exist" database errors**
```
Problem: Database schema is outdated
Solution:
1. Run: backend/scripts/FIX-DATABASE-COPY-THIS.sql in Supabase
2. Redeploy Railway backend
```

**Issue: "Invalid token" errors**
```
Problem: JWT token expired or invalid
Solution:
1. Clear localStorage in browser
2. Login again
3. Verify JWT_SECRET is set in Railway env vars
```

**Issue: Emails not sending**
```
Problem: No email service configured
Solution:
Development: Emails logged to Railway console (check logs)
Production: Set SENDGRID_API_KEY in Railway env vars
```

**Issue: Images not uploading**
```
Problem: Upload endpoint or storage not configured
Solution:
1. Check Supabase Storage buckets exist
2. Verify upload middleware in backend/middleware/upload.js
3. Check file size limits (max 5MB)
```

### Useful Commands

```bash
# View Railway logs
railway logs

# Test database connection
node backend/test-connection.js

# Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check Node version
node --version

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Quick Reference

### Important URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Production Site** | https://amyshaven.com | Live customer site |
| **Artist CMS** | https://amyshaven.com/artist-cms/dashboard.html | Artist dashboard |
| **API Backend** | https://marketplace-production-336b.up.railway.app | REST API |
| **Railway Dashboard** | https://railway.app/dashboard | Backend hosting |
| **Supabase Dashboard** | https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv | Database management |
| **GitHub Repo** | https://github.com/sonnysteele23/MarketPlace | Source code |

### Key Credentials Locations

- **Railway Env Vars**: Railway Dashboard → Variables tab
- **Supabase Keys**: Supabase Dashboard → Settings → API
- **Local Env**: `/MarketPlace/.env`
- **Git Repo**: GitHub → sonnysteele23/MarketPlace

### Support Resources

- **Railway Docs**: https://docs.railway.app
- **Supabase Docs**: https://supabase.com/docs
- **Node.js Docs**: https://nodejs.org/docs
- **Express.js Docs**: https://expressjs.com

---

## 🎉 Summary

Your Amy's Haven platform is a modern, production-ready e-commerce marketplace with:

✅ **Frontend**: Static HTML/CSS/JS hosted on GitHub Pages  
✅ **Backend**: Node.js/Express API hosted on Railway  
✅ **Database**: PostgreSQL managed by Supabase  
✅ **Features**: Product management, orders, automated emails, payments  
✅ **Deployment**: Fully automated via git push  

**Everything is connected and working!** 🚀

---

**Last Updated**: February 22, 2026  
**Maintained By**: Sonny Steele  
**Version**: 1.0.0
