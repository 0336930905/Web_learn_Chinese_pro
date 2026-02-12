/**
 * Landing Pages Shared Header Component
 * Renders unified header for index.html, login_screen.html, sign_up_screen.html
 */

(function() {
    'use strict';

    /**
     * Get current page type
     */
    function getCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('login_screen')) return 'login';
        if (path.includes('sign_up_screen')) return 'signup';
        return 'index';
    }

    /**
     * Render header HTML
     */
    function renderHeader() {
        const currentPage = getCurrentPage();
        
        const headerHTML = `
            <header class="landing-header">
                <div class="landing-header-inner bg-surface-light/90 dark:bg-surface-dark/90 border border-primary/20">
                    <!-- Logo -->
                    <a href="/index.html" class="landing-header-logo">
                        <div class="landing-header-logo-icon bg-primary text-text-main dark:text-text-main">
                            <span class="material-symbols-outlined text-2xl font-bold">school</span>
                        </div>
                        <span class="landing-header-logo-text text-text-main dark:text-white" data-i18n="landing.appName">
                            Vocabulary Adventure
                        </span>
                    </a>
                    
                    <!-- Navigation Links (Desktop) -->
                    <nav class="landing-header-nav">
                        <a class="landing-header-nav-link text-text-main dark:text-white hover:text-primary" 
                           href="/index.html#features" 
                           data-i18n="landing.navFeatures">
                            Features
                        </a>
                        <a class="landing-header-nav-link text-text-main dark:text-white hover:text-primary" 
                           href="/index.html#pricing" 
                           data-i18n="landing.navPricing">
                            Pricing
                        </a>
                        <a class="landing-header-nav-link text-text-main dark:text-white hover:text-primary" 
                           href="/index.html#about" 
                           data-i18n="landing.navAbout">
                            About
                        </a>
                    </nav>
                    
                    <!-- Actions -->
                    <div class="landing-header-actions">
                        <!-- Language Switcher -->
                        <div class="relative" id="langSwitcher">
                            <button class="lang-toggle-btn text-text-main dark:text-white" 
                                    id="langToggleBtn" 
                                    aria-label="Change Language">
                                <span class="material-symbols-outlined text-2xl">language</span>
                            </button>
                            <div class="lang-dropdown" id="langDropdown">
                                <button class="lang-option" data-lang="en">English</button>
                                <button class="lang-option ${currentPage === 'index' ? 'active' : ''}" data-lang="vi">Tiếng Việt</button>
                                <button class="lang-option" data-lang="tw">繁體中文</button>
                            </div>
                        </div>
                        
                        <!-- Login/Signup Buttons -->
                        ${currentPage === 'login' ? `
                            <a href="/sign_up_screen.html" 
                               class="btn-secondary bg-primary text-text-main dark:text-text-main shadow-lg shadow-primary/20" 
                               data-i18n="landing.navSignup">
                                Sign Up
                            </a>
                        ` : currentPage === 'signup' ? `
                            <a href="/login_screen.html" 
                               class="hidden sm:flex btn-secondary text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" 
                               data-i18n="landing.navLogin">
                                Login
                            </a>
                        ` : `
                            <button class="hidden sm:flex btn-secondary text-text-main dark:text-white hover:bg-gray-100 dark:hover:bg-white/10" 
                                    id="navLoginBtn" 
                                    data-i18n="landing.navLogin">
                                Login
                            </button>
                            <button class="btn-secondary bg-primary text-text-main dark:text-text-main shadow-lg shadow-primary/20" 
                                    id="navSignupBtn" 
                                    data-i18n="landing.navSignup">
                                Sign Up
                            </button>
                        `}
                    </div>
                </div>
            </header>
        `;

        return headerHTML;
    }

    /**
     * Initialize header
     */
    function initializeHeader() {
        // Find header placeholder
        const placeholder = document.getElementById('landing-header-placeholder');
        if (!placeholder) {
            console.error('Landing header placeholder not found. Add <div id="landing-header-placeholder"></div> to your HTML.');
            return;
        }

        // Inject header HTML
        placeholder.innerHTML = renderHeader();

        // Initialize language dropdown after DOM update
        setTimeout(() => {
            initLanguageDropdown();
            initNavigationButtons();
        }, 0);
    }

    /**
     * Initialize language dropdown
     */
    function initLanguageDropdown() {
        const langToggleBtn = document.getElementById('langToggleBtn');
        const langDropdown = document.getElementById('langDropdown');
        
        if (!langToggleBtn || !langDropdown) return;

        // Toggle dropdown on button click
        langToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            langDropdown.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            const langSwitcher = document.getElementById('langSwitcher');
            if (langSwitcher && !langSwitcher.contains(e.target)) {
                langDropdown.classList.remove('show');
            }
        });

        // Language selection
        document.querySelectorAll('.lang-option').forEach(button => {
            button.addEventListener('click', () => {
                // Update active state
                document.querySelectorAll('.lang-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                button.classList.add('active');

                // Change language if i18n is available
                if (typeof i18n !== 'undefined' && i18n.setLanguage) {
                    i18n.setLanguage(button.dataset.lang);
                }

                // Close dropdown
                langDropdown.classList.remove('show');
            });
        });
    }

    /**
     * Initialize navigation buttons
     */
    function initNavigationButtons() {
        const navLoginBtn = document.getElementById('navLoginBtn');
        const navSignupBtn = document.getElementById('navSignupBtn');

        if (navLoginBtn) {
            navLoginBtn.addEventListener('click', () => {
                window.location.href = '/login_screen.html';
            });
        }

        if (navSignupBtn) {
            navSignupBtn.addEventListener('click', () => {
                window.location.href = '/sign_up_screen.html';
            });
        }
    }

    /**
     * Auto-initialize on DOMContentLoaded
     */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeHeader);
    } else {
        initializeHeader();
    }

    // Export for manual initialization if needed
    window.LandingHeader = {
        init: initializeHeader,
        render: renderHeader
    };
})();
