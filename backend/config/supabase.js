/**
 * Supabase Configuration
 * 
 * This file sets up the Supabase client for server-side operations.
 * The service key gives full admin access to your database.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const { createClient } = require('@supabase/supabase-js');

// Validate environment variables
if (!process.env.SUPABASE_URL) {
    throw new Error('Missing SUPABASE_URL environment variable');
}

if (!process.env.SUPABASE_SERVICE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_KEY environment variable');
}

// Initialize Supabase client with service role key for admin operations
const supabaseAdmin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    }
);

// Test connection on startup
supabaseAdmin
    .from('categories')
    .select('count')
    .then(() => {
        console.log('✅ Connected to Supabase');
    })
    .catch((error) => {
        console.warn('⚠️  Supabase connection test failed:', error.message);
        console.warn('   Make sure you have created your database tables in Supabase');
    });

module.exports = { supabaseAdmin };
