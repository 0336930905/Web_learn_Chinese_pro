/**
 * Game Routes
 */

const { gameController } = require('../controllers');
const { verifyToken, optionalAuth } = require('../middleware');

const gameRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Public routes (can play without login)
  router.get('/listening-quiz', optionalAuth, gameController.getListeningQuiz);
  router.get('/matching', optionalAuth, gameController.getMatchingGame);
  router.get('/fill-in-blanks', optionalAuth, gameController.getFillInTheBlanks);
  router.get('/vocabulary-cards', optionalAuth, gameController.getVocabularyCards);
  router.get('/reverse-quiz', optionalAuth, gameController.getReverseQuiz);

  // Protected routes (require login to save progress)
  router.post('/session', verifyToken, gameController.saveGameSession);
  router.get('/history', verifyToken, gameController.getGameHistory);
  
  // Test Mode routes
  router.get('/test/questions', verifyToken, gameController.getTestQuestions);
  router.post('/test/submit', verifyToken, gameController.submitTestResult);

  return router;
};

module.exports = gameRoutes;
