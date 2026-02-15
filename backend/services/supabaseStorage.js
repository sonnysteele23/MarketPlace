/**
 * Supabase Storage Service
 * Handles image uploads and management in Supabase Storage
 */

const { createClient } = require('@supabase/supabase-js');
const sharp = require('sharp');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY // Use service key for backend operations
);

// Storage bucket names
const BUCKETS = {
    PRODUCTS: 'product-images',
    ARTISTS: 'artist-images'
};

/**
 * Initialize storage buckets if they don't exist
 */
async function initializeBuckets() {
    try {
        // Check and create product-images bucket
        const { data: productBucket, error: productError } = await supabase
            .storage
            .getBucket(BUCKETS.PRODUCTS);
        
        if (productError && productError.message.includes('not found')) {
            await supabase.storage.createBucket(BUCKETS.PRODUCTS, {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
            });
            console.log('✅ Created product-images bucket');
        }
        
        // Check and create artist-images bucket
        const { data: artistBucket, error: artistError } = await supabase
            .storage
            .getBucket(BUCKETS.ARTISTS);
        
        if (artistError && artistError.message.includes('not found')) {
            await supabase.storage.createBucket(BUCKETS.ARTISTS, {
                public: true,
                fileSizeLimit: 5242880, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
            });
            console.log('✅ Created artist-images bucket');
        }
        
        console.log('✅ Supabase storage buckets initialized');
    } catch (error) {
        console.error('❌ Error initializing storage buckets:', error.message);
    }
}

/**
 * Upload product image to Supabase Storage
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} originalName - Original filename
 * @returns {Object} - URLs for the uploaded image and thumbnail
 */
async function uploadProductImage(fileBuffer, originalName) {
    try {
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const fileExt = originalName.split('.').pop().toLowerCase();
        
        // Generate unique filenames
        const mainFilename = `product-${timestamp}-${randomSuffix}.jpg`;
        const thumbFilename = `thumb-${timestamp}-${randomSuffix}.jpg`;
        
        // Process main image (max 1200x1200, maintain aspect ratio)
        const processedImage = await sharp(fileBuffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        
        // Process thumbnail (300x300, cover)
        const thumbnail = await sharp(fileBuffer)
            .resize(300, 300, {
                fit: 'cover',
                position: 'center'
            })
            .jpeg({ quality: 80, progressive: true })
            .toBuffer();
        
        // Upload main image
        const { data: mainData, error: mainError } = await supabase
            .storage
            .from(BUCKETS.PRODUCTS)
            .upload(mainFilename, processedImage, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
            });
        
        if (mainError) {
            throw new Error(`Failed to upload main image: ${mainError.message}`);
        }
        
        // Upload thumbnail
        const { data: thumbData, error: thumbError } = await supabase
            .storage
            .from(BUCKETS.PRODUCTS)
            .upload(thumbFilename, thumbnail, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
            });
        
        if (thumbError) {
            throw new Error(`Failed to upload thumbnail: ${thumbError.message}`);
        }
        
        // Get public URLs
        const { data: mainUrl } = supabase
            .storage
            .from(BUCKETS.PRODUCTS)
            .getPublicUrl(mainFilename);
        
        const { data: thumbUrl } = supabase
            .storage
            .from(BUCKETS.PRODUCTS)
            .getPublicUrl(thumbFilename);
        
        return {
            imageUrl: mainUrl.publicUrl,
            thumbnailUrl: thumbUrl.publicUrl,
            filename: mainFilename,
            thumbnailFilename: thumbFilename,
            size: processedImage.length
        };
    } catch (error) {
        console.error('Error uploading product image to Supabase:', error);
        throw error;
    }
}

/**
 * Upload multiple product images to Supabase Storage
 * @param {Array} files - Array of file objects with buffer and originalname
 * @returns {Array} - Array of image URLs
 */
async function uploadMultipleProductImages(files) {
    try {
        const uploadPromises = files.map(file => 
            uploadProductImage(file.buffer, file.originalname)
        );
        
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Error uploading multiple images:', error);
        throw error;
    }
}

/**
 * Upload artist profile/cover image to Supabase Storage
 * @param {Buffer} fileBuffer - Image file buffer
 * @param {string} originalName - Original filename
 * @param {string} imageType - 'profile' or 'cover'
 * @returns {Object} - URL for the uploaded image
 */
async function uploadArtistImage(fileBuffer, originalName, imageType = 'profile') {
    try {
        const timestamp = Date.now();
        const randomSuffix = Math.round(Math.random() * 1E9);
        const filename = `${imageType}-${timestamp}-${randomSuffix}.jpg`;
        
        // Different sizes for profile vs cover
        const size = imageType === 'profile' 
            ? { width: 500, height: 500, fit: 'cover' }
            : { width: 1200, height: 400, fit: 'cover' };
        
        // Process image
        const processedImage = await sharp(fileBuffer)
            .resize(size.width, size.height, {
                fit: size.fit,
                position: 'center'
            })
            .jpeg({ quality: 85, progressive: true })
            .toBuffer();
        
        // Upload to Supabase
        const { data, error } = await supabase
            .storage
            .from(BUCKETS.ARTISTS)
            .upload(filename, processedImage, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
            });
        
        if (error) {
            throw new Error(`Failed to upload ${imageType} image: ${error.message}`);
        }
        
        // Get public URL
        const { data: urlData } = supabase
            .storage
            .from(BUCKETS.ARTISTS)
            .getPublicUrl(filename);
        
        return {
            imageUrl: urlData.publicUrl,
            filename: filename,
            size: processedImage.length
        };
    } catch (error) {
        console.error(`Error uploading ${imageType} image to Supabase:`, error);
        throw error;
    }
}

/**
 * Delete image from Supabase Storage
 * @param {string} imageUrl - Full URL of the image to delete
 * @param {string} bucket - Bucket name (PRODUCTS or ARTISTS)
 */
async function deleteImage(imageUrl, bucket = BUCKETS.PRODUCTS) {
    try {
        // Extract filename from URL
        // URL format: https://PROJECT.supabase.co/storage/v1/object/public/BUCKET/FILENAME
        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1];
        
        if (!filename) {
            throw new Error('Invalid image URL');
        }
        
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .remove([filename]);
        
        if (error) {
            throw new Error(`Failed to delete image: ${error.message}`);
        }
        
        return { success: true, filename };
    } catch (error) {
        console.error('Error deleting image from Supabase:', error);
        throw error;
    }
}

/**
 * Delete multiple images from Supabase Storage
 * @param {Array} imageUrls - Array of image URLs to delete
 * @param {string} bucket - Bucket name
 */
async function deleteMultipleImages(imageUrls, bucket = BUCKETS.PRODUCTS) {
    try {
        const filenames = imageUrls.map(url => {
            const urlParts = url.split('/');
            return urlParts[urlParts.length - 1];
        });
        
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .remove(filenames);
        
        if (error) {
            throw new Error(`Failed to delete images: ${error.message}`);
        }
        
        return { success: true, deletedCount: filenames.length };
    } catch (error) {
        console.error('Error deleting multiple images:', error);
        throw error;
    }
}

/**
 * Get signed URL for private image access (if needed in future)
 * @param {string} filename - Filename in storage
 * @param {string} bucket - Bucket name
 * @param {number} expiresIn - URL expiry in seconds (default 1 hour)
 */
async function getSignedUrl(filename, bucket = BUCKETS.PRODUCTS, expiresIn = 3600) {
    try {
        const { data, error } = await supabase
            .storage
            .from(bucket)
            .createSignedUrl(filename, expiresIn);
        
        if (error) {
            throw new Error(`Failed to create signed URL: ${error.message}`);
        }
        
        return data.signedUrl;
    } catch (error) {
        console.error('Error creating signed URL:', error);
        throw error;
    }
}

module.exports = {
    initializeBuckets,
    uploadProductImage,
    uploadMultipleProductImages,
    uploadArtistImage,
    deleteImage,
    deleteMultipleImages,
    getSignedUrl,
    BUCKETS
};
