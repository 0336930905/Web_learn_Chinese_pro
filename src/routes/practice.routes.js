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

  // Bookmarks (words flagged for review)
  router.get('/bookmarks', verifyToken, practiceController.getBookmarks);
  router.post('/bookmarks', verifyToken, practiceController.addBookmark);
  router.delete('/bookmarks', verifyToken, practiceController.clearBookmarks);
  router.delete('/bookmarks/:id', verifyToken, practiceController.deleteBookmark);

  // Folders (for organizing custom sets)
  router.get('/folders', verifyToken, practiceController.getFolders);
  router.post('/folders', verifyToken, practiceController.createFolder);
  router.put('/folders/:id', verifyToken, practiceController.updateFolder);
  router.delete('/folders/:id', verifyToken, practiceController.deleteFolder);

  return router;
};

module.exports = practiceRoutes;
