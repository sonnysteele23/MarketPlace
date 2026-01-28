/**
 * Navigation Module
 * Handles auth-aware navigation across all pages
 * Washington Artisan Marketplace
 */

// Check if Auth is available (from auth.js)
const getAuth = () => {
    if (typeof Auth !== 'undefined') return Auth;
    
    // Fallback auth methods if auth.js not loaded
    return {
        isLoggedIn: () => !!localStorage.getItem('token'),
        getUser: () => {
            const user = localStorage.getItem('user');
            return user ? JSON.parse(user) : null;
        },
        getUserType: () => localStorage.getItem('userType'),
        clearAuth: () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userType');
        }
    };
};

/**
 * Get user's first name from stored user data
 */
function getFirstName() {
    const auth = getAuth();
    const user = auth.getUser();
    
    if (!user) return null;
    
    // Handle both customer (name) and artist (business_name) 
    const fullName = user.name || user.business_name || '';
    return fullName.split(' ')[0] || 'User';
}

/**
 * Get user's email from stored user data
 */
function getUserEmail() {
    const auth = getAuth();
    const user = auth.getUser();
    return user?.email || '';
}

/**
 * Update navigation based on auth state
 */
function updateAuthNavigation() {
    const auth = getAuth();
    const isLoggedIn = auth.isLoggedIn();
    
    // Find nav-auth container
    const navAuth = document.querySelector('.nav-auth');
    if (!navAuth) return;
    
    if (isLoggedIn) {
        const firstName = getFirstName();
        const email = getUserEmail();
        const userType = auth.getUserType();
        
        // Replace login/signup with user menu
        navAuth.innerHTML = `
            <div class="user-menu-container">
                <button class="user-menu-btn" id="user-menu-toggle">
                    <div class="user-avatar">
                        <i data-lucide="user"></i>
                    </div>
                    <span class="user-greeting">Hi, ${firstName}</span>
                    <i data-lucide="chevron-down" class="chevron"></i>
                </button>
                <div class="user-dropdown" id="user-dropdown">
                    <div class="dropdown-header">
                        <span class="dropdown-name">${firstName}</span>
                        <span class="dropdown-email">${email}</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="${getBasePath()}frontend/account.html" class="dropdown-item">
                        <i data-lucide="user"></i>
                        My Account
                    </a>
                    <a href="${getBasePath()}frontend/account.html#orders" class="dropdown-item">
                        <i data-lucide="package"></i>
                        My Orders
                    </a>
                    <a href="${getBasePath()}frontend/account.html#wishlist" class="dropdown-item">
                        <i data-lucide="heart"></i>
                        Wishlist
                    </a>
                    ${userType === 'artist' ? `
                    <div class="dropdown-divider"></div>
                    <a href="${getBasePath()}artist-cms/dashboard.html" class="dropdown-item">
                        <i data-lucide="layout-dashboard"></i>
                        Artist Dashboard
                    </a>
                    ` : ''}
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout-btn" onclick="handleLogout()">
                        <i data-lucide="log-out"></i>
                        Sign Out
                    </button>
                </div>
            </div>
        `;
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        // Setup dropdown toggle
        setupDropdownToggle();
        
    } else {
        // Show login/signup buttons
        navAuth.innerHTML = `
            <a href="${getBasePath()}frontend/login.html" class="btn btn-ghost btn-sm">
                <i data-lucide="log-in"></i>
                <span>Login</span>
            </a>
            <a href="${getBasePath()}frontend/register.html" class="btn btn-primary btn-sm">
                Sign Up
            </a>
        `;
        
        // Re-initialize Lucide icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

/**
 * Get base path for links (handles being in subdirectories)
 */
function getBasePath() {
    const path = window.location.pathname;
    
    // If we're in frontend/ or artist-cms/ subdirectory
    if (path.includes('/frontend/') || path.includes('/artist-cms/')) {
        return '../';
    }
    
    // If we're at root
    return '';
}

/**
 * Setup dropdown toggle functionality
 */
function setupDropdownToggle() {
    const toggle = document.getElementById('user-menu-toggle');
    const dropdown = document.getElementById('user-dropdown');
    
    if (!toggle || !dropdown) return;
    
    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
        toggle.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!toggle.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            toggle.classList.remove('active');
        }
    });
    
    // Close dropdown on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dropdown.classList.remove('show');
            toggle.classList.remove('active');
        }
    });
}

/**
 * Handle logout
 */
function handleLogout() {
    const auth = getAuth();
    auth.clearAuth();
    
    // Redirect to home page
    window.location.href = getBasePath() + 'index.html';
}

/**
 * Update page content with user data
 */
function personalizePageContent() {
    const auth = getAuth();
    
    if (!auth.isLoggedIn()) return;
    
    const firstName = getFirstName();
    const email = getUserEmail();
    
    // Update any elements with data-personalize attribute
    document.querySelectorAll('[data-personalize="firstName"]').forEach(el => {
        el.textContent = firstName;
    });
    
    document.querySelectorAll('[data-personalize="email"]').forEach(el => {
        el.textContent = email;
    });
    
    document.querySelectorAll('[data-personalize="greeting"]').forEach(el => {
        el.textContent = `Hi, ${firstName}!`;
    });
}

/**
 * Add user menu styles dynamically
 */
function addUserMenuStyles() {
    if (document.getElementById('user-menu-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'user-menu-styles';
    styles.textContent = `
        .user-menu-container {
            position: relative;
        }
        
        .user-menu-btn {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 6px 12px;
            background: var(--gray-100, #f3f4f6);
            border: 1px solid var(--gray-200, #e5e7eb);
            border-radius: 50px;
            cursor: pointer;
            transition: all 0.2s ease;
        }
        
        .user-menu-btn:hover {
            background: var(--gray-200, #e5e7eb);
        }
        
        .user-menu-btn.active {
            background: var(--primary-50, #f5f3ff);
            border-color: var(--primary-200, #ddd6fe);
        }
        
        .user-avatar {
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: var(--primary-500, #8B5CF6);
            color: white;
            border-radius: 50%;
        }
        
        .user-avatar i {
            width: 16px;
            height: 16px;
        }
        
        .user-greeting {
            font-size: 14px;
            font-weight: 500;
            color: var(--gray-700, #374151);
        }
        
        .chevron {
            width: 16px;
            height: 16px;
            color: var(--gray-400, #9ca3af);
            transition: transform 0.2s ease;
        }
        
        .user-menu-btn.active .chevron {
            transform: rotate(180deg);
        }
        
        .user-dropdown {
            position: absolute;
            top: calc(100% + 8px);
            right: 0;
            width: 240px;
            background: white;
            border: 1px solid var(--gray-200, #e5e7eb);
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
            opacity: 0;
            visibility: hidden;
            transform: translateY(-10px);
            transition: all 0.2s ease;
            z-index: 1000;
        }
        
        .user-dropdown.show {
            opacity: 1;
            visibility: visible;
            transform: translateY(0);
        }
        
        .dropdown-header {
            padding: 16px;
            border-bottom: 1px solid var(--gray-100, #f3f4f6);
        }
        
        .dropdown-name {
            display: block;
            font-weight: 600;
            color: var(--gray-900, #111827);
            margin-bottom: 2px;
        }
        
        .dropdown-email {
            display: block;
            font-size: 13px;
            color: var(--gray-500, #6b7280);
        }
        
        .dropdown-divider {
            height: 1px;
            background: var(--gray-100, #f3f4f6);
            margin: 4px 0;
        }
        
        .dropdown-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            color: var(--gray-700, #374151);
            text-decoration: none;
            font-size: 14px;
            transition: background 0.15s ease;
            border: none;
            background: none;
            width: 100%;
            cursor: pointer;
            text-align: left;
        }
        
        .dropdown-item:hover {
            background: var(--gray-50, #f9fafb);
        }
        
        .dropdown-item i {
            width: 18px;
            height: 18px;
            color: var(--gray-400, #9ca3af);
        }
        
        .logout-btn {
            color: var(--error, #EF4444);
        }
        
        .logout-btn i {
            color: var(--error, #EF4444);
        }
        
        @media (max-width: 768px) {
            .user-greeting {
                display: none;
            }
            
            .chevron {
                display: none;
            }
            
            .user-menu-btn {
                padding: 6px;
            }
            
            .user-dropdown {
                right: -10px;
                width: 220px;
            }
        }
    `;
    document.head.appendChild(styles);
}

/**
 * Initialize navigation
 */
function initNavigation() {
    addUserMenuStyles();
    updateAuthNavigation();
    personalizePageContent();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initNavigation);
} else {
    initNavigation();
}

// Export for use in other scripts
window.updateAuthNavigation = updateAuthNavigation;
window.handleLogout = handleLogout;
window.getFirstName = getFirstName;
window.getUserEmail = getUserEmail;
