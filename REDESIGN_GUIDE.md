# 🎨 Marketplace Redesign - Implementation Guide

**Date**: January 27, 2026  
**Theme**: Modern Purple Gradient (Nike-inspired)  
**Status**: Backend Complete, Frontend In Progress

---

## ✅ What's Been Completed

### 1. **Design System Created** ✅
- **File**: `/frontend/css/design-system.css`
- **Features**:
  - Complete CSS variable system
  - Purple gradient color scheme (#8B5CF6)
  - Reusable component classes
  - Responsive breakpoints
  - Typography system
  - Button, card, form components

### 2. **Customer Authentication Backend** ✅
- **File**: `/backend/routes/customers.js`
- **Endpoints**:
  - `POST /api/customers/register` - Sign up
  - `POST /api/customers/login` - Login
  - `POST /api/customers/forgot-password` - Request reset
  - `POST /api/customers/reset-password` - Reset password
  - `GET /api/customers/me` - Get profile (protected)
  - `PUT /api/customers/me` - Update profile (protected)
  - `GET /api/customers/me/orders` - Get orders (protected)

### 3. **Database Table Created** ✅
- **File**: `/backend/scripts/create-customers-table.sql`
- **Table**: `customers`
- **Fields**: id, email, password_hash, name, phone, address, timestamps

### 4. **Server Updated** ✅
- Customer routes added to Express server
- Ready to handle authentication requests

---

## 🚀 Next Steps - What You Need to Do

### **Step 1: Run SQL Script in Supabase** 🔴 REQUIRED

1. Go to **Supabase Dashboard**:
   ```
   https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv/sql
   ```

2. **Copy and run** the SQL from:
   ```
   /backend/scripts/create-customers-table.sql
   ```

3. This creates the `customers` table

---

### **Step 2: Restart Your Server**

```bash
# Stop current server (Ctrl+C)
cd /Users/sonnysteele/Documents/GitHub/MarketPlace
npm run dev
```

---

### **Step 3: Test Customer Authentication**

#### **Register a Customer**
```bash
curl -X POST http://localhost:3000/api/customers/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123",
    "name": "Test Customer"
  }'
```

#### **Login**
```bash
curl -X POST http://localhost:3000/api/customers/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "password123"
  }'
```

---

## 🎨 Design System Usage

### **Color Scheme**

```css
/* Primary Purple */
--primary-500: #8B5CF6;      /* Main purple */
--primary-600: #7C3AED;      /* Darker */
--primary-700: #6D28D9;      /* Deepest */

/* Accents */
--accent-mint: #10B981;      /* Success/Green */
--accent-coral: #F97316;     /* Orange */
--accent-pink: #EC4899;      /* Pink */

/* Neutrals */
--gray-900: #111827;         /* Text */
--gray-100: #F3F4F6;         /* Background */
--white: #FFFFFF;            /* Cards */
```

### **Component Classes**

#### **Buttons**
```html
<!-- Primary purple gradient button -->
<button class="btn btn-primary">Shop Now</button>

<!-- Outline button -->
<button class="btn btn-secondary">Learn More</button>

<!-- Ghost button -->
<button class="btn btn-ghost">Cancel</button>

<!-- Sizes -->
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-full">Full Width</button>
```

#### **Cards**
```html
<!-- Basic card -->
<div class="card">
  <h3 class="heading-3">Product Name</h3>
  <p class="text-body">Description here</p>
</div>

<!-- Product card -->
<div class="card-product">
  <img src="..." alt="Product">
  <div style="padding: 16px;">
    <h4 class="heading-4">$29.99</h4>
  </div>
</div>
```

#### **Forms**
```html
<div class="form-group">
  <label class="form-label">Email</label>
  <input type="email" class="form-input" placeholder="your@email.com">
  <span class="form-error">This field is required</span>
</div>
```

#### **Typography**
```html
<h1 class="heading-1">Main Title</h1>
<h2 class="heading-2">Section Title</h2>
<h3 class="heading-3">Subsection</h3>
<p class="text-body">Body text</p>
<p class="text-small">Small text</p>
```

#### **Badges**
```html
<span class="badge badge-purple">New</span>
<span class="badge badge-green">In Stock</span>
<span class="badge badge-pink">Sale</span>
```

---

## 📄 Frontend Pages Needed

### **Priority 1: Auth Pages** 🔴

Create these files:

#### **1. Customer Login Page**
```
/frontend/login.html
```
**Should include**:
- Email & password fields
- "Forgot Password?" link
- "Sign Up" link
- Purple gradient login button
- Use design-system.css

#### **2. Customer Signup Page**
```
/frontend/signup.html
```
**Should include**:
- Name, email, password fields
- Password confirmation
- Terms & conditions checkbox
- Purple gradient signup button
- "Already have an account?" link

#### **3. Forgot Password Page**
```
/frontend/forgot-password.html
```
**Should include**:
- Email field
- Submit button
- Back to login link

#### **4. Reset Password Page**
```
/frontend/reset-password.html
```
**Should include**:
- New password field
- Confirm password field
- Submit button

---

### **Priority 2: Update Existing Pages** 🟡

#### **Homepage (index.html)**
- Add design-system.css
- Update colors to purple theme
- Add "Login" and "Sign Up" buttons to header
- Modernize hero section with gradient

#### **Products Page (frontend/products.html)**
- Add design-system.css
- Update product cards
- Add filters with new styling
- Shopping cart icon in header

---

## 🛠️ JavaScript Authentication Logic

### **Example: Login Form Handler**

```javascript
// frontend/js/auth.js

async function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    try {
        const response = await fetch('http://localhost:3000/api/customers/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store token
            localStorage.setItem('customerToken', data.token);
            localStorage.setItem('customer', JSON.stringify(data.customer));
            
            // Redirect to homepage
            window.location.href = '/';
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Network error. Please try again.');
    }
}
```

### **Check if Customer is Logged In**

```javascript
function isCustomerLoggedIn() {
    return localStorage.getItem('customerToken') !== null;
}

function getCustomerInfo() {
    const customerData = localStorage.getItem('customer');
    return customerData ? JSON.parse(customerData) : null;
}

function logout() {
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customer');
    window.location.href = '/login.html';
}
```

---

## 📁 File Structure

```
MarketPlace/
├── frontend/
│   ├── css/
│   │   ├── design-system.css     ✅ Created
│   │   └── main.css              🔄 Update with new theme
│   ├── js/
│   │   ├── auth.js               🔴 Create (login/signup logic)
│   │   └── main.js               🔄 Update
│   ├── login.html                🔴 Create
│   ├── signup.html               🔴 Create
│   ├── forgot-password.html      🔴 Create
│   ├── reset-password.html       🔴 Create
│   ├── products.html             🔄 Update styling
│   └── account/
│       ├── profile.html          🔴 Create
│       └── orders.html           🔴 Create
├── backend/
│   ├── routes/
│   │   └── customers.js          ✅ Created
│   └── scripts/
│       └── create-customers-table.sql  ✅ Created
└── index.html                     🔄 Update header & colors
```

---

## 🎯 Quick Wins - Start Here

### **1. Create Login Page (15 minutes)**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - WA Artisan Marketplace</title>
    <link rel="stylesheet" href="/frontend/css/design-system.css">
    <style>
        .login-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--gradient-light);
        }
        
        .login-card {
            background: var(--white);
            border-radius: var(--radius-2xl);
            box-shadow: var(--shadow-xl);
            padding: var(--space-8);
            width: 100%;
            max-width: 400px;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <h1 class="heading-2 text-center mb-6">Welcome Back</h1>
            
            <form id="loginForm">
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" id="email" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Password</label>
                    <input type="password" class="form-input" id="password" required>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full btn-lg">
                    Login
                </button>
            </form>
            
            <div class="text-center mt-4">
                <a href="/forgot-password.html" class="text-small">Forgot Password?</a>
            </div>
            
            <div class="text-center mt-2">
                <span class="text-small">Don't have an account? </span>
                <a href="/signup.html">Sign Up</a>
            </div>
        </div>
    </div>
    
    <script src="/frontend/js/auth.js"></script>
    <script>
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    </script>
</body>
</html>
```

---

## ✨ Benefits of This System

### **Reusable CSS**
- Change `--primary-500` once → Updates entire site
- Consistent spacing, colors, typography
- Easy to maintain

### **Separate Customer & Artist Auth**
- Customers: Browse & buy
- Artists: Sell & manage
- Clear separation of concerns

### **Modern Design**
- Purple gradient theme
- Clean, mobile-first
- Professional appearance

---

## 📊 API Endpoints Summary

### **Customer Auth**
```
POST   /api/customers/register      # Sign up
POST   /api/customers/login         # Login
POST   /api/customers/forgot-password
POST   /api/customers/reset-password
GET    /api/customers/me            # Get profile (auth required)
PUT    /api/customers/me            # Update profile
GET    /api/customers/me/orders     # Get orders
```

### **Artist Auth** (Already exists)
```
POST   /api/artists/register
POST   /api/artists/login
GET    /api/artists/me/profile
```

### **Products** (Public)
```
GET    /api/products
GET    /api/products/featured
GET    /api/products/:id
GET    /api/categories
```

---

## 🎨 Color Palette Reference

| Color | Hex | Usage |
|-------|-----|-------|
| Purple | `#8B5CF6` | Primary buttons, links |
| Dark Purple | `#6D28D9` | Hover states |
| Light Purple | `#F5F3FF` | Backgrounds |
| Mint Green | `#10B981` | Success messages |
| Coral | `#F97316` | Accent/CTA |
| Gray 900 | `#111827` | Main text |
| White | `#FFFFFF` | Cards, forms |

---

## 🚀 Ready to Launch Checklist

- [ ] Run SQL script in Supabase
- [ ] Restart server
- [ ] Test customer registration API
- [ ] Test customer login API
- [ ] Create login.html
- [ ] Create signup.html
- [ ] Create auth.js
- [ ] Update index.html with new colors
- [ ] Update products.html with new design
- [ ] Add "Login" button to header
- [ ] Test full login flow

---

**Next Steps**: Create the frontend auth pages using the design system!

Would you like me to create the complete login page HTML/JS next?
