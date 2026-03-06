/**
 * Admin Routes
 * - Admin login (admin@amyshaven.com)
 * - Product approval queue
 * - Approve / reject products
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendEmail } = require('../services/emailService');

// ───────────────────────────────────────────────
// Middleware: require admin JWT
// ───────────────────────────────────────────────
const requireAdmin = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) return res.status(401).json({ error: 'No token provided' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role !== 'admin') return res.status(403).json({ error: 'Not an admin token' });

        const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('id, email, name')
            .eq('id', decoded.id)
            .single();

        if (error || !admin) return res.status(401).json({ error: 'Admin not found' });

        req.admin = admin;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token expired' });
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// ───────────────────────────────────────────────
// POST /api/admin/login
// ───────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();

        if (error || !admin) return res.status(401).json({ error: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, admin.password_hash);
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        const { password_hash, ...adminData } = admin;
        res.json({ message: 'Login successful', admin: adminData, token });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// ───────────────────────────────────────────────
// GET /api/admin/me  (verify token)
// ───────────────────────────────────────────────
router.get('/me', requireAdmin, (req, res) => {
    res.json({ admin: req.admin });
});

// ───────────────────────────────────────────────
// GET /api/admin/products/pending
// ───────────────────────────────────────────────
router.get('/products/pending', requireAdmin, async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                artist:artist_id(id, business_name, email, profile_image_url),
                category:categories(id, name)
            `)
            .eq('approval_status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(products);
    } catch (err) {
        console.error('Error fetching pending products:', err);
        res.status(500).json({ error: 'Error fetching pending products' });
    }
});

// ───────────────────────────────────────────────
// GET /api/admin/products  (all, with filter)
// ───────────────────────────────────────────────
router.get('/products', requireAdmin, async (req, res) => {
    try {
        const { status = 'all' } = req.query;

        let query = supabaseAdmin
            .from('products')
            .select(`
                *,
                artist:artist_id(id, business_name, email),
                category:categories(id, name)
            `)
            .order('created_at', { ascending: false });

        if (status !== 'all') {
            query = query.eq('approval_status', status);
        }

        const { data: products, error } = await query;
        if (error) throw error;
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// ───────────────────────────────────────────────
// POST /api/admin/products/:id/approve
// ───────────────────────────────────────────────
router.post('/products/:id/approve', requireAdmin, async (req, res) => {
    try {
        console.log('Approving product:', req.params.id);

        const approveData = {
            approval_status: 'approved',
            is_active: true
        };
        try { approveData.reviewed_at = new Date().toISOString(); } catch(e) {}
        try { approveData.reviewed_by = req.admin.email; } catch(e) {}

        const { data: product, error } = await supabaseAdmin
            .from('products')
            .update(approveData)
            .eq('id', req.params.id)
            .select(`*, artist:artist_id(id, business_name, email)`)
            .single();

        console.log('Approve result - error:', error, 'product:', product?.id);

        if (error) throw error;

        // Email artist
        if (product.artist?.email) {
            sendEmail(
                product.artist.email,
                `✅ Your product "${product.name}" has been approved!`,
                buildApprovalEmail(product.artist.business_name, product.name),
                null,
                'product_approved'
            ).catch(console.error);
        }

        res.json({ message: 'Product approved', product });
    } catch (err) {
        console.error('Error approving product:', err);
        res.status(500).json({ error: 'Error approving product' });
    }
});

// ───────────────────────────────────────────────
// POST /api/admin/products/:id/reject
// ───────────────────────────────────────────────
router.post('/products/:id/reject', requireAdmin, async (req, res) => {
    try {
        const { reason = 'Your product did not meet our marketplace guidelines.' } = req.body;

        console.log('Rejecting product:', req.params.id, 'reason:', reason);

        // Update only fields we know exist, add optional fields carefully
        const updateData = {
            approval_status: 'rejected',
            is_active: false
        };

        // Add optional columns if they exist
        try { updateData.reviewed_at = new Date().toISOString(); } catch(e) {}
        try { updateData.reviewed_by = req.admin.email; } catch(e) {}
        try { updateData.rejection_reason = reason; } catch(e) {}

        const { data: product, error } = await supabaseAdmin
            .from('products')
            .update(updateData)
            .eq('id', req.params.id)
            .select(`*, artist:artist_id(id, business_name, email)`)
            .single();

        console.log('Reject result - error:', error, 'product:', product?.id);

        if (error) throw error;

        // Email artist
        if (product.artist?.email) {
            sendEmail(
                product.artist.email,
                `Product "${product.name}" — Review Update`,
                buildRejectionEmail(product.artist.business_name, product.name, reason),
                null,
                'product_rejected'
            ).catch(console.error);
        }

        res.json({ message: 'Product rejected', product });
    } catch (err) {
        console.error('Error rejecting product:', err);
        res.status(500).json({ error: 'Error rejecting product' });
    }
});

// ───────────────────────────────────────────────
// GET /api/admin/stats
// ───────────────────────────────────────────────
router.get('/stats', requireAdmin, async (req, res) => {
    try {
        const [pending, approved, rejected, orders] = await Promise.all([
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('approval_status', 'pending'),
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('approval_status', 'approved'),
            supabaseAdmin.from('products').select('id', { count: 'exact', head: true }).eq('approval_status', 'rejected'),
            supabaseAdmin.from('orders').select('id', { count: 'exact', head: true })
        ]);

        res.json({
            pendingProducts: pending.count || 0,
            approvedProducts: approved.count || 0,
            rejectedProducts: rejected.count || 0,
            totalOrders: orders.count || 0
        });
    } catch (err) {
        console.error('Error fetching stats:', err);
        res.status(500).json({ error: 'Error fetching stats' });
    }
});

// ───────────────────────────────────────────────
// One-time setup: POST /api/admin/setup
// Creates the admin@amyshaven.com account
// REMOVE or SECURE this endpoint after first use!
// ───────────────────────────────────────────────
router.post('/setup', async (req, res) => {
    try {
        const { secret, password } = req.body;

        // Require a setup secret to prevent abuse
        if (secret !== process.env.ADMIN_SETUP_SECRET) {
            return res.status(403).json({ error: 'Invalid setup secret' });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }

        // Check if admin already exists
        const { data: existing } = await supabaseAdmin
            .from('admins')
            .select('id')
            .eq('email', 'admin@amyshaven.com')
            .single();

        if (existing) {
            return res.status(400).json({ error: 'Admin already exists. Use the login endpoint.' });
        }

        const password_hash = await bcrypt.hash(password, 12);

        const { data: admin, error } = await supabaseAdmin
            .from('admins')
            .insert([{
                email: 'admin@amyshaven.com',
                name: "Amy's Haven Admin",
                password_hash
            }])
            .select('id, email, name')
            .single();

        if (error) throw error;

        res.json({ message: 'Admin account created successfully', admin });
    } catch (err) {
        console.error('Setup error:', err);
        res.status(500).json({ error: 'Error creating admin account', message: err.message });
    }
});

// ───────────────────────────────────────────────
// Email templates
// ───────────────────────────────────────────────
function buildApprovalEmail(artistName, productName) {
    return `
<!DOCTYPE html><html><head><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:0 auto;padding:20px;}
.header{background:linear-gradient(135deg,#6B46C1,#8B5CF6);color:#fff;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;}
.body{background:#f9fafb;padding:32px 24px;border-radius:0 0 12px 12px;}
.btn{display:inline-block;background:#6B46C1;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;margin:20px 0;}
.product-badge{background:#EDE9FE;color:#5B21B6;padding:8px 16px;border-radius:8px;font-weight:600;display:inline-block;margin:8px 0;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <div style="font-size:48px;margin-bottom:8px;">🎉</div>
    <h1 style="margin:0;">Product Approved!</h1>
  </div>
  <div class="body">
    <h2>Congratulations, ${artistName}!</h2>
    <p>Great news — your product has been reviewed and approved by our team. It is now <strong>live on Amy's Haven</strong> and available for customers to purchase!</p>
    <div class="product-badge">📦 ${productName}</div>
    <p>Customers can now discover and purchase your handcrafted creation. Here are a few tips to boost visibility:</p>
    <ul>
      <li>Share your product link on social media</li>
      <li>Ask friends and family to spread the word</li>
      <li>Add more products — shops with 5+ items get 3× more traffic</li>
    </ul>
    <a href="https://amyshaven.com/artist-cms/my-products.html" class="btn">View Your Products</a>
    <p style="margin-top:24px;color:#6B7280;font-size:14px;">Thank you for being part of Amy's Haven. Every sale you make contributes 5% to homelessness solutions nationwide.</p>
    <p>— The Amy's Haven Team</p>
  </div>
</div>
</body></html>`;
}

function buildRejectionEmail(artistName, productName, reason) {
    return `
<!DOCTYPE html><html><head><style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6;color:#333;margin:0;padding:0;}
.wrap{max-width:600px;margin:0 auto;padding:20px;}
.header{background:linear-gradient(135deg,#6B46C1,#8B5CF6);color:#fff;padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;}
.body{background:#f9fafb;padding:32px 24px;border-radius:0 0 12px 12px;}
.reason-box{background:#FEF2F2;border-left:4px solid #EF4444;padding:16px;border-radius:0 8px 8px 0;margin:16px 0;}
.btn{display:inline-block;background:#6B46C1;color:#fff;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:600;margin:20px 0;}
</style></head><body>
<div class="wrap">
  <div class="header">
    <h1 style="margin:0;">Product Review Update</h1>
    <p style="margin:8px 0 0;opacity:0.9;">Amy's Haven Marketplace</p>
  </div>
  <div class="body">
    <h2>Hi ${artistName},</h2>
    <p>Thank you for submitting your product <strong>"${productName}"</strong> to Amy's Haven. After careful review, our team was unable to approve this listing at this time.</p>
    <div class="reason-box">
      <strong>Review feedback:</strong><br>${reason}
    </div>
    <p>We encourage you to update your listing based on this feedback and resubmit. Common reasons for review include:</p>
    <ul>
      <li>Images that are blurry or low quality</li>
      <li>Description that needs more detail</li>
      <li>Product doesn't meet our handmade guidelines</li>
      <li>Missing or incorrect pricing/category</li>
    </ul>
    <p>Please feel free to edit your product and resubmit, or contact us at <a href="mailto:admin@amyshaven.com">admin@amyshaven.com</a> if you have questions.</p>
    <a href="https://amyshaven.com/artist-cms/my-products.html" class="btn">Edit Your Product</a>
    <p style="color:#6B7280;font-size:14px;">We appreciate your creativity and hope to see your updated listing soon!</p>
    <p>— The Amy's Haven Team</p>
  </div>
</div>
</body></html>`;
}

module.exports = router;
module.exports.requireAdmin = requireAdmin;
