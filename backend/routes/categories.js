/**
 * Categories Routes - Supabase Version
 * API endpoints for product categories
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// ===================================
// Public Routes
// ===================================

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
    try {
        const { data: categories, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .order('name', { ascending: true });
        
        if (error) throw error;
        
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories', message: error.message });
    }
});

// GET /api/categories/:id - Get category by ID
router.get('/:id', async (req, res) => {
    try {
        const { data: category, error } = await supabaseAdmin
            .from('categories')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Category not found' });
            }
            throw error;
        }
        
        res.json(category);
    } catch (error) {
        console.error('Error fetching category:', error);
        res.status(500).json({ error: 'Error fetching category', message: error.message });
    }
});

// GET /api/categories/:id/products - Get products in category
router.get('/:id/products', async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 12,
            sort = 'created_at',
            order = 'desc'
        } = req.query;
        
        const from = (page - 1) * limit;
        const to = from + Number(limit) - 1;
        
        // Get products with count
        const { data: products, error, count } = await supabaseAdmin
            .from('products')
            .select(`
                *,
                artist:artists(id, business_name, profile_image_url),
                category:categories(id, name)
            `, { count: 'exact' })
            .eq('category_id', req.params.id)
            .eq('is_active', true)
            .order(sort, { ascending: order === 'asc' })
            .range(from, to);
        
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
        console.error('Error fetching category products:', error);
        res.status(500).json({ error: 'Error fetching category products', message: error.message });
    }
});

// GET /api/categories/stats/counts - Get product counts for all categories
router.get('/stats/counts', async (req, res) => {
    try {
        // Get all categories with product counts
        const { data: categories, error } = await supabaseAdmin
            .from('categories')
            .select(`
                id,
                name,
                products:products(count)
            `);
        
        if (error) throw error;
        
        // Format response as map
        const countMap = {};
        categories.forEach(category => {
            countMap[category.id] = category.products[0]?.count || 0;
        });
        
        res.json(countMap);
    } catch (error) {
        console.error('Error fetching category counts:', error);
        res.status(500).json({ error: 'Error fetching category counts', message: error.message });
    }
});

module.exports = router;
