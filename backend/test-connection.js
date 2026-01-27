/**
 * Supabase Connection Test Script
 * Run this to verify your Supabase setup is working correctly
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { supabaseAdmin } = require('./config/supabase');

async function testConnection() {
    console.log('\n🔍 Testing Supabase Connection...\n');
    console.log('━'.repeat(50));
    
    // Test 1: Environment Variables
    console.log('\n📋 Step 1: Checking Environment Variables');
    console.log('   SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
    console.log('   SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? '✅ Set' : '❌ Missing');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
        console.log('\n❌ Missing required environment variables!\n');
        process.exit(1);
    }
    
    try {
        // Test 2: Database Connection
        console.log('\n🔌 Step 2: Testing Database Connection');
        const { data: categories, error: categoriesError } = await supabaseAdmin
            .from('categories')
            .select('*')
            .limit(5);
        
        if (categoriesError) {
            throw new Error(`Categories query failed: ${categoriesError.message}`);
        }
        
        console.log(`   ✅ Connected! Found ${categories.length} categories`);
        
        // Test 3: Show sample data
        console.log('\n📦 Step 3: Sample Categories Data');
        categories.forEach(cat => {
            console.log(`   • ${cat.name} - ${cat.description}`);
        });
        
        // Test 4: Check all tables exist
        console.log('\n🗄️  Step 4: Verifying All Tables Exist');
        
        const tables = ['categories', 'artists', 'products', 'orders', 'order_items'];
        
        for (const table of tables) {
            const { error } = await supabaseAdmin
                .from(table)
                .select('count')
                .limit(0);
            
            if (error) {
                console.log(`   ❌ ${table}: Error - ${error.message}`);
            } else {
                console.log(`   ✅ ${table}: Exists`);
            }
        }
        
        // Test 5: Test Insert & Delete (to verify write permissions)
        console.log('\n✍️  Step 5: Testing Write Permissions');
        
        const testArtist = {
            email: `test_${Date.now()}@example.com`,
            password_hash: 'test_hash',
            business_name: 'Test Artist',
            bio: 'This is a test artist'
        };
        
        const { data: insertedArtist, error: insertError } = await supabaseAdmin
            .from('artists')
            .insert([testArtist])
            .select()
            .single();
        
        if (insertError) {
            throw new Error(`Insert failed: ${insertError.message}`);
        }
        
        console.log(`   ✅ Insert successful! Created artist: ${insertedArtist.business_name}`);
        
        // Clean up test data
        const { error: deleteError } = await supabaseAdmin
            .from('artists')
            .delete()
            .eq('id', insertedArtist.id);
        
        if (deleteError) {
            throw new Error(`Delete failed: ${deleteError.message}`);
        }
        
        console.log(`   ✅ Delete successful! Cleaned up test data`);
        
        // Success!
        console.log('\n' + '━'.repeat(50));
        console.log('\n🎉 SUCCESS! Supabase is fully configured and working!\n');
        console.log('Next steps:');
        console.log('  1. Start your server with: npm run dev');
        console.log('  2. Test your API endpoints');
        console.log('  3. Connect your frontend\n');
        
        process.exit(0);
        
    } catch (error) {
        console.log('\n' + '━'.repeat(50));
        console.log('\n❌ CONNECTION TEST FAILED!\n');
        console.error('Error:', error.message);
        console.log('\nTroubleshooting:');
        console.log('  1. Check your .env file has correct Supabase credentials');
        console.log('  2. Verify you ran the SQL setup script in Supabase');
        console.log('  3. Check your Supabase project is active');
        console.log('  4. Ensure your service key has proper permissions\n');
        
        process.exit(1);
    }
}

// Run the test
testConnection();
