# Washington Artisan Marketplace
## Technical Stack Documentation

**Version:** 1.0  
**Last Updated:** January 27, 2026  
**Project Goal:** E-commerce marketplace connecting Washington state artisans with customers while supporting homelessness solutions

---

## 🔗 Quick Links

### **🌐 Live Site**
- **Production**: https://waartisanmarket.com *(Coming Soon)*
- **Staging**: https://staging.waartisanmarket.com *(Coming Soon)*

### **💻 Repository**
- **GitHub**: https://github.com/sonnysteele/MarketPlace
- **Issues**: https://github.com/sonnysteele/MarketPlace/issues
- **Project Board**: https://github.com/sonnysteele/MarketPlace/projects

### **📚 Documentation**
- [Tech Stack](./TECH_STACK.md) - This document
- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Setup Guide](./SETUP_GUIDE.md) - Development environment setup
- [Quick Start](./QUICKSTART.md) - Get started in 5 minutes
- [Contributing](./CONTRIBUTING.md) - How to contribute *(Coming Soon)*

### **🎨 Demo Access**
- **Customer View**: https://waartisanmarket.com
- **Artist Dashboard**: https://waartisanmarket.com/artist-cms
- **Demo Artist Login**:
  - Email: `demo@waartisanmarket.com`
  - Password: `demo123` *(Demo site only)*

### **🛠️ Services**
- **Database**: [Supabase Dashboard](https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv)
- **Payments**: [Stripe Dashboard](https://dashboard.stripe.com)
- **Analytics**: [Google Analytics](https://analytics.google.com) *(Coming Soon)*

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Frontend Stack](#frontend-stack)
3. [Backend Stack](#backend-stack)
4. [Database & Storage](#database--storage)
5. [Payment Processing](#payment-processing)
6. [Authentication & Security](#authentication--security)
7. [Development Tools](#development-tools)
8. [Deployment & Hosting](#deployment--hosting)
9. [Third-Party Services](#third-party-services)

---

## 🏗️ Architecture Overview

### Application Architecture
```
┌─────────────────────────────────────────────────────┐
│                   Client Layer                       │
│  ┌──────────────┐        ┌──────────────┐          │
│  │   Customer   │        │    Artist    │          │
│  │   Frontend   │        │     CMS      │          │
│  └──────────────┘        └──────────────┘          │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│                 API Layer (Express)                  │
│  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐           │
│  │Auth  │  │Product│ │Orders│  │Upload│           │
│  │Routes│  │Routes │ │Routes│  │Routes│           │
│  └──────┘  └──────┘  └──────┘  └──────┘           │
└─────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────┐
│              Data & Services Layer                   │
│  ┌──────────┐  ┌────────┐  ┌──────────┐           │
│  │ Supabase │  │ Stripe │  │  Sharp   │           │
│  │PostgreSQL│  │Payments│  │  Image   │           │
│  │ Storage  │  │        │  │Processing│           │
│  └──────────┘  └────────┘  └──────────┘           │
└─────────────────────────────────────────────────────┘
```

### Tech Stack Philosophy
- **Simplicity**: Minimize complexity with managed services (Supabase over self-hosted MongoDB)
- **Scalability**: Cloud-native architecture ready for growth
- **Developer Experience**: Modern tools with great documentation
- **Cost Efficiency**: Generous free tiers for development and early production
- **Social Impact**: Platform supporting local artisans and homelessness solutions

---

## 🎨 Frontend Stack

### Core Technologies

#### **HTML5**
- **Version**: HTML5
- **Purpose**: Semantic markup for customer-facing marketplace
- **Files**: `index.html`, product pages, checkout flow
- **Features**: 
  - Accessible semantic elements
  - SEO-optimized structure
  - Responsive meta tags

#### **CSS3 / Modern CSS**
- **Version**: CSS3
- **Purpose**: Styling and responsive design
- **Approach**: Custom CSS with modern features
- **Features**:
  - Flexbox & CSS Grid layouts
  - CSS Variables for theming
  - Mobile-first responsive design
  - Smooth animations and transitions

#### **Vanilla JavaScript (ES6+)**
- **Version**: ES2020+
- **Purpose**: Interactive UI without framework overhead
- **Features**:
  - Async/await for API calls
  - Fetch API for HTTP requests
  - DOM manipulation
  - Event handling
  - Local state management

### Artist CMS (Content Management)

#### **Dedicated Artist Interface**
- **Location**: `/artist-cms/`
- **Purpose**: Dashboard for artisans to manage products, orders, and profile
- **Features**:
  - Product CRUD operations
  - Order management
  - Analytics dashboard
  - Profile settings
  - Image upload interface

### Frontend Features

- **Product Catalog**: Filterable, searchable product listings
- **Shopping Cart**: Client-side cart with localStorage persistence
- **Checkout Flow**: Multi-step checkout with Stripe integration
- **User Authentication**: Login/register forms with JWT handling
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Image Galleries**: Lightbox for product images
- **Search & Filters**: Category and price filtering

---

## ⚙️ Backend Stack

### Core Framework

#### **Node.js**
- **Version**: 24.1.0 (LTS)
- **Purpose**: JavaScript runtime for server-side execution
- **Why Node.js**:
  - Full-stack JavaScript consistency
  - Excellent async I/O performance
  - Large ecosystem (npm)
  - Great for real-time applications

#### **Express.js**
- **Version**: ^4.18.2
- **Purpose**: Web application framework
- **Features**:
  - RESTful API routing
  - Middleware pipeline
  - Error handling
  - Static file serving
- **File**: `backend/server.js`

### Backend Architecture

```
backend/
├── server.js              # Main application entry
├── config/
│   └── supabase.js       # Database configuration
├── routes/
│   ├── artists.js        # Artist authentication & profiles
│   ├── products.js       # Product CRUD operations
│   ├── orders.js         # Order management
│   ├── categories.js     # Product categories
│   ├── auth.js           # Authentication endpoints
│   └── upload.js         # Image upload handling
├── middleware/
│   └── auth.js           # JWT authentication middleware
└── scripts/
    └── supabase-clean-setup.sql  # Database schema
```

### API Endpoints

#### **Products API** (`/api/products`)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (auth required)
- `PUT /api/products/:id` - Update product (auth required)
- `DELETE /api/products/:id` - Delete product (auth required)

#### **Artists API** (`/api/artists`)
- `POST /api/artists/register` - Artist registration
- `POST /api/artists/login` - Artist authentication
- `GET /api/artists/:id` - Get artist profile
- `PUT /api/artists/:id` - Update profile (auth required)

#### **Orders API** (`/api/orders`)
- `POST /api/orders` - Create new order
- `GET /api/orders` - List orders (auth required)
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status (auth required)

#### **Categories API** (`/api/categories`)
- `GET /api/categories` - List all categories

#### **Upload API** (`/api/upload`)
- `POST /api/upload` - Upload product images

---

## 🗄️ Database & Storage

### **Supabase** (Primary Backend-as-a-Service)

#### **PostgreSQL Database**
- **Version**: PostgreSQL 15+
- **Hosting**: Supabase Cloud
- **Connection**: `https://hgzshxoshmsvwrrdgriv.supabase.co`
- **Purpose**: Primary data storage

#### **Database Schema**

##### **Categories Table**
```sql
- id: UUID (Primary Key)
- name: TEXT (Unique)
- description: TEXT
- created_at: TIMESTAMP
```
**Seeded Categories**: Pottery, Jewelry, Textiles, Woodworking, Painting, Glasswork, Metalwork, Photography, Paper Arts, Mixed Media

##### **Artists Table**
```sql
- id: UUID (Primary Key)
- email: TEXT (Unique)
- password_hash: TEXT
- business_name: TEXT
- bio: TEXT
- profile_image_url: TEXT
- location: TEXT
- website_url: TEXT
- phone: TEXT
- is_verified: BOOLEAN
- stripe_account_id: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

##### **Products Table**
```sql
- id: UUID (Primary Key)
- artist_id: UUID (Foreign Key → artists)
- category_id: UUID (Foreign Key → categories)
- name: TEXT
- description: TEXT
- price: DECIMAL(10,2)
- stock_quantity: INTEGER
- image_url: TEXT
- thumbnail_url: TEXT
- is_featured: BOOLEAN
- is_active: BOOLEAN
- dimensions: TEXT
- materials: TEXT
- weight: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

##### **Orders Table**
```sql
- id: UUID (Primary Key)
- customer_email: TEXT
- customer_name: TEXT
- shipping_address: JSONB
- billing_address: JSONB
- total_amount: DECIMAL(10,2)
- subtotal: DECIMAL(10,2)
- tax_amount: DECIMAL(10,2)
- shipping_amount: DECIMAL(10,2)
- status: TEXT (enum: pending, processing, shipped, delivered, cancelled, refunded)
- stripe_payment_intent_id: TEXT
- stripe_charge_id: TEXT
- tracking_number: TEXT
- notes: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

##### **Order Items Table**
```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key → orders)
- product_id: UUID (Foreign Key → products)
- artist_id: UUID (Foreign Key → artists)
- product_name: TEXT
- quantity: INTEGER
- price_at_purchase: DECIMAL(10,2)
- subtotal: DECIMAL(10,2)
- created_at: TIMESTAMP
```

#### **Database Features**
- ✅ Automatic UUID generation
- ✅ Auto-updating timestamps (triggers)
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Check constraints for data validation
- ✅ Cascade deletions

### **Supabase Storage**
- **Purpose**: Product image hosting
- **Bucket**: `product-images`
- **Access**: Public bucket for product images
- **Features**:
  - Direct file uploads
  - CDN-backed delivery
  - Automatic public URLs
  - Image optimization support

### **Why Supabase?**
- ✅ PostgreSQL (more powerful than MongoDB for relational data)
- ✅ Auto-generated REST API
- ✅ Real-time subscriptions (optional future feature)
- ✅ Built-in authentication (not currently used, but available)
- ✅ Built-in file storage
- ✅ Free tier: 500MB database, 1GB storage, 2GB bandwidth
- ✅ Row-level security (RLS) for fine-grained permissions
- ✅ Generous free tier for development and early production

---

## 💳 Payment Processing

### **Stripe**
- **Version**: ^14.7.0
- **SDK**: `stripe` npm package
- **Purpose**: Secure payment processing
- **Features**:
  - Credit card processing
  - Payment intents API
  - Webhook support for async events
  - PCI compliance (no sensitive data stored)
  - Multiple payment methods
  - Refund processing

#### **Payment Flow**
1. Customer initiates checkout
2. Frontend creates payment intent via backend
3. Stripe Elements securely collect card details
4. Payment confirmed via Stripe API
5. Order created in database
6. Confirmation email sent

#### **Configuration**
- **Environment Variables**:
  - `STRIPE_SECRET_KEY` - Server-side API key
  - `STRIPE_PUBLISHABLE_KEY` - Client-side key
  - `STRIPE_WEBHOOK_SECRET` - Webhook signature verification

---

## 🔐 Authentication & Security

### **JSON Web Tokens (JWT)**
- **Package**: `jsonwebtoken` ^9.0.2
- **Purpose**: Stateless artist authentication
- **Token Lifetime**: 7 days (configurable via `JWT_EXPIRES_IN`)
- **Storage**: Client-side localStorage or cookies
- **Endpoints**: `/api/artists/login`, `/api/artists/register`

### **Password Security**
- **Package**: `bcrypt` ^6.0.0
- **Purpose**: Password hashing
- **Algorithm**: bcrypt with salt rounds
- **Process**: 
  - Registration: Hash password before storing
  - Login: Compare hashed passwords

### **Security Middleware**

#### **Helmet.js**
- **Version**: ^7.1.0
- **Purpose**: HTTP security headers
- **Features**:
  - Content Security Policy (CSP)
  - XSS protection
  - MIME type sniffing prevention
  - Clickjacking protection

#### **CORS (Cross-Origin Resource Sharing)**
- **Version**: ^2.8.5
- **Purpose**: Control cross-origin requests
- **Configuration**: Restricted to frontend domain
- **Settings**: Credentials enabled for cookies

#### **Rate Limiting**
- **Package**: `express-rate-limit` ^7.1.5
- **Purpose**: Prevent brute force and DDoS attacks
- **Configuration**: 100 requests per 15-minute window per IP
- **Applied to**: All `/api/*` routes

### **Environment Variables Security**
- **Package**: `dotenv` ^16.3.1
- **Purpose**: Secure configuration management
- **File**: `.env` (git-ignored)
- **Critical Variables**:
  - Database credentials
  - API keys (Stripe, Supabase)
  - JWT secrets
  - Email service credentials

---

## 🖼️ Image Processing

### **Sharp**
- **Version**: ^0.33.1
- **Purpose**: High-performance image processing
- **Features**:
  - Resize images (max 1200x1200 for products)
  - Generate thumbnails (300x300 for listings)
  - Format conversion (WebP, JPEG)
  - Quality optimization
  - Fast processing (libvips-based)

#### **Image Pipeline**
1. Upload via `multer` (memory storage)
2. Process with Sharp:
   - Main image: 1200px max dimension, 90% quality
   - Thumbnail: 300x300 crop, 80% quality
3. Upload to Supabase Storage
4. Store public URLs in database

### **Multer**
- **Version**: ^1.4.5-lts.1
- **Purpose**: Multipart form-data handling (file uploads)
- **Configuration**: Memory storage for preprocessing
- **File Size Limit**: 5MB per file (configurable via `MAX_FILE_SIZE`)

---

## 🛠️ Development Tools

### **Package Management**
- **npm**: Node Package Manager
- **package.json**: Dependency management
- **package-lock.json**: Locked versions for consistency

### **Environment Management**
- **nodemon**: ^3.0.2 - Auto-restart on file changes
- **dotenv**: ^16.3.1 - Environment variable loading

### **Scripts** (package.json)
```json
{
  "start": "node backend/server.js",       // Production
  "dev": "nodemon backend/server.js",      // Development
  "test": "jest",                          // Testing (future)
  "build": "webpack --mode production"     // Build (if needed)
}
```

### **Code Quality** (Future Implementation)
- ESLint - JavaScript linting
- Prettier - Code formatting
- Jest - Unit testing
- Supertest - API endpoint testing

---

## 🌐 Deployment & Hosting

### **Recommended Hosting Options**

#### **Option 1: Railway / Render** (Recommended for MVP)
- **Type**: Platform-as-a-Service (PaaS)
- **Pros**: 
  - Easy deployment (connect GitHub repo)
  - Automatic HTTPS
  - Free tier available
  - Environment variable management
  - Automatic deployments on push
- **Configuration**: 
  - Port: 5000 (or from `process.env.PORT`)
  - Start command: `npm start`

#### **Option 2: DigitalOcean App Platform**
- **Type**: PaaS
- **Pros**: Simple scaling, good documentation
- **Pricing**: $5/month for basic tier

#### **Option 3: AWS / Google Cloud / Azure**
- **Type**: Infrastructure-as-a-Service (IaaS)
- **Pros**: Maximum control and scalability
- **Cons**: More complex setup
- **Services**: EC2, Elastic Beanstalk, Cloud Run, App Service

### **Custom Domain Setup**
- **Domain**: waartisanmarket.com
- **DNS Configuration**:
  - A record pointing to hosting IP
  - CNAME for www subdomain
  - SSL/TLS certificate (Let's Encrypt)

### **Deployment Checklist**
- [ ] Set `NODE_ENV=production`
- [ ] Configure production database (Supabase)
- [ ] Set secure `JWT_SECRET` (32+ character random string)
- [ ] Configure Stripe production keys
- [ ] Set up domain DNS records
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Set up monitoring and logging
- [ ] Database backups enabled
- [ ] Error tracking (Sentry recommended)

---

## 📧 Third-Party Services

### **Current Services**

#### **Supabase**
- **Purpose**: Database, Storage, Authentication
- **Tier**: Free (500MB DB, 1GB storage)
- **URL**: https://hgzshxoshmsvwrrdgriv.supabase.co
- **Dashboard**: https://supabase.com/dashboard

#### **Stripe**
- **Purpose**: Payment processing
- **Tier**: Pay-per-transaction (2.9% + $0.30 per charge)
- **Dashboard**: https://dashboard.stripe.com
- **Test Mode**: Currently using test keys

### **Future Services** (Not Yet Implemented)

#### **Email Service** (SendGrid or Nodemailer)
- **Purpose**: Transactional emails
- **Use Cases**:
  - Order confirmations
  - Shipping notifications
  - Password resets
  - Newsletter
- **Options**:
  - SendGrid (12,000 emails/month free)
  - Mailgun (5,000 emails/month free)
  - Gmail SMTP (basic, for testing)

#### **Google Analytics**
- **Purpose**: Website traffic analysis
- **Configuration**: `GOOGLE_ANALYTICS_ID`

#### **Error Tracking** (Sentry)
- **Purpose**: Real-time error monitoring
- **Features**: Stack traces, user context, performance monitoring

---

## 📊 Performance Optimizations

### **Current Optimizations**
- ✅ Image compression and resizing (Sharp)
- ✅ Response compression (gzip/deflate)
- ✅ Database indexes on frequently queried fields
- ✅ CDN for images (Supabase Storage)
- ✅ Static file caching

### **Future Optimizations**
- [ ] Redis caching for product listings
- [ ] Lazy loading for images
- [ ] Service workers for offline functionality
- [ ] CDN for static assets (Cloudflare)
- [ ] Database query optimization
- [ ] API response pagination
- [ ] Image WebP format support

---

## 🎯 Social Impact Features

### **Homelessness Support**
- **Contribution**: 5% of marketplace fees go to homelessness solutions
- **Implementation**: Calculated on each transaction
- **Configuration**: `HOMELESSNESS_CONTRIBUTION_PERCENTAGE=5`

### **Local Artisan Support**
- **Focus**: Washington state artisans only
- **Direct Sales**: Artists receive majority of sale price
- **Fee Structure**: 10% marketplace fee (configurable)
- **Configuration**: `MARKETPLACE_FEE_PERCENTAGE=10`

---

## 📈 Scalability Considerations

### **Current Limitations**
- Single server instance
- No horizontal scaling
- No caching layer
- Synchronous image processing

### **Scaling Strategy** (When Needed)
1. **Database**: Supabase handles scaling automatically
2. **Application**: 
   - Add load balancer
   - Multiple server instances
   - Session store (Redis)
3. **Images**: 
   - Async processing queue (Bull/Redis)
   - Separate image service
4. **CDN**: Cloudflare for global delivery

---

## 🔧 Development Environment Setup

### **Prerequisites**
```bash
- Node.js v24.1.0 or higher
- npm v10+ 
- Git
- Text editor (VS Code recommended)
- Supabase account
- Stripe account (test mode)
```

### **Quick Start**
```bash
# Clone repository
git clone https://github.com/your-username/MarketPlace.git
cd MarketPlace

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# Run database setup in Supabase SQL Editor
# (use backend/scripts/supabase-clean-setup.sql)

# Test connection
cd backend
node test-connection.js

# Start development server
npm run dev

# Server runs on http://localhost:5000
```

---

## 📝 API Documentation

Full API documentation available in: `API_DOCUMENTATION.md`

### **Base URL**
- Development: `http://localhost:5000/api`
- Production: `https://waartisanmarket.com/api`

### **Authentication**
- **Type**: JWT Bearer Token
- **Header**: `Authorization: Bearer <token>`
- **Required for**: Artist routes (create/update products, manage orders)

---

## 📚 Additional Documentation

- **Setup Guide**: `SETUP_GUIDE.md`
- **Quick Start**: `QUICKSTART.md`
- **API Docs**: `API_DOCUMENTATION.md`
- **README**: `README.md`

---

## 🎓 Technology Justifications

### **Why Supabase over MongoDB?**
1. **Relational Data**: E-commerce requires strong relationships (orders → products → artists)
2. **SQL Power**: Complex queries for reporting and analytics
3. **Built-in Features**: Storage, Auth, Real-time in one service
4. **Developer Experience**: Auto-generated API, excellent documentation
5. **Cost**: Generous free tier, transparent pricing

### **Why Vanilla JS over React/Vue?**
1. **Simplicity**: No build step, faster development for MVP
2. **Performance**: No framework overhead
3. **Learning**: Solid foundation before adding complexity
4. **SEO**: Better initial page load for search engines
5. **Flexibility**: Easy to add framework later if needed

### **Why Express over NestJS/Fastify?**
1. **Maturity**: Battle-tested, huge ecosystem
2. **Simplicity**: Minimal learning curve
3. **Documentation**: Extensive resources and examples
4. **Middleware**: Rich ecosystem of middleware
5. **Flexibility**: Unopinionated, adaptable to needs

---

## 🚀 Roadmap & Future Enhancements

### **Phase 1: MVP** (Current)
- [x] Basic product catalog
- [x] Artist registration and login
- [x] Shopping cart
- [x] Stripe checkout
- [x] Order management
- [x] Image uploads
- [x] Supabase integration

### **Phase 2: Enhanced Features**
- [ ] Email notifications
- [ ] Advanced search and filters
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Artist analytics dashboard
- [ ] Automated testing

### **Phase 3: Growth**
- [ ] Mobile app (React Native)
- [ ] Social media integration
- [ ] Referral program
- [ ] Advanced SEO optimization
- [ ] Multi-language support
- [ ] Subscription boxes

### **Phase 4: Scale**
- [ ] Wholesale marketplace
- [ ] Artist networking features
- [ ] Virtual craft fair events
- [ ] Educational content platform
- [ ] API for third-party integrations

---

## 📞 Support & Resources

### **Documentation**
- Node.js: https://nodejs.org/docs
- Express: https://expressjs.com
- Supabase: https://supabase.com/docs
- Stripe: https://stripe.com/docs

### **Community**
- Stack Overflow
- Reddit: r/webdev, r/node
- Discord: Supabase, Node.js

### **Project Repository**
- **Location**: `/Users/sonnysteele/Documents/GitHub/MarketPlace/`
- **Version Control**: Git
- **Hosting**: GitHub (recommended)

---

## 🏁 Conclusion

The Washington Artisan Marketplace leverages modern, production-ready technologies to create a scalable platform for local artisans. The stack prioritizes:

1. **Developer Experience**: Modern tools with excellent documentation
2. **Performance**: Fast response times and efficient processing
3. **Security**: Industry-standard authentication and encryption
4. **Scalability**: Architecture ready to grow with the business
5. **Cost Efficiency**: Free/low-cost services for MVP phase
6. **Social Impact**: Technology serving a greater mission

This tech stack provides a solid foundation for building a successful marketplace that supports Washington artisans and contributes to solving homelessness.

---

**Document Version**: 1.0  
**Last Updated**: January 27, 2026  
**Next Review**: March 2026
