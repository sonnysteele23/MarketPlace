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

// Import routes
const productRoutes = require('./routes/products');
const artistRoutes = require('./routes/artists');
const categoryRoutes = require('./routes/categories');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const uploadRoutes = require('./routes/upload');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// ===================================
// Middleware
// ===================================

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'", "'unsafe-inline'"]
        }
    }
}));

// CORS configuration
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use('/artist-cms', express.static(path.join(__dirname, '../artist-cms')));

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
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

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

app.listen(PORT, () => {
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
