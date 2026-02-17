// Admin Sidebar Component - Shared across all admin pages
function renderAdminSidebar(activePage = 'dashboard') {
    const menuItems = [
        {
            id: 'dashboard',
            icon: 'dashboard',
            label: 'Tổng quan',
            href: '/admin/home_ad.html'
        },
        {
            id: 'users',
            icon: 'group',
            label: 'Quản lý người dùng',
            href: '/admin/user_ad.html'
        },
        {
            id: 'categories',
            icon: 'folder_open',
            label: 'Quản lý từ vựng',
            href: '/admin/category_ad.html'
        },
        {
            id: 'backup',
            icon: 'backup',
            label: 'Sao lưu dữ liệu',
            href: '/admin/backup_ad.html'
        }
    ];

    const menuHTML = menuItems.map(item => {
        const isActive = activePage === item.id;
        return `
            <a href="${item.href}" 
               class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                   isActive 
                   ? 'bg-primary/10 text-primary border border-primary/20 font-bold shadow-sm' 
                   : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
               }">
                <span class="material-symbols-outlined ${isActive ? 'font-bold' : ''}" style="${isActive ? 'font-variation-settings: \'FILL\' 1' : ''}">${item.icon}</span>
                <span class="font-medium">${item.label}</span>
            </a>
        `;
    }).join('');

    const sidebarHTML = `
        <aside class="w-72 bg-white dark:bg-sidebar-dark border-r border-slate-200 dark:border-slate-700 flex flex-col h-full z-10 shadow-sm">
            <div class="p-6 flex flex-col gap-6 h-full">
                <!-- Admin Profile -->
                <div class="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div class="size-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 overflow-hidden text-primary">
                        <span class="material-symbols-outlined text-3xl">admin_panel_settings</span>
                    </div>
                    <div class="flex flex-col">
                        <h2 class="font-bold text-base leading-tight" id="admin-name">Administrator</h2>
                        <p class="text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
                            System Owner</p>
                    </div>
                </div>

                <!-- Navigation Menu -->
                <nav class="flex flex-col gap-2">
                    <p class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-4 mb-1">
                        Menu chính
                    </p>
                    ${menuHTML}
                </nav>

                <!-- Logout Button -->
                <div class="mt-auto border-t border-slate-100 dark:border-slate-700 pt-4">
                    <button onclick="handleAdminLogout()" class="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group w-full">
                        <span class="material-symbols-outlined group-hover:translate-x-1 transition-transform">logout</span>
                        <span class="font-medium">Đăng xuất hệ thống</span>
                    </button>
                </div>
            </div>
        </aside>
    `;
    
    return sidebarHTML;
}

// Handle admin logout
function handleAdminLogout() {
    if (confirm('Bạn có chắc muốn đăng xuất khỏi hệ thống quản trị?')) {
        // Clear all auth data
        localStorage.removeItem('authToken');
        localStorage.removeItem('token');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('user');
        
        // Redirect to login
        window.location.href = '/login_screen.html';
    }
}

// Initialize admin sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    console.log('===== ADMIN SIDEBAR INIT START =====');
    console.log('🔧 Admin sidebar initializing...');
    console.log('📱 User agent:', navigator.userAgent);
    
    const isMobile = /Mobile|Android|iPhone|iPad|Zalo/i.test(navigator.userAgent);
    console.log('📱 Device type:', isMobile ? 'MOBILE' : 'DESKTOP');
    
    // Get active page from current filename
    const currentPage = window.location.pathname.split('/').pop();
    let activePage = 'dashboard';
    
    if (currentPage.includes('user_ad')) {
        activePage = 'users';
    } else if (currentPage.includes('category_ad')) {
        activePage = 'categories';
    } else if (currentPage.includes('vocabulary_ad')) {
        activePage = 'vocabulary';
    } else if (currentPage.includes('backup_ad')) {
        activePage = 'backup';
    }
    
    // Check authentication with multiple token keys
    let token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
    console.log('🔑 Token check:', token ? 'Found (' + token.substring(0, 15) + '...)' : 'Not found');
    
    // retry logic for token if missing (mobile specific)
    if (!token) {
        console.log('⚠️ Token missing initially, checking URL params and retrying...');
        
        // Check URL params directly as a fallback
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        
        if (urlToken) {
            console.log('✅ Found token in URL params, saving...');
            token = urlToken;
            localStorage.setItem('authToken', token);
        } else {
             // Wait a bit and try reading storage again
             await new Promise(resolve => setTimeout(resolve, 500));
             token = localStorage.getItem('authToken') || localStorage.getItem('token');
             console.log('🔑 Token retry check:', token ? 'Found' : 'Still not found');
        }
    }

    if (!token) {
        console.error('⚠️ No token found, redirecting to login');
        // Only redirect if we are SURE it's not a loading glitch
        // alert('Vui lòng đăng nhập để tiếp tục'); 
        // Commented out alert to avoid disrupting user flow if it's just a refresh
        window.location.href = '/login_screen.html';
        return;
    }
    
    // Verify admin role
    let userStr = localStorage.getItem('user');
    console.log('👤 Initial user data check:', userStr ? 'EXISTS' : 'MISSING');
    
    // Mobile compatibility: Wait longer if user data is missing
    if (!userStr) {
        const mobileDelay = isMobile ? 1500 : 500; // Increased mobile delay
        console.warn(`⏳ User data not immediately found, waiting ${mobileDelay}ms for mobile sync...`);
        await new Promise(resolve => setTimeout(resolve, mobileDelay));
        userStr = localStorage.getItem('user');
        console.log('👤 After delay check:', userStr ? 'FOUND' : 'STILL MISSING');
    }
    
    // Additional mobile-specific check: verify token exists
    if (isMobile && !localStorage.getItem('authToken')) {
        console.log('📱 Mobile: Token still missing after delay, checking URL params...');
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        if (urlToken) {
            console.log('✅ Recovered token from URL');
            localStorage.setItem('authToken', urlToken);
        }
    }
    
    // Parse user data if available to check if we need full fetch
    let needsFullFetch = false;
    let currentUser = null;
    
    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
            console.log('👤 Parsed user:', currentUser);
            
            // Check if this is a minimal mobile auth user (needs full fetch)
            if (currentUser._isMobileAuth || !currentUser.email || !currentUser.fullName) {
                console.log('⚠️ Detected minimal user data, need full fetch');
                needsFullFetch = true;
            }
        } catch (e) {
            console.error('❌ Error parsing user data:', e);
            needsFullFetch = true;
        }
    }
    
    // If still no user data OR needs full fetch, fetch from API using the token
    if (!userStr || needsFullFetch) {
        if (!userStr) {
            console.log('🌐 User data missing, fetching from API...');
        } else {
            console.log('🌐 Fetching full user profile from API...');
        }
        
        let fetchAttempts = 0;
        const maxAttempts = 2;
        let fetchSuccess = false;
        
        while (fetchAttempts < maxAttempts && !fetchSuccess) {
            fetchAttempts++;
            console.log(`📡 Fetch attempt ${fetchAttempts}/${maxAttempts}...`);
        while (fetchAttempts < maxAttempts && !fetchSuccess) {
            fetchAttempts++;
            console.log(`📡 Fetch attempt ${fetchAttempts}/${maxAttempts}...`);
            
            try {
                const response = await fetch('/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('📡 API response status:', response.status);
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('📡 API result:', result);
                    
                    if (result.success && result.data) {
                        console.log('✅ Fetched user from API:', result.data.email, '| Role:', result.data.role);
                        
                        // Save to localStorage for future use
                        const userData = {
                            _id: result.data._id,
                            id: result.data._id,
                            email: result.data.email,
                            fullName: result.data.fullName,
                            role: result.data.role,
                            avatar: result.data.avatar
                        };
                        localStorage.setItem('user', JSON.stringify(userData));
                        userStr = JSON.stringify(userData);
                        currentUser = userData;
                        fetchSuccess = true;
                        console.log('✅ Full user data saved to localStorage');
                    } else {
                        throw new Error('Invalid API response structure');
                    }
                } else if (response.status === 401) {
                    throw new Error('Token expired or invalid (401)');
                } else {
                    throw new Error('API request failed with status: ' + response.status);
                }
            } catch (fetchError) {
                console.error(`❌ Fetch attempt ${fetchAttempts} failed:`, fetchError.message);
                
                if (fetchAttempts >= maxAttempts) {
                    // All attempts failed
                    console.error('❌ All fetch attempts failed');
                    console.error('Stack:', fetchError.stack);
                    alert('Không thể tải thông tin người dùng sau ' + maxAttempts + ' lần thử.\n\nLỗi: ' + fetchError.message + '\n\nVui lòng đăng nhập lại.');
                    localStorage.clear();
                    window.location.href = '/login_screen.html';
                    return;
                } else {
                    // Wait before retry
                    console.log('⏳ Waiting 500ms before retry...');
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
    }
    
    // Final verification
    if (!userStr) {
        console.error('❌ User data not found after all attempts');
        alert('Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.');
        localStorage.clear();
        window.location.href = '/login_screen.html';
        return;
    }
    
    // Parse and verify user data
    try {
        if (!currentUser) {
            currentUser = JSON.parse(userStr);
        }
        
        console.log('===== USER VERIFICATION =====');
        console.log('User email:', currentUser.email);
        console.log('User role:', currentUser.role);
        console.log('User name:', currentUser.fullName);
        console.log('=============================');
        
        if (currentUser.role !== 'admin') {
            console.error('⚠️ ACCESS DENIED: User is not admin');
            console.error('Role received:', currentUser.role);
            alert('Bạn không có quyền truy cập trang quản trị!\n\nRole của bạn: ' + currentUser.role);
            window.location.href = '/user/home.html';
            return;
        }
        
        console.log('✅ Admin access verified successfully');
        
        // Update admin name if available
        setTimeout(() => {
            const adminNameEl = document.getElementById('admin-name');
            if (adminNameEl && currentUser.fullName) {
                adminNameEl.textContent = currentUser.fullName;
                console.log('✅ Admin name updated:', currentUser.fullName);
            }
        }, 100);
        
    } catch (error) {
        console.error('❌ Error parsing/verifying user data:', error);
        console.error('Stack:', error.stack);
        alert('Dữ liệu người dùng không hợp lệ.\n\nLỗi: ' + error.message + '\n\nVui lòng đăng nhập lại.');
        localStorage.clear();
        window.location.href = '/login_screen.html';
        return;
    }
    
    // Insert sidebar
    const sidebarContainer = document.getElementById('admin-sidebar-container');
    if (sidebarContainer) {
        sidebarContainer.innerHTML = renderAdminSidebar(activePage);
        console.log('✅ Admin sidebar rendered');
    } else {
        console.error('❌ Sidebar container not found');
    }
    
    // Clean URL params after successful auth if present
    const urlParamsCleanup = new URLSearchParams(window.location.search);
    if (urlParamsCleanup.get('token') && urlParamsCleanup.get('auth') === 'success') {
        try {
            window.history.replaceState({}, document.title, window.location.pathname);
            console.log('🧹 Cleaned auth params from URL');
        } catch (e) {
            console.error('Failed to clean URL:', e);
        }
    }
    
    console.log('===== ADMIN SIDEBAR INIT COMPLETE =====');
});
