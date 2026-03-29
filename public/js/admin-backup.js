/**
 * Admin Backup Management
 * Frontend JavaScript for backup_ad.html
 */

const API_BASE_URL = window.location.origin;

/**
 * Get auth token
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error?.message || data.message || 'Có lỗi xảy ra');
    }

    return data;
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date
 */
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleString('vi-VN');
}

/**
 * Format relative time
 */
function formatRelativeTime(date) {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white z-50 ${
        type === 'success' ? 'bg-green-500' : 
        type === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Load backup statistics
 */
async function loadBackupStats() {
    try {
        const data = await apiRequest('/api/backup/stats');
        const stats = data.data;

        // Update statistics cards
        document.querySelector('.stat-card:nth-child(1) h3').textContent = stats.totalBackups || 0;
        document.querySelector('.stat-card:nth-child(2) h3').textContent = formatFileSize(stats.totalSize || 0);
        document.querySelector('.stat-card:nth-child(3) h3').textContent = stats.lastBackup ? formatRelativeTime(stats.lastBackup.createdAt) : 'Chưa có';
        document.querySelector('.stat-card:nth-child(4) h3').textContent = stats.schedule?.enabled ? 
            (stats.schedule.frequency === 'daily' ? 'Hàng ngày' : 
             stats.schedule.frequency === 'weekly' ? 'Hàng tuần' : 'Hàng tháng') : 
            'Tắt';
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

/**
 * Load backups list
 */
let currentPage = 1;
let currentSearch = '';
let currentTypeFilter = '';
let currentStatusFilter = '';

async function loadBackups(page = 1) {
    try {
        currentPage = page;
        
        const params = new URLSearchParams({
            page: page.toString(),
            limit: '10'
        });

        if (currentSearch) params.append('search', currentSearch);
        if (currentTypeFilter) params.append('type', currentTypeFilter);
        if (currentStatusFilter) params.append('status', currentStatusFilter);

        const data = await apiRequest(`/api/backup?${params.toString()}`);
        renderBackupsTable(data.data.backups);
        renderPagination(data.data.pagination);
    } catch (error) {
        console.error('Failed to load backups:', error);
        showToast(error.message, 'error');
    }
}

/**
 * Render backups table
 */
function renderBackupsTable(backups) {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    if (backups.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-slate-500">
                    <span class="material-symbols-outlined text-4xl mb-2">backup</span>
                    <p>Chưa có backup nào</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = backups.map(backup => `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <td class="px-6 py-4">
                <div class="font-medium text-slate-900 dark:text-white">${backup.name}</div>
                <div class="text-sm text-slate-500">${backup.description || ''}</div>
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 text-xs rounded-full ${
                    backup.status === 'completed' ? 'bg-green-100 text-green-700' :
                    backup.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                    backup.status === 'failed' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                }">
                    ${backup.status === 'completed' ? 'Hoàn thành' :
                      backup.status === 'in-progress' ? 'Đang xử lý' :
                      backup.status === 'failed' ? 'Thất bại' : 'Đang chờ'}
                </span>
            </td>
            <td class="px-6 py-4">
                <span class="px-3 py-1 text-xs rounded-full ${
                    backup.type === 'manual' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                }">
                    ${backup.type === 'manual' ? 'Thủ công' : 'Tự động'}
                </span>
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                ${formatFileSize(backup.size || 0)}
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                ${backup.collections?.length || 0} collections
            </td>
            <td class="px-6 py-4 text-slate-600 dark:text-slate-400">
                ${formatDate(backup.createdAt)}
            </td>
            <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2">
                    ${backup.status === 'completed' ? `
                        <button onclick="restoreBackup('${backup._id}')" 
                            class="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Khôi phục">
                            <span class="material-symbols-outlined text-lg">restore</span>
                        </button>
                        <button onclick="downloadBackup('${backup._id}')" 
                            class="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Tải xuống">
                            <span class="material-symbols-outlined text-lg">download</span>
                        </button>
                    ` : ''}
                    <button onclick="deleteBackup('${backup._id}')" 
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Render pagination
 */
function renderPagination(pagination) {
    const infoSpan = document.querySelector('.text-sm.text-slate-500');
    if (infoSpan) {
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        infoSpan.innerHTML = `Hiển thị <span class="font-bold text-slate-900 dark:text-white">${start}-${end}</span> của <span class="font-bold text-slate-900 dark:text-white">${pagination.total}</span> backup`;
    }

    const paginationContainer = document.querySelector('.flex.gap-2');
    if (!paginationContainer) return;

    const pages = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
        if (i === 1 || i === pagination.totalPages || (i >= pagination.page - 1 && i <= pagination.page + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    paginationContainer.innerHTML = `
        <button onclick="loadBackups(${pagination.page - 1})" 
            class="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-card-dark hover:bg-slate-50 disabled:opacity-50"
            ${pagination.page === 1 ? 'disabled' : ''}>
            Trước
        </button>
        ${pages.map(p => p === '...' ? 
            `<span class="px-3 py-1">...</span>` :
            `<button onclick="loadBackups(${p})" 
                class="px-3 py-1 text-sm rounded-lg ${
                    p === pagination.page ? 
                    'bg-primary text-white font-bold' : 
                    'border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-card-dark hover:bg-slate-50'
                }">
                ${p}
            </button>`
        ).join('')}
        <button onclick="loadBackups(${pagination.page + 1})" 
            class="px-3 py-1 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 bg-white dark:bg-card-dark hover:bg-slate-50 disabled:opacity-50"
            ${pagination.page === pagination.totalPages ? 'disabled' : ''}>
            Sau
        </button>
    `;
}

/**
 * Create new backup
 */
async function createBackup() {
    const name = prompt('Nhập tên backup:');
    if (!name) return;

    const description = prompt('Mô tả (tùy chọn):');

    try {
        showToast('Đang tạo backup...', 'info');
        
        await apiRequest('/api/backup/create', {
            method: 'POST',
            body: JSON.stringify({ name, description })
        });

        showToast('Backup đang được tạo, vui lòng đợi...', 'success');
        
        // Reload after a delay
        setTimeout(() => {
            loadBackups(currentPage);
            loadBackupStats();
        }, 2000);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/**
 * Restore backup
 */
async function restoreBackup(backupId) {
    const confirm = prompt('⚠️ CẢNH BÁO: Khôi phục sẽ ghi đè toàn bộ dữ liệu hiện tại!\n\nNhập "RESTORE" để xác nhận:');
    
    if (confirm !== 'RESTORE') {
        alert('Đã hủy khôi phục');
        return;
    }

    const password = prompt('Nhập mật khẩu admin để xác nhận:');
    if (!password) return;

    try {
        showToast('Đang khôi phục dữ liệu...', 'info');
        
        await apiRequest(`/api/backup/restore/${backupId}`, {
            method: 'POST',
            body: JSON.stringify({ confirmPassword: password })
        });

        showToast('Đang khôi phục, hệ thống có thể tạm dừng...', 'success');
        
        // Reload after delay
        setTimeout(() => {
            location.reload();
        }, 3000);
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/**
 * Download backup
 */
async function downloadBackup(backupId) {
    try {
        const token = getAuthToken();
        window.open(`${API_BASE_URL}/api/backup/${backupId}/download?token=${token}`, '_blank');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/**
 * Delete backup
 */
async function deleteBackup(backupId) {
    if (!confirm('Bạn có chắc chắn muốn xóa backup này?')) return;

    try {
        await apiRequest(`/api/backup/${backupId}`, {
            method: 'DELETE'
        });

        showToast(' Xóa backup thành công', 'success');
        loadBackups(currentPage);
        loadBackupStats();
    } catch (error) {
        showToast(error.message, 'error');
    }
}

/**
 * Load backup schedule
 */
async function loadBackupSchedule() {
    try {
        const data = await apiRequest('/api/backup/schedule/config');
        const config = data.data;

        // Update toggle
        const toggle = document.querySelector('input[type="checkbox"]');
        if (toggle) toggle.checked = config.enabled || false;

        // Update config display (if available)
        console.log('Backup schedule:', config);
    } catch (error) {
        console.error('Failed to load schedule:', error);
    }
}

/**
 * Update backup schedule
 */
async function updateBackupSchedule() {
    // This would open a modal or form to configure schedule
    showToast('Chức năng cấu hình lịch tự động đang được phát triển', 'info');
}

/**
 * Search backups
 */
let searchTimeout;
function searchBackups(query) {
    clearTimeout(searchTimeout);
    currentSearch = query;
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        loadBackups(1);
    }, 500);
}

/**
 * Filter by type
 */
function filterByType(type) {
    currentTypeFilter = type;
    currentPage = 1;
    loadBackups(1);
}

/**
 * Filter by status
 */
function filterByStatus(status) {
    currentStatusFilter = status;
    currentPage = 1;
    loadBackups(1);
}

/**
 * Initialize
 */
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    loadBackupStats();
    loadBackups(1);
    loadBackupSchedule();

    // Setup search
    const searchInput = document.querySelector('input[placeholder*="Tìm kiếm"]');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => searchBackups(e.target.value));
    }

    // Setup create backup button
    const createBtns = document.querySelectorAll('button');
    createBtns.forEach(btn => {
        if (btn.textContent.includes('Tạo Backup mới') || btn.textContent.includes('Sao lưu Thủ công')) {
            btn.addEventListener('click', createBackup);
        }
    });

    // Auto refresh every 30 seconds
    setInterval(() => {
        loadBackups(currentPage);
        loadBackupStats();
    }, 30000);
});
