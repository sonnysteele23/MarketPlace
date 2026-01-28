/**
 * MINIMAL Customer Test Route
 */

const express = require('express');
const router = express.Router();

// Simple test endpoint
router.get('/test', (req, res) => {
    console.log('✅ Test endpoint hit!');
    res.json({ message: 'Customer route is working!' });
});

// Minimal register endpoint
router.post('/register', async (req, res) => {
    console.log('📝 Register endpoint received request');
    console.log('Body:', req.body);
    
    res.json({ 
        message: 'Test response - if you see this, the route works!',
        received: req.body 
    });
});

module.exports = router;
