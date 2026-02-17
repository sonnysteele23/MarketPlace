/**
 * Artists Routes - Supabase Version
 * API endpoints for artist management
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

// ===================================
// Authentication Routes (MUST be before /:id)
// ===================================

// POST /api/artists/register - Register new artist
router.post('/register', async (req, res) => {
    try {
        const {
            email,
            password,
            business_name,
            bio,
            location,
            phone,
            website_url
        } = req.body;
        
        // Validate required fields
        if (!email || !password || !business_name) {
            return res.status(400).json({ 
                error: 'Missing required fields: email, password, business_name' 
            });
        }
        
        // Check if email already exists
        const { data: existingArtist } = await supabaseAdmin
            .from('artists')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();
        
        if (existingArtist) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        
        // Create new artist
        const { data: artist, error } = await supabaseAdmin
            .from('artists')
            .insert([{
                email: email.toLowerCase(),
                password_hash,
                business_name,
                bio,
                location,
                phone,
                website_url,
                is_verified: true // Auto-verify for now
            }])
            .select('id, email, business_name, bio, location, created_at')
            .single();
        
        if (error) throw error;
        
        // Generate JWT token
        const token = jwt.sign(
            { id: artist.id, email: artist.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        res.status(201).json({ 
            message: 'Artist registered successfully',
            artist,
            token
        });
    } catch (error) {
        console.error('Error registering artist:', error);
        res.status(400).json({ 
            error: 'Error registering artist',
            message: error.message 
        });
    }
});

// POST /api/artists/login - Artist login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find artist by email
        const { data: artist, error } = await supabaseAdmin
            .from('artists')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();
        
        if (error || !artist) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, artist.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: artist.id, email: artist.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );
        
        // Remove password_hash from response
        const { password_hash, ...artistData } = artist;
        
        res.json({ 
            message: 'Login successful',
            artist: artistData,
            token
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: 'Error logging in', message: error.message });
    }
});

// ===================================
// Protected Routes - /me/* (MUST be before /:id)
// ===================================

// GET /api/artists/me/profile - Get current artist profile
router.get('/me/profile', authenticateToken, async (req, res) => {
    try {
        const { data: artist, error } = await supabaseAdmin
            .from('artists')
            .select('id, email, business_name, bio, profile_image_url, location, website_url, phone, is_verified, stripe_account_id, created_at')
            .eq('id', req.artist.id)
            .single();
        
        if (error) throw error;
        
        res.json(artist);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile', message: error.message });
    }
});

// PUT /api/artists/me - Update artist profile
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const allowedUpdates = [
            'business_name', 'bio', 'phone', 'location', 'website_url',
            'profile_image_url'
        ];
        
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        const { data: artist, error } = await supabaseAdmin
            .from('artists')
            .update(updates)
            .eq('id', req.artist.id)
            .select('id, email, business_name, bio, profile_image_url, location, website_url, phone, created_at')
            .single();
        
        if (error) throw error;
        
        res.json(artist);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ 
            error: 'Error updating profile',
            message: error.message 
        });
    }
});

// GET /api/artists/me/products - Get current artist's products
router.get('/me/products', authenticateToken, async (req, res) => {
    try {
        console.log('Fetching products for artist:', req.artist.id);
        
        const { status = 'active' } = req.query;
        
        let query = supabaseAdmin
            .from('products')
            .select(`
                *,
                category:categories(id, name)
            `)
            .eq('artist_id', req.artist.id);
        
        if (status !== 'all') {
            query = query.eq('is_active', status === 'active');
        }
        
        const { data: products, error } = await query
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        console.log('Found products:', products?.length || 0);
        res.json(products || []);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products', message: error.message });
    }
});

// GET /api/artists/me/stats - Get artist statistics
router.get('/me/stats', authenticateToken, async (req, res) => {
    try {
        // Get product counts - only count active products
        const { data: activeProductStats, error: activeError } = await supabaseAdmin
            .from('products')
            .select('id', { count: 'exact' })
            .eq('artist_id', req.artist.id)
            .eq('is_active', true);
        
        if (activeError) throw activeError;
        
        const totalProducts = activeProductStats?.length || 0;
        const activeProducts = totalProducts; // Same as total since we're only querying active
        
        // Get order counts and revenue
        const { data: orderItems, error: orderError } = await supabaseAdmin
            .from('order_items')
            .select('quantity, price_at_purchase')
            .eq('artist_id', req.artist.id);
        
        const totalSales = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
        const totalRevenue = orderItems?.reduce((sum, item) => sum + (item.quantity * parseFloat(item.price_at_purchase)), 0) || 0;
        
        res.json({
            totalProducts,
            activeProducts,
            totalSales,
            totalRevenue: totalRevenue.toFixed(2)
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching statistics', message: error.message });
    }
});

// GET /api/artists/me/orders - Get artist's orders
router.get('/me/orders', authenticateToken, async (req, res) => {
    try {
        const { data: orderItems, error } = await supabaseAdmin
            .from('order_items')
            .select(`
                *,
                product:products(id, name, image_url),
                order:orders(id, status, created_at, customer:customers(id, name, email))
            `)
            .eq('artist_id', req.artist.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json(orderItems || []);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders', message: error.message });
    }
});

// ===================================
// Public Routes
// ===================================

// GET /api/artists - Get all active artists
router.get('/', async (req, res) => {
    try {
        const { 
            location, 
            category_id,
            page = 1, 
            limit = 12,
            sort = 'created_at',
            order = 'desc'
        } = req.query;
        
        const from = (page - 1) * limit;
        const to = from + Number(limit) - 1;
        
        let query = supabaseAdmin
            .from('artists')
            .select('*', { count: 'exact' })
            .eq('is_verified', true);
        
        if (location) {
            query = query.ilike('location', `%${location}%`);
        }
        
        const { data: artists, error, count } = await query
            .order(sort, { ascending: order === 'asc' })
            .range(from, to);
        
        if (error) throw error;
        
        // Remove password_hash from response
        const sanitizedArtists = artists.map(artist => {
            const { password_hash, ...rest } = artist;
            return rest;
        });
        
        res.json({
            artists: sanitizedArtists,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).json({ error: 'Error fetching artists', message: error.message });
    }
});

// GET /api/artists/featured - Get featured artists (top by products or recent)
router.get('/featured', async (req, res) => {
    try {
        const { data: artists, error } = await supabaseAdmin
            .from('artists')
            .select('id, business_name, bio, profile_image_url, location')
            .eq('is_verified', true)
            .limit(6)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json(artists);
    } catch (error) {
        console.error('Error fetching featured artists:', error);
        res.status(500).json({ error: 'Error fetching featured artists', message: error.message });
    }
});

// GET /api/artists/:id - Get single artist by ID (MUST be LAST)
router.get('/:id', async (req, res) => {
    try {
        const { data: artist, error } = await supabaseAdmin
            .from('artists')
            .select('id, business_name, bio, profile_image_url, location, website_url, phone, created_at')
            .eq('id', req.params.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Artist not found' });
            }
            throw error;
        }
        
        res.json(artist);
    } catch (error) {
        console.error('Error fetching artist:', error);
        res.status(500).json({ error: 'Error fetching artist', message: error.message });
    }
});

// GET /api/artists/:id/products - Get artist's products
router.get('/:id/products', async (req, res) => {
    try {
        const { data: products, error } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                category:categories(id, name)
            `)
            .eq('artist_id', req.params.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching artist products:', error);
        res.status(500).json({ error: 'Error fetching artist products', message: error.message });
    }
});

module.exports = router;
