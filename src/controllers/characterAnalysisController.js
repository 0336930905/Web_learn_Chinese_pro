/**
 * Character Analysis Controller
 * Handles Vietnamese to Chinese character analysis with OpenRouter AI
 */

const axios = require('axios');
const { ObjectId } = require('mongodb');
const { logger } = require('../utils/logger');

const CharacterAnalysisController = {
  /**
   * Analyze Vietnamese word and get Chinese equivalent with related vocabulary
   * POST /api/character-analysis/analyze
   */
  analyzeWord: async (req, res) => {
    const { vietnameseWord } = req.body;
    const collection = req.db.collection('character_analyses');

    console.log('[DEBUG analyzeWord] Input:', vietnameseWord, 'Type:', typeof vietnameseWord);

    if (!vietnameseWord || typeof vietnameseWord !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Vietnamese word is required'
      });
    }

    const normalizedWord = vietnameseWord.trim().toLowerCase();
    console.log('[DEBUG analyzeWord] Normalized:',  normalizedWord);

    try {
      // 1. Check if word already exists in database
      let cachedAnalysis = await collection.findOne({
        vietnameseWord: normalizedWord
      });

      console.log('[DEBUG analyzeWord] Cache lookup result:', cachedAnalysis ? 'FOUND' : 'NOT FOUND');

      if (cachedAnalysis) {
        logger.info(`Using cached analysis for: ${normalizedWord}`);
        return res.status(200).json({
          success: true,
          data: {
            analysis: cachedAnalysis,
            source: 'cache'
          }
        });
      }

      // 2. Call OpenRouter API for analysis
      logger.info(`Calling OpenRouter for: ${normalizedWord}`);
      const analysisData = await CharacterAnalysisController._callOpenRouterAPI(vietnameseWord);

      if (!analysisData) {
        logger.error(`No analysis data returned for: ${normalizedWord}`);
        return res.status(500).json({
          success: false,
          message: 'Failed to analyze word - API returned no data',
          error: 'Unable to generate analysis from OpenRouter API'
        });
      }

      // 3. Save to MongoDB
      const documentToSave = {
        vietnameseWord: normalizedWord,
        originalWord: vietnameseWord,
        ...analysisData,
        createdAt: new Date(),
        usageCount: 1
      };

      const result = await collection.insertOne(documentToSave);
      documentToSave._id = result.insertedId;

      logger.info(`Saved analysis for ${normalizedWord} with ID: ${result.insertedId}`);

      return res.status(200).json({
        success: true,
        data: {
          analysis: documentToSave,
          source: 'ai'
        }
      });
    } catch (error) {
      logger.error('Character analysis error:', error.message);
      
      // Determine error type and provide appropriate message
      let errorMessage = 'Failed to analyze word';
      if (error.message?.includes('API key')) {
        errorMessage = 'Server configuration error - API key missing';
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        errorMessage = 'API authentication failed - Invalid API key';
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests - Please try again later';
      } else if (error.response?.status === 500) {
        errorMessage = 'OpenRouter service is temporarily unavailable';
      } else if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
        errorMessage = 'Request timeout - Service is slow, please try again';
      }
      
      return res.status(500).json({
        success: false,
        message: errorMessage,
        error: error.message
      });
    }
  },

  /**
   * Get related vocabulary for a character
   * GET /api/character-analysis/related/:character
   */
  getRelatedVocabulary: async (req, res) => {
    const { character } = req.params;
    const collection = req.db.collection('character_analyses');

    if (!character) {
      return res.status(400).json({
        success: false,
        message: 'Character is required'
      });
    }

    try {
      // Find analyses that contain this character
      const relatedAnalyses = await collection
        .find({
          chineseCharacter: character
        })
        .limit(10)
        .toArray();

      if (relatedAnalyses.length === 0) {
        return res.status(200).json({
          success: true,
          data: {
            related: [],
            message: 'No related vocabulary found'
          }
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          related: relatedAnalyses,
          count: relatedAnalyses.length
        }
      });
    } catch (error) {
      logger.error('Get related vocabulary error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to get related vocabulary',
        error: error.message
      });
    }
  },

  /**
   * Increment usage count for a word
   * POST /api/character-analysis/track-usage
   */
  trackUsage: async (req, res) => {
    const { analysisId } = req.body;
    const collection = req.db.collection('character_analyses');

    if (!analysisId) {
      return res.status(400).json({
        success: false,
        message: 'Analysis ID is required'
      });
    }

    try {
      const result = await collection.updateOne(
        { _id: new ObjectId(analysisId) },
        {
          $inc: { usageCount: 1 },
          $set: { lastAccessedAt: new Date() }
        }
      );

      return res.status(200).json({
        success: true,
        data: {
          modifiedCount: result.modifiedCount
        }
      });
    } catch (error) {
      logger.error('Track usage error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to track usage'
      });
    }
  },

  /**
   * Call OpenRouter API for Vietnamese to Chinese analysis
   */
  _callOpenRouterAPI: async (vietnameseWord) => {
    try {
      const openRouterApiKey = process.env.OPENROUTER_API_KEY;
      const openRouterApiUrl = 'https://openrouter.ai/api/v1/chat/completions';

      if (!openRouterApiKey) {
        logger.error('CRITICAL: OpenRouter API key not configured in .env file');
        throw new Error('OpenRouter API key is not configured');
      }

      const prompt = `Analyze the Vietnamese word "${vietnameseWord}" and provide a comprehensive analysis. 

Return ONLY a valid JSON object with these exact fields (no markdown, no code blocks, no extra text):
{
  "vietnameseWord": "${vietnameseWord}",
  "chineseCharacter": "The main Chinese character (single character)",
  "chineseWord": "The full Chinese word/phrase",
  "pinyin": "Pinyin romanization with tone marks",
  "englishMeaning": "English translation",
  "vietnameseMeaning": "Vietnamese translation",
  "relatedWords": [
    {
      "word": "Related Chinese character/word",
      "pinyin": "Its pinyin",
      "meaning": "Vietnamese meaning of this related word"
    }
  ],
  "examples": [
    {
      "vietnamese": "Vietnamese example sentence",
      "chinese": "Chinese example sentence",
      "pinyin": "Pinyin of the Chinese example"
    }
  ],
  "characterBreakdown": "Explanation of character components if applicable",
  "hskLevel": "HSK level (HSK 1-6)",
  "usageContext": "Common usage context and situations"
}

Requirements:
- Provide 5-7 related words that use the same character
- All Chinese text MUST be in proper UTF-8 encoding
- All pinyin MUST use correct tone marks (ā á ǎ à ē é ě è etc)
- Vietnamese meanings should be clear and concise
- Ensure all fields are present and properly filled`;

      const response = await axios.post(
        openRouterApiUrl,
        {
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${openRouterApiKey}`,
            'HTTP-Referer': 'https://vocabhero.com',
            'X-Title': 'VocabHero - Character Analysis',
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.data?.choices?.[0]?.message?.content) {
        const content = response.data.choices[0].message.content;
        logger.debug('OpenRouter response:', content.substring(0, 200));
        
        try {
          // Try direct parse first
          let parsedData = JSON.parse(content);
          // Normalize the response data
          return CharacterAnalysisController._normalizeApiResponse(parsedData);
        } catch (parseError) {
          logger.warn('Direct JSON parse failed, extracting from markdown');
          // Try extracting JSON from markdown code blocks
          const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/) || 
                           content.match(/({[\s\S]*})/);
          
          if (jsonMatch && jsonMatch[1]) {
            try {
              let parsedData = JSON.parse(jsonMatch[1]);
              return CharacterAnalysisController._normalizeApiResponse(parsedData);
            } catch (e) {
              logger.warn('Failed to parse extracted JSON:', e.message);
              return CharacterAnalysisController._parseTextResponse(content);
            }
          }
          
          logger.warn('No JSON found, using text parser');
          return CharacterAnalysisController._parseTextResponse(content);
        }
      }

      return null;
    } catch (error) {
      logger.error('OpenRouter API error:', error.message);
      if (error.response?.status === 401) {
        logger.error('Authentication failed - Invalid or expired OpenRouter API key');
      } else if (error.response?.status === 429) {
        logger.error('Rate limit exceeded - Too many requests to OpenRouter');
      } else if (error.response?.status === 500) {
        logger.error('OpenRouter server error - Service temporarily unavailable');
      } else if (error.code === 'ECONNABORTED') {
        logger.error('OpenRouter request timeout - Service response took too long');
      }
      if (error.response?.data?.error) {
        logger.error('OpenRouter error response:', error.response.data.error);
      }
      throw error;
    }
  },

  _parseTextResponse: (content) => {
    // Fallback parsing - extract key information from text
    const result = {
      vietnameseWord: '',
      chineseCharacter: '',
      pinyin: '',
      englishMeaning: '',
      vietnameseMeaning: '',
      relatedWords: [],
      examples: [],
      characterBreakdown: '',
      hskLevel: '',
      usageContext: ''
    };

    // Simple extraction patterns
    const charMatch = content.match(/Chinese.*?[:：]\s*([^\n]+)/);
    const pinyinMatch = content.match(/Pinyin.*?[:：]\s*([^\n]+)/);
    const hskMatch = content.match(/HSK.*?[\d]/);

    if (charMatch) result.chineseCharacter = charMatch[1].trim();
    if (pinyinMatch) result.pinyin = pinyinMatch[1].trim();
    if (hskMatch) result.hskLevel = hskMatch[0].match(/[\d]/)[0];

    return result;
  },

  /**
   * Normalize API response to ensure all fields are properly mapped
   */
  _normalizeApiResponse: (data) => {
    if (!data) return null;

    // Ensure core fields exist with fallbacks
    const normalized = {
      vietnameseWord: data.vietnameseWord || '',
      chineseCharacter: data.chineseCharacter || data.chineseWord?.charAt(0) || '',
      chineseWord: data.chineseWord || data.chineseCharacter || '',
      pinyin: data.pinyin || '',
      englishMeaning: data.englishMeaning || '',
      vietnameseMeaning: data.vietnameseMeaning || '',
      characterBreakdown: data.characterBreakdown || '',
      hskLevel: data.hskLevel || '',
      usageContext: data.usageContext || '',
      examples: Array.isArray(data.examples) ? data.examples : [],
      relatedWords: Array.isArray(data.relatedWords) ? data.relatedWords.map(word => ({
        word: word.word || '',
        pinyin: word.pinyin || '',
        vietnameseMeaning: word.meaning || word.vietnameseMeaning || word.meaning || ''
      })) : []
    };

    return normalized;
  },

  /**
   * Generate diagram data from analysis
   * Converts analysis to Cytoscape.js nodes and edges format
   */
  generateDiagramData: (analysis) => {
    if (!analysis) return { nodes: [], edges: [] };

    const nodes = [
      {
        data: {
          id: 'center',
          label: `${analysis.chineseCharacter}`,
          pinyin: analysis.pinyin,
          meaning: analysis.vietnameseMeaning,
          isCenter: true
        }
      }
    ];

    const edges = [];

    // Add related words as branch nodes
    if (Array.isArray(analysis.relatedWords) && analysis.relatedWords.length > 0) {
      analysis.relatedWords.forEach((word, index) => {
        const nodeId = `word-${index}`;
        nodes.push({
          data: {
            id: nodeId,
            label: `${word.word}`,
            pinyin: word.pinyin,
            meaning: word.vietnameseMeaning || word.meaning,
            isBranch: true
          }
        });

        // Create edge from center to branch
        edges.push({
          data: {
            id: `e-center-${index}`,
            source: 'center',
            target: nodeId
          }
        });
      });
    }

    return { nodes, edges };
  },

  /**
   * Get diagram for a Vietnamese word
   * POST /api/character-analysis/diagram
   */
  getDiagram: async (req, res) => {
    const { vietnameseWord } = req.body;
    const collection = req.db.collection('character_analyses');

    if (!vietnameseWord || typeof vietnameseWord !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Vietnamese word is required'
      });
    }

    const normalizedWord = vietnameseWord.trim().toLowerCase();

    try {
      // Get or create analysis
      let analysis = await collection.findOne({
        vietnameseWord: normalizedWord
      });

      if (!analysis) {
        // Call API to create new analysis
        const analysisData = await CharacterAnalysisController._callOpenRouterAPI(vietnameseWord);
        
        if (!analysisData) {
          return res.status(500).json({
            success: false,
            message: 'Failed to analyze word'
          });
        }

        const documentToSave = {
          vietnameseWord: normalizedWord,
          originalWord: vietnameseWord,
          ...analysisData,
          createdAt: new Date(),
          usageCount: 1
        };

        const result = await collection.insertOne(documentToSave);
        documentToSave._id = result.insertedId;
        analysis = documentToSave;
      }

      // Generate diagram data
      const diagramData = CharacterAnalysisController.generateDiagramData(analysis);

      return res.status(200).json({
        success: true,
        data: {
          analysis,
          diagram: diagramData
        }
      });
    } catch (error) {
      logger.error('Diagram generation error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Failed to generate diagram',
        error: error.message
      });
    }
  }
};

module.exports = CharacterAnalysisController;
