/**
 * Seed Database Script
 * Adds categories and sample products to the database
 * All dummy data is marked with is_dummy_data: true for easy cleanup
 * 
 * Run with: node backend/scripts/seed-database.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');

// ===================================
// Categories Data
// ===================================
const categories = [
    { 
        name: 'Jewelry & Accessories', 
        slug: 'jewelry',
        description: 'Handcrafted jewelry including rings, necklaces, earrings, bracelets, and accessories',
        icon: 'gem'
    },
    { 
        name: 'Pottery & Ceramics', 
        slug: 'pottery',
        description: 'Handmade pottery, ceramic art, mugs, bowls, and decorative pieces',
        icon: 'coffee'
    },
    { 
        name: 'Paintings & Wall Art', 
        slug: 'paintings',
        description: 'Original paintings, prints, and wall decorations',
        icon: 'palette'
    },
    { 
        name: 'Woodworking', 
        slug: 'woodworking',
        description: 'Handcrafted wooden items, furniture, cutting boards, and home decor',
        icon: 'tree-pine'
    },
    { 
        name: 'Textiles & Fiber Arts', 
        slug: 'textiles',
        description: 'Handwoven textiles, knitted items, quilts, and fabric art',
        icon: 'scissors'
    },
    { 
        name: 'Glass Art', 
        slug: 'glass',
        description: 'Stained glass, blown glass, fused glass art and decorations',
        icon: 'sparkles'
    },
    { 
        name: 'Home Decor', 
        slug: 'home-decor',
        description: 'Decorative items for the home including candles, vases, and accents',
        icon: 'home'
    },
    { 
        name: 'Sculpture', 
        slug: 'sculpture',
        description: 'Three-dimensional art pieces in various materials',
        icon: 'box'
    },
    { 
        name: 'Photography', 
        slug: 'photography',
        description: 'Original photography prints of Washington landscapes and more',
        icon: 'camera'
    },
    { 
        name: 'Leather Goods', 
        slug: 'leather',
        description: 'Handcrafted leather wallets, bags, belts, and accessories',
        icon: 'briefcase'
    }
];

// ===================================
// Sample Artists Data
// ===================================
const sampleArtists = [
    {
        email: 'demo.potter@example.com',
        business_name: 'Cascade Pottery Studio',
        bio: 'Creating functional and decorative ceramics inspired by the Pacific Northwest. Each piece is wheel-thrown and hand-glazed in my Seattle studio.',
        location: 'Seattle, WA',
        website_url: 'https://cascadepottery.example.com',
        profile_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop',
        is_dummy_data: true
    },
    {
        email: 'demo.woodworker@example.com',
        business_name: 'Olympic Woodcraft',
        bio: 'Handcrafting heirloom-quality wooden goods using sustainably sourced Pacific Northwest timber. Specializing in cutting boards, furniture, and home decor.',
        location: 'Olympia, WA',
        website_url: 'https://olympicwoodcraft.example.com',
        profile_image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop',
        is_dummy_data: true
    },
    {
        email: 'demo.jeweler@example.com',
        business_name: 'Puget Sound Silver',
        bio: 'Sterling silver and gemstone jewelry inspired by the waters and mountains of Washington State. Each piece tells a story of our beautiful region.',
        location: 'Tacoma, WA',
        website_url: 'https://pugetsoundsilver.example.com',
        profile_image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        is_dummy_data: true
    },
    {
        email: 'demo.painter@example.com',
        business_name: 'Rainier Art Studio',
        bio: 'Capturing the majesty of the Pacific Northwest through oil and acrylic paintings. From Mount Rainier to the San Juan Islands, I bring our landscapes to life.',
        location: 'Bellingham, WA',
        website_url: 'https://rainierart.example.com',
        profile_image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
        is_dummy_data: true
    },
    {
        email: 'demo.textile@example.com',
        business_name: 'Evergreen Fiber Arts',
        bio: 'Hand-dyed yarns and woven textiles using natural fibers and plant-based dyes. Bringing color and warmth to your home.',
        location: 'Spokane, WA',
        website_url: 'https://evergreenfiberarts.example.com',
        profile_image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
        is_dummy_data: true
    }
];

// ===================================
// Sample Products Data
// ===================================
const sampleProducts = [
    // Pottery & Ceramics
    {
        name: 'Handcrafted Stoneware Mug',
        description: 'A beautiful wheel-thrown stoneware mug with a comfortable handle and smooth glazed interior. Perfect for your morning coffee or tea. Each mug is unique with subtle variations in the hand-applied glaze. Microwave and dishwasher safe.',
        price: 38.00,
        stock_quantity: 12,
        category_slug: 'pottery',
        artist_index: 0,
        materials: 'Stoneware clay, food-safe glaze',
        dimensions: '4" diameter x 4.5" tall',
        weight: 0.8,
        image_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },
    {
        name: 'Ceramic Serving Bowl - Ocean Blue',
        description: 'A stunning large serving bowl featuring a deep ocean blue glaze reminiscent of Puget Sound. Hand-thrown and perfect for salads, pasta, or as a decorative centerpiece. The exterior features a natural clay texture.',
        price: 75.00,
        stock_quantity: 6,
        category_slug: 'pottery',
        artist_index: 0,
        materials: 'Stoneware clay, high-fire glaze',
        dimensions: '12" diameter x 4" deep',
        weight: 2.5,
        image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },
    {
        name: 'Speckled Ceramic Vase',
        description: 'An elegant hand-thrown vase with a beautiful speckled glaze. The organic shape and earthy tones make it perfect for displaying dried flowers or as a standalone decorative piece.',
        price: 55.00,
        stock_quantity: 8,
        category_slug: 'pottery',
        artist_index: 0,
        materials: 'Stoneware clay, speckled glaze',
        dimensions: '6" diameter x 9" tall',
        weight: 1.5,
        image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400&h=400&fit=crop',
        is_featured: false,
        is_dummy_data: true
    },

    // Woodworking
    {
        name: 'Live Edge Walnut Cutting Board',
        description: 'A stunning live edge cutting board crafted from locally sourced black walnut. The natural edge showcases the beautiful grain patterns unique to each piece. Finished with food-safe mineral oil and beeswax.',
        price: 125.00,
        stock_quantity: 4,
        category_slug: 'woodworking',
        artist_index: 1,
        materials: 'Black walnut, mineral oil, beeswax',
        dimensions: '18" x 12" x 1.5"',
        weight: 4.2,
        image_url: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1594226801341-41427b4e5c22?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },
    {
        name: 'Maple Wood Coaster Set',
        description: 'A set of 4 handcrafted coasters made from Pacific Northwest maple. Each coaster features a unique grain pattern and is finished with a water-resistant coating. Comes in a matching wooden holder.',
        price: 45.00,
        stock_quantity: 15,
        category_slug: 'woodworking',
        artist_index: 1,
        materials: 'Maple wood, water-resistant finish',
        dimensions: '4" diameter x 0.5" thick (each)',
        weight: 0.6,
        image_url: 'https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1605627079912-97c3810a11a4?w=400&h=400&fit=crop',
        is_featured: false,
        is_dummy_data: true
    },
    {
        name: 'Cedar Jewelry Box',
        description: 'A beautifully crafted jewelry box made from aromatic Western red cedar. Features a hinged lid with a small mirror, velvet-lined interior, and multiple compartments. The natural cedar scent helps protect your precious items.',
        price: 89.00,
        stock_quantity: 7,
        category_slug: 'woodworking',
        artist_index: 1,
        materials: 'Western red cedar, brass hinges, velvet lining',
        dimensions: '8" x 6" x 4"',
        weight: 1.8,
        image_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },

    // Jewelry
    {
        name: 'Sterling Silver Mountain Ring',
        description: 'A handcrafted sterling silver ring featuring the silhouette of Mount Rainier. The textured band mimics the mountain terrain, while the peak rises elegantly. Available in sizes 5-12.',
        price: 95.00,
        stock_quantity: 20,
        category_slug: 'jewelry',
        artist_index: 2,
        materials: 'Sterling silver .925',
        dimensions: 'Band width: 8mm',
        weight: 0.2,
        image_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },
    {
        name: 'Sea Glass Pendant Necklace',
        description: 'A genuine sea glass pendant wrapped in sterling silver wire on an 18" sterling chain. Each piece of sea glass is hand-collected from Washington beaches and has been naturally tumbled by the waves for decades.',
        price: 68.00,
        stock_quantity: 10,
        category_slug: 'jewelry',
        artist_index: 2,
        materials: 'Sea glass, sterling silver',
        dimensions: 'Pendant: 1" x 0.75", Chain: 18"',
        weight: 0.1,
        image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&h=400&fit=crop',
        is_featured: false,
        is_dummy_data: true
    },
    {
        name: 'Hammered Copper Cuff Bracelet',
        description: 'A stunning cuff bracelet hand-forged from copper with a hammered texture that catches the light beautifully. The open design allows for easy adjustment and comfortable wear. Finished with a protective coating.',
        price: 55.00,
        stock_quantity: 12,
        category_slug: 'jewelry',
        artist_index: 2,
        materials: 'Solid copper, protective lacquer',
        dimensions: '6" circumference x 1" wide',
        weight: 0.15,
        image_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },

    // Paintings
    {
        name: 'Mount Rainier at Sunset - Original Oil Painting',
        description: 'An original oil painting capturing the majestic Mount Rainier bathed in the golden light of sunset. The vibrant colors and dramatic sky make this a stunning centerpiece for any room. Signed by the artist.',
        price: 450.00,
        stock_quantity: 1,
        category_slug: 'paintings',
        artist_index: 3,
        materials: 'Oil on canvas, wooden frame',
        dimensions: '24" x 36" framed',
        weight: 5.0,
        image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },
    {
        name: 'Pacific Northwest Forest - Watercolor Print',
        description: 'A high-quality giclée print of an original watercolor painting depicting the misty forests of the Pacific Northwest. Printed on archival paper with fade-resistant inks. Unframed.',
        price: 45.00,
        stock_quantity: 25,
        category_slug: 'paintings',
        artist_index: 3,
        materials: 'Giclée print on archival paper',
        dimensions: '11" x 14"',
        weight: 0.3,
        image_url: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=400&h=400&fit=crop',
        is_featured: false,
        is_dummy_data: true
    },
    {
        name: 'San Juan Islands - Acrylic on Canvas',
        description: 'An original acrylic painting showcasing the serene beauty of the San Juan Islands. The calm waters and distant islands create a peaceful scene perfect for any coastal-themed space.',
        price: 275.00,
        stock_quantity: 1,
        category_slug: 'paintings',
        artist_index: 3,
        materials: 'Acrylic on stretched canvas',
        dimensions: '18" x 24"',
        weight: 2.5,
        image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },

    // Textiles
    {
        name: 'Hand-Dyed Wool Throw Blanket',
        description: 'A luxuriously soft throw blanket made from 100% merino wool, hand-dyed using plant-based dyes. The rich, earthy colors are inspired by the forests of Washington State. Perfect for cozy evenings.',
        price: 185.00,
        stock_quantity: 5,
        category_slug: 'textiles',
        artist_index: 4,
        materials: '100% merino wool, plant-based dyes',
        dimensions: '50" x 60"',
        weight: 2.0,
        image_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1580301762395-21ce84d00bc6?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },
    {
        name: 'Woven Wall Hanging - Mountain Dreams',
        description: 'A stunning handwoven wall hanging featuring a mountain landscape in soft, neutral tones. Made on a traditional floor loom using cotton and wool yarns. Includes wooden dowel for hanging.',
        price: 145.00,
        stock_quantity: 3,
        category_slug: 'textiles',
        artist_index: 4,
        materials: 'Cotton, wool, wooden dowel',
        dimensions: '18" wide x 24" long',
        weight: 1.2,
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
        is_featured: false,
        is_dummy_data: true
    },
    {
        name: 'Hand-Knit Alpaca Scarf',
        description: 'An incredibly soft scarf hand-knit from 100% baby alpaca wool. The natural cream color goes with everything, and the lightweight warmth is perfect for Pacific Northwest weather.',
        price: 78.00,
        stock_quantity: 8,
        category_slug: 'textiles',
        artist_index: 4,
        materials: '100% baby alpaca wool',
        dimensions: '8" wide x 72" long',
        weight: 0.4,
        image_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    },

    // Home Decor
    {
        name: 'Soy Wax Candle - Cedar & Pine',
        description: 'A hand-poured soy wax candle with the fresh scent of Pacific Northwest forests. Made with 100% natural soy wax, cotton wicks, and premium fragrance oils. Burns for approximately 45 hours.',
        price: 28.00,
        stock_quantity: 30,
        category_slug: 'home-decor',
        artist_index: 0,
        materials: 'Soy wax, cotton wick, fragrance oils, glass jar',
        dimensions: '3.5" diameter x 4" tall',
        weight: 0.8,
        image_url: 'https://images.unsplash.com/photo-1602607815083-aa5d4f69fa1f?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1602607815083-aa5d4f69fa1f?w=400&h=400&fit=crop',
        is_featured: false,
        is_dummy_data: true
    },
    {
        name: 'Macramé Plant Hanger',
        description: 'A beautiful handmade macramé plant hanger crafted from natural cotton cord. The intricate knotwork adds bohemian charm to any space. Fits pots up to 8" diameter.',
        price: 42.00,
        stock_quantity: 15,
        category_slug: 'home-decor',
        artist_index: 4,
        materials: '100% natural cotton cord',
        dimensions: '40" total length',
        weight: 0.5,
        image_url: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=800&h=800&fit=crop',
        thumbnail_url: 'https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=400&h=400&fit=crop',
        is_featured: true,
        is_dummy_data: true
    }
];

// ===================================
// Seed Functions
// ===================================

async function seedCategories() {
    console.log('🌱 Seeding categories...');
    
    // First, get existing categories
    const { data: existingCategories, error: fetchError } = await supabaseAdmin
        .from('categories')
        .select('*');
    
    if (fetchError) {
        console.error('Error fetching categories:', fetchError);
        throw fetchError;
    }
    
    // If categories exist, update them with slugs and return
    if (existingCategories && existingCategories.length > 0) {
        console.log(`📦 Found ${existingCategories.length} existing categories, updating with slugs...`);
        
        // Update existing categories with slugs
        for (const cat of existingCategories) {
            const slug = cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
            await supabaseAdmin
                .from('categories')
                .update({ slug, is_dummy_data: false })
                .eq('id', cat.id);
        }
        
        // Fetch updated categories
        const { data: updated } = await supabaseAdmin
            .from('categories')
            .select('*');
        
        console.log(`✅ Updated ${updated.length} categories with slugs`);
        return updated;
    }
    
    // Otherwise insert new categories
    const { data, error } = await supabaseAdmin
        .from('categories')
        .insert(categories.map(cat => ({
            ...cat,
            is_dummy_data: true
        })))
        .select();
    
    if (error) {
        console.error('Error seeding categories:', error);
        throw error;
    }
    
    console.log(`✅ Seeded ${data.length} categories`);
    return data;
}

async function seedArtists() {
    console.log('🌱 Seeding sample artists...');
    
    const { data, error } = await supabaseAdmin
        .from('artists')
        .upsert(sampleArtists, { 
            onConflict: 'email',
            ignoreDuplicates: false 
        })
        .select();
    
    if (error) {
        console.error('Error seeding artists:', error);
        throw error;
    }
    
    console.log(`✅ Seeded ${data.length} artists`);
    return data;
}

async function seedProducts(categories, artists) {
    console.log('🌱 Seeding sample products...');
    
    // Create a map of category slugs to IDs (handle both slug and name-based matching)
    const categoryMap = {};
    categories.forEach(cat => {
        if (cat.slug) {
            categoryMap[cat.slug] = cat.id;
        }
        // Also map by simplified name
        const simpleName = cat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-');
        categoryMap[simpleName] = cat.id;
        // Map common variations
        if (cat.name.includes('Pottery')) categoryMap['pottery'] = cat.id;
        if (cat.name.includes('Jewelry')) categoryMap['jewelry'] = cat.id;
        if (cat.name.includes('Painting')) categoryMap['paintings'] = cat.id;
        if (cat.name.includes('Woodworking')) categoryMap['woodworking'] = cat.id;
        if (cat.name.includes('Textile')) categoryMap['textiles'] = cat.id;
        if (cat.name.includes('Glass')) categoryMap['glass'] = cat.id;
        if (cat.name.includes('Home') || cat.name.includes('Decor')) categoryMap['home-decor'] = cat.id;
    });
    
    console.log('Category mapping:', Object.keys(categoryMap));
    
    // Prepare products with correct IDs
    const productsToInsert = sampleProducts.map(product => {
        const { category_slug, artist_index, ...productData } = product;
        const categoryId = categoryMap[category_slug];
        if (!categoryId) {
            console.warn(`Warning: No category found for slug "${category_slug}"`);
        }
        return {
            ...productData,
            category_id: categoryId || null,
            artist_id: artists[artist_index].id,
            is_active: true
        };
    });
    
    const { data, error } = await supabaseAdmin
        .from('products')
        .insert(productsToInsert)
        .select();
    
    if (error) {
        console.error('Error seeding products:', error);
        throw error;
    }
    
    console.log(`✅ Seeded ${data.length} products`);
    return data;
}

async function runSeed() {
    console.log('🚀 Starting database seed...\n');
    
    try {
        // Seed categories first
        const categories = await seedCategories();
        
        // Seed artists
        const artists = await seedArtists();
        
        // Seed products
        await seedProducts(categories, artists);
        
        console.log('\n✨ Database seeding completed successfully!');
        console.log('\n📝 Note: All dummy data has is_dummy_data: true for easy cleanup');
        console.log('   To remove dummy data, run: node backend/scripts/cleanup-dummy-data.js\n');
        
    } catch (error) {
        console.error('\n❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seed
runSeed();
