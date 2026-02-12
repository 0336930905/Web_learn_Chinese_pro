/**
 * Progress Controller
 * Handles user progress related requests
 */

const { ProgressService } = require('../services');
const { progressValidators } = require('../validators');
const { asyncHandler } = require('../middleware');
const { successResponse } = require('../utils/response');
const { SUCCESS_MESSAGES, HTTP_STATUS } = require('../constants');

/**
 * Get user progress
 * GET /api/progress
 */
const getUserProgress = asyncHandler(async (req, res) => {
  const progressService = new ProgressService(req.db);
  
  const filters = {
    vocabularyId: req.query.vocabularyId,
    status: req.query.status,
  };

  const progress = await progressService.getUserProgress(req.user.userId, filters);

  return successResponse(res, progress, 'Lấy tiến độ học tập thành công');
});

/**
 * Update progress
 * POST /api/progress/update
 */
const updateProgress = asyncHandler(async (req, res) => {
  // Validate input
  const validation = progressValidators.update().validate(req.body);
  if (!validation.isValid) {
    const error = validation.errors[0];
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      error: {
        message: error.message,
        field: error.field,
      },
    });
  }

  const progressService = new ProgressService(req.db);
  const progress = await progressService.updateProgress(
    req.user.userId,
    validation.data
  );

  return successResponse(res, progress, SUCCESS_MESSAGES.PROGRESS_SAVED);
});

/**
 * Get words due for review
 * GET /api/progress/review
 */
const getDueForReview = asyncHandler(async (req, res) => {
  const progressService = new ProgressService(req.db);
  const limit = parseInt(req.query.limit) || 20;

  const dueWords = await progressService.getDueForReview(req.user.userId, limit);

  return successResponse(res, dueWords, 'Lấy danh sách từ cần ôn tập thành công');
});

/**
 * Get user statistics
 * GET /api/progress/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
  const progressService = new ProgressService(req.db);
  const stats = await progressService.getUserStats(req.user.userId);

  return successResponse(res, stats, 'Lấy thống kê học tập thành công');
});

module.exports = {
  getUserProgress,
  updateProgress,
  getDueForReview,
  getUserStats,
};
