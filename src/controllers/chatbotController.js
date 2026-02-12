const geminiService = require('../services/geminiService');

class ChatbotController {
    /**
     * Send message to chatbot
     * POST /api/chatbot/message
     */
    async sendMessage(req, res) {
        try {
            const { message, conversationHistory } = req.body;

            if (!message || typeof message !== 'string') {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            // Validate message length
            if (message.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Message too long (max 1000 characters)'
                });
            }

            // Generate AI response
            const response = await geminiService.generateResponse(
                message,
                conversationHistory || []
            );

            return res.status(200).json({
                success: true,
                data: {
                    response,
                    timestamp: new Date().toISOString()
                }
            });

        } catch (error) {
            console.error('Chatbot sendMessage error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate response',
                error: error.message
            });
        }
    }

    /**
     * Get vocabulary suggestions
     * POST /api/chatbot/suggest-vocabulary
     */
    async suggestVocabulary(req, res) {
        try {
            const { topic, level } = req.body;

            if (!topic) {
                return res.status(400).json({
                    success: false,
                    message: 'Topic is required'
                });
            }

            const suggestions = await geminiService.suggestVocabulary(
                topic,
                level || 'beginner'
            );

            return res.status(200).json({
                success: true,
                data: {
                    suggestions,
                    topic,
                    level: level || 'beginner'
                }
            });

        } catch (error) {
            console.error('Chatbot suggestVocabulary error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate vocabulary suggestions',
                error: error.message
            });
        }
    }

    /**
     * Explain a word
     * POST /api/chatbot/explain-word
     */
    async explainWord(req, res) {
        try {
            const { word } = req.body;

            if (!word) {
                return res.status(400).json({
                    success: false,
                    message: 'Word is required'
                });
            }

            const explanation = await geminiService.explainWord(word);

            return res.status(200).json({
                success: true,
                data: {
                    explanation,
                    word
                }
            });

        } catch (error) {
            console.error('Chatbot explainWord error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to explain word',
                error: error.message
            });
        }
    }

    /**
     * Get learning tips
     * GET /api/chatbot/learning-tips
     */
    async getLearningTips(req, res) {
        try {
            const tips = await geminiService.getLearningTips();

            return res.status(200).json({
                success: true,
                data: {
                    tips
                }
            });

        } catch (error) {
            console.error('Chatbot getLearningTips error:', error);
            return res.status(500).json({
                success: false,
                message: 'Failed to get learning tips',
                error: error.message
            });
        }
    }

    /**
     * Health check for chatbot service
     * GET /api/chatbot/health
     */
    async healthCheck(req, res) {
        try {
            const geminiConfig = require('../config/gemini');
            const geminiService = require('../services/geminiService');
            
            const apiKey = geminiConfig.apiKey;
            const isConfigured = !!apiKey;
            const usingFallback = geminiService.useFallback;
            const hasQuotaIssue = !!geminiService.lastQuotaExceededTime;
            
            let status = 'ready';
            let message = 'Chatbot is ready to use';
            let mode = 'normal';
            
            if (!isConfigured) {
                status = 'degraded';
                message = 'Gemini API key not configured - Using fallback mode';
                mode = 'fallback';
            } else if (usingFallback) {
                status = 'degraded';
                message = 'API key invalid - Using fallback mode';
                mode = 'fallback';
            } else if (hasQuotaIssue) {
                const timeRemaining = Math.ceil((geminiService.quotaResetInterval - (Date.now() - geminiService.lastQuotaExceededTime)) / 60000);
                status = 'degraded';
                message = `API quota exceeded - Will retry in ${timeRemaining} minutes`;
                mode = 'fallback';
            }
            
            return res.status(200).json({
                success: true,
                data: {
                    status,
                    mode,
                    message,
                    apiConfigured: isConfigured,
                    fallbackEnabled: true,
                    quotaExceeded: hasQuotaIssue,
                    features: {
                        aiChat: !usingFallback && isConfigured && !hasQuotaIssue,
                        fallbackResponses: true,
                        vocabularyTopics: ['gia đình', 'đồ ăn', 'số đếm', 'giao thông', 'màu sắc'],
                        learningTips: true,
                        faq: true
                    },
                    timestamp: new Date().toISOString(),
                    documentation: '/docs/CHATBOT_TROUBLESHOOTING.md'
                }
            });

        } catch (error) {
            console.error('Chatbot healthCheck error:', error);
            return res.status(500).json({
                success: false,
                message: 'Health check failed',
                error: error.message
            });
        }
    }
}

module.exports = new ChatbotController();
