/**
 * Progress Service
 * Business logic for user progress tracking
 */

const { ObjectId } = require('mongodb');
const { 
  COLLECTIONS,
  LEARNING_STATUS,
  ERROR_MESSAGES,
  HTTP_STATUS,
  ERROR_CODES
} = require('../constants');
const { AppError } = require('../middleware');
const { logger } = require('../utils/logger');

class ProgressService {
  constructor(db) {
    this.db = db;
    this.collection = db.collection(COLLECTIONS.USER_PROGRESS);
    this.usersCollection = db.collection(COLLECTIONS.USERS);
    this.vocabularyCollection = db.collection(COLLECTIONS.VOCABULARY);
  }

  /**
   * Get user progress
   */
  async getUserProgress(userId, filters = {}) {
    try {
      const query = { userId: new ObjectId(userId) };
      
      if (filters.vocabularyId) {
        query.vocabularyId = new ObjectId(filters.vocabularyId);
      }
      if (filters.status) {
        query.status = filters.status;
      }

      const progress = await this.collection
        .find(query)
        .sort({ updatedAt: -1 })
        .toArray();

      return progress;
    } catch (error) {
      logger.error('Get user progress error', { error: error.message });
      throw error;
    }
  }

  /**
   * Update progress after practice
   */
  async updateProgress(userId, progressData) {
    try {
      const { vocabularyId, isCorrect, timeTaken, gameType } = progressData;

      // Check if vocabulary exists
      const vocabulary = await this.vocabularyCollection.findOne({ 
        _id: new ObjectId(vocabularyId) 
      });

      if (!vocabulary) {
        throw new AppError(
          ERROR_MESSAGES.RESOURCE_NOT_FOUND,
          HTTP_STATUS.NOT_FOUND,
          ERROR_CODES.RESOURCE_NOT_FOUND
        );
      }

      // Find or create progress record
      let progressRecord = await this.collection.findOne({
        userId: new ObjectId(userId),
        vocabularyId: new ObjectId(vocabularyId),
      });

      if (!progressRecord) {
        // Create new progress record
        progressRecord = {
          userId: new ObjectId(userId),
          vocabularyId: new ObjectId(vocabularyId),
          status: LEARNING_STATUS.NEW,
          attempts: 0,
          correctAttempts: 0,
          lastPracticed: null,
          nextReview: null,
          createdAt: new Date(),
        };
      }

      // Update progress
      progressRecord.attempts += 1;
      if (isCorrect) {
        progressRecord.correctAttempts += 1;
      }
      progressRecord.lastPracticed = new Date();
      progressRecord.updatedAt = new Date();

      // Calculate accuracy
      const accuracy = progressRecord.correctAttempts / progressRecord.attempts;

      // Update status based on performance
      if (accuracy >= 0.8 && progressRecord.attempts >= 5) {
        progressRecord.status = LEARNING_STATUS.MASTERED;
        progressRecord.nextReview = this.calculateNextReview(30); // 30 days
      } else if (progressRecord.attempts >= 2) {
        progressRecord.status = LEARNING_STATUS.REVIEWING;
        progressRecord.nextReview = this.calculateNextReview(7); // 7 days
      } else {
        progressRecord.status = LEARNING_STATUS.LEARNING;
        progressRecord.nextReview = this.calculateNextReview(1); // 1 day
      }

      // Save progress
      await this.collection.updateOne(
        { 
          userId: new ObjectId(userId), 
          vocabularyId: new ObjectId(vocabularyId) 
        },
        { $set: progressRecord },
        { upsert: true }
      );

      // Update user stats
      await this.updateUserStats(userId);

      logger.info('Progress updated', { userId, vocabularyId, isCorrect });

      return progressRecord;
    } catch (error) {
      logger.error('Update progress error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get words due for review
   */
  async getDueForReview(userId, limit = 20) {
    try {
      const now = new Date();

      const dueWords = await this.collection
        .aggregate([
          {
            $match: {
              userId: new ObjectId(userId),
              nextReview: { $lte: now },
              status: { $ne: LEARNING_STATUS.MASTERED },
            },
          },
          {
            $lookup: {
              from: COLLECTIONS.VOCABULARY,
              localField: 'vocabularyId',
              foreignField: '_id',
              as: 'vocabulary',
            },
          },
          { $unwind: '$vocabulary' },
          { $limit: limit },
        ])
        .toArray();

      return dueWords;
    } catch (error) {
      logger.error('Get due for review error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId) {
    try {
      const stats = await this.collection.aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]).toArray();

      const totalAttempts = await this.collection.aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalAttempts: { $sum: '$attempts' },
            totalCorrect: { $sum: '$correctAttempts' },
          },
        },
      ]).toArray();

      const accuracy = totalAttempts[0]
        ? (totalAttempts[0].totalCorrect / totalAttempts[0].totalAttempts) * 100
        : 0;

      return {
        byStatus: stats.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        totalWords: stats.reduce((sum, curr) => sum + curr.count, 0),
        accuracy: Math.round(accuracy),
      };
    } catch (error) {
      logger.error('Get user stats error', { error: error.message });
      throw error;
    }
  }

  /**
   * Calculate next review date
   */
  calculateNextReview(daysToAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    return date;
  }

  /**
   * Update user overall stats
   */
  async updateUserStats(userId) {
    try {
      const stats = await this.getUserStats(userId);
      
      await this.usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            'stats.totalWords': stats.totalWords,
            'stats.accuracy': stats.accuracy / 100,
            'updatedAt': new Date(),
          },
        }
      );
    } catch (error) {
      logger.error('Update user stats error', { error: error.message });
      throw error;
    }
  }
}

module.exports = ProgressService;
