/**
 * Categories Routes
 * API endpoints for product categories
 */

const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Product = require('../models/Product');

// ===================================
// Public Routes
// ===================================

// GET /api/categories - Get all active categories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.findActive();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// GET /api/categories/:slug - Get category by slug
router.get('/:slug', async (req, res) => {
    try {
        const category = await Category.findOne({ 
            slug: req.params.slug,
            isActive: true 
        });
        
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        
        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Error fetching category' });
    }
});

// GET /api/categories/:slug/products - Get products in category
router.get('/:slug/products', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12,
            sort = 'createdAt',
            order = 'desc'
        } = req.query;
        
        const skip = (page - 1) * limit;
        const sortOptions = {};
        sortOptions[sort] = order === 'asc' ? 1 : -1;
        
        const [products, total] = await Promise.all([
            Product.find({ 
                category: req.params.slug,
                status: 'active' 
            })
                .sort(sortOptions)
                .skip(skip)
                .limit(Number(limit))
                .populate('artist', 'name slug profileImage'),
            Product.countDocuments({ 
                category: req.params.slug,
                status: 'active' 
            })
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
        console.error('Error fetching category products:', error);
        res.status(500).json({ error: 'Error fetching category products' });
    }
});

// GET /api/categories/stats/counts - Get product counts for all categories
router.get('/stats/counts', async (req, res) => {
    try {
        const counts = await Product.aggregate([
            { $match: { status: 'active' } },
            { 
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        const countMap = {};
        counts.forEach(item => {
            countMap[item._id] = item.count;
        });
        
        res.json(countMap);
    } catch (error) {
        console.error('Error fetching category counts:', error);
        res.status(500).json({ error: 'Error fetching category counts' });
    }
});

module.exports = router;
