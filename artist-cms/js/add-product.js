/**
 * Add Product Page - BULLETPROOF VERSION
 * Protected from extension conflicts
 */

(function() {
    'use strict';
    
    // API Configuration
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://marketplace-production-57b7.up.railway.app/api';

    // State
    let uploadedImages = [];
    const MAX_IMAGES = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    let productTags = [];

    // Authentication
    function checkAuth() {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userType = localStorage.getItem('userType');
        
        if (!token || userType !== 'artist') {
            window.location.href = '../frontend/login.html?redirect=artist-cms/add-product.html';
            return null;
        }
        
        const artistNameEl = document.getElementById('artist-name');
        if (artistNameEl && user.business_name) {
            artistNameEl.textContent = user.business_name;
        }
        
        return { token, user };
    }

    // Image Upload
    function initImageUpload() {
        const uploadArea = document.getElementById('upload-area');
        const imageInput = document.getElementById('image-input');
        
        if (!uploadArea || !imageInput) {
            console.error('[Marketplace] Upload elements not found');
            return;
        }
        
        console.log('[Marketplace] Initializing image upload...');
        
        // Single click handler
        uploadArea.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('[Marketplace] Upload area clicked');
            imageInput.click();
        };
        
        // File selection handler
        imageInput.onchange = function(e) {
            console.log('[Marketplace] Files selected:', e.target.files.length);
            if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = '';
            }
        };
        
        // Drag and drop
        uploadArea.ondragover = function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('drag-over');
        };
        
        uploadArea.ondragleave = function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
        };
        
        uploadArea.ondrop = function(e) {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        };
        
        console.log('[Marketplace] Image upload initialized');
    }

    function handleFiles(files) {
        console.log('[Marketplace] Processing', files.length, 'files');
        const filesArray = Array.from(files);
        
        for (const file of filesArray) {
            if (uploadedImages.length >= MAX_IMAGES) {
                showNotification(`Maximum ${MAX_IMAGES} images allowed`, 'error');
                break;
            }
            
            if (file.size > MAX_FILE_SIZE) {
                showNotification(`${file.name} exceeds 5MB limit`, 'error');
                continue;
            }
            
            if (!file.type.startsWith('image/')) {
                showNotification(`${file.name} is not an image`, 'error');
                continue;
            }
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageData = {
                    file: file,
                    dataUrl: e.target.result,
                    isMain: uploadedImages.length === 0
                };
                uploadedImages.push(imageData);
                renderImagePreviews();
                console.log('[Marketplace] Image added, total:', uploadedImages.length);
            };
            reader.readAsDataURL(file);
        }
    }

    function renderImagePreviews() {
        const previewsContainer = document.getElementById('image-previews');
        if (!previewsContainer) return;
        
        previewsContainer.innerHTML = uploadedImages.map((img, index) => `
            <div class="image-preview" data-index="${index}">
                <img src="${img.dataUrl}" alt="Preview ${index + 1}">
                <button type="button" class="remove-btn" onclick="window.marketplaceRemoveImage(${index})">
                    <i data-lucide="x"></i>
                </button>
                ${img.isMain ? '<span class="main-badge">Main</span>' : ''}
            </div>
        `).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    window.marketplaceRemoveImage = function(index) {
        uploadedImages.splice(index, 1);
        if (uploadedImages.length > 0 && !uploadedImages.some(img => img.isMain)) {
            uploadedImages[0].isMain = true;
        }
        renderImagePreviews();
    };

    // Pricing
    function initPricing() {
        const priceInput = document.getElementById('price');
        if (!priceInput) return;
        
        priceInput.addEventListener('input', function() {
            const price = parseFloat(priceInput.value) || 0;
            const fee = price * 0.10;
            const customerPrice = price + fee;
            const contribution = price * 0.05;
            
            const finalPriceEl = document.getElementById('final-price');
            const artistEarningsEl = document.getElementById('artist-earnings');
            const marketplaceFeeEl = document.getElementById('marketplace-fee');
            const homelessContributionEl = document.getElementById('homeless-contribution');
            
            if (finalPriceEl) finalPriceEl.textContent = `$${customerPrice.toFixed(2)}`;
            if (artistEarningsEl) artistEarningsEl.textContent = `$${price.toFixed(2)}`;
            if (marketplaceFeeEl) marketplaceFeeEl.textContent = `$${fee.toFixed(2)}`;
            if (homelessContributionEl) homelessContributionEl.textContent = `$${contribution.toFixed(2)}`;
        });
        
        priceInput.dispatchEvent(new Event('input'));
    }

    // Character counters
    function initCharCounters() {
        const nameInput = document.getElementById('name');
        const descInput = document.getElementById('description');
        
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                const countEl = document.getElementById('name-count');
                if (countEl) countEl.textContent = nameInput.value.length + '/100';
            });
        }
        
        if (descInput) {
            descInput.addEventListener('input', () => {
                const countEl = document.getElementById('desc-count');
                if (countEl) countEl.textContent = descInput.value.length + '/500';
            });
        }
    }

    // Tags
    function initTags() {
        const tagsInput = document.getElementById('tags-input');
        if (!tagsInput) return;
        
        tagsInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = tagsInput.value.trim().toLowerCase();
                
                if (tag && !productTags.includes(tag) && productTags.length < 10) {
                    productTags.push(tag);
                    renderTags();
                    tagsInput.value = '';
                }
            }
        });
    }

    function renderTags() {
        const container = document.getElementById('tags-container');
        const hiddenInput = document.getElementById('tags');
        
        if (!container) return;
        
        container.innerHTML = productTags.map((tag, index) => `
            <span class="tag">
                ${tag}
                <span class="tag-remove" onclick="window.marketplaceRemoveTag(${index})">
                    <i data-lucide="x"></i>
                </span>
            </span>
        `).join('');
        
        if (hiddenInput) {
            hiddenInput.value = productTags.join(',');
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    window.marketplaceRemoveTag = function(index) {
        productTags.splice(index, 1);
        renderTags();
    };

    // Shipping toggle
    function initShipping() {
        const freeShippingCheckbox = document.getElementById('free-shipping');
        const shippingCostGroup = document.getElementById('shipping-cost-group');
        
        if (!freeShippingCheckbox || !shippingCostGroup) return;
        
        freeShippingCheckbox.addEventListener('change', () => {
            shippingCostGroup.style.display = freeShippingCheckbox.checked ? 'none' : 'block';
        });
    }

    // Load categories
    async function loadCategories() {
        try {
            const response = await fetch(`${API_BASE_URL}/categories`);
            if (!response.ok) throw new Error('Failed to load categories');
            
            const categories = await response.json();
            const categorySelect = document.getElementById('category');
            
            if (categorySelect && categories.length > 0) {
                categorySelect.innerHTML = '<option value="">Select a category...</option>';
                categories.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat.id;
                    option.textContent = cat.name;
                    categorySelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('[Marketplace] Error loading categories:', error);
        }
    }

    // Upload to Supabase via Railway backend
    async function uploadImagesToSupabase(auth) {
        console.log('[Marketplace] Uploading', uploadedImages.length, 'images to Supabase');
        
        try {
            const formData = new FormData();
            uploadedImages.forEach((img) => {
                formData.append('images', img.file);
            });
            
            const response = await fetch(`${API_BASE_URL}/upload/product-images`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${auth.token}`
                },
                body: formData
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload images');
            }
            
            const result = await response.json();
            console.log('[Marketplace] Upload successful:', result);
            return result.images;
        } catch (error) {
            console.error('[Marketplace] Upload error:', error);
            throw error;
        }
    }

    // Form submission
    async function handleFormSubmit(e) {
        e.preventDefault();
        console.log('[Marketplace] Form submitted');
        
        const auth = checkAuth();
        if (!auth) return;
        
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn?.querySelector('.btn-text');
        
        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Publishing...';
        
        try {
            if (uploadedImages.length === 0) {
                showNotification('Please upload at least one product image', 'error');
                if (submitBtn) submitBtn.disabled = false;
                if (btnText) btnText.textContent = 'Publish Product';
                return;
            }
            
            if (btnText) btnText.textContent = 'Uploading images...';
            const uploadedImageUrls = await uploadImagesToSupabase(auth);
            
            if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
                throw new Error('Failed to upload images');
            }
            
            if (btnText) btnText.textContent = 'Creating product...';
            
            const form = document.getElementById('add-product-form');
            const formData = new FormData(form);
            
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category_id: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stock_quantity: parseInt(formData.get('quantity')) || 1,
                materials: formData.get('materials') || null,
                weight: formData.get('weight') || null,
                care_instructions: formData.get('care_instructions') || null,
                shipping_cost: formData.get('free-shipping') === 'on' ? 0 : parseFloat(formData.get('shipping_cost')) || 0,
                processing_time: formData.get('processing_time') || '3-5',
                tags: productTags.length > 0 ? productTags.join(',') : null,
                sku: formData.get('sku') || null,
                image_url: uploadedImageUrls[0].imageUrl,
                thumbnail_url: uploadedImageUrls[0].thumbnailUrl,
                images: uploadedImageUrls.map(img => img.imageUrl),
                variants: productVariants.filter(v => v.name && v.values.length > 0).map(v => ({
                    name: v.name,
                    values: v.values
                }))
            };
            
            console.log('[Marketplace] Creating product:', productData);
            
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${auth.token}`
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create product');
            }
            
            const newProduct = await response.json();
            console.log('[Marketplace] Product created:', newProduct);
            
            showNotification('Product published successfully!', 'success');
            
            setTimeout(() => {
                window.location.href = 'my-products.html';
            }, 1500);
            
        } catch (error) {
            console.error('[Marketplace] Error:', error);
            showNotification(error.message || 'Failed to publish product', 'error');
        } finally {
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Publish Product';
        }
    }

    // Notifications
    function showNotification(message, type = 'info') {
        const existing = document.querySelector('.marketplace-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = `marketplace-notification notification-${type}`;
        notification.innerHTML = `
            <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
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
            z-index: 99999;
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

    // Animation styles
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
    `;
    document.head.appendChild(style);

    // Product Variants
    let productVariants = [];

    function initVariants() {
        const addVariantBtn = document.getElementById('add-variant-btn');
        if (!addVariantBtn) return;

        addVariantBtn.addEventListener('click', addVariantGroup);
    }

    function addVariantGroup() {
        const variantId = Date.now();
        const variantGroup = document.createElement('div');
        variantGroup.className = 'variant-group';
        variantGroup.dataset.variantId = variantId;

        variantGroup.innerHTML = `
            <div class="variant-header">
                <span class="variant-label">Variant Option</span>
                <button type="button" class="variant-remove" onclick="window.removeVariantGroup(${variantId})">
                    <i data-lucide="trash-2"></i>
                    Remove
                </button>
            </div>
            <input 
                type="text" 
                class="variant-name-input" 
                placeholder="Option name (e.g., Size, Color, Material)"
                data-variant-id="${variantId}"
            >
            <div class="variant-values" data-variant-id="${variantId}"></div>
            <div class="variant-value-input">
                <input 
                    type="text" 
                    placeholder="Add value (e.g., Small, Red, Cotton)"
                    data-variant-id="${variantId}"
                    class="variant-value-field"
                >
                <button type="button" onclick="window.addVariantValue(${variantId})">
                    Add
                </button>
            </div>
        `;

        document.getElementById('variant-options').appendChild(variantGroup);
        
        productVariants.push({
            id: variantId,
            name: '',
            values: []
        });

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }

        // Add enter key handler for value input
        const valueInput = variantGroup.querySelector('.variant-value-field');
        valueInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.addVariantValue(variantId);
            }
        });

        // Add change handler for variant name
        const nameInput = variantGroup.querySelector('.variant-name-input');
        nameInput.addEventListener('input', () => {
            const variant = productVariants.find(v => v.id === variantId);
            if (variant) {
                variant.name = nameInput.value;
            }
        });
    }

    window.removeVariantGroup = function(variantId) {
        const variantGroup = document.querySelector(`[data-variant-id="${variantId}"].variant-group`);
        if (variantGroup) {
            variantGroup.remove();
        }
        productVariants = productVariants.filter(v => v.id !== variantId);
    };

    window.addVariantValue = function(variantId) {
        const valueInput = document.querySelector(`.variant-value-field[data-variant-id="${variantId}"]`);
        const value = valueInput.value.trim();

        if (!value) return;

        const variant = productVariants.find(v => v.id === variantId);
        if (!variant) return;

        if (variant.values.includes(value)) {
            showNotification('This value already exists', 'error');
            return;
        }

        variant.values.push(value);
        renderVariantValues(variantId);
        valueInput.value = '';
    };

    window.removeVariantValue = function(variantId, value) {
        const variant = productVariants.find(v => v.id === variantId);
        if (variant) {
            variant.values = variant.values.filter(v => v !== value);
            renderVariantValues(variantId);
        }
    };

    function renderVariantValues(variantId) {
        const variant = productVariants.find(v => v.id === variantId);
        if (!variant) return;

        const valuesContainer = document.querySelector(`.variant-values[data-variant-id="${variantId}"]`);
        if (!valuesContainer) return;

        valuesContainer.innerHTML = variant.values.map(value => `
            <span class="variant-value-tag">
                ${value}
                <button type="button" class="variant-value-remove" onclick="window.removeVariantValue(${variantId}, '${value.replace(/'/g, "\\'")}')")>
                    <i data-lucide="x"></i>
                </button>
            </span>
        `).join('');

        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    // Logout
    function initLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userType');
                window.location.href = '../frontend/index.html';
            });
        }
    }

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Marketplace] Initializing add-product page...');
        
        checkAuth();
        initImageUpload();
        initPricing();
        initCharCounters();
        initTags();
        initShipping();
        initVariants();
        initLogout();
        loadCategories();
        
        const form = document.getElementById('add-product-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        console.log('[Marketplace] Initialization complete');
    });
})();
