/**
 * Artist Profile Settings JavaScript
 * Handles loading and saving artist profile data
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
        window.location.href = '../frontend/login.html?redirect=artist-cms/profile.html';
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
// Load Profile Data
// ===================================
async function loadProfile() {
    const auth = checkAuth();
    if (!auth) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/artists/me/profile`, {
            headers: {
                'Authorization': `Bearer ${auth.token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Failed to load profile');
        }
        
        const profile = await response.json();
        console.log('Profile loaded:', profile);
        
        populateProfileForm(profile);
        populateShopForm(profile);
        
    } catch (error) {
        console.error('Error loading profile:', error);
        showNotification('Failed to load profile data', 'error');
    }
}

// ===================================
// Populate Profile Form
// ===================================
function populateProfileForm(profile) {
    // Split business name into first/last if possible
    const nameParts = (profile.business_name || '').split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Basic info
    setInputValue('first-name', firstName);
    setInputValue('last-name', lastName);
    setInputValue('display-name', profile.business_name);
    setInputValue('bio', profile.bio);
    
    // Contact info
    setInputValue('email', profile.email);
    setInputValue('phone', profile.phone);
    
    // Location - parse if it's a string like "Seattle, WA"
    if (profile.location) {
        const locationParts = profile.location.split(',').map(s => s.trim());
        setInputValue('city', locationParts[0] || '');
    }
    
    // Profile photo
    if (profile.profile_image_url) {
        const photoPlaceholder = document.querySelector('.photo-placeholder');
        if (photoPlaceholder) {
            photoPlaceholder.innerHTML = `<img src="${profile.profile_image_url}" alt="Profile" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`;
        }
    }
    
    // Update character count for bio
    updateCharCount('bio', 500);
}

// ===================================
// Populate Shop Form
// ===================================
function populateShopForm(profile) {
    setInputValue('shop-name', profile.business_name);
    setInputValue('shop-description', profile.bio);
    setInputValue('website', profile.website_url);
}

// ===================================
// Helper Functions
// ===================================
function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input && value !== undefined && value !== null) {
        input.value = value;
    }
}

function updateCharCount(inputId, maxChars) {
    const input = document.getElementById(inputId);
    const countEl = document.querySelector(`#${inputId} + .char-count, [for="${inputId}"] + .char-count, .char-count`);
    
    if (input && countEl) {
        countEl.textContent = `${input.value.length}/${maxChars}`;
    }
}

// ===================================
// Save Profile
// ===================================
async function saveProfile(e) {
    e.preventDefault();
    
    const auth = checkAuth();
    if (!auth) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
    
    try {
        // Get form values
        const firstName = document.getElementById('first-name')?.value || '';
        const lastName = document.getElementById('last-name')?.value || '';
        const displayName = document.getElementById('display-name')?.value || '';
        const bio = document.getElementById('bio')?.value || '';
        const phone = document.getElementById('phone')?.value || '';
        const city = document.getElementById('city')?.value || '';
        const state = document.getElementById('state')?.value || 'WA';
        
        // Prepare update data
        const updateData = {
            business_name: displayName || `${firstName} ${lastName}`.trim(),
            bio: bio,
            phone: phone,
            location: city ? `${city}, ${state}` : ''
        };
        
        const response = await fetch(`${API_BASE_URL}/artists/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update profile');
        }
        
        const updatedProfile = await response.json();
        
        // Update localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        user.business_name = updatedProfile.business_name;
        user.bio = updatedProfile.bio;
        localStorage.setItem('user', JSON.stringify(user));
        
        // Update header name
        const artistNameEl = document.getElementById('artist-name');
        if (artistNameEl) {
            artistNameEl.textContent = updatedProfile.business_name;
        }
        
        showNotification('Profile updated successfully!', 'success');
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification(error.message || 'Failed to save profile', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// ===================================
// Save Shop Settings
// ===================================
async function saveShopSettings(e) {
    e.preventDefault();
    
    const auth = checkAuth();
    if (!auth) return;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Saving...';
    
    try {
        const shopName = document.getElementById('shop-name')?.value || '';
        const shopDescription = document.getElementById('shop-description')?.value || '';
        const website = document.getElementById('website')?.value || '';
        
        const updateData = {
            business_name: shopName,
            bio: shopDescription,
            website_url: website
        };
        
        const response = await fetch(`${API_BASE_URL}/artists/me`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth.token}`
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to update shop settings');
        }
        
        showNotification('Shop settings updated!', 'success');
        
    } catch (error) {
        console.error('Error saving shop settings:', error);
        showNotification(error.message || 'Failed to save shop settings', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// ===================================
// Change Password
// ===================================
async function changePassword(e) {
    e.preventDefault();
    
    const auth = checkAuth();
    if (!auth) return;
    
    const currentPassword = document.getElementById('current-password')?.value;
    const newPassword = document.getElementById('new-password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        showNotification('Please fill in all password fields', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters', 'error');
        return;
    }
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Updating...';
    
    try {
        // Note: Backend needs a password change endpoint
        // For now, show a placeholder message
        showNotification('Password change functionality coming soon', 'info');
        
    } catch (error) {
        console.error('Error changing password:', error);
        showNotification(error.message || 'Failed to change password', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// ===================================
// Notification Helper
// ===================================
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
    .spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 0.8s ease infinite;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

// ===================================
// Toggle Password Visibility
// ===================================
function initPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const icon = btn.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.setAttribute('data-lucide', 'eye-off');
            } else {
                input.type = 'password';
                icon.setAttribute('data-lucide', 'eye');
            }
            
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        });
    });
}

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
// Tab Switching (already in HTML but enhance it)
// ===================================
function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            const tabId = btn.dataset.tab + '-tab';
            document.getElementById(tabId)?.classList.add('active');
        });
    });
}

// ===================================
// Bio Character Counter
// ===================================
function initCharCounters() {
    const bioInput = document.getElementById('bio');
    if (bioInput) {
        bioInput.addEventListener('input', () => {
            const countEl = bioInput.parentElement.querySelector('.char-count');
            if (countEl) {
                countEl.textContent = `${bioInput.value.length}/500`;
            }
        });
    }
}

// ===================================
// Initialize Page
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Check auth and load profile
    loadProfile();
    
    // Initialize UI components
    initTabs();
    initPasswordToggles();
    initCharCounters();
    initLogout();
    
    // Form submissions
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', saveProfile);
    }
    
    const shopForm = document.getElementById('shop-form');
    if (shopForm) {
        shopForm.addEventListener('submit', saveShopSettings);
    }
    
    const securityForm = document.getElementById('security-form');
    if (securityForm) {
        securityForm.addEventListener('submit', changePassword);
    }
});
