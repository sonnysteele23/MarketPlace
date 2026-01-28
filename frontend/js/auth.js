/**
 * Authentication Module
 * Handles login, registration, and session management
 * Washington Artisan Marketplace
 */

// API Configuration
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/api'
    : 'https://your-backend-url.com/api'; // Update this for production

// ===================================
// Auth State Management
// ===================================

const Auth = {
    // Get current user from localStorage
    getUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Get auth token
    getToken() {
        return localStorage.getItem('token');
    },

    // Get user type (customer or artist)
    getUserType() {
        return localStorage.getItem('userType');
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Save auth data
    saveAuth(token, user, userType) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userType', userType);
    },

    // Clear auth data (logout)
    clearAuth() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userType');
    },

    // Get auth headers for API requests
    getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
};

// ===================================
// API Functions
// ===================================

// Customer Registration
async function registerCustomer(data) {
    const response = await fetch(`${API_BASE_URL}/customers/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
    }

    return result;
}

// Customer Login
async function loginCustomer(email, password) {
    const response = await fetch(`${API_BASE_URL}/customers/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Login failed');
    }

    return result;
}

// Artist Registration
async function registerArtist(data) {
    const response = await fetch(`${API_BASE_URL}/artists/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Registration failed');
    }

    return result;
}

// Artist Login
async function loginArtist(email, password) {
    const response = await fetch(`${API_BASE_URL}/artists/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Login failed');
    }

    return result;
}

// Forgot Password
async function forgotPassword(email, userType = 'customer') {
    const endpoint = userType === 'artist' 
        ? `${API_BASE_URL}/artists/forgot-password`
        : `${API_BASE_URL}/customers/forgot-password`;

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error || 'Request failed');
    }

    return result;
}

// ===================================
// UI Helper Functions
// ===================================

// Show error message
function showError(message, formId = null) {
    // Remove any existing error
    const existingError = document.querySelector('.auth-error');
    if (existingError) existingError.remove();

    // Create error element
    const errorDiv = document.createElement('div');
    errorDiv.className = 'auth-error';
    errorDiv.innerHTML = `
        <i data-lucide="alert-circle"></i>
        <span>${message}</span>
    `;

    // Insert error
    if (formId) {
        const form = document.getElementById(formId);
        form.insertBefore(errorDiv, form.firstChild);
    } else {
        const form = document.querySelector('.auth-form');
        form.insertBefore(errorDiv, form.firstChild);
    }

    // Re-initialize Lucide icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message) {
    const existingSuccess = document.querySelector('.auth-success');
    if (existingSuccess) existingSuccess.remove();

    const successDiv = document.createElement('div');
    successDiv.className = 'auth-success';
    successDiv.innerHTML = `
        <i data-lucide="check-circle"></i>
        <span>${message}</span>
    `;

    const form = document.querySelector('.auth-form');
    form.insertBefore(successDiv, form.firstChild);

    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Show loading state on button
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.dataset.originalText = button.innerHTML;
        button.innerHTML = `
            <span class="spinner"></span>
            Please wait...
        `;
    } else {
        button.disabled = false;
        button.innerHTML = button.dataset.originalText;
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

// Get redirect URL based on user type
function getRedirectUrl(userType) {
    // Check for stored redirect URL
    const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
    if (redirectUrl) {
        sessionStorage.removeItem('redirectAfterLogin');
        return redirectUrl;
    }

    // Default redirects
    if (userType === 'artist') {
        return '../artist-cms/dashboard.html';
    }
    return 'account.html';
}

// ===================================
// Form Handlers
// ===================================

// Handle Login Form
function initLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const remember = document.getElementById('remember')?.checked || false;

        // Get selected account type
        const activeToggle = document.querySelector('.toggle-btn.active');
        const userType = activeToggle?.dataset.type || 'customer';

        const submitBtn = form.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true);

        try {
            let result;
            
            if (userType === 'artist') {
                result = await loginArtist(email, password);
                Auth.saveAuth(result.token, result.artist, 'artist');
            } else {
                result = await loginCustomer(email, password);
                Auth.saveAuth(result.token, result.customer, 'customer');
            }

            showSuccess('Login successful! Redirecting...');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = getRedirectUrl(userType);
            }, 1000);

        } catch (error) {
            console.error('Login error:', error);
            showError(error.message || 'Invalid email or password');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    });
}

// Handle Registration Form
function initRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const firstName = document.getElementById('first-name').value.trim();
        const lastName = document.getElementById('last-name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const termsAccepted = document.getElementById('terms')?.checked;

        // Get selected account type
        const selectedType = document.querySelector('input[name="account-type"]:checked');
        const userType = selectedType?.value || 'customer';

        // Validation
        if (password !== confirmPassword) {
            showError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            showError('Password must be at least 8 characters');
            return;
        }

        if (!termsAccepted) {
            showError('Please accept the Terms of Service');
            return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        setButtonLoading(submitBtn, true);

        try {
            let result;
            const name = `${firstName} ${lastName}`.trim();

            if (userType === 'artist') {
                result = await registerArtist({
                    email,
                    password,
                    business_name: name, // Use name as business name initially
                    bio: ''
                });
                Auth.saveAuth(result.token, result.artist, 'artist');
            } else {
                result = await registerCustomer({
                    email,
                    password,
                    name
                });
                Auth.saveAuth(result.token, result.customer, 'customer');
            }

            showSuccess('Account created successfully! Redirecting...');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = getRedirectUrl(userType);
            }, 1500);

        } catch (error) {
            console.error('Registration error:', error);
            showError(error.message || 'Registration failed. Please try again.');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    });
}

// Handle Forgot Password Form
function initForgotPasswordForm() {
    const form = document.getElementById('forgot-password-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value.trim();
        const submitBtn = form.querySelector('button[type="submit"]');
        
        setButtonLoading(submitBtn, true);

        try {
            await forgotPassword(email);

            // Show success message
            const successMessage = document.querySelector('.success-message');
            if (successMessage) {
                successMessage.classList.add('show');
                form.style.display = 'none';
            } else {
                showSuccess('If that email exists, a password reset link has been sent.');
            }

        } catch (error) {
            console.error('Forgot password error:', error);
            showError(error.message || 'An error occurred. Please try again.');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    });
}

// Handle Logout
function logout() {
    Auth.clearAuth();
    window.location.href = 'login.html';
}

// ===================================
// Navigation Auth State
// ===================================

// Update navigation based on auth state
function updateNavigation() {
    const navAuth = document.querySelector('.nav-auth');
    const userMenu = document.querySelector('.user-menu');
    
    if (Auth.isLoggedIn()) {
        const user = Auth.getUser();
        const userType = Auth.getUserType();

        // Hide login/signup buttons
        if (navAuth) navAuth.style.display = 'none';
        
        // Show user menu
        if (userMenu) {
            userMenu.style.display = 'block';
            const userName = userMenu.querySelector('#user-name');
            if (userName && user) {
                userName.textContent = user.name || user.business_name || 'User';
            }
        }
    } else {
        // Show login/signup buttons
        if (navAuth) navAuth.style.display = 'flex';
        
        // Hide user menu
        if (userMenu) userMenu.style.display = 'none';
    }
}

// ===================================
// Initialize
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize forms based on page
    initLoginForm();
    initRegisterForm();
    initForgotPasswordForm();
    
    // Update navigation state
    updateNavigation();

    // Handle logout clicks
    document.querySelectorAll('.logout, [data-action="logout"]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    });
});

// Export for use in other scripts
window.Auth = Auth;
window.logout = logout;
