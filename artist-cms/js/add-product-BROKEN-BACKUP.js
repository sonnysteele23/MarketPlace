/**
 * Add Product Page JavaScript - Supabase Storage Version
 * Handles product form submission with Supabase image uploads
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
        window.location.href = '../frontend/login.html?redirect=artist-cms/add-product.html';
        return null;
    }
    
    // Update artist name in header
    const artistNameEl = document.getElementById('artist-name');
    if (artistNameEl && user.business_name) {
        artistNameEl.textContent = user.business_name;
    }
    
    return { token, user };
}

// ===================================
// Image Upload Handling
// ===================================
let uploadedImages = [];
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function initImageUpload() {
    const uploadArea = document.getElementById('upload-area');
    const imageInput = document.getElementById('image-input');
    const previewsContainer = document.getElementById('image-previews');
    
    if (!uploadArea || !imageInput) return;
    
   // Click to upload - prevent multiple triggers
uploadArea.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    imageInput.click();
}, { once: false });
    
    // Handle file selection
    imageInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        handleFiles(e.dataTransfer.files);
    });
}

function handleFiles(files) {
    const previewsContainer = document.getElementById('image-previews');
    
    for (const file of files) {
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
        
        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = {
                file: file,
                dataUrl: e.target.result,
                isMain: uploadedImages.length === 0
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
    
    previewsContainer.innerHTML = uploadedImages.map((img, index) => `
        <div class="image-preview" data-index="${index}">
            <img src="${img.dataUrl}" alt="Preview ${index + 1}">
            <button type="button" class="remove-btn" onclick="removeImage(${index})">
                <i data-lucide="x"></i>
            </button>
            ${img.isMain ? '<span class="main-badge">Main</span>' : ''}
        </div>
    `).join('');
    
    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function removeImage(index) {
    uploadedImages.splice(index, 1);
    // If we removed the main image, make the first one main
    if (uploadedImages.length > 0 && !uploadedImages.some(img => img.isMain)) {
        uploadedImages[0].isMain = true;
    }
    renderImagePreviews();
}

// ===================================
// Pricing Calculations
// ===================================
const MARKETPLACE_FEE_PERCENT = 0.10; // 10%
const HOMELESS_CONTRIBUTION_PERCENT = 0.05; // 5%

function initPricingCalculations() {
    const priceInput = document.getElementById('price');
    if (!priceInput) return;
    
    priceInput.addEventListener('input', updatePricing);
    updatePricing(); // Initial calculation
}

function updatePricing() {
    const priceInput = document.getElementById('price');
    const price = parseFloat(priceInput?.value) || 0;
    
    const marketplaceFee = price * MARKETPLACE_FEE_PERCENT;
    const customerPrice = price + marketplaceFee;
    const homelessContribution = price * HOMELESS_CONTRIBUTION_PERCENT;
    
    // Update display elements
    const finalPriceEl = document.getElementById('final-price');
    const artistEarningsEl = document.getElementById('artist-earnings');
    const marketplaceFeeEl = document.getElementById('marketplace-fee');
    const homelessContributionEl = document.getElementById('homeless-contribution');
    
    if (finalPriceEl) finalPriceEl.textContent = `$${customerPrice.toFixed(2)}`;
    if (artistEarningsEl) artistEarningsEl.textContent = `$${price.toFixed(2)}`;
    if (marketplaceFeeEl) marketplaceFeeEl.textContent = `$${marketplaceFee.toFixed(2)}`;
    if (homelessContributionEl) homelessContributionEl.textContent = `$${homelessContribution.toFixed(2)}`;
}

// ===================================
// Character Counters
// ===================================
function initCharCounters() {
    const nameInput = document.getElementById('product-name');
    const descInput = document.getElementById('description');
    
    if (nameInput) {
        nameInput.addEventListener('input', () => {
            const countEl = document.getElementById('name-count');
            if (countEl) countEl.textContent = nameInput.value.length;
        });
    }
    
    if (descInput) {
        descInput.addEventListener('input', () => {
            const countEl = document.getElementById('desc-count');
            if (countEl) countEl.textContent = descInput.value.length;
        });
    }
}

// ===================================
// Tags Management
// ===================================
let productTags = [];

function initTagsInput() {
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
            <span class="tag-remove" onclick="removeTag(${index})">
                <i data-lucide="x"></i>
            </span>
        </span>
    `).join('');
    
    if (hiddenInput) {
        hiddenInput.value = productTags.join(',');
    }
    
    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

function removeTag(index) {
    productTags.splice(index, 1);
    renderTags();
}

// ===================================
// Free Shipping Toggle
// ===================================
function initShippingToggle() {
    const freeShippingCheckbox = document.getElementById('free-shipping');
    const shippingCostGroup = document.getElementById('shipping-cost-group');
    
    if (!freeShippingCheckbox || !shippingCostGroup) return;
    
    freeShippingCheckbox.addEventListener('change', () => {
        shippingCostGroup.style.display = freeShippingCheckbox.checked ? 'none' : 'block';
    });
}

// ===================================
// Load Categories
// ===================================
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
        console.error('Error loading categories:', error);
    }
}

// ===================================
// Upload Images to Supabase Storage
// ===================================
async function uploadImagesToSupabase(auth) {
    try {
        const formData = new FormData();
        
        // Append all uploaded images
        uploadedImages.forEach((img, index) => {
            formData.append('images', img.file);
        });
        
        // Upload to backend API which will handle Supabase Storage
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
        return result.images; // Array of { imageUrl, thumbnailUrl, filename }
    } catch (error) {
        console.error('Error uploading images:', error);
        throw error;
    }
}

// ===================================
// Form Submission
// ===================================
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const auth = checkAuth();
    if (!auth) return;
    
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    
    // Show loading state
    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.textContent = 'Publishing...';
    
    try {
        // Validate that at least one image was uploaded
        if (uploadedImages.length === 0) {
            showNotification('Please upload at least one product image', 'error');
            if (submitBtn) submitBtn.disabled = false;
            if (btnText) btnText.textContent = 'Publish Product';
            return;
        }
        
        // Step 1: Upload images to Supabase Storage via backend
        if (btnText) btnText.textContent = 'Uploading images...';
        const uploadedImageUrls = await uploadImagesToSupabase(auth);
        
        if (!uploadedImageUrls || uploadedImageUrls.length === 0) {
            throw new Error('Failed to upload images');
        }
        
        // Step 2: Prepare product data with Supabase image URLs
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
            dimensions: formData.get('dimensions') || null,
            weight: formData.get('weight') || null,
            // Use Supabase Storage URLs
            image_url: uploadedImageUrls[0].imageUrl,
            thumbnail_url: uploadedImageUrls[0].thumbnailUrl,
            // Store additional images if any
            
//Commenting out for now

//additional_images: uploadedImageUrls.length > 1 
//                ? uploadedImageUrls.slice(1).map(img => img.imageUrl)
//                : null
        };
        
        // Step 3: Send product data to API
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
        
        showNotification('Product published successfully!', 'success');
        
        // Redirect to my products page after short delay
        setTimeout(() => {
            window.location.href = 'my-products.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error creating product:', error);
        showNotification(error.message || 'Failed to publish product', 'error');
    } finally {
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.textContent = 'Publish Product';
    }
}

// ===================================
// Notification Helper
// ===================================
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
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
    
    // Reinitialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
    
    // Auto remove
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// Add animation styles
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
            window.location.href = '../frontend/index.html';
        });
    }
}

// ===================================
// Initialize Page
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initImageUpload();
    initPricingCalculations();
    initCharCounters();
    initTagsInput();
    initShippingToggle();
    initLogout();
    loadCategories();
    
    // Form submission
    const form = document.getElementById('add-product-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
