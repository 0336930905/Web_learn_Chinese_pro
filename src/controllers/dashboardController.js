/**
 * Dashboard Controller
 * Handles dashboard statistics requests
 */

const { DashboardService } = require('../services');
const { asyncHandler } = require('../middleware');
const { successResponse } = require('../utils/response');

/**
 * Get User Dashboard Stats
 * GET /api/dashboard/stats
 */
const getUserStats = asyncHandler(async (req, res) => {
  const dashboardService = new DashboardService(req.db);
  const stats = await dashboardService.getStats(req.user.userId);

  return successResponse(res, stats, 'Lấy thống kê dashboard thành công');
});

/**
 * Get Admin Dashboard Stats
 * GET /api/dashboard/admin
 */
const getAdminStats = asyncHandler(async (req, res) => {
  const dashboardService = new DashboardService(req.db);
  const stats = await dashboardService.getAdminStats();

  return successResponse(res, stats, 'Lấy thống kê admin thành công');
});

module.exports = {
  getUserStats,
  getAdminStats
};
