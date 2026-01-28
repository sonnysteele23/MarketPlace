/**
 * Customer Routes - Supabase Version
 * Authentication and profile management for marketplace customers
 */

const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendWelcomeEmail } = require('../services/emailService');

// Customer authentication middleware
const authenticateCustomer = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'Access denied. No token provided.' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type !== 'customer') {
            return res.status(403).json({ error: 'Invalid token type' });
        }
        
        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .select('id, email, name, created_at')
            .eq('id', decoded.id)
            .single();
        
        if (error || !customer) {
            return res.status(401).json({ error: 'Invalid token. Customer not found.' });
        }
        
        req.customer = customer;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        console.error('Customer authentication error:', error);
        return res.status(500).json({ error: 'Server error during authentication.' });
    }
};

// ===================================
// Public Routes
// ===================================

// GET /api/customers/test - Simple test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Customer route is working!' });
});

// POST /api/customers/register - Register new customer
router.post('/register', async (req, res) => {
    try {
        console.log('📝 Registration request received:', req.body);
        
        const { email, password, name } = req.body;
        
        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        console.log('🔍 Checking if email exists...');
        // Check if email already exists
        const { data: existingCustomer } = await supabaseAdmin
            .from('customers')
            .select('id')
            .eq('email', email.toLowerCase())
            .single();
        
        if (existingCustomer) {
            console.log('❌ Email already exists');
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        console.log('🔐 Hashing password...');
        // Hash password
        const password_hash = await bcrypt.hash(password, 10);
        console.log('✅ Password hashed');
        
        console.log('💾 Creating customer in database...');
        // Create customer
        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .insert([{
                email: email.toLowerCase(),
                password_hash,
                name: name || null
            }])
            .select('id, email, name, created_at')
            .single();
        
        if (error) throw error;
        console.log('✅ Customer created:', customer.id);
        
        console.log('🎫 Generating JWT token...');
        // Generate JWT token
        const token = jwt.sign(
            { id: customer.id, email: customer.email, type: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        console.log('✅ Token generated');
        
        // Send welcome email (don't wait for it, don't fail registration if email fails)
        console.log('📧 Sending welcome email...');
        sendWelcomeEmail(customer.email, customer.name).catch(err => {
            console.error('Failed to send welcome email:', err.message);
        });
        
        res.status(201).json({
            message: 'Registration successful',
            customer,
            token
        });
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(400).json({ error: 'Error registering customer', message: error.message });
    }
});

// POST /api/customers/login - Customer login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find customer
        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .select('*')
            .eq('email', email.toLowerCase())
            .single();
        
        if (error || !customer) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, customer.password_hash);
        
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { id: customer.id, email: customer.email, type: 'customer' },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );
        
        const { password_hash, ...customerData } = customer;
        
        res.json({
            message: 'Login successful',
            customer: customerData,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in', message: error.message });
    }
});

// POST /api/customers/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const { data: customer } = await supabaseAdmin
            .from('customers')
            .select('id, email')
            .eq('email', email.toLowerCase())
            .single();
        
        // Generate reset token (expires in 1 hour)
        if (customer) {
            const resetToken = jwt.sign(
                { id: customer.id, type: 'password-reset' },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );
            
            // In production, send email with reset link
            // For now, return the token
            console.log(`Password reset token for ${email}: ${resetToken}`);
            
            // TODO: Send email with reset link
            // const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        }
        
        // Always return same message (don't reveal if email exists)
        res.json({ message: 'If that email exists, a password reset link has been sent.' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Error processing request' });
    }
});

// POST /api/customers/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ error: 'Token and new password are required' });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'Password must be at least 8 characters' });
        }
        
        // Verify reset token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (decoded.type !== 'password-reset') {
            return res.status(400).json({ error: 'Invalid reset token' });
        }
        
        // Hash new password
        const password_hash = await bcrypt.hash(newPassword, 10);
        
        // Update password
        const { error } = await supabaseAdmin
            .from('customers')
            .update({ password_hash })
            .eq('id', decoded.id);
        
        if (error) throw error;
        
        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ error: 'Reset token expired. Please request a new one.' });
        }
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
});

// ===================================
// Protected Routes (Customer Only)
// ===================================

// GET /api/customers/me - Get current customer profile
router.get('/me', authenticateCustomer, async (req, res) => {
    try {
        res.json(req.customer);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Error fetching profile' });
    }
});

// PUT /api/customers/me - Update customer profile
router.put('/me', authenticateCustomer, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (phone !== undefined) updates.phone = phone;
        if (address !== undefined) updates.address = address;
        
        const { data: customer, error } = await supabaseAdmin
            .from('customers')
            .update(updates)
            .eq('id', req.customer.id)
            .select('id, email, name, phone, address, created_at')
            .single();
        
        if (error) throw error;
        
        res.json(customer);
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(400).json({ error: 'Error updating profile', message: error.message });
    }
});

// GET /api/customers/me/orders - Get customer's orders
router.get('/me/orders', authenticateCustomer, async (req, res) => {
    try {
        const { data: orders, error } = await supabaseAdmin
            .from('orders')
            .select('*')
            .eq('customer_email', req.customer.email)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Get order items for each order
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
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Error fetching orders' });
    }
});

module.exports = router;
module.exports.authenticateCustomer = authenticateCustomer;
