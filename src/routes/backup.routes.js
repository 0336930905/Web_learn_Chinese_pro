/**
 * Backup Routes
 * Routes for database backup and restore operations
 */

const { verifyToken, requireAdmin } = require('../middleware/auth');
const { validateObjectId } = require('../middleware/validation');
const { backupController } = require('../controllers');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Initialize backup routes
 */
const backupRoutes = (router, db) => {
  // Middleware to attach db to request
  router.use((req, res, next) => {
    req.db = db;
    next();
  });

  // All backup routes require authentication and admin role
  const adminAuth = [verifyToken, requireAdmin];

  // Backup Statistics
  router.get('/stats', ...adminAuth, asyncHandler(backupController.getBackupStats));

  // Backup Management
  router.get('/', ...adminAuth, asyncHandler(backupController.getAllBackups));
  router.get('/:id', ...adminAuth, validateObjectId('id'), asyncHandler(backupController.getBackupById));
  router.post('/create', ...adminAuth, asyncHandler(backupController.createBackup));
  router.post('/restore/:id', ...adminAuth, validateObjectId('id'), asyncHandler(backupController.restoreBackup));
  router.delete('/:id', ...adminAuth, validateObjectId('id'), asyncHandler(backupController.deleteBackup));

  // Backup Schedule Configuration
  router.get('/schedule/config', ...adminAuth, asyncHandler(backupController.getScheduleConfig));
  router.put('/schedule/config', ...adminAuth, asyncHandler(backupController.updateScheduleConfig));

  return router;
};

module.exports = backupRoutes;
