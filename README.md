# Washington Artisan Marketplace

A professional marketplace platform connecting local Washington state artists (including homeless artisans) with buyers, while contributing to solving homelessness.

## Mission
- Support local Washington artists, including those experiencing homelessness
- 10% markup on items
- 5% of sales goes to homelessness solutions

## Features

### Customer Features
- Advanced search and filtering by category, price, artist, location
- Mobile-responsive design
- Secure checkout
- Product reviews and ratings
- Artist stories and profiles
- Save favorites
- Order tracking

### Artist Features
- Easy mobile-first CMS for adding products
- Photo upload (multiple images per product)
- Inventory management
- Sales dashboard
- Category selection
- Pricing control

### SEO Optimization
- Clean URL structure
- Schema markup for products
- Optimized meta tags
- Local SEO for Washington state
- Fast loading times
- Mobile-first indexing

## Technology Stack
- Frontend: HTML5, CSS3, JavaScript (ES6+)
- Backend: Node.js + Express
- Database: MongoDB
- Payment: Stripe
- Image Storage: AWS S3 or local storage
- SEO: React Helmet for meta tags, sitemap generation

## Installation

```bash
# Clone the repository
git clone <your-repo-url>

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## Project Structure

```
MarketPlace/
├── frontend/
│   ├── index.html          # Homepage
│   ├── products.html        # Product listing page
│   ├── product-detail.html  # Individual product page
│   ├── artist-profile.html  # Artist profile page
│   ├── about.html           # About our mission
│   ├── css/
│   │   ├── main.css        # Main styles
│   │   ├── mobile.css      # Mobile-specific styles
│   │   └── categories.css  # Category page styles
│   ├── js/
│   │   ├── main.js         # Main JavaScript
│   │   ├── search.js       # Search functionality
│   │   ├── cart.js         # Shopping cart
│   │   └── filters.js      # Product filtering
│   └── images/
├── artist-cms/
│   ├── dashboard.html      # Artist dashboard
│   ├── add-product.html    # Add/edit products
│   ├── my-products.html    # Product management
│   ├── css/
│   │   └── cms.css        # CMS styles
│   └── js/
│       ├── upload.js      # Image upload
│       └── product-form.js # Product form handling
├── backend/
│   ├── server.js          # Express server
│   ├── routes/
│   │   ├── products.js    # Product routes
│   │   ├── artists.js     # Artist routes
│   │   ├── categories.js  # Category routes
│   │   └── orders.js      # Order routes
│   ├── models/
│   │   ├── Product.js     # Product model
│   │   ├── Artist.js      # Artist model
│   │   ├── Category.js    # Category model
│   │   └── Order.js       # Order model
│   └── middleware/
│       ├── auth.js        # Authentication
│       └── upload.js      # File upload handling
└── public/
    └── uploads/           # Uploaded images
```

## Categories

The marketplace supports the following artisan categories:
- Jewelry & Accessories
- Home Decor
- Pottery & Ceramics
- Textiles & Fiber Arts
- Paintings & Wall Art
- Sculpture
- Woodworking
- Metalwork
- Glass Art
- Paper Arts & Prints
- Photography
- Handmade Soaps & Candles
- Leather Goods
- Mixed Media

## SEO Strategy

### Local SEO for Washington State
- Target keywords: "Washington handmade", "Seattle artisan", "local crafts WA"
- City-specific landing pages
- Google My Business integration
- Local schema markup

### On-Page SEO
- Unique product descriptions
- Alt text for all images
- Breadcrumb navigation
- Internal linking structure
- Mobile-first design
- Fast page load (target < 3 seconds)

### Content Marketing
- Artist stories blog
- How-it's-made content
- Social impact updates
- Email newsletter

## Deployment

```bash
# Build for production
npm run build

# Deploy to server
npm run deploy
```

## License
MIT

## Support
For questions or support, contact: [your-email]
