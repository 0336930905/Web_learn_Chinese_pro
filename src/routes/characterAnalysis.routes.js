/**
 * Character Analysis Routes
 * Routes for Vietnamese to Chinese character analysis with caching
 */

const characterAnalysisController = require('../controllers/characterAnalysisController');

const characterAnalysisRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  /**
   * POST /analyze
   * Analyze Vietnamese word and get Chinese equivalent
   */
  router.post('/analyze', characterAnalysisController.analyzeWord);

  /**
   * GET /related/:character
   * Get related vocabulary for a Chinese character
   */
  router.get('/related/:character', characterAnalysisController.getRelatedVocabulary);

  /**
   * POST /track-usage
   * Track usage of a character analysis for analytics
   */
  router.post('/track-usage', characterAnalysisController.trackUsage);

  /**
   * POST /diagram
   * Generate diagram data for a Vietnamese word
   */
  router.post('/diagram', characterAnalysisController.getDiagram);

  return router;
};

module.exports = characterAnalysisRoutes;
