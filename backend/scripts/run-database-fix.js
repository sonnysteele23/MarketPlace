#!/usr/bin/env node

/**
 * Database Fix Script
 * Applies all schema fixes to Supabase database
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Create Supabase admin client
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

console.log(`
╔════════════════════════════════════════════╗
║     Amy's Haven - Database Fix Script     ║
╚════════════════════════════════════════════╝
`);

// Read the SQL fix script
const sqlScript = fs.readFileSync(
    path.join(__dirname, 'fix-database-schema.sql'),
    'utf8'
);

console.log('📊 Database fix SQL script loaded');
console.log('   File: backend/scripts/fix-database-schema.sql');
console.log('');
console.log('⚠️  IMPORTANT:');
console.log('   This script needs to be run in the Supabase SQL Editor');
console.log('   because it contains advanced SQL (ALTER TABLE, CREATE TRIGGER, etc.)');
console.log('');
console.log('🔗 Open this URL:');
console.log('   https://supabase.com/dashboard/project/hgzshxoshmsvwrrdgriv/sql/new');
console.log('');
console.log('📋 Then copy and paste this SQL:');
console.log('');
console.log('════════════════════════════════════════════════════════════════');
console.log(sqlScript);
console.log('════════════════════════════════════════════════════════════════');
console.log('');
console.log('✅ Click "Run" in the Supabase SQL Editor');
console.log('');
console.log('After running the SQL, test your connection:');
console.log('   npm run dev');
console.log('');
