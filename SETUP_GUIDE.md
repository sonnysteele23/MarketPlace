# Washington Artisan Marketplace - Setup & Deployment Guide

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Database Setup](#database-setup)
5. [Running Locally](#running-locally)
6. [Deployment](#deployment)
7. [SEO Setup](#seo-setup)
8. [Artist Onboarding](#artist-onboarding)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - OR use MongoDB Atlas (cloud database) - [Sign up](https://www.mongodb.com/cloud/atlas)
- **Git** - [Download](https://git-scm.com/)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

## Installation

### 1. Navigate to the Project Directory

```bash
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js (web server)
- Mongoose (MongoDB ODM)
- Multer (file uploads)
- Sharp (image processing)
- Stripe (payments)
- And more...

## Configuration

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
touch .env
```

### 2. Add Environment Variables

Open `.env` and add the following configuration:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/wa-artisan-marketplace
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/wa-artisan-marketplace

# Frontend URL
FRONTEND_URL=http://localhost:5000

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production

# Stripe (for payments)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Email Configuration (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# AWS S3 (optional - for production image storage)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_BUCKET_NAME=wa-artisan-marketplace-images
AWS_REGION=us-west-2

# Session Secret
SESSION_SECRET=your_session_secret_here
```

### 3. Generate Secrets

To generate secure random strings for secrets:

```bash
# On Mac/Linux:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# On Windows PowerShell:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Database Setup

### Option 1: Local MongoDB

1. **Start MongoDB**:
```bash
# Mac (with Homebrew):
brew services start mongodb-community

# Linux:
sudo systemctl start mongod

# Windows:
# MongoDB should start automatically after installation
```

2. **Verify Connection**:
```bash
mongosh
# Should connect successfully
```

### Option 2: MongoDB Atlas (Cloud)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Get connection string and add to `.env`
4. Whitelist your IP address in Atlas dashboard

### Initialize Database with Sample Data

```bash
# Run the seed script to create initial categories and sample products
node backend/scripts/seed.js
```

## Running Locally

### 1. Start the Development Server

```bash
npm run dev
```

This starts the server with nodemon (auto-restart on file changes).

### 2. Access the Application

Open your browser and navigate to:

- **Main Site**: http://localhost:5000
- **Products Page**: http://localhost:5000/frontend/products.html
- **Artist CMS**: http://localhost:5000/artist-cms/dashboard.html

### 3. Test API Endpoints

```bash
# Health check
curl http://localhost:5000/api/health

# Get all products
curl http://localhost:5000/api/products

# Get featured products
curl http://localhost:5000/api/products/featured
```

## Deployment

### Deploy to Heroku

1. **Install Heroku CLI**:
```bash
# Mac:
brew tap heroku/brew && brew install heroku

# Windows/Linux:
# Download from https://devcenter.heroku.com/articles/heroku-cli
```

2. **Login to Heroku**:
```bash
heroku login
```

3. **Create Heroku App**:
```bash
heroku create wa-artisan-marketplace
```

4. **Add MongoDB Atlas**:
```bash
# Use MongoDB Atlas for production database
# Add connection string to Heroku config
heroku config:set MONGODB_URI="your_atlas_connection_string"
```

5. **Set Environment Variables**:
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="your_secret"
heroku config:set STRIPE_SECRET_KEY="your_stripe_key"
# ... add all other environment variables
```

6. **Deploy**:
```bash
git push heroku main
```

7. **Open App**:
```bash
heroku open
```

### Deploy to Vercel (Alternative)

1. **Install Vercel CLI**:
```bash
npm i -g vercel
```

2. **Login**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```

4. **Set Environment Variables**:
- Go to Vercel dashboard
- Select your project
- Go to Settings → Environment Variables
- Add all variables from `.env`

### Deploy to DigitalOcean (Full Control)

1. Create a Droplet (Ubuntu 22.04)
2. SSH into your server
3. Install Node.js and MongoDB
4. Clone your repository
5. Install dependencies and start with PM2

```bash
# On the server
npm install -g pm2
npm install
pm2 start backend/server.js --name "marketplace"
pm2 save
pm2 startup
```

## SEO Setup

### 1. Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add your domain
3. Verify ownership
4. Submit sitemap: `https://yourdomain.com/sitemap.xml`

### 2. Google Analytics

1. Create account at [Google Analytics](https://analytics.google.com/)
2. Get tracking ID
3. Add to all HTML pages:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 3. Generate Sitemap

Create `backend/scripts/generateSitemap.js`:

```javascript
const fs = require('fs');
const Product = require('../models/Product');

async function generateSitemap() {
    const products = await Product.find({ status: 'active' });
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://waartisanmarket.com/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>https://waartisanmarket.com/frontend/products.html</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
    </url>`;
    
    products.forEach(product => {
        sitemap += `
    <url>
        <loc>https://waartisanmarket.com/frontend/product-detail.html?id=${product._id}</loc>
        <lastmod>${product.updatedAt.toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>`;
    });
    
    sitemap += `
</urlset>`;
    
    fs.writeFileSync('./public/sitemap.xml', sitemap);
    console.log('Sitemap generated!');
}

module.exports = generateSitemap;
```

Run: `node backend/scripts/generateSitemap.js`

### 4. Local SEO for Washington State

1. **Google My Business**:
   - Create listing for each major WA city
   - Add business hours, photos, description

2. **Local Citations**:
   - List on Yelp, Yellow Pages
   - WA business directories
   - Craft/artisan directories

3. **Create Location Pages**:
   - /seattle-artisans
   - /spokane-artisans
   - /tacoma-artisans

## Artist Onboarding

### 1. Create Artist Application Form

Add to `frontend/apply.html`:
- Artist name and contact
- Portfolio/photos of work
- Story/background
- Product categories

### 2. Approval Process

1. Review applications in admin panel
2. Create artist account
3. Send welcome email with:
   - CMS login credentials
   - How to add products guide
   - Pricing guidelines
   - Photo tips

### 3. Artist Resources

Create resources at `/artist-resources`:
- Product photography guide
- Writing descriptions guide
- Pricing calculator
- Shipping best practices
- Tax information

## Monitoring & Maintenance

### Set Up Monitoring

```bash
# Install PM2 for process monitoring
npm install -g pm2

# Start with monitoring
pm2 start backend/server.js --name marketplace
pm2 monit
```

### Regular Tasks

1. **Weekly**:
   - Review new artist applications
   - Check for policy violations
   - Update featured products

2. **Monthly**:
   - Generate sales reports
   - Calculate homelessness contributions
   - Update SEO strategy

3. **Quarterly**:
   - Review and update categories
   - Analyze top-performing products
   - Survey artists for feedback

## Troubleshooting

### Can't Connect to Database

```bash
# Check MongoDB is running
mongosh

# Check connection string in .env
echo $MONGODB_URI
```

### Port Already in Use

```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)
```

### Image Uploads Not Working

1. Check permissions on `/public/uploads`
2. Verify multer configuration
3. Check file size limits

## Next Steps

1. Set up payment processing with Stripe
2. Configure email notifications
3. Add social media integration
4. Set up automated backups
5. Create admin dashboard
6. Implement advanced analytics

## Support

For issues or questions:
- GitHub Issues: [repository-url]/issues
- Email: support@waartisanmarket.com
- Documentation: [repository-url]/wiki

---

**Made with 💚 for Washington State artisans**
