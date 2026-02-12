/**
 * Achievements Routes
 */

const { achievementsController } = require('../controllers');
const { verifyToken } = require('../middleware');

const achievementsRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Get user achievements
  router.get('/', verifyToken, achievementsController.getUserAchievements);

  return router;
};

module.exports = achievementsRoutes;
