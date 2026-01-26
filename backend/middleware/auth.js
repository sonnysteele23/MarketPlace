/**
 * Authentication Middleware
 * JWT-based authentication for artists
 */

const jwt = require('jsonwebtoken');
const Artist = require('../models/Artist');

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
        const artist = await Artist.findById(decoded.artistId).select('-password');
        
        if (!artist) {
            return res.status(401).json({ 
                error: 'Invalid token. Artist not found.' 
            });
        }
        
        if (artist.status === 'suspended') {
            return res.status(403).json({ 
                error: 'Account suspended. Please contact support.' 
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
            const artist = await Artist.findById(decoded.artistId).select('-password');
            if (artist && artist.status !== 'suspended') {
                req.artist = artist;
            }
        }
        
        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};

// Check if artist owns the resource
const checkResourceOwnership = (resourceType) => {
    return async (req, res, next) => {
        try {
            const resourceId = req.params.id;
            
            if (resourceType === 'product') {
                const Product = require('../models/Product');
                const product = await Product.findById(resourceId);
                
                if (!product) {
                    return res.status(404).json({ error: 'Product not found.' });
                }
                
                if (product.artist.toString() !== req.artist._id.toString()) {
                    return res.status(403).json({ 
                        error: 'Access denied. You do not own this resource.' 
                    });
                }
                
                req.resource = product;
            }
            
            next();
        } catch (error) {
            return res.status(500).json({ error: 'Server error checking ownership.' });
        }
    };
};

// Check if artist is verified
const requireVerified = (req, res, next) => {
    if (!req.artist.verified) {
        return res.status(403).json({ 
            error: 'Account not verified. Please complete verification process.' 
        });
    }
    next();
};

// Check if artist is active
const requireActive = (req, res, next) => {
    if (req.artist.status !== 'active') {
        return res.status(403).json({ 
            error: `Account is ${req.artist.status}. Please contact support.` 
        });
    }
    next();
};

// Generate JWT token
const generateToken = (artistId) => {
    return jwt.sign(
        { artistId },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

// Generate refresh token (longer expiry)
const generateRefreshToken = (artistId) => {
    return jwt.sign(
        { artistId, type: 'refresh' },
        process.env.JWT_SECRET,
        { expiresIn: '30d' }
    );
};

module.exports = {
    authenticateToken,
    optionalAuth,
    checkResourceOwnership,
    requireVerified,
    requireActive,
    generateToken,
    generateRefreshToken
};
