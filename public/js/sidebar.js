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
        <aside class="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed h-full z-20">
            <div class="p-6 flex items-center gap-3">
                <div class="bg-primary p-2 rounded-lg">
                    <span class="material-symbols-outlined text-white">menu_book</span>
                </div>
                <h1 class="font-bold text-xl tracking-tight text-slate-900 dark:text-white">${t('sidebar.appName', 'VocabHero')}</h1>
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
            class="fixed bottom-6 right-6 size-14 bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:scale-110 transition-all z-50 flex items-center justify-center">
            <span class="material-symbols-outlined">chat</span>
        </button>

        <!-- Chatbot Container -->
        <div id="chatbot-container" 
            class="fixed bottom-24 right-6 w-96 h-[500px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden z-50 transition-all duration-300 opacity-0 pointer-events-none scale-95">
            
            <!-- Header -->
            <div class="bg-primary text-white p-4 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="size-10 bg-white/20 rounded-full flex items-center justify-center">
                        <span class="material-symbols-outlined">smart_toy</span>
                    </div>
                    <div>
                        <h3 class="font-bold">${t('chatbot.title', 'Trợ lý học tập')}</h3>
                        <p class="text-xs opacity-90">${t('chatbot.online', 'Đang trực tuyến')}</p>
                    </div>
                </div>
                <button id="chatbot-close" class="hover:bg-white/20 p-1 rounded-lg transition-colors">
                    <span class="material-symbols-outlined">close</span>
                </button>
            </div>

            <!-- Messages -->
            <div id="chatbot-messages" class="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                <div class="flex gap-2">
                    <div class="size-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                        <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
                    </div>
                    <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm p-3 max-w-[80%] shadow-sm">
                        <p class="text-sm text-slate-700 dark:text-slate-300">${t('chatbot.welcome', 'Xin chào! Tôi là trợ lý học tập của bạn. Tôi có thể giúp gì cho bạn?')}</p>
                    </div>
                </div>
            </div>

            <!-- Quick Actions -->
            <div id="chatbot-quick-actions" class="px-4 py-2 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    <button class="chatbot-quick-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 text-xs rounded-full whitespace-nowrap transition-colors" 
                        data-message="Từ vựng gia đình">
                        <span class="material-symbols-outlined text-sm align-middle mr-1">family_restroom</span>
                        Từ vựng gia đình
                    </button>
                    <button class="chatbot-quick-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 text-xs rounded-full whitespace-nowrap transition-colors"
                        data-message="Từ vựng đồ ăn">
                        <span class="material-symbols-outlined text-sm align-middle mr-1">restaurant</span>
                        Từ vựng đồ ăn
                    </button>
                    <button class="chatbot-quick-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 text-xs rounded-full whitespace-nowrap transition-colors"
                        data-message="Tips học tiếng Trung">
                        <span class="material-symbols-outlined text-sm align-middle mr-1">tips_and_updates</span>
                        Tips học tập
                    </button>
                    <button class="chatbot-quick-btn px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary/10 text-xs rounded-full whitespace-nowrap transition-colors"
                        data-message="Giải thích từ 你好">
                        <span class="material-symbols-outlined text-sm align-middle mr-1">translate</span>
                        Giải thích từ
                    </button>
                </div>
            </div>

            <!-- Input -->
            <div class="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div class="flex gap-2">
                    <input id="chatbot-input" 
                        type="text" 
                        placeholder="${t('chatbot.placeholder', 'Nhập tin nhắn...')}"
                        class="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-full focus:ring-2 focus:ring-primary outline-none text-sm"
                        autocomplete="off">
                    <button id="chatbot-send" 
                        class="size-10 bg-primary hover:bg-primary-dark text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <span class="material-symbols-outlined">send</span>
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
            input.focus();
        } else {
            container.classList.add('opacity-0', 'pointer-events-none', 'scale-95');
            container.classList.remove('opacity-100', 'scale-100');
        }
    }

    toggleBtn.addEventListener('click', toggleChatbot);
    closeBtn.addEventListener('click', toggleChatbot);

    // Add message to chat
    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'flex gap-2 animate-fadeIn ' + (isUser ? 'justify-end' : '');
        
        messageDiv.innerHTML = isUser ? `
            <div class="bg-primary text-white rounded-2xl rounded-tr-sm p-3 max-w-[80%] shadow-sm">
                <p class="text-sm">${escapeHtml(message)}</p>
            </div>
            <div class="size-8 bg-slate-300 dark:bg-slate-700 rounded-full flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-white text-sm">person</span>
            </div>
        ` : `
            <div class="size-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm p-3 max-w-[80%] shadow-sm">
                <div class="text-sm text-slate-700 dark:text-slate-300 chatbot-message">${message}</div>
            </div>
        `;
        
        messagesDiv.appendChild(messageDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
        typingDiv.className = 'flex gap-2';
        typingDiv.innerHTML = `
            <div class="size-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-white text-sm">smart_toy</span>
            </div>
            <div class="bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm p-3 shadow-sm">
                <div class="flex gap-1">
                    <div class="size-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 0ms"></div>
                    <div class="size-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 150ms"></div>
                    <div class="size-2 bg-slate-400 rounded-full animate-bounce" style="animation-delay: 300ms"></div>
                </div>
            </div>
        `;
        messagesDiv.appendChild(typingDiv);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
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
            });
        }
        
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
