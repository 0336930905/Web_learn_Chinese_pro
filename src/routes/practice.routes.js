/**
 * Practice Routes
 * Handles practice session creation, retrieval, and custom word sets
 */

const { practiceController } = require('../controllers');
const { verifyToken } = require('../middleware');

const practiceRoutes = (router, db) => {
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Practice sessions
  router.get('/sessions', verifyToken, practiceController.getSessions);
  router.post('/sessions', verifyToken, practiceController.createSession);
  router.get('/sessions/stats', verifyToken, practiceController.getStats);

  // Custom word sets (persisted per user)
  router.get('/custom-sets', verifyToken, practiceController.getCustomSets);
  router.post('/custom-sets', verifyToken, practiceController.createCustomSet);
  router.put('/custom-sets/:id', verifyToken, practiceController.updateCustomSet);
  router.delete('/custom-sets/:id', verifyToken, practiceController.deleteCustomSet);

  return router;
};

module.exports = practiceRoutes;
