/**
 * Admin User Management
 * Frontend JavaScript for user_ad.html
 */

const API_BASE_URL = window.location.origin;
let currentPage = 1;
let currentRole = '';
let currentSearch = '';

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Check if user is authenticated and is admin
 */
function checkAuth() {
    const token = getAuthToken();
    console.log('Checking auth...', { hasToken: !!token });
    
    if (!token) {
        console.error('No auth token found, redirecting to login');
        alert('Vui lòng đăng nhập để tiếp tục');
        window.location.href = '/login_screen.html';
        return false;
    }

    // Decode token to check role (simple base64 decode, not secure but for client-side check)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', { userId: payload.userId, role: payload.role });
        
        if (payload.role !== 'admin') {
            console.error('User is not admin:', payload.role);
            alert('Bạn không có quyền truy cập trang này');
            window.location.href = '/user/home.html';
            return false;
        }
        
        console.log('Auth check passed');
        return true;
    } catch (error) {
        console.error('Invalid token:', error);
        alert('Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại');
        localStorage.removeItem('authToken');
        window.location.href = '/login_screen.html';
        return false;
    }
}

/**
 * Make API request with authentication
 */
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    };

    const url = `${API_BASE_URL}${endpoint}`;
    console.log('API Request:', { url, method: options.method || 'GET' });

    const response = await fetch(url, {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    });

    console.log('API Response:', { status: response.status, statusText: response.statusText });

    const data = await response.json();
    console.log('API Response Data:', data);

    if (!response.ok) {
        const errorMessage = data.error?.message || data.message || 'Có lỗi xảy ra';
        console.error('API Error:', { status: response.status, error: data });
        throw new Error(errorMessage);
    }

    return data;
}

/**
 * Load users list
 */
async function loadUsers(page = 1, role = '', search = '') {
    try {
        console.log('Loading users...', { page, role, search });
        showLoading();

        // Build query string
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10'
        });

        if (role && role !== 'all') {
            params.append('role', role);
        }

        if (search) {
            params.append('search', search);
        }

        const url = `/api/admin/users?${params.toString()}`;
        console.log('Request URL:', url);
        
        const data = await apiRequest(url);
        console.log('Users loaded successfully:', data);

        renderUsers(data.data.users);
        renderPagination(data.data.pagination);
        hideLoading();
    } catch (error) {
        console.error('Error loading users:', error);
        console.error('Error details:', error.stack);
        
        // Show error in table
        const tbody = document.querySelector('tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="px-6 py-8 text-center">
                        <div class="text-red-500 dark:text-red-400">
                            <span class="material-symbols-outlined text-4xl mb-2">error</span>
                            <p class="font-semibold">${error.message}</p>
                            <p class="text-sm mt-2">Vui lòng kiểm tra Console để biết thêm chi tiết</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        showError(error.message);
        hideLoading();
    }
}

/**
 * Render users table
 */
function renderUsers(users) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    if (users.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = users.map(user => {
        const initials = user.fullName 
            ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : user.email.substring(0, 2).toUpperCase();

        const statusClass = user.status === 'active' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';

        const statusDotClass = user.status === 'active' ? 'bg-green-500' : 'bg-red-500';
        const statusText = user.status === 'active' ? 'Hoạt động' : 'Khóa';

        const roleClass = user.role === 'admin'
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';

        const roleText = user.role === 'admin' ? 'Admin' : 'Học sinh';

        const createdDate = new Date(user.createdAt).toLocaleDateString('vi-VN');

        const lockButton = user.status === 'active'
            ? `<button onclick="lockUser('${user._id}')" class="text-gray-400 hover:text-red-600 p-1 rounded hover:bg-gray-100" title="Khóa tài khoản">
                <span class="material-symbols-outlined text-[20px]">lock</span>
               </button>`
            : `<button onclick="unlockUser('${user._id}')" class="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 bg-red-50" title="Mở khóa tài khoản">
                <span class="material-symbols-outlined text-[20px]">lock_open</span>
               </button>`;

        return `
            <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <div class="size-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mr-3">
                            ${initials}
                        </div>
                        <div class="text-sm font-medium text-gray-900 dark:text-white">${user.fullName || 'Chưa cập nhật'}</div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">${user.email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${roleClass}">
                        ${roleText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${createdDate}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClass}">
                        <span class="size-2 rounded-full ${statusDotClass} mr-1.5 self-center"></span>
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div class="flex items-center justify-end gap-2">
                        <button onclick="editUser('${user._id}')" class="text-gray-400 hover:text-admin-primary p-1 rounded hover:bg-gray-100" title="Chỉnh sửa">
                            <span class="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        ${lockButton}
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

/**
 * Render pagination
 */
function renderPagination(pagination) {
    const paginationInfo = document.querySelector('.text-sm.text-gray-700');
    if (paginationInfo) {
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        paginationInfo.innerHTML = `
            Hiển thị <span class="font-medium">${start}</span> đến <span class="font-medium">${end}</span> trong tổng số <span class="font-medium">${pagination.total}</span> người dùng
        `;
    }

    const paginationNav = document.querySelector('nav[aria-label="Pagination"]');
    if (paginationNav) {
        const pages = [];
        const maxPages = 5;
        let startPage = Math.max(1, pagination.page - Math.floor(maxPages / 2));
        let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

        if (endPage - startPage + 1 < maxPages) {
            startPage = Math.max(1, endPage - maxPages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        paginationNav.innerHTML = `
            <a onclick="changePage(${pagination.page - 1})" 
               class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 ${pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}">
                <span class="sr-only">Previous</span>
                <span class="material-symbols-outlined text-sm">chevron_left</span>
            </a>
            ${pages.map(p => `
                <a onclick="changePage(${p})" 
                   class="${p === pagination.page 
                       ? 'z-10 bg-blue-50 dark:bg-blue-900/20 border-admin-primary text-admin-primary' 
                       : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'} 
                   relative inline-flex items-center px-4 py-2 border text-sm font-medium cursor-pointer">
                    ${p}
                </a>
            `).join('')}
            <a onclick="changePage(${pagination.page + 1})" 
               class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 ${pagination.page === pagination.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}">
                <span class="sr-only">Next</span>
                <span class="material-symbols-outlined text-sm">chevron_right</span>
            </a>
        `;
    }
}

/**
 * Change page
 */
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    loadUsers(currentPage, currentRole, currentSearch);
}

/**
 * Lock user account
 */
async function lockUser(userId) {
    if (!confirm('Bạn có chắc chắn muốn khóa tài khoản này?')) {
        return;
    }

    try {
        showLoading();
        await apiRequest(`/api/admin/users/${userId}/lock`, {
            method: 'PATCH'
        });

        showSuccess('Khóa tài khoản thành công');
        loadUsers(currentPage, currentRole, currentSearch);
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

/**
 * Unlock user account
 */
async function unlockUser(userId) {
    try {
        showLoading();
        await apiRequest(`/api/admin/users/${userId}/unlock`, {
            method: 'PATCH'
        });

        showSuccess('Mở khóa tài khoản thành công');
        loadUsers(currentPage, currentRole, currentSearch);
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

/**
 * Open modal to add new user
 */
function openAddUserModal() {
    document.getElementById('modalTitle').textContent = 'Thêm người dùng mới';
    document.getElementById('submitButtonText').textContent = 'Thêm người dùng';
    document.getElementById('userId').value = '';
    document.getElementById('userForm').reset();
    document.getElementById('password').required = true;
    document.getElementById('passwordField').querySelector('p').style.display = 'none';
    document.getElementById('userModal').classList.remove('hidden');
}

/**
 * Open modal to edit user
 */
async function editUser(userId) {
    try {
        showLoading();
        const data = await apiRequest(`/api/admin/users/${userId}`);
        const user = data.data;

        document.getElementById('modalTitle').textContent = 'Chỉnh sửa người dùng';
        document.getElementById('submitButtonText').textContent = 'Cập nhật';
        document.getElementById('userId').value = user._id;
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('email').value = user.email;
        document.getElementById('role').value = user.role;
        document.getElementById('password').value = '';
        document.getElementById('password').required = false;
        document.getElementById('passwordField').querySelector('p').style.display = 'block';
        
        document.getElementById('userModal').classList.remove('hidden');
        hideLoading();
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

/**
 * Close user modal
 */
function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userForm').reset();
    
    // Reload users data to refresh the table
    console.log('Modal closed, reloading users...');
    loadUsers(currentPage, currentRole, currentSearch);
}

/**
 * Handle form submission
 */
async function handleUserFormSubmit(event) {
    event.preventDefault();
    
    const userId = document.getElementById('userId').value;
    const formData = {
        fullName: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };

    const password = document.getElementById('password').value;
    if (password) {
        formData.password = password;
    }

    try {
        showLoading();

        if (userId) {
            // Update existing user
            await apiRequest(`/api/admin/users/${userId}`, {
                method: 'PUT',
                body: JSON.stringify(formData)
            });
            showSuccess('Cập nhật người dùng thành công');
        } else {
            // Create new user
            if (!password) {
                showError('Vui lòng nhập mật khẩu');
                hideLoading();
                return;
            }
            await apiRequest('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showSuccess('Thêm người dùng thành công');
        }

        closeUserModal();
        loadUsers(currentPage, currentRole, currentSearch);
    } catch (error) {
        showError(error.message);
        hideLoading();
    }
}

/**
 * Show loading indicator
 */
function showLoading() {
    const tbody = document.querySelector('tbody');
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="px-6 py-8 text-center">
                    <div class="flex justify-center items-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                </td>
            </tr>
        `;
    }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    // Loading is replaced by actual content
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.getElementById('toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
    }`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined">${type === 'success' ? 'check_circle' : 'error'}</span>
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);

    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/**
 * Show success message
 */
function showSuccess(message) {
    showToast(message, 'success');
}

/**
 * Show error message
 */
function showError(message) {
    showToast(message, 'error');
}

/**
 * Initialize page
 */
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!checkAuth()) return;

    // Load initial users
    loadUsers();

    // Setup search
    const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                currentSearch = e.target.value;
                currentPage = 1;
                loadUsers(currentPage, currentRole, currentSearch);
            }, 500);
        });
    }

    // Setup role filter
    const roleSelect = document.querySelector('select');
    if (roleSelect) {
        roleSelect.addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'Tất cả') {
                currentRole = '';
            } else if (value.includes('Admin')) {
                currentRole = 'admin';
            } else if (value.includes('Học sinh')) {
                currentRole = 'student';
            }
            currentPage = 1;
            loadUsers(currentPage, currentRole, currentSearch);
        });
    }

    // Setup add user button
    const addButton = document.querySelector('button[class*="bg-admin-primary"]');
    if (addButton) {
        addButton.addEventListener('click', openAddUserModal);
    }

    // Setup form submission
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', handleUserFormSubmit);
    }

    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeUserModal();
        }
    });

    // Close modal on outside click
    const modal = document.getElementById('userModal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeUserModal();
            }
        });
    }
});
