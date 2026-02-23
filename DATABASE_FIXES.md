# 🔧 Database & Backend Fixes - Complete Guide

**Date**: February 22, 2026  
**Status**: ✅ All fixes implemented and ready to apply

---

## What We Fixed

### 1. **Database Schema Issues** ✅
Added missing columns that frontend/backend were expecting:
- `care_instructions` - Product care information
- `images` - Array of product images (JSONB)
- `processing_time` - How long to make the product
- `shipping_cost` - Shipping fee per product
- `tags` - Product tags for search
- `sku` - Stock Keeping Unit for inventory
- `variants` - Product variants (sizes, colors, etc.)

### 2. **Product Approval System** ✅
- `approval_status` - pending/approved/rejected
- `approval_notes` - Admin notes
- `approved_at` - Timestamp
- `reviewed_by` - Who approved it

### 3. **Artist Email System** ✅
- `email_verified` - Email verification status
- `email_notifications` - Receive notifications?
- `onboarding_completed` - Finished setup?
- `onboarding_step` - Current step (1-5)

### 4. **Email Logging** ✅
New `email_logs` table tracks all sent emails:
- Welcome emails
- First product emails
- First sale emails
- Tips & guidance emails

### 5. **Artist Analytics** ✅
New `artist_analytics` table for dashboard stats:
- Daily product views
- Profile views
- Sales metrics
- Order counts

### 6. **Automated Email Onboarding** ✅
Artists now receive:
- **Welcome email** - Immediately upon registration
- **First product email** - When they list first product
- **Day 3 tips** - 3 days after joining
- **First sale celebration** - When they make first sale

---

## How to Apply Fixes

### Option 1: Run Setup Script (Recommended)

```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
chmod +x setup-and-fix.sh
./setup-and-fix.sh
```

This script will:
1. ✅ Install all dependencies
2. ✅ Check environment variables
3. ✅ Test database connection  
4. ✅ Guide you through SQL fix
5. ✅ Generate secure JWT secret
6. ✅ Start development server

### Option 2: Manual Steps

#### Step 1: Run Database Fix

1. Open Supabase SQL Editor:
   https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv/sql/new

2. Copy contents of `backend/scripts/fix-database-schema.sql`

3. Paste and click "Run"

4. You should see:
   ```
   Database schema fix completed successfully!
   New columns added: care_instructions, images, processing_time, shipping_cost, tags, sku, variants
   Tables created: email_logs, artist_analytics
   Views created: product_stats, artist_dashboard_stats
   All products approved and given SKUs
   ```

#### Step 2: Install Dependencies

```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
npm install
```

#### Step 3: Test Backend

```bash
npm run dev
```

Visit http://localhost:3000/api/health

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-02-22T...",
  "uptime": 123.45
}
```

---

## Testing the Fixes

### Test 1: Artist Registration with Email

```bash
curl -X POST http://localhost:3000/api/artists/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "business_name": "Test Artisan",
    "bio": "Creating beautiful handmade items",
    "location": "Seattle, WA"
  }'
```

✅ **Expected**: Artist created + welcome email logged to console

### Test 2: Product Creation with First Product Email

```bash
# First login to get token
TOKEN="your_jwt_token_from_registration"

curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Handmade Pottery Bowl",
    "description": "Beautiful blue ceramic bowl",
    "category_id": "category_uuid_here",
    "price": 45.00,
    "stock_quantity": 5,
    "materials": "Ceramic, glaze",
    "dimensions": "6 inch diameter",
    "weight": 0.5,
    "processing_time": "3-5 business days",
    "shipping_cost": 8.50,
    "care_instructions": "Hand wash only"
  }'
```

✅ **Expected**: Product created + first product email logged to console

### Test 3: Check Email Logs

```bash
# View recent emails in database
# Run in Supabase SQL Editor:
SELECT * FROM email_logs ORDER BY created_at DESC LIMIT 10;
```

---

## Email Service Setup (Optional but Recommended)

### Production Email Setup:

1. **Sign up for SendGrid** (free 100 emails/day):
   https://signup.sendgrid.com

2. **Create API Key**:
   - Dashboard → Settings → API Keys
   - Create API Key → "Full Access"
   - Copy the key (you'll only see it once!)

3. **Update .env**:
   ```bash
   SENDGRID_API_KEY=SG.your_actual_api_key_here
   FROM_EMAIL=noreply@amyshaven.com
   ```

4. **Verify Domain** (for production):
   - SendGrid → Settings → Sender Authentication
   - Authenticate Your Domain
   - Follow DNS setup instructions

### Test Email Sending:

```bash
node -e "
const { sendWelcomeEmail } = require('./backend/services/emailService');
sendWelcomeEmail(
  'test-artist-id',
  'Test Artist',
  'your-email@example.com'
).then(result => console.log('Result:', result));
"
```

---

## Deploy to Railway

See complete guide: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

**Quick steps:**
1. Sign up at railway.app
2. Connect GitHub repo
3. Add environment variables
4. Deploy automatically! 🚀

---

## File Changes Made

### New Files Created:
- ✅ `backend/services/emailService.js` - Email automation
- ✅ `backend/scripts/fix-database-schema.sql` - Database fixes
- ✅ `setup-and-fix.sh` - Automated setup script
- ✅ `RAILWAY_DEPLOYMENT.md` - Deployment guide
- ✅ `DATABASE_FIXES.md` - This document

### Modified Files:
- ✅ `backend/routes/artists.js` - Added welcome email trigger
- ✅ `backend/routes/products.js` - Added first product email trigger

---

## What Changed in the Code

### Artist Registration (backend/routes/artists.js)

**Before:**
```javascript
const { data: artist, error } = await supabaseAdmin
    .from('artists')
    .insert([{ ...artistData }])
    .select()
    .single();

if (error) throw error;

res.status(201).json({ artist, token });
```

**After:**
```javascript
const { data: artist, error } = await supabaseAdmin
    .from('artists')
    .insert([{ ...artistData }])
    .select()
    .single();

if (error) throw error;

// Send welcome email (async, don't wait)
sendWelcomeEmail(artist.id, artist.business_name, artist.email)
    .catch(err => console.error('Error sending welcome email:', err));

res.status(201).json({ artist, token });
```

### Product Creation (backend/routes/products.js)

**Before:**
```javascript
const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert([productData])
    .select()
    .single();

if (error) throw error;

res.status(201).json(product);
```

**After:**
```javascript
const { data: product, error } = await supabaseAdmin
    .from('products')
    .insert([productData])
    .select()
    .single();

if (error) throw error;

// Check if this is artist's first product
const { count } = await supabaseAdmin
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('artist_id', req.artist.id);

// Send first product email if this is their first
if (count === 1) {
    sendFirstProductEmail(
        req.artist.id,
        product.artist.business_name,
        product.artist.email,
        product.name
    ).catch(err => console.error('Error sending first product email:', err));
}

res.status(201).json(product);
```

---

## Troubleshooting

### "Column does not exist" error
✅ Run the database fix SQL script in Supabase

### "Email not sending"
✅ Check SENDGRID_API_KEY in .env
✅ In development, emails are logged to console (check terminal)

### "Cannot find module emailService"
✅ Make sure `backend/services/emailService.js` exists
✅ Restart your server

### "Product upload still broken"
✅ Run database fix first
✅ Check frontend is sending all required fields
✅ Check browser console for errors

---

## Next Steps

1. ✅ **Run Database Fix** - Apply SQL script
2. ✅ **Test Locally** - Verify everything works
3. ✅ **Deploy to Railway** - Follow RAILWAY_DEPLOYMENT.md
4. ✅ **Configure SendGrid** - Enable production emails
5. ✅ **Test End-to-End** - Full flow from registration to first sale

---

## Success Checklist

- [ ] Database fix script executed successfully
- [ ] Backend starts without errors
- [ ] Artist registration works
- [ ] Welcome email sent/logged
- [ ] Product creation works
- [ ] First product email sent/logged
- [ ] All required fields present in products
- [ ] Railway deployment complete (see RAILWAY_DEPLOYMENT.md)
- [ ] Frontend updated to use Railway backend URL
- [ ] SendGrid configured for production emails

---

## Support

**Issues?**
1. Check backend logs: `npm run dev` output
2. Check Supabase logs: Dashboard → Logs
3. Check browser console (F12)
4. Verify environment variables in .env

**Everything working?** 🎉
Proceed to [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md) to deploy!

---

**Last Updated**: February 22, 2026  
**Status**: ✅ Ready to deploy
