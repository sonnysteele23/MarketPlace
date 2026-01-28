/**
 * Category Model
 * MongoDB schema for product categories
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        unique: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    icon: {
        type: String, // Font Awesome icon class or emoji
        default: '🎨'
    },
    image: {
        type: String // Category image URL
    },
    displayOrder: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    
    // SEO
    metaTitle: String,
    metaDescription: String,
    
    // Statistics
    productCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// ===================================
// Indexes
// ===================================

categorySchema.index({ slug: 1 });
categorySchema.index({ displayOrder: 1 });

// ===================================
// Pre-save Middleware
// ===================================

categorySchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    next();
});

// ===================================
// Static Methods
// ===================================

categorySchema.statics.findActive = function() {
    return this.find({ isActive: true }).sort({ displayOrder: 1 });
};

categorySchema.statics.updateProductCount = async function(categorySlug) {
    const Product = mongoose.model('Product');
    const count = await Product.countDocuments({ 
        category: categorySlug, 
        status: 'active' 
    });
    
    await this.updateOne(
        { slug: categorySlug },
        { productCount: count }
    );
};

module.exports = mongoose.model('Category', categorySchema);
