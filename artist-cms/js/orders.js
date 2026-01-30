/**
 * Artist Orders Page JavaScript
 * Displays and manages orders containing the artist's products
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://marketplace-production-57b7.up.railway.app/api';

// State
let allOrders = [];
let currentFilter = 'all';

// ===================================
// Authentication Check
// ===================================
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userType = localStorage.getItem('userType');
    
    if (!token || userType !== 'artist') {
        window.location.href = '../frontend/login.html?redirect=artist-cms/orders.html';
        return null;
    }
    
    const artistNameEl = document.getElementById('artist-name');
    if (artistNameEl && user.business_name) {
        artistNameEl.textContent = user.business_name;
    }
    
    return { token, user };
}

// ===================================
// Load Orders
// ===================================
async function loadOrders() {
    const auth = checkAuth();
    if (!auth) return;
    
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    container.innerHTML = '<div class="loading">Loading orders...</div>';
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/artist/me`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load orders');
        }
        
        allOrders = await response.json();
        console.log('Loaded orders:', allOrders);
        
        updateOrderCounts();
        displayOrders();
        
    } catch (error) {
        console.error('Error loading orders:', error);
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="shopping-bag"></i>
                <h3>No orders yet</h3>
                <p>When customers purchase your products, orders will appear here.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// ===================================
// Update Order Counts
// ===================================
function updateOrderCounts() {
    const counts = {
        all: allOrders.length,
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        shipped: allOrders.filter(o => o.status === 'shipped').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length
    };
    
    // Update tab counts
    document.querySelectorAll('.filter-tab').forEach(tab => {
        const filter = tab.dataset.filter;
        const countSpan = tab.querySelector('.count');
        if (countSpan && counts[filter] !== undefined) {
            countSpan.textContent = counts[filter];
        }
    });
}

// ===================================
// Display Orders
// ===================================
function displayOrders() {
    const container = document.getElementById('orders-list');
    if (!container) return;
    
    // Apply filter
    let filteredOrders = allOrders;
    if (currentFilter !== 'all') {
        filteredOrders = allOrders.filter(o => o.status === currentFilter);
    }
    
    if (filteredOrders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="shopping-bag"></i>
                <h3>${currentFilter === 'all' ? 'No orders yet' : `No ${currentFilter} orders`}</h3>
                <p>Orders will appear here when customers purchase your products.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    container.innerHTML = filteredOrders.map(order => `
        <div class="order-card" data-id="${order.id}">
            <div class="order-header">
                <div class="order-info">
                    <span class="order-number">#${order.id.slice(0, 8).toUpperCase()}</span>
                    <span class="order-date">${formatDate(order.created_at)}</span>
                </div>
                <div class="order-status status-${order.status}">
                    ${capitalizeFirst(order.status)}
                </div>
            </div>
            
            <div class="order-customer">
                <i data-lucide="user"></i>
                <span>${escapeHtml(order.customer_name)}</span>
                <span class="customer-email">${escapeHtml(order.customer_email)}</span>
            </div>
            
            <div class="order-items">
                ${order.items.map(item => `
                    <div class="order-item">
                        <img src="${item.product?.image_url || 'https://via.placeholder.com/50'}" 
                             alt="${escapeHtml(item.product_name)}">
                        <div class="item-details">
                            <span class="item-name">${escapeHtml(item.product_name)}</span>
                            <span class="item-qty">Qty: ${item.quantity}</span>
                        </div>
                        <span class="item-price">$${parseFloat(item.subtotal).toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="order-footer">
                <div class="order-total">
                    <span>Your earnings:</span>
                    <strong>$${calculateArtistEarnings(order.items).toFixed(2)}</strong>
                </div>
                <div class="order-actions">
                    ${order.status === 'processing' ? `
                        <button class="btn btn-primary btn-sm" onclick="openShippingModal('${order.id}')">
                            <i data-lucide="truck"></i>
                            Add Tracking
                        </button>
                    ` : ''}
                    <button class="btn btn-ghost btn-sm" onclick="viewOrderDetails('${order.id}')">
                        <i data-lucide="eye"></i>
                        Details
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// ===================================
// Order Actions
// ===================================
function viewOrderDetails(orderId) {
    const order = allOrders.find(o => o.id === orderId);
    if (!order) return;
    
    // Create modal with order details
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>Order #${order.id.slice(0, 8).toUpperCase()}</h2>
                <button class="close-btn" onclick="closeModal(this)">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <h3>Customer Information</h3>
                    <p><strong>Name:</strong> ${escapeHtml(order.customer_name)}</p>
                    <p><strong>Email:</strong> ${escapeHtml(order.customer_email)}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Shipping Address</h3>
                    <p>${formatAddress(order.shipping_address)}</p>
                </div>
                
                <div class="detail-section">
                    <h3>Items</h3>
                    ${order.items.map(item => `
                        <div class="detail-item">
                            <span>${escapeHtml(item.product_name)} x ${item.quantity}</span>
                            <span>$${parseFloat(item.subtotal).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <div class="detail-section">
                    <h3>Order Summary</h3>
                    <div class="detail-item">
                        <span>Subtotal</span>
                        <span>$${parseFloat(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Shipping</span>
                        <span>$${parseFloat(order.shipping_amount).toFixed(2)}</span>
                    </div>
                    <div class="detail-item">
                        <span>Tax</span>
                        <span>$${parseFloat(order.tax_amount).toFixed(2)}</span>
                    </div>
                    <div class="detail-item total">
                        <span>Total</span>
                        <span>$${parseFloat(order.total_amount).toFixed(2)}</span>
                    </div>
                </div>
                
                ${order.tracking_number ? `
                    <div class="detail-section">
                        <h3>Tracking</h3>
                        <p>${escapeHtml(order.tracking_number)}</p>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function openShippingModal(orderId) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h2>Add Tracking Information</h2>
                <button class="close-btn" onclick="closeModal(this)">
                    <i data-lucide="x"></i>
                </button>
            </div>
            <div class="modal-body">
                <form onsubmit="submitTracking(event, '${orderId}')">
                    <div class="form-group">
                        <label for="tracking-number">Tracking Number</label>
                        <input type="text" id="tracking-number" class="form-input" 
                               placeholder="Enter tracking number" required>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="btn btn-ghost" onclick="closeModal(this)">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i data-lucide="truck"></i>
                            Mark as Shipped
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function submitTracking(event, orderId) {
    event.preventDefault();
    
    const auth = checkAuth();
    if (!auth) return;
    
    const trackingNumber = document.getElementById('tracking-number').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/orders/${orderId}/add-tracking`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify({ tracking_number: trackingNumber })
        });
        
        if (!response.ok) {
            throw new Error('Failed to add tracking');
        }
        
        closeModal(document.querySelector('.modal-overlay'));
        showNotification('Tracking information added! Order marked as shipped.', 'success');
        loadOrders(); // Refresh orders
        
    } catch (error) {
        console.error('Error adding tracking:', error);
        showNotification('Failed to add tracking information', 'error');
    }
}

function closeModal(element) {
    const modal = element.closest('.modal-overlay');
    if (modal) modal.remove();
}

// ===================================
// Filter Functions
// ===================================
function initFilters() {
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.filter-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            displayOrders();
        });
    });
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

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatAddress(address) {
    if (!address) return 'No address provided';
    if (typeof address === 'string') return escapeHtml(address);
    
    // Handle JSONB address object
    const parts = [
        address.street,
        address.city,
        address.state,
        address.zip,
        address.country
    ].filter(Boolean);
    
    return escapeHtml(parts.join(', '));
}

function calculateArtistEarnings(items) {
    // Artist gets 100% of item subtotals (marketplace fee is on top)
    return items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
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

// Add styles
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
    .loading, .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #6B7280;
    }
    .empty-state i {
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
        color: #9CA3AF;
    }
    .empty-state h3 {
        margin-bottom: 8px;
        color: #374151;
    }
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
    }
    .modal {
        background: white;
        border-radius: 16px;
        max-width: 500px;
        width: 100%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    }
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        border-bottom: 1px solid #E5E7EB;
    }
    .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
    }
    .close-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.2s;
    }
    .close-btn:hover { background: #F3F4F6; }
    .modal-body {
        padding: 24px;
    }
    .detail-section {
        margin-bottom: 24px;
    }
    .detail-section:last-child { margin-bottom: 0; }
    .detail-section h3 {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6B7280;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 8px 0;
        border-bottom: 1px solid #F3F4F6;
    }
    .detail-item.total {
        font-weight: 600;
        border-bottom: none;
        padding-top: 12px;
    }
    .form-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
    }
    .order-card {
        background: white;
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }
    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }
    .order-number {
        font-weight: 600;
        color: #111827;
    }
    .order-date {
        color: #6B7280;
        font-size: 0.875rem;
        margin-left: 12px;
    }
    .order-status {
        padding: 4px 12px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
    }
    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-processing { background: #DBEAFE; color: #1E40AF; }
    .status-shipped { background: #E0E7FF; color: #3730A3; }
    .status-delivered { background: #D1FAE5; color: #065F46; }
    .status-cancelled { background: #FEE2E2; color: #991B1B; }
    .order-customer {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px 0;
        border-bottom: 1px solid #F3F4F6;
        font-size: 0.875rem;
    }
    .order-customer i { width: 16px; height: 16px; color: #6B7280; }
    .customer-email { color: #6B7280; }
    .order-items {
        padding: 12px 0;
    }
    .order-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
    }
    .order-item img {
        width: 50px;
        height: 50px;
        border-radius: 8px;
        object-fit: cover;
    }
    .item-details {
        flex: 1;
    }
    .item-name {
        display: block;
        font-weight: 500;
    }
    .item-qty {
        font-size: 0.875rem;
        color: #6B7280;
    }
    .item-price {
        font-weight: 600;
    }
    .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 12px;
        border-top: 1px solid #F3F4F6;
    }
    .order-total span {
        color: #6B7280;
        font-size: 0.875rem;
    }
    .order-total strong {
        display: block;
        font-size: 1.125rem;
        color: #111827;
    }
    .order-actions {
        display: flex;
        gap: 8px;
    }
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
    loadOrders();
    initFilters();
    initLogout();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
