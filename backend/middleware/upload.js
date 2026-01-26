/**
 * File Upload Middleware
 * Handles image uploads with multer and sharp
 */

const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../../public/uploads');
const productImagesDir = path.join(uploadDir, 'products');
const artistImagesDir = path.join(uploadDir, 'artists');

// Ensure directories exist
const createUploadDirs = async () => {
    try {
        await fs.mkdir(uploadDir, { recursive: true });
        await fs.mkdir(productImagesDir, { recursive: true });
        await fs.mkdir(artistImagesDir, { recursive: true });
    } catch (error) {
        console.error('Error creating upload directories:', error);
    }
};

createUploadDirs();

// Configure multer storage (memory storage for processing with sharp)
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

// Process and save product image
const processProductImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    
    try {
        const filename = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        const filepath = path.join(productImagesDir, filename);
        
        // Process image with sharp
        await sharp(req.file.buffer)
            .resize(1000, 1000, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 90 })
            .toFile(filepath);
        
        // Create thumbnail
        const thumbnailFilename = `thumb-${filename}`;
        const thumbnailPath = path.join(productImagesDir, thumbnailFilename);
        
        await sharp(req.file.buffer)
            .resize(300, 300, {
                fit: 'cover'
            })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);
        
        // Attach file info to request
        req.processedImage = {
            filename: filename,
            path: `/uploads/products/${filename}`,
            thumbnail: `/uploads/products/${thumbnailFilename}`,
            size: (await fs.stat(filepath)).size
        };
        
        next();
    } catch (error) {
        console.error('Error processing image:', error);
        res.status(500).json({ error: 'Error processing image file' });
    }
};

// Process and save artist profile image
const processArtistImage = async (req, res, next) => {
    if (!req.file) {
        return next();
    }
    
    try {
        const filename = `artist-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
        const filepath = path.join(artistImagesDir, filename);
        
        // Process image with sharp
        await sharp(req.file.buffer)
            .resize(500, 500, {
                fit: 'cover'
            })
            .jpeg({ quality: 90 })
            .toFile(filepath);
        
        // Attach file info to request
        req.processedImage = {
            filename: filename,
            path: `/uploads/artists/${filename}`,
            size: (await fs.stat(filepath)).size
        };
        
        next();
    } catch (error) {
        console.error('Error processing artist image:', error);
        res.status(500).json({ error: 'Error processing image file' });
    }
};

// Process multiple product images
const processMultipleImages = async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
        return next();
    }
    
    try {
        const processedImages = [];
        
        for (const file of req.files) {
            const filename = `product-${Date.now()}-${Math.round(Math.random() * 1E9)}.jpg`;
            const filepath = path.join(productImagesDir, filename);
            
            // Process image
            await sharp(file.buffer)
                .resize(1000, 1000, {
                    fit: 'inside',
                    withoutEnlargement: true
                })
                .jpeg({ quality: 90 })
                .toFile(filepath);
            
            // Create thumbnail
            const thumbnailFilename = `thumb-${filename}`;
            const thumbnailPath = path.join(productImagesDir, thumbnailFilename);
            
            await sharp(file.buffer)
                .resize(300, 300, {
                    fit: 'cover'
                })
                .jpeg({ quality: 80 })
                .toFile(thumbnailPath);
            
            processedImages.push({
                filename: filename,
                url: `/uploads/products/${filename}`,
                thumbnail: `/uploads/products/${thumbnailFilename}`,
                size: (await fs.stat(filepath)).size,
                originalName: file.originalname
            });
        }
        
        req.processedImages = processedImages;
        next();
    } catch (error) {
        console.error('Error processing multiple images:', error);
        res.status(500).json({ error: 'Error processing image files' });
    }
};

// Delete image file
const deleteImage = async (filepath) => {
    try {
        const fullPath = path.join(__dirname, '../..', filepath);
        await fs.unlink(fullPath);
        
        // Also try to delete thumbnail if exists
        if (filepath.includes('/products/')) {
            const filename = path.basename(filepath);
            const thumbnailPath = filepath.replace(filename, `thumb-${filename}`);
            const fullThumbnailPath = path.join(__dirname, '../..', thumbnailPath);
            
            try {
                await fs.unlink(fullThumbnailPath);
            } catch (err) {
                // Thumbnail might not exist, ignore
            }
        }
    } catch (error) {
        console.error('Error deleting image:', error);
    }
};

// Error handling middleware for multer
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size too large. Maximum 5MB allowed.' });
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
    handleUploadError
};
