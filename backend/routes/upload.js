/**
 * Upload Routes
 * API endpoints for file uploads
 */

const express = require('express');
const router = express.Router();
const { 
    upload, 
    processProductImage, 
    processArtistImage,
    processMultipleImages,
    deleteImage,
    handleUploadError 
} = require('../middleware/upload');
const { authenticateToken } = require('../middleware/auth');

// ===================================
// Protected Routes (Artist Only)
// ===================================

// POST /api/upload/product-image - Upload single product image
router.post('/product-image', 
    authenticateToken,
    upload.single('image'),
    processProductImage,
    handleUploadError,
    (req, res) => {
        try {
            if (!req.processedImage) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            
            res.json({
                message: 'Image uploaded successfully',
                image: req.processedImage
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Error uploading image' });
        }
    }
);

// POST /api/upload/product-images - Upload multiple product images
router.post('/product-images',
    authenticateToken,
    upload.array('images', 5), // Max 5 images
    processMultipleImages,
    handleUploadError,
    (req, res) => {
        try {
            if (!req.processedImages || req.processedImages.length === 0) {
                return res.status(400).json({ error: 'No image files provided' });
            }
            
            res.json({
                message: 'Images uploaded successfully',
                images: req.processedImages
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Error uploading images' });
        }
    }
);

// POST /api/upload/artist-image - Upload artist profile image
router.post('/artist-image',
    authenticateToken,
    upload.single('image'),
    processArtistImage,
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.processedImage) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            
            // Update artist profile image
            const Artist = require('../models/Artist');
            
            // Delete old image if exists
            if (req.artist.profileImage && req.artist.profileImage !== '/images/default-artist.jpg') {
                await deleteImage(req.artist.profileImage);
            }
            
            req.artist.profileImage = req.processedImage.path;
            await req.artist.save();
            
            res.json({
                message: 'Profile image uploaded successfully',
                image: req.processedImage,
                artist: req.artist.getPublicProfile()
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Error uploading profile image' });
        }
    }
);

// POST /api/upload/artist-cover - Upload artist cover image
router.post('/artist-cover',
    authenticateToken,
    upload.single('image'),
    processArtistImage,
    handleUploadError,
    async (req, res) => {
        try {
            if (!req.processedImage) {
                return res.status(400).json({ error: 'No image file provided' });
            }
            
            // Update artist cover image
            const Artist = require('../models/Artist');
            
            // Delete old image if exists
            if (req.artist.coverImage) {
                await deleteImage(req.artist.coverImage);
            }
            
            req.artist.coverImage = req.processedImage.path;
            await req.artist.save();
            
            res.json({
                message: 'Cover image uploaded successfully',
                image: req.processedImage,
                artist: req.artist.getPublicProfile()
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Error uploading cover image' });
        }
    }
);

// DELETE /api/upload/image - Delete an image
router.delete('/image',
    authenticateToken,
    async (req, res) => {
        try {
            const { imagePath } = req.body;
            
            if (!imagePath) {
                return res.status(400).json({ error: 'Image path is required' });
            }
            
            await deleteImage(imagePath);
            
            res.json({ message: 'Image deleted successfully' });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({ error: 'Error deleting image' });
        }
    }
);

module.exports = router;
