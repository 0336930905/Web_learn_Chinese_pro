// Sidebar Component - Shared across all pages
function renderSidebar(activePage = 'home', profileData = null) {
    // Check if i18n is available, otherwise use defaults
    const t = (key, fallback) => {
        if (typeof i18n !== 'undefined') {
            return i18n.t(key, fallback);
        }
        return fallback;
    };

    // Default profile data
    const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=4ce64c&color=fff&size=128';
    const fullName = profileData?.fullName || t('common.user', 'Người dùng');
    const avatar = profileData?.avatar || defaultAvatar;
    const level = profileData?.levelInfo?.level || 1;
    const levelProgress = profileData?.levelInfo?.levelProgress || 0;
    
    const sidebarHTML = `
        <!-- Mobile Menu Button -->
        <button id="mobile-menu-toggle" class="md:hidden fixed top-4 left-4 z-50 size-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all">
            <span class="material-symbols-outlined">menu</span>
        </button>
        
        <!-- Mobile Overlay -->
        <div id="sidebar-overlay" class="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-30 opacity-0 pointer-events-none transition-opacity duration-300"></div>
        
        <!-- Sidebar -->
        <aside id="sidebar" class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-40 transition-transform duration-300 -translate-x-full md:translate-x-0">
            <div class="p-6 flex items-center gap-3">
                <div class="bg-primary p-2 rounded-lg">
                    <span class="material-symbols-outlined text-white">menu_book</span>
                </div>
                <h1 class="font-bold text-xl tracking-tight text-slate-900 dark:text-white">${t('sidebar.appName', 'VocabHero')}</h1>
                <!-- Mobile Close Button -->
                <button id="mobile-menu-close" class="md:hidden ml-auto size-8 flex items-center justify-center text-slate-500 hover:text-primary transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>
            <nav class="flex-1 px-4 space-y-2 mt-4">
                <a class="flex items-center gap-3 px-4 py-3 rounded-full ${activePage === 'home' ? 'bg-primary/20 text-slate-900 dark:text-white active-fill' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'}"
                    href="home.html">
                    <span class="material-symbols-outlined ${activePage === 'home' ? 'text-primary' : ''}">home</span>
                    <span class="${activePage === 'home' ? 'font-semibold' : 'font-medium'}">${t('sidebar.home', 'Trang chủ')}</span>
                </a>
                <a class="flex items-center gap-3 px-4 py-3 rounded-full ${activePage === 'categories' ? 'bg-primary/20 text-slate-900 dark:text-white active-fill' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'}"
                    href="personal_vocabulary_categories_screen.html">
                    <span class="material-symbols-outlined ${activePage === 'categories' ? 'text-primary' : ''}">grid_view</span>
                    <span class="${activePage === 'categories' ? 'font-semibold' : 'font-medium'}">${t('sidebar.categories', 'Danh mục')}</span>
                </a>
                <a class="flex items-center gap-3 px-4 py-3 rounded-full ${activePage === 'games' ? 'bg-primary/20 text-slate-900 dark:text-white active-fill' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'}"
                    href="games_home.html">
                    <span class="material-symbols-outlined ${activePage === 'games' ? 'text-primary' : ''}">sports_esports</span>
                    <span class="${activePage === 'games' ? 'font-semibold' : 'font-medium'}">${t('sidebar.games', 'Trò chơi')}</span>
                </a>
                <a class="flex items-center gap-3 px-4 py-3 rounded-full ${activePage === 'achievements' ? 'bg-primary/20 text-slate-900 dark:text-white active-fill' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors'}"
                    href="achievements.html">
                    <span class="material-symbols-outlined ${activePage === 'achievements' ? 'text-primary' : ''}">emoji_events</span>
                    <span class="${activePage === 'achievements' ? 'font-semibold' : 'font-medium'}">${t('sidebar.achievements', 'Thành tích')}</span>
                </a>
            </nav>
            <div class="p-6 border-t border-slate-100 dark:border-slate-800">
                <div class="bg-background-light dark:bg-slate-800 p-4 rounded-xl">
                    <div class="flex items-center gap-3 mb-3">
                        <div class="size-12 rounded-full border-4 border-primary overflow-hidden shadow-sm flex-shrink-0 bg-slate-100">
                            <img alt="User Avatar" class="w-full h-full object-cover" 
                                src="${avatar}" 
                                onerror="this.src='${defaultAvatar}'" />
                        </div>
                        <div class="overflow-hidden">
                            <p class="font-bold text-sm truncate text-slate-900 dark:text-white" title="${fullName}">${fullName}</p>
                            <div class="flex items-center gap-1">
                                <span class="material-symbols-outlined text-xs text-yellow-500"
                                    style="font-variation-settings: 'FILL' 1">stars</span>
                                <span class="text-xs font-bold text-slate-500">${t('sidebar.level', 'Cấp độ')} ${level}</span>
                            </div>
                        </div>
                    </div>
                    <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden mb-3">
                        <div class="bg-primary h-full transition-all duration-500" style="width: ${levelProgress}%"></div>
                    </div>
                    <div class="flex gap-2">
                        <a href="setting.html"
                            class="flex-1 py-2 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform shadow-sm">
                            <span class="material-symbols-outlined text-slate-600 dark:text-slate-300">settings</span>
                        </a>
                        <button onclick="handleLogout()"
                            class="flex-1 py-2 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-700 hover:scale-105 transition-transform shadow-sm">
                            <span class="material-symbols-outlined text-red-500">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    `;
    
    return sidebarHTML;
}

// Mobile Menu Toggle
function initMobileMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const closeBtn = document.getElementById('mobile-menu-close');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    
    if (!toggleBtn || !sidebar || !overlay) return;
    
    function openSidebar() {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('opacity-0', 'pointer-events-none');
        overlay.classList.add('opacity-100');
        document.body.style.overflow = 'hidden';
    }
    
    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0', 'pointer-events-none');
        overlay.classList.remove('opacity-100');
        document.body.style.overflow = '';
    }
    
    toggleBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    overlay.addEventListener('click', closeSidebar);
    
    // Close sidebar when clicking nav links on mobile
    document.querySelectorAll('#sidebar a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 768) {
                closeSidebar();
            }
        });
    });
}

// Handle logout
function handleLogout() {
    const confirmMsg = typeof i18n !== 'undefined' 
        ? i18n.t('sidebar.logoutConfirm', 'Bạn có chắc muốn đăng xuất?')
        : 'Bạn có chắc muốn đăng xuất?';
    
    if (confirm(confirmMsg)) {
        // Clear any stored tokens or user data
        localStorage.clear();
        sessionStorage.clear();
        // Redirect to login page
        window.location.href = '/login_screen.html';
    }
}

// Chatbot Component
function initializeChatbot() {
    const t = (key, fallback) => {
        if (typeof i18n !== 'undefined') {
            return i18n.t(key, fallback);
        }
        return fallback;
    };

    const chatbotHTML = `
        <!-- Chatbot Button -->
        <button id="chatbot-toggle" 
            class="fixed bottom-4 right-4 md:bottom-6 md:right-6 size-14 md:size-16 bg-primary hover:bg-primary-dark text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 flex items-center justify-center">
            <span class="material-symbols-outlined text-2xl md:text-3xl">chat</span>
        </button>

        <!-- Chatbot Container -->
        <div id="chatbot-container" 
            class="fixed inset-x-2 bottom-20 sm:inset-x-auto sm:bottom-24 sm:right-4 md:right-6 sm:w-[380px] md:w-[420px] h-[calc(100vh-7rem)] sm:h-[580px] md:h-[600px] max-h-[calc(100vh-7rem)] bg-white dark:bg-slate-900 rounded-2xl md:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-50 transition-all duration-300 opacity-0 pointer-events-none scale-95">
            
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary to-emerald-400 text-white p-4 md:p-5 flex items-center justify-between flex-shrink-0 shadow-lg">
                <div class="flex items-center gap-3 min-w-0">
                    <div class="size-10 md:size-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
                        <span class="material-symbols-outlined text-xl md:text-2xl">smart_toy</span>
                    </div>
                    <div class="min-w-0">
                        <h3 class="font-bold text-base md:text-lg truncate">${t('chatbot.title', 'Trợ lý học tập')}</h3>
                        <p class="text-xs md:text-sm opacity-90 flex items-center gap-1">
                            <span class="size-2 bg-white rounded-full animate-pulse"></span>
                            ${t('chatbot.online', 'Đang trực tuyến')}
                        </p>
                    </div>
                </div>
                <button id="chatbot-close" class="hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0 active:scale-95">
                    <span class="material-symbols-outlined text-xl md:text-2xl">close</span>
                </button>
            </div>

            <!-- Messages -->
            <div id="chatbot-messages" class="flex-1 overflow-y-auto p-4 md:p-5 space-y-3 md:space-y-4 bg-slate-50 dark:bg-slate-950 min-h-0 scroll-smooth">
                <div class="flex gap-2 md:gap-3 animate-fadeIn">
                    <div class="size-8 md:size-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                        <span class="material-symbols-outlined text-white text-sm md:text-base">smart_toy</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl rounded-tl-sm p-3 md:p-4 max-w-[85%] shadow-md">
                        <p class="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed">${t('chatbot.welcome', 'Xin chào! Tôi là trợ lý học tập của bạn. Tôi có thể giúp gì cho bạn?')}</p>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div id="chatbot-quick-actions" class="px-4 md:px-5 py-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2 snap-x snap-mandatory">
                    <button class="chatbot-quick-btn px-3 md:px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/80 hover:from-primary/10 hover:to-primary/5 text-xs md:text-sm rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 snap-start shadow-sm hover:shadow-md active:scale-95" 
                        data-message="Từ vựng gia đình">
                        <span class="material-symbols-outlined text-sm md:text-base">family_restroom</span>
                        <span class="font-medium">Gia đình</span>
                    </button>
                    <button class="chatbot-quick-btn px-3 md:px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/80 hover:from-primary/10 hover:to-primary/5 text-xs md:text-sm rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 snap-start shadow-sm hover:shadow-md active:scale-95"
                        data-message="Từ vựng đồ ăn">
                        <span class="material-symbols-outlined text-sm md:text-base">restaurant</span>
                        <span class="font-medium">Đồ ăn</span>
                    </button>
                    <button class="chatbot-quick-btn px-3 md:px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/80 hover:from-primary/10 hover:to-primary/5 text-xs md:text-sm rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 snap-start shadow-sm hover:shadow-md active:scale-95"
                        data-message="Tips học tiếng Trung">
                        <span class="material-symbols-outlined text-sm md:text-base">tips_and_updates</span>
                        <span class="font-medium">Tips học tập</span>
                    </button>
                    <button class="chatbot-quick-btn px-3 md:px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-800/80 hover:from-primary/10 hover:to-primary/5 text-xs md:text-sm rounded-full whitespace-nowrap transition-all flex items-center gap-1.5 flex-shrink-0 snap-start shadow-sm hover:shadow-md active:scale-95"
                        data-message="Giải thích từ 你好">
                        <span class="material-symbols-outlined text-sm md:text-base">translate</span>
                        <span class="font-medium">Giải thích từ</span>
                    </button>
                </div>
            </div>

            <!-- Input -->
            <div class="p-4 md:p-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <div class="flex gap-2 md:gap-3">
                    <input id="chatbot-input" 
                        type="text" 
                        placeholder="${t('chatbot.placeholder', 'Nhập tin nhắn...')}"
                        class="flex-1 px-4 md:px-5 py-2.5 md:py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-full focus:ring-2 focus:ring-primary outline-none text-sm md:text-base transition-all"
                        autocomplete="off">
                    <button id="chatbot-send" 
                        class="size-10 md:size-12 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 shadow-lg hover:shadow-xl active:scale-95">
                        <span class="material-symbols-outlined text-xl md:text-2xl">send</span>
                    </button>
                </div>
            </div>
        </div>
    `;

    // Insert chatbot HTML
    const chatbotDiv = document.createElement('div');
    chatbotDiv.innerHTML = chatbotHTML;
    document.body.appendChild(chatbotDiv);

    // Chatbot state
    let isOpen = false;
    let isTyping = false;

    // Elements
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const container = document.getElementById('chatbot-container');
    const messagesDiv = document.getElementById('chatbot-messages');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const quickActionBtns = document.querySelectorAll('.chatbot-quick-btn');

    // Toggle chatbot
    function toggleChatbot() {
        isOpen = !isOpen;
        if (isOpen) {
            container.classList.remove('opacity-0', 'pointer-events-none', 'scale-95');
            container.classList.add('opacity-100', 'scale-100');
            // Prevent body scroll on mobile
            if (window.innerWidth < 768) {
                document.body.classList.add('chatbot-open');
            }
            setTimeout(() => input.focus(), 300);
        } else {
            container.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
            container.classList.remove('opacity-100', 'scale-100');
            // Re-enable body scroll
            document.body.classList.remove('chatbot-open');
        }
    }

    toggleBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);

    // Add message to chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-2 md:gap-3 animate-fadeIn ' + (isUser ? 'justify-end' : '');
        
        messageDiv.innerHTML = isUser ? `
            <div class="bg-gradient-to-br from-primary to-emerald-500 text-white rounded-2xl md:rounded-3xl rounded-tr-sm p-3 md:p-4 max-w-[85%] shadow-md">
                <p class="text-sm md:text-base leading-relaxed">${escapeHtml(message)}</p>
            </div>
            <div class="size-8 md:size-9 bg-gradient-to-br from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700 rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span class="material-symbols-outlined text-white text-sm md:text-base">person</span>
            </div>
        ` : `
            <div class="size-8 md:size-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span class="material-symbols-outlined text-white text-sm md:text-base">smart_toy</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl rounded-tl-sm p-3 md:p-4 max-w-[85%] shadow-md">
                <div class="text-sm md:text-base text-slate-700 dark:text-slate-300 chatbot-message leading-relaxed">${message}</div>
            </div>
        `;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTo({ top: messagesDiv.scrollHeight, behavior: 'smooth' });
    }
    
    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show typing indicator
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'flex gap-2 md:gap-3 animate-fadeIn';
        typingDiv.innerHTML = `
            <div class="size-8 md:size-9 bg-primary rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                <span class="material-symbols-outlined text-white text-sm md:text-base">smart_toy</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-3xl rounded-tl-sm p-3 md:p-4 shadow-md">
                <div class="flex gap-1.5 md:gap-2">
                    <div class="size-2 md:size-2.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="size-2 md:size-2.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="size-2 md:size-2.5 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>
        `;
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTo({ top: messagesDiv.scrollHeight, behavior: 'smooth' });
    }

    function removeTypingIndicator() {
        const typingDiv = document.getElementById('typing-indicator');
        if (typingDiv) typingDiv.remove();
    }

    // Handle bot response
    async function getBotResponse(userMessage) {
        try {
            console.log('🤖 Chatbot: Sending message...', userMessage);
            
            // Token is optional since API doesn't require auth for testing
            const token = localStorage.getItem('authToken') 
                       || localStorage.getItem('token') 
                       || localStorage.getItem('jwtToken');

            // Get conversation history
            const conversationHistory = [];
            const messages = messagesDiv.querySelectorAll('.flex');
            messages.forEach(msg => {
                const text = msg.querySelector('p')?.textContent;
                const isUser = msg.classList.contains('justify-end');
                if (text && text !== 'Xin chào! Tôi là trợ lý học tập của bạn. Tôi có thể giúp gì cho bạn?') {
                    conversationHistory.push({
                        content: text,
                        isUser: isUser
                    });
                }
            });

            console.log('📝 Conversation history:', conversationHistory.length, 'messages');

            // Call Gemini API
            console.log('📞 Calling API: /api/chatbot/message');
            
            const headers = {
                'Content-Type': 'application/json'
            };
            
            // Add auth header if token exists
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
                console.log('✅ Using auth token');
            } else {
                console.log('ℹ️ No token - using public API');
            }
            
            const response = await fetch('/api/chatbot/message', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    message: userMessage,
                    conversationHistory: conversationHistory.slice(-10) // Keep last 10 messages
                })
            });

            console.log('📥 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ API Error:', response.status, errorText);
                
                if (response.status === 401) {
                    return '🔒 Vui lòng đăng nhập để sử dụng chatbot.';
                }
                
                try {
                    const errorData = JSON.parse(errorText);
                    return `⚠️ ${errorData.message || errorData.error || 'Không thể kết nối với AI'}`;
                } catch (e) {
                    return '❌ Server đang bận. Vui lòng thử lại sau.';
                }
            }

            const result = await response.json();
            console.log('✅ API Response:', result);
            
            if (result.success && result.data?.response) {
                const aiResponse = result.data.response;
                console.log('✅ AI response length:', aiResponse.length, 'chars');
                
                // Format markdown-style response
                return formatChatbotResponse(aiResponse);
            } else {
                console.error('❌ Unexpected response format:', result);
                return result.message || '❌ Xin lỗi, tôi không thể trả lời lúc này.';
            }

        } catch (error) {
            console.error('❌ Chatbot Error:', error);
            
            // Network errors
            if (error.message.includes('Failed to fetch')) {
                return '🌐 Không thể kết nối server. Vui lòng kiểm tra:\n' +
                       '- Server đang chạy?\n' +
                       '- Kết nối internet ổn định?';
            }
            
            return `❌ Lỗi: ${error.message}`;
        }
    }
    
    // Format chatbot response with markdown-like styling
    function formatChatbotResponse(text) {
        // Convert **bold** to <strong>
        text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Convert *italic* to <em>
        text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Convert `code` to inline code
        text = text.replace(/`(.*?)`/g, '<code class="bg-slate-100 dark:bg-slate-700 px-1 rounded text-xs">$1</code>');
        
        // Convert line breaks to <br>
        text = text.replace(/\n/g, '<br>');
        
        // Convert emoji shortcuts
        text = text.replace(/:\)/g, '😊');
        text = text.replace(/:\(/g, '😢');
        
        return text;
    }

    // Send message
    async function sendMessage() {
        const message = input.value.trim();
        if (!message || isTyping) return;

        // Add user message
        addMessage(message, true);
        input.value = '';
        sendBtn.disabled = true;
        isTyping = true;

        // Show typing indicator
        showTypingIndicator();

        // Simulate delay and get response
        setTimeout(async () => {
            removeTypingIndicator();
            const response = await getBotResponse(message);
            addMessage(response);
            sendBtn.disabled = false;
            isTyping = false;
        }, 1000 + Math.random() * 1000);
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Quick action buttons
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const message = btn.getAttribute('data-message');
            input.value = message;
            sendMessage();
        });
    });

    // Register callback for language changes
    if (typeof i18n !== 'undefined' && typeof i18n.onLanguageChange === 'function') {
        i18n.onLanguageChange(() => {
            console.log('🌐 Language changed, reinitializing chatbot...');
            // Remove old chatbot
            const oldChatbot = document.getElementById('chatbot-toggle');
            if (oldChatbot && oldChatbot.parentElement) {
                oldChatbot.parentElement.remove();
            }
            const oldContainer = document.getElementById('chatbot-container');
            if (oldContainer) oldContainer.remove();
            
            // Reinitialize with new language
            setTimeout(() => initializeChatbot(), 100);
        });
    }
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    // Handle OAuth callback parameters (for mobile/Zalo scenarios)
    const urlParams = new URLSearchParams(window.location.search);
    const authSuccess = urlParams.get('auth');
    const tokenParam = urlParams.get('token');
    const userParam = urlParams.get('user');
    
    if (authSuccess === 'success' && tokenParam && userParam) {
        try {
            // Store auth data from URL parameters to localStorage
            localStorage.setItem('authToken', tokenParam);
            localStorage.setItem('user', decodeURIComponent(userParam));
            
            console.log('✅ Auth data saved from URL parameters (mobile/Zalo flow)');
            
            // Clean URL to remove parameters
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
            
            // Show success message
            const alertDiv = document.createElement('div');
            alertDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4';
            alertDiv.innerHTML = `
                <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
                    <span class="material-symbols-outlined">check_circle</span>
                    <span class="text-sm">Đăng nhập thành công!</span>
                </div>
            `;
            document.body.appendChild(alertDiv);
            setTimeout(() => alertDiv.remove(), 3000);
        } catch (error) {
            console.error('Failed to process auth parameters:', error);
        }
    }
    
    const sidebarContainer = document.getElementById('sidebar-container');
    if (sidebarContainer) {
        const activePage = sidebarContainer.getAttribute('data-active-page') || 'home';
        
        // Render sidebar with loading state
        sidebarContainer.innerHTML = renderSidebar(activePage);
        
        // Register callback for language changes
        if (typeof i18n !== 'undefined' && typeof i18n.onLanguageChange === 'function') {
            i18n.onLanguageChange(() => {
                console.log('🌐 Language changed, updating sidebar...');
                // Get current profile data from sidebar
                const currentProfileData = window.sidebarProfileData || null;
                sidebarContainer.innerHTML = renderSidebar(activePage, currentProfileData);
                // Re-initialize mobile menu after re-render
                initMobileMenu();
            });
        }
        
        // Initialize mobile menu
        initMobileMenu();
        
        // Fetch and update profile data
        try {
            const token = localStorage.getItem('authToken') 
                       || localStorage.getItem('token') 
                       || localStorage.getItem('jwtToken');
            
            if (token) {
                const response = await fetch('/api/auth/profile', {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data) {
                        // Store profile data globally for language updates
                        window.sidebarProfileData = result.data;
                        // Re-render sidebar with profile data
                        sidebarContainer.innerHTML = renderSidebar(activePage, result.data);
                        // Re-initialize mobile menu after re-render
                        initMobileMenu();
                    }
                } else if (response.status === 401) {
                    // Token expired or invalid, redirect to login
                    console.warn('Unauthorized: redirecting to login');
                    localStorage.clear();
                    window.location.href = '/login_screen.html';
                }
            }
        } catch (error) {
            console.error('Failed to load profile data for sidebar:', error);
            // Sidebar already rendered with defaults, no need to show error
        }
    }

    // Initialize chatbot
    initializeChatbot();
});
