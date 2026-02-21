/**
 * Database Checker - View all products and artists
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('\n🔍 Checking Amy\'s Haven Database...\n');
  
  try {
    // Get all products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (productsError) {
      console.error('Error fetching products:', productsError);
    } else {
      console.log('═══════════════════════════════════════');
      console.log('           ALL PRODUCTS');
      console.log('═══════════════════════════════════════\n');
      
      if (products && products.length > 0) {
        products.forEach((product, index) => {
          console.log(`${index + 1}. "${product.name}"`);
          console.log(`   ID: ${product.id}`);
          console.log(`   Artist ID: ${product.artist_id}`);
          console.log(`   Category: ${product.category}`);
          console.log(`   Price: $${product.price}`);
          console.log(`   Status: ${product.status}`);
          console.log(`   Created: ${new Date(product.created_at).toLocaleString()}`);
          if (product.description) {
            console.log(`   Description: ${product.description.substring(0, 60)}...`);
          }
          console.log('   ---');
        });
        console.log(`\n✅ Total products: ${products.length}\n`);
      } else {
        console.log('❌ No products found in database.\n');
      }
    }
    
    // Get all artists
    const { data: artists, error: artistsError } = await supabase
      .from('artists')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (artistsError) {
      console.error('Error fetching artists:', artistsError);
    } else {
      console.log('═══════════════════════════════════════');
      console.log('            ALL ARTISTS');
      console.log('═══════════════════════════════════════\n');
      
      if (artists && artists.length > 0) {
        artists.forEach((artist, index) => {
          console.log(`${index + 1}. "${artist.business_name || artist.name || 'Unnamed'}"`);
          console.log(`   ID: ${artist.id}`);
          console.log(`   Email: ${artist.email}`);
          console.log(`   Status: ${artist.status || 'N/A'}`);
          console.log(`   Created: ${new Date(artist.created_at).toLocaleString()}`);
          console.log('   ---');
        });
        console.log(`\n✅ Total artists: ${artists.length}\n`);
      } else {
        console.log('❌ No artists found in database.\n');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
