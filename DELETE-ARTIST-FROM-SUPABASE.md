# 🗑️ How to Delete Artist from Supabase

## Method 1: Using Supabase Dashboard (EASIEST)

### Step 1: Go to Supabase Dashboard
Visit: https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv

### Step 2: Go to Table Editor
1. Click **"Table Editor"** in the left sidebar
2. Click on the **"artists"** table

### Step 3: Find the Artist
1. Look for the row with email: `admin@amyshaven.com`
2. You should see the artist with ID: `e227ca3c-f81d-4009-983c-93a332260434`

### Step 4: Delete the Row
1. **Click the row** to select it
2. Click the **trash can icon** or right-click and select "Delete row"
3. **Confirm** the deletion

---

## Method 2: Using SQL Editor (FASTER)

### Step 1: Go to SQL Editor
1. In Supabase Dashboard, click **"SQL Editor"** in left sidebar
2. Click **"New Query"**

### Step 2: Run This Query
```sql
-- Delete the artist account
DELETE FROM artists 
WHERE email = 'admin@amyshaven.com';
```

### Step 3: Click "Run" (or press Cmd/Ctrl + Enter)

---

## Method 3: Delete from Auth Users (IF NEEDED)

If you also created an auth user (not just an artist), you need to delete from auth.users too:

### Step 1: Go to Authentication
1. Click **"Authentication"** in left sidebar
2. Click **"Users"** tab

### Step 2: Find and Delete User
1. Look for email: `admin@amyshaven.com`
2. Click the **"..."** menu on the right
3. Click **"Delete user"**
4. Confirm deletion

---

## ⚠️ IMPORTANT: Which Tables to Check

Your artist data might be in these tables:
1. **artists** - Main artist profile
2. **auth.users** - Supabase authentication (if you used Supabase Auth)
3. **users** - If you have a separate users table

---

## 🎯 Quick Steps for Your Case:

Since you registered as an artist, here's what to do:

1. **Go to Supabase Table Editor**
2. **Open "artists" table**
3. **Delete the row** with email `admin@amyshaven.com`
4. **Done!** You can now re-register with the same email

---

## After Deleting:

1. Go to: https://amyshaven.com/frontend/register.html
2. Register again with: `admin@amyshaven.com`
3. This will create a NEW artist with a NEW token signed by Railway
4. Login and test!

---

**The quickest way is Method 2 (SQL) - just run that DELETE query and you're done!** 🚀
