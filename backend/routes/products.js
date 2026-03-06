/**
 * Products Routes - Supabase Version
 * API endpoints for product management
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const { sendFirstProductEmail, sendEmail } = require('../services/emailService');

// ===================================
// Public Routes
// ===================================

// GET /api/products - Get all active products with filtering
router.get('/', async (req, res) => {
    try {
        const {
            category_id,
            minPrice,
            maxPrice,
            artist_id,
            search,
            sort = 'created_at',
            order = 'desc',
            page = 1,
            limit = 12
        } = req.query;
        
        const from = (page - 1) * limit;
        const to = from + Number(limit) - 1;
        
        // Start building query
        let query = supabaseAdmin
            .from('products')
            .select(`
                *,
                artist:artist_id(id, business_name, profile_image_url, location),
                category:categories(id, name)
            `, { count: 'exact' })
            .eq('is_active', true)
            .eq('approval_status', 'approved');
        
        // Apply filters
        if (category_id) {
            // Support multiple category IDs (comma-separated)
            const categoryIds = category_id.split(',').map(id => id.trim()).filter(id => id);
            if (categoryIds.length === 1) {
                query = query.eq('category_id', categoryIds[0]);
            } else if (categoryIds.length > 1) {
                query = query.in('category_id', categoryIds);
            }
        }
        
        if (artist_id) {
            query = query.eq('artist_id', artist_id);
        }
        
        if (minPrice) {
            query = query.gte('price', Number(minPrice));
        }
        
        if (maxPrice) {
            query = query.lte('price', Number(maxPrice));
        }
        
        if (search) {
            // Simple text search on name and description
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
        }
        
        // Apply sorting and pagination
        query = query
            .order(sort, { ascending: order === 'asc' })
            .range(from, to);
        
        const { data: products, error, count } = await query;
        
        if (error) throw error;
        
        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products', message: error.message });
    }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                artist:artist_id(id, business_name, profile_image_url)
            `)
            .eq('is_featured', true)
            .eq('is_active', true)
            .eq('approval_status', 'approved')
            .limit(8)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ error: 'Error fetching featured products', message: error.message });
    }
});

// GET /api/products/new-arrivals - Get new arrival products
router.get('/new-arrivals', async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                artist:artist_id(id, business_name, profile_image_url)
            `)
            .eq('is_active', true)
            .eq('approval_status', 'approved')
            .order('created_at', { ascending: false })
            .limit(12);
        
        if (error) throw error;
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching new arrivals:', error);
        res.status(500).json({ error: 'Error fetching new arrivals', message: error.message });
    }
});

// GET /api/products/search - Search products
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.json([]);
        }
        
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select(`
                id,
                name,
                price,
                image_url,
                artist:artist_id(id, business_name)
            `)
            .eq('is_active', true)
            .eq('approval_status', 'approved')
            .or(`name.ilike.%${q}%,description.ilike.%${q}%,materials.ilike.%${q}%`)
            .limit(20);
        
        if (error) throw error;
        
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Error searching products', message: error.message });
    }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                artist:artist_id(
                    id,
                    business_name,
                    bio,
                    profile_image_url,
                    location,
                    website_url
                ),
                category:categories(id, name)
            `)
            .eq('id', req.params.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            throw error;
        }
        
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product', message: error.message });
    }
});

// GET /api/products/artist/:artistId - Get products by artist
router.get('/artist/:artistId', async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                category:categories(id, name)
            `)
            .eq('artist_id', req.params.artistId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching artist products:', error);
        res.status(500).json({ error: 'Error fetching artist products', message: error.message });
    }
});

// ===================================
// Protected Routes (Artist Only)
// ===================================

// POST /api/products - Create new product
router.post('/', authenticateToken, async (req, res) => {
    try {
        const productData = {
            ...req.body,
            artist_id: req.artist.id,
            is_active: false,
            is_featured: false,
            approval_status: 'pending'
        };
        
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .insert([productData])
            .select(`
                *,
                artist:artist_id(id, business_name, email),
                category:categories(id, name)
            `)
            .single();
        
        if (error) throw error;
        
        // Send product received notification to artist
        sendEmail(
            product.artist.email,
            `📦 Product Received — "${product.name}" is under review`,
            buildProductReceivedEmail(product.artist.business_name, product.name),
            req.artist.id,
            'product_received'
        ).catch(err => console.error('Error sending product received email:', err));

        // Notify admin of new product to review
        sendEmail(
            'admin@amyshaven.com',
            `🔔 New product pending review: "${product.name}" by ${product.artist.business_name}`,
            buildAdminNotificationEmail(product.artist.business_name, product.name, product.id),
            null,
            'admin_product_notification'
        ).catch(err => console.error('Error sending admin notification email:', err));

        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ 
            error: 'Error creating product',
            message: error.message 
        });
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        // First check if product belongs to artist
        const { data: existingProduct, error: checkError } = await supabaseAdmin
            .from('products')
            .select('artist_id')
            .eq('id', req.params.id)
            .single();
        
        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            throw checkError;
        }
        
        if (existingProduct.artist_id !== req.artist.id) {
            return res.status(403).json({ error: 'Not authorized to update this product' });
        }
        
        // Define allowed fields
        const allowedFields = [
            'name', 'description', 'category_id', 'price', 'stock_quantity',
            'materials', 'dimensions', 'weight', 'image_url', 'thumbnail_url',
            'is_featured', 'is_active'
        ];
        
        // Filter updates to only allowed fields
        const updates = {};
        allowedFields.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        // Update product
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .update(updates)
            .eq('id', req.params.id)
            .select(`
                *,
                artist:artist_id(id, business_name),
                category:categories(id, name)
            `)
            .single();
        
        if (error) throw error;
        
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ 
            error: 'Error updating product',
            message: error.message 
        });
    }
});

// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        // First check if product belongs to artist
        const { data: existingProduct, error: checkError } = await supabaseAdmin
            .from('products')
            .select('artist_id')
            .eq('id', req.params.id)
            .single();
        
        if (checkError) {
            if (checkError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Product not found' });
            }
            throw checkError;
        }
        
        if (existingProduct.artist_id !== req.artist.id) {
            return res.status(403).json({ error: 'Not authorized to delete this product' });
        }
        
        // Soft delete by setting is_active to false
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .update({ is_active: false })
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        
        // Return 204 No Content for successful deletion
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product', message: error.message });
    }
});

// ───────────────────────────────────────────────
// Email templates used by product creation
// ───────────────────────────────────────────────
function buildProductReceivedEmail(artistName, productName) {
    return `
<!DOCTYPE html><html><head><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:0 auto;padding:20px;}
.header{background:linear-gradient(135deg,#6B46C1,#8B5CF6);color:#fff;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;}
.body{background:#f9fafb;padding:32px 24px;border-radius:0 0 12px 12px;}
.info-box{background:#EDE9FE;border-left:4px solid #6B46C1;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;}
.step{display:flex;align-items:flex-start;gap:12px;margin:12px 0;}
.step-num{background:#6B46C1;color:#fff;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0;font-size:14px;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <div style="font-size:48px;margin-bottom:8px;">📦</div>
    <h1 style="margin:0;">Product Received!</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Amy's Haven Marketplace</p>
  </div>
  <div class="body">
    <h2>Hi ${artistName}! 👋</h2>
    <p>We've received your product listing and it's now <strong>under review</strong> by our team.</p>
    <div class="info-box">
      <strong>📦 Product:</strong> ${productName}<br>
      <strong>⏱ Review time:</strong> Within 24 hours<br>
      <strong>📧 Notification:</strong> We'll email you once reviewed
    </div>
    <h3>What happens next?</h3>
    <div class="step"><div class="step-num">1</div><div><strong>Review</strong> — Our team checks your listing for quality, accuracy, and guidelines compliance.</div></div>
    <div class="step"><div class="step-num">2</div><div><strong>Decision</strong> — You'll receive an email within 24 hours with the outcome.</div></div>
    <div class="step"><div class="step-num">3</div><div><strong>Go Live</strong> — Once approved, your product will be immediately visible to shoppers!</div></div>
    <p style="margin-top:24px;">While you wait, you can add more products or complete your artist profile to boost your shop's visibility.</p>
    <p style="color:#6B7280;font-size:14px;margin-top:24px;">Questions? Contact us at <a href="mailto:admin@amyshaven.com">admin@amyshaven.com</a></p>
    <p>— The Amy's Haven Team</p>
  </div>
</div>
</body></html>`;
}

function buildAdminNotificationEmail(artistName, productName, productId) {
    return `
<!DOCTYPE html><html><head><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:0 auto;padding:20px;}
.header{background:linear-gradient(135deg,#1F2937,#374151);color:#fff;padding:24px;text-align:center;border-radius:12px 12px 0 0;}
.body{background:#f9fafb;padding:32px 24px;border-radius:0 0 12px 12px;}
.btn{display:inline-block;background:#6B46C1;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;margin:20px 0;}
.info-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #E5E7EB;font-size:14px;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1 style="margin:0;">🔔 New Product Pending Review</h1>
  </div>
  <div class="body">
    <p>A new product has been submitted and requires your approval before it goes live.</p>
    <div class="info-row"><span><strong>Product:</strong></span><span>${productName}</span></div>
    <div class="info-row"><span><strong>Artist:</strong></span><span>${artistName}</span></div>
    <div class="info-row"><span><strong>Product ID:</strong></span><span>${productId}</span></div>
    <div class="info-row"><span><strong>Submitted:</strong></span><span>${new Date().toLocaleString()}</span></div>
    <a href="https://amyshaven.com/admin/product-approvals.html" class="btn">Review in Admin Dashboard</a>
    <p style="color:#6B7280;font-size:13px;">This is an automated notification from Amy's Haven.</p>
  </div>
</div>
</body></html>`;
}

module.exports = router;
