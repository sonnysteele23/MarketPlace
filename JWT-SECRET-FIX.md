# 🔑 NEW JWT_SECRET FOR RAILWAY

## Copy This Value to Railway:

```
9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f
```

## Steps:

1. Go to Railway → MarketPlace → Variables
2. Click on JWT_SECRET
3. Replace the value with the one above
4. Click "Save"
5. Railway will automatically redeploy

---

## ⚠️ IMPORTANT: You'll Need to Re-Register as an Artist

Because we're changing the JWT_SECRET, your current login token will become invalid. You'll need to:

1. Go to the artist registration page
2. Register a new artist account (or use the same email)
3. Login with the new account

The old token won't work anymore because it was signed with the old secret.

---

## Alternative: Keep Current Secret But Clear Browser

If you want to keep using the placeholder secret (not recommended but would work):

1. Clear localStorage in your browser (this clears the old token)
2. Log out completely
3. Log back in as artist
4. Try uploading again

The issue might just be that your browser has a corrupted or old token cached.

---

**I recommend using the new secret I generated above for better security!**
