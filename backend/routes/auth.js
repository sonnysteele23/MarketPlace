/**
 * Authentication Routes
 * API endpoints for artist login, registration, and password management
 */

const express = require('express');
const router = express.Router();
const Artist = require('../models/Artist');
const { generateToken, generateRefreshToken, authenticateToken } = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Email transporter (configure with your SMTP settings)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// ===================================
// Public Routes
// ===================================

// POST /api/auth/register - Register new artist
router.post('/register', async (req, res) => {
    try {
        const {
            name,
            email,
            password,
            phone,
            city,
            zipCode,
            bio,
            categories
        } = req.body;
        
        // Validate required fields
        if (!name || !email || !password) {
            return res.status(400).json({ 
                error: 'Name, email, and password are required' 
            });
        }
        
        // Check if email already exists
        const existingArtist = await Artist.findOne({ email: email.toLowerCase() });
        if (existingArtist) {
            return res.status(400).json({ error: 'Email already registered' });
        }
        
        // Create new artist
        const artist = new Artist({
            name,
            email,
            password,
            phone,
            city,
            zipCode,
            bio,
            categories,
            status: 'pending' // Requires admin approval
        });
        
        await artist.save();
        
        // Generate token
        const token = generateToken(artist._id);
        const refreshToken = generateRefreshToken(artist._id);
        
        res.status(201).json({
            message: 'Registration successful! Your account is pending approval.',
            artist: artist.getPublicProfile(),
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(400).json({ 
            error: 'Error registering artist',
            details: error.message 
        });
    }
});

// POST /api/auth/login - Artist login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validate input
        if (!email || !password) {
            return res.status(400).json({ 
                error: 'Email and password are required' 
            });
        }
        
        // Find artist
        const artist = await Artist.findOne({ email: email.toLowerCase() });
        
        if (!artist) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check password
        const isPasswordValid = await artist.comparePassword(password);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        
        // Check if account is suspended
        if (artist.status === 'suspended') {
            return res.status(403).json({ 
                error: 'Your account has been suspended. Please contact support.' 
            });
        }
        
        // Update last login
        artist.lastLogin = new Date();
        await artist.save();
        
        // Generate tokens
        const token = generateToken(artist._id);
        const refreshToken = generateRefreshToken(artist._id);
        
        res.json({
            message: 'Login successful',
            artist: artist.getPublicProfile(),
            token,
            refreshToken
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error logging in' });
    }
});

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', async (req, res) => {
    try {
        const { refreshToken } = req.body;
        
        if (!refreshToken) {
            return res.status(400).json({ error: 'Refresh token required' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        
        if (decoded.type !== 'refresh') {
            return res.status(401).json({ error: 'Invalid refresh token' });
        }
        
        const artist = await Artist.findById(decoded.artistId);
        
        if (!artist) {
            return res.status(401).json({ error: 'Artist not found' });
        }
        
        // Generate new access token
        const newToken = generateToken(artist._id);
        
        res.json({
            token: newToken,
            artist: artist.getPublicProfile()
        });
    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
});

// POST /api/auth/forgot-password - Request password reset
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const artist = await Artist.findOne({ email: email.toLowerCase() });
        
        if (!artist) {
            // Don't reveal if email exists or not
            return res.json({ 
                message: 'If that email exists, a password reset link has been sent.' 
            });
        }
        
        // Generate reset token
        artist.generatePasswordReset();
        await artist.save();
        
        // Send email
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${artist.resetPasswordToken}`;
        
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: artist.email,
            subject: 'Password Reset - WA Artisan Marketplace',
            html: `
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password for WA Artisan Marketplace.</p>
                <p>Click the link below to reset your password (valid for 1 hour):</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>If you didn't request this, please ignore this email.</p>
            `
        });
        
        res.json({ 
            message: 'If that email exists, a password reset link has been sent.' 
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ error: 'Error processing password reset request' });
    }
});

// POST /api/auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!token || !newPassword) {
            return res.status(400).json({ 
                error: 'Token and new password are required' 
            });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                error: 'Password must be at least 8 characters' 
            });
        }
        
        const artist = await Artist.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        
        if (!artist) {
            return res.status(400).json({ 
                error: 'Invalid or expired reset token' 
            });
        }
        
        // Update password
        artist.password = newPassword;
        artist.resetPasswordToken = undefined;
        artist.resetPasswordExpires = undefined;
        await artist.save();
        
        res.json({ message: 'Password reset successful. You can now login.' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ error: 'Error resetting password' });
    }
});

// ===================================
// Protected Routes
// ===================================

// POST /api/auth/change-password - Change password (logged in)
router.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                error: 'Current password and new password are required' 
            });
        }
        
        if (newPassword.length < 8) {
            return res.status(400).json({ 
                error: 'New password must be at least 8 characters' 
            });
        }
        
        // Get full artist document with password
        const artist = await Artist.findById(req.artist._id);
        
        // Verify current password
        const isPasswordValid = await artist.comparePassword(currentPassword);
        
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Update password
        artist.password = newPassword;
        await artist.save();
        
        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Error changing password' });
    }
});

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
    try {
        // In a stateless JWT system, logout is handled client-side
        // But we can update last activity or add to token blacklist if needed
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ error: 'Error logging out' });
    }
});

// GET /api/auth/verify - Verify token is still valid
router.get('/verify', authenticateToken, async (req, res) => {
    try {
        res.json({
            valid: true,
            artist: req.artist.getPublicProfile()
        });
    } catch (error) {
        console.error('Verify error:', error);
        res.status(500).json({ error: 'Error verifying token' });
    }
});

module.exports = router;
