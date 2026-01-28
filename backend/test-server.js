#!/usr/bin/env node

/**
 * Simple Server Diagnostics
 */

console.log('🔍 Running diagnostics...\n');

// Check Node version
console.log('1️⃣ Node Version:', process.version);

// Check if .env exists and has required vars
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
console.log('2️⃣ .env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
    require('dotenv').config({ path: envPath });
    console.log('   ✅ SUPABASE_URL:', process.env.SUPABASE_URL ? 'SET' : 'MISSING');
    console.log('   ✅ SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_KEY ? 'SET' : 'MISSING');
    console.log('   ✅ JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'MISSING');
}

// Check if index.html exists
const indexPath = path.join(__dirname, '../index.html');
console.log('3️⃣ index.html exists:', fs.existsSync(indexPath));

// Check frontend directory
const frontendPath = path.join(__dirname, '../frontend');
console.log('4️⃣ frontend/ directory exists:', fs.existsSync(frontendPath));
if (fs.existsSync(frontendPath)) {
    const files = fs.readdirSync(frontendPath);
    console.log('   Files:', files.join(', '));
}

// Check artist-cms directory
const cmsPath = path.join(__dirname, '../artist-cms');
console.log('5️⃣ artist-cms/ directory exists:', fs.existsSync(cmsPath));
if (fs.existsSync(cmsPath)) {
    const files = fs.readdirSync(cmsPath);
    console.log('   Files:', files.join(', '));
}

// Try to start a simple Express server
console.log('\n6️⃣ Testing Express server...\n');

const express = require('express');
const app = express();

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use('/frontend', express.static(path.join(__dirname, '../frontend')));
app.use('/artist-cms', express.static(path.join(__dirname, '../artist-cms')));

// Test route
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`✅ Test server started successfully on port ${PORT}`);
    console.log(`\n📍 Open these URLs in your browser:\n`);
    console.log(`   Homepage:          http://localhost:${PORT}`);
    console.log(`   Test endpoint:     http://localhost:${PORT}/test`);
    console.log(`   Products page:     http://localhost:${PORT}/frontend/products.html`);
    console.log(`   Artist dashboard:  http://localhost:${PORT}/artist-cms/dashboard.html`);
    console.log(`\n⚡ Press Ctrl+C to stop the server\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Port ${PORT} is already in use!`);
        console.error(`   Run this command to kill the process:\n`);
        console.error(`   npx kill-port ${PORT}\n`);
    } else {
        console.error('❌ Server error:', err);
    }
    process.exit(1);
});
