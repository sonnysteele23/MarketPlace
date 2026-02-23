# 🚨 TWO CRITICAL ISSUES

## Issue 1: JWT Auth Error (Upload Failing) ❌

**Railway Logs Show:**
```
Auth error type: JsonWebTokenError  
Auth error message: invalid signature
```

**This means:** Your JWT_SECRET on Railway doesn't match the secret used to create artist tokens.

**Fix:**
1. Go to Railway → Your Project → Variables
2. Check if `JWT_SECRET` exists
3. If it doesn't exist, add it
4. If it exists but is wrong, update it
5. **Important:** It must be the SAME secret you used when creating artist accounts

**After fixing JWT_SECRET, redeploy Railway backend**

---

## Issue 2: CSS Link STILL Missing ❌

I checked your local file - the `form-fixes.css` link is **STILL NOT ADDED**.

**You MUST manually add this line to `/artist-cms/add-product.html`:**

Find line 12:
```html
    <link rel="stylesheet" href="css/cms-pages.css">
```

Add this line RIGHT AFTER it:
```html
    <link rel="stylesheet" href="css/form-fixes.css">
```

**Or copy/paste this entire head section** (lines 1-13):

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Product | WA Artisan Marketplace</title>
    <meta name="robots" content="noindex, nofollow">
    
    <link rel="stylesheet" href="../frontend/css/design-system.css">
    <link rel="stylesheet" href="../frontend/css/icons.css">
    <link rel="stylesheet" href="../frontend/css/main.css">
    <link rel="stylesheet" href="css/cms.css">
    <link rel="stylesheet" href="css/cms-pages.css">
    <link rel="stylesheet" href="css/form-fixes.css">
    
    <script src="https://unpkg.com/lucide@latest"></script>
```

---

## Priority:

1. **FIX JWT_SECRET on Railway** ← This is why uploads fail
2. **ADD CSS link** ← This is why styling is broken
3. **Push to GitHub**

---

**Without these fixes, nothing will work!**
