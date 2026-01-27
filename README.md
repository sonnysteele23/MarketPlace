# 🎨 Washington Artisan Marketplace

> Empowering Washington state artisans while supporting solutions to homelessness

[![Tech Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20Express%20%7C%20Supabase-blue)](./TECH_STACK.md)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20(Supabase)-green)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

---

## 🌟 Overview

The Washington Artisan Marketplace is an e-commerce platform designed to connect local artisans with customers while contributing 5% of marketplace fees to homelessness solutions in Washington state.

**Live Demo**: Coming Soon  
**Repository**: https://github.com/sonnysteele/MarketPlace

---

## ✨ Features

### For Customers
- 🛍️ Browse handcrafted products from local artisans
- 🔍 Search and filter by category, price, location
- 💳 Secure checkout with Stripe
- 📦 Order tracking
- ❤️ Support local artists and social causes

### For Artists
- 🎨 Create and manage product listings
- 📊 View sales analytics and statistics
- 📸 Upload product images
- 📋 Manage orders and shipping
- 💰 Direct payments via Stripe

### Social Impact
- 💝 5% of marketplace fees support homelessness solutions
- 🤝 Direct support for local Washington artisans
- 🌱 Sustainable, handmade products

---

## 🚀 Quick Start

### Prerequisites
- Node.js v24+ 
- npm v10+
- Supabase account
- Stripe account (test mode)

### Installation

```bash
# Clone repository
git clone https://github.com/sonnysteele/MarketPlace.git
cd MarketPlace

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase and Stripe credentials

# Run database setup in Supabase SQL Editor
# Use: backend/scripts/supabase-clean-setup.sql

# Test connection
cd backend
node test-connection.js

# Start development server
npm run dev
```

Server runs at `http://localhost:5000`

---

## 📚 Documentation

- **[Tech Stack](./TECH_STACK.md)** - Complete technical documentation
- **[Supabase Migration](./SUPABASE_MIGRATION.md)** - Database migration guide
- **[API Documentation](./API_DOCUMENTATION.md)** - API endpoints reference
- **[Setup Guide](./SETUP_GUIDE.md)** - Detailed setup instructions
- **[Quick Start](./QUICKSTART.md)** - Get started in 5 minutes

---

## 🏗️ Tech Stack

### Frontend
- HTML5, CSS3, Vanilla JavaScript
- Responsive design (mobile-first)
- Stripe Elements for payments

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Supabase** - PostgreSQL database + storage
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Stripe** - Payment processing
- **Sharp** - Image processing
- **Multer** - File uploads

### Database
- **PostgreSQL** via Supabase
- 5 tables: artists, products, categories, orders, order_items
- Automatic timestamps and UUIDs
- Foreign key relationships

[**→ View Complete Tech Stack**](./TECH_STACK.md)

---

## 📁 Project Structure

```
MarketPlace/
├── backend/
│   ├── config/
│   │   └── supabase.js       # Database config
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── artists.js         # Artist endpoints
│   │   ├── products.js        # Product endpoints
│   │   ├── orders.js          # Order endpoints
│   │   ├── categories.js      # Category endpoints
│   │   └── upload.js          # Image upload
│   ├── scripts/
│   │   └── supabase-clean-setup.sql  # DB schema
│   ├── server.js              # Main server
│   └── test-connection.js     # Connection test
├── frontend/                  # Customer interface
├── artist-cms/                # Artist dashboard
├── public/                    # Static assets
├── .env                       # Environment variables
├── package.json               # Dependencies
└── README.md                  # This file
```

---

## 🔌 API Endpoints

### Public Endpoints
```
GET    /api/categories              # List categories
GET    /api/products                # List products (with filters)
GET    /api/products/featured       # Featured products
GET    /api/products/search         # Search products
GET    /api/products/:id            # Get single product
GET    /api/artists                 # List artists
GET    /api/artists/:id             # Get artist profile
POST   /api/orders                  # Create order
```

### Protected Endpoints (Require Auth)
```
POST   /api/artists/register        # Register artist
POST   /api/artists/login           # Artist login
GET    /api/artists/me/profile      # Get profile
PUT    /api/artists/me              # Update profile
GET    /api/artists/me/products     # Get own products
GET    /api/artists/me/stats        # Get statistics
POST   /api/products                # Create product
PUT    /api/products/:id            # Update product
DELETE /api/products/:id            # Archive product
GET    /api/orders/artist/me        # Get orders
PUT    /api/orders/:id/status       # Update order status
```

[**→ View Complete API Documentation**](./API_DOCUMENTATION.md)

---

## 🗄️ Database Schema

### Tables
- **categories** - 10 product categories (Pottery, Jewelry, Textiles, etc.)
- **artists** - Artist accounts with profiles
- **products** - Marketplace products with images
- **orders** - Customer orders with Stripe integration
- **order_items** - Individual items in orders

[**→ View Database Schema**](./TECH_STACK.md#database-schema)

---

## 🔐 Environment Variables

```bash
# Supabase
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Authentication
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## 🧪 Testing

### Test Database Connection
```bash
cd backend
node test-connection.js
```

### Test API Endpoints
```bash
# Test categories
curl http://localhost:5000/api/categories

# Test products
curl http://localhost:5000/api/products

# Test artist registration
curl -X POST http://localhost:5000/api/artists/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "business_name": "Test Artist"
  }'
```

---

## 🚢 Deployment

### Recommended Platforms
- **Railway** - Easy Node.js deployment
- **Render** - Free tier available
- **DigitalOcean** - App Platform
- **Vercel** - For frontend

### Deployment Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Generate secure `JWT_SECRET`
- [ ] Configure production Stripe keys
- [ ] Set up custom domain
- [ ] Enable HTTPS
- [ ] Configure CORS
- [ ] Set up error monitoring
- [ ] Enable database backups

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Write clear commit messages
- Add tests for new features
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Supabase** - Backend-as-a-Service platform
- **Stripe** - Payment processing
- **Washington Artisans** - The talented creators who make this possible
- **Open Source Community** - For amazing tools and libraries

---

## 📞 Contact & Support

- **Developer**: Sonny Steele
- **Project**: Washington Artisan Marketplace
- **GitHub**: https://github.com/sonnysteele/MarketPlace
- **Issues**: https://github.com/sonnysteele/MarketPlace/issues

---

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Product catalog
- [x] Artist accounts
- [x] Shopping cart
- [x] Stripe checkout
- [x] Order management
- [x] Supabase integration

### Phase 2: Enhanced Features
- [ ] Email notifications
- [ ] Advanced search
- [ ] Product reviews
- [ ] Wishlist
- [ ] Artist analytics
- [ ] Automated testing

### Phase 3: Growth
- [ ] Mobile app
- [ ] Social media integration
- [ ] Referral program
- [ ] SEO optimization
- [ ] Multi-language support

### Phase 4: Scale
- [ ] Wholesale marketplace
- [ ] Artist networking
- [ ] Virtual craft fairs
- [ ] Educational content
- [ ] Third-party API

---

## 🌟 Star This Project

If you find this project useful, please consider giving it a star on GitHub! ⭐

---

**Built with ❤️ in Washington State**
