/**
 * Artist Dashboard JavaScript
 * Loads and displays artist statistics and recent activity
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://marketplace-production-57b7.up.railway.app/api';

// ===================================
// Authentication Check
// ===================================
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'artist') {
        window.location.href = '../frontend/login.html?redirect=artist-cms/dashboard.html';
        return null;
    }
    
    // Update artist name in header
    const artistNameEl = document.getElementById('artist-name');
    if (artistNameEl && user.business_name) {
        artistNameEl.textContent = user.business_name;
    }
    
    // Update welcome message
    const welcomeEl = document.querySelector('.welcome-name');
    if (welcomeEl && user.business_name) {
        welcomeEl.textContent = user.business_name;
    }
    
    return { token, user };
}

// ===================================
// Load Dashboard Stats
// ===================================
async function loadStats() {
    const auth = checkAuth();
    if (!auth) return;
    
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_BASE_URL}/artists/me/stats?_=${timestamp}`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load stats');
        }
        
        const stats = await response.json();
        console.log('Dashboard stats:', stats);
        
        // Update stat cards
        updateStatCard('total-products', stats.totalProducts || 0);
        updateStatCard('active-products', stats.activeProducts || 0);
        updateStatCard('total-sales', stats.totalSales || 0);
        updateStatCard('total-revenue', `$${parseFloat(stats.totalRevenue || 0).toFixed(2)}`);
        
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

function updateStatCard(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.textContent = value;
    }
}

// ===================================
// Load Recent Products
// ===================================
async function loadRecentProducts() {
    const auth = checkAuth();
    if (!auth) return;
    
    try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_BASE_URL}/artists/me/products?limit=5&_=${timestamp}`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache'
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const products = await response.json();
        console.log('Recent products:', products);
        
        displayRecentProducts(products.slice(0, 5));
        
    } catch (error) {
        console.error('Error loading recent products:', error);
    }
}

function displayRecentProducts(products) {
    const container = document.getElementById('recent-products');
    if (!container) return;
    
    if (!products || products.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="package"></i>
                <p>No products yet. <a href="add-product.html">Add your first product!</a></p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="product-item">
            <img src="${product.image_url || product.thumbnail_url || 'https://via.placeholder.com/60'}" 
                 alt="${escapeHtml(product.name)}" 
                 class="product-thumb">
            <div class="product-details">
                <h4>${escapeHtml(product.name)}</h4>
                <p class="product-price">$${parseFloat(product.price).toFixed(2)}</p>
            </div>
            <div class="product-status ${product.is_active ? 'active' : 'inactive'}">
                ${product.is_active ? 'Active' : 'Inactive'}
            </div>
        </div>
    `).join('');
}

// ===================================
// Helper Functions
// ===================================
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===================================
// Logout Handler
// ===================================
function initLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
            window.location.href = '../index.html';
        });
    }
}

// ===================================
// Initialize Page
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadStats();
    loadRecentProducts();
    initLogout();
    
    // Initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
