/**
 * Seed Database with Initial Categories
 * Run this script to populate the database with product categories
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/wa-artisan-marketplace';

const categories = [
    {
        name: 'Jewelry & Accessories',
        slug: 'jewelry',
        description: 'Handcrafted necklaces, bracelets, earrings, and accessories',
        icon: '💍',
        displayOrder: 1
    },
    {
        name: 'Home Decor',
        slug: 'home-decor',
        description: 'Beautiful handmade items to decorate your home',
        icon: '🏠',
        displayOrder: 2
    },
    {
        name: 'Pottery & Ceramics',
        slug: 'pottery',
        description: 'Handmade pottery, bowls, vases, and ceramic art',
        icon: '🏺',
        displayOrder: 3
    },
    {
        name: 'Textiles & Fiber Arts',
        slug: 'textiles',
        description: 'Woven textiles, quilts, knitted items, and fiber art',
        icon: '🧶',
        displayOrder: 4
    },
    {
        name: 'Paintings & Wall Art',
        slug: 'paintings',
        description: 'Original paintings, prints, and wall art',
        icon: '🎨',
        displayOrder: 5
    },
    {
        name: 'Sculpture',
        slug: 'sculpture',
        description: 'Handmade sculptures in various materials',
        icon: '🗿',
        displayOrder: 6
    },
    {
        name: 'Woodworking',
        slug: 'woodworking',
        description: 'Handcrafted wooden furniture, carvings, and decor',
        icon: '🪵',
        displayOrder: 7
    },
    {
        name: 'Metalwork',
        slug: 'metalwork',
        description: 'Forged metal art, sculptures, and functional items',
        icon: '⚒️',
        displayOrder: 8
    },
    {
        name: 'Glass Art',
        slug: 'glass',
        description: 'Blown glass, stained glass, and glass sculptures',
        icon: '🔮',
        displayOrder: 9
    },
    {
        name: 'Paper Arts & Prints',
        slug: 'paper-arts',
        description: 'Handmade paper, greeting cards, and art prints',
        icon: '📜',
        displayOrder: 10
    },
    {
        name: 'Photography',
        slug: 'photography',
        description: 'Fine art photography and photo prints',
        icon: '📷',
        displayOrder: 11
    },
    {
        name: 'Handmade Soaps & Candles',
        slug: 'soap-candles',
        description: 'Natural handmade soaps, candles, and bath products',
        icon: '🕯️',
        displayOrder: 12
    },
    {
        name: 'Leather Goods',
        slug: 'leather',
        description: 'Handcrafted leather bags, wallets, and accessories',
        icon: '👜',
        displayOrder: 13
    },
    {
        name: 'Mixed Media',
        slug: 'mixed-media',
        description: 'Unique mixed media art combining multiple materials',
        icon: '✨',
        displayOrder: 14
    }
];

async function seedCategories() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('✅ Connected to MongoDB');
        
        // Clear existing categories (optional - comment out to preserve existing)
        // await Category.deleteMany({});
        // console.log('🗑️  Cleared existing categories');
        
        // Insert categories
        for (const categoryData of categories) {
            const existing = await Category.findOne({ slug: categoryData.slug });
            if (existing) {
                console.log(`⏭️  Category already exists: ${categoryData.name}`);
            } else {
                await Category.create(categoryData);
                console.log(`✅ Created category: ${categoryData.name}`);
            }
        }
        
        console.log('\n🎉 Database seeded successfully!');
        console.log(`📊 Total categories: ${categories.length}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run the seed function
seedCategories();
