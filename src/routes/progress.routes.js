/**
 * Progress Routes
 */

const { progressController } = require('../controllers');
const { verifyToken } = require('../middleware');

const progressRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // All routes require authentication
  router.use(verifyToken);

  router.get('/', progressController.getUserProgress);
  router.post('/update', progressController.updateProgress);
  router.get('/review', progressController.getDueForReview);
  router.get('/stats', progressController.getUserStats);

  return router;
};

module.exports = progressRoutes;
