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
let filteredProducts = [];
let currentStatus = '';
let currentCategory = '';
let currentSort = 'newest';
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
    
    // Show loading state
    container.innerHTML = `
        <div class="loading-state">
            <div class="loading-spinner"></div>
            <p>Loading your products...</p>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_BASE_URL}/artists/me/products`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to load products');
        }
        
        allProducts = await response.json();
        console.log('Loaded products:', allProducts);
        
        // Populate category filter with unique categories
        populateCategoryFilter();
        
        // Apply filters and display
        applyFiltersAndDisplay();
        
    } catch (error) {
        console.error('Error loading products:', error);
        container.innerHTML = `
            <div class="error-state">
                <div class="empty-icon">
                    <i data-lucide="alert-circle"></i>
                </div>
                <h3>Failed to load products</h3>
                <p>${error.message}</p>
                <button onclick="loadProducts()" class="btn btn-primary">
                    <i data-lucide="refresh-cw"></i>
                    Try Again
                </button>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ===================================
// Populate Category Filter
// ===================================
function populateCategoryFilter() {
    const categoryFilter = document.getElementById('category-filter');
    if (!categoryFilter) return;
    
    // Get unique categories
    const categories = [...new Set(allProducts
        .filter(p => p.category?.name)
        .map(p => p.category.name)
    )];
    
    // Clear and rebuild options
    categoryFilter.innerHTML = '<option value="">All Categories</option>';
    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        categoryFilter.appendChild(option);
    });
}

// ===================================
// Apply Filters and Display
// ===================================
function applyFiltersAndDisplay() {
    // Start with all products
    filteredProducts = [...allProducts];
    
    // Filter by status
    if (currentStatus) {
        if (currentStatus === 'active') {
            filteredProducts = filteredProducts.filter(p => p.is_active);
        } else if (currentStatus === 'draft' || currentStatus === 'inactive') {
            filteredProducts = filteredProducts.filter(p => !p.is_active);
        } else if (currentStatus === 'sold') {
            filteredProducts = filteredProducts.filter(p => p.stock_quantity === 0);
        }
    }
    
    // Filter by category
    if (currentCategory) {
        filteredProducts = filteredProducts.filter(p => p.category?.name === currentCategory);
    }
    
    // Filter by search
    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(query) ||
            (p.description && p.description.toLowerCase().includes(query))
        );
    }
    
    // Sort products
    sortProducts();
    
    // Display products
    displayProducts();
}

// ===================================
// Sort Products
// ===================================
function sortProducts() {
    switch (currentSort) {
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'oldest':
            filteredProducts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
    }
}

// ===================================
// Display Products
// ===================================
function displayProducts() {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i data-lucide="package-open"></i>
                </div>
                <h3>No products found</h3>
                <p>${searchQuery || currentStatus || currentCategory ? 'Try adjusting your filters' : 'Add your first product to get started!'}</p>
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
        <div class="product-manage-card" data-id="${product.id}">
            <div class="product-image">
                <img src="${product.image_url || product.thumbnail_url || 'https://via.placeholder.com/300x180?text=No+Image'}" 
                     alt="${escapeHtml(product.name)}"
                     onerror="this.src='https://via.placeholder.com/300x180?text=No+Image'">
                <span class="product-status ${product.is_active ? 'active' : 'draft'}">
                    ${product.is_active ? 'Active' : 'Draft'}
                </span>
            </div>
            <div class="product-details">
                <h3>${escapeHtml(product.name)}</h3>
                <p class="product-category">
                    <i data-lucide="tag"></i>
                    ${product.category?.name || 'Uncategorized'}
                </p>
                <div class="product-meta">
                    <span class="price">$${parseFloat(product.price).toFixed(2)}</span>
                    <span class="stock">
                        <i data-lucide="box"></i>
                        ${product.stock_quantity || 0} in stock
                    </span>
                </div>
            </div>
            <div class="product-actions">
                <button class="action-btn-icon" onclick="editProduct('${product.id}')" title="Edit">
                    <i data-lucide="edit-2"></i>
                </button>
                <button class="action-btn-icon" onclick="viewProduct('${product.id}')" title="View">
                    <i data-lucide="external-link"></i>
                </button>
                <button class="action-btn-icon" onclick="toggleProductStatus('${product.id}', ${product.is_active})" 
                        title="${product.is_active ? 'Deactivate' : 'Activate'}">
                    <i data-lucide="${product.is_active ? 'eye-off' : 'eye'}"></i>
                </button>
                <button class="action-btn-icon danger" onclick="confirmDelete('${product.id}')" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Update pagination info
    const paginationInfo = document.querySelector('.pagination-info');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${filteredProducts.length} of ${allProducts.length} products`;
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===================================
// Product Actions
// ===================================
function editProduct(id) {
    window.location.href = `edit-product.html?id=${id}`;
}

function viewProduct(id) {
    window.open(`../frontend/product-detail.html?id=${id}`, '_blank');
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
        
        applyFiltersAndDisplay();
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
    
    // Find the product card and add deleting state
    const productCard = document.querySelector(`[data-id="${id}"]`);
    if (productCard) {
        productCard.style.opacity = '0.5';
        productCard.style.pointerEvents = 'none';
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        // Check for both 200 and 204 status codes (both mean success)
        if (!response.ok && response.status !== 204) {
            throw new Error('Failed to delete product');
        }
        
        console.log('Product deleted successfully:', id);
        
        // Remove from local state immediately
        allProducts = allProducts.filter(p => p.id !== id);
        filteredProducts = filteredProducts.filter(p => p.id !== id);
        
        // Update display immediately
        displayProducts();
        
        showNotification('Product deleted successfully!', 'success');
        
    } catch (error) {
        console.error('Error deleting product:', error);
        
        // Restore product card on error
        if (productCard) {
            productCard.style.opacity = '1';
            productCard.style.pointerEvents = 'auto';
        }
        
        showNotification('Failed to delete product: ' + error.message, 'error');
    }
}

// ===================================
// Initialize Filters
// ===================================
function initFilters() {
    // Status filter
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            currentStatus = e.target.value;
            applyFiltersAndDisplay();
        });
    }
    
    // Category filter
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            applyFiltersAndDisplay();
        });
    }
    
    // Sort filter
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentSort = e.target.value;
            applyFiltersAndDisplay();
        });
    }
    
    // Search input
    const searchInput = document.getElementById('product-search');
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchQuery = e.target.value;
                applyFiltersAndDisplay();
            }, 300);
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
// Add Styles
// ===================================
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
    .loading-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #6B7280;
    }
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 3px solid #E5E7EB;
        border-top-color: #8B5CF6;
        border-radius: 50%;
        margin: 0 auto 16px;
        animation: spin 1s linear infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
    .error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 60px 20px;
        color: #6B7280;
    }
    .error-state h3 {
        color: #374151;
        margin-bottom: 8px;
    }
    .error-state p {
        margin-bottom: 16px;
    }
    .error-state .btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
    }
`;
document.head.appendChild(style);

// ===================================
// Initialize Page
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initFilters();
    initLogout();
    loadProducts();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
