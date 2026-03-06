/**
 * Add Product Page - FIXED VERSION
 * Removed variants, added dimensions (length, width, height)
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
            redirectToLogin();
            return null;
        }

        // Check if JWT is expired client-side before even making a request
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.warn('[Marketplace] Token expired, redirecting to login');
                redirectToLogin();
                return null;
            }
        } catch(e) {
            // Can't decode token — let server handle it
        }
        
        const artistNameEl = document.getElementById('artist-name');
        if (artistNameEl && user.business_name) {
            artistNameEl.textContent = user.business_name;
        }
        
        return { token, user };
    }

    function redirectToLogin() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
        window.location.href = '../frontend/login.html?redirect=artist-cms/add-product.html&reason=session_expired';
    }

    // Image Upload
    function initImageUpload() {
        const uploadArea = document.getElementById('upload-area');
        const imageInput = document.getElementById('image-input');
        const uploadLabel = uploadArea?.querySelector('.upload-label');
        
        if (!uploadArea || !imageInput) {
            console.error('[Marketplace] Upload elements not found');
            return;
        }
        
        console.log('[Marketplace] Initializing image upload...');
        
        // Clear any existing handlers by cloning
        const newUploadArea = uploadArea.cloneNode(true);
        uploadArea.parentNode.replaceChild(newUploadArea, uploadArea);
        
        // Get fresh references after clone
        const freshArea = document.getElementById('upload-area');
        const freshInput = document.getElementById('image-input');
        const freshLabel = freshArea.querySelector('.upload-label');
        
        // Click handler on label (most reliable)
        if (freshLabel) {
            freshLabel.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Marketplace] Label clicked');
                freshInput.click();
            });
        }
        
        // Fallback: click on area itself
        freshArea.addEventListener('click', function(e) {
            if (e.target === freshArea || e.target.closest('.upload-label')) {
                e.preventDefault();
                e.stopPropagation();
                console.log('[Marketplace] Area clicked');
                freshInput.click();
            }
        });
        
        // File selection handler
        freshInput.addEventListener('change', function(e) {
            console.log('[Marketplace] Files selected:', e.target.files.length);
            if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = '';
            }
        });
        
        // Drag and drop
        freshArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            freshArea.classList.add('drag-over');
        });
        
        freshArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            freshArea.classList.remove('drag-over');
        });
        
        freshArea.addEventListener('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            freshArea.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                handleFiles(e.dataTransfer.files);
            }
        });
        
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
        const nameInput = document.getElementById('product-name');
        const nameCount = document.getElementById('name-count');
        
        if (nameInput && nameCount) {
            nameInput.addEventListener('input', () => {
                nameCount.textContent = nameInput.value.length;
            });
        }
        
        const descInput = document.getElementById('description');
        const descCount = document.getElementById('desc-count');
        
        if (descInput && descCount) {
            descInput.addEventListener('input', () => {
                descCount.textContent = descInput.value.length;
            });
        }
    }

    // Tags
    function initTags() {
        const tagsInput = document.getElementById('tags-input');
        const tagsContainer = document.getElementById('tags-container');
        if (!tagsInput || !tagsContainer) {
            console.log('[Marketplace] Tags elements not found, skipping');
            return;
        }
        
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
            
            if (response.status === 401) {
                redirectToLogin();
                throw new Error('Session expired. Please log in again.');
            }
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

    // Form submission - FIXED VERSION
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
            
            // FIXED: Removed variants, added dimensions
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category_id: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stock_quantity: parseInt(formData.get('quantity')) || 1,
                materials: formData.get('materials') || null,
                length: formData.get('length') ? parseFloat(formData.get('length')) : null,
                width: formData.get('width') ? parseFloat(formData.get('width')) : null,
                height: formData.get('height') ? parseFloat(formData.get('height')) : null,
                weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
                care_instructions: formData.get('care_instructions') || null,
                shipping_cost: formData.get('free_shipping') === 'on' ? 0 : parseFloat(formData.get('shipping_cost')) || 0,
                processing_time: formData.get('processing_time') || '3-5',
                tags: productTags.length > 0 ? productTags.join(',') : null,
                sku: formData.get('sku') || null,
                image_url: uploadedImageUrls[0].imageUrl,
                thumbnail_url: uploadedImageUrls[0].thumbnailUrl,
                images: uploadedImageUrls.map(img => img.imageUrl)
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
            
            showSubmissionSuccessModal(newProduct.name);
            
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

    // Logout - FIXED: Correct redirect path
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

    // Initialize - REMOVED initVariants()
    document.addEventListener('DOMContentLoaded', function() {
        console.log('[Marketplace] Initializing add-product page...');
        
        checkAuth();
        initImageUpload();
        initPricing();
        initCharCounters();
        initTags();
        initShipping();
        initLogout();
        loadCategories();
        
        const form = document.getElementById('add-product-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        console.log('[Marketplace] Initialization complete');
    });

    // ─────────────────────────────────────────────
    // Product Submission Success Modal
    // ─────────────────────────────────────────────
    function showSubmissionSuccessModal(productName) {
        // Remove any existing modal
        const existing = document.getElementById('submission-success-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'submission-success-modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-box">
                <div class="modal-icon">
                    <i data-lucide="package-check"></i>
                </div>
                <h2>Product Received!</h2>
                <p class="modal-product-name">“${productName}”</p>
                <p class="modal-body">We review all products before they go live to ensure quality for our customers. You’ll receive an email notification within <strong>24 hours</strong> once your product has been reviewed.</p>
                <div class="modal-steps">
                    <div class="modal-step">
                        <span class="step-dot done"><i data-lucide="check"></i></span>
                        <span>Product submitted</span>
                    </div>
                    <div class="modal-step">
                        <span class="step-dot pending"><i data-lucide="clock"></i></span>
                        <span>Under review by our team</span>
                    </div>
                    <div class="modal-step">
                        <span class="step-dot future"><i data-lucide="store"></i></span>
                        <span>Goes live after approval</span>
                    </div>
                </div>
                <div class="modal-actions">
                    <button class="btn-modal-secondary" onclick="document.getElementById('submission-success-modal').remove(); window.location.href='my-products.html';">
                        <i data-lucide="package"></i> View My Products
                    </button>
                    <button class="btn-modal-primary" onclick="document.getElementById('submission-success-modal').remove(); document.getElementById('add-product-form').reset(); window.scrollTo(0,0);">
                        <i data-lucide="plus"></i> Add Another Product
                    </button>
                </div>
            </div>
        `;

        // Styles
        const style = document.createElement('style');
        style.id = 'submission-modal-styles';
        style.textContent = `
            #submission-success-modal { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; padding:16px; }
            #submission-success-modal .modal-backdrop { position:fixed; inset:0; background:rgba(0,0,0,0.55); backdrop-filter:blur(4px); }
            #submission-success-modal .modal-box { position:relative; background:#fff; border-radius:20px; padding:40px 36px; max-width:480px; width:100%; box-shadow:0 25px 60px rgba(0,0,0,0.2); animation:modalPop 0.35s cubic-bezier(0.34,1.56,0.64,1); text-align:center; }
            #submission-success-modal .modal-icon { width:72px; height:72px; background:linear-gradient(135deg,#6B46C1,#8B5CF6); border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#fff; }
            #submission-success-modal .modal-icon svg { width:36px; height:36px; }
            #submission-success-modal h2 { font-family:'Playfair Display',Georgia,serif; font-size:26px; font-weight:700; color:#111827; margin:0 0 8px; }
            #submission-success-modal .modal-product-name { font-size:16px; font-weight:600; color:#6B46C1; background:#EDE9FE; display:inline-block; padding:6px 16px; border-radius:20px; margin:0 0 16px; }
            #submission-success-modal .modal-body { font-size:15px; color:#4B5563; line-height:1.6; margin:0 0 24px; }
            #submission-success-modal .modal-steps { display:flex; flex-direction:column; gap:12px; background:#F9FAFB; border-radius:12px; padding:20px; margin-bottom:28px; text-align:left; }
            #submission-success-modal .modal-step { display:flex; align-items:center; gap:12px; font-size:14px; color:#374151; font-weight:500; }
            #submission-success-modal .step-dot { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
            #submission-success-modal .step-dot svg { width:16px; height:16px; }
            #submission-success-modal .step-dot.done { background:#D1FAE5; color:#065F46; }
            #submission-success-modal .step-dot.pending { background:#FEF3C7; color:#92400E; }
            #submission-success-modal .step-dot.future { background:#E5E7EB; color:#6B7280; }
            #submission-success-modal .modal-actions { display:flex; gap:12px; justify-content:center; flex-wrap:wrap; }
            #submission-success-modal .btn-modal-primary { display:inline-flex; align-items:center; gap:8px; background:linear-gradient(135deg,#6B46C1,#8B5CF6); color:#fff; border:none; padding:12px 24px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; }
            #submission-success-modal .btn-modal-primary:hover { transform:translateY(-1px); box-shadow:0 4px 14px rgba(107,70,193,0.4); }
            #submission-success-modal .btn-modal-secondary { display:inline-flex; align-items:center; gap:8px; background:#fff; color:#6B46C1; border:2px solid #6B46C1; padding:12px 24px; border-radius:10px; font-size:14px; font-weight:600; cursor:pointer; transition:all 0.2s; }
            #submission-success-modal .btn-modal-secondary:hover { background:#F5F3FF; }
            @keyframes modalPop { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
        `;
        if (!document.getElementById('submission-modal-styles')) {
            document.head.appendChild(style);
        }

        document.body.appendChild(modal);
        if (typeof lucide !== 'undefined') lucide.createIcons();

        // Reset the form state
        uploadedImages = [];
        productTags = [];
        renderImagePreviews();
        renderTags();
        const form = document.getElementById('add-product-form');
        if (form) form.reset();
        document.getElementById('final-price').textContent = '$0.00';
        document.getElementById('artist-earnings').textContent = '$0.00';
        document.getElementById('marketplace-fee').textContent = '$0.00';
        document.getElementById('homeless-contribution').textContent = '$0.00';
    }

})();
