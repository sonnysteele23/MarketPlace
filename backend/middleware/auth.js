/**
 * Authentication Middleware - Supabase Version
 * JWT-based authentication for artists
 */

const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({ 
                error: 'Access denied. No token provided.' 
            });
        }
        
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get artist from database
        const { data: artist, error } = await supabaseAdmin
            .from('artists')
            .select('id, email, business_name, bio, profile_image_url, location, is_verified')
            .eq('id', decoded.id)
            .single();
        
        if (error || !artist) {
            return res.status(401).json({ 
                error: 'Invalid token. Artist not found.' 
            });
        }
        
        // Attach artist to request
        req.artist = artist;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired.' });
        }
        console.error('Authentication error:', error);
        return res.status(500).json({ error: 'Server error during authentication.' });
    }
};

// Optional authentication - doesn't require token but attaches artist if present
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const { data: artist } = await supabaseAdmin
                .from('artists')
                .select('id, email, business_name, is_verified')
                .eq('id', decoded.id)
                .single();
            
            if (artist) {
                req.artist = artist;
            }
        }
        
        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};

// Check if artist is verified
const requireVerified = (req, res, next) => {
    if (!req.artist.is_verified) {
        return res.status(403).json({ 
            error: 'Account not verified. Please complete verification process.' 
        });
    }
    next();
};

// Generate JWT token
const generateToken = (artistId, email) => {
    return jwt.sign(
        { id: artistId, email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (artistId, email) => {
    return jwt.sign(
        { id: artistId, email, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireVerified,
    generateToken,
    generateRefreshToken
};
