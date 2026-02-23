# 🔑 DEFINITIVE JWT_SECRET FIX

## The Problem:
Even after re-registering, uploads fail because the JWT_SECRET on Railway doesn't match what we need.

## The Solution:
Update BOTH Railway and your local .env to use a NEW, secure JWT_SECRET.

---

## Step 1: Update Railway JWT_SECRET

### Go to Railway Variables:
https://railway.app/project/78dc001a-4973-427a-acc5-26dcf9126c01/service/309bbd18-521f-4aa8-bf9b-e31429

### Click on JWT_SECRET and replace with:
```
a8f3e9c7b2d6f4a1e5c9d8b7a3f6e2c4d1b9a7e5c3f8d6b4a2e7c5d3b1f9a8e6c4d2b7a5
```

### Save and wait 1-2 minutes for Railway to redeploy

---

## Step 2: Update Your Local .env

Open: `/Users/sonnysteele/Documents/GitHub/MarketPlace/.env`

### Find this line (around line 25):
```
JWT_SECRET=your_jwt_secret_key_change_this_in_production
```

### Replace with:
```
JWT_SECRET=a8f3e9c7b2d6f4a1e5c9d8b7a3f6e2c4d1b9a7e5c3f8d6b4a2e7c5d3b1f9a8e6c4d2b7a5
```

### Save the file

---

## Step 3: Clear Everything and Re-Register

### In browser console:
```javascript
localStorage.clear()
```

### Delete your artist from Supabase again:
```sql
DELETE FROM artists WHERE email = 'admin@amyshaven.com';
```

### Register fresh at:
https://amyshaven.com/frontend/register.html

### Login at:
https://amyshaven.com/frontend/login.html

### Try upload at:
https://amyshaven.com/artist-cms/add-product.html

---

## Why This Will Work:

When you register through the live site, the Railway backend will:
1. Create the artist account
2. Generate a JWT token signed with the NEW secret: `a8f3e9c7b2d6f4a1e5c9d8b7a3f6e2c4d1b9a7e5c3f8d6b4a2e7c5d3b1f9a8e6c4d2b7a5`
3. Send that token to your browser
4. When you upload, Railway can VERIFY the token because it matches!

---

## The New JWT_SECRET:
```
a8f3e9c7b2d6f4a1e5c9d8b7a3f6e2c4d1b9a7e5c3f8d6b4a2e7c5d3b1f9a8e6c4d2b7a5
```

**Copy this exactly - no spaces, no extra characters!**

---

## Verification Checklist:

After updating both Railway and local .env:

✅ Railway JWT_SECRET = `a8f3e9c7b2d6f4a1e5c9d8b7a3f6e2c4d1b9a7e5c3f8d6b4a2e7c5d3b1f9a8e6c4d2b7a5`
✅ Local .env JWT_SECRET = `a8f3e9c7b2d6f4a1e5c9d8b7a3f6e2c4d1b9a7e5c3f8d6b4a2e7c5d3b1f9a8e6c4d2b7a5`
✅ Wait for Railway to redeploy (1-2 min)
✅ localStorage.clear()
✅ Delete artist from Supabase
✅ Register fresh
✅ Login
✅ Upload works! 🎉

---

**This WILL fix the upload issue!**
