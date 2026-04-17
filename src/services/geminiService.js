/**
 * Gemini Service
 * Handles all interactions with Google Gemini API
 */

const axios = require('axios');
const geminiConfig = require('../config/gemini');
const { logger } = require('../utils/logger');
const chatbotFallback = require('./chatbotFallback');

class GeminiService {
  constructor() {
    this.apiKey = geminiConfig.apiKey;
    this.apiUrl = geminiConfig.apiUrl;
    this.maxTokens = geminiConfig.maxTokens;
    this.temperature = geminiConfig.temperature;
    this.useFallback = !this.apiKey; // Use fallback if API key is not configured
    this.lastQuotaExceededTime = null;
    this.quotaResetInterval = 60000; // 1 minute
    this.requestTimeout = 10000; // 10 seconds
  }

  /**
   * Check if API quota is exceeded
   */
  isQuotaExceeded() {
    if (!this.lastQuotaExceededTime) return false;
    const timePassed = Date.now() - this.lastQuotaExceededTime;
    return timePassed < this.quotaResetInterval;
  }

  /**
   * Generate a response for a message with conversation history
   */
  async generateResponse(message, conversationHistory = []) {
    try {
      // Check if we should use fallback
      if (this.useFallback || this.isQuotaExceeded()) {
        logger.warn('Using fallback response for generateResponse');
        return this._generateFallbackResponse(message, conversationHistory);
      }

      // Build conversation context
      const systemPrompt = `You are a helpful Chinese language learning assistant. Help users learn Chinese (Mandarin) by:
- Explaining words and phrases
- Providing translations
- Offering usage examples
- Suggesting related vocabulary
- Giving pronunciation guidance
Keep responses concise and friendly. Always respond in the user's language (Vietnamese) unless they ask for Chinese.`;

      const messages = [
        ...conversationHistory.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }]
        })),
        {
          role: 'user',
          parts: [{ text: message }]
        }
      ];

      const requestBody = {
        contents: messages,
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        generationConfig: {
          temperature: this.temperature,
          maxOutputTokens: this.maxTokens,
          topP: geminiConfig.topP,
          topK: geminiConfig.topK
        }
      };

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        {
          timeout: this.requestTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        return response.data.candidates[0].content.parts[0].text;
      }

      return this._generateFallbackResponse(message, conversationHistory);
    } catch (error) {
      logger.error('Gemini API error in generateResponse:', error.message);

      // Handle quota exceeded
      if (error.response?.status === 429) {
        this.lastQuotaExceededTime = Date.now();
        logger.warn('API quota exceeded, switching to fallback mode');
      }

      // Use fallback on error
      this.useFallback = true;
      return this._generateFallbackResponse(message, conversationHistory);
    }
  }

  /**
   * Suggest vocabulary for a specific topic
   */
  async suggestVocabulary(topic, level = 'beginner') {
    try {
      if (this.useFallback || this.isQuotaExceeded()) {
        logger.warn(`Using fallback vocabulary for topic: ${topic}`);
        return this._generateFallbackVocabulary(topic, level);
      }

      const prompt = `Suggest 10 ${level} level Chinese vocabulary words related to "${topic}". 
For each word, provide:
1. Chinese characters
2. Pinyin romanization
3. English meaning
4. Vietnamese meaning
5. Example sentence in Chinese

Format as JSON array with objects containing: {chinese, pinyin, english, vietnamese, example}`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000
        }
      };

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        { timeout: this.requestTimeout }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!responseText) {
        return this._generateFallbackVocabulary(topic, level);
      }

      // Try to parse JSON from response
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      } catch (parseError) {
        logger.warn('Failed to parse vocabulary JSON:', parseError.message);
      }

      return this._generateFallbackVocabulary(topic, level);
    } catch (error) {
      logger.error('Gemini API error in suggestVocabulary:', error.message);
      if (error.response?.status === 429) {
        this.lastQuotaExceededTime = Date.now();
      }
      this.useFallback = true;
      return this._generateFallbackVocabulary(topic, level);
    }
  }

  /**
   * Explain a Chinese word or phrase
   */
  async explainWord(word) {
    try {
      if (this.useFallback || this.isQuotaExceeded()) {
        logger.warn(`Using fallback explanation for word: ${word}`);
        return this._generateFallbackExplanation(word);
      }

      const prompt = `Explain the Chinese word "${word}" in detail:
1. Character breakdown (if multiple characters)
2. Pinyin pronunciation
3. English meaning
4. Vietnamese meaning
5. Usage examples (2-3 sentences)
6. Related words or phrases
7. Common mistakes to avoid
8. Etymology or cultural context if applicable

Be comprehensive and educational.`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500
        }
      };

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        { timeout: this.requestTimeout }
      );

      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
             this._generateFallbackExplanation(word);
    } catch (error) {
      logger.error('Gemini API error in explainWord:', error.message);
      if (error.response?.status === 429) {
        this.lastQuotaExceededTime = Date.now();
      }
      this.useFallback = true;
      return this._generateFallbackExplanation(word);
    }
  }

  /**
   * Get Chinese language learning tips
   */
  async getLearningTips() {
    try {
      if (this.useFallback || this.isQuotaExceeded()) {
        logger.warn('Using fallback learning tips');
        return chatbotFallback.getTips?.() || [
          'Practice daily for at least 15 minutes',
          'Focus on commonly used characters first',
          'Use flashcards to memorize vocabulary',
          'Watch Chinese movies with subtitles',
          'Speak out loud to improve pronunciation'
        ];
      }

      const prompt = `Provide 5 practical tips for learning Chinese (Mandarin) effectively. 
Format as JSON array of strings, each being a concise, actionable tip.
Tips should be varied (covering pronunciation, characters, listening, speaking, etc.)`;

      const requestBody = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 500
        }
      };

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        requestBody,
        { timeout: this.requestTimeout }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (responseText) {
        try {
          const jsonMatch = responseText.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
          }
        } catch (parseError) {
          logger.warn('Failed to parse tips JSON');
        }
      }

      return chatbotFallback.getTips?.() || [];
    } catch (error) {
      logger.error('Gemini API error in getLearningTips:', error.message);
      if (error.response?.status === 429) {
        this.lastQuotaExceededTime = Date.now();
      }
      return chatbotFallback.getTips?.() || [];
    }
  }

  /**
   * Fallback response generation
   */
  _generateFallbackResponse(message, conversationHistory) {
    if (chatbotFallback.generateResponse) {
      return chatbotFallback.generateResponse(message, conversationHistory);
    }
    
    return `I'm sorry, I'm currently in fallback mode. Your message was: "${message}". Please try again later or check the learning resources.`;
  }

  /**
   * Fallback vocabulary generation
   */
  _generateFallbackVocabulary(topic, level) {
    if (chatbotFallback.suggestVocabulary) {
      return chatbotFallback.suggestVocabulary(topic, level);
    }

    // Basic fallback vocabulary
    return [
      {
        chinese: '你好',
        pinyin: 'nǐ hǎo',
        english: 'Hello',
        vietnamese: 'Xin chào',
        example: '你好，我是学生。(Hello, I am a student.)'
      },
      {
        chinese: '谢谢',
        pinyin: 'xièxiè',
        english: 'Thank you',
        vietnamese: 'Cảm ơn',
        example: '谢谢你的帮助。(Thank you for your help.)'
      }
    ];
  }

  /**
   * Fallback word explanation
   */
  _generateFallbackExplanation(word) {
    if (chatbotFallback.explainWord) {
      return chatbotFallback.explainWord(word);
    }

    return `I apologize, but I cannot provide a detailed explanation for "${word}" at the moment. Please try again later or consult a Chinese dictionary.`;
  }
}

// Export singleton instance
module.exports = new GeminiService();
