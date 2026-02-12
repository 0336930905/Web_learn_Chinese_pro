/**
 * Chatbot Routes
 */

const chatbotController = require('../controllers/chatbotController');
const { verifyToken } = require('../middleware');

const chatbotRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // Health check doesn't require authentication for testing
  router.get('/health', chatbotController.healthCheck);
  
  // Chatbot routes - removed authentication for testing
  router.post('/message', chatbotController.sendMessage);
  router.post('/suggest-vocabulary', chatbotController.suggestVocabulary);
  router.post('/explain-word', chatbotController.explainWord);
  router.get('/learning-tips', chatbotController.getLearningTips);

  return router;
};

module.exports = chatbotRoutes;
