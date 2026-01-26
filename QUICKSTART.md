# Quick Start Guide 🚀

Get your Washington Artisan Marketplace up and running in 5 minutes!

## Step 1: Install Dependencies

```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
npm install
```

## Step 2: Set Up Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and update these critical settings:
- `JWT_SECRET` - Generate a secure random string
- `MONGODB_URI` - Your MongoDB connection string
- `STRIPE_SECRET_KEY` - Your Stripe test key (optional for now)

**Quick JWT Secret Generator:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 3: Start MongoDB

### Option A: Local MongoDB
```bash
# Mac (with Homebrew):
brew services start mongodb-community

# Or using mongod directly:
mongod --dbpath ~/data/db
```

### Option B: MongoDB Atlas (Cloud)
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

## Step 4: Seed the Database

```bash
node backend/scripts/seed.js
```

This will create all 14 product categories.

## Step 5: Start the Server

```bash
npm run dev
```

You should see:
```
╔════════════════════════════════════════════╗
║   WA Artisan Marketplace Server Running   ║
╠════════════════════════════════════════════╣
║   Port: 5000                               ║
║   Environment: development                 ║
║   Database: MongoDB Connected              ║
╚════════════════════════════════════════════╝
```

## Step 6: Test the Application

Open your browser and visit:

- **Homepage**: http://localhost:5000
- **Products Page**: http://localhost:5000/frontend/products.html
- **Artist CMS**: http://localhost:5000/artist-cms/dashboard.html

## API Endpoints to Test

```bash
# Health check
curl http://localhost:5000/api/health

# Get categories
curl http://localhost:5000/api/categories

# Get products (will be empty initially)
curl http://localhost:5000/api/products

# Get featured products
curl http://localhost:5000/api/products/featured
```

## Common Issues & Solutions

### Port Already in Use
```bash
# Kill process using port 5000
kill -9 $(lsof -ti:5000)
```

### MongoDB Connection Failed
```bash
# Check if MongoDB is running
mongosh

# Or check the service status
brew services list | grep mongodb
```

### Module Not Found Errors
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

1. **Create an Artist Account**: Use the registration endpoint or frontend form
2. **Add Products**: Use the artist CMS to add your first products
3. **Configure Stripe**: Set up payment processing for production
4. **Customize Design**: Modify CSS files in `frontend/css/` and `artist-cms/css/`
5. **Deploy**: Follow the deployment guide in SETUP_GUIDE.md

## Need Help?

- Check the full setup guide: `SETUP_GUIDE.md`
- Review server logs for errors
- Check MongoDB connection
- Verify all environment variables are set

---

**Made with 💚 for Washington State artisans**
