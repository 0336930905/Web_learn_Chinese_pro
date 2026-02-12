/**
 * Dashboard Routes
 */

const { dashboardController } = require('../controllers');
const { verifyToken, requireAdmin } = require('../middleware');

const dashboardRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // All routes require authentication
  router.use(verifyToken);

  // User dashboard
  router.get('/stats', dashboardController.getUserStats);

  // Admin dashboard
  router.get('/admin', requireAdmin, dashboardController.getAdminStats);

  return router;
};

module.exports = dashboardRoutes;
