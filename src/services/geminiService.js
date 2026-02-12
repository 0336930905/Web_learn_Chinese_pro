const axios = require('axios');
const geminiConfig = require('../config/gemini');
const chatbotFallback = require('./chatbotFallback');

class GeminiService {
    constructor() {
        this.apiKey = geminiConfig.apiKey;
        this.apiUrl = geminiConfig.apiUrl;
        this.model = geminiConfig.model; // Current model: gemini-1.5-flash
        this.useFallback = false; // Flag to use fallback mode
        this.lastQuotaExceededTime = null; // Track when quota was exceeded
        this.quotaResetInterval = 2 * 60 * 1000; // Try API again after 2 minutes (reduced from 5)
        this.systemPrompt = `Bạn là trợ lý học tiếng Trung AI thông minh và thân thiện của ứng dụng VocabHero. 
Nhiệm vụ của bạn:
- Giúp người dùng học từ vựng tiếng Trung
- Giải thích ngữ pháp và cách sử dụng từ
- Đưa ra gợi ý học tập hiệu quả
- Trả lời các câu hỏi về tính năng của ứng dụng
- Động viên và khuyến khích người học

Hãy trả lời ngắn gọn, dễ hiểu và hữu ích. Sử dụng emoji phù hợp để thân thiện hơn.`;
    }

    /**
     * Check if we should retry API after quota exceeded
     */
    shouldRetryAPI() {
        if (!this.lastQuotaExceededTime) return true;
        
        const timeSinceExceeded = Date.now() - this.lastQuotaExceededTime;
        const shouldRetry = timeSinceExceeded > this.quotaResetInterval;
        
        if (shouldRetry) {
            console.log('⏰ Quota reset timer expired, will try API again');
            this.lastQuotaExceededTime = null; // Reset
        }
        
        return shouldRetry;
    }

    /**
     * Generate AI response from Gemini
     * @param {string} userMessage - User's message
     * @param {Array} conversationHistory - Previous conversation context
     * @returns {Promise<string>} AI response
     */
    async generateResponse(userMessage, conversationHistory = []) {
        // Check if we should retry API after quota exceeded
        if (this.lastQuotaExceededTime && !this.shouldRetryAPI()) {
            const timeRemaining = Math.ceil((this.quotaResetInterval - (Date.now() - this.lastQuotaExceededTime)) / 60000);
            console.log(`⏳ API quota still exceeded. Retry in ${timeRemaining} minutes`);
            return chatbotFallback.getFallbackResponse(userMessage) + 
                   `\n\n⏳ **API sẽ tự động thử lại sau ${timeRemaining} phút...**`;
        }

        // If fallback mode is permanently enabled, use fallback
        if (this.useFallback) {
            console.log('🔄 Using permanent fallback mode (API key invalid)');
            return chatbotFallback.getFallbackResponse(userMessage);
        }

        try {
            console.log('🤖 Gemini Service: Generating response for:', userMessage);
            console.log('📦 Using model:', this.model);
            
            if (!this.apiKey) {
                console.warn('⚠️ Gemini API key not configured, switching to fallback mode');
                this.useFallback = true;
                return chatbotFallback.getFallbackResponse(userMessage);
            }

            console.log('✅ API Key configured:', this.apiKey.substring(0, 20) + '...');

            // Build conversation context
            const messages = [
                { role: 'user', parts: [{ text: this.systemPrompt }] },
                { role: 'model', parts: [{ text: 'Xin chào! Tôi hiểu rồi. Tôi sẽ giúp bạn học tiếng Trung một cách hiệu quả nhất! 😊' }] }
            ];

            // Add conversation history (last 5 messages for context)
            const recentHistory = conversationHistory.slice(-5);
            recentHistory.forEach(msg => {
                messages.push({
                    role: msg.isUser ? 'user' : 'model',
                    parts: [{ text: msg.content }]
                });
            });

            // Add current user message
            messages.push({
                role: 'user',
                parts: [{ text: userMessage }]
            });

            console.log('📝 Messages to send:', messages.length, 'messages');

            // Prepare request body
            const requestBody = {
                contents: messages,
                generationConfig: {
                    temperature: geminiConfig.temperature,
                    topK: geminiConfig.topK,
                    topP: geminiConfig.topP,
                    maxOutputTokens: geminiConfig.maxTokens,
                }
            };

            console.log('📞 Calling Gemini API...');

            // Call Gemini API
            const response = await axios.post(
                `${this.apiUrl}?key=${this.apiKey}`,
                requestBody,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 seconds timeout
                }
            );

            console.log('✅ Gemini API responded:', response.status);

            // If we had quota issues before, reset the timer
            if (this.lastQuotaExceededTime) {
                console.log('🎉 API quota recovered! Resetting timer.');
                this.lastQuotaExceededTime = null;
            }

            // Extract response text
            if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                const aiResponse = response.data.candidates[0].content.parts[0].text;
                console.log('✅ AI Response:', aiResponse.substring(0, 100) + '...');
                return aiResponse;
            } else {
                console.error('❌ Invalid response format:', response.data);
                throw new Error('Invalid response format from Gemini API');
            }

        } catch (error) {
            console.error('❌ Gemini API Error Details:');
            console.error('- Message:', error.message);
            console.error('- Status:', error.response?.status);
            console.error('- Data:', error.response?.data);
            console.error('- Code:', error.code);
            
            // Handle quota exceeded - track time and use fallback temporarily
            if (error.response?.status === 429) {
                this.lastQuotaExceededTime = Date.now();
                const retryMinutes = Math.ceil(this.quotaResetInterval / 60000);
                
                console.warn(`⚠️ API quota exceeded. Will retry in ${retryMinutes} minutes`);
                
                const errorData = error.response?.data?.error;
                const isLimit0 = quotaMessage.includes('limit: 0');
                
                if (isLimit0) {
                    // Model không hỗ trợ free tier
                    return `🚫 **Model ${this.model} không còn miễn phí**\n\n` +
                           `📊 Google đã tắt free tier cho model này (limit: 0)\n\n` +
                           `✅ **Giải pháp:**\n` +
                           `1. App đã tự động chuyển sang model gemini-1.5-flash\n` +
                           `2. Restart server để áp dụng: \`npm start\` hoặc \`node server.js\`\n` +
                           `3. Hoặc enable Billing tại: https://console.cloud.google.com/billing\n\n` +
                           `💡 **Trong lúc chờ:**\n` +
                           `- Hỏi từ vựng: "Từ vựng gia đình"\n` +
                           `- Tips học tập: "Cách học tiếng Trung"`;
                }
                
                return `⚠️ **API Key đã hết quota miễn phí**\n\n` +
                       `📊 **Chi tiết**: ${quotaMessage}\n\n` +
                       `⏰ **Chatbot sẽ tự động thử lại sau ${retryMinutes} phút**\n\n` +
                       `💡 **Trong lúc chờ:**\n` +
                       `- Hỏi từ vựng: "Từ vựng gia đình"\n` +
                       `- Tips học tập: "Cách học tiếng Trung"\n\n` +
                       `📖 **Tác tính năng khác của app 🎮\n\n` +
                       `📖 **Hoặc tạo API Key mới**: https://aistudio.google.com/apikey`;
            }
            
            // Handle API key invalid - enable fallback mode permanently
            if (error.response?.status === 403 || error.response?.status === 401) {
                console.warn('⚠️ Invalid API key, switching to permanent fallback mode');
                this.useFallback = true;
                return '🔒 **API Key không hợp lệ hoặc đã hết hạn**\n\n' +
                       '📝 **Để khắc phục:**\n' +
                       '1. Tạo API Key mới tại: https://aistudio.google.com/apikey\n' +
                       '2. Cập nhật vào file .env: GEMINI_API_KEY=your-new-key\n' +
                       '3. Khởi động lại server: npm start\n\n' +
                       chatbotFallback.getFallbackResponse(userMessage);
            }
            
            // Handle timeout or network errors
            if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
                console.warn('⚠️ Request timeout, using fallback');
                return '⏱️ Kết nối bị timeout. Hãy thử hỏi tôi về:\n' +
                       '- Từ vựng gia đình 👨‍👩‍👧‍👦\n' +
                       '- Từ vựng đồ ăn 🍜\n' +
                       '- Tips học tiếng Trung 📚';
            }

            // For other errors, use fallback
            console.warn('⚠️ Unknown error, using fallback response');
            return chatbotFallback.getFallbackResponse(userMessage);
        }
    }

    /**
     * Generate vocabulary suggestions
     * @param {string} topic - Topic for vocabulary
     * @param {string} level - User's level (beginner, intermediate, advanced)
     * @returns {Promise<string>} Vocabulary suggestions
     */
    async suggestVocabulary(topic, level = 'beginner') {
        // Use fallback if API is unavailable
        if (this.useFallback || !this.apiKey) {
            return chatbotFallback.getVocabularySuggestion(topic, level);
        }

        const prompt = `Gợi ý 10 từ vựng tiếng Trung (Hán tự + Pinyin + nghĩa tiếng Việt) về chủ đề "${topic}" cho người học mức độ ${level}. 
Format: 
汉字 (pinyin) - Nghĩa tiếng Việt
Ví dụ câu ngắn`;

        try {
            return await this.generateResponse(prompt);
        } catch (error) {
            console.warn('⚠️ Error suggesting vocabulary, using fallback');
            return chatbotFallback.getVocabularySuggestion(topic, level);
        }
    }

    /**
     * Explain grammar or word usage
     * @param {string} word - Chinese word to explain
     * @returns {Promise<string>} Explanation
     */
    async explainWord(word) {
        // Use fallback if API is unavailable
        if (this.useFallback || !this.apiKey) {
            return chatbotFallback.explainWord(word);
        }

        const prompt = `Giải thích chi tiết từ tiếng Trung "${word}" bao gồm:
1. Cách đọc (Pinyin)
2. Nghĩa tiếng Việt
3. Cấu tạo chữ Hán (nếu có)
4. Cách dùng và ví dụ câu
5. Từ đồng nghĩa/trái nghĩa (nếu có)`;

        try {
            return await this.generateResponse(prompt);
        } catch (error) {
            console.warn('⚠️ Error explaining word, using fallback');
            return chatbotFallback.explainWord(word);
        }
    }

    /**
     * Get learning tips
     * @returns {Promise<string>} Learning tips
     */
    async getLearningTips() {
        // Use fallback if API is unavailable
        if (this.useFallback || !this.apiKey) {
            return chatbotFallback.learningTips;
        }

        const prompt = 'Đưa ra 5 tips học tiếng Trung hiệu quả cho người mới bắt đầu. Trả lời ngắn gọn, mỗi tip 1-2 câu.';
        
        try {
            return await this.generateResponse(prompt);
        } catch (error) {
            console.warn('⚠️ Error getting learning tips, using fallback');
            return chatbotFallback.learningTips;
        }
    }
}

module.exports = new GeminiService();
