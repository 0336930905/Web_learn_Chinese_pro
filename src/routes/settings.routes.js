/**
 * Settings Routes
 */

const { settingsController } = require('../controllers');
const { verifyToken } = require('../middleware');

const settingsRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // All settings routes require authentication
  router.get('/', verifyToken, settingsController.getSettings);
  router.put('/', verifyToken, settingsController.updateSettings);

  return router;
};

module.exports = settingsRoutes;
