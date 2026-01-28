# 🔧 EMERGENCY FIX - Run These Commands

## Step 1: Install kill-port tool
```bash
npm install -g kill-port
```

## Step 2: Kill port 5000
```bash
npx kill-port 5000
```

## Step 3: Run the diagnostic test server
```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace/backend
node test-server.js
```

This will:
- ✅ Check your environment
- ✅ Check your files exist
- ✅ Start a SIMPLE test server
- ✅ Tell you exactly what URLs to open

## Step 4: Open your browser
Once you see "Test server started successfully", open:
- http://localhost:5000
- http://localhost:5000/test
- http://localhost:5000/frontend/products.html
- http://localhost:5000/artist-cms/dashboard.html

---

## If test server works, then start the real server:
```bash
# Stop the test server (Ctrl+C)
# Then start the real one:
npm run dev
```

---

## Alternative: Use different port
If port 5000 won't free up, edit your `.env` file:
```
PORT=3000
```

Then use:
- http://localhost:3000
- http://localhost:3000/frontend/products.html
- etc.
