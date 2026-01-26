# API Documentation

Complete API reference for the Washington Artisan Marketplace backend.

## Base URL
```
http://localhost:5000/api
```

## Authentication

Most protected endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Products API

### GET /products
Get all active products with filtering and pagination.

**Query Parameters:**
- `category` - Filter by category slug
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `artist` - Filter by artist ID
- `search` - Text search
- `sort` - Sort field (default: 'createdAt')
- `order` - Sort order: 'asc' or 'desc' (default: 'desc')
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 12)

**Example:**
```bash
curl "http://localhost:5000/api/products?category=jewelry&page=1&limit=12"
```

### GET /products/featured
Get featured products (max 8).

### GET /products/new-arrivals
Get new arrival products (max 12).

### GET /products/:id
Get a single product by ID.

### POST /products
Create a new product (requires authentication).

**Request Body:**
```json
{
  "name": "Handmade Silver Necklace",
  "description": "Beautiful handcrafted silver necklace...",
  "category": "jewelry",
  "price": 89.99,
  "quantity": 5,
  "materials": "Sterling silver, gemstones",
  "dimensions": "18 inches long",
  "images": [
    {
      "url": "/uploads/products/image.jpg",
      "alt": "Silver necklace",
      "isMain": true
    }
  ],
  "tags": ["handmade", "silver", "jewelry"]
}
```

### PUT /products/:id
Update a product (requires authentication and ownership).

### DELETE /products/:id
Archive a product (requires authentication and ownership).

---

## Artists API

### GET /artists
Get all active artists.

**Query Parameters:**
- `city` - Filter by city
- `category` - Filter by category
- `page` - Page number
- `limit` - Items per page
- `sort` - Sort field (default: 'totalSales')

### GET /artists/featured
Get featured artists (top 6 by sales).

### GET /artists/:id
Get artist by ID.

### GET /artists/slug/:slug
Get artist by slug.

### GET /artists/:id/products
Get all products by an artist.

### GET /artists/me/profile
Get current authenticated artist's profile.

### PUT /artists/me
Update current artist's profile.

### GET /artists/me/products
Get current artist's products.

### GET /artists/me/stats
Get current artist's statistics.

### POST /artists/apply
Apply to become an artist.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "phone": "206-555-0123",
  "city": "Seattle",
  "zipCode": "98101",
  "bio": "Local artist specializing in pottery",
  "categories": ["pottery", "home-decor"],
  "isHomeless": false
}
```

---

## Categories API

### GET /categories
Get all active categories.

### GET /categories/:slug
Get category by slug.

### GET /categories/:slug/products
Get all products in a category.

### GET /categories/stats/counts
Get product counts for all categories.

---

## Orders API

### POST /orders
Create a new order.

**Request Body:**
```json
{
  "customer": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "206-555-0123"
  },
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Seattle",
    "state": "WA",
    "zipCode": "98101"
  },
  "items": [
    {
      "productId": "product_id_here",
      "quantity": 1
    }
  ],
  "paymentMethod": "stripe"
}
```

### GET /orders/:orderNumber
Get order by order number.

### POST /orders/:orderId/confirm-payment
Confirm payment for an order.

### GET /orders/customer/:email
Get all orders for a customer email.

### GET /orders/artist/me
Get current artist's orders (requires authentication).

### PUT /orders/:orderId/update-status
Update order status (requires authentication).

### POST /orders/:orderId/add-tracking
Add tracking information (requires authentication).

---

## Authentication API

### POST /auth/register
Register a new artist account.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "securePassword123",
  "city": "Seattle",
  "categories": ["pottery"]
}
```

**Response:**
```json
{
  "message": "Registration successful!",
  "artist": { ... },
  "token": "jwt-token-here",
  "refreshToken": "refresh-token-here"
}
```

### POST /auth/login
Login to an artist account.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "password": "securePassword123"
}
```

### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "refresh-token-here"
}
```

### POST /auth/forgot-password
Request password reset.

**Request Body:**
```json
{
  "email": "jane@example.com"
}
```

### POST /auth/reset-password
Reset password with token.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

### POST /auth/change-password
Change password (requires authentication).

**Request Body:**
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

### GET /auth/verify
Verify if token is still valid.

---

## Upload API

### POST /upload/product-image
Upload a single product image (requires authentication).

**Form Data:**
- `image` - Image file (max 5MB, jpeg/jpg/png/gif/webp)

**Response:**
```json
{
  "message": "Image uploaded successfully",
  "image": {
    "filename": "product-1234567890.jpg",
    "path": "/uploads/products/product-1234567890.jpg",
    "thumbnail": "/uploads/products/thumb-product-1234567890.jpg",
    "size": 125678
  }
}
```

### POST /upload/product-images
Upload multiple product images (max 5, requires authentication).

**Form Data:**
- `images` - Multiple image files

### POST /upload/artist-image
Upload artist profile image (requires authentication).

### POST /upload/artist-cover
Upload artist cover image (requires authentication).

### DELETE /upload/image
Delete an image (requires authentication).

**Request Body:**
```json
{
  "imagePath": "/uploads/products/product-1234567890.jpg"
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message here",
  "details": "Additional details (in development mode)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **100 requests per 15 minutes** per IP address for all API endpoints
- Exceeding the limit returns `429 Too Many Requests`

---

## Testing with cURL

### Register an artist
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Artist",
    "email": "test@example.com",
    "password": "password123",
    "city": "Seattle",
    "categories": ["jewelry"]
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create a product (with token)
```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Silver Ring",
    "description": "Handmade silver ring",
    "category": "jewelry",
    "price": 45.00,
    "quantity": 10
  }'
```

---

**For full implementation details, see the route files in `/backend/routes/`**
