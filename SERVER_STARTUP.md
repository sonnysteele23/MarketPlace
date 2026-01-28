# 🚀 Server Startup Guide

## Quick Fix for Your Errors

### Problem 1: Port Already in Use ✅ FIXED
The old MongoDB models were trying to load and port 5000 was in use.

**Solution Applied:**
- Moved old Mongoose models to `backend/models_old_mongodb/`
- Removed auth.js route (now using artists.js for authentication)

### Problem 2: Kill Process on Port 5000

Run this command to kill any process using port 5000:

```bash
lsof -ti:5000 | xargs kill -9
```

---

## 🎯 Start Your Server (3 Steps)

### Step 1: Kill any existing process
```bash
lsof -ti:5000 | xargs kill -9
```

### Step 2: Navigate to project
```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
```

### Step 3: Start development server
```bash
npm run dev
```

You should see:
```
✅ Supabase connection initialized
╔════════════════════════════════════════════╗
║   WA Artisan Marketplace Server Running   ║
╠════════════════════════════════════════════╣
║   Port: 5000                              ║
║   Environment: development                ║
║   Database: Supabase (PostgreSQL)         ║
╚════════════════════════════════════════════╝
```

---

## 🌐 Access Your Marketplace

Once the server is running, open these URLs in your browser:

### Customer Pages
- **Homepage**: http://localhost:5000
- **Products**: http://localhost:5000/frontend/products.html

### Artist Dashboard
- **Dashboard**: http://localhost:5000/artist-cms/dashboard.html
- **Add Product**: http://localhost:5000/artist-cms/add-product.html

### API Testing
```bash
# Test categories
curl http://localhost:5000/api/categories

# Test products
curl http://localhost:5000/api/products

# Test health check
curl http://localhost:5000/api/health
```

---

## ✅ What Was Fixed

1. **Removed MongoDB dependencies** from server startup
2. **Moved old Mongoose models** to `backend/models_old_mongodb/`
3. **Removed duplicate auth route** (using `/api/artists/register` and `/api/artists/login` instead)
4. **Clean Supabase integration** - no more Mongoose warnings

---

## 🔧 If You Still Get Errors

### Port 5000 still in use?
```bash
# Find what's using port 5000
lsof -i :5000

# Kill specific process
kill -9 <PID>

# Or use different port in .env
PORT=3000
```

### Module not found errors?
```bash
# Reinstall dependencies
npm install
```

### Supabase connection errors?
```bash
# Test connection
cd backend
node test-connection.js
```

---

## 📋 Authentication Endpoints

Since we removed `/api/auth`, use these endpoints instead:

### Artist Registration
```bash
POST /api/artists/register
{
  "email": "artist@example.com",
  "password": "password123",
  "business_name": "My Art Studio",
  "bio": "Creating beautiful handmade crafts"
}
```

### Artist Login
```bash
POST /api/artists/login
{
  "email": "artist@example.com",
  "password": "password123"
}
```

---

## 🎉 You're Ready!

Your server is now clean and ready to run with:
- ✅ Supabase PostgreSQL
- ✅ No MongoDB dependencies
- ✅ Clean authentication via `/api/artists`
- ✅ All routes converted to Supabase

**Start the server and enjoy your marketplace!** 🎨🛍️
