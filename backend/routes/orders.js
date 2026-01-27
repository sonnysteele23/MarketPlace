/**
 * Orders Routes - Supabase Version
 * API endpoints for order management
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { authenticateToken } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ===================================
// Public Routes
// ===================================

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const {
            customer_email,
            customer_name,
            shipping_address,
            billing_address,
            items, // Array of { product_id, quantity }
            payment_method = 'stripe'
        } = req.body;
        
        // Validate required fields
        if (!customer_email || !customer_name || !shipping_address || !items || items.length === 0) {
            return res.status(400).json({ 
                error: 'Missing required fields: customer_email, customer_name, shipping_address, items' 
            });
        }
        
        // Validate items and calculate totals
        let subtotal = 0;
        let shipping_amount = 0;
        const processedItems = [];
        
        for (const item of items) {
            // Get product details
            const { data: product, error: productError } = await supabaseAdmin
                .from('products')
                .select('id, name, price, stock_quantity, artist_id, image_url')
                .eq('id', item.product_id)
                .single();
            
            if (productError || !product) {
                return res.status(404).json({ 
                    error: `Product not found: ${item.product_id}` 
                });
            }
            
            if (product.stock_quantity < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient stock for ${product.name}. Available: ${product.stock_quantity}` 
                });
            }
            
            const itemSubtotal = parseFloat(product.price) * item.quantity;
            subtotal += itemSubtotal;
            
            // Add shipping cost (fixed $5 per item for simplicity)
            shipping_amount += 5.00;
            
            processedItems.push({
                product_id: product.id,
                artist_id: product.artist_id,
                product_name: product.name,
                quantity: item.quantity,
                price_at_purchase: product.price,
                subtotal: itemSubtotal
            });
        }
        
        // Calculate tax (Washington state: ~10%)
        const tax_rate = 0.10;
        const tax_amount = subtotal * tax_rate;
        const total_amount = subtotal + shipping_amount + tax_amount;
        
        // Create order
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .insert([{
                customer_email,
                customer_name,
                shipping_address,
                billing_address: billing_address || shipping_address,
                subtotal: subtotal.toFixed(2),
                tax_amount: tax_amount.toFixed(2),
                shipping_amount: shipping_amount.toFixed(2),
                total_amount: total_amount.toFixed(2),
                status: 'pending'
            }])
            .select()
            .single();
        
        if (orderError) throw orderError;
        
        // Create order items
        const itemsWithOrderId = processedItems.map(item => ({
            ...item,
            order_id: order.id,
            price_at_purchase: item.price_at_purchase.toString(),
            subtotal: item.subtotal.toFixed(2)
        }));
        
        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .insert(itemsWithOrderId);
        
        if (itemsError) throw itemsError;
        
        // Create Stripe payment intent
        if (payment_method === 'stripe') {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(total_amount * 100), // Convert to cents
                currency: 'usd',
                metadata: {
                    order_id: order.id,
                    customer_email: customer_email
                }
            });
            
            // Update order with Stripe payment intent ID
            await supabaseAdmin
                .from('orders')
                .update({ stripe_payment_intent_id: paymentIntent.id })
                .eq('id', order.id);
            
            return res.status(201).json({
                order,
                items: processedItems,
                clientSecret: paymentIntent.client_secret
            });
        }
        
        res.status(201).json({ 
            order,
            items: processedItems
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            error: 'Error creating order',
            message: error.message 
        });
    }
});

// GET /api/orders/:id - Get order by ID
router.get('/:id', async (req, res) => {
    try {
        const { data: order, error: orderError } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('id', req.params.id)
            .single();
        
        if (orderError) {
            if (orderError.code === 'PGRST116') {
                return res.status(404).json({ error: 'Order not found' });
            }
            throw orderError;
        }
        
        // Get order items
        const { data: items, error: itemsError } = await supabaseAdmin
            .from('order_items')
            .select(`
                *,
                product:products(name, image_url),
                artist:artists(business_name)
            `)
            .eq('order_id', req.params.id);
        
        if (itemsError) throw itemsError;
        
        res.json({
            ...order,
            items
        });
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Error fetching order', message: error.message });
    }
});

// POST /api/orders/:id/confirm-payment - Confirm payment
router.post('/:id/confirm-payment', async (req, res) => {
    try {
        const { stripe_charge_id } = req.body;
        
        // Update order status to processing and add payment info
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .update({ 
                status: 'processing',
                stripe_charge_id
            })
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                return res.status(404).json({ error: 'Order not found' });
            }
            throw error;
        }
        
        // Get order items to update product quantities
        const { data: items, error: itemsError } = await supabaseAdmin
            .from('order_items')
            .select('product_id, quantity')
            .eq('order_id', req.params.id);
        
        if (itemsError) throw itemsError;
        
        // Update product stock quantities
        for (const item of items) {
            const { data: product } = await supabaseAdmin
                .from('products')
                .select('stock_quantity')
                .eq('id', item.product_id)
                .single();
            
            if (product) {
                const newQuantity = product.stock_quantity - item.quantity;
                await supabaseAdmin
                    .from('products')
                    .update({ 
                        stock_quantity: Math.max(0, newQuantity)
                    })
                    .eq('id', item.product_id);
            }
        }
        
        res.json({ 
            message: 'Payment confirmed',
            order 
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Error confirming payment', message: error.message });
    }
});

// GET /api/orders/customer/:email - Get orders by customer email
router.get('/customer/:email', async (req, res) => {
    try {
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('customer_email', req.params.email)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Get items for each order
        const ordersWithItems = await Promise.all(
            orders.map(async (order) => {
                const { data: items } = await supabaseAdmin
                    .from('order_items')
                    .select(`
                        *,
                        product:products(name, image_url)
                    `)
                    .eq('order_id', order.id);
                
                return {
                    ...order,
                    items: items || []
                };
            })
        );
        
        res.json(ordersWithItems);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ error: 'Error fetching orders', message: error.message });
    }
});

// ===================================
// Protected Routes (Artist Only)
// ===================================

// GET /api/orders/artist/me - Get current artist's orders
router.get('/artist/me', authenticateToken, async (req, res) => {
    try {
        // Get all order items for this artist
        const { data: orderItems, error: itemsError } = await supabaseAdmin
            .from('order_items')
            .select(`
                *,
                order:orders(*),
                product:products(name, image_url)
            `)
            .eq('artist_id', req.artist.id);
        
        if (itemsError) throw itemsError;
        
        // Group items by order
        const ordersMap = {};
        orderItems.forEach(item => {
            if (!ordersMap[item.order_id]) {
                ordersMap[item.order_id] = {
                    ...item.order,
                    items: []
                };
            }
            ordersMap[item.order_id].items.push({
                id: item.id,
                product_name: item.product_name,
                quantity: item.quantity,
                price_at_purchase: item.price_at_purchase,
                subtotal: item.subtotal,
                product: item.product
            });
        });
        
        const orders = Object.values(ordersMap)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching artist orders:', error);
        res.status(500).json({ error: 'Error fetching orders', message: error.message });
    }
});

// PUT /api/orders/:id/update-status - Update order status
router.put('/:id/update-status', authenticateToken, async (req, res) => {
    try {
        const { status, notes } = req.body;
        
        // Validate status
        const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        
        // Check if artist has items in this order
        const { data: artistItems, error: checkError } = await supabaseAdmin
            .from('order_items')
            .select('id')
            .eq('order_id', req.params.id)
            .eq('artist_id', req.artist.id);
        
        if (checkError) throw checkError;
        
        if (!artistItems || artistItems.length === 0) {
            return res.status(403).json({ 
                error: 'You do not have permission to update this order' 
            });
        }
        
        // Update order status
        const updates = { status };
        if (notes) {
            updates.notes = notes;
        }
        
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .update(updates)
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ 
            message: 'Order status updated',
            order 
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Error updating order status', message: error.message });
    }
});

// POST /api/orders/:id/add-tracking - Add tracking information
router.post('/:id/add-tracking', authenticateToken, async (req, res) => {
    try {
        const { tracking_number } = req.body;
        
        if (!tracking_number) {
            return res.status(400).json({ error: 'Tracking number is required' });
        }
        
        // Check if artist has items in this order
        const { data: artistItems, error: checkError } = await supabaseAdmin
            .from('order_items')
            .select('id')
            .eq('order_id', req.params.id)
            .eq('artist_id', req.artist.id);
        
        if (checkError) throw checkError;
        
        if (!artistItems || artistItems.length === 0) {
            return res.status(403).json({ 
                error: 'You do not have permission to update this order' 
            });
        }
        
        // Update order with tracking
        const { data: order, error } = await supabaseAdmin
            .from('orders')
            .update({ 
                tracking_number,
                status: 'shipped'
            })
            .eq('id', req.params.id)
            .select()
            .single();
        
        if (error) throw error;
        
        res.json({ 
            message: 'Tracking information added',
            order 
        });
    } catch (error) {
        console.error('Error adding tracking:', error);
        res.status(500).json({ error: 'Error adding tracking information', message: error.message });
    }
});

module.exports = router;
