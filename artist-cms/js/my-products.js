/**
 * My Products Page JavaScript
 * Displays and manages artist's products
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://marketplace-production-57b7.up.railway.app/api';

// State
let allProducts = [];
let currentFilter = 'all';
let searchQuery = '';

// ===================================
// Authentication Check
// ===================================
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'artist') {
        window.location.href = '../frontend/login.html?redirect=artist-cms/my-products.html';
        return null;
    }
    
    // Update artist name in header
    const artistNameEl = document.getElementById('artist-name');
    if (artistNameEl && user.business_name) {
        artistNameEl.textContent = user.business_name;
    }
    
    return { token, user };
}

// ===================================
// Load Products
// ===================================
async function loadProducts() {
    const auth = checkAuth();
    if (!auth) return;
    
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading products...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/artists/me/products`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        allProducts = await response.json();
        console.log('Loaded products:', allProducts);
        
        updateProductCounts();
        displayProducts();
        
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="error-state">
                <i data-lucide="alert-circle"></i>
                <p>Failed to load products. <button onclick="loadProducts()">Try again</button></p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ===================================
// Update Product Counts
// ===================================
function updateProductCounts() {
    const total = allProducts.length;
    const active = allProducts.filter(p => p.is_active).length;
    const inactive = allProducts.filter(p => !p.is_active).length;
    
    document.getElementById('count-all')?.textContent && 
        (document.getElementById('count-all').textContent = total);
    document.getElementById('count-active')?.textContent && 
        (document.getElementById('count-active').textContent = active);
    document.getElementById('count-inactive')?.textContent && 
        (document.getElementById('count-inactive').textContent = inactive);
    
    // Update tab counts if they exist
    document.querySelectorAll('.filter-tab').forEach(tab => {
        const filter = tab.dataset.filter;
        const countSpan = tab.querySelector('.count');
        if (countSpan) {
            if (filter === 'all') countSpan.textContent = total;
            else if (filter === 'active') countSpan.textContent = active;
            else if (filter === 'inactive') countSpan.textContent = inactive;
        }
    });
}

// ===================================
// Display Products
// ===================================
function displayProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    // Apply filters
    let filteredProducts = allProducts;
    
    if (currentFilter === 'active') {
        filteredProducts = allProducts.filter(p => p.is_active);
    } else if (currentFilter === 'inactive') {
        filteredProducts = allProducts.filter(p => !p.is_active);
    }
    
    // Apply search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="package"></i>
                <h3>No products found</h3>
                <p>${searchQuery ? 'Try a different search term' : 'Add your first product to get started!'}</p>
                <a href="add-product.html" class="btn btn-primary">
                    <i data-lucide="plus"></i>
                    Add Product
                </a>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => `
        <div class="product-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image_url || product.thumbnail_url || 'https://via.placeholder.com/300'}" 
                     alt="${escapeHtml(product.name)}">
                <div class="product-status ${product.is_active ? 'active' : 'inactive'}">
                    ${product.is_active ? 'Active' : 'Inactive'}
                </div>
            </div>
            <div class="product-info">
                <h3 class="product-name">${escapeHtml(product.name)}</h3>
                <p class="product-category">${product.category?.name || 'Uncategorized'}</p>
                <div class="product-meta">
                    <span class="product-price">$${parseFloat(product.price).toFixed(2)}</span>
                    <span class="product-stock">${product.stock_quantity || 0} in stock</span>
                </div>
            </div>
            <div class="product-actions">
                <button class="btn btn-ghost btn-sm" onclick="editProduct('${product.id}')" title="Edit">
                    <i data-lucide="edit-2"></i>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="toggleProductStatus('${product.id}', ${product.is_active})" 
                        title="${product.is_active ? 'Deactivate' : 'Activate'}">
                    <i data-lucide="${product.is_active ? 'eye-off' : 'eye'}"></i>
                </button>
                <button class="btn btn-ghost btn-sm text-error" onclick="confirmDelete('${product.id}')" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===================================
// Product Actions
// ===================================
function editProduct(id) {
    // TODO: Navigate to edit page or open edit modal
    window.location.href = `edit-product.html?id=${id}`;
}

async function toggleProductStatus(id, currentStatus) {
    const auth = checkAuth();
    if (!auth) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ is_active: !currentStatus })
        });
        
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        
        // Update local state
        const product = allProducts.find(p => p.id === id);
        if (product) {
            product.is_active = !currentStatus;
        }
        
        updateProductCounts();
        displayProducts();
        
        showNotification(`Product ${currentStatus ? 'deactivated' : 'activated'}`, 'success');
        
    } catch (error) {
        console.error('Error toggling product status:', error);
        showNotification('Failed to update product', 'error');
    }
}

function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        deleteProduct(id);
    }
}

async function deleteProduct(id) {
    const auth = checkAuth();
    if (!auth) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        // Remove from local state
        allProducts = allProducts.filter(p => p.id !== id);
        
        updateProductCounts();
        displayProducts();
        
        showNotification('Product deleted', 'success');
        
    } catch (error) {
        console.error('Error deleting product:', error);
        showNotification('Failed to delete product', 'error');
    }
}

// ===================================
// Filter & Search
// ===================================
function initFilters() {
    // Filter tabs
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            displayProducts();
        });
    });
    
    // Search input
    const searchInput = document.getElementById('search-products');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            displayProducts();
        });
    }
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

function showNotification(message, type = 'info') {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info';
    
    notification.innerHTML = `
        <i data-lucide="${iconName}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        ${type === 'success' ? 'background: #ECFDF5; color: #065F46;' : ''}
        ${type === 'error' ? 'background: #FEF2F2; color: #B91C1C;' : ''}
        ${type === 'info' ? 'background: #EFF6FF; color: #1E40AF;' : ''}
    `;
    
    document.body.appendChild(notification);
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .loading, .error-state, .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #6B7280;
    }
    .empty-state i, .error-state i {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #9CA3AF;
    }
    .empty-state h3 {
        margin-bottom: 8px;
        color: #374151;
    }
    .text-error { color: #EF4444; }
`;
document.head.appendChild(style);

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
    loadProducts();
    initFilters();
    initLogout();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
