/**
 * Cleanup Dummy Data Script
 * Removes all data marked with is_dummy_data: true
 * 
 * Run with: node backend/scripts/cleanup-dummy-data.js
 */

require('dotenv').config();
const { supabaseAdmin } = require('../config/supabase');
const readline = require('readline');

async function confirmCleanup() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question('\n⚠️  This will DELETE all dummy/sample data. Are you sure? (yes/no): ', (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
}

async function cleanupDummyData() {
    console.log('🧹 Cleaning up dummy data...\n');
    
    try {
        // Delete dummy products first (foreign key constraint)
        const { data: products, error: productsError } = await supabaseAdmin
            .from('products')
            .delete()
            .eq('is_dummy_data', true)
            .select();
        
        if (productsError) throw productsError;
        console.log(`✅ Deleted ${products?.length || 0} dummy products`);
        
        // Delete dummy artists
        const { data: artists, error: artistsError } = await supabaseAdmin
            .from('artists')
            .delete()
            .eq('is_dummy_data', true)
            .select();
        
        if (artistsError) throw artistsError;
        console.log(`✅ Deleted ${artists?.length || 0} dummy artists`);
        
        // Delete dummy categories
        const { data: categories, error: categoriesError } = await supabaseAdmin
            .from('categories')
            .delete()
            .eq('is_dummy_data', true)
            .select();
        
        if (categoriesError) throw categoriesError;
        console.log(`✅ Deleted ${categories?.length || 0} dummy categories`);
        
        console.log('\n✨ Cleanup completed successfully!\n');
        
    } catch (error) {
        console.error('\n❌ Cleanup failed:', error.message);
        process.exit(1);
    }
}

async function run() {
    console.log('╔════════════════════════════════════════╗');
    console.log('║     Dummy Data Cleanup Script          ║');
    console.log('╚════════════════════════════════════════╝');
    
    const confirmed = await confirmCleanup();
    
    if (confirmed) {
        await cleanupDummyData();
    } else {
        console.log('\n❌ Cleanup cancelled.\n');
    }
    
    process.exit(0);
}

run();
