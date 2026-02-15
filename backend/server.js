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

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ===================================
// Middleware
// ===================================

// Security middleware - Relaxed for development
app.use(helmet({
    contentSecurityPolicy: false, // Disable CSP for development
    crossOriginEmbedderPolicy: false
}));

// CORS configuration - Allow GitHub Pages and localhost
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'https://sonnysteele23.github.io',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
            return callback(null, true);
        }
        
        // In development, allow all
        if (process.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Serve static files - Order matters!
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/artist-cms', express.static(path.join(__dirname, '../artist-cms')));
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
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/customers', customerRoutes);

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
    
    if (!email || !email.includes('@')) {
        return res.status(400).json({ error: 'Invalid email address' });
    }
    
    // TODO: Add to newsletter service (MailChimp, SendGrid, etc.)
    console.log(`Newsletter subscription: ${email}`);
    
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
