/**
 * Vocabulary Service
 * Business logic for vocabulary operations
 */

const { ObjectId } = require('mongodb');
const { 
  HTTP_STATUS, 
  ERROR_CODES, 
  ERROR_MESSAGES,
  COLLECTIONS,
  SORT_ORDER,
  DIFFICULTY_LEVELS
} = require('../constants');
const { AppError } = require('../middleware');
const { logger } = require('../utils/logger');

class VocabularyService {
  constructor(db) {
    this.db = db;
    this.collection = db.collection(COLLECTIONS.VOCABULARY);
  }

  /**
   * Get all vocabulary with filters
   * Only returns vocabulary from user's categories
   */
  async getAll(filters = {}) {
    try {
      const { 
        categoryId,
        difficulty,
        search,
        page = 1, 
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = SORT_ORDER.DESC,
        userId = null
      } = filters;

      // Build query - only show vocabulary from user's categories
      const query = {};
      
      if (categoryId) {
        // Specific category - verify it belongs to user
        if (userId) {
          const category = await this.db.collection(COLLECTIONS.CATEGORIES)
            .findOne({ _id: new ObjectId(categoryId), userId: new ObjectId(userId) });
          
          if (!category) {
            throw new AppError(
              'Danh mục không tồn tại hoặc không thuộc về bạn',
              HTTP_STATUS.FORBIDDEN,
              ERROR_CODES.AUTH_UNAUTHORIZED
            );
          }
        }
        query.categoryId = new ObjectId(categoryId);
      } else if (userId) {
        // No specific category - get all vocabulary from user's categories
        const userCategories = await this.db.collection(COLLECTIONS.CATEGORIES)
          .find({ userId: new ObjectId(userId) })
          .project({ _id: 1 })
          .toArray();
        
        const categoryIds = userCategories.map(c => c._id);
        if (categoryIds.length === 0) {
          // User has no categories yet
          return {
            vocabulary: [],
            pagination: { page, limit, total: 0 }
          };
        }
        query.categoryId = { $in: categoryIds };
      }
      
      if (difficulty) {
        query.difficulty = difficulty;
      }
      if (search) {
        query.$or = [
          { traditional: { $regex: search, $options: 'i' } },
          { simplified: { $regex: search, $options: 'i' } },
          { pinyin: { $regex: search, $options: 'i' } },
          { meaning: { $regex: search, $options: 'i' } },
        ];
      }

      const skip = (page - 1) * limit;

      const [vocabulary, total] = await Promise.all([
        this.collection
          .find(query)
          .sort({ [sortBy]: sortOrder })
          .skip(skip)
          .limit(limit)
          .toArray(),
        this.collection.countDocuments(query),
      ]);

      return {
        vocabulary,
        pagination: {
          page,
          limit,
          total,
        },
      };
    } catch (error) {
      logger.error('Get vocabulary error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get vocabulary by ID
   */
  async getById(vocabularyId) {
    try {
      const vocabulary = await this.collection.findOne({ _id: new ObjectId(vocabularyId) });

      if (!vocabulary) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      return vocabulary;
    } catch (error) {
      logger.error('Get vocabulary error', { error: error.message });
      throw error;
    }
  }

  /**
   * Create new vocabulary
   * Only allows creating in user's own categories
   */
  async create(vocabularyData, userId) {
    try {
      // Validate category exists AND belongs to user
      const category = await this.db
        .collection(COLLECTIONS.CATEGORIES)
        .findOne({ 
          _id: new ObjectId(vocabularyData.categoryId),
          userId: new ObjectId(userId)
        });

      if (!category) {
        throw new AppError(
          'Danh mục không tồn tại hoặc không thuộc về bạn',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTH_UNAUTHORIZED
        );
      }

      const newVocabulary = {
        categoryId: new ObjectId(vocabularyData.categoryId),
        traditional: vocabularyData.traditional,
        simplified: vocabularyData.simplified || vocabularyData.traditional,
        pinyin: vocabularyData.pinyin,
        meaning: vocabularyData.meaning,
        example: vocabularyData.example || '',
        audioUrl: vocabularyData.audioUrl || '',
        imageUrl: vocabularyData.imageUrl || '',
        difficulty: vocabularyData.difficulty || DIFFICULTY_LEVELS.BEGINNER,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await this.collection.insertOne(newVocabulary);

      logger.info('Vocabulary created', { traditional: vocabularyData.traditional });

      return {
        id: result.insertedId,
        ...newVocabulary,
      };
    } catch (error) {
      logger.error('Create vocabulary error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update vocabulary
   * Only allows updating vocabulary in user's own categories
   */
  async update(vocabularyId, updates, userId) {
    try {
      // First, check if vocabulary exists and belongs to user's category
      const vocabulary = await this.collection.findOne({ _id: new ObjectId(vocabularyId) });
      
      if (!vocabulary) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Verify the vocabulary's category belongs to user
      const category = await this.db.collection(COLLECTIONS.CATEGORIES)
        .findOne({ 
          _id: vocabulary.categoryId,
          userId: new ObjectId(userId)
        });

      if (!category) {
        throw new AppError(
          'Bạn không có quyền cập nhật từ vựng này',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTH_UNAUTHORIZED
        );
      }

      const allowedUpdates = [
        'categoryId', 
        'traditional', 
        'simplified', 
        'pinyin', 
        'meaning', 
        'example', 
        'audioUrl',
        'imageUrl', 
        'difficulty'
      ];
      const validUpdates = {};

      for (const key of allowedUpdates) {
        if (updates[key] !== undefined) {
          if (key === 'categoryId') {
            // If changing category, verify new category also belongs to user
            const newCategory = await this.db.collection(COLLECTIONS.CATEGORIES)
              .findOne({ 
                _id: new ObjectId(updates[key]),
                userId: new ObjectId(userId)
              });
            
            if (!newCategory) {
              throw new AppError(
                'Danh mục mới không tồn tại hoặc không thuộc về bạn',
                HTTP_STATUS.FORBIDDEN,
                ERROR_CODES.AUTH_UNAUTHORIZED
              );
            }
            validUpdates[key] = new ObjectId(updates[key]);
          } else {
            validUpdates[key] = updates[key];
          }
        }
      }

      validUpdates.updatedAt = new Date();

      const result = await this.collection.findOneAndUpdate(
        { _id: new ObjectId(vocabularyId) },
        { $set: validUpdates },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      logger.info('Vocabulary updated', { vocabularyId });

      return result;
    } catch (error) {
      logger.error('Update vocabulary error', { error: error.message });
      throw error;
    }
  }

  /**
   * Delete vocabulary
   * Only allows deleting vocabulary in user's own categories
   */
  async delete(vocabularyId, userId) {
    try {
      // First, check if vocabulary exists and belongs to user's category
      const vocabulary = await this.collection.findOne({ _id: new ObjectId(vocabularyId) });
      
      if (!vocabulary) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Verify the vocabulary's category belongs to user
      const category = await this.db.collection(COLLECTIONS.CATEGORIES)
        .findOne({ 
          _id: vocabulary.categoryId,
          userId: new ObjectId(userId)
        });

      if (!category) {
        throw new AppError(
          'Bạn không có quyền xóa từ vựng này',
          HTTP_STATUS.FORBIDDEN,
          ERROR_CODES.AUTH_UNAUTHORIZED
        );
      }

      const result = await this.collection.deleteOne({ _id: new ObjectId(vocabularyId) });

      if (result.deletedCount === 0) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      logger.info('Vocabulary deleted', { vocabularyId });

      return true;
    } catch (error) {
      logger.error('Delete vocabulary error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get random vocabulary for games
   * Only returns vocabulary from user's categories
   */
  async getRandom(count = 10, filters = {}) {
    try {
      const query = {};
      
      if (filters.categoryId) {
        // Specific category - verify it belongs to user if userId provided
        if (filters.userId) {
          const category = await this.db.collection(COLLECTIONS.CATEGORIES)
            .findOne({ _id: new ObjectId(filters.categoryId), userId: new ObjectId(filters.userId) });
          
          if (!category) {
            throw new AppError(
              'Danh mục không tồn tại hoặc không thuộc về bạn',
              HTTP_STATUS.FORBIDDEN,
              ERROR_CODES.AUTH_UNAUTHORIZED
            );
          }
        }
        query.categoryId = new ObjectId(filters.categoryId);
      } else if (filters.userId) {
        // No specific category - get from all user's categories
        const userCategories = await this.db.collection(COLLECTIONS.CATEGORIES)
          .find({ userId: new ObjectId(filters.userId) })
          .project({ _id: 1 })
          .toArray();
        
        const categoryIds = userCategories.map(c => c._id);
        if (categoryIds.length === 0) {
          // User has no categories yet
          return [];
        }
        query.categoryId = { $in: categoryIds };
      }
      
      if (filters.difficulty) {
        query.difficulty = filters.difficulty;
      }

      const vocabulary = await this.collection
        .aggregate([
          { $match: query },
          { $sample: { size: count } }
        ])
        .toArray();

      return vocabulary;
    } catch (error) {
      logger.error('Get random vocabulary error', { error: error.message });
      throw error;
    }
  }
}

module.exports = VocabularyService;
