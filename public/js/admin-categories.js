/**
 * Admin Category & Vocabulary Management
 * Frontend JavaScript for category_ad.html
 */

const API_BASE_URL = window.location.origin;
let currentCategoryId = null;
let currentPage = 1;
let currentSearch = '';
let categories = [];

/**
 * Get auth token
 */
function getAuthToken() {
    return localStorage.getItem('authToken');
}

/**
 * Check authentication
 */
function checkAuth() {
    const token = getAuthToken();
    console.log('Checking auth...', { hasToken: !!token });
    
    if (!token) {
        console.error('No auth token, redirecting to login');
        alert('Vui lòng đăng nhập để tiếp tục');
        window.location.href = '/login_screen.html';
        return false;
    }

    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('Token payload:', { userId: payload.userId, role: payload.role });
        
        if (payload.role !== 'admin') {
            alert('Bạn không có quyền truy cập trang này');
            window.location.href = '/user/home.html';
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Invalid token:', error);
        localStorage.removeItem('authToken');
        window.location.href = '/login_screen.html';
        return false;
    }
}

/**
 * Make API request
 */
async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('API Request:', { url, method: options.method || 'GET' });

    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers
        }
    });

    console.log('API Response:', { status: response.status });

    const data = await response.json();

    if (!response.ok) {
        const errorMessage = data.error?.message || data.message || 'Có lỗi xảy ra';
        console.error('API Error:', data);
        throw new Error(errorMessage);
    }

    return data;
}

/**
 * Load categories
 */
async function loadCategories(search = '') {
    try {
        console.log('Loading categories...', { search });
        
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('limit', '100');

        const data = await apiRequest(`/api/admin/categories?${params.toString()}`);
        console.log('Categories loaded:', data.data.categories.length);

        categories = data.data.categories;
        renderCategories(categories);
        
        // Select first category if exists
        if (categories.length > 0 && !currentCategoryId) {
            selectCategory(categories[0]._id);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
        showError(error.message);
    }
}

/**
 * Render categories list
 */
function renderCategories(cats) {
    const container = document.querySelector('.flex-1.overflow-y-auto.custom-scrollbar');
    if (!container) return;

    if (cats.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <span class="material-symbols-outlined text-4xl mb-2">folder_off</span>
                <p>Không có danh mục nào</p>
            </div>
        `;
        return;
    }

    container.innerHTML = cats.map(cat => {
        const isActive = cat._id === currentCategoryId;
        return `
            <div
                onclick="selectCategory('${cat._id}')"
                class="group flex items-center justify-between p-3 rounded-xl ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'} cursor-pointer transition-all">
                <div class="flex items-center gap-3 flex-1 min-w-0">
                    <span class="material-symbols-outlined ${isActive ? 'text-primary' : 'text-gray-400'}"
                        style="${isActive ? 'font-variation-settings: \'FILL\' 1' : ''}">${cat.icon || 'folder'}</span>
                    <div class="flex-1 min-w-0">
                        <p class="font-bold ${isActive ? 'text-primary' : 'text-gray-700 dark:text-gray-300'} text-sm truncate">${cat.name}</p>
                        <p class="text-xs text-gray-500">${cat.vocabularyCount || 0} từ vựng</p>
                    </div>
                </div>
                <div class="flex gap-1">
                    <button onclick="editCategory(event, '${cat._id}')" 
                        class="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Sửa">
                        <span class="material-symbols-outlined text-sm">edit</span>
                    </button>
                    <button onclick="deleteCategory(event, '${cat._id}')" 
                        class="p-1 hover:bg-red-100 hover:text-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Xóa">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Select category
 */
async function selectCategory(categoryId) {
    console.log('Selecting category:', categoryId);
    currentCategoryId = categoryId;
    currentPage = 1;
    
    const category = categories.find(c => c._id === categoryId);
    if (!category) return;

    // Update header
    document.querySelector('.bg-white.dark\\:bg-sidebar-dark.rounded-t-2xl h2').textContent = category.name;
    
    // Reload categories to update active state
    renderCategories(categories);
    
    // Load vocabulary for this category
    await loadVocabulary();
}

/**
 * Load vocabulary for selected category
 */
async function loadVocabulary(page = 1, search = '') {
    if (!currentCategoryId) {
        updateVocabularyTable([]);
        return;
    }

    try {
        console.log('Loading vocabulary...', { categoryId: currentCategoryId, page, search });
        showVocabularyLoading();

        const params = new URLSearchParams({
            categoryId: currentCategoryId,
            page: page.toString(),
            limit: '20'
        });
        
        if (search) params.append('search', search);

        const data = await apiRequest(`/api/admin/vocabulary?${params.toString()}`);
        console.log('Vocabulary loaded:', data.data.vocabulary.length);

        updateVocabularyTable(data.data.vocabulary);
        updateVocabularyPagination(data.data.pagination);
    } catch (error) {
        console.error('Error loading vocabulary:', error);
        showError(error.message);
    }
}

/**
 * Show vocabulary loading
 */
function showVocabularyLoading() {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="px-6 py-8 text-center">
                <div class="flex justify-center items-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
            </td>
        </tr>
    `;
}

/**
 * Update vocabulary table
 */
function updateVocabularyTable(vocabulary) {
    const tbody = document.querySelector('tbody');
    if (!tbody) return;

    if (vocabulary.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="px-6 py-8 text-center text-gray-500">
                    <span class="material-symbols-outlined text-4xl mb-2">description_off</span>
                    <p>Chưa có từ vựng nào</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = vocabulary.map(vocab => `
        <tr class="hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-colors">
            <td class="px-4 py-3">
                ${vocab.imageUrl ? `
                    <img src="${vocab.imageUrl}" alt="${vocab.traditional}" 
                        class="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div style="display:none;" class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-gray-400 text-sm">image_not_supported</span>
                    </div>
                ` : `
                    <div class="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                        <span class="material-symbols-outlined text-gray-400 text-sm">image</span>
                    </div>
                `}
            </td>
            <td class="px-4 py-3">
                <span class="font-bold text-lg text-primary">${vocab.traditional}</span>
            </td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400">${vocab.simplified || vocab.traditional}</td>
            <td class="px-4 py-3 text-gray-600 dark:text-gray-400">${vocab.pinyin}</td>
            <td class="px-4 py-3">${vocab.meaning}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 text-xs rounded-full ${getDifficultyClass(vocab.difficulty)}">
                    ${getDifficultyText(vocab.difficulty)}
                </span>
            </td>
            <td class="px-4 py-3 text-right">
                <div class="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="editVocabulary('${vocab._id}')" 
                        class="p-1.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="Chỉnh sửa">
                        <span class="material-symbols-outlined text-lg">edit</span>
                    </button>
                    <button onclick="deleteVocabulary('${vocab._id}')" 
                        class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa">
                        <span class="material-symbols-outlined text-lg">delete</span>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

/**
 * Update vocabulary pagination
 */
function updateVocabularyPagination(pagination) {
    const infoSpan = document.querySelector('.text-sm.text-gray-500');
    if (infoSpan) {
        const start = (pagination.page - 1) * pagination.limit + 1;
        const end = Math.min(pagination.page * pagination.limit, pagination.total);
        infoSpan.innerHTML = `Hiển thị <span class="font-bold text-gray-900 dark:text-white">${start}-${end}</span> của <span class="font-bold text-gray-900 dark:text-white">${pagination.total}</span> từ vựng`;
    }

    // Select pagination container in table footer, not sidebar
    const paginationContainer = document.querySelector('.border-t.border-gray-200 .flex.gap-2');
    if (!paginationContainer) return;

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

    paginationContainer.innerHTML = `
        <button 
            onclick="changeVocabPage(${pagination.page - 1})"
            class="px-3 py-1 text-sm rounded-lg border ${pagination.page === 1 ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}"
            ${pagination.page === 1 ? 'disabled' : ''}>Trước</button>
        ${pages.map(p => `
            <button 
                onclick="changeVocabPage(${p})"
                class="px-3 py-1 text-sm rounded-lg ${p === pagination.page ? 'bg-primary text-white font-bold' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}">
                ${p}
            </button>
        `).join('')}
        <button 
            onclick="changeVocabPage(${pagination.page + 1})"
            class="px-3 py-1 text-sm rounded-lg border ${pagination.page === pagination.totalPages ? 'border-gray-200 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}"
            ${pagination.page === pagination.totalPages ? 'disabled' : ''}>Sau</button>
    `;
}

/**
 * Change vocabulary page
 */
function changeVocabPage(page) {
    currentPage = page;
    loadVocabulary(page, currentSearch);
}

/**
 * Get difficulty class
 */
function getDifficultyClass(difficulty) {
    const classes = {
        'beginner': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        'intermediate': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        'advanced': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
        'native': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return classes[difficulty] || classes['beginner'];
}

/**
 * Get difficulty text
 */
function getDifficultyText(difficulty) {
    const texts = {
        'beginner': 'Cơ bản',
        'intermediate': 'Trung cấp',
        'advanced': 'Nâng cao',
        'native': 'Bản ngữ'
    };
    return texts[difficulty] || 'Cơ bản';
}

/**
 * Show category modal
 */
function showCategoryModal(categoryId = null) {
    const category = categoryId ? categories.find(c => c._id === categoryId) : null;
    const isEdit = !!category;

    const modalHTML = `
        <div id="categoryModal" class="fixed inset-0 z-50 flex justify-start bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div class="w-full max-w-2xl bg-white dark:bg-sidebar-dark h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-r border-gray-200 dark:border-gray-700 animate-slideInLeft">
                <!-- Header -->
                <div class="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-20">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined text-2xl">folder</span>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">${isEdit ? 'Chỉnh sửa danh mục' : 'Tạo danh mục mới'}</h2>
                    </div>
                    <button onclick="closeCategoryModal()" 
                        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                        <span class="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-2 text-primary font-bold uppercase text-sm tracking-wide">
                            <span class="material-symbols-outlined text-base">edit_note</span>
                            <span>Thông tin danh mục</span>
                        </div>
                    </div>

                    <form id="categoryForm" class="space-y-6">
                        <!-- Tên danh mục -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tên danh mục *</label>
                            <div class="relative">
                                <input type="text" name="name" value="${category?.name || ''}" required
                                    maxlength="100"
                                    oninput="this.nextElementSibling.textContent=this.value.length+'/100'"
                                    class="w-full bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:ring-2 focus:ring-primary rounded-xl px-4 py-4 text-lg font-bold text-gray-800 dark:text-gray-100 shadow-sm transition-all outline-none"
                                    placeholder="Nhập tên danh mục">
                                <span class="absolute right-4 bottom-4 text-xs text-gray-400 dark:text-gray-500 font-medium">${(category?.name || '').length}/100</span>
                            </div>
                        </div>

                        <!-- Mô tả -->
                        <div class="space-y-2">
                            <label class="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Mô tả</label>
                            <div class="relative">
                                <textarea name="description" rows="3"
                                    maxlength="300"
                                    oninput="this.nextElementSibling.textContent=this.value.length+'/300'"
                                    class="w-full bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 font-medium shadow-sm transition-all resize-none outline-none"
                                    placeholder="Nhập mô tả chi tiết cho danh mục">${category?.description || ''}</textarea>
                                <span class="absolute right-3 bottom-3 text-xs text-gray-400 dark:text-gray-500 font-medium">${(category?.description || '').length}/300</span>
                            </div>
                        </div>

                        <!-- Grid layout -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Độ khó -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Độ khó</label>
                                <select name="difficulty"
                                    class="w-full bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 font-medium shadow-sm transition-all outline-none">
                                    <option value="beginner" ${category?.difficulty === 'beginner' ? 'selected' : ''}>🟢 Cơ bản</option>
                                    <option value="intermediate" ${category?.difficulty === 'intermediate' ? 'selected' : ''}>🟡 Trung cấp</option>
                                    <option value="advanced" ${category?.difficulty === 'advanced' ? 'selected' : ''}>🟠 Nâng cao</option>
                                    <option value="native" ${category?.difficulty === 'native' ? 'selected' : ''}>🔴 Bản ngữ</option>
                                </select>
                            </div>

                            <!-- Icon -->
                            <div class="space-y-2">
                                <label class="block text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Icon</label>
                                <input type="text" name="icon" value="${category?.icon || 'folder'}" 
                                    class="w-full bg-gray-50 dark:bg-gray-800 border-transparent focus:border-primary focus:ring-2 focus:ring-primary rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 font-medium shadow-sm transition-all outline-none"
                                    placeholder="folder">
                                <p class="text-xs text-gray-400 dark:text-gray-500 italic mt-1 pl-1">
                                    <span class="material-symbols-outlined text-[14px] align-middle mr-1 text-blue-500">info</span>
                                    Material Symbols icon name
                                </p>
                            </div>
                        </div>

                        ${!isEdit ? `
                        <!-- User ID (only for create) -->
                        <div class="space-y-2 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                            <label class="block text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Người sở hữu (User ID) *</label>
                            <input type="text" name="userId" required
                                class="w-full bg-white dark:bg-gray-800 border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-xl px-4 py-3 text-gray-800 dark:text-gray-100 font-mono shadow-sm transition-all outline-none"
                                placeholder="ObjectId của người dùng">
                            <p class="text-xs text-blue-600 dark:text-blue-400 italic mt-1 pl-1">
                                <span class="material-symbols-outlined text-[14px] align-middle mr-1">admin_panel_settings</span>
                                Chỉ admin mới có thể tạo danh mục công khai
                            </p>
                        </div>
                        ` : ''}

                        <!-- Toggle công khai -->
                        <div class="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            <div class="relative inline-block w-12 mr-2 align-middle select-none transition duration-200 ease-in">
                                <input type="checkbox" name="isPrivate" id="isPrivate" 
                                    ${category?.isPrivate ? '' : 'checked'}
                                    class="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 checked:border-primary transition-all duration-300 top-0 left-0 border-gray-300" />
                                <label for="isPrivate"
                                    class="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer dark:bg-gray-600"></label>
                            </div>
                            <label for="isPrivate" class="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                Công khai (Hiển thị cho tất cả người dùng)
                            </label>
                        </div>
                    </form>
                    <div class="h-20"></div>
                </div>

                <!-- Footer -->
                <div class="px-8 py-6 border-t border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky bottom-0 z-20 flex justify-end gap-4">
                    <button onclick="closeCategoryModal()" 
                        class="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                        Hủy bỏ
                    </button>
                    <button onclick="${isEdit ? `submitCategoryEdit('${categoryId}')` : 'submitCategoryCreate()'}" 
                        class="px-8 py-3 rounded-xl font-bold text-white bg-primary hover:bg-green-600 shadow-lg shadow-primary/30 transform hover:-translate-y-0.5 transition-all">
                        ${isEdit ? '💾 Lưu thay đổi' : '✨ Tạo mới'}
                    </button>
                </div>
            </div>
        </div>
        <style>
            .toggle-checkbox:checked { right: 0; border-color: #4ce64c; }
            .toggle-checkbox:checked + .toggle-label { background-color: #BBF7D0; }
            .dark .toggle-checkbox:checked + .toggle-label { background-color: #166534; }
            .toggle-checkbox { right: 50%; }
            @keyframes slideInLeft {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
            .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeCategoryModal() {
    const modal = document.getElementById('categoryModal');
    if (modal) modal.remove();
}

async function submitCategoryCreate() {
    const form = document.getElementById('categoryForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        await apiRequest('/api/admin/categories', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        showSuccess('Tạo danh mục thành công');
        closeCategoryModal();
        await loadCategories();
    } catch (error) {
        showError(error.message);
    }
}

async function submitCategoryEdit(categoryId) {
    const form = document.getElementById('categoryForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    try {
        await apiRequest(`/api/admin/categories/${categoryId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        showSuccess('Cập nhật danh mục thành công');
        closeCategoryModal();
        await loadCategories();
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Edit category
 */
function editCategory(event, categoryId) {
    event.stopPropagation();
    showCategoryModal(categoryId);
}

/**
 * Delete category
 */
async function deleteCategory(event, categoryId) {
    event.stopPropagation();
    
    const category = categories.find(c => c._id === categoryId);
    if (!category) return;

    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
        return;
    }

    try {
        await apiRequest(`/api/admin/categories/${categoryId}`, {
            method: 'DELETE'
        });

        showSuccess('Xóa danh mục thành công');
        
        // Reload categories
        if (currentCategoryId === categoryId) {
            currentCategoryId = null;
        }
        await loadCategories();
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Show vocabulary modal
 */
function showVocabularyModal(vocabularyId = null) {
    if (!currentCategoryId && !vocabularyId) {
        showError('Vui lòng chọn danh mục trước');
        return;
    }

    // For edit mode, we need to fetch the vocabulary details
    if (vocabularyId) {
        fetchAndShowVocabularyModal(vocabularyId);
    } else {
        renderVocabularyModal(null);
    }
}

async function fetchAndShowVocabularyModal(vocabularyId) {
    try {
        const data = await apiRequest(`/api/admin/vocabulary/${vocabularyId}`);
        renderVocabularyModal(data.data);
    } catch (error) {
        showError(error.message);
    }
}

function renderVocabularyModal(vocabulary = null) {
    const isEdit = !!vocabulary;

    const modalHTML = `
        <div id="vocabularyModal" class="fixed inset-0 z-50 flex justify-end bg-black/20 dark:bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div class="w-full max-w-3xl bg-white dark:bg-sidebar-dark h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-200 dark:border-gray-700 animate-slideInRight">
                <!-- Header -->
                <div class="flex items-center justify-between px-8 py-6 border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-20">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <span class="material-symbols-outlined text-2xl">translate</span>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-800 dark:text-white">${isEdit ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}</h2>
                    </div>
                    <button onclick="closeVocabularyModal()" 
                        class="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400">
                        <span class="material-symbols-outlined text-2xl">close</span>
                    </button>
                </div>

                <!-- Content -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div class="flex items-center justify-between mb-6">
                        <div class="flex items-center gap-2 text-primary font-bold uppercase text-sm tracking-wide">
                            <span class="material-symbols-outlined text-base">edit_note</span>
                            <span>Thông tin từ vựng</span>
                        </div>
                    </div>

                    <form id="vocabularyForm" class="space-y-8 px-6 pb-24">
                    ${!isEdit ? `
                    <div class="space-y-2">
                        <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                            <span class="material-symbols-outlined text-sm align-middle mr-1">category</span>
                            Danh mục *
                        </label>
                        <select name="categoryId" required
                            class="w-full px-5 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-base font-medium transition-all shadow-sm hover:shadow-md">
                            ${categories.map(cat => `
                                <option value="${cat._id}" ${cat._id === currentCategoryId ? 'selected' : ''}>${cat.name}</option>
                            `).join('')}
                        </select>
                    </div>
                    ` : ''}
                    
                    <!-- Chinese Characters Section -->
                    <div class="space-y-4">
                        <div class="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
                            <span class="material-symbols-outlined text-primary">translate</span>
                            <span class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">Ký tự Trung Quốc</span>
                        </div>
                        <div class="grid grid-cols-2 gap-5">
                            <div class="space-y-2">
                                <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Chữ phồn thể *
                                </label>
                                <div class="relative">
                                    <input type="text" name="traditional" value="${vocabulary?.traditional || ''}" required
                                        maxlength="10"
                                        onInput="this.nextElementSibling.textContent = this.value.length + '/10'"
                                        class="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-2xl text-center font-bold transition-all shadow-sm hover:shadow-md"
                                        placeholder="繁體">
                                    <div class="absolute -bottom-5 right-2 text-xs text-gray-400 font-medium">${(vocabulary?.traditional || '').length || 0}/10</div>
                                </div>
                            </div>
                            <div class="space-y-2">
                                <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                    Chữ giản thể
                                </label>
                                <div class="relative">
                                    <input type="text" name="simplified" value="${vocabulary?.simplified || ''}" 
                                        maxlength="10"
                                        onInput="this.nextElementSibling.textContent = this.value.length + '/10'"
                                        class="w-full px-5 py-4 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-2xl text-center font-bold transition-all shadow-sm hover:shadow-md"
                                        placeholder="简体">
                                    <div class="absolute -bottom-5 right-2 text-xs text-gray-400 font-medium">${(vocabulary?.simplified || '').length || 0}/10</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Pinyin & Meaning Section -->
                    <div class="space-y-5">
                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm align-middle mr-1">record_voice_over</span>
                                Phiên âm (Pinyin) *
                            </label>
                            <div class="relative">
                                <input type="text" name="pinyin" value="${vocabulary?.pinyin || ''}" required
                                    maxlength="50"
                                    onInput="this.nextElementSibling.textContent = this.value.length + '/50'"
                                    class="w-full px-5 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 font-mono text-base transition-all shadow-sm hover:shadow-md"
                                    placeholder="Nǐ hǎo">
                                <div class="absolute -bottom-5 right-2 text-xs text-gray-400 font-medium">${(vocabulary?.pinyin || '').length || 0}/50</div>
                            </div>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm align-middle mr-1">language</span>
                                Nghĩa tiếng Việt *
                            </label>
                            <div class="relative">
                                <input type="text" name="meaning" value="${vocabulary?.meaning || ''}" required
                                    maxlength="100"
                                    onInput="this.nextElementSibling.textContent = this.value.length + '/100'"
                                    class="w-full px-5 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-base transition-all shadow-sm hover:shadow-md"
                                    placeholder="Xin chào">
                                <div class="absolute -bottom-5 right-2 text-xs text-gray-400 font-medium">${(vocabulary?.meaning || '').length || 0}/100</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Difficulty & Example Section -->
                    <div class="space-y-5">
                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm align-middle mr-1">signal_cellular_alt</span>
                                Độ khó
                            </label>
                            <select name="difficulty"
                                class="w-full px-5 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-base font-medium transition-all shadow-sm hover:shadow-md">
                                <option value="beginner" ${vocabulary?.difficulty === 'beginner' ? 'selected' : ''}>🟢 Cơ bản</option>
                                <option value="intermediate" ${vocabulary?.difficulty === 'intermediate' ? 'selected' : ''}>🟡 Trung cấp</option>
                                <option value="advanced" ${vocabulary?.difficulty === 'advanced' ? 'selected' : ''}>🟠 Nâng cao</option>
                                <option value="native" ${vocabulary?.difficulty === 'native' ? 'selected' : ''}>🔴 Bản ngữ</option>
                            </select>
                        </div>
                        <div class="space-y-2">
                            <label class="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                <span class="material-symbols-outlined text-sm align-middle mr-1">description</span>
                                Ví dụ
                            </label>
                            <div class="relative">
                                <textarea name="example" rows="3"
                                    maxlength="200"
                                    onInput="this.nextElementSibling.textContent = this.value.length + '/200'"
                                    class="w-full px-5 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-gray-800 text-base transition-all shadow-sm hover:shadow-md resize-none"
                                    placeholder="Câu ví dụ sử dụng từ vựng này (tùy chọn)">${vocabulary?.example || ''}</textarea>
                                <div class="absolute -bottom-5 right-2 text-xs text-gray-400 font-medium">${(vocabulary?.example || '').length || 0}/200</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Image Section with Gradient Background -->
                    <div class="space-y-3 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 border-2 border-blue-100 dark:border-gray-600">
                        <label class="flex items-center gap-2 text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            <span class="material-symbols-outlined text-lg text-blue-600 dark:text-blue-400">image</span>
                            Hình ảnh minh họa
                        </label>
                        <div class="relative">
                            <input type="url" name="imageUrl" id="imageUrl" value="${vocabulary?.imageUrl || ''}" 
                                maxlength="500"
                                onInput="previewVocabularyImage(this.value); this.nextElementSibling.textContent = this.value.length + '/500'"
                                class="w-full px-5 py-3.5 border-2 border-blue-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm transition-all"
                                placeholder="https://example.com/image.jpg">
                            <div class="absolute -bottom-5 right-2 text-xs text-gray-500 font-medium">${(vocabulary?.imageUrl || '').length || 0}/500</div>
                        </div>
                        <p class="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 mt-2">
                            <span class="material-symbols-outlined text-sm">info</span>
                            Nhập URL hình ảnh minh họa cho từ vựng
                        </p>
                        ${vocabulary?.imageUrl || '' ? `
                        <div id="imagePreview" class="mt-4 flex justify-center">
                            <div class="relative group">
                                <img src="${vocabulary.imageUrl}" alt="Preview" 
                                    class="w-40 h-40 object-cover rounded-2xl border-4 border-white dark:border-gray-700 shadow-xl group-hover:scale-105 transition-transform duration-300"
                                    onerror="this.parentElement.parentElement.style.display='none'">
                                <div class="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                        </div>
                        ` : '<div id="imagePreview" class="mt-4 hidden"></div>'}
                    </div>
                </form>
                
                <!-- Sticky Footer with Backdrop Blur -->
                <div class="absolute bottom-0 left-0 right-0 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700 flex gap-4 rounded-b-3xl">
                    <button onclick="closeVocabularyModal()" 
                        class="flex-1 px-6 py-3.5 border-2 border-gray-300 dark:border-gray-600 rounded-xl font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02] transition-all duration-200 shadow-sm">
                        <span class="material-symbols-outlined text-sm align-middle mr-1">close</span>
                        Hủy
                    </button>
                    <button onclick="${isEdit ? `submitVocabularyEdit('${vocabulary._id}')` : 'submitVocabularyCreate()'}" 
                        class="flex-1 px-6 py-3.5 bg-gradient-to-r from-primary to-green-600 hover:from-green-600 hover:to-primary text-white rounded-xl font-bold hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl">
                        <span class="material-symbols-outlined text-sm align-middle mr-1">${isEdit ? 'check' : 'add'}</span>
                        ${isEdit ? 'Cập nhật' : 'Thêm mới'}
                    </button>
                </div>
            </div>
        </div>
        <style>
            @keyframes slideInLeft {
                from { transform: translateX(-100%); }
                to { transform: translateX(0); }
            }
            @keyframes slideInRight {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            .animate-slideInLeft { animation: slideInLeft 0.3s ease-out; }
            .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
            .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        </style>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

function closeVocabularyModal() {
    const modal = document.getElementById('vocabularyModal');
    if (modal) modal.remove();
}

/**
 * Preview vocabulary image
 */
function previewVocabularyImage(url) {
    const preview = document.getElementById('imagePreview');
    if (!preview) return;

    if (url && url.trim()) {
        preview.innerHTML = `
            <div class="flex justify-center">
                <div class="relative group">
                    <img src="${url}" alt="Preview" 
                        class="w-40 h-40 object-cover rounded-2xl border-4 border-white dark:border-gray-700 shadow-xl group-hover:scale-105 transition-transform duration-300"
                        onerror="this.parentElement.parentElement.innerHTML='<p class=\\'text-xs text-red-500 text-center\\'>❌ Không thể tải ảnh</p>'">
                    <div class="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </div>
        `;
        preview.classList.remove('hidden');
    } else {
        preview.innerHTML = '';
        preview.classList.add('hidden');
    }
}

async function submitVocabularyCreate() {
    const form = document.getElementById('vocabularyForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Use current category if not specified
    if (!data.categoryId) {
        data.categoryId = currentCategoryId;
    }

    // Debug logging
    console.log('[submitVocabularyCreate] Sending data:', data);

    try {
        await apiRequest('/api/admin/vocabulary', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        showSuccess('Thêm từ vựng thành công');
        closeVocabularyModal();
        await loadVocabulary(currentPage, currentSearch);
        await loadCategories(); // Refresh to update vocabulary count
    } catch (error) {
        showError(error.message);
    }
}

async function submitVocabularyEdit(vocabularyId) {
    const form = document.getElementById('vocabularyForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Debug logging
    console.log('[submitVocabularyEdit] Sending data:', data);

    try {
        await apiRequest(`/api/admin/vocabulary/${vocabularyId}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });

        showSuccess('Cập nhật từ vựng thành công');
        closeVocabularyModal();
        await loadVocabulary(currentPage, currentSearch);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Edit vocabulary
 */
function editVocabulary(vocabularyId) {
    showVocabularyModal(vocabularyId);
}

/**
 * Delete vocabulary
 */
async function deleteVocabulary(vocabularyId) {
    if (!confirm('Bạn có chắc chắn muốn xóa từ vựng này?')) {
        return;
    }

    try {
        await apiRequest(`/api/admin/vocabulary/${vocabularyId}`, {
            method: 'DELETE'
        });

        showSuccess('Xóa từ vựng thành công');
        await loadVocabulary(currentPage, currentSearch);
    } catch (error) {
        showError(error.message);
    }
}

/**
 * Show toast notification
 */
function showToast(message, type = 'success') {
    const existingToast = document.getElementById('toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = `fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transform transition-all duration-300 ${
        type === 'success' ? 'bg-green-500 text-white' : 
        type === 'error' ? 'bg-red-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    toast.innerHTML = `
        <div class="flex items-center gap-3">
            <span class="material-symbols-outlined">${
                type === 'success' ? 'check_circle' : 
                type === 'error' ? 'error' : 
                'info'
            }</span>
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showSuccess(message) {
    showToast(message, 'success');
}

function showError(message) {
    showToast(message, 'error');
}

function showInfo(message) {
    showToast(message, 'info');
}

/**
 * Show filter modal
 */
function showFilterModal() {
    showInfo('Chức năng lọc nâng cao đang được phát triển');
}

/**
 * Initialize
 */
document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuth()) return;

    // Load categories
    loadCategories();

    // Setup category search
    const categorySearch = document.querySelector('.p-3 input[placeholder="Tìm danh mục..."]');
    if (categorySearch) {
        let searchTimeout;
        categorySearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                loadCategories(e.target.value);
            }, 500);
        });
    }

    // Setup vocabulary search
    const vocabSearch = document.querySelector('input[placeholder="Tìm từ vựng..."]');
    if (vocabSearch) {
        let searchTimeout;
        vocabSearch.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            currentSearch = e.target.value;
            searchTimeout = setTimeout(() => {
                currentPage = 1;
                loadVocabulary(currentPage, currentSearch);
            }, 500);
        });
    }

    // Setup add category button (icon button in sidebar)
    const addCategoryBtn = document.querySelector('#addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', () => showCategoryModal());
    }

    // Setup create category button (dashed button at bottom)
    const createCategoryBtn = document.querySelector('#createCategoryBtn');
    if (createCategoryBtn) {
        createCategoryBtn.addEventListener('click', () => showCategoryModal());
    }

    // Setup add vocabulary button in header
    const addVocabBtn = document.querySelector('#addVocabularyBtn');
    if (addVocabBtn) {
        addVocabBtn.addEventListener('click', () => showVocabularyModal());
    }

    // Setup filter button
    const filterBtn = document.querySelector('#filterBtn');
    if (filterBtn) {
        filterBtn.addEventListener('click', showFilterModal);
    }
});
