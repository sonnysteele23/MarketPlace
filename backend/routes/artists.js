/**
 * Artists Routes
 * API endpoints for artist management
 */

const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');

// ===================================
// Public Routes
// ===================================

// GET /api/artists - Get all active artists
router.get('/', async (req, res) => {
    try {
        const { 
            city, 
            category,
            page = 1, 
            limit = 12,
            sort = 'totalSales'
        } = req.query;
        
        const query = { status: 'active' };
        
        if (city) {
            query.city = new RegExp(city, 'i');
        }
        
        if (category) {
            query.categories = category;
        }
        
        const skip = (page - 1) * limit;
        
        const [artists, total] = await Promise.all([
            Artist.find(query)
                .select('-password -resetPasswordToken -resetPasswordExpires -adminNotes')
                .sort({ [sort]: -1 })
                .skip(skip)
                .limit(Number(limit)),
            Artist.countDocuments(query)
        ]);
        
        res.json({
            artists,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching artists:', error);
        res.status(500).json({ error: 'Error fetching artists' });
    }
});

// GET /api/artists/featured - Get featured artists
router.get('/featured', async (req, res) => {
    try {
        const artists = await Artist.findFeatured()
            .select('-password -resetPasswordToken -resetPasswordExpires -adminNotes');
        res.json(artists);
    } catch (error) {
        console.error('Error fetching featured artists:', error);
        res.status(500).json({ error: 'Error fetching featured artists' });
    }
});

// GET /api/artists/:id - Get single artist by ID
router.get('/:id', async (req, res) => {
    try {
        const artist = await Artist.findById(req.params.id)
            .select('-password -resetPasswordToken -resetPasswordExpires -adminNotes');
        
        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        
        res.json(artist);
    } catch (error) {
        console.error('Error fetching artist:', error);
        res.status(500).json({ error: 'Error fetching artist' });
    }
});

// GET /api/artists/slug/:slug - Get artist by slug
router.get('/slug/:slug', async (req, res) => {
    try {
        const artist = await Artist.findOne({ slug: req.params.slug })
            .select('-password -resetPasswordToken -resetPasswordExpires -adminNotes');
        
        if (!artist) {
            return res.status(404).json({ error: 'Artist not found' });
        }
        
        res.json(artist);
    } catch (error) {
        console.error('Error fetching artist:', error);
        res.status(500).json({ error: 'Error fetching artist' });
    }
});

// GET /api/artists/:id/products - Get artist's products
router.get('/:id/products', async (req, res) => {
    try {
        const products = await Product.find({
            artist: req.params.id,
            status: 'active'
        }).sort({ createdAt: -1 });
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching artist products:', error);
        res.status(500).json({ error: 'Error fetching artist products' });
    }
});

// ===================================
// Protected Routes (Artist Only)
// ===================================

// GET /api/artists/me - Get current artist profile
router.get('/me/profile', authenticateToken, async (req, res) => {
    try {
        res.json(req.artist);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// PUT /api/artists/me - Update artist profile
router.put('/me', authenticateToken, async (req, res) => {
    try {
        const allowedUpdates = [
            'name', 'bio', 'story', 'phone', 'city', 'zipCode',
            'profileImage', 'coverImage', 'categories', 'socialMedia',
            'emailNotifications', 'orderNotifications'
        ];
        
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        const artist = await Artist.findByIdAndUpdate(
            req.artist._id,
            updates,
            { new: true, runValidators: true }
        ).select('-password');
        
        res.json(artist);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ 
            error: 'Error updating profile',
            details: error.message 
        });
    }
});

// GET /api/artists/me/products - Get current artist's products
router.get('/me/products', authenticateToken, async (req, res) => {
    try {
        const { status = 'all' } = req.query;
        
        const query = { artist: req.artist._id };
        if (status !== 'all') {
            query.status = status;
        }
        
        const products = await Product.find(query)
            .sort({ createdAt: -1 });
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// GET /api/artists/me/stats - Get artist statistics
router.get('/me/stats', authenticateToken, async (req, res) => {
    try {
        await req.artist.updateStats();
        
        const stats = {
            totalProducts: req.artist.totalProducts,
            totalSales: req.artist.totalSales,
            totalRevenue: req.artist.totalRevenue,
            rating: req.artist.rating,
            reviewCount: req.artist.reviewCount
        };
        
        // Get additional stats
        const [activeProducts, soldProducts, recentSales] = await Promise.all([
            Product.countDocuments({ artist: req.artist._id, status: 'active' }),
            Product.countDocuments({ artist: req.artist._id, status: 'sold' }),
            Product.find({ artist: req.artist._id, sales: { $gt: 0 } })
                .sort({ updatedAt: -1 })
                .limit(5)
                .select('name sales customerPrice updatedAt')
        ]);
        
        stats.activeProducts = activeProducts;
        stats.soldProducts = soldProducts;
        stats.recentSales = recentSales;
        
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Error fetching statistics' });
    }
});

// POST /api/artists/apply - Apply to become an artist
router.post('/apply', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            city,
            zipCode,
            bio,
            categories,
            isHomeless
        } = req.body;
        
        // Check if email already exists
        const existingArtist = await Artist.findOne({ email: email.toLowerCase() });
        if (existingArtist) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create new artist with pending status
        const artist = new Artist({
            name,
            email,
            password,
            phone,
            city,
            zipCode,
            bio,
            categories,
            isHomeless: isHomeless || false,
            status: 'pending'
        });
        
        await artist.save();
        
        res.status(201).json({ 
            message: 'Application submitted successfully! We will review and get back to you soon.',
            artistId: artist._id
        });
    } catch (error) {
        console.error('Error submitting application:', error);
        res.status(400).json({ 
            error: 'Error submitting application',
            details: error.message 
        });
    }
});

module.exports = router;
