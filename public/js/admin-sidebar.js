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
    console.log('🔧 Admin sidebar initializing...');
    
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
    const token = localStorage.getItem('authToken') || localStorage.getItem('token') || localStorage.getItem('jwtToken');
    console.log('🔑 Token check:', token ? 'Found' : 'Not found');
    console.log('🔑 authToken:', localStorage.getItem('authToken') ? 'exists' : 'missing');
    console.log('🔑 user data:', localStorage.getItem('user') ? 'exists' : 'missing');
    
    if (!token) {
        console.warn('⚠️ No token found, redirecting to login');
        window.location.href = '/login_screen.html';
        return;
    }
    
    // Verify admin role
    const userStr = localStorage.getItem('user');
    if (!userStr) {
        console.error('❌ User data not found in localStorage');
        alert('Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.');
        localStorage.clear();
        window.location.href = '/login_screen.html';
        return;
    }
    
    try {
        const user = JSON.parse(userStr);
        console.log('👤 User data:', user);
        console.log('👤 User role:', user.role);
        
        if (user.role !== 'admin') {
            console.warn('⚠️ User is not admin, role:', user.role);
            alert('Bạn không có quyền truy cập trang quản trị!');
            window.location.href = '/user/home.html';
            return;
        }
        
        console.log('✅ Admin authenticated successfully');
        
        // Update admin name if available
        const adminNameEl = document.getElementById('admin-name');
        if (adminNameEl && user.fullName) {
            adminNameEl.textContent = user.fullName;
        }
    } catch (error) {
        console.error('❌ Error parsing user data:', error);
        alert('Dữ liệu người dùng không hợp lệ. Vui lòng đăng nhập lại.');
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
});
