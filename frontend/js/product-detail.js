/**
 * Product Detail Page JavaScript
 * Fetches and displays individual product details
 */

(function() {
    'use strict';
    
    // API Configuration
    const API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://marketplace-production-57b7.up.railway.app/api';

    // Store current product data
    let currentProduct = null;

    // Get product ID from URL
    function getProductId() {
        const params = new URLSearchParams(window.location.search);
        return params.get('id');
    }

    // ===================================
    // Fetch Product
    // ===================================
    async function fetchProduct() {
        const productId = getProductId();
        
        if (!productId) {
            showError();
            return;
        }
        
        try {
            console.log('Fetching product:', productId);
            const response = await fetch(API_URL + '/products/' + productId);
            
            if (!response.ok) {
                throw new Error('Product not found');
            }
            
            const product = await response.json();
            console.log('Product data:', product);
            
            currentProduct = product; // Store for later use
            displayProduct(product);
            fetchRelatedProducts(product.category_id);
            
        } catch (error) {
            console.error('Error fetching product:', error);
            showError();
        }
    }

    // ===================================
    // Display Product
    // ===================================
    function displayProduct(product) {
        // Hide loading, show content
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('product-content').style.display = 'block';
        
        // Update page title
        document.title = product.name + ' | WA Artisan Marketplace';
        
        // Update breadcrumb
        document.getElementById('breadcrumb-product').textContent = product.name;
        
        // Main image
        var mainImage = document.getElementById('main-product-image');
        mainImage.src = product.image_url || product.thumbnail_url || 'https://via.placeholder.com/600x600?text=No+Image';
        mainImage.alt = product.name;
        
        // Image gallery (show all uploaded images)
        var images = product.images || [];
        if (!Array.isArray(images) && product.image_url) {
            images = [product.image_url];
        } else if (Array.isArray(images) && images.length === 0 && product.image_url) {
            images = [product.image_url];
        }
        
        var thumbnailGallery = document.getElementById('thumbnail-gallery');
        if (thumbnailGallery && images.length > 1) {
            thumbnailGallery.innerHTML = images.map(function(imgUrl, index) {
                return '<div class="thumbnail" onclick="switchMainImage(\'' + imgUrl + '\')">' +
                    '<img src="' + imgUrl + '" alt="' + product.name + ' - Image ' + (index + 1) + '">' +
                    '</div>';
            }).join('');
        } else if (thumbnailGallery) {
            thumbnailGallery.style.display = 'none';
        }
        
        // Create global function to switch images
        window.switchMainImage = function(imageUrl) {
            var mainImg = document.getElementById('main-product-image');
            if (mainImg) {
                mainImg.src = imageUrl;
                
                // Update active thumbnail
                var thumbnails = document.querySelectorAll('.thumbnail');
                thumbnails.forEach(function(thumb) {
                    thumb.classList.remove('active');
                    if (thumb.querySelector('img').src === imageUrl) {
                        thumb.classList.add('active');
                    }
                });
            }
        };
        
        // Featured badge
        if (product.is_featured) {
            document.getElementById('featured-badge').style.display = 'block';
        }
        
        // Category
        var categoryEl = document.getElementById('product-category');
        if (product.category) {
            categoryEl.querySelector('span').textContent = product.category.name;
            categoryEl.href = 'products.html?category=' + product.category_id;
        }
        
        // Title
        document.getElementById('product-title').textContent = product.name;
        
        // Artist info
        if (product.artist) {
            var avatarImg = document.getElementById('artist-avatar');
            if (product.artist.profile_image_url) {
                avatarImg.src = product.artist.profile_image_url;
                avatarImg.alt = product.artist.business_name;
            } else {
                avatarImg.parentElement.innerHTML = '<div style="width:100%;height:100%;background:var(--primary-light);display:flex;align-items:center;justify-content:center;color:var(--primary);font-weight:600;font-size:20px;">' + 
                    product.artist.business_name.charAt(0) + '</div>';
            }
            
            document.getElementById('artist-name').textContent = product.artist.business_name;
            
            if (product.artist.location) {
                document.getElementById('artist-location').querySelector('span').textContent = product.artist.location;
            }
            
            // Artist profile tab
            var profileImg = document.getElementById('artist-profile-image');
            if (product.artist.profile_image_url) {
                profileImg.src = product.artist.profile_image_url;
            } else {
                profileImg.style.display = 'none';
            }
            document.getElementById('artist-profile-name').textContent = product.artist.business_name;
            document.getElementById('artist-profile-location').querySelector('span').textContent = product.artist.location || 'Washington State';
            document.getElementById('artist-bio').textContent = product.artist.bio || 'This talented artisan creates unique handmade items in Washington State.';
            document.getElementById('view-artist-shop').href = 'products.html?artist=' + product.artist.id;
        }
        
        // Price
        document.getElementById('product-price').textContent = '$' + parseFloat(product.price).toFixed(2);
        
        // Stock status
        var stockStatus = document.getElementById('stock-status');
        var stockQuantity = product.stock_quantity || 0;
        
        if (stockQuantity === 0) {
            stockStatus.className = 'stock-status out-of-stock';
            stockStatus.innerHTML = '<i data-lucide="x-circle"></i><span>Out of Stock</span>';
            document.getElementById('add-to-cart-btn').disabled = true;
            document.getElementById('add-to-cart-btn').textContent = 'Out of Stock';
        } else if (stockQuantity <= 5) {
            stockStatus.className = 'stock-status low-stock';
            stockStatus.innerHTML = '<i data-lucide="alert-circle"></i><span>Only ' + stockQuantity + ' left!</span>';
        } else {
            stockStatus.className = 'stock-status in-stock';
            stockStatus.innerHTML = '<i data-lucide="check-circle"></i><span>In Stock</span>';
        }
        
        // Set max quantity
        document.getElementById('quantity').max = stockQuantity;
        
        // Description
        document.getElementById('product-description').innerHTML = '<p>' + (product.description || 'No description available.').replace(/\n/g, '</p><p>') + '</p>';
        
        // Product details
        if (product.materials) {
            document.querySelector('#detail-materials .detail-value').textContent = product.materials;
        }
        if (product.dimensions) {
            document.querySelector('#detail-dimensions .detail-value').textContent = product.dimensions;
        }
        if (product.weight) {
            document.querySelector('#detail-weight .detail-value').textContent = product.weight + ' lbs';
        }
        if (product.category) {
            document.querySelector('#detail-category .detail-value').textContent = product.category.name;
        }
        
        // Reinitialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // ===================================
    // Show Error
    // ===================================
    function showError() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('error-state').style.display = 'block';
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // ===================================
    // Fetch Related Products
    // ===================================
    async function fetchRelatedProducts(categoryId) {
        if (!categoryId) return;
        
        try {
            const response = await fetch(API_URL + '/products?category_id=' + categoryId + '&limit=4');
            
            if (!response.ok) return;
            
            const data = await response.json();
            var products = data.products || data;
            
            // Filter out current product
            var currentId = getProductId();
            products = products.filter(function(p) { return p.id !== currentId; }).slice(0, 4);
            
            if (products.length > 0) {
                displayRelatedProducts(products);
            }
            
        } catch (error) {
            console.error('Error fetching related products:', error);
        }
    }

    // ===================================
    // Display Related Products
    // ===================================
    function displayRelatedProducts(products) {
        var container = document.getElementById('related-products');
        
        container.innerHTML = products.map(function(product) {
            var imageUrl = product.image_url || product.thumbnail_url || 'https://via.placeholder.com/400x400?text=No+Image';
            var artistName = product.artist ? product.artist.business_name : 'Local Artist';
            var price = parseFloat(product.price).toFixed(2);
            
            return '<article class="product-card">' +
                '<a href="product-detail.html?id=' + product.id + '" class="product-link">' +
                '<div class="product-image">' +
                '<img src="' + imageUrl + '" alt="' + escapeHtml(product.name) + '" loading="lazy">' +
                '</div>' +
                '<div class="product-info">' +
                '<h3 class="product-name">' + escapeHtml(product.name) + '</h3>' +
                '<p class="product-artist">' + escapeHtml(artistName) + '</p>' +
                '<span class="product-price">$' + price + '</span>' +
                '</div>' +
                '</a>' +
                '</article>';
        }).join('');
    }

    // ===================================
    // Helper Functions
    // ===================================
    function escapeHtml(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===================================
    // Event Listeners
    // ===================================
    function initEventListeners() {
        // Quantity buttons
        var qtyInput = document.getElementById('quantity');
        
        document.getElementById('qty-decrease').addEventListener('click', function() {
            var val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
        
        document.getElementById('qty-increase').addEventListener('click', function() {
            var val = parseInt(qtyInput.value) || 1;
            var max = parseInt(qtyInput.max) || 99;
            if (val < max) qtyInput.value = val + 1;
        });
        
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var tabId = btn.dataset.tab;
                
                // Update buttons
                document.querySelectorAll('.tab-btn').forEach(function(b) {
                    b.classList.remove('active');
                });
                btn.classList.add('active');
                
                // Update panels
                document.querySelectorAll('.tab-panel').forEach(function(panel) {
                    panel.classList.remove('active');
                });
                document.getElementById('tab-' + tabId).classList.add('active');
            });
        });
        
        // Add to cart
        document.getElementById('add-to-cart-btn').addEventListener('click', function() {
            var quantity = parseInt(document.getElementById('quantity').value) || 1;
            
            if (!currentProduct) {
                showNotification('Error: Product data not loaded', 'error');
                return;
            }
            
            // Use CartManager if available
            if (window.CartManager) {
                window.CartManager.addItem(currentProduct, quantity);
            } else {
                console.log('Add to cart:', currentProduct.id, 'Quantity:', quantity);
                showNotification('Added to cart!', 'success');
            }
        });
        
        // Wishlist
        document.getElementById('wishlist-btn').addEventListener('click', function() {
            showNotification('Added to wishlist!', 'success');
        });
        
        // Share
        document.getElementById('share-btn').addEventListener('click', function() {
            if (navigator.share) {
                navigator.share({
                    title: document.title,
                    url: window.location.href
                });
            } else {
                navigator.clipboard.writeText(window.location.href);
                showNotification('Link copied to clipboard!', 'success');
            }
        });
    }

    // ===================================
    // Notification
    // ===================================
    function showNotification(message, type) {
        type = type || 'info';
        
        // Use CartManager notification if available
        if (window.CartManager && window.CartManager.showNotification) {
            window.CartManager.showNotification(message, type);
            return;
        }
        
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.innerHTML = '<i data-lucide="' + (type === 'success' ? 'check-circle' : 'info') + '"></i><span>' + message + '</span>';
        
        notification.style.cssText = 'position:fixed;bottom:20px;right:20px;padding:16px 24px;border-radius:12px;display:flex;align-items:center;gap:12px;z-index:9999;animation:slideUp 0.3s ease;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);background:' + (type === 'success' ? '#ECFDF5' : '#EFF6FF') + ';color:' + (type === 'success' ? '#065F46' : '#1E40AF') + ';';
        
        document.body.appendChild(notification);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(function() {
            notification.remove();
        }, 3000);
    }

    // Add animation
    var style = document.createElement('style');
    style.textContent = '@keyframes slideUp{from{transform:translateY(100%);opacity:0}to{transform:translateY(0);opacity:1}}';
    document.head.appendChild(style);

    // ===================================
    // Initialize
    // ===================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            fetchProduct();
            initEventListeners();
        });
    } else {
        fetchProduct();
        initEventListeners();
    }

})();
