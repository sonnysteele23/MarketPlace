/**
 * Products Routes - Supabase Version
 * API endpoints for product management
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');

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
                artist:artists(id, business_name, profile_image_url, location),
                category:categories(id, name)
            `, { count: 'exact' })
            .eq('is_active', true);
        
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
                artist:artists(id, business_name, profile_image_url)
            `)
            .eq('is_featured', true)
            .eq('is_active', true)
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
                artist:artists(id, business_name, profile_image_url)
            `)
            .eq('is_active', true)
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
                artist:artists(id, business_name)
            `)
            .eq('is_active', true)
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
                artist:artists(
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
            is_active: true,
            is_featured: false
        };
        
        const { data: product, error } = await supabaseAdmin
            .from('products')
            .insert([productData])
            .select(`
                *,
                artist:artists(id, business_name),
                category:categories(id, name)
            `)
            .single();
        
        if (error) throw error;
        
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
                artist:artists(id, business_name),
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

module.exports = router;
