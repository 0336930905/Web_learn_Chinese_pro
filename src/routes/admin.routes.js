/**
 * Admin Routes
 * Routes for admin operations
 */

const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const { adminController } = require('../controllers');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Initialize admin routes
 */
const adminRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // All admin routes require authentication and admin role
  const adminAuth = [verifyToken, requireAdmin];

  // User Management
  router.get('/users', ...adminAuth, asyncHandler(adminController.getAllUsers));
  router.get('/users/stats', ...adminAuth, asyncHandler(adminController.getUserStats));
  router.get('/users/:id', ...adminAuth, asyncHandler(adminController.getUserById));
  router.post('/users', ...adminAuth, asyncHandler(adminController.createUser));
  router.put('/users/:id', ...adminAuth, asyncHandler(adminController.updateUser));
  router.patch('/users/:id/lock', ...adminAuth, asyncHandler(adminController.lockUser));
  router.patch('/users/:id/unlock', ...adminAuth, asyncHandler(adminController.unlockUser));
  router.delete('/users/:id', ...adminAuth, asyncHandler(adminController.deleteUser));

  // Category Management (Admin can manage ALL categories)
  router.get('/categories', ...adminAuth, asyncHandler(adminController.getAllCategories));
  router.get('/categories/:id', ...adminAuth, validateObjectId('id'), asyncHandler(adminController.getCategoryById));
  router.post('/categories', ...adminAuth, asyncHandler(adminController.createCategory));
  router.put('/categories/:id', ...adminAuth, validateObjectId('id'), asyncHandler(adminController.updateCategory));
  router.delete('/categories/:id', ...adminAuth, validateObjectId('id'), asyncHandler(adminController.deleteCategory));

  // Vocabulary Management (Admin can manage ALL vocabulary)
  router.get('/vocabulary', ...adminAuth, asyncHandler(adminController.getAllVocabulary));
  router.get('/vocabulary/:id', ...adminAuth, validateObjectId('id'), asyncHandler(adminController.getVocabularyById));
  router.post('/vocabulary', ...adminAuth, asyncHandler(adminController.createVocabulary));
  router.put('/vocabulary/:id', ...adminAuth, validateObjectId('id'), asyncHandler(adminController.updateVocabulary));
  router.delete('/vocabulary/:id', ...adminAuth, validateObjectId('id'), asyncHandler(adminController.deleteVocabulary));

  return router;
};

module.exports = adminRoutes;
