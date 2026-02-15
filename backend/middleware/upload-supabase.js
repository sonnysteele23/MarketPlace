/**
 * File Upload Middleware - Supabase Storage Version
 * Handles image uploads with multer and Supabase Storage
 */

const multer = require('multer');
const path = require('path');
const supabaseStorage = require('../services/supabaseStorage');

// Configure multer storage (memory storage for processing)
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
};

// Multer upload configuration
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB max file size
    }
});

/**
 * Process and upload single product image to Supabase
 */
const processProductImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    
    try {
        // Upload to Supabase Storage
        const result = await supabaseStorage.uploadProductImage(
            req.file.buffer,
            req.file.originalname
        );
        
        // Attach processed image info to request
        req.processedImage = {
            filename: result.filename,
            imageUrl: result.imageUrl,
            thumbnailUrl: result.thumbnailUrl,
            size: result.size
        };
        
        next();
    } catch (error) {
        console.error('Error processing product image:', error);
        res.status(500).json({ 
            error: 'Error uploading image to storage',
            details: error.message 
        });
    }
};

/**
 * Process and upload artist profile/cover image to Supabase
 */
const processArtistImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    
    try {
        // Determine image type from route
        const imageType = req.path.includes('cover') ? 'cover' : 'profile';
        
        // Upload to Supabase Storage
        const result = await supabaseStorage.uploadArtistImage(
            req.file.buffer,
            req.file.originalname,
            imageType
        );
        
        // Attach processed image info to request
        req.processedImage = {
            filename: result.filename,
            imageUrl: result.imageUrl,
            size: result.size
        };
        
        next();
    } catch (error) {
        console.error('Error processing artist image:', error);
        res.status(500).json({ 
            error: 'Error uploading image to storage',
            details: error.message 
        });
    }
};

/**
 * Process and upload multiple product images to Supabase
 */
const processMultipleImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }
    
    try {
        // Upload all images to Supabase Storage
        const results = await supabaseStorage.uploadMultipleProductImages(req.files);
        
        // Format results for response
        req.processedImages = results.map((result, index) => ({
            filename: result.filename,
            imageUrl: result.imageUrl,
            thumbnailUrl: result.thumbnailUrl,
            size: result.size,
            originalName: req.files[index].originalname
        }));
        
        next();
    } catch (error) {
        console.error('Error processing multiple images:', error);
        res.status(500).json({ 
            error: 'Error uploading images to storage',
            details: error.message 
        });
    }
};

/**
 * Delete image from Supabase Storage
 */
const deleteImage = async (imageUrl, bucket = supabaseStorage.BUCKETS.PRODUCTS) => {
    try {
        await supabaseStorage.deleteImage(imageUrl, bucket);
    } catch (error) {
        console.error('Error deleting image:', error);
        throw error;
    }
};

/**
 * Delete multiple images from Supabase Storage
 */
const deleteMultipleImages = async (imageUrls, bucket = supabaseStorage.BUCKETS.PRODUCTS) => {
    try {
        await supabaseStorage.deleteMultipleImages(imageUrls, bucket);
    } catch (error) {
        console.error('Error deleting multiple images:', error);
        throw error;
    }
};

/**
 * Error handling middleware for multer
 */
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File size too large. Maximum 5MB allowed per image.' 
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ 
                error: 'Too many files. Maximum 5 images allowed.' 
            });
        }
        return res.status(400).json({ error: err.message });
    }
    
    if (err) {
        return res.status(400).json({ error: err.message });
    }
    
    next();
};

module.exports = {
    upload,
    processProductImage,
    processArtistImage,
    processMultipleImages,
    deleteImage,
    deleteMultipleImages,
    handleUploadError
};
