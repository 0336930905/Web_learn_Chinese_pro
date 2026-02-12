/**
 * Activity Routes
 * Routes for recording test activities from game_test.html
 */

const activityController = require('../controllers/activityController');
const { verifyToken } = require('../middleware');

const activityRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Record test completion from game_test.html
  router.post('/test', verifyToken, activityController.recordTestCompletion);

  // Get user's activities with pagination
  router.get('/', verifyToken, activityController.getActivities);

  // Get user's activity statistics
  router.get('/stats', verifyToken, activityController.getActivityStats);

  // Get user's achievements (moved here from achievements routes)
  router.get('/achievements', verifyToken, activityController.getAchievements);

  // Manually trigger achievement check
  router.get('/achievements/check', verifyToken, activityController.checkAchievements);

  return router;
};

module.exports = activityRoutes;
