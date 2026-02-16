/**
 * Main JavaScript for Washington Artisan Marketplace
 * Handles: Navigation, Cart, Dynamic content loading
 */

// ===================================
// Global State Management
// ===================================

const AppState = {
    cart: JSON.parse(localStorage.getItem('cart')) || [],
    user: JSON.parse(localStorage.getItem('user')) || null,
    apiUrl: '/api' // Update with actual API URL
};

// ===================================
// Cart Management
// ===================================

class Cart {
    static updateCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = AppState.cart.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    static addItem(product) {
        const existingItem = AppState.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            AppState.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                artist: product.artist,
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCount();
        this.showNotification('Added to cart!');
    }

    static removeItem(productId) {
        AppState.cart = AppState.cart.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCount();
    }

    static updateQuantity(productId, quantity) {
        const item = AppState.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            if (quantity === 0) {
                this.removeItem(productId);
            } else {
                this.saveCart();
                this.updateCount();
            }
        }
    }

    static getTotal() {
        return AppState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    static saveCart() {
        localStorage.setItem('cart', JSON.stringify(AppState.cart));
    }

    static showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #28A745;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }
}

// ===================================
// Mobile Menu
// ===================================

function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }
}

// ===================================
// Featured Products Loading
// ===================================

async function loadFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    try {
        // Fetch real products from API
        const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3000/api'
            : 'https://marketplace-production-57b7.up.railway.app/api';
        
        const response = await fetch(`${API_BASE_URL}/products?limit=4`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        const data = await response.json();
        
        // Handle both array response and object with products array
        const products = Array.isArray(data) ? data : (data.products || []);
        
        if (!Array.isArray(products)) {
            console.error('Invalid products data:', data);
            throw new Error('Invalid response format');
        }
        
        if (products.length === 0) {
            container.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6B7280;">
                    <p>No products available yet. Check back soon!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = products.map(product => createProductCard(product)).join('');
        
        // Add event listeners to "Add to Cart" buttons
        container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.target.dataset.productId;
                const product = products.find(p => p.id === productId);
                if (product) {
                    Cart.addItem(product);
                }
            });
        });
        
    } catch (error) {
        console.error('Error loading featured products:', error);
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #6B7280;">
                <p>Unable to load products. Please try again later.</p>
            </div>
        `;
    }
}

function createProductCard(product) {
    const imageUrl = product.thumbnail_url || product.image_url || 'https://via.placeholder.com/300x300?text=No+Image';
    const categoryName = product.category?.name || product.category || 'Uncategorized';
    const artistName = product.artist?.business_name || product.artist_name || 'Unknown Artist';
    
    return `
        <article class="product-card">
            <a href="frontend/product-detail.html?id=${product.id}">
                <img 
                    src="${imageUrl}" 
                    alt="${product.name}" 
                    class="product-image"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/300x300?text=No+Image'"
                >
            </a>
            <div class="product-info">
                <span class="product-category">${categoryName}</span>
                <h3 class="product-title">
                    <a href="frontend/product-detail.html?id=${product.id}">${product.name}</a>
                </h3>
                <p class="product-artist">by ${artistName}</p>
                <div class="product-footer">
                    <span class="product-price">${parseFloat(product.price).toFixed(2)}</span>
                    <button class="add-to-cart-btn" data-product-id="${product.id}">
                        Add to Cart
                    </button>
                </div>
            </div>
        </article>
    `;
}

// ===================================
// Newsletter Form
// ===================================

function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = form.querySelector('input[name="email"]').value;
        const button = form.querySelector('button');
        const originalText = button.textContent;
        
        button.textContent = 'Subscribing...';
        button.disabled = true;
        
        try {
            // Simulate API call
            await fetch(`${AppState.apiUrl}/newsletter/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            button.textContent = '✓ Subscribed!';
            button.style.background = '#28A745';
            form.querySelector('input').value = '';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            button.textContent = 'Error - Try Again';
            button.style.background = '#DC3545';
            
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
                button.disabled = false;
            }, 3000);
        }
    });
}

// ===================================
// Smooth Scroll for Anchor Links
// ===================================

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ===================================
// Lazy Loading Images
// ===================================

function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img.lazy').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// ===================================
// Initialize on DOM Ready
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cart count
    Cart.updateCount();
    
    // Initialize components
    initMobileMenu();
    loadFeaturedProducts();
    initNewsletterForm();
    initSmoothScroll();
    initLazyLoading();
    
    // Add CSS for animations
    addAnimationStyles();
});

// Helper function to add animation styles
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 1rem;
        }
        
        .add-to-cart-btn {
            padding: 0.5rem 1rem;
            background: var(--primary-color);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s ease;
        }
        
        .add-to-cart-btn:hover {
            background: #1e4620;
            transform: translateY(-2px);
        }
        
        .nav-links.active {
            display: flex;
            flex-direction: column;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            padding: 1rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .mobile-menu-btn.active span:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .mobile-menu-btn.active span:nth-child(2) {
            opacity: 0;
        }
        
        .mobile-menu-btn.active span:nth-child(3) {
            transform: rotate(-45deg) translate(5px, -5px);
        }
    `;
    document.head.appendChild(style);
}

// ===================================
// Export for use in other modules
// ===================================

window.Cart = Cart;
window.AppState = AppState;
