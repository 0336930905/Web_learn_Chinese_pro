/**
 * Activity & Achievement Controller
 * Handles API endpoints for activities and achievements from game_test.html
 */

const { ObjectId } = require('mongodb');
const achievementService = require('../services/achievementService');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * @route POST /api/activities/test
 * @desc Record test completion from game_test.html
 * @access Private
 */
async function recordTestCompletion(req, res, next) {
  try {
    const userId = req.user.userId;
    const testData = req.body;
    
    // Validate required fields
    const requiredFields = ['score', 'totalQuestions', 'correctAnswers', 'percentage'];
    const missingFields = requiredFields.filter(field => testData[field] === undefined);
    
    if (missingFields.length > 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_CODES.MISSING_REQUIRED_FIELD,
        message: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }
    
    // Validate data types and ranges
    if (typeof testData.score !== 'number' || testData.score < 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_CODES.INVALID_INPUT,
        message: 'Score must be a non-negative number',
      });
    }
    
    if (typeof testData.totalQuestions !== 'number' || testData.totalQuestions < 1) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_CODES.INVALID_INPUT,
        message: 'Total questions must be a positive number',
      });
    }
    
    if (typeof testData.correctAnswers !== 'number' || testData.correctAnswers < 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_CODES.INVALID_INPUT,
        message: 'Correct answers must be a non-negative number',
      });
    }
    
    if (typeof testData.percentage !== 'number' || testData.percentage < 0 || testData.percentage > 100) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_CODES.INVALID_INPUT,
        message: 'Percentage must be between 0 and 100',
      });
    }
    
    // Record activity and check achievements
    const result = await achievementService.recordTestActivity(req.db, userId, testData);
    
    // Get newly unlocked achievements
    const achievements = await achievementService.getUserAchievements(req.db, userId, { unlockedOnly: true });
    const recentlyUnlocked = achievements.filter(a => {
      // Check if unlocked in the last minute
      const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
      return a.unlockedAt && new Date(a.unlockedAt) > oneMinuteAgo;
    });
    
    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: 'Test result recorded successfully',
      data: {
        activityId: result.activityId,
        xpEarned: result.xpEarned,
        newAchievements: recentlyUnlocked,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/activities
 * @desc Get user's activities with pagination
 * @access Private
 */
async function getActivities(req, res, next) {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder === 'asc' ? 1 : -1,
    };
    
    const result = await achievementService.getUserActivities(req.db, userId, options);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/activities/stats
 * @desc Get user's activity statistics
 * @access Private
 */
async function getActivityStats(req, res, next) {
  try {
    const userId = req.user.userId;
    const stats = await achievementService.getUserStats(req.db, userId);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/achievements
 * @desc Get user's achievements
 * @access Private
 */
async function getAchievements(req, res, next) {
  try {
    const userId = req.user.userId;
    const { category = null, unlockedOnly = 'false' } = req.query;
    
    const options = {
      category: category || null,
      unlockedOnly: unlockedOnly === 'true',
    };
    
    const achievements = await achievementService.getUserAchievements(req.db, userId, options);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: {
        achievements,
        summary: {
          total: achievements.length,
          unlocked: achievements.filter(a => a.isUnlocked).length,
          locked: achievements.filter(a => !a.isUnlocked).length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route GET /api/achievements/check
 * @desc Manually trigger achievement check
 * @access Private
 */
async function checkAchievements(req, res, next) {
  try {
    const userId = req.user.userId;
    const newlyUnlocked = await achievementService.checkAndUpdateAchievements(req.db, userId);
    
    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Achievements checked',
      data: {
        newlyUnlocked,
        count: newlyUnlocked.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  recordTestCompletion,
  getActivities,
  getActivityStats,
  getAchievements,
  checkAchievements,
};
