/**
 * Dashboard Service
 * Business logic for dashboard statistics
 */

const { ObjectId } = require('mongodb');
const { COLLECTIONS } = require('../constants');
const { logger } = require('../utils/logger');

class DashboardService {
  constructor(db) {
    this.db = db;
    this.usersCollection = db.collection(COLLECTIONS.USERS);
    this.progressCollection = db.collection(COLLECTIONS.USER_PROGRESS);
    this.gameSessionsCollection = db.collection(COLLECTIONS.GAME_SESSIONS);
  }

  /**
   * Get Dashboard Statistics
   */
  async getStats(userId) {
    try {
      const userObjectId = new ObjectId(userId);

      // Get user info
      const user = await this.usersCollection.findOne(
        { _id: userObjectId },
        { projection: { password: 0 } }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Get learned words count
      const learnedWordsCount = await this.progressCollection
        .countDocuments({ userId: userObjectId });

      // Get words need review today
      const today = new Date();
      const reviewTodayCount = await this.progressCollection
        .countDocuments({
          userId: userObjectId,
          nextReview: { $lte: today }
        });

      // Get recent activity (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentSessions = await this.gameSessionsCollection
        .find({
          userId: userObjectId,
          completedAt: { $gte: sevenDaysAgo }
        })
        .sort({ completedAt: -1 })
        .limit(10)
        .toArray();

      // Game statistics
      const gameStats = await this.gameSessionsCollection
        .aggregate([
          { $match: { userId: userObjectId } },
          {
            $group: {
              _id: '$gameType',
              totalPlayed: { $sum: 1 },
              totalScore: { $sum: '$score' },
              avgScore: { $avg: '$score' },
              totalCorrect: { $sum: '$correctAnswers' },
              totalQuestions: { $sum: '$totalQuestions' }
            }
          }
        ])
        .toArray();

      // Progress by status
      const progressByStatus = await this.progressCollection
        .aggregate([
          { $match: { userId: userObjectId } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ])
        .toArray();

      // Learning streak
      const streak = user.streak || {
        current: 0,
        longest: 0,
        lastStudyDate: null
      };

      // Daily activity (last 7 days)
      const dailyActivity = await this.gameSessionsCollection
        .aggregate([
          {
            $match: {
              userId: userObjectId,
              completedAt: { $gte: sevenDaysAgo }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$completedAt' }
              },
              sessionsCount: { $sum: 1 },
              totalScore: { $sum: '$score' }
            }
          },
          { $sort: { _id: 1 } }
        ])
        .toArray();

      return {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          avatar: user.avatar,
          level: user.stats?.level || 1,
          experience: user.stats?.experience || 0
        },
        overview: {
          totalLearnedWords: learnedWordsCount,
          reviewTodayCount,
          currentStreak: streak.current,
          longestStreak: streak.longest,
          accuracy: user.stats?.accuracy || 0
        },
        progressByStatus: progressByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        gameStats: gameStats.map(stat => ({
          gameType: stat._id,
          totalPlayed: stat.totalPlayed,
          avgScore: Math.round(stat.avgScore),
          accuracy: stat.totalQuestions > 0 
            ? Math.round((stat.totalCorrect / stat.totalQuestions) * 100)
            : 0
        })),
        recentActivity: recentSessions.map(session => ({
          id: session._id,
          gameType: session.gameType,
          score: session.score,
          correctAnswers: session.correctAnswers,
          totalQuestions: session.totalQuestions,
          completedAt: session.completedAt
        })),
        dailyActivity: dailyActivity.map(day => ({
          date: day._id,
          sessions: day.sessionsCount,
          score: day.totalScore
        }))
      };
    } catch (error) {
      logger.error('Get dashboard stats error', { error: error.message });
      throw error;
    }
  }

  /**
   * Get Admin Dashboard Statistics
   */
  async getAdminStats() {
    try {
      // Total users
      const totalUsers = await this.usersCollection.countDocuments({
        role: 'student'
      });

      // Active users (logged in last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const activeUsers = await this.gameSessionsCollection
        .distinct('userId', {
          completedAt: { $gte: sevenDaysAgo }
        });

      // Total vocabulary
      const totalVocabulary = await this.db
        .collection(COLLECTIONS.VOCABULARY)
        .countDocuments();

      // Total categories
      const totalCategories = await this.db
        .collection(COLLECTIONS.CATEGORIES)
        .countDocuments();

      // Total game sessions
      const totalSessions = await this.gameSessionsCollection
        .countDocuments();

      // Recent game sessions
      const recentSessions = await this.gameSessionsCollection
        .aggregate([
          { $sort: { completedAt: -1 } },
          { $limit: 20 },
          {
            $lookup: {
              from: COLLECTIONS.USERS,
              localField: 'userId',
              foreignField: '_id',
              as: 'user'
            }
          },
          { $unwind: '$user' },
          {
            $project: {
              gameType: 1,
              score: 1,
              completedAt: 1,
              'user.email': 1,
              'user.fullName': 1
            }
          }
        ])
        .toArray();

      // Popular categories
      const popularCategories = await this.gameSessionsCollection
        .aggregate([
          {
            $group: {
              _id: '$categoryId',
              playCount: { $sum: 1 }
            }
          },
          { $sort: { playCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: COLLECTIONS.CATEGORIES,
              localField: '_id',
              foreignField: '_id',
              as: 'category'
            }
          },
          { $unwind: '$category' }
        ])
        .toArray();

      return {
        overview: {
          totalUsers,
          activeUsers: activeUsers.length,
          totalVocabulary,
          totalCategories,
          totalSessions
        },
        recentSessions,
        popularCategories: popularCategories.map(item => ({
          id: item.category._id,
          name: item.category.name,
          playCount: item.playCount
        }))
      };
    } catch (error) {
      logger.error('Get admin stats error', { error: error.message });
      throw error;
    }
  }
}

module.exports = DashboardService;
