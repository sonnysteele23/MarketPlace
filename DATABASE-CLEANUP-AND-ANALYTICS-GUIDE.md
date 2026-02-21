# Database Cleanup & Analytics Setup Guide

## Part 1: Clean Dummy Data from Database

### Step 1: Check What's in Your Database

Run this command from your MarketPlace directory:

```bash
cd ~/Documents/GitHub/MarketPlace
node scripts/check-database.js
```

This will show you ALL products and artists currently in your database.

### Step 2: Remove Dummy Data

Once you've reviewed what's there, run:

```bash
node scripts/clean-database.js
```

This interactive script will:
1. Show you all current data
2. Give you options to delete:
   - All products
   - All artists
   - Both
   - Specific items by ID
3. Ask for confirmation before deleting anything

**Be careful!** This permanently deletes data. Make sure you identify which items are dummy/test data before proceeding.

### Alternative: Manual Deletion via Supabase Dashboard

If you prefer a visual interface:

1. Go to https://supabase.com/dashboard
2. Sign in and select your project (hgzshxoshmsvwrrdgriv)
3. Click "Table Editor" in the sidebar
4. Select the "products" table
5. You can manually delete rows by clicking the trash icon
6. Repeat for the "artists" table

---

## Part 2: Set Up Google Analytics

### Step 1: Create Google Analytics Account

1. Go to https://analytics.google.com/
2. Sign in with your Google account
3. Click "Start measuring"
4. Account name: "Amy's Haven" (or your preference)
5. Click "Next"

### Step 2: Set Up Property

1. Property name: "Amy's Haven Marketplace"
2. Reporting time zone: Select your timezone
3. Currency: USD
4. Click "Next"

### Step 3: Set Up Data Stream

1. Select "Web"
2. Website URL: https://amyshaven.com
3. Stream name: "Amy's Haven Website"
4. Click "Create stream"

### Step 4: Get Your Measurement ID

After creating the stream, you'll see a **Measurement ID** that looks like: `G-XXXXXXXXXX`

Copy this ID!

### Step 5: Add Analytics to Your Website

#### Option A: Add to Every Page (Recommended)

Open `frontend/index.html` and add this code right before the closing `</head>` tag:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

**REPLACE `G-XXXXXXXXXX` with your actual Measurement ID!**

You'll need to add this to:
- `frontend/index.html`
- `frontend/shop.html`
- `frontend/about.html`
- `frontend/contact.html`
- `frontend/artist-login.html`
- `frontend/artist-register.html`
- `frontend/customer-login.html`
- `frontend/customer-register.html`
- Any other HTML pages

#### Option B: Create a Shared Header Include (Better for maintenance)

1. Create a file `frontend/includes/analytics.html`:

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

2. Then in each HTML file, add this in the `<head>`:

```html
<script>
  fetch('/includes/analytics.html')
    .then(response => response.text())
    .then(data => {
      document.head.innerHTML += data;
    });
</script>
```

### Step 6: Update Your .env File

Add your GA ID to your `.env` file:

```env
# ===================================
# Analytics & Tracking
# ===================================
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### Step 7: Deploy and Test

1. Commit your changes:
```bash
git add .
git commit -m "Add Google Analytics tracking"
git push origin main
```

2. Wait a few minutes for GitHub Pages to deploy

3. Visit your site: https://amyshaven.com

4. Go back to Google Analytics dashboard

5. Click "Realtime" in the left sidebar

6. You should see yourself as a live user!

---

## What You'll See in Google Analytics

### Realtime Report
- Current visitors on your site
- What pages they're viewing
- Where they're coming from
- What devices they're using

### Acquisition Reports
- How people find your site (Google search, direct, referral, social)
- Which keywords bring traffic
- Which websites send you visitors

### Engagement Reports
- Most popular pages
- Average time on site
- Bounce rate
- Event tracking (clicks, scrolls, etc.)

### Demographics
- Where your visitors are located (country, city)
- Age ranges
- Gender
- Interests

### Technology
- Desktop vs mobile usage
- Browser types
- Operating systems
- Screen resolutions

---

## Setting Up Enhanced Tracking (Optional)

### Track Product Views

Add this to your product detail pages:

```javascript
// When a product page loads
gtag('event', 'view_item', {
  currency: 'USD',
  value: productPrice,
  items: [{
    item_id: productId,
    item_name: productName,
    item_category: productCategory,
    price: productPrice
  }]
});
```

### Track Add to Cart

```javascript
// When user clicks "Add to Cart"
gtag('event', 'add_to_cart', {
  currency: 'USD',
  value: productPrice,
  items: [{
    item_id: productId,
    item_name: productName,
    quantity: 1,
    price: productPrice
  }]
});
```

### Track Purchases

```javascript
// After successful checkout
gtag('event', 'purchase', {
  transaction_id: orderId,
  value: totalAmount,
  currency: 'USD',
  items: purchasedItems
});
```

---

## Accessing Your Analytics Dashboard

1. Go to https://analytics.google.com/
2. Select "Amy's Haven Marketplace" property
3. Explore different reports in the left sidebar

### Recommended Reports to Check Daily:
- **Realtime** - See who's on your site now
- **Acquisition Overview** - How people find you
- **Pages and screens** - Most popular pages
- **Traffic acquisition** - Which channels work best

### Weekly Reviews:
- **User acquisition** - New vs returning visitors
- **Engagement overview** - Time on site, pages per session
- **Events** - Track specific actions
- **Conversions** - If you set up goals

### Monthly Analysis:
- **Demographics** - Age, gender, interests
- **Location** - Geographic performance
- **Technology** - Device and browser trends
- **Landing pages** - Entry points to your site

---

## Troubleshooting

### "No data showing in Google Analytics"

1. Make sure you replaced `G-XXXXXXXXXX` with your real ID
2. Check that the code is in the `<head>` section of every page
3. Clear your browser cache and visit the site
4. Check Realtime report (data can take 24-48 hours for other reports)
5. Disable ad blockers when testing

### "Analytics code not loading"

1. Open browser console (F12)
2. Look for errors
3. Check Network tab for blocked requests
4. Ensure ad blockers aren't interfering

### "Dummy data identification"

Look for:
- Products with generic names like "Test Product", "Sample Item", "Dummy"
- Artists with test emails like "test@test.com"
- Items created on the same date/time (batch uploads)
- Unrealistic prices like $0.01 or $9999.99
- Lorem ipsum or placeholder text in descriptions

---

## Quick Reference

### Database Scripts Location
```
~/Documents/GitHub/MarketPlace/scripts/
  - check-database.js    (view all data)
  - clean-database.js    (delete data interactively)
```

### Analytics Setup Checklist
- [ ] Create Google Analytics account
- [ ] Create GA4 property for Amy's Haven
- [ ] Create web data stream
- [ ] Copy Measurement ID
- [ ] Add analytics code to all HTML pages
- [ ] Update .env file
- [ ] Commit and push to GitHub
- [ ] Test in Realtime report
- [ ] Verify data collection after 24 hours

---

## Need Help?

If you run into issues:
1. Check the browser console for JavaScript errors
2. Verify your Measurement ID is correct
3. Make sure the analytics code is in every page's `<head>`
4. Wait 24-48 hours for data to appear in non-realtime reports
5. Use the Realtime report to verify tracking is working immediately
