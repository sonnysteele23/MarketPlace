/**
 * Add Product Page - SUPABASE DIRECT VERSION
 * Works with GitHub Pages static hosting
 * Supports up to 5 images per product
 */
(function() {
    'use strict';
    
    // Supabase Configuration
    const SUPABASE_URL = 'https://hgzshxoshmsvwrrdgriv.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhnenNoeG9zaG1zdndycmRncml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NDc3ODksImV4cCI6MjA4NTEyMzc4OX0.qO7YFmfmmZSAV4KOZ8qp17HHjSwjlvv2j-vJ1m5iH_w';

    let uploadedImages = [];
    const MAX_IMAGES = 5;
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    let productTags = [];
    let supabase;

    // Initialize Supabase client
    function initSupabase() {
        if (typeof window.supabase === 'undefined') {
            console.error('[Marketplace] Supabase library not loaded!');
            showNotification('System error: Database connection unavailable', 'error');
            return false;
        }
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('[Marketplace] Supabase client initialized');
        return true;
    }

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
                    preview: e.target.result,
                    name: file.name
                };
                uploadedImages.push(imageData);
                renderImagePreviews();
            };
            reader.readAsDataURL(file);
        }
    }

    function renderImagePreviews() {
        const previewsContainer = document.getElementById('image-previews');
        if (!previewsContainer) return;
        
        previewsContainer.innerHTML = '';
        
        uploadedImages.forEach((img, index) => {
            const preview = document.createElement('div');
            preview.className = 'image-preview';
            preview.innerHTML = 
                '<img src="' + img.preview + '" alt="Preview">' +
                (index === 0 ? '<span class="main-badge">Main</span>' : '') +
                '<button type="button" class="remove-btn" data-index="' + index + '"><i data-lucide="x"></i></button>';
            previewsContainer.appendChild(preview);
        });
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Add remove handlers
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                uploadedImages.splice(index, 1);
                renderImagePreviews();
            });
        });
    }

    function loadCategories() {
        const categorySelect = document.getElementById('category');
        if (!categorySelect) return;
        
        const categories = [
            'Jewelry & Accessories',
            'Home Decor',
            'Pottery & Ceramics',
            'Textiles & Fiber Arts',
            'Paintings & Wall Art',
            'Woodworking',
            'Glass Art',
            'Soaps & Candles',
            'Sculptures',
            'Leather Goods',
            'Paper Crafts',
            'Toys & Games',
            'Bath & Body',
            'Bags & Purses',
            'Other'
        ];
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            option.textContent = cat;
            categorySelect.appendChild(option);
        });
    }

    function initPricing() {
        const priceInput = document.getElementById('price');
        if (!priceInput) return;
        
        priceInput.addEventListener('input', updatePricing);
    }

    function updatePricing() {
        const price = parseFloat(document.getElementById('price').value) || 0;
        
        const marketplaceFee = price * 0.10;
        const homelessContribution = price * 0.05;
        const artistEarnings = price - marketplaceFee - homelessContribution;
        const finalPrice = price;
        
        document.getElementById('final-price').textContent = '$' + finalPrice.toFixed(2);
        document.getElementById('artist-earnings').textContent = '$' + artistEarnings.toFixed(2);
        document.getElementById('marketplace-fee').textContent = '$' + marketplaceFee.toFixed(2);
        document.getElementById('homeless-contribution').textContent = '$' + homelessContribution.toFixed(2);
    }

    function initCharCounters() {
        const nameInput = document.getElementById('name');
        const descInput = document.getElementById('description');
        
        if (nameInput) {
            nameInput.addEventListener('input', function() {
                const counter = document.getElementById('name-count');
                if (counter) counter.textContent = this.value.length + '/100';
            });
        }
        
        if (descInput) {
            descInput.addEventListener('input', function() {
                const counter = document.getElementById('desc-count');
                if (counter) counter.textContent = this.value.length + '/500';
            });
        }
    }

    function initTags() {
        const tagsInput = document.getElementById('tags-input');
        if (!tagsInput) return;
        
        tagsInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tag = this.value.trim();
                if (tag && !productTags.includes(tag)) {
                    productTags.push(tag);
                    renderTags();
                    this.value = '';
                }
            }
        });
    }

    function renderTags() {
        const container = document.getElementById('tags-container');
        const hiddenInput = document.getElementById('tags');
        
        if (!container) return;
        
        container.innerHTML = '';
        productTags.forEach((tag, index) => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';
            tagEl.innerHTML = tag + '<span class="tag-remove" data-index="' + index + '"><i data-lucide="x"></i></span>';
            container.appendChild(tagEl);
        });
        
        if (hiddenInput) {
            hiddenInput.value = productTags.join(',');
        }
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        document.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = parseInt(this.getAttribute('data-index'));
                productTags.splice(index, 1);
                renderTags();
            });
        });
    }

    function initShipping() {
        const freeShippingCheckbox = document.getElementById('free-shipping');
        const shippingCostGroup = document.getElementById('shipping-cost-group');
        
        if (freeShippingCheckbox && shippingCostGroup) {
            freeShippingCheckbox.addEventListener('change', function() {
                shippingCostGroup.style.display = this.checked ? 'none' : 'block';
            });
        }
    }

    async function handleFormSubmit(e) {
        e.preventDefault();
        
        if (!supabase) {
            showNotification('Database not initialized', 'error');
            return;
        }
        
        const auth = checkAuth();
        if (!auth) return;
        
        const submitBtn = document.getElementById('submit-btn');
        const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
        
        if (submitBtn) submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Publishing...';
        
        try {
            // Validate required fields
            const name = document.getElementById('name').value.trim();
            const description = document.getElementById('description').value.trim();
            const category = document.getElementById('category').value;
            const price = parseFloat(document.getElementById('price').value);
            const quantity = parseInt(document.getElementById('quantity').value);
            
            if (!name || !description || !category || !price || !quantity) {
                throw new Error('Please fill in all required fields');
            }
            
            if (uploadedImages.length === 0) {
                throw new Error('Please upload at least one product image');
            }
            
            console.log('[Marketplace] Uploading images to Supabase Storage...');
            const imageUrls = [];
            
            // Upload images to Supabase Storage
            for (let i = 0; i < uploadedImages.length; i++) {
                const image = uploadedImages[i];
                const timestamp = Date.now();
                const fileName = `products/${auth.user.id}/${timestamp}_${i}_${image.name}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(fileName, image.file);
                
                if (uploadError) {
                    console.error('[Marketplace] Image upload error:', uploadError);
                    throw new Error('Failed to upload image: ' + image.name);
                }
                
                // Get public URL
                const { data: urlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(fileName);
                
                imageUrls.push(urlData.publicUrl);
                console.log('[Marketplace] Image uploaded:', fileName);
            }
            
            // Prepare product data
            const productData = {
                name: name,
                description: description,
                category: category,
                price: price,
                quantity: quantity,
                artist_id: auth.user.id,
                images: imageUrls,
                main_image: imageUrls[0],
                materials: document.getElementById('materials').value || null,
                dimensions: document.getElementById('dimensions').value || null,
                weight: parseFloat(document.getElementById('weight').value) || null,
                care_instructions: document.getElementById('care-instructions').value || null,
                shipping_cost: document.getElementById('free-shipping').checked ? 0 : parseFloat(document.getElementById('shipping-cost').value),
                processing_time: document.getElementById('processing-time').value,
                tags: productTags.length > 0 ? productTags : null,
                sku: document.getElementById('sku').value || null,
                status: 'active',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            console.log('[Marketplace] Creating product in database...');
            
            // Insert product into Supabase
            const { data, error } = await supabase
                .from('products')
                .insert([productData])
                .select();
            
            if (error) {
                console.error('[Marketplace] Database error:', error);
                throw new Error('Failed to save product: ' + error.message);
            }
            
            console.log('[Marketplace] Product created successfully:', data);
            showNotification('Product published successfully with ' + imageUrls.length + ' images!', 'success');
            
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
        console.log('[Marketplace] Initializing add-product page (Supabase version)...');
        
        if (!initSupabase()) {
            showNotification('Failed to initialize database connection', 'error');
            return;
        }
        
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
