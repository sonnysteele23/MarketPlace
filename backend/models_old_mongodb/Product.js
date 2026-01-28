/**
 * Product Model
 * MongoDB schema for artisan products
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    description: {
        type: String,
        required: [true, 'Description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    
    // Category
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: [
            'jewelry',
            'home-decor',
            'pottery',
            'textiles',
            'paintings',
            'sculpture',
            'woodworking',
            'metalwork',
            'glass',
            'paper-arts',
            'photography',
            'soap-candles',
            'leather',
            'mixed-media'
        ]
    },
    
    // Artist Information
    artist: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        required: true
    },
    artistName: {
        type: String,
        required: true
    },
    
    // Pricing
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [1, 'Price must be at least $1']
    },
    customerPrice: {
        type: Number, // price + 10% markup
        required: true
    },
    homelessnessContribution: {
        type: Number, // 5% of customer price
        required: true
    },
    
    // Inventory
    quantity: {
        type: Number,
        required: [true, 'Quantity is required'],
        min: [0, 'Quantity cannot be negative'],
        default: 1
    },
    sku: {
        type: String,
        trim: true
    },
    
    // Images
    images: [{
        url: {
            type: String,
            required: true
        },
        alt: String,
        isMain: {
            type: Boolean,
            default: false
        }
    }],
    
    // Product Details
    materials: {
        type: String,
        trim: true
    },
    dimensions: {
        type: String,
        trim: true
    },
    weight: {
        type: Number, // in pounds
        min: 0
    },
    careInstructions: {
        type: String,
        trim: true
    },
    
    // Shipping
    shippingCost: {
        type: Number,
        default: 8.00,
        min: 0
    },
    freeShipping: {
        type: Boolean,
        default: false
    },
    processingTime: {
        type: String,
        enum: ['1-2', '3-5', '1-2-weeks', 'custom'],
        default: '3-5'
    },
    
    // Tags for search
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    
    // Status
    status: {
        type: String,
        enum: ['draft', 'active', 'sold', 'archived'],
        default: 'active'
    },
    
    // Flags
    featured: {
        type: Boolean,
        default: false
    },
    newArrival: {
        type: Boolean,
        default: true
    },
    onSale: {
        type: Boolean,
        default: false
    },
    
    // Statistics
    views: {
        type: Number,
        default: 0
    },
    favorites: {
        type: Number,
        default: 0
    },
    sales: {
        type: Number,
        default: 0
    },
    
    // Reviews
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    
    // SEO
    metaTitle: String,
    metaDescription: String,
    
}, {
    timestamps: true
});

// ===================================
// Indexes for Search Performance
// ===================================

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ artist: 1 });
productSchema.index({ status: 1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ customerPrice: 1 });

// ===================================
// Pre-save Middleware
// ===================================

productSchema.pre('save', function(next) {
    // Generate slug from name
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    
    // Calculate customer price and contribution
    if (this.isModified('price')) {
        this.customerPrice = this.price * 1.10; // 10% markup
        this.homelessnessContribution = this.customerPrice * 0.05; // 5% of customer price
    }
    
    // Mark as new arrival if created in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    this.newArrival = this.createdAt > thirtyDaysAgo;
    
    next();
});

// ===================================
// Methods
// ===================================

productSchema.methods.incrementViews = function() {
    this.views += 1;
    return this.save();
};

productSchema.methods.addToFavorites = function() {
    this.favorites += 1;
    return this.save();
};

productSchema.methods.recordSale = function() {
    this.sales += 1;
    this.quantity -= 1;
    if (this.quantity === 0) {
        this.status = 'sold';
    }
    return this.save();
};

// ===================================
// Static Methods
// ===================================

productSchema.statics.findFeatured = function() {
    return this.find({ featured: true, status: 'active' }).limit(8);
};

productSchema.statics.findNewArrivals = function() {
    return this.find({ newArrival: true, status: 'active' })
        .sort({ createdAt: -1 })
        .limit(12);
};

productSchema.statics.findByCategory = function(category) {
    return this.find({ category, status: 'active' });
};

productSchema.statics.searchProducts = function(query) {
    return this.find(
        { $text: { $search: query }, status: 'active' },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
};

// ===================================
// Virtual Fields
// ===================================

productSchema.virtual('isInStock').get(function() {
    return this.quantity > 0 && this.status === 'active';
});

productSchema.virtual('totalContribution').get(function() {
    return this.homelessnessContribution * this.sales;
});

// ===================================
// Export Model
// ===================================

module.exports = mongoose.model('Product', productSchema);
