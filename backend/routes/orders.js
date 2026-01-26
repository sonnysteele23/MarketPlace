/**
 * Orders Routes
 * API endpoints for order management
 */

const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { authenticateToken } = require('../middleware/auth');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ===================================
// Public Routes
// ===================================

// POST /api/orders - Create new order
router.post('/', async (req, res) => {
    try {
        const {
            customer,
            shippingAddress,
            billingAddress,
            items,
            paymentMethod = 'stripe'
        } = req.body;
        
        // Validate items and calculate totals
        let subtotal = 0;
        let shippingCost = 0;
        const processedItems = [];
        
        for (const item of items) {
            const product = await Product.findById(item.productId);
            
            if (!product) {
                return res.status(404).json({ 
                    error: `Product not found: ${item.productId}` 
                });
            }
            
            if (product.quantity < item.quantity) {
                return res.status(400).json({ 
                    error: `Insufficient quantity for ${product.name}` 
                });
            }
            
            const itemSubtotal = product.customerPrice * item.quantity;
            subtotal += itemSubtotal;
            
            // Add shipping cost (free shipping if product has it)
            if (!product.freeShipping) {
                shippingCost += product.shippingCost;
            }
            
            processedItems.push({
                product: product._id,
                productName: product.name,
                productImage: product.images[0]?.url,
                artist: product.artist,
                artistName: product.artistName,
                quantity: item.quantity,
                price: product.customerPrice,
                subtotal: itemSubtotal
            });
        }
        
        // Calculate tax (Washington state: ~10%)
        const taxRate = 0.10;
        const tax = subtotal * taxRate;
        
        // Create order
        const order = new Order({
            customer,
            shippingAddress,
            billingAddress: billingAddress || shippingAddress,
            items: processedItems,
            subtotal,
            shippingCost,
            tax,
            payment: {
                method: paymentMethod,
                status: 'pending'
            }
        });
        
        await order.save();
        
        // Create Stripe payment intent
        if (paymentMethod === 'stripe') {
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(order.total * 100), // Convert to cents
                currency: 'usd',
                metadata: {
                    orderId: order._id.toString(),
                    orderNumber: order.orderNumber
                }
            });
            
            order.payment.stripePaymentIntentId = paymentIntent.id;
            await order.save();
            
            return res.status(201).json({
                order,
                clientSecret: paymentIntent.client_secret
            });
        }
        
        res.status(201).json({ order });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ 
            error: 'Error creating order',
            details: error.message 
        });
    }
});

// GET /api/orders/:orderNumber - Get order by order number
router.get('/:orderNumber', async (req, res) => {
    try {
        const order = await Order.findOne({ orderNumber: req.params.orderNumber })
            .populate('items.product', 'name images')
            .populate('items.artist', 'name profileImage');
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        res.json(order);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ error: 'Error fetching order' });
    }
});

// POST /api/orders/:orderId/confirm-payment - Confirm payment (webhook or manual)
router.post('/:orderId/confirm-payment', async (req, res) => {
    try {
        const { transactionId } = req.body;
        
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        await order.markAsPaid(transactionId);
        
        // Update product quantities and record sales
        for (const item of order.items) {
            const product = await Product.findById(item.product);
            if (product) {
                product.quantity -= item.quantity;
                product.sales += item.quantity;
                if (product.quantity === 0) {
                    product.status = 'sold';
                }
                await product.save();
            }
        }
        
        res.json({ 
            message: 'Payment confirmed',
            order 
        });
    } catch (error) {
        console.error('Error confirming payment:', error);
        res.status(500).json({ error: 'Error confirming payment' });
    }
});

// GET /api/orders/customer/:email - Get orders by customer email
router.get('/customer/:email', async (req, res) => {
    try {
        const orders = await Order.findByCustomerEmail(req.params.email);
        res.json(orders);
    } catch (error) {
        console.error('Error fetching customer orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// ===================================
// Protected Routes (Artist Only)
// ===================================

// GET /api/orders/artist/me - Get current artist's orders
router.get('/artist/me', authenticateToken, async (req, res) => {
    try {
        const orders = await Order.find({
            'items.artist': req.artist._id,
            'payment.status': 'paid'
        })
            .sort({ createdAt: -1 })
            .populate('items.product', 'name images');
        
        res.json(orders);
    } catch (error) {
        console.error('Error fetching artist orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

// PUT /api/orders/:orderId/update-status - Update order status
router.put('/:orderId/update-status', authenticateToken, async (req, res) => {
    try {
        const { status, note } = req.body;
        
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if artist has items in this order
        const hasItems = order.items.some(
            item => item.artist.toString() === req.artist._id.toString()
        );
        
        if (!hasItems) {
            return res.status(403).json({ 
                error: 'You do not have permission to update this order' 
            });
        }
        
        await order.updateStatus(status, note, req.artist.name);
        
        res.json({ 
            message: 'Order status updated',
            order 
        });
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ error: 'Error updating order status' });
    }
});

// POST /api/orders/:orderId/add-tracking - Add tracking information
router.post('/:orderId/add-tracking', authenticateToken, async (req, res) => {
    try {
        const { carrier, trackingNumber, estimatedDelivery } = req.body;
        
        const order = await Order.findById(req.params.orderId);
        
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        
        // Check if artist has items in this order
        const hasItems = order.items.some(
            item => item.artist.toString() === req.artist._id.toString()
        );
        
        if (!hasItems) {
            return res.status(403).json({ 
                error: 'You do not have permission to update this order' 
            });
        }
        
        await order.addTracking(carrier, trackingNumber, estimatedDelivery);
        
        res.json({ 
            message: 'Tracking information added',
            order 
        });
    } catch (error) {
        console.error('Error adding tracking:', error);
        res.status(500).json({ error: 'Error adding tracking information' });
    }
});

module.exports = router;
