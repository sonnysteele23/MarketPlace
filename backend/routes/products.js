/**
 * Products Routes
 * API endpoints for product management
 */

const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');

// ===================================
// Public Routes
// ===================================

// GET /api/products - Get all active products with filtering
router.get('/', async (req, res) => {
    try {
        const {
            category,
            minPrice,
            maxPrice,
            artist,
            search,
            sort = 'createdAt',
            order = 'desc',
            page = 1,
            limit = 12
        } = req.query;
        
        // Build query
        const query = { status: 'active' };
        
        if (category) {
            query.category = category;
        }
        
        if (minPrice || maxPrice) {
            query.customerPrice = {};
            if (minPrice) query.customerPrice.$gte = Number(minPrice);
            if (maxPrice) query.customerPrice.$lte = Number(maxPrice);
        }
        
        if (artist) {
            query.artist = artist;
        }
        
        if (search) {
            query.$text = { $search: search };
        }
        
        // Sort options
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;
        
        // Execute query with pagination
        const skip = (page - 1) * limit;
        
        const [products, total] = await Promise.all([
            Product.find(query)
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit))
                .populate('artist', 'name slug profileImage city'),
            Product.countDocuments(query)
        ]);
        
        res.json({
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Error fetching products' });
    }
});

// GET /api/products/featured - Get featured products
router.get('/featured', async (req, res) => {
    try {
        const products = await Product.findFeatured()
            .populate('artist', 'name slug profileImage');
        res.json(products);
    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({ error: 'Error fetching featured products' });
    }
});

// GET /api/products/new-arrivals - Get new arrival products
router.get('/new-arrivals', async (req, res) => {
    try {
        const products = await Product.findNewArrivals()
            .populate('artist', 'name slug profileImage');
        res.json(products);
    } catch (error) {
        console.error('Error fetching new arrivals:', error);
        res.status(500).json({ error: 'Error fetching new arrivals' });
    }
});

// GET /api/products/search - Search products
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q || q.trim() === '') {
            return res.json([]);
        }
        
        const products = await Product.searchProducts(q)
            .limit(20)
            .populate('artist', 'name slug');
        
        res.json(products);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ error: 'Error searching products' });
    }
});

// GET /api/products/:id - Get single product by ID
router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('artist', 'name slug bio profileImage city state socialMedia');
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Increment view count
        await product.incrementViews();
        
        res.json(product);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Error fetching product' });
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
            artist: req.artist._id,
            artistName: req.artist.name
        };
        
        const product = new Product(productData);
        await product.save();
        
        // Update artist stats
        await req.artist.updateStats();
        
        res.status(201).json(product);
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(400).json({ 
            error: 'Error creating product',
            details: error.message 
        });
    }
});

// PUT /api/products/:id - Update product
router.put('/:id', authenticateToken, checkResourceOwnership('product'), async (req, res) => {
    try {
        const allowedUpdates = [
            'name', 'description', 'category', 'price', 'quantity',
            'materials', 'dimensions', 'weight', 'careInstructions',
            'shippingCost', 'freeShipping', 'processingTime',
            'tags', 'status', 'images'
        ];
        
        const updates = {};
        allowedUpdates.forEach(field => {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        });
        
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true, runValidators: true }
        );
        
        res.json(product);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(400).json({ 
            error: 'Error updating product',
            details: error.message 
        });
    }
});

// DELETE /api/products/:id - Delete product (soft delete)
router.delete('/:id', authenticateToken, checkResourceOwnership('product'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { status: 'archived' },
            { new: true }
        );
        
        // Update artist stats
        await req.artist.updateStats();
        
        res.json({ message: 'Product archived successfully', product });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ error: 'Error deleting product' });
    }
});

// POST /api/products/:id/favorite - Add to favorites
router.post('/:id/favorite', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        await product.addToFavorites();
        
        res.json({ message: 'Added to favorites', favorites: product.favorites });
    } catch (error) {
        console.error('Error adding to favorites:', error);
        res.status(500).json({ error: 'Error adding to favorites' });
    }
});

// GET /api/products/artist/:artistId - Get products by artist
router.get('/artist/:artistId', async (req, res) => {
    try {
        const products = await Product.find({
            artist: req.params.artistId,
            status: 'active'
        }).sort({ createdAt: -1 });
        
        res.json(products);
    } catch (error) {
        console.error('Error fetching artist products:', error);
        res.status(500).json({ error: 'Error fetching artist products' });
    }
});

module.exports = router;
