/**
 * Products Page JavaScript
 * Handles fetching and displaying products from the API
 */

(function() {
    'use strict';
    
    // API Configuration
    const PRODUCTS_API_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://marketplace-production-57b7.up.railway.app/api';

    // State
    let currentPage = 1;
    let totalPages = 1;
    let currentFilters = {
        categories: [],
        minPrice: null,
        maxPrice: null,
        sort: 'featured',
        search: ''
    };

    // ===================================
    // Fetch Products
    // ===================================
    async function fetchProducts(page, append) {
        page = page || 1;
        append = append || false;
        
        const productsGrid = document.getElementById('products-grid');
        const resultsCount = document.getElementById('results-count');
        const loadMoreBtn = document.getElementById('load-more-btn');
        
        if (!productsGrid) {
            console.error('Products grid not found');
            return;
        }
        
        if (!append) {
            productsGrid.innerHTML = '<div class="loading-spinner">Loading products...</div>';
        }
        
        try {
            // Build query string
            const params = new URLSearchParams();
            params.append('page', page);
            params.append('limit', 12);
            
            // Add sort
            if (currentFilters.sort === 'newest') {
                params.append('sort', 'created_at');
                params.append('order', 'desc');
            } else if (currentFilters.sort === 'price-low') {
                params.append('sort', 'price');
                params.append('order', 'asc');
            } else if (currentFilters.sort === 'price-high') {
                params.append('sort', 'price');
                params.append('order', 'desc');
            }
            
            // Add price filters
            if (currentFilters.minPrice) {
                params.append('minPrice', currentFilters.minPrice);
            }
            if (currentFilters.maxPrice) {
                params.append('maxPrice', currentFilters.maxPrice);
            }
            
            // Add search
            if (currentFilters.search) {
                params.append('search', currentFilters.search);
            }
            
            console.log('Fetching from:', PRODUCTS_API_URL + '/products?' + params.toString());
            
            const response = await fetch(PRODUCTS_API_URL + '/products?' + params.toString());
            
            if (!response.ok) {
                throw new Error('Failed to fetch products: ' + response.status);
            }
            
            const data = await response.json();
            console.log('API Response:', data);
            
            const products = data.products || data;
            
            // Update pagination info
            if (data.pagination) {
                currentPage = data.pagination.page;
                totalPages = data.pagination.pages;
            }
            
            // Update results count
            const total = data.pagination ? data.pagination.total : products.length;
            if (resultsCount) {
                resultsCount.textContent = total + ' product' + (total !== 1 ? 's' : '') + ' found';
            }
            
            // Render products
            if (append) {
                productsGrid.innerHTML += renderProducts(products);
            } else {
                productsGrid.innerHTML = renderProducts(products);
            }
            
            // Show/hide load more button
            if (loadMoreBtn) {
                loadMoreBtn.style.display = currentPage < totalPages ? 'block' : 'none';
            }
            
            // Initialize Lucide icons for new elements
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
            
        } catch (error) {
            console.error('Error fetching products:', error);
            productsGrid.innerHTML = 
                '<div class="error-message">' +
                '<p>Unable to load products. Please try again later.</p>' +
                '<p style="color: #999; font-size: 12px;">Error: ' + error.message + '</p>' +
                '<button onclick="location.reload()" class="btn-primary" style="margin-top: 16px;">Retry</button>' +
                '</div>';
        }
    }

    // ===================================
    // Render Products
    // ===================================
    function renderProducts(products) {
        if (!products || products.length === 0) {
            return '<div class="no-products">' +
                '<h3>No products found</h3>' +
                '<p>Try adjusting your filters or search terms</p>' +
                '</div>';
        }
        
        return products.map(function(product) {
            var artistName = product.artist ? product.artist.business_name : 'Local Artist';
            var categoryName = product.category ? product.category.name : 'Handmade';
            var imageUrl = product.image_url || product.thumbnail_url || 'https://via.placeholder.com/400x400?text=No+Image';
            var price = parseFloat(product.price).toFixed(2);
            var featuredBadge = product.is_featured ? '<span class="badge badge-featured">Featured</span>' : '';
            
            return '<article class="product-card" data-product-id="' + product.id + '">' +
                '<a href="product-detail.html?id=' + product.id + '" class="product-link">' +
                '<div class="product-image">' +
                '<img src="' + imageUrl + '" alt="' + escapeHtml(product.name) + '" loading="lazy">' +
                featuredBadge +
                '</div>' +
                '<div class="product-info">' +
                '<h3 class="product-name">' + escapeHtml(product.name) + '</h3>' +
                '<p class="product-artist">' + escapeHtml(artistName) + '</p>' +
                '<p class="product-category">' + escapeHtml(categoryName) + '</p>' +
                '<div class="product-footer">' +
                '<span class="product-price">$' + price + '</span>' +
                '</div>' +
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
    function initProductsPage() {
        console.log('Initializing products page...');
        
        // Sort select
        var sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', function(e) {
                currentFilters.sort = e.target.value;
                currentPage = 1;
                fetchProducts();
            });
        }
        
        // Load more button
        var loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                fetchProducts(currentPage + 1, true);
            });
        }
        
        // Search form
        var searchForm = document.getElementById('search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                var searchInput = document.getElementById('search-input');
                currentFilters.search = searchInput ? searchInput.value : '';
                currentPage = 1;
                fetchProducts();
            });
        }
        
        // Clear filters button
        var clearFiltersBtn = document.getElementById('clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function() {
                currentFilters = {
                    categories: [],
                    minPrice: null,
                    maxPrice: null,
                    sort: 'featured',
                    search: ''
                };
                
                // Reset UI
                var checkboxes = document.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach(function(cb) { cb.checked = false; });
                
                var minPrice = document.getElementById('min-price');
                var maxPrice = document.getElementById('max-price');
                var sortSel = document.getElementById('sort-select');
                var searchInp = document.getElementById('search-input');
                
                if (minPrice) minPrice.value = '';
                if (maxPrice) maxPrice.value = '';
                if (sortSel) sortSel.value = 'featured';
                if (searchInp) searchInp.value = '';
                
                currentPage = 1;
                fetchProducts();
            });
        }
        
        // Price quick filters
        var priceTags = document.querySelectorAll('.price-tag');
        priceTags.forEach(function(btn) {
            btn.addEventListener('click', function() {
                currentFilters.minPrice = btn.dataset.min;
                currentFilters.maxPrice = btn.dataset.max;
                var minPriceInput = document.getElementById('min-price');
                var maxPriceInput = document.getElementById('max-price');
                if (minPriceInput) minPriceInput.value = btn.dataset.min;
                if (maxPriceInput) maxPriceInput.value = btn.dataset.max;
                currentPage = 1;
                fetchProducts();
            });
        });
        
        // Price input changes
        var minPriceInput = document.getElementById('min-price');
        var maxPriceInput = document.getElementById('max-price');
        
        if (minPriceInput) {
            minPriceInput.addEventListener('change', function() {
                currentFilters.minPrice = minPriceInput.value || null;
                currentPage = 1;
                fetchProducts();
            });
        }
        
        if (maxPriceInput) {
            maxPriceInput.addEventListener('change', function() {
                currentFilters.maxPrice = maxPriceInput.value || null;
                currentPage = 1;
                fetchProducts();
            });
        }
        
        // Initial fetch
        fetchProducts();
    }

    // Add CSS for loading/error states
    var style = document.createElement('style');
    style.textContent = 
        '.loading-spinner { text-align: center; padding: 60px 20px; color: #6B7280; grid-column: 1 / -1; }' +
        '.error-message { text-align: center; padding: 60px 20px; color: #6B7280; grid-column: 1 / -1; }' +
        '.no-products { text-align: center; padding: 60px 20px; color: #6B7280; grid-column: 1 / -1; }' +
        '.no-products h3 { font-size: 1.25rem; color: #374151; margin-bottom: 8px; }';
    document.head.appendChild(style);

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProductsPage);
    } else {
        initProductsPage();
    }

})();
