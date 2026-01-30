/**
 * Cart Management System
 * Washington Artisan Marketplace
 * Handles all cart operations across the site
 */

(function() {
    'use strict';

    // ===================================
    // Cart State
    // ===================================
    const CartManager = {
        items: [],
        
        // Initialize cart from localStorage
        init: function() {
            this.load();
            this.updateAllCounts();
            this.initCartIcon();
            console.log('Cart initialized with', this.items.length, 'items');
        },
        
        // Load cart from localStorage
        load: function() {
            try {
                const saved = localStorage.getItem('wa_cart');
                this.items = saved ? JSON.parse(saved) : [];
            } catch (e) {
                console.error('Error loading cart:', e);
                this.items = [];
            }
        },
        
        // Save cart to localStorage
        save: function() {
            try {
                localStorage.setItem('wa_cart', JSON.stringify(this.items));
            } catch (e) {
                console.error('Error saving cart:', e);
            }
        },
        
        // Add item to cart
        addItem: function(product, quantity) {
            quantity = quantity || 1;
            
            // Normalize product data
            const item = {
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image_url || product.thumbnail_url || product.image || '',
                artist: product.artist ? (product.artist.business_name || product.artist) : 'Local Artist',
                artist_id: product.artist_id || (product.artist ? product.artist.id : null),
                quantity: quantity
            };
            
            // Check if already in cart
            const existingIndex = this.items.findIndex(i => i.id === item.id);
            
            if (existingIndex >= 0) {
                this.items[existingIndex].quantity += quantity;
            } else {
                this.items.push(item);
            }
            
            this.save();
            this.updateAllCounts();
            this.showNotification(item.name + ' added to cart!');
            
            return true;
        },
        
        // Remove item from cart
        removeItem: function(productId) {
            this.items = this.items.filter(item => item.id !== productId);
            this.save();
            this.updateAllCounts();
            this.renderCartDropdown();
        },
        
        // Update item quantity
        updateQuantity: function(productId, quantity) {
            const item = this.items.find(i => i.id === productId);
            if (item) {
                if (quantity <= 0) {
                    this.removeItem(productId);
                } else {
                    item.quantity = quantity;
                    this.save();
                    this.updateAllCounts();
                    this.renderCartDropdown();
                }
            }
        },
        
        // Get cart totals
        getTotals: function() {
            const subtotal = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            const itemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);
            const donation = subtotal * 0.05; // 5% donation
            const shipping = subtotal > 75 ? 0 : 7.99; // Free shipping over $75
            const total = subtotal + shipping;
            
            return {
                subtotal: subtotal,
                itemCount: itemCount,
                donation: donation,
                shipping: shipping,
                total: total
            };
        },
        
        // Clear cart
        clear: function() {
            this.items = [];
            this.save();
            this.updateAllCounts();
            this.renderCartDropdown();
        },
        
        // Update all cart count badges on page
        updateAllCounts: function() {
            const totals = this.getTotals();
            const countElements = document.querySelectorAll('.cart-count');
            
            countElements.forEach(el => {
                el.textContent = totals.itemCount;
                el.style.display = totals.itemCount > 0 ? 'flex' : 'none';
            });
        },
        
        // Initialize cart icon click handler
        initCartIcon: function() {
            const cartLinks = document.querySelectorAll('.cart-link');
            
            cartLinks.forEach(link => {
                // Prevent default and show dropdown/sidebar
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleCartDropdown();
                });
            });
            
            // Create dropdown container if not exists
            if (!document.getElementById('cart-dropdown')) {
                this.createCartDropdown();
            }
            
            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const dropdown = document.getElementById('cart-dropdown');
                const cartLink = e.target.closest('.cart-link');
                if (dropdown && dropdown.classList.contains('show') && !dropdown.contains(e.target) && !cartLink) {
                    dropdown.classList.remove('show');
                }
            });
        },
        
        // Create cart dropdown element
        createCartDropdown: function() {
            const dropdown = document.createElement('div');
            dropdown.id = 'cart-dropdown';
            dropdown.className = 'cart-dropdown';
            document.body.appendChild(dropdown);
            
            // Add styles
            this.addDropdownStyles();
        },
        
        // Toggle cart dropdown visibility
        toggleCartDropdown: function() {
            const dropdown = document.getElementById('cart-dropdown');
            if (!dropdown) return;
            
            dropdown.classList.toggle('show');
            
            if (dropdown.classList.contains('show')) {
                this.renderCartDropdown();
            }
        },
        
        // Render cart dropdown content
        renderCartDropdown: function() {
            const dropdown = document.getElementById('cart-dropdown');
            if (!dropdown) return;
            
            const totals = this.getTotals();
            
            if (this.items.length === 0) {
                dropdown.innerHTML = `
                    <div class="cart-dropdown-header">
                        <h3>Your Cart</h3>
                        <button class="cart-close-btn" onclick="CartManager.toggleCartDropdown()">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="cart-empty">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
                            <circle cx="9" cy="21" r="1"></circle>
                            <circle cx="20" cy="21" r="1"></circle>
                            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                        </svg>
                        <p>Your cart is empty</p>
                        <a href="${this.getBasePath()}frontend/products.html" class="btn-continue-shopping">Continue Shopping</a>
                    </div>
                `;
                return;
            }
            
            const itemsHtml = this.items.map(item => `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.image || 'https://via.placeholder.com/60x60?text=No+Image'}" alt="${this.escapeHtml(item.name)}" class="cart-item-image">
                    <div class="cart-item-details">
                        <h4 class="cart-item-name">${this.escapeHtml(item.name)}</h4>
                        <p class="cart-item-artist">by ${this.escapeHtml(item.artist)}</p>
                        <div class="cart-item-bottom">
                            <div class="cart-item-quantity">
                                <button class="qty-btn" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity - 1})">−</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" onclick="CartManager.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                            </div>
                            <span class="cart-item-price">$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="cart-item-remove" onclick="CartManager.removeItem('${item.id}')" title="Remove">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            `).join('');
            
            dropdown.innerHTML = `
                <div class="cart-dropdown-header">
                    <h3>Your Cart (${totals.itemCount})</h3>
                    <button class="cart-close-btn" onclick="CartManager.toggleCartDropdown()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="cart-items">
                    ${itemsHtml}
                </div>
                <div class="cart-dropdown-footer">
                    <div class="cart-donation">
                        <span>🌟 5% donation to end homelessness</span>
                        <span>$${totals.donation.toFixed(2)}</span>
                    </div>
                    <div class="cart-subtotal">
                        <span>Subtotal</span>
                        <span>$${totals.subtotal.toFixed(2)}</span>
                    </div>
                    ${totals.shipping > 0 ? `
                        <p class="cart-shipping-note">Add $${(75 - totals.subtotal).toFixed(2)} more for free shipping!</p>
                    ` : `
                        <p class="cart-shipping-note free">✓ You qualify for free shipping!</p>
                    `}
                    <a href="${this.getBasePath()}frontend/cart.html" class="btn-view-cart">View Cart</a>
                    <a href="${this.getBasePath()}frontend/checkout.html" class="btn-checkout">Checkout</a>
                </div>
            `;
        },
        
        // Show notification toast
        showNotification: function(message, type) {
            type = type || 'success';
            
            // Remove existing notification
            const existing = document.querySelector('.cart-notification');
            if (existing) existing.remove();
            
            const notification = document.createElement('div');
            notification.className = 'cart-notification cart-notification-' + type;
            notification.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    ${type === 'success' 
                        ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline>'
                        : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line>'
                    }
                </svg>
                <span>${message}</span>
                <button onclick="this.parentElement.remove()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            `;
            
            document.body.appendChild(notification);
            
            // Auto remove after 3 seconds
            setTimeout(() => {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        },
        
        // Helper: Get base path for links
        getBasePath: function() {
            const path = window.location.pathname;
            if (path.includes('/frontend/') || path.includes('/artist-cms/')) {
                return '../';
            }
            return '';
        },
        
        // Helper: Escape HTML
        escapeHtml: function(text) {
            if (!text) return '';
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },
        
        // Add dropdown styles
        addDropdownStyles: function() {
            if (document.getElementById('cart-dropdown-styles')) return;
            
            const style = document.createElement('style');
            style.id = 'cart-dropdown-styles';
            style.textContent = `
                .cart-dropdown {
                    position: fixed;
                    top: 0;
                    right: -400px;
                    width: 380px;
                    max-width: 100vw;
                    height: 100vh;
                    background: white;
                    box-shadow: -4px 0 20px rgba(0, 0, 0, 0.15);
                    z-index: 10000;
                    display: flex;
                    flex-direction: column;
                    transition: right 0.3s ease;
                }
                
                .cart-dropdown.show {
                    right: 0;
                }
                
                .cart-dropdown-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 20px;
                    border-bottom: 1px solid #E5E7EB;
                }
                
                .cart-dropdown-header h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    color: #111827;
                    margin: 0;
                }
                
                .cart-close-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: #6B7280;
                    transition: color 0.2s;
                }
                
                .cart-close-btn:hover {
                    color: #111827;
                }
                
                .cart-empty {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    padding: 40px;
                    text-align: center;
                }
                
                .cart-empty svg {
                    margin-bottom: 16px;
                }
                
                .cart-empty p {
                    color: #6B7280;
                    margin-bottom: 20px;
                }
                
                .btn-continue-shopping {
                    padding: 10px 20px;
                    background: #8B5CF6;
                    color: white;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: 500;
                    transition: background 0.2s;
                }
                
                .btn-continue-shopping:hover {
                    background: #7C3AED;
                }
                
                .cart-items {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                }
                
                .cart-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px 0;
                    border-bottom: 1px solid #F3F4F6;
                    position: relative;
                }
                
                .cart-item-image {
                    width: 64px;
                    height: 64px;
                    object-fit: cover;
                    border-radius: 8px;
                    flex-shrink: 0;
                }
                
                .cart-item-details {
                    flex: 1;
                    min-width: 0;
                }
                
                .cart-item-name {
                    font-size: 0.9375rem;
                    font-weight: 500;
                    color: #111827;
                    margin: 0 0 4px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                
                .cart-item-artist {
                    font-size: 0.8125rem;
                    color: #6B7280;
                    margin: 0 0 8px 0;
                }
                
                .cart-item-bottom {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .cart-item-quantity {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: #F3F4F6;
                    border-radius: 6px;
                    padding: 2px;
                }
                
                .cart-item-quantity .qty-btn {
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    color: #374151;
                    transition: background 0.2s;
                }
                
                .cart-item-quantity .qty-btn:hover {
                    background: #E5E7EB;
                }
                
                .cart-item-quantity span {
                    min-width: 20px;
                    text-align: center;
                    font-size: 0.875rem;
                    font-weight: 500;
                }
                
                .cart-item-price {
                    font-weight: 600;
                    color: #111827;
                }
                
                .cart-item-remove {
                    position: absolute;
                    top: 12px;
                    right: 0;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 4px;
                    color: #9CA3AF;
                    transition: color 0.2s;
                }
                
                .cart-item-remove:hover {
                    color: #EF4444;
                }
                
                .cart-dropdown-footer {
                    padding: 20px;
                    border-top: 1px solid #E5E7EB;
                    background: #F9FAFB;
                }
                
                .cart-donation {
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8125rem;
                    color: #059669;
                    margin-bottom: 8px;
                }
                
                .cart-subtotal {
                    display: flex;
                    justify-content: space-between;
                    font-size: 1rem;
                    font-weight: 600;
                    color: #111827;
                    margin-bottom: 8px;
                }
                
                .cart-shipping-note {
                    font-size: 0.8125rem;
                    color: #6B7280;
                    margin-bottom: 16px;
                }
                
                .cart-shipping-note.free {
                    color: #059669;
                }
                
                .btn-view-cart,
                .btn-checkout {
                    display: block;
                    width: 100%;
                    padding: 12px;
                    text-align: center;
                    border-radius: 8px;
                    font-weight: 500;
                    text-decoration: none;
                    transition: all 0.2s;
                    margin-bottom: 8px;
                }
                
                .btn-view-cart {
                    background: white;
                    border: 1px solid #E5E7EB;
                    color: #374151;
                }
                
                .btn-view-cart:hover {
                    background: #F3F4F6;
                }
                
                .btn-checkout {
                    background: #8B5CF6;
                    color: white;
                    border: none;
                    margin-bottom: 0;
                }
                
                .btn-checkout:hover {
                    background: #7C3AED;
                }
                
                /* Cart notification */
                .cart-notification {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    background: #ECFDF5;
                    color: #065F46;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    z-index: 10001;
                    animation: slideUp 0.3s ease;
                }
                
                .cart-notification-error {
                    background: #FEF2F2;
                    color: #991B1B;
                }
                
                .cart-notification button {
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    color: inherit;
                    opacity: 0.7;
                }
                
                .cart-notification button:hover {
                    opacity: 1;
                }
                
                .cart-notification.fade-out {
                    animation: slideDown 0.3s ease forwards;
                }
                
                @keyframes slideUp {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                
                @keyframes slideDown {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(100%); opacity: 0; }
                }
                
                /* Cart count badge */
                .cart-count {
                    position: absolute;
                    top: -6px;
                    right: -6px;
                    min-width: 18px;
                    height: 18px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #8B5CF6;
                    color: white;
                    font-size: 11px;
                    font-weight: 600;
                    border-radius: 50%;
                    padding: 0 4px;
                }
                
                .cart-link {
                    position: relative;
                }
                
                /* Mobile responsive */
                @media (max-width: 480px) {
                    .cart-dropdown {
                        width: 100%;
                        right: -100%;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    };

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => CartManager.init());
    } else {
        CartManager.init();
    }

    // Export globally
    window.CartManager = CartManager;

})();
