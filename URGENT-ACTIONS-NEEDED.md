# 🔴 URGENT ACTION REQUIRED

## You Need To:

### 1. Add ONE Line to HTML (MANUAL - 30 seconds)

Open: `/artist-cms/add-product.html`

Find line 12 (it says):
```html
    <link rel="stylesheet" href="css/cms-pages.css">
```

**ADD THIS LINE RIGHT AFTER IT:**
```html
    <link rel="stylesheet" href="css/form-fixes.css">
```

**Result should be:**
```html
    <link rel="stylesheet" href="css/cms.css">
    <link rel="stylesheet" href="css/cms-pages.css">
    <link rel="stylesheet" href="css/form-fixes.css">  ← ADD THIS
```

---

### 2. Check Railway Backend (CRITICAL - The Upload Error)

The **upload error** is a BACKEND issue on Railway. The frontend is trying to upload images but Railway is rejecting them.

**Error:**
```
POST /api/upload/product-images
net::ERR_HTTP2_PROTOCOL_ERROR
```

**Check These:**

1. **Supabase Storage Bucket:**
   - Go to: https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv/storage/buckets
   - Look for bucket named: `product-images`
   - If it doesn't exist, create it
   - Set permissions to: Public bucket OR Authenticated users can upload

2. **Railway Logs:**
   - Go to: https://railway.app/dashboard
   - Find: marketplace-production-336b
   - Click: Logs
   - Try uploading an image
   - Look for error messages in the logs

3. **Environment Variables (Railway):**
   - Check `SUPABASE_URL` is set
   - Check `SUPABASE_KEY` is set (should be your service_role key)

---

## Then Push:

```bash
git add artist-cms/add-product.html
git commit -m "Add form-fixes.css link"
git push origin main
```

---

## Summary:

✅ **CSS File** - Already created (`form-fixes.css`)  
⏳ **HTML Link** - YOU need to add 1 line manually (see above)  
❌ **Upload Error** - Backend issue, check Supabase Storage bucket

---

**The CSS is a 30-second fix. The upload error needs backend debugging.**
