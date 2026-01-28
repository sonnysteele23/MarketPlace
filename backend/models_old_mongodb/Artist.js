/**
 * Artist Model
 * MongoDB schema for artisan/artist accounts
 */

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const artistSchema = new mongoose.Schema({
    // Authentication
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters']
    },
    
    // Profile Information
    name: {
        type: String,
        required: [true, 'Artist name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    bio: {
        type: String,
        maxlength: [1000, 'Bio cannot exceed 1000 characters']
    },
    story: {
        type: String,
        maxlength: [2000, 'Story cannot exceed 2000 characters']
    },
    
    // Contact Information
    phone: {
        type: String,
        trim: true
    },
    
    // Location
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        default: 'Washington',
        enum: ['Washington', 'WA']
    },
    zipCode: {
        type: String,
        trim: true
    },
    
    // Profile Images
    profileImage: {
        type: String,
        default: '/images/default-artist.jpg'
    },
    coverImage: {
        type: String
    },
    
    // Categories they work in
    categories: [{
        type: String,
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
    }],
    
    // Social Media
    socialMedia: {
        instagram: String,
        facebook: String,
        website: String,
        etsy: String
    },
    
    // Artist Status
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'inactive'],
        default: 'pending'
    },
    isHomeless: {
        type: Boolean,
        default: false
    },
    verified: {
        type: Boolean,
        default: false
    },
    
    // Statistics
    totalProducts: {
        type: Number,
        default: 0
    },
    totalSales: {
        type: Number,
        default: 0
    },
    totalRevenue: {
        type: Number,
        default: 0
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    
    // Account Settings
    emailNotifications: {
        type: Boolean,
        default: true
    },
    orderNotifications: {
        type: Boolean,
        default: true
    },
    
    // Admin Notes (internal only)
    adminNotes: {
        type: String
    },
    
    // Reset Password
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    
    // Last Login
    lastLogin: {
        type: Date
    }
    
}, {
    timestamps: true
});

// ===================================
// Indexes
// ===================================

artistSchema.index({ email: 1 });
artistSchema.index({ slug: 1 });
artistSchema.index({ status: 1 });
artistSchema.index({ city: 1 });
artistSchema.index({ name: 'text', bio: 'text' });

// ===================================
// Pre-save Middleware
// ===================================

// Hash password before saving
artistSchema.pre('save', async function(next) {
    // Generate slug from name
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }
    
    // Hash password if modified
    if (this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        } catch (error) {
            next(error);
        }
    }
    
    next();
});

// ===================================
// Methods
// ===================================

// Compare password for login
artistSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Get public profile (without sensitive data)
artistSchema.methods.getPublicProfile = function() {
    return {
        _id: this._id,
        name: this.name,
        slug: this.slug,
        bio: this.bio,
        story: this.story,
        city: this.city,
        state: this.state,
        profileImage: this.profileImage,
        coverImage: this.coverImage,
        categories: this.categories,
        socialMedia: this.socialMedia,
        totalProducts: this.totalProducts,
        totalSales: this.totalSales,
        rating: this.rating,
        reviewCount: this.reviewCount,
        verified: this.verified,
        isHomeless: this.isHomeless,
        createdAt: this.createdAt
    };
};

// Update statistics
artistSchema.methods.updateStats = async function() {
    const Product = mongoose.model('Product');
    
    const stats = await Product.aggregate([
        { $match: { artist: this._id } },
        {
            $group: {
                _id: null,
                totalProducts: { $sum: 1 },
                totalSales: { $sum: '$sales' },
                totalRevenue: { $sum: { $multiply: ['$customerPrice', '$sales'] } }
            }
        }
    ]);
    
    if (stats.length > 0) {
        this.totalProducts = stats[0].totalProducts;
        this.totalSales = stats[0].totalSales;
        this.totalRevenue = stats[0].totalRevenue;
    }
    
    return this.save();
};

// Generate password reset token
artistSchema.methods.generatePasswordReset = function() {
    const crypto = require('crypto');
    this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000; // 1 hour
};

// ===================================
// Static Methods
// ===================================

artistSchema.statics.findActive = function() {
    return this.find({ status: 'active' });
};

artistSchema.statics.findByLocation = function(city) {
    return this.find({ city, status: 'active' });
};

artistSchema.statics.findFeatured = function() {
    return this.find({ status: 'active', verified: true })
        .sort({ totalSales: -1 })
        .limit(6);
};

// ===================================
// Virtual Fields
// ===================================

artistSchema.virtual('products', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'artist'
});

artistSchema.virtual('fullLocation').get(function() {
    return `${this.city}, ${this.state}`;
});

// Ensure virtuals are included in JSON
artistSchema.set('toJSON', { virtuals: true });
artistSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Artist', artistSchema);
