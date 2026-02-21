/**
 * Database Cleanup - Remove dummy/test data
 * 
 * This script will:
 * 1. Show you all data
 * 2. Ask for confirmation
 * 3. Delete dummy products and artists
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function cleanDatabase() {
  console.log('\n🧹 Amy\'s Haven Database Cleanup Tool\n');
  
  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (productsError) throw productsError;
    
    // Get all artists
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (artistsError) throw artistsError;
    
    console.log('═══════════════════════════════════════');
    console.log('        CURRENT DATABASE CONTENTS');
    console.log('═══════════════════════════════════════\n');
    
    // Show products
    if (products && products.length > 0) {
      console.log('📦 PRODUCTS:\n');
      products.forEach((product, index) => {
        console.log(`  ${index + 1}. ${product.name}`);
        console.log(`     Artist ID: ${product.artist_id}`);
        console.log(`     Created: ${new Date(product.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('📦 No products in database.\n');
    }
    
    // Show artists
    if (artists && artists.length > 0) {
      console.log('👤 ARTISTS:\n');
      artists.forEach((artist, index) => {
        console.log(`  ${index + 1}. ${artist.business_name || artist.email}`);
        console.log(`     Email: ${artist.email}`);
        console.log(`     Created: ${new Date(artist.created_at).toLocaleDateString()}`);
        console.log('');
      });
    } else {
      console.log('👤 No artists in database.\n');
    }
    
    console.log('═══════════════════════════════════════\n');
    
    // Ask which to delete
    console.log('⚠️  WARNING: This will permanently delete data!\n');
    console.log('What would you like to delete?');
    console.log('  1 - Delete ALL products');
    console.log('  2 - Delete ALL artists');
    console.log('  3 - Delete BOTH products and artists');
    console.log('  4 - Delete specific items (manual selection)');
    console.log('  5 - Cancel (exit without changes)\n');
    
    const choice = await question('Enter your choice (1-5): ');
    
    switch(choice.trim()) {
      case '1':
        const confirmProducts = await question(`Delete ${products.length} products? (yes/no): `);
        if (confirmProducts.toLowerCase() === 'yes') {
          const { error } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          console.log(`✅ Deleted ${products.length} products.`);
        } else {
          console.log('❌ Cancelled.');
        }
        break;
        
      case '2':
        const confirmArtists = await question(`Delete ${artists.length} artists? (yes/no): `);
        if (confirmArtists.toLowerCase() === 'yes') {
          const { error } = await supabase.from('artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          if (error) throw error;
          console.log(`✅ Deleted ${artists.length} artists.`);
        } else {
          console.log('❌ Cancelled.');
        }
        break;
        
      case '3':
        const confirmBoth = await question(`Delete ${products.length} products AND ${artists.length} artists? (yes/no): `);
        if (confirmBoth.toLowerCase() === 'yes') {
          await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('artists').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          console.log(`✅ Deleted ${products.length} products and ${artists.length} artists.`);
        } else {
          console.log('❌ Cancelled.');
        }
        break;
        
      case '4':
        console.log('\n📋 MANUAL DELETION MODE\n');
        console.log('Enter product IDs to delete (comma-separated), or press Enter to skip:');
        const productIds = await question('Product IDs: ');
        if (productIds.trim()) {
          const ids = productIds.split(',').map(id => id.trim());
          const { error } = await supabase.from('products').delete().in('id', ids);
          if (error) throw error;
          console.log(`✅ Deleted ${ids.length} products.`);
        }
        
        console.log('\nEnter artist IDs to delete (comma-separated), or press Enter to skip:');
        const artistIds = await question('Artist IDs: ');
        if (artistIds.trim()) {
          const ids = artistIds.split(',').map(id => id.trim());
          const { error } = await supabase.from('artists').delete().in('id', ids);
          if (error) throw error;
          console.log(`✅ Deleted ${ids.length} artists.`);
        }
        break;
        
      case '5':
        console.log('❌ Cancelled. No changes made.');
        break;
        
      default:
        console.log('❌ Invalid choice. No changes made.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    rl.close();
  }
}

cleanDatabase();
