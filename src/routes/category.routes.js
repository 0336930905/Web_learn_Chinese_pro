/**
 * Category Routes
 */

const { categoryController } = require('../controllers');
const { verifyToken, validateObjectId } = require('../middleware');

const categoryRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // All category routes require authentication (private categories only)
  router.get('/', verifyToken, categoryController.getAllCategories);
  router.get('/for-games', verifyToken, categoryController.getCategoriesForGames);
  router.get('/:id', verifyToken, validateObjectId('id'), categoryController.getCategoryById);
  router.post('/', verifyToken, categoryController.createCategory);
  router.put('/:id', verifyToken, validateObjectId('id'), categoryController.updateCategory);
  router.delete('/:id', verifyToken, validateObjectId('id'), categoryController.deleteCategory);

  return router;
};

module.exports = categoryRoutes;
