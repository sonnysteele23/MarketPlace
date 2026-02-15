/**
 * Add Product Page - MULTI-IMAGE VERSION
 * Supports up to 5 images per product
 */
(function() {
    'use strict';
    
    const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3000/api'
        : 'https://marketplace-production-57b7.up.railway.app/api';

    let uploadedImages = [];
    const MAX_IMAGES = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    let productTags = [];

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

    function initImageUpload() {
        const imageInput = document.getElementById('image-input');
        const uploadArea = document.getElementById('upload-area');
        
        if (!imageInput) {
            console.error('[Marketplace] Image input not found');
            return;
        }
        
        console.log('[Marketplace] Initializing image upload...');
        
        // Only handle file selection - let the label handle the click
        imageInput.addEventListener('change', function(e) {
            console.log('[Marketplace] Files selected:', e.target.files ? e.target.files.length : 0);
            if (e.target.files && e.target.files.length > 0) {
                handleFiles(e.target.files);
                e.target.value = '';
            }
        });
        
        // Drag and drop
        if (uploadArea) {
            uploadArea.addEventListener('dragover', function(e) {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', function() {
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', function(e) {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    handleFiles(e.dataTransfer.files);
                }
            });
        }
        
        console.log('[Marketplace] Image upload initialized');
    }

    function handleFiles(files) {
        console.log('[Marketplace] Processing', files.length, 'files');
        const filesArray = Array.from(files);
        
        for (const file of filesArray) {
            if (uploadedImages.length >= MAX_IMAGES) {
                showNotification('Maximum ' + MAX_IMAGES + ' images allowed', 'error');
                break;
            }
            
            if (file.size > MAX_FILE_SIZE) {
                showNotification(file.name + ' exceeds 5MB limit', 'error');
                continue;
            }
            
            if (!file.type.startsWith('image/')) {
                showNotification(file.name + ' is not an image', 'error');
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
        
        previewsContainer.innerHTML = uploadedImages.map(function(img, index) {
            return '<div class="image-preview" data-index="' + index + '">' +
                '<img src="' + img.dataUrl + '" alt="Preview ' + (index + 1) + '">' +
                '<button type="button" class="remove-btn" onclick="window.marketplaceRemoveImage(' + index + ')">' +
                '<i data-lucide="x"></i>' +
                '</button>' +
                (img.isMain ? '<span class="main-badge">Main</span>' : '') +
                '</div>';
        }).join('');
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }

    window.marketplaceRemoveImage = function(index) {
        uploadedImages.splice(index, 1);
        if (uploadedImages.length > 0 && !uploadedImages.some(function(img) { return img.isMain; })) {
            uploadedImages[0].isMain = true;
        }
        renderImagePreviews();
    };

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
            
            if (finalPriceEl) finalPriceEl.textContent = '$' + customerPrice.toFixed(2);
            if (artistEarningsEl) artistEarningsEl.textContent = '$' + price.toFixed(2);
            if (marketplaceFeeEl) marketplaceFeeEl.textContent = '$' + fee.toFixed(2);
            if (homelessContributionEl) homelessContributionEl.textContent = '$' + contribution.toFixed(2);
        });
        
        priceInput.dispatchEvent(new Event('input'));
    }

    function initCharCounters() {
        const nameInput = document.getElementById('product-name');
        const descInput = document.getElementById('description');
        
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                const countEl = document.getElementById('name-count');
                if (countEl) countEl.textContent = nameInput.value.length;
            });
        }
        
        if (descInput) {
            descInput.addEventListener('input', function() {
                const countEl = document.getElementById('desc-count');
                if (countEl) countEl.textContent = descInput.value.length;
            });
        }
    }

    function initTags() {
        const tagsInput = document.getElementById('tags-input');
        if (!tagsInput) return;
        
        tagsInput.addEventListener('keydown', function(e) {
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
        
        container.innerHTML = productTags.map(function(tag, index) {
            return '<span class="tag">' +
                tag +
                '<span class="tag-remove" onclick="window.marketplaceRemoveTag(' + index + ')">' +
                '<i data-lucide="x"></i>' +
                '</span>' +
                '</span>';
        }).join('');
        
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

    function initShipping() {
        const freeShippingCheckbox = document.getElementById('free-shipping');
        const shippingCostGroup = document.getElementById('shipping-cost-group');
        
        if (!freeShippingCheckbox || !shippingCostGroup) return;
        
        freeShippingCheckbox.addEventListener('change', function() {
            shippingCostGroup.style.display = freeShippingCheckbox.checked ? 'none' : 'block';
        });
    }

    async function loadCategories() {
        try {
            const response = await fetch(API_BASE_URL + '/categories');
            if (!response.ok) throw new Error('Failed to load categories');
            
            const categories = await response.json();
            const categorySelect = document.getElementById('category');
            
            if (categorySelect && categories.length > 0) {
                categorySelect.innerHTML = '<option value="">Select a category...</option>';
                categories.forEach(function(cat) {
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

    async function uploadImagesToSupabase(auth) {
        console.log('[Marketplace] Uploading', uploadedImages.length, 'images to Supabase');
        
        try {
            const formData = new FormData();
            uploadedImages.forEach(function(img) {
                formData.append('images', img.file);
            });
            
            const response = await fetch(API_BASE_URL + '/upload/product-images', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + auth.token
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

    async function handleFormSubmit(e) {
        e.preventDefault();
        console.log('[Marketplace] Form submitted');
        
        const auth = checkAuth();
        if (!auth) return;
        
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
        
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
            
            // Build product data with ALL images
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                category_id: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stock_quantity: parseInt(formData.get('quantity')) || 1,
                materials: formData.get('materials') || null,
                dimensions: formData.get('dimensions') || null,
                weight: formData.get('weight') || null,
                // Main image (first one)
                image_url: uploadedImageUrls[0].imageUrl,
                thumbnail_url: uploadedImageUrls[0].thumbnailUrl,
                // Additional images (images 2-5)
                additional_images: uploadedImageUrls.length > 1 
                    ? uploadedImageUrls.slice(1).map(function(img) {
                        return {
                            imageUrl: img.imageUrl,
                            thumbnailUrl: img.thumbnailUrl,
                            filename: img.filename
                        };
                    })
                    : []
            };
            
            console.log('[Marketplace] Creating product with', uploadedImageUrls.length, 'images:', productData);
            
            const response = await fetch(API_BASE_URL + '/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + auth.token
                },
                body: JSON.stringify(productData)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create product');
            }
            
            const newProduct = await response.json();
            console.log('[Marketplace] Product created:', newProduct);
            
            showNotification('Product published successfully with ' + uploadedImageUrls.length + ' images!', 'success');
            
            setTimeout(function() {
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

    function showNotification(message, type) {
        type = type || 'info';
        const existing = document.querySelector('.marketplace-notification');
        if (existing) existing.remove();
        
        const notification = document.createElement('div');
        notification.className = 'marketplace-notification notification-' + type;
        
        var iconName = 'info';
        if (type === 'success') iconName = 'check-circle';
        if (type === 'error') iconName = 'alert-circle';
        
        notification.innerHTML = '<i data-lucide="' + iconName + '"></i><span>' + message + '</span>';
        
        var bgColor = '#EFF6FF';
        var textColor = '#1E40AF';
        if (type === 'success') {
            bgColor = '#ECFDF5';
            textColor = '#065F46';
        }
        if (type === 'error') {
            bgColor = '#FEF2F2';
            textColor = '#B91C1C';
        }
        
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; padding: 16px 24px; border-radius: 12px; display: flex; align-items: center; gap: 12px; z-index: 99999; animation: slideIn 0.3s ease; font-weight: 500; box-shadow: 0 4px 12px rgba(0,0,0,0.15); background: ' + bgColor + '; color: ' + textColor + ';';
        
        document.body.appendChild(notification);
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        setTimeout(function() {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(function() { notification.remove(); }, 300);
        }, 4000);
    }

    var style = document.createElement('style');
    style.textContent = '@keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } } @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }';
    document.head.appendChild(style);

    function initLogout() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userType');
                window.location.href = '../frontend/index.html';
            });
        }
    }

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
        
        var form = document.getElementById('add-product-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }
        
        console.log('[Marketplace] Initialization complete');
    });
})();
