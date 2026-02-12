/**
 * Middleware Index
 * Export all middleware
 */

const { errorHandler, notFoundHandler, asyncHandler, AppError } = require('./errorHandler');
const { verifyToken, optionalAuth, requireRole, requireAdmin, requireOwnership } = require('./auth');
const { validateBody, validateQuery, validateParams, validateObjectId, sanitizeInput } = require('./validation');
const { corsMiddleware } = require('./cors');

module.exports = {
  // Error Handling
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,

  // Authentication
  verifyToken,
  optionalAuth,
  requireRole,
  requireAdmin,
  requireOwnership,

  // Validation
  validateBody,
  validateQuery,
  validateParams,
  validateObjectId,
  sanitizeInput,

  // CORS
  corsMiddleware,
};
