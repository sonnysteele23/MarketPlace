# Amy's Haven - Utility Scripts

This directory contains utility scripts for managing the Amy's Haven marketplace database and analytics.

## Setup

Before running any scripts, install dependencies:

```bash
cd scripts
npm install
```

## Available Scripts

### 1. Check Database Contents

View all products and artists currently in your database.

```bash
npm run check-db
```

Or directly:
```bash
node check-database.js
```

**Output:**
- Lists all products with details (name, ID, artist, price, created date)
- Lists all artists with details (name, email, ID, created date)
- Shows total counts

### 2. Clean Database (Remove Dummy Data)

Interactively remove test/dummy data from your database.

```bash
npm run clean-db
```

Or directly:
```bash
node clean-database.js
```

**Options:**
1. Delete ALL products
2. Delete ALL artists
3. Delete BOTH products and artists
4. Delete specific items by ID (manual selection)
5. Cancel without changes

**⚠️ Warning:** This permanently deletes data! Be careful!

### 3. Add Google Analytics

Automatically add Google Analytics tracking to all HTML files.

```bash
npm run add-analytics G-XXXXXXXXXX
```

Or directly:
```bash
node add-analytics.js G-XXXXXXXXXX
```

Replace `G-XXXXXXXXXX` with your actual Google Analytics Measurement ID.

**What it does:**
- Scans all HTML files in the frontend directory
- Adds GA4 tracking code to each file's `<head>` section
- Skips files that already have analytics
- Shows summary of updated files

## Prerequisites

- Node.js installed
- `.env` file in the root directory with Supabase credentials
- For analytics script: Valid Google Analytics 4 Measurement ID

## Environment Variables Required

Your `.env` file must contain:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

## Workflow Examples

### Identifying and Removing Dummy Data

1. **Check what's in the database:**
   ```bash
   npm run check-db
   ```

2. **Identify dummy data** by looking for:
   - Generic names: "Test Product", "Sample Item"
   - Test emails: "test@test.com", "dummy@example.com"
   - Same creation timestamps (batch uploads)
   - Unrealistic prices ($0.01, $9999.99)
   - Lorem ipsum text

3. **Clean the database:**
   ```bash
   npm run clean-db
   ```

4. **Verify removal:**
   ```bash
   npm run check-db
   ```

### Setting Up Analytics Tracking

1. **Get your Google Analytics ID:**
   - Go to https://analytics.google.com
   - Create a GA4 property for Amy's Haven
   - Copy the Measurement ID (starts with G-)

2. **Add tracking to all pages:**
   ```bash
   npm run add-analytics G-YOUR-ID-HERE
   ```

3. **Review changes:**
   ```bash
   git diff
   ```

4. **Deploy:**
   ```bash
   git add .
   git commit -m "Add Google Analytics tracking"
   git push origin main
   ```

5. **Test:**
   - Visit https://amyshaven.com
   - Check Google Analytics Realtime report
   - Verify you appear as an active user

## Troubleshooting

### "Cannot find module '@supabase/supabase-js'"

Run:
```bash
cd scripts
npm install
```

### "Missing Supabase credentials"

Make sure your `.env` file exists in the root directory (one level up from scripts) and contains:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

### Database scripts show no data

Check:
1. Your Supabase credentials are correct
2. Your database tables exist (products, artists)
3. You have internet connection
4. You're using the service role key, not the anon key

### Analytics script doesn't find HTML files

Make sure you're running it from the scripts directory:
```bash
cd scripts
node add-analytics.js G-YOUR-ID
```

## File Descriptions

- **check-database.js** - Reads and displays all database contents
- **clean-database.js** - Interactive tool to delete data
- **add-analytics.js** - Adds GA4 tracking to HTML files
- **package.json** - Dependencies and npm scripts
- **README.md** - This file

## Safety Notes

- Always run `check-database.js` before `clean-database.js`
- The clean script asks for confirmation before deleting
- Consider backing up your Supabase data before major deletions
- Test analytics in a private/incognito window to avoid skewing data

## Support

For issues or questions about these scripts, review:
- Main documentation: `../DATABASE-CLEANUP-AND-ANALYTICS-GUIDE.md`
- Supabase dashboard: https://supabase.com/dashboard
- Google Analytics: https://analytics.google.com
