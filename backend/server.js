/**
 * Washington Artisan Marketplace - Backend Server
 * Express.js + Supabase
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const supabaseStorage = require('./services/supabaseStorage');

// Import routes
const productRoutes = require('./routes/products');
const artistRoutes = require('./routes/artists');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const uploadRoutes = require('./routes/upload');
const customerRoutes = require('./routes/customers');
const adminRoutes = require('./routes/admin');
const stripeConnectRoutes = require('./routes/stripeConnect');
const stripeWebhookRoutes = require('./routes/stripeWebhook');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Trust Railway's proxy (fixes X-Forwarded-For rate limit warning)
app.set('trust proxy', 1);

// ===================================
// Middleware
// ===================================

// Security middleware - Relaxed for development
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow ALL Amy's Haven domains
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'https://sonnysteele23.github.io',
    'https://amyshaven.com',
    'http://amyshaven.com',
    'https://www.amyshaven.com',
    'http://www.amyshaven.com',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        console.log('🌐 CORS Check - Origin:', origin);
        
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) {
            console.log('✅ No origin - allowing');
            return callback(null, true);
        }
        
        // Check if origin matches any allowed origin
        const isAllowed = allowedOrigins.some(allowed => origin.startsWith(allowed));
        
        if (isAllowed) {
            console.log('✅ Origin allowed:', origin);
            return callback(null, true);
        }
        
        // In development, allow all
        if (process.env.NODE_ENV !== 'production') {
            console.log('✅ Development mode - allowing all origins');
            return callback(null, true);
        }
        
        console.log('❌ Origin blocked:', origin);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Stripe webhook MUST be mounted before express.json() so signature
// verification sees the raw request body.
app.use('/api/webhooks', stripeWebhookRoutes);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting - generous limit for admin, standard for public
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: 'Too many requests from this IP, please try again later.',
    trustProxy: true
});

const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000, // Admin makes many requests per session
    message: 'Too many requests.',
    trustProxy: true
});

app.use('/api/admin', adminLimiter);
app.use('/api/', limiter);

// Serve static files - Order matters!
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/artist-cms', express.static(path.join(__dirname, '../artist-cms')));
app.use('/admin', express.static(path.join(__dirname, '../admin')));
app.use('/public', express.static(path.join(__dirname, '../public')));
// Serve root directory files (index.html, etc.)
app.use(express.static(path.join(__dirname, '..')));

// ===================================
// Database Connection - Supabase
// ===================================

const { supabaseAdmin } = require('./config/supabase');
console.log('✅ Supabase connection initialized');

// ===================================
// API Routes
// ===================================

app.use('/api/products', productRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/artists/me/stripe', stripeConnectRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Newsletter subscription endpoint
app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email } = req.body;

    // RFC 5322-ish email check; rejects empty / no @ / no dot in domain
    const valid = typeof email === 'string'
        && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    const normalized = email.toLowerCase().trim();
    const source = (req.body && typeof req.body.source === 'string') ? req.body.source.slice(0, 64) : 'site_footer';

    try {
        const { supabaseAdmin } = require('./config/supabase');
        // upsert so re-subscribes are idempotent (relies on unique constraint on email)
        const { error } = await supabaseAdmin
            .from('newsletter_subscribers')
            .upsert({ email: normalized, source }, { onConflict: 'email' });
        if (error) {
            // Most likely cause: table missing. Log clearly so the migration shows up in Railway logs.
            console.warn('[newsletter] supabase upsert failed:', error.message);
        } else {
            console.log(`[newsletter] subscribed: ${normalized}`);
        }
    } catch (err) {
        console.error('[newsletter] unexpected error:', err);
    }

    // Always 200 — the user submitted a valid email; we don't leak whether storage worked.
    res.json({ message: 'Successfully subscribed to newsletter!' });
});

// ===================================
// Serve Frontend
// ===================================

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Catch-all route - serve index.html for client-side routing
app.get('*', (req, res) => {
    if (!req.url.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../index.html'));
    }
});

// ===================================
// Error Handling Middleware
// ===================================

// 404 handler
app.use((req, res) => {
    if (req.url.startsWith('/api')) {
        res.status(404).json({ error: 'API endpoint not found' });
    } else {
        res.status(404).sendFile(path.join(__dirname, '../404.html'));
    }
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    res.status(err.status || 500).json({
        error: {
            message: err.message || 'Internal server error',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
});

// ===================================
// Start Server
// ===================================

supabaseStorage.initializeBuckets().catch(console.error);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`
    ╔════════════════════════════════════════════╗
    ║   WA Artisan Marketplace Server Running   ║
    ╠════════════════════════════════════════════╣
    ║   Port: ${PORT}                              ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}             ║
    ║   Database: Supabase (PostgreSQL)           ║
    ╚════════════════════════════════════════════╝
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
