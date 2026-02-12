/**
 * Auth Routes
 */

const { authController } = require('../controllers');
const { verifyToken } = require('../middleware');

const authRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });


  // Public routes
  router.post('/register', authController.register);
  router.post('/login', authController.login);
  
  // Password Reset
  router.post('/forgot-password', authController.forgotPassword);
  router.post('/reset-password', authController.resetPassword);

  // Google OAuth2
  router.get('/google', authController.googleAuth);
  router.get('/google/callback', authController.googleCallback);

  // Protected routes
  router.get('/profile', verifyToken, authController.getProfile);
  router.put('/profile', verifyToken, authController.updateProfile);

  return router;
};

module.exports = authRoutes;
