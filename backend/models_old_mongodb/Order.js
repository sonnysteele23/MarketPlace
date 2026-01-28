/**
 * Order Model
 * MongoDB schema for customer orders
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // Order Details
    orderNumber: {
        type: String,
        required: true,
        unique: true
    },
    
    // Customer Information
    customer: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        },
        phone: {
            type: String
        }
    },
    
    // Shipping Address
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        zipCode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            default: 'USA'
        }
    },
    
    // Billing Address (can be same as shipping)
    billingAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: {
            type: String,
            default: 'USA'
        }
    },
    
    // Order Items
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        productName: String,
        productImage: String,
        artist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Artist'
        },
        artistName: String,
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        price: {
            type: Number,
            required: true
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    
    // Pricing
    subtotal: {
        type: Number,
        required: true
    },
    shippingCost: {
        type: Number,
        required: true,
        default: 0
    },
    tax: {
        type: Number,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    homelessnessContribution: {
        type: Number, // 5% of subtotal
        required: true
    },
    
    // Payment Information
    payment: {
        method: {
            type: String,
            enum: ['stripe', 'paypal', 'credit_card'],
            default: 'stripe'
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        paidAt: Date,
        stripePaymentIntentId: String
    },
    
    // Order Status
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
        default: 'pending'
    },
    
    // Tracking
    tracking: {
        carrier: String,
        trackingNumber: String,
        shippedAt: Date,
        estimatedDelivery: Date,
        deliveredAt: Date
    },
    
    // Notes
    customerNotes: String,
    adminNotes: String,
    
    // Status History
    statusHistory: [{
        status: String,
        note: String,
        updatedBy: String,
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
    
}, {
    timestamps: true
});

// ===================================
// Indexes
// ===================================

orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'customer.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });

// ===================================
// Pre-save Middleware
// ===================================

orderSchema.pre('save', function(next) {
    // Generate order number if new
    if (this.isNew && !this.orderNumber) {
        const timestamp = Date.now().toString().slice(-8);
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.orderNumber = `WA-${timestamp}-${random}`;
    }
    
    // Calculate totals
    if (this.isModified('items')) {
        this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
        this.homelessnessContribution = this.subtotal * 0.05;
        this.total = this.subtotal + this.shippingCost + this.tax;
    }
    
    next();
});

// ===================================
// Methods
// ===================================

orderSchema.methods.updateStatus = function(newStatus, note = '', updatedBy = 'system') {
    this.status = newStatus;
    
    this.statusHistory.push({
        status: newStatus,
        note,
        updatedBy,
        updatedAt: new Date()
    });
    
    // Update specific dates based on status
    if (newStatus === 'shipped' && this.tracking.carrier) {
        this.tracking.shippedAt = new Date();
    }
    
    if (newStatus === 'delivered') {
        this.tracking.deliveredAt = new Date();
    }
    
    return this.save();
};

orderSchema.methods.addTracking = function(carrier, trackingNumber, estimatedDelivery) {
    this.tracking.carrier = carrier;
    this.tracking.trackingNumber = trackingNumber;
    this.tracking.estimatedDelivery = estimatedDelivery;
    
    return this.updateStatus('shipped', `Shipped via ${carrier}`);
};

orderSchema.methods.markAsPaid = function(transactionId) {
    this.payment.status = 'paid';
    this.payment.transactionId = transactionId;
    this.payment.paidAt = new Date();
    
    return this.updateStatus('processing', 'Payment received');
};

orderSchema.methods.getCustomerSummary = function() {
    return {
        orderNumber: this.orderNumber,
        status: this.status,
        total: this.total,
        items: this.items.length,
        createdAt: this.createdAt,
        tracking: this.tracking
    };
};

// ===================================
// Static Methods
// ===================================

orderSchema.statics.findByCustomerEmail = function(email) {
    return this.find({ 'customer.email': email.toLowerCase() })
        .sort({ createdAt: -1 });
};

orderSchema.statics.findPendingOrders = function() {
    return this.find({ status: 'pending' })
        .sort({ createdAt: -1 });
};

orderSchema.statics.getRevenueStats = async function(startDate, endDate) {
    const stats = await this.aggregate([
        {
            $match: {
                'payment.status': 'paid',
                createdAt: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalOrders: { $sum: 1 },
                totalRevenue: { $sum: '$total' },
                totalContribution: { $sum: '$homelessnessContribution' }
            }
        }
    ]);
    
    return stats[0] || { totalOrders: 0, totalRevenue: 0, totalContribution: 0 };
};

// ===================================
// Virtual Fields
// ===================================

orderSchema.virtual('itemCount').get(function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);
