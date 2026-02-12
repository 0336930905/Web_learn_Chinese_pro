/**
 * Game Service
 * Business logic for game features
 */

const { ObjectId } = require('mongodb');
const { 
  COLLECTIONS,
  HTTP_STATUS,
  ERROR_CODES,
  ERROR_MESSAGES,
  USER_ROLES,
  DIFFICULTY_LEVELS
} = require('../constants');
const { AppError } = require('../middleware');
const { logger } = require('../utils/logger');
const TranslationService = require('./TranslationService');

class GameService {
  constructor(db) {
    this.db = db;
    this.vocabularyCollection = db.collection(COLLECTIONS.VOCABULARY);
    this.categoryCollection = db.collection(COLLECTIONS.CATEGORIES);
    this.gameSessionsCollection = db.collection(COLLECTIONS.GAME_SESSIONS);
    this.userCollection = db.collection(COLLECTIONS.USERS);
    this.translationService = new TranslationService();
  }

  /**
   * Get Comprehensive Test Questions
   * Logic:
   * 1. Check user level logic (handled in controller or valid here)
   * 2. Find admin-owned categories matching difficulty
   * 3. Pick random categories
   * 4. Pick random vocabulary from those categories
   * 5. Generate mixed question types
   */
  async getTestQuestions(difficulty, count = 25) {
    try {
      // 1. Find Admin Users
      const adminUsers = await this.userCollection.find({ role: USER_ROLES.ADMIN }).project({ _id: 1 }).toArray();
      const adminIds = adminUsers.map(u => u._id);

      if (adminIds.length === 0) {
        throw new AppError('Không tìm thấy tài khoản Admin để lấy dữ liệu', 404);
      }

      // 2. Find Admin Categories matching difficulty
      // Map UI difficulty (Easy/Medium/Hard) to DB difficulty (beginner/intermediate/advanced)
      const difficultyMap = {
        'Easy': DIFFICULTY_LEVELS.BEGINNER,
        'Medium': DIFFICULTY_LEVELS.INTERMEDIATE,
        'Hard': DIFFICULTY_LEVELS.ADVANCED
      };
      
      const dbDifficulty = difficultyMap[difficulty] || DIFFICULTY_LEVELS.BEGINNER;

      const query = {
        userId: { $in: adminIds },
        difficulty: dbDifficulty
      };
      
      const categories = await this.categoryCollection
        .aggregate([
          { $match: query },
          { $sample: { size: 5 } } // Pick up to 5 random categories
        ])
        .toArray();

      if (categories.length === 0) {
        // Fallback: try finding any admin categories if specific difficulty not found
        throw new AppError(`Không tìm thấy bộ đề phù hợp với độ khó: ${difficulty} (${dbDifficulty})`, 404);
      }

      // 3. Get random vocabulary from EACH category (5 words per category)
      let allVocabulary = [];
      
      for (const category of categories) {
        const words = await this.vocabularyCollection
          .aggregate([
            { $match: { categoryId: category._id } },
            { $sample: { size: 5 } }
          ])
          .toArray();
        
        allVocabulary = [...allVocabulary, ...words];
      }

      if (allVocabulary.length < 5) {
         throw new AppError('Không đủ dữ liệu từ vựng để tạo bài kiểm tra', 404);
      }
      
      // Shuffle the combined vocabulary
      const vocabulary = this.shuffleArray(allVocabulary);

      // 4. Generate Mixed Questions
      // Types: 'listening', 'matching', 'fill_blank', 'reverse', 'skids_vocabulary'
      const GAME_TYPES = ['listening', 'matching', 'fill_blank', 'reverse', 'skids_vocabulary'];
      
      const questions = await Promise.all(vocabulary.map(async (word, index) => {
        // Round-robin or random type
        const type = GAME_TYPES[index % GAME_TYPES.length];
        
        // Common needed data: distractors
        const distractors = await this.vocabularyCollection.aggregate([
          { $match: { _id: { $ne: word._id } } }, // Ideally matching difficulty/category too, but broadly ok
          { $sample: { size: 3 } }
        ]).toArray();
        
        const question = {
          id: index,
          type: type,
          correctAnswer: {
            id: word._id,
            traditional: word.traditional,
            pinyin: word.pinyin,
            meaning: word.meaning,
            audioUrl: word.audioUrl
          }
        };

        // Specific construction per type
        if (type === 'listening' || type === 'fill_blank' || type === 'reverse' || type === 'skids_vocabulary') {
          // Add options
          const options = [word, ...distractors].map(w => ({
            id: w._id,
            traditional: w.traditional,
            pinyin: w.pinyin,
            meaning: w.meaning
          }));
          question.options = this.shuffleArray(options);
        } else if (type === 'matching') {
          // Matching is usually a set of pairs, but if we do 1 question = 1 pair it's too easy?
          // Actually matching game usually takes a set of words. 
          // To simplify "mixed" test, let's make 'matching' a mini-game of 4 pairs around this word?
          // OR: Just reuse the word + distractors to form pairs for a single screen
          const group = [word, ...distractors];
          question.pairs = {
            left: this.shuffleArray(group.map(w => ({ id: w._id, text: w.traditional }))),
            right: this.shuffleArray(group.map(w => ({ id: w._id, text: w.meaning })))
          };
          question.data = word; // Reference
        }
        
        // For listening/fill/skids: add extra data
        if (type === 'listening') question.data = word;
        if (type === 'fill_blank') question.data = word; // Sentence logic? 
        if (type === 'skids_vocabulary') question.data = word; // Flashcard learning mode
        // Note: Real fill-blank needs example sentences. If empty, maybe skip or fallback to translation?
        // assuming client handles simple visual if no example.

        return question;
      }));

      return questions;

    } catch (error) {
      logger.error('Get test questions error', { error: error.message });
      throw error;
    }
  }

  /**
   * Submit Test Result
   * Calculate score, update stats (XP, Level, Words)
   */
  async submitTestResult(userId, resultData) {
    try {
      const { score, totalQuestions, answers } = resultData;
      
      // 1. Calculate XP
      // Base idea: 10 XP per correct answer
      // Bonus?
      const xpGained = parseInt(score) || 0;
      
      // 2. Estimate "Words Learned"
      // In a real app, we track individual word progress. 
      // Simplified: Just increment totalWords randomly or based on unique correct IDs?
      // Let's increment by count of correct answers * factor if not already tracked? 
      // For now, let's just use a simple heuristic: 1 word per correct answer
      // But we should check uniqueness or just add to counter
      const wordsLearned = Math.floor(xpGained / 10); // Rough estimate
      
      // 3. Update User Stats
      const user = await this.userCollection.findOne({ _id: new ObjectId(userId) });
      if (!user) throw new AppError('User not found', 404);
      
      const currentStats = user.stats || { experience: 0, level: 1, totalWords: 0 };
      const newExp = (currentStats.experience || 0) + xpGained;
      const newTotalWords = (currentStats.totalWords || 0) + wordsLearned;
      
      // Level Calculation: 1000 XP per level
      const newLevel = Math.floor(newExp / 1000) + 1;
      const leveledUp = newLevel > (currentStats.level || 1);
      
      // 4. Update Streak
      const currentStreak = user.streak || { current: 0, longest: 0, lastStudyDate: null };
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streakUpdated = false;
      let newStreakCurrent = currentStreak.current || 0;
      let newStreakLongest = currentStreak.longest || 0;
      
      if (currentStreak.lastStudyDate) {
        const lastStudyDate = new Date(currentStreak.lastStudyDate);
        lastStudyDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today - lastStudyDate) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 0) {
          // Same day, no change to streak
          streakUpdated = false;
        } else if (daysDiff === 1) {
          // Consecutive day - increment streak
          newStreakCurrent++;
          if (newStreakCurrent > newStreakLongest) {
            newStreakLongest = newStreakCurrent;
          }
          streakUpdated = true;
        } else {
          // Missed days - reset streak
          newStreakCurrent = 1;
          streakUpdated = true;
        }
      } else {
        // First time studying
        newStreakCurrent = 1;
        newStreakLongest = 1;
        streakUpdated = true;
      }
      
      // Update DB
      const updateFields = {
        'stats.experience': newExp,
        'stats.level': newLevel,
        'stats.totalWords': newTotalWords,
        'stats.lastActivity': new Date()
      };
      
      if (streakUpdated || !currentStreak.lastStudyDate) {
        updateFields['streak.current'] = newStreakCurrent;
        updateFields['streak.longest'] = newStreakLongest;
        updateFields['streak.lastStudyDate'] = today;
      }
      
      await this.userCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateFields }
      );
      
      // Log / Save history with detailed results
      await this.gameSessionsCollection.insertOne({
        userId: new ObjectId(userId),
        gameType: 'test-comprehensive',
        score: score, // Actual score from test
        totalQuestions: totalQuestions,
        correctAnswers: Math.floor(score / 10), // Assuming 10 points per correct answer
        answers: answers || [], // Store all answers for tracking
        difficulty: resultData.difficulty || 'mixed',
        details: resultData.details || {}, // Round-by-round scores
        duration: resultData.duration || 0,
        timeTaken: resultData.duration || 0,
        completedAt: new Date(),
        createdAt: new Date()
      });
      
      // Record activity and check achievements (only for game_test.html)
      try {
        const achievementService = require('./achievementService');
        
        // Calculate correct answers more accurately
        let correctAnswersCount = 0;
        if (answers && answers.length > 0) {
          correctAnswersCount = answers.filter(a => a.correct).length;
        } else {
          // Fallback: estimate from score if answers not provided
          correctAnswersCount = Math.floor(score / 10);
        }
        
        const percentage = totalQuestions > 0 
          ? Math.round((correctAnswersCount / totalQuestions) * 100) 
          : 0;
        
        const testData = {
          categoryId: resultData.categoryId || null,
          difficulty: resultData.difficulty || 'mixed',
          score: score,
          totalQuestions: totalQuestions,
          correctAnswers: correctAnswersCount,
          percentage: percentage,
          answers: answers || [],
          duration: resultData.duration || 0
        };
        
        await achievementService.recordTestActivity(this.db, userId, testData);
        logger.info('Activity and achievements recorded successfully', { userId });
      } catch (achievementError) {
        logger.warn('Failed to record activity/achievements', { error: achievementError.message });
        // Don't fail the entire request if achievement recording fails
      }
      
      // Update user progress for learned vocabulary (correct answers only)
      if (answers && answers.length > 0) {
        const correctAnswers = answers.filter(a => a.correct && a.vocabularyId);
        const uniqueVocabIds = [...new Set(correctAnswers.map(a => a.vocabularyId))];
        
        // Update or create progress for each learned vocabulary
        for (const vocabId of uniqueVocabIds) {
          try {
            const vocabObjectId = new ObjectId(vocabId);
            
            // Check if progress already exists
            const existingProgress = await this.userProgressCollection.findOne({
              userId: new ObjectId(userId),
              vocabularyId: vocabObjectId
            });
            
            const currentDate = new Date();
            
            if (existingProgress) {
              // Update existing progress
              await this.userProgressCollection.updateOne(
                { _id: existingProgress._id },
                { 
                  $set: { 
                    lastReviewedAt: currentDate,
                    updatedAt: currentDate
                  },
                  $inc: { 
                    reviewCount: 1,
                    correctCount: 1
                  }
                }
              );
            } else {
              // Create new progress entry
              await this.userProgressCollection.insertOne({
                userId: new ObjectId(userId),
                vocabularyId: vocabObjectId,
                status: 'learning', // Can be: 'new', 'learning', 'reviewing', 'mastered'
                reviewCount: 1,
                correctCount: 1,
                wrongCount: 0,
                lastReviewedAt: currentDate,
                nextReviewDate: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000), // Review again tomorrow
                createdAt: currentDate,
                updatedAt: currentDate
              });
            }
          } catch (err) {
            logger.warn('Failed to update progress for vocabulary', { vocabId, error: err.message });
          }
        }
      }
      
      return {
        success: true,
        xpGained,
        newLevel,
        leveledUp,
        newTotalWords,
        streak: {
          current: newStreakCurrent,
          longest: newStreakLongest,
          increased: streakUpdated && newStreakCurrent > (currentStreak.current || 0)
        }
      };
      
    } catch (error) {
      logger.error('Submit test result error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Listening Quiz
   * Generate random vocabulary quiz
   */
  async getListeningQuiz(categoryId, count = 10, language = 'vi') {
    try {
      if (!ObjectId.isValid(categoryId)) {
        throw new AppError(
          'Category ID không hợp lệ',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Get random vocabulary from category
      const vocabulary = await this.vocabularyCollection
        .aggregate([
          { $match: { categoryId: new ObjectId(categoryId) } },
          { $sample: { size: parseInt(count) } }
        ])
        .toArray();

      if (vocabulary.length === 0) {
        throw new AppError(
          'Không có từ vựng trong danh mục này',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Create quiz for each word
      const quizzes = await Promise.all(vocabulary.map(async (word) => {
        // Get 3 wrong answers
        const wrongAnswers = await this.vocabularyCollection
          .aggregate([
            { 
              $match: { 
                _id: { $ne: word._id },
                categoryId: new ObjectId(categoryId)
              } 
            },
            { $sample: { size: 3 } }
          ])
          .toArray();

        // Create 4 options (1 correct + 3 wrong) with auto-translation
        const options = [
          { 
            id: word._id.toString(), 
            text: this._getTranslatedMeaning(word, language), 
            isCorrect: true 
          },
          ...wrongAnswers.map(w => ({ 
            id: w._id.toString(), 
            text: this._getTranslatedMeaning(w, language), 
            isCorrect: false 
          }))
        ];

        // Shuffle options
        const shuffledOptions = this.shuffleArray(options);

        return {
          id: word._id,
          traditional: word.traditional,
          simplified: word.simplified,
          pinyin: word.pinyin,
          audioUrl: word.audioUrl,
          options: shuffledOptions
        };
      }));

      return quizzes;
    } catch (error) {
      logger.error('Get listening quiz error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Matching Game
   * Generate word pairs for matching
   */
  async getMatchingGame(categoryId, count = 8) {
    try {
      if (!ObjectId.isValid(categoryId)) {
        throw new AppError(
          'Category ID không hợp lệ',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Get random vocabulary
      const vocabulary = await this.vocabularyCollection
        .aggregate([
          { $match: { categoryId: new ObjectId(categoryId) } },
          { $sample: { size: parseInt(count) } }
        ])
        .toArray();

      if (vocabulary.length === 0) {
        throw new AppError(
          'Không có từ vựng trong danh mục này',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Create pairs
      const words = vocabulary.map(word => ({
        id: `word-${word._id}`,
        type: 'word',
        content: word.traditional,
        pairId: word._id.toString()
      }));

      const meanings = vocabulary.map(word => ({
        id: `meaning-${word._id}`,
        type: 'meaning',
        content: word.meaning,
        pairId: word._id.toString()
      }));

      // Combine and shuffle
      const allCards = this.shuffleArray([...words, ...meanings]);

      return {
        cards: allCards,
        totalPairs: vocabulary.length
      };
    } catch (error) {
      logger.error('Get matching game error', { error: error.message });
      throw error;
    }
  }

  /**
   * Save Game Session
   */
  async saveGameSession(userId, sessionData) {
    try {
      const session = {
        userId: new ObjectId(userId),
        gameType: sessionData.gameType,
        categoryId: sessionData.categoryId ? new ObjectId(sessionData.categoryId) : null,
        difficulty: sessionData.difficulty || null,
        score: sessionData.score,
        totalQuestions: sessionData.totalQuestions,
        correctAnswers: sessionData.correctAnswers,
        answers: sessionData.answers || [],
        duration: sessionData.duration || sessionData.timeTaken || 0,
        timeTaken: sessionData.timeTaken || 0,
        completedAt: new Date(),
        createdAt: new Date()
      };

      const result = await this.gameSessionsCollection.insertOne(session);

      logger.info('Game session saved', { 
        userId, 
        gameType: sessionData.gameType 
      });

      return {
        id: result.insertedId,
        ...session
      };
    } catch (error) {
      logger.error('Save game session error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get User Game History
   */
  async getGameHistory(userId, filters = {}) {
    try {
      const query = { userId: new ObjectId(userId) };
      
      if (filters.gameType) {
        query.gameType = filters.gameType;
      }

      const page = parseInt(filters.page) || 1;
      const limit = parseInt(filters.limit) || 20;
      const skip = (page - 1) * limit;

      const [sessions, total] = await Promise.all([
        this.gameSessionsCollection
          .find(query)
          .sort({ completedAt: -1 })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.gameSessionsCollection.countDocuments(query)
      ]);

      return {
        sessions,
        pagination: {
          page,
          limit,
          total
        }
      };
    } catch (error) {
      logger.error('Get game history error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Fill In The Blanks Game
   * Generate questions with missing characters from Chinese words
   */
  async getFillInTheBlanks(categoryId, count = 10) {
    try {
      if (!ObjectId.isValid(categoryId)) {
        throw new AppError(
          'Category ID không hợp lệ',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Get random vocabulary from category
      const vocabulary = await this.vocabularyCollection
        .aggregate([
          { $match: { categoryId: new ObjectId(categoryId) } },
          { $sample: { size: parseInt(count) } }
        ])
        .toArray();

      if (vocabulary.length === 0) {
        throw new AppError(
          'Không có từ vựng trong danh mục này',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Create fill-in-the-blank questions
      const questions = vocabulary.map(word => {
        // Use simplified Chinese for blanks (easier to process)
        const targetWord = word.simplified || word.traditional;
        
        // Skip if word is too short
        if (targetWord.length < 2) {
          return null;
        }

        // Generate blank position and correct answer
        const blankInfo = this.generateBlank(targetWord);
        
        // Generate wrong answers (distractors)
        const distractors = this.generateDistractors(
          blankInfo.correctAnswer,
          targetWord,
          3
        );

        // Create options (1 correct + 3 wrong)
        const options = [
          { text: blankInfo.correctAnswer, isCorrect: true },
          ...distractors.map(d => ({ text: d, isCorrect: false }))
        ];

        // Shuffle options
        const shuffledOptions = this.shuffleArray(options);

        return {
          id: word._id,
          word: {
            traditional: word.traditional,
            simplified: word.simplified,
            pinyin: word.pinyin,
            meaning: word.meaning,
            example: word.example
          },
          question: {
            displayWord: blankInfo.displayWord, // Word with blank: "你_"
            prefix: blankInfo.prefix,            // Part before blank: "你"
            suffix: blankInfo.suffix,            // Part after blank: ""
            blankLength: blankInfo.correctAnswer.length
          },
          options: shuffledOptions,
          hint: word.pinyin // Pinyin as hint
        };
      }).filter(q => q !== null);

      if (questions.length === 0) {
        throw new AppError(
          'Không thể tạo câu hỏi từ danh mục này (từ quá ngắn)',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      return questions;
    } catch (error) {
      logger.error('Get fill in the blanks error', { error: error.message });
      throw error;
    }
  }

  /**
   * Generate blank from word
   * Returns display word with blank and correct answer
   */
  generateBlank(word) {
    const length = word.length;
    
    // For 2-character words: blank the 2nd character
    // For 3+ character words: blank middle or last character
    let blankPosition;
    let blankSize;

    if (length === 2) {
      blankPosition = 1;
      blankSize = 1;
    } else if (length === 3) {
      // Randomly blank position 1 or 2
      blankPosition = Math.random() > 0.5 ? 1 : 2;
      blankSize = 1;
    } else {
      // For longer words, blank 1-2 characters from middle/end
      blankPosition = Math.floor(length / 2);
      blankSize = Math.random() > 0.5 ? 1 : 2;
      
      // Make sure we don't go out of bounds
      if (blankPosition + blankSize > length) {
        blankSize = 1;
      }
    }

    const prefix = word.substring(0, blankPosition);
    const correctAnswer = word.substring(blankPosition, blankPosition + blankSize);
    const suffix = word.substring(blankPosition + blankSize);
    const displayWord = prefix + '_'.repeat(blankSize) + suffix;

    return {
      prefix,
      correctAnswer,
      suffix,
      displayWord
    };
  }

  /**
   * Generate distractor answers
   */
  generateDistractors(correctAnswer, originalWord, count = 3) {
    const distractors = new Set();
    
    // Common Chinese characters pool for distractors
    const commonChars = [
      '的', '一', '是', '不', '了', '人', '我', '在', '有', '他',
      '这', '个', '们', '中', '来', '上', '大', '为', '和', '国',
      '地', '到', '以', '说', '时', '要', '就', '出', '会', '可',
      '也', '你', '对', '生', '能', '而', '子', '那', '得', '于',
      '着', '下', '自', '之', '年', '过', '发', '后', '作', '里',
      '用', '道', '行', '所', '然', '家', '种', '事', '成', '方',
      '多', '经', '么', '去', '法', '学', '如', '都', '同', '现',
      '当', '没', '动', '面', '起', '看', '定', '天', '分', '还'
    ];

    // Strategy 1: Random common characters of same length
    while (distractors.size < count) {
      let distractor = '';
      for (let i = 0; i < correctAnswer.length; i++) {
        const randomChar = commonChars[Math.floor(Math.random() * commonChars.length)];
        distractor += randomChar;
      }
      
      // Make sure it's not the correct answer or part of original word
      if (distractor !== correctAnswer && !originalWord.includes(distractor)) {
        distractors.add(distractor);
      }
    }

    return Array.from(distractors);
  }

  /**
   * Get Vocabulary Cards
   * Get vocabulary for flashcard learning
   */
  async getVocabularyCards(categoryId, count = 10) {
    try {
      if (!ObjectId.isValid(categoryId)) {
        throw new AppError(
          'Category ID không hợp lệ',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Get random vocabulary from category
      const vocabulary = await this.vocabularyCollection
        .aggregate([
          { $match: { categoryId: new ObjectId(categoryId) } },
          { $sample: { size: parseInt(count) } }
        ])
        .toArray();

      if (vocabulary.length === 0) {
        throw new AppError(
          'Không có từ vựng trong danh mục này',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Format cards with all info
      const cards = vocabulary.map(word => ({
        id: word._id,
        traditional: word.traditional,
        simplified: word.simplified,
        pinyin: word.pinyin,
        meaning: word.meaning,
        difficulty: word.difficulty,
        // Get first letter of traditional for display
        letter: word.traditional.charAt(0)
      }));

      return cards;
    } catch (error) {
      logger.error('Get vocabulary cards error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Reverse Quiz
   * User sees image and selects matching word
   */
  async getReverseQuiz(categoryId, count = 10) {
    try {
      if (!ObjectId.isValid(categoryId)) {
        throw new AppError(
          'Category ID không hợp lệ',
          HTTP_STATUS.BAD_REQUEST,
          ERROR_CODES.INVALID_INPUT
        );
      }

      // Get random vocabulary from category
      const vocabulary = await this.vocabularyCollection
        .aggregate([
          { $match: { categoryId: new ObjectId(categoryId) } },
          { $sample: { size: parseInt(count) } }
        ])
        .toArray();

      if (vocabulary.length === 0) {
        throw new AppError(
          'Không có từ vựng trong danh mục này',
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Create quiz for each word
      const quizzes = await Promise.all(vocabulary.map(async (word) => {
        // Get 3 wrong answers from same category
        const wrongAnswers = await this.vocabularyCollection
          .aggregate([
            { 
              $match: { 
                _id: { $ne: word._id },
                categoryId: new ObjectId(categoryId)
              } 
            },
            { $sample: { size: 3 } }
          ])
          .toArray();

        // Create 4 options (1 correct + 3 wrong)
        const options = [
          { 
            id: word._id.toString(), 
            meaning: word.meaning,
            pinyin: word.pinyin,
            isCorrect: true 
          },
          ...wrongAnswers.map(w => ({ 
            id: w._id.toString(), 
            meaning: w.meaning,
            pinyin: w.pinyin,
            isCorrect: false 
          }))
        ];

        // Shuffle options
        const shuffledOptions = this.shuffleArray(options);

        return {
          id: word._id,
          traditional: word.traditional,
          simplified: word.simplified,
          pinyin: word.pinyin,
          meaning: word.meaning,
          difficulty: word.difficulty,
          imageUrl: word.imageUrl || this.getPlaceholderImage(word.meaning),
          hint: word.pinyin,
          options: shuffledOptions
        };
      }));

      return quizzes;
    } catch (error) {
      logger.error('Get reverse quiz error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get placeholder image URL based on word meaning
   * Uses Unsplash Source for random images related to the word
   */
  getPlaceholderImage(meaning) {
    // Use first English word from meaning as search term
    const searchTerm = meaning.split(',')[0].split('(')[0].trim().toLowerCase();
    // Unsplash Source API for random images
    return `https://source.unsplash.com/800x600/?${encodeURIComponent(searchTerm)}`;
  }
  
  /**
   * Get categories by difficulty for a user
   * Returns all categories (user's + admin's) matching the difficulty
   */
  async getCategoriesByDifficulty(difficulty, userId = null) {
    try {
      // Build query
      const query = {
        difficulty: difficulty
      };
      
      // If userId provided, include both user's categories and admin categories
      if (userId) {
        const adminUsers = await this.userCollection.find({ role: USER_ROLES.ADMIN }).project({ _id: 1 }).toArray();
        const adminIds = adminUsers.map(u => u._id);
        
        query.$or = [
          { userId: new ObjectId(userId), isPrivate: true }, // User's private categories
          { userId: { $in: adminIds }, isPrivate: false }     // Public admin categories
        ];
      } else {
        // If no userId, only get public admin categories
        const adminUsers = await this.userCollection.find({ role: USER_ROLES.ADMIN }).project({ _id: 1 }).toArray();
        const adminIds = adminUsers.map(u => u._id);
        query.userId = { $in: adminIds };
        query.isPrivate = false;
      }
      
      const categories = await this.categoryCollection.find(query).toArray();
      return categories;
    } catch (error) {
      logger.error('Get categories by difficulty error', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get random vocabulary from multiple categories by difficulty
   */
  async getVocabularyByDifficulty(difficulty, count, userId = null) {
    try {
      // Get all categories matching difficulty
      const categories = await this.getCategoriesByDifficulty(difficulty, userId);
      
      if (categories.length === 0) {
        throw new AppError(
          `Không tìm thấy bộ đề nào cho mức độ: ${difficulty}`,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }
      
      // Get category IDs
      const categoryIds = categories.map(cat => cat._id);
      
      // Get random vocabulary from these categories
      const vocabulary = await this.vocabularyCollection
        .aggregate([
          { $match: { categoryId: { $in: categoryIds } } },
          { $sample: { size: parseInt(count) } }
        ])
        .toArray();
      
      if (vocabulary.length === 0) {
        throw new AppError(
          `Không tìm thấy từ vựng nào cho mức độ: ${difficulty}`,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }
      
      return vocabulary;
    } catch (error) {
      logger.error('Get vocabulary by difficulty error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Listening Quiz by Difficulty
   */
  async getListeningQuizByDifficulty(difficulty, count = 5, userId = null, language = 'vi') {
    try {
      // Get random vocabulary from multiple categories by difficulty
      const vocabulary = await this.getVocabularyByDifficulty(difficulty, count, userId);
      
      // Generate quizzes (same logic as getListeningQuiz)
      const quizzes = await Promise.all(vocabulary.map(async (word) => {
        // Get 3 random wrong answers from same difficulty
        const wrongAnswers = await this.vocabularyCollection
          .aggregate([
            { 
              $match: { 
                categoryId: { $ne: word.categoryId },
                _id: { $ne: word._id }
              } 
            },
            { $sample: { size: 3 } }
          ])
          .toArray();

        // Combine correct + wrong answers and shuffle with auto-translation
        const allOptions = [
          { text: this._getTranslatedMeaning(word, language), isCorrect: true },
          ...wrongAnswers.map(w => ({ text: this._getTranslatedMeaning(w, language), isCorrect: false }))
        ];
        const shuffledOptions = this.shuffleArray(allOptions);

        return {
          word: {
            traditional: word.traditional,
            simplified: word.simplified,
            pinyin: word.pinyin,
            meaning: this._getTranslatedMeaning(word, language)
          },
          audio: word.audio || null,
          options: shuffledOptions
        };
      }));

      return quizzes;
    } catch (error) {
      logger.error('Get listening quiz by difficulty error', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get Matching Game by Difficulty
   */
  async getMatchingGameByDifficulty(difficulty, count = 4, userId = null) {
    try {
      const vocabulary = await this.getVocabularyByDifficulty(difficulty, count, userId);

      // Create pairs (same format as getMatchingGame)
      const words = vocabulary.map(word => ({
        id: `word-${word._id}`,
        type: 'word',
        content: word.traditional,
        pairId: word._id.toString()
      }));

      const meanings = vocabulary.map(word => ({
        id: `meaning-${word._id}`,
        type: 'meaning',
        content: word.meaning,
        pairId: word._id.toString()
      }));

      // Combine and shuffle
      const allCards = this.shuffleArray([...words, ...meanings]);

      return {
        cards: allCards,
        totalPairs: vocabulary.length
      };
    } catch (error) {
      logger.error('Get matching game by difficulty error', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get Reverse Quiz by Difficulty
   */
  async getReverseQuizByDifficulty(difficulty, count = 5, userId = null) {
    try {
      const vocabulary = await this.getVocabularyByDifficulty(difficulty, count, userId);

      const quizzes = await Promise.all(vocabulary.map(async (word) => {
        const wrongAnswers = await this.vocabularyCollection
          .aggregate([
            { 
              $match: { 
                _id: { $ne: word._id }
              } 
            },
            { $sample: { size: 3 } }
          ])
          .toArray();

        const allOptions = [
          { text: `${word.traditional} (${word.pinyin})`, isCorrect: true },
          ...wrongAnswers.map(w => ({ 
            text: `${w.traditional} (${w.pinyin})`, 
            isCorrect: false 
          }))
        ];
        const shuffledOptions = this.shuffleArray(allOptions);

        return {
          word: {
            traditional: word.traditional,
            simplified: word.simplified,
            pinyin: word.pinyin,
            meaning: word.meaning
          },
          imageUrl: word.imageUrl || this.getPlaceholderImage(word.meaning),
          hint: word.pinyin,
          options: shuffledOptions
        };
      }));

      return quizzes;
    } catch (error) {
      logger.error('Get reverse quiz by difficulty error', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get Vocabulary Cards by Difficulty
   */
  async getVocabularyCardsByDifficulty(difficulty, count = 10, userId = null) {
    try {
      const vocabulary = await this.getVocabularyByDifficulty(difficulty, count, userId);

      return vocabulary.map(word => ({
        id: word._id.toString(),
        traditional: word.traditional,
        simplified: word.simplified,
        pinyin: word.pinyin,
        meaning: word.meaning,
        audio: word.audio || null,
        imageUrl: word.imageUrl || this.getPlaceholderImage(word.meaning)
      }));
    } catch (error) {
      logger.error('Get vocabulary cards by difficulty error', { error: error.message });
      throw error;
    }
  }
  
  /**
   * Get Fill In The Blanks by Difficulty
   */
  async getFillInTheBlanksByDifficulty(difficulty, count = 5, userId = null) {
    try {
      const vocabulary = await this.getVocabularyByDifficulty(difficulty, count, userId);

      const questions = await Promise.all(vocabulary.map(async (word) => {
        const traditional = word.traditional;
        const blankIndex = Math.floor(Math.random() * traditional.length);
        const blankChar = traditional[blankIndex];
        const displayWord = traditional.split('').map((char, i) => i === blankIndex ? '_' : char).join('');

        const wrongAnswers = await this.vocabularyCollection
          .aggregate([
            { $match: { _id: { $ne: word._id } } },
            { $sample: { size: 3 } }
          ])
          .toArray();

        const wrongChars = wrongAnswers
          .map(w => w.traditional)
          .join('')
          .split('')
          .filter(char => char !== blankChar)
          .slice(0, 3);

        const allOptions = this.shuffleArray([
          { char: blankChar, isCorrect: true },
          ...wrongChars.map(char => ({ char, isCorrect: false }))
        ]);

        return {
          word: {
            traditional: word.traditional,
            simplified: word.simplified,
            pinyin: word.pinyin,
            meaning: word.meaning
          },
          question: {
            displayWord,
            blankIndex,
            correctChar: blankChar
          },
          options: allOptions
        };
      }));

      return questions;
    } catch (error) {
      logger.error('Get fill in blanks by difficulty error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get the appropriate meaning field based on language
  /**
   * Get translated meaning from vocabulary word
   * @param {object} word - Vocabulary word object
   * @param {string} language - Language code ('vi', 'en', 'tw')
   * @returns {string} - Translated meaning
   */
  _getTranslatedMeaning(word, language) {
    if (language === 'vi') {
      return word.meaning;
    }

    const fieldMap = {
      'en': 'meaningEn',
      'tw': 'meaningTw'
    };

    const dbField = fieldMap[language];
    
    // First try to get from database
    if (word[dbField]) {
      return word[dbField];
    }

    // Fallback to TranslationService for auto-translation
    return this.translationService.translate(word.meaning, language);
  }

  /**
   * Shuffle array helper
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

module.exports = GameService;
