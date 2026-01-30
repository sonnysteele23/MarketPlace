/**
 * Artist Earnings Page JavaScript
 * Displays earnings, revenue analytics, and payout information
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
        window.location.href = '../frontend/login.html?redirect=artist-cms/earnings.html';
        return null;
    }
    
    const artistNameEl = document.getElementById('artist-name');
    if (artistNameEl && user.business_name) {
        artistNameEl.textContent = user.business_name;
    }
    
    return { token, user };
}

// ===================================
// Load Earnings Data
// ===================================
async function loadEarnings() {
    const auth = checkAuth();
    if (!auth) return;
    
    try {
        // Load stats from API
        const statsResponse = await fetch(`${API_BASE_URL}/artists/me/stats`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!statsResponse.ok) {
            throw new Error('Failed to load stats');
        }
        
        const stats = await statsResponse.json();
        console.log('Earnings stats:', stats);
        
        // Update earnings display
        updateEarningsDisplay(stats);
        
        // Load orders for transaction history
        await loadTransactionHistory(auth.token);
        
    } catch (error) {
        console.error('Error loading earnings:', error);
        showNotification('Failed to load earnings data', 'error');
    }
}

// ===================================
// Update Earnings Display
// ===================================
function updateEarningsDisplay(stats) {
    // Total revenue
    const totalRevenue = parseFloat(stats.totalRevenue || 0);
    const totalRevenueEl = document.getElementById('total-revenue');
    if (totalRevenueEl) {
        totalRevenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
    }
    
    // Total sales
    const totalSalesEl = document.getElementById('total-sales');
    if (totalSalesEl) {
        totalSalesEl.textContent = stats.totalSales || 0;
    }
    
    // Pending payout (for simplicity, show 0 as we don't have actual payout tracking)
    const pendingPayoutEl = document.getElementById('pending-payout');
    if (pendingPayoutEl) {
        pendingPayoutEl.textContent = '$0.00';
    }
    
    // Available balance
    const availableBalanceEl = document.getElementById('available-balance');
    if (availableBalanceEl) {
        availableBalanceEl.textContent = `$${totalRevenue.toFixed(2)}`;
    }
    
    // Impact donation (5% of revenue)
    const impactDonationEl = document.getElementById('impact-donation');
    if (impactDonationEl) {
        const donation = totalRevenue * 0.05;
        impactDonationEl.textContent = `$${donation.toFixed(2)}`;
    }
}

// ===================================
// Load Transaction History
// ===================================
async function loadTransactionHistory(token) {
    try {
        const response = await fetch(`${API_BASE_URL}/orders/artist/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load orders');
        }
        
        const orders = await response.json();
        displayTransactionHistory(orders);
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        const container = document.getElementById('transactions-list');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <i data-lucide="receipt"></i>
                    <h3>No transactions yet</h3>
                    <p>Your sales history will appear here.</p>
                </div>
            `;
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
}

// ===================================
// Display Transaction History
// ===================================
function displayTransactionHistory(orders) {
    const container = document.getElementById('transactions-list');
    if (!container) return;
    
    if (!orders || orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i data-lucide="receipt"></i>
                <h3>No transactions yet</h3>
                <p>Your sales history will appear here.</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    // Convert orders to transactions
    const transactions = orders.map(order => {
        const earnings = order.items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
        return {
            id: order.id,
            date: order.created_at,
            type: 'sale',
            description: `Order #${order.id.slice(0, 8).toUpperCase()}`,
            items: order.items.length,
            amount: earnings,
            status: order.status
        };
    });
    
    container.innerHTML = `
        <table class="transactions-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Amount</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(tx => `
                    <tr>
                        <td>${formatDate(tx.date)}</td>
                        <td>${escapeHtml(tx.description)}</td>
                        <td>${tx.items}</td>
                        <td>
                            <span class="status-badge status-${tx.status}">
                                ${capitalizeFirst(tx.status)}
                            </span>
                        </td>
                        <td class="amount">+$${tx.amount.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
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
    .empty-state {
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
    .transactions-table {
        width: 100%;
        border-collapse: collapse;
    }
    .transactions-table th,
    .transactions-table td {
        padding: 12px 16px;
        text-align: left;
        border-bottom: 1px solid #E5E7EB;
    }
    .transactions-table th {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6B7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        background: #F9FAFB;
    }
    .transactions-table .amount {
        font-weight: 600;
        color: #059669;
    }
    .status-badge {
        padding: 4px 10px;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 600;
    }
    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-processing { background: #DBEAFE; color: #1E40AF; }
    .status-shipped { background: #E0E7FF; color: #3730A3; }
    .status-delivered { background: #D1FAE5; color: #065F46; }
    .status-cancelled { background: #FEE2E2; color: #991B1B; }
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
    loadEarnings();
    initLogout();
    
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});
