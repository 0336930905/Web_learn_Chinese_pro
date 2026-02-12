/**
 * Vocabulary Routes
 * All routes require authentication
 * Vocabulary ownership is validated through category ownership
 */

const { vocabularyController } = require('../controllers');
const { verifyToken, validateObjectId } = require('../middleware');

const vocabularyRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // All routes require authentication - vocabulary belongs to user's categories only
  router.get('/', verifyToken, vocabularyController.getAllVocabulary);
  router.get('/random', verifyToken, vocabularyController.getRandomVocabulary);
  router.get('/:id', verifyToken, validateObjectId('id'), vocabularyController.getVocabularyById);
  router.post('/', verifyToken, vocabularyController.createVocabulary);
  router.put('/:id', verifyToken, validateObjectId('id'), vocabularyController.updateVocabulary);
  router.delete('/:id', verifyToken, validateObjectId('id'), vocabularyController.deleteVocabulary);

  return router;
};

module.exports = vocabularyRoutes;
